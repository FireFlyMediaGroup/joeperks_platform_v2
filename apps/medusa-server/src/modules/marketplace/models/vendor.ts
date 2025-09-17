import { model } from "@medusajs/framework/utils"
import VendorAdmin from "./vendor-admin"

const Vendor = model.define("vendor", {
  id: model.id().primaryKey(),
  handle: model.text().unique(),
  name: model.text(),
  logo: model.text().nullable(),

  // Lifecycle/status and operational settings
  vendor_status: model.text().nullable(), // invited|registered|intake_in_progress|submitted|under_review|approved|rejected|suspended

  // Payouts and compliance
  stripe_connect_account_id: model.text().nullable(),
  commission_rate_bps: model.number().nullable(),
  payout_schedule: model.text().nullable(),
  tax_forms_status: model.text().nullable(),

  // Operations/inventory/shipping
  default_stock_location_id: model.text().nullable(),
  shipping_profile_id: model.text().nullable(),

  // Arbitrary structured data (e.g., intake drafts)
  metadata: model.json().nullable(),

  admins: model.hasMany(() => VendorAdmin, {
    mappedBy: "vendor",
  }),
})

export default Vendor
