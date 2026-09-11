-- ==============================================================================
-- NGK2 MIGRATION 003: ADD STRUCTURED ADDRESS COMPONENTS TO USERS TABLE
-- ==============================================================================

-- 1. Add address_components JSONB column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS address_components JSONB DEFAULT '{}'::jsonb;

-- 2. Add GIN Index for rapid JSONB querying & filtering (e.g. by city, suburb, or postal code)
CREATE INDEX IF NOT EXISTS idx_users_address_components 
ON public.users USING gin(address_components);

-- 3. Comment explaining structure
COMMENT ON COLUMN public.users.address_components IS 'Structured address components: { streetNo, streetName, suburb, city, state, code }';
