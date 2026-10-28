import { loadEnv, defineConfig, MedusaError } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

for (const name of ['DATABASE_URL', 'JWT_SECRET', 'COOKIE_SECRET', 'STORE_CORS', 'ADMIN_CORS', 'AUTH_CORS']) {
  if (!process.env[name]) throw new MedusaError(MedusaError.Types.INVALID_DATA, `Missing ${name}; run npm run setup:commerce from the repository root.`)
}
for (const name of ['STORE_CORS', 'ADMIN_CORS', 'AUTH_CORS']) {
  if (process.env[name]?.includes('*')) throw new MedusaError(MedusaError.Types.INVALID_DATA, `${name} must contain explicit origins.`)
}

module.exports = defineConfig({
  admin: { backendUrl: process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000' },
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    cookieOptions: { sameSite: 'lax', secure: process.env.NODE_ENV === 'production' },
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    }
  }
})
