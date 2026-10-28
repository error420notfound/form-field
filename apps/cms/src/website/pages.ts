import type { CollectionConfig, Where } from 'payload'
import { canEdit, draftOnly, editor, owner } from '../access'
const internalLink = (value: unknown) => !value || (typeof value === 'string' && /^\/(?!\/)[^\s\\]*$/.test(value)) || 'Use a site-relative link beginning with /.'
export const websitePages: CollectionConfig = {
  slug: 'website-pages',
  admin: { group: 'Website', useAsTitle: 'title', defaultColumns: ['title','slug','_status','updatedAt'], description: 'Use approved sections to compose website pages. The storefront keeps its existing content until a page is published.', preview: (doc) => { const routes: Record<string,string> = { home: '/', about: '/about', support: '/support', navigation: '/' }; const path = routes[String(doc.slug)]; return path ? `${process.env.STOREFRONT_ORIGIN || 'http://localhost:4321'}${path}?preview=1` : null } },
  versions: { drafts: true },
  access: { create: editor, update: editor, delete: owner, readVersions: editor, read: ({req}) => canEdit(req.user) ? true : { _status: { equals: 'published' } } as Where },
  hooks: { beforeChange: [draftOnly] },
  fields: [
    { name:'title', type:'text', required:true },
    { name:'slug', type:'select', required:true, unique:true, options:[{label:'Homepage',value:'home'},{label:'About',value:'about'},{label:'Support',value:'support'},{label:'Navigation and footer',value:'navigation'}], admin:{description:'Each page type can have one record.'} },
    { name:'sections', type:'array', required:true, minRows:1, admin:{description:'Drag sections to change their order. Navigation uses Link sections; the homepage may include the Catalogue section.'}, fields:[
      {name:'kind', type:'select', required:true, options:[{label:'Intro',value:'intro'},{label:'Editorial',value:'editorial'},{label:'Catalogue',value:'catalogue'},{label:'Brand note',value:'brand-note'},{label:'Support details (existing)',value:'support-details'},{label:'Support question',value:'faq'},{label:'Contact email',value:'contact'},{label:'Navigation link',value:'link'}]},
      {name:'label',type:'text'}, {name:'heading',type:'text'}, {name:'copy',type:'textarea'},
      {name:'linkText',type:'text'}, {name:'linkUrl',type:'text',validate:internalLink},
      {name:'media',type:'upload',relationTo:'media'},
    ] },
  ],
}
