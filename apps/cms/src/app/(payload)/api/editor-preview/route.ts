import config from '@payload-config'
import { getPayload } from 'payload'
import { canEdit } from '../../../../access'
export async function GET(request: Request) {
  const payload = await getPayload({config})
  const {user} = await payload.auth({headers:request.headers})
  const headers = {'Cache-Control':'private, no-store', 'X-Robots-Tag':'noindex, nofollow'}
  if (!canEdit(user)) return Response.json({error:'Editor sign-in required.'},{status:403,headers})
  const url=new URL(request.url), type=url.searchParams.get('type'), slug=url.searchParams.get('slug')
  if (!slug || slug.length>200 || !['page','product'].includes(type || '')) return Response.json({error:'Invalid preview.'},{status:400,headers})
  const collection=type==='page'?'website-pages':'products'
  const result=await payload.find({collection,where:{slug:{equals:slug}},draft:true,depth:1,limit:1,overrideAccess:true})
  return Response.json({doc:result.docs[0] || null},{headers})
}
