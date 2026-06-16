-- Add discount_pct to customers table
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS discount_pct SMALLINT NOT NULL DEFAULT 0
    CHECK (discount_pct IN (0, 5, 10));

-- Add discount columns to orders table
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS discount_pct  SMALLINT       NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_mur  NUMERIC(10,2)  NOT NULL DEFAULT 0;
