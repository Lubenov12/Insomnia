/*
  # Enhanced User Profile Migration

  1. Enhanced User Fields
    - Add city, postal_code, country for complete address
    - Add preferred_size and gender for clothing preferences
    - Add marketing preferences
    - Add terms acceptance tracking

  2. Data Migration
    - Update existing users with default values
    - Ensure data integrity
*/

-- Add new columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS city text DEFAULT '',
ADD COLUMN IF NOT EXISTS postal_code text DEFAULT '',
ADD COLUMN IF NOT EXISTS country text DEFAULT 'Bulgaria',
ADD COLUMN IF NOT EXISTS preferred_size text CHECK (preferred_size IN ('XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL')),
ADD COLUMN IF NOT EXISTS gender text CHECK (gender IN ('male', 'female', 'unisex', 'other')),
ADD COLUMN IF NOT EXISTS marketing_emails boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS sms_notifications boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS terms_accepted_at timestamptz,
ADD COLUMN IF NOT EXISTS privacy_accepted_at timestamptz;

-- Add constraints for new fields
ALTER TABLE users 
ADD CONSTRAINT IF NOT EXISTS users_city_length 
CHECK (length(city) <= 100),
ADD CONSTRAINT IF NOT EXISTS users_postal_code_length 
CHECK (length(postal_code) <= 10),
ADD CONSTRAINT IF NOT EXISTS users_country_length 
CHECK (length(country) <= 100),
ADD CONSTRAINT IF NOT EXISTS users_city_format 
CHECK (city = '' OR city ~ '^[a-zA-ZÀ-ÿ\s\-''\.]+$'),
ADD CONSTRAINT IF NOT EXISTS users_postal_code_format 
CHECK (postal_code = '' OR postal_code ~ '^[0-9A-Z\s\-]+$'),
ADD CONSTRAINT IF NOT EXISTS users_country_format 
CHECK (country = '' OR country ~ '^[a-zA-ZÀ-ÿ\s\-''\.]+$');

-- Update existing users with default values
UPDATE users 
SET 
  city = COALESCE(city, ''),
  postal_code = COALESCE(postal_code, ''),
  country = COALESCE(country, 'Bulgaria'),
  marketing_emails = COALESCE(marketing_emails, false),
  sms_notifications = COALESCE(sms_notifications, false)
WHERE city IS NULL OR postal_code IS NULL OR country IS NULL;

-- Create indexes for new fields
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_city 
ON users(city) WHERE city != '';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_country 
ON users(country) WHERE country != '';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_preferred_size 
ON users(preferred_size) WHERE preferred_size IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_gender 
ON users(gender) WHERE gender IS NOT NULL;

-- Add function to validate complete address
CREATE OR REPLACE FUNCTION validate_complete_address()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- If any address field is provided, all should be provided
  IF (NEW.address != '' OR NEW.city != '' OR NEW.postal_code != '' OR NEW.country != '') THEN
    IF (NEW.address = '' OR NEW.city = '' OR NEW.postal_code = '' OR NEW.country = '') THEN
      RAISE EXCEPTION 'Complete address information is required (address, city, postal_code, country)';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for address validation
DROP TRIGGER IF EXISTS validate_complete_address_trigger ON users;
CREATE TRIGGER validate_complete_address_trigger
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION validate_complete_address();

-- Add function to track terms acceptance
CREATE OR REPLACE FUNCTION update_terms_acceptance()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Set acceptance timestamps when terms are accepted
  IF NEW.terms_accepted_at IS NULL AND OLD.terms_accepted_at IS NULL THEN
    NEW.terms_accepted_at = now();
  END IF;
  
  IF NEW.privacy_accepted_at IS NULL AND OLD.privacy_accepted_at IS NULL THEN
    NEW.privacy_accepted_at = now();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for terms acceptance
DROP TRIGGER IF EXISTS update_terms_acceptance_trigger ON users;
CREATE TRIGGER update_terms_acceptance_trigger
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_terms_acceptance();

-- Update RLS policies to include new fields
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Add function to get user preferences for product recommendations
CREATE OR REPLACE FUNCTION get_user_preferences(user_uuid uuid)
RETURNS TABLE(
  preferred_size text,
  gender text,
  marketing_emails boolean,
  sms_notifications boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.preferred_size,
    u.gender,
    u.marketing_emails,
    u.sms_notifications
  FROM users u
  WHERE u.id = user_uuid;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_preferences(uuid) TO authenticated;

-- Add function to update marketing preferences
CREATE OR REPLACE FUNCTION update_marketing_preferences(
  user_uuid uuid,
  marketing_emails boolean,
  sms_notifications boolean
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE users 
  SET 
    marketing_emails = update_marketing_preferences.marketing_emails,
    sms_notifications = update_marketing_preferences.sms_notifications
  WHERE id = user_uuid;
  
  RETURN FOUND;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_marketing_preferences(uuid, boolean, boolean) TO authenticated; 