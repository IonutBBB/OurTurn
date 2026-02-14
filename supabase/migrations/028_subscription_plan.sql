-- Add subscription_plan column to track monthly vs annual billing
ALTER TABLE households
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT NULL;

COMMENT ON COLUMN households.subscription_plan IS 'monthly or annual — NULL for free tier';
