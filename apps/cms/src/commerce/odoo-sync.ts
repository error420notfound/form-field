import type { Payload } from 'payload'
import { linkedOdooProduct } from '../odoo-product'
import { odooCall } from '../customer-service'
import type { Ops } from './report'

// Read-only Odoo synchronization; never creates orders, reserves stock, or writes to Odoo.
export async function refreshOdoo(payload: Payload) {
  if (!process.env.ODOO_URL || !process.env.ODOO_DATABASE || !process.env.ODOO_API_KEY) throw new Error('Odoo is not configured.')
  let updated=0, failed=0
  for (let page=1, pages=1; page<=pages; page++) {
    const products=await payload.find({collection:'products',limit:100,page,depth:0,overrideAccess:true})
    pages=products.totalPages
    for(const product of products.docs) try {
      const value=await linkedOdooProduct(product.id)
      if(!value) continue
      const found=await payload.find({collection:'inventory-snapshots',where:{and:[{source:{equals:'odoo'}},{productId:{equals:product.id}}]},limit:1,overrideAccess:true})
      const data={name:product.name,productId:product.id,source:'odoo' as const,quantity:value.quantity,price:value.price,observedAt:new Date().toISOString(),syncError:null}
      if(found.docs[0]) await payload.update({collection:'inventory-snapshots',id:found.docs[0].id,data,overrideAccess:true}); else await payload.create({collection:'inventory-snapshots',data,overrideAccess:true})
      updated++
    } catch {
      failed++
      const found=await payload.find({collection:'inventory-snapshots',where:{and:[{source:{equals:'odoo'}},{productId:{equals:product.id}}]},limit:1,overrideAccess:true})
      if(found.docs[0]) await payload.update({collection:'inventory-snapshots',id:found.docs[0].id,data:{syncError:'Refresh failed'},overrideAccess:true})
    }
  }
  for (let page=1,pages=1;page<=pages;page++) {
    const orders=await payload.find({collection:'orders',where:{and:[{odooOrderId:{exists:true}},{demoSeed:{exists:false}}]},limit:100,page,depth:0,overrideAccess:true})
    pages=orders.totalPages
    for(const order of orders.docs) try {
      const [sale]=await odooCall('sale.order','read',{ids:[order.odooOrderId],fields:['state','picking_ids']})
      if(!sale) throw new Error('Order not available')
      const pickings=sale.picking_ids?.length ? await odooCall('stock.picking','read',{ids:sale.picking_ids,fields:['state']}) : []
      const fulfilment=sale.state==='cancel'?'cancelled':pickings.length && pickings.every((p:{state:string})=>p.state==='done')?'delivered':pickings.some((p:{state:string})=>p.state==='assigned')?'ready':'processing'
      const previous=(order.operations || {}) as Ops
      await payload.update({collection:'orders',id:order.id,data:{operations:{...previous,fulfilment,odooSync:{observedAt:new Date().toISOString(),error:null},events:previous.fulfilment===fulfilment?previous.events || []:[...(previous.events || []),{at:new Date().toISOString(),description:`Odoo fulfilment observed: ${fulfilment}`}] }},overrideAccess:true})
      updated++
    } catch { failed++; const previous=(order.operations || {}) as Ops; await payload.update({collection:'orders',id:order.id,data:{operations:{...previous,odooSync:{...previous.odooSync,error:'Refresh failed'}}},overrideAccess:true}) }
  }
  return {updated,failed}
}
