import 'dotenv/config'
import { getPayload } from 'payload'
import type { WebsitePage } from '../payload-types'
process.env.COMMERCE_SCHEMA_MANAGED = '1'
const {default:config} = await import('../payload.config')
const payload = await getPayload({config})
const pages: { title:string; slug:WebsitePage['slug']; sections:WebsitePage['sections'] }[] = [
  {title:'Homepage',slug:'home',sections:[
    {kind:'catalogue'},
    {kind:'brand-note',heading:'Objects shaped by familiar desires',copy:'A small irritation. A familiar gesture. A possibility that feels overdue. These are places to begin.',linkText:'About form+field',linkUrl:'/about'},
  ]},
  {title:'About',slug:'about',sections:[
    {kind:'intro',heading:'Familiar desires. Made tangible',copy:'form+field is an evolving collection of physical and electronic objects.'},
    {kind:'editorial',label:'A place to begin',heading:'Notice the ordinary.',copy:'A small irritation resolved. An interaction made more natural. A capability that feels overdue. An object begins with something already familiar.\n\nThe collection brings together lighting, desk objects and tools. Their relationship comes from the care of the decisions behind them.'},
    {kind:'editorial',label:'The collection today',heading:'Room to understand.',copy:'This local storefront explores how each object can be presented through its story. Product concepts, imagery and unconfirmed details are labelled for review.',linkText:'Explore the objects',linkUrl:'/shop'},
  ]},
  {title:'Support',slug:'support',sections:[
    {kind:'intro',heading:'A little guidance',copy:'Practical information, as the collection takes shape.'},
    {kind:'editorial',heading:'Here to help.',copy:'This is a local review storefront. Product guides and policies will appear here when confirmed.'},
    {kind:'contact'},
    {kind:'faq',heading:'Product guides',copy:'Setup, care and compatibility information have not yet been supplied. Available product details appear in each object’s story.'},
    {kind:'faq',heading:'Delivery',copy:'Shipping regions, charges and fulfilment times are not confirmed. No delivery service is offered through this demonstration.'},
    {kind:'faq',heading:'Returns',copy:'Returns terms are not yet supplied. This local demonstration cannot accept purchases or returns.'},
    {kind:'faq',heading:'About demo checkout',copy:'Your bag is saved in this browser. Local demo checkout saves delivery details and creates an order without collecting payment.'},
  ]},
  {title:'Navigation and footer',slug:'navigation',sections:[
    {kind:'link',linkText:'Objects',linkUrl:'/shop'}, {kind:'link',linkText:'About',linkUrl:'/about'}, {kind:'link',linkText:'Support',linkUrl:'/support'},
  ]},
]
try {
  for (const page of pages) {
    const existing=await payload.find({collection:'website-pages',where:{slug:{equals:page.slug}},limit:1,draft:true,overrideAccess:true})
    if (!existing.docs.length) await payload.create({collection:'website-pages',draft:true,data:{...page,_status:'draft'},overrideAccess:true})
  }
  console.log('Website starter drafts created where missing. Existing content was not changed or published.')
} finally {await payload.destroy()}
