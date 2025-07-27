/*
  # Simplify User Profile Migration

  1. Remove unnecessary fields
    - Remove address, city, postal_code, country fields
    - Remove preferred_size, gender fields
    - Remove sms_notifications field
    - Keep only essential fields: name, email, phone_number, marketing_emails

  2. Make email and phone_number optional
    - Users can register with either email or phone
    - Both fields can be null but at least one must be provided

  3. Update constraints and indexes
    - Remove constraints for removed fields
    - Update indexes for remaining fields
*/

-- Remove unnecessary columns from users table
ALTER TABLE users 
DROP COLUMN IF EXISTS address,
DROP COLUMN IF EXISTS city,
DROP COLUMN IF EXISTS postal_code,
DROP COLUMN IF EXISTS country,
DROP COLUMN IF EXISTS preferred_size,
DROP COLUMN IF EXISTS gender,
DROP COLUMN IF EXISTS sms_notifications;

-- Remove constraints for removed fields
ALTER TABLE users 
DROP CONSTRAINT IF EXISTS users_city_length,
DROP CONSTRAINT IF EXISTS users_postal_code_length,
DROP CONSTRAINT IF EXISTS users_country_length,
DROP CONSTRAINT IF EXISTS users_city_format,
DROP CONSTRAINT IF EXISTS users_postal_code_format,
DROP CONSTRAINT IF EXISTS users_country_format;

-- Remove indexes for removed fields
DROP INDEX IF EXISTS idx_users_city;
DROP INDEX IF EXISTS idx_users_country;
DROP INDEX IF EXISTS idx_users_preferred_size;
DROP INDEX IF EXISTS idx_users_gender;

-- Update email and phone_number to be optional
ALTER TABLE users 
ALTER COLUMN email DROP NOT NULL,
ALTER COLUMN phone_number DROP NOT NULL;

-- Add constraint to ensure at least one contact method is provided
ALTER TABLE users 
ADD CONSTRAINT users_contact_required 
CHECK (email IS NOT NULL OR phone_number IS NOT NULL);

-- Add unique constraints for email and phone_number (when not null)
ALTER TABLE users 
ADD CONSTRAINT users_email_unique 
UNIQUE (email) WHERE email IS NOT NULL;

ALTER TABLE users 
ADD CONSTRAINT users_phone_unique 
UNIQUE (phone_number) WHERE phone_number IS NOT NULL;

-- Create indexes for remaining fields
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email 
ON users(email) WHERE email IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_phone 
ON users(phone_number) WHERE phone_number IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_marketing 
ON users(marketing_emails) WHERE marketing_emails = true;

-- Remove functions that are no longer needed
DROP FUNCTION IF EXISTS validate_complete_address();
DROP FUNCTION IF EXISTS get_user_preferences(uuid);
DROP FUNCTION IF EXISTS update_marketing_preferences(uuid, boolean, boolean);

-- Remove triggers for removed functions
DROP TRIGGER IF EXISTS validate_complete_address_trigger ON users;

-- Create simplified function to get user contact info
CREATE OR REPLACE FUNCTION get_user_contact_info(user_uuid uuid)
RETURNS TABLE(
  name text,
  email text,
  phone_number text,
  marketing_emails boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.name,
    u.email,
    u.phone_number,
    u.marketing_emails
  FROM users u
  WHERE u.id = user_uuid;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_contact_info(uuid) TO authenticated;

-- Create function to update marketing preferences
CREATE OR REPLACE FUNCTION update_marketing_preferences(user_uuid uuid, marketing_emails boolean)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE users 
  SET marketing_emails = update_marketing_preferences.marketing_emails
  WHERE id = user_uuid;
  
  RETURN FOUND;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_marketing_preferences(uuid, boolean) TO authenticated;

-- Update RLS policies to reflect simplified schema
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