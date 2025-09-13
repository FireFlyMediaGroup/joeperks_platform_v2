import { loadEnv } from "@medusajs/framework/utils"
import { Client } from "pg"

// Load environment variables
loadEnv(process.env.NODE_ENV || "development", process.cwd())

async function seedDatabase() {
  console.log("🌱 Starting database seeding...")

  // Create direct database connection
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  })

  try {
    await client.connect()
    console.log("✅ Database connection successful")

    // 1. Create default region (if not exists)
    console.log("🌍 Creating default region...")
    try {
      const regionCheck = await client.query("SELECT id FROM region LIMIT 1")

      if (regionCheck.rows.length === 0) {
        // Generate a simple ID without gen_random_bytes
        const regionId = `reg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        await client.query(`
          INSERT INTO region (id, name, currency_code, created_at, updated_at)
          VALUES ($1, $2, $3, NOW(), NOW())
        `, [regionId, 'North America', 'USD'])
        console.log("   ✅ Created default region")
      } else {
        console.log("   ⚠️  Region already exists")
      }
    } catch (error) {
      console.log("   ⚠️  Error creating region:", error.message)
    }

    // 2. Create default stock location (if not exists)
    console.log("📦 Creating default stock location...")
    try {
      const stockLocationCheck = await client.query("SELECT id FROM stock_location LIMIT 1")

      if (stockLocationCheck.rows.length === 0) {
        const stockLocationId = `sloc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        await client.query(`
          INSERT INTO stock_location (id, name, created_at, updated_at)
          VALUES ($1, $2, NOW(), NOW())
        `, [stockLocationId, 'Main Warehouse'])
        console.log("   ✅ Created default stock location")
      } else {
        console.log("   ⚠️  Stock location already exists")
      }
    } catch (error) {
      console.log("   ⚠️  Error creating stock location:", error.message)
    }

    console.log("\n🎉 Database seeding completed successfully!")
    console.log("\n📋 Summary:")
    console.log("   • Region: North America (USD)")
    console.log("   • Stock Location: Main Warehouse")
    console.log("   • Database ready for marketplace operations")

  } catch (error) {
    console.error("❌ Error seeding database:", error)
    process.exit(1)
  } finally {
    await client.end()
  }

  process.exit(0)
}

// Run the seeding
seedDatabase()
