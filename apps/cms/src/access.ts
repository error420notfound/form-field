import { APIError, type PayloadRequest } from 'payload'

type Principal = { collection?: string; role?: string | null } | null | undefined
export const roleOf = (user: Principal) => user?.collection === 'users' ? (user.role || 'owner') : null
export const isOwner = (user: Principal) => roleOf(user) === 'owner'
export const canEdit = (user: Principal) => ['owner', 'editor'].includes(roleOf(user) || '')
export const canOperate = (user: Principal) => ['owner', 'operations'].includes(roleOf(user) || '')
export const staff = ({ req }: { req: PayloadRequest }) => !!roleOf(req.user)
export const owner = ({ req }: { req: PayloadRequest }) => isOwner(req.user)
export const editor = ({ req }: { req: PayloadRequest }) => canEdit(req.user)
export const operator = ({ req }: { req: PayloadRequest }) => canOperate(req.user)
// A non-owner must use Payload's draft operation. Direct updates on published
// documents and explicit publication are rejected even through the REST API.
export function draftOnly({ req, data }: { req: PayloadRequest; data: Record<string, unknown> }) {
  if (req.user && roleOf(req.user) === 'editor' && (String(req.query?.draft) !== 'true' || data?._status === 'published'))
    throw new APIError('Editors can save drafts; an owner must publish.', 403)
  return data
}
