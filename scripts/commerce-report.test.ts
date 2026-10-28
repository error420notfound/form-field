import { test } from 'node:test'
import assert from 'node:assert/strict'
import { report, type ReportOrder } from '../apps/cms/src/commerce/report'
const order = (id:number, day:string, paid:number, refunded=0): ReportOrder => ({id, reference:`O${id}`, createdAt:day, status:'confirmed', subtotal:paid, customer:{email:'DEMO@example.test'},items:[{name:'Example',quantity:2}],operations:{occurredAt:day,payment:{paid,refunded},fulfilment:'shipped'}})
test('report includes date endpoints and subtracts refunds',()=>{
  const result=report([order(1,'2026-01-01T10:00:00Z',1000,200),order(2,'2026-01-31T10:00:00Z',2000),order(3,'2026-02-01T10:00:00Z',3000)],'2026-01-01','2026-01-31')
  assert.equal(result.count,2); assert.equal(result.net,2800); assert.equal(result.average,1400); assert.equal(result.customers,1); assert.equal(result.repeatCustomers,1); assert.deepEqual(result.products,[['Example',4]])
})
test('empty and orders without payment are not counted as paid',()=>{
  assert.equal(report([], '2026-01-01','2026-01-31').average,0)
  const a=order(1,'2026-01-01T10:00:00Z',0); assert.equal(report([a],'2026-01-01','2026-01-31').paidCount,0)
})
