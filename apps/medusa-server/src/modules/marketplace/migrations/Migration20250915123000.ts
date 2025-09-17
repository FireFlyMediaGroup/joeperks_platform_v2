import { Migration } from '@mikro-orm/migrations';

export class Migration20250915123000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`alter table if exists "vendor" add column if not exists "vendor_status" text null;`);
    this.addSql(`alter table if exists "vendor" add column if not exists "stripe_connect_account_id" text null;`);
    this.addSql(`alter table if exists "vendor" add column if not exists "commission_rate_bps" int null;`);
    this.addSql(`alter table if exists "vendor" add column if not exists "payout_schedule" text null;`);
    this.addSql(`alter table if exists "vendor" add column if not exists "tax_forms_status" text null;`);
    this.addSql(`alter table if exists "vendor" add column if not exists "default_stock_location_id" text null;`);
    this.addSql(`alter table if exists "vendor" add column if not exists "shipping_profile_id" text null;`);
    this.addSql(`alter table if exists "vendor" add column if not exists "metadata" jsonb null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "vendor" drop column if exists "vendor_status";`);
    this.addSql(`alter table if exists "vendor" drop column if exists "stripe_connect_account_id";`);
    this.addSql(`alter table if exists "vendor" drop column if exists "commission_rate_bps";`);
    this.addSql(`alter table if exists "vendor" drop column if exists "payout_schedule";`);
    this.addSql(`alter table if exists "vendor" drop column if exists "tax_forms_status";`);
    this.addSql(`alter table if exists "vendor" drop column if exists "default_stock_location_id";`);
    this.addSql(`alter table if exists "vendor" drop column if exists "shipping_profile_id";`);
    this.addSql(`alter table if exists "vendor" drop column if exists "metadata";`);
  }
}

