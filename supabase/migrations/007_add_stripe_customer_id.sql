-- Add stripe_customer_id to households table for Stripe payment integration
-- This stores the Stripe customer ID so we can link households to their Stripe records

ALTER TABLE households
ADD COLUMN stripe_customer_id TEXT;

-- Add index for lookups by stripe_customer_id (used in webhook handling)
CREATE INDEX idx_households_stripe_customer_id ON households(stripe_customer_id);

-- Add comment for documentation
COMMENT ON COLUMN households.stripe_customer_id IS 'Stripe customer ID for payment/subscription management';
