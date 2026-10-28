import 'dotenv/config'
import { getPayload } from 'payload'
const tag = 'commerce-dashboard-v1'
if (process.env.NODE_ENV === 'production' || !/^file:(?:\.\/|\/)/.test(process.env.DATABASE_URL || 'file:./data/store.db')) throw new Error('Demo data requires a local SQLite database outside production.')
const command = process.argv[2]
if (!['seed','clean'].includes(command || '')) throw new Error('Use seed or clean.')
process.env.COMMERCE_SCHEMA_MANAGED = '1'
const { default: config } = await import('../payload.config')
const payload = await getPayload({config})
try {
  if(command === 'clean') {
    for (const collection of ['orders','inventory-snapshots'] as const) await payload.delete({collection,where:{demoSeed:{equals:tag}},overrideAccess:true})
    console.log('Removed only commerce dashboard demo records.')
  } else {
    const products=[{name:'Demo Arc tray',price:180000,quantity:3},{name:'Demo Fold bookend',price:240000,quantity:12},{name:'Demo Still vessel',price:320000,quantity:0}]
    for(const product of products) {
      const found=await payload.find({collection:'inventory-snapshots',where:{and:[{demoSeed:{equals:tag}},{name:{equals:product.name}}]},limit:1,overrideAccess:true})
      if(!found.docs.length) await payload.create({collection:'inventory-snapshots',data:{...product,source:'demo',demoSeed:tag,observedAt:new Date().toISOString()},overrideAccess:true})
    }
    const stages=['new','processing','ready','shipped','delivered','returned']
    for(let i=0;i<24;i++) {
      const reference=`FF-DASHBOARD-DEMO-${String(i+1).padStart(3,'0')}`
      const found=await payload.find({collection:'orders',where:{reference:{equals:reference}},limit:1,overrideAccess:true})
      if(found.docs.length) continue
      const product=products[i%products.length], quantity=i%3+1, subtotal=product.price*quantity, occurredAt=new Date(Date.now()-i*3*86400000).toISOString(), fulfilment=stages[i%stages.length]
      await payload.create({collection:'orders',data:{reference,demoSeed:tag,status:'confirmed',customer:{name:`Demo customer ${i%8+1}`,email:`customer${i%8+1}@example.test`,city:'Demo city',country:'IN'},items:[{name:product.name,quantity,unitPrice:product.price}],subtotal,paymentMethod:'demo',paymentStatus:'simulated-success',operations:{occurredAt,payment:{paid:subtotal,refunded:fulfilment==='returned'?subtotal:0},fulfilment,shipment:fulfilment==='shipped'?{carrier:'Demo carrier',tracking:'DEMO-TRACKING'}:null,events:[{at:occurredAt,description:'Fictional order created and payment simulated.'}]}},overrideAccess:true})
    }
    console.log('Commerce dashboard demo records are ready. No Odoo or payments were contacted.')
  }
} finally { await payload.destroy() }
