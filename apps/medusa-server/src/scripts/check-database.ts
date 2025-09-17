import { loadEnv } from "@medusajs/framework/utils"
import { Client } from "pg"

// Load environment variables
loadEnv(process.env.NODE_ENV || "development", process.cwd())

async function checkDatabase() {
  console.log("🔍 Checking database status...")

  // Create direct database connection
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  })

  try {
    await client.connect()
    console.log("✅ Database connection successful")

    // Check core tables
    console.log("\n📊 Checking core tables...")
    
    const coreTables = [
      "store",
      "region", 
      "currency",
      "sales_channel",
      "stock_location",
      "product",
      "product_variant",
      "customer",
      "cart",
      "order",
      "payment",
      "fulfillment",
      "user",
      "api_key",
      "inventory_item",
      "price_list",
      "promotion",
      "tax_rate",
    ]

    const tableStatus: { table: string; exists: boolean; records: number }[] = []

    for (const table of coreTables) {
      try {
        const result = await client.query(`
          SELECT COUNT(*) as count
          FROM information_schema.tables
          WHERE table_name = $1 AND table_schema = 'public'
        `, [table])

        const exists = parseInt(result.rows[0]?.count) > 0

        if (exists) {
          const countResult = await client.query(`SELECT COUNT(*) as count FROM "${table}"`)
          const recordCount = parseInt(countResult.rows[0]?.count) || 0
          tableStatus.push({ table, exists: true, records: recordCount })
          console.log(`   ✅ ${table.padEnd(20)} - ${recordCount} records`)
        } else {
          tableStatus.push({ table, exists: false, records: 0 })
          console.log(`   ❌ ${table.padEnd(20)} - Table missing`)
        }
      } catch (error) {
        tableStatus.push({ table, exists: false, records: 0 })
        console.log(`   ❌ ${table.padEnd(20)} - Error checking table`)
      }
    }

    // Check migration status
    console.log("\n🔄 Checking migration status...")
    try {
      const migrationResult = await client.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_name LIKE '%migration%' OR table_name LIKE '%mikro_orm%'
      `)

      if (migrationResult.rows.length > 0) {
        console.log("   ✅ Migration tables found:")
        migrationResult.rows.forEach((row: any) => {
          console.log(`      • ${row.table_name}`)
        })
      } else {
        console.log("   ⚠️  No migration tables found")
      }
    } catch (error) {
      console.log("   ❌ Error checking migration tables")
    }

    // Check indexes
    console.log("\n📇 Checking key indexes...")
    try {
      const indexResult = await client.query(`
        SELECT
          schemaname,
          tablename,
          indexname,
          indexdef
        FROM pg_indexes
        WHERE schemaname = 'public'
        AND tablename IN ('product', 'order', 'customer', 'cart')
        ORDER BY tablename, indexname
      `)

      if (indexResult.rows.length > 0) {
        console.log("   ✅ Key indexes found:")
        let currentTable = ""
        indexResult.rows.forEach((row: any) => {
          if (row.tablename !== currentTable) {
            currentTable = row.tablename
            console.log(`      ${currentTable}:`)
          }
          console.log(`        • ${row.indexname}`)
        })
      } else {
        console.log("   ⚠️  No indexes found for key tables")
      }
    } catch (error) {
      console.log("   ❌ Error checking indexes")
    }

    // Summary
    console.log("\n📋 Database Summary:")
    const existingTables = tableStatus.filter(t => t.exists).length
    const totalRecords = tableStatus.reduce((sum, t) => sum + t.records, 0)
    
    console.log(`   • Tables: ${existingTables}/${coreTables.length} exist`)
    console.log(`   • Total Records: ${totalRecords}`)
    console.log(`   • Database: ${existingTables === coreTables.length ? "✅ Ready" : "⚠️  Incomplete"}`)

    // Check if seeding is needed
    const needsSeeding = tableStatus.some(t => 
      t.exists && ["store", "region", "currency", "sales_channel"].includes(t.table) && t.records === 0
    )

    if (needsSeeding) {
      console.log("\n💡 Recommendation: Run database seeding to create baseline data")
      console.log("   Command: pnpm exec ts-node src/scripts/seed-database.ts")
    } else {
      console.log("\n✅ Database appears to be properly initialized")
    }

  } catch (error) {
    console.error("❌ Error checking database:", error)
    process.exit(1)
  } finally {
    await client.end()
  }

  process.exit(0)
}

// Run the check
checkDatabase()
