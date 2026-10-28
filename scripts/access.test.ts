import { test } from 'node:test'
import assert from 'node:assert/strict'
import { canEdit, canOperate, draftOnly, isOwner } from '../apps/cms/src/access'
import type { PayloadRequest } from 'payload'
const user = (role:string) => ({collection:'users',role})
test('staff roles separate editing from commerce', () => {
  assert.equal(canEdit(user('editor')),true); assert.equal(canOperate(user('editor')),false)
  assert.equal(canEdit(user('operations')),false); assert.equal(canOperate(user('operations')),true)
  assert.equal(isOwner(user('owner')),true); assert.equal(canOperate({collection:'customers',role:'owner'}),false)
})
test('editors can save drafts but cannot publish or directly update',()=>{
  const req = (draft?:string) => ({user:user('editor'),query:{draft}} as unknown as PayloadRequest)
  assert.doesNotThrow(()=>draftOnly({req:req('true'),data:{_status:'draft'}}))
  assert.throws(()=>draftOnly({req:req(),data:{_status:'published'}}))
  assert.throws(()=>draftOnly({req:req('true'),data:{_status:'published'}}))
  assert.throws(()=>draftOnly({req:req(),data:{title:'direct update'}}))
})
