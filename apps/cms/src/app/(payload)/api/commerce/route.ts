import config from '@payload-config'
import { getPayload, type Where } from 'payload'
import { report, type Ops } from '../../../../commerce/report'
import { refreshOdoo } from '../../../../commerce/odoo-sync'
import { canOperate } from '../../../../access'

const DEMO = 'commerce-dashboard-v1'
const noStore = { 'Cache-Control': 'no-store' }
async function auth(request: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })
  return { payload, allowed: canOperate(user) }
}
function sameOrigin(request: Request) {
  const origin = request.headers.get('origin')
  if (!origin) return false
  try { return origin === new URL(process.env.CMS_URL || 'http://localhost:3000').origin && new URL(origin).host === request.headers.get('host') } catch { return false }
}
const validDate = (s:string | null): s is string => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s)) && new Date(s).toISOString().slice(0,10) === s
export async function GET(request: Request) {
  const { payload, allowed } = await auth(request)
  if (!allowed) return Response.json({ error:'Unauthorized' }, { status:401, headers:noStore })
  const url = new URL(request.url), source = url.searchParams.get('source'), from = url.searchParams.get('from'), to = url.searchParams.get('to')
  if (!['demo','live'].includes(source || '') || !validDate(from) || !validDate(to) || from > to) return Response.json({error:'Invalid date range or source.'},{status:400,headers:noStore})
  const where: Where = source === 'demo' ? { demoSeed: { equals: DEMO } } : { and: [{ demoSeed: { exists: false } }, { or: [{ paymentMethod: { exists: false } }, { paymentMethod: { not_equals: 'demo' } }] }] }
  try {
    const all = []
    let page = 1, pages = 1
    do { const result = await payload.find({collection:'orders',where,limit:100,page,depth:0,overrideAccess:true}); all.push(...result.docs); pages=result.totalPages; page++ } while (page <= pages)
    const inventory = await payload.find({collection:'inventory-snapshots',where:{source:{equals:source === 'demo' ? 'demo':'odoo'}},limit:100,sort:'quantity',depth:0,overrideAccess:true})
    const attention = all.filter(o=> { const ops = o.operations as Ops | null; return !['delivered','cancelled','returned'].includes(ops?.fulfilment || '') && (o.status !== 'confirmed' || !ops?.fulfilment || !['delivered','cancelled','returned'].includes(ops.fulfilment)) }).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).slice(0,10)
    const last = inventory.docs.map(i=>i.observedAt).sort().at(-1)
    const integration = source === 'demo' ? 'Fictional inventory snapshots; no Odoo connection is used.' : last ? `Last inventory observation: ${new Date(last).toLocaleString('en-IN')}. Snapshots may be stale; refresh before acting.` : 'No Odoo inventory snapshot available. Configure Odoo and refresh.'
    let odooURL: string | null = null
    try { const parsed = new URL(process.env.ODOO_URL || ''); if (['http:', 'https:'].includes(parsed.protocol)) odooURL = parsed.origin } catch {}
    return Response.json({odooURL,summary:report(all,from,to),orders:attention.map(o=>({id:o.id,reference:o.reference,status:o.status,paymentStatus:o.paymentStatus,operations:o.operations})),inventory:inventory.docs.filter(i=>i.quantity <= 5 || i.syncError).slice(0,15),integration},{headers:noStore})
  } catch (error) { console.error('Commerce dashboard failed', error); return Response.json({error:'Commerce data is unavailable.'},{status:500,headers:noStore}) }
}
export async function POST(request: Request) {
  const {payload,allowed}=await auth(request)
  if(!allowed) return Response.json({error:'Unauthorized'},{status:401,headers:noStore})
  if(!sameOrigin(request)) return Response.json({error:'Invalid origin.'},{status:403,headers:noStore})
  let body: {action?:string;id?:number}; try {body=await request.json()} catch {return Response.json({error:'Invalid request.'},{status:400})}
  if(body.action==='advance') {
    if(process.env.NODE_ENV !== 'development' || !Number.isSafeInteger(body.id)) return Response.json({error:'Simulation is available only locally.'},{status:403})
    const order=await payload.findByID({collection:'orders',id:body.id!,overrideAccess:true,disableErrors:true})
    if(!order || order.demoSeed!==DEMO) return Response.json({error:'Demo order not found.'},{status:404})
    const ops=(order.operations || {}) as Ops, stages=['new','processing','ready','shipped','delivered'], next=stages[Math.min(stages.indexOf(ops.fulfilment || 'new')+1,stages.length-1)]
    await payload.update({collection:'orders',id:order.id,data:{operations:{...ops,fulfilment:next,events:[...(ops.events || []),{at:new Date().toISOString(),description:`Simulated fulfilment changed to ${next}`}]}},overrideAccess:true})
    return Response.json({ok:true},{headers:noStore})
  }
  if(body.action==='refresh') {
    if(process.env.NODE_ENV !== 'development') return Response.json({error:'Odoo refresh is currently limited to local development.'},{status:403})
    try {
      const { updated, failed } = await refreshOdoo(payload)
      if(failed) return Response.json({error:`Refresh incomplete: ${updated} updated; ${failed} unavailable. Existing snapshots may be stale.`},{status:503,headers:noStore})
      return Response.json({ok:true,updated},{headers:noStore})
    } catch { return Response.json({error:'Odoo is unavailable or not configured. Existing snapshots may be stale.'},{status:503,headers:noStore}) }
  }
  return Response.json({error:'Unknown action.'},{status:400})
}
