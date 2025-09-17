import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET!,
      cookieSecret: process.env.COOKIE_SECRET!,
    },
  },
  // Enable Admin dashboard by default in development; allow disabling via ADMIN_DISABLED
  admin: {
    disable: process.env.ADMIN_DISABLED === "true",
  },
  modules: [
    {
      resolve: "./src/modules/marketplace",
    },
  ],
  plugins: [
    // Custom marketplace functionality will be implemented using native Medusa v2 features
    // Following official recipe: https://docs.medusajs.com/resources/recipes/marketplace/examples/vendors
  ],
})
