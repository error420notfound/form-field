import type { ServerProps } from 'payload'
import { canEdit, canOperate } from '../access'
import CommerceDashboard from './DashboardClient'
export default function Dashboard({ user }: ServerProps) {
  return <div>
    <section className="commerce"><p className="commerce-kicker">FORM + FIELD / WORKSPACE</p><h2>Welcome to your workspace</h2><p>Manage the website and keep track of the business.</p>
      {canEdit(user) && <p><a href="/admin/collections/website-pages">Website pages</a> · <a href="/admin/collections/products">Products</a> · <a href="/admin/collections/media">Media</a></p>}
      {canOperate(user) && <p><a href="/admin/collections/orders">Orders</a> · <a href="/admin/collections/customers">Customers</a> · <a href="/admin/collections/inventory-snapshots">Inventory</a></p>}
    </section>
    {canOperate(user) && <CommerceDashboard />}
  </div>
}
