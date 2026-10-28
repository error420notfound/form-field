import type { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, Modules, MedusaError } from '@medusajs/framework/utils'
import {
  createApiKeysWorkflow, createRegionsWorkflow, createSalesChannelsWorkflow,
  createStockLocationsWorkflow, createStoresWorkflow, updateStoresWorkflow,
  linkSalesChannelsToApiKeyWorkflow, linkSalesChannelsToStockLocationWorkflow,
} from '@medusajs/medusa/core-flows'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

/** Explicit infrastructure setup, without sample merchandise or commercial policies. */
export default async function setupStore({ container }: ExecArgs) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const sales = container.resolve(Modules.SALES_CHANNEL)
  const regions = container.resolve(Modules.REGION)
  const stores = container.resolve(Modules.STORE)
  const locations = container.resolve(Modules.STOCK_LOCATION)
  const keys = container.resolve(Modules.API_KEY)

  let [channel] = await sales.listSalesChannels({ name: 'form+field Storefront' })
  if (!channel) {
    const { result } = await createSalesChannelsWorkflow(container).run({ input: { salesChannelsData: [{ name: 'form+field Storefront' }] } })
    channel = result[0]
  }
  let [region] = await regions.listRegions({ name: 'India' }, { relations: ['countries'] })
  if (!region) {
    const { result } = await createRegionsWorkflow(container).run({ input: { regions: [{ name: 'India', currency_code: 'inr', countries: ['in'], payment_providers: [] }] } })
    region = result[0]
  }
  if (region.currency_code !== 'inr') throw new MedusaError(MedusaError.Types.INVALID_DATA, 'Existing India region is not INR. Resolve this in Medusa Admin before continuing.')

  const [store] = await stores.listStores({}, { relations: ['supported_currencies'] })
  if (!store) {
    await createStoresWorkflow(container).run({ input: { stores: [{ name: 'form+field', supported_currencies: [{ currency_code: 'inr', is_default: true }], default_sales_channel_id: channel.id, default_region_id: region.id }] } })
  } else if (store.name !== 'form+field' || store.default_sales_channel_id !== channel.id || store.default_region_id !== region.id || !store.supported_currencies?.some(currency => currency.currency_code === 'inr' && currency.is_default)) {
    const additionalCurrencies = (store.supported_currencies || []).filter(currency => currency.currency_code !== 'inr').map(currency => ({ currency_code: currency.currency_code, is_default: false }))
    await updateStoresWorkflow(container).run({ input: { selector: { id: store.id }, update: { name: 'form+field', supported_currencies: [{ currency_code: 'inr', is_default: true }, ...additionalCurrencies], default_sales_channel_id: channel.id, default_region_id: region.id } } })
  }

  let [location] = await locations.listStockLocations({ name: 'form+field Development' })
  if (!location) {
    const { result } = await createStockLocationsWorkflow(container).run({ input: { locations: [{ name: 'form+field Development', address: { country_code: 'IN', address_1: '' } }] } })
    location = result[0]
  }
  const { data: channels } = await query.graph({ entity: 'sales_channel', fields: ['id', 'stock_locations.id'], filters: { id: channel.id } })
  if (!channels[0]?.stock_locations?.some(item => item?.id === location.id)) {
    await linkSalesChannelsToStockLocationWorkflow(container).run({ input: { id: location.id, add: [channel.id] } })
  }

  let [key] = await keys.listApiKeys({ title: 'form+field Astro', type: 'publishable' })
  if (!key) {
    const { result } = await createApiKeysWorkflow(container).run({ input: { api_keys: [{ title: 'form+field Astro', type: 'publishable', created_by: '' }] } })
    key = result[0]
  }
  const { data: linkedKeys } = await query.graph({ entity: 'api_key', fields: ['id', 'sales_channels.id'], filters: { id: key.id } })
  if (!linkedKeys[0]?.sales_channels?.some(item => item?.id === channel.id)) {
    await linkSalesChannelsToApiKeyWorkflow(container).run({ input: { id: key.id, add: [channel.id] } })
  }
  const directory = path.resolve(process.cwd(), '../../.local')
  mkdirSync(directory, { recursive: true })
  writeFileSync(path.join(directory, 'commerce-public.json'), JSON.stringify({ backendUrl: process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000', publishableKey: key.token, regionId: region.id, channelId: channel.id, locationId: location.id }, null, 2), { mode: 0o600 })
  logger.info('India/INR, storefront channel, public key and development location ready. Public configuration saved to .local/commerce-public.json; run npm run configure:commerce at the root.')
}
