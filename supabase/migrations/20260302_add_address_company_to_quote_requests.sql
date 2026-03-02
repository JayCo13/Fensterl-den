-- Add company and address columns to quote_requests
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS company text;
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS address text;
