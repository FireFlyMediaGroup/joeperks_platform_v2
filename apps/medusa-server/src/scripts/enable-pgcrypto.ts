import { loadEnv } from "@medusajs/framework/utils"
import { Client } from "pg"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

async function enablePgcrypto() {
  console.log("Enabling pgcrypto extension (if not already enabled)...")

  const client = new Client({ connectionString: process.env.DATABASE_URL })

  try {
    await client.connect()
    await client.query("CREATE EXTENSION IF NOT EXISTS pgcrypto;")
    console.log("✅ pgcrypto extension is enabled.")
    process.exit(0)
  } catch (e: any) {
    console.error("❌ Failed to enable pgcrypto:", e?.message || e)
    process.exit(1)
  } finally {
    await client.end()
  }
}

enablePgcrypto()

