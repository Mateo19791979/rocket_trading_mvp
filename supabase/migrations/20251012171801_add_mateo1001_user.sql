-- Location: supabase/migrations/20251012171801_add_mateo1001_user.sql
-- Schema Analysis: Add specific Mateo1001 user to existing authentication system
-- Integration Type: Addition - adding specific user to existing auth setup
-- Dependencies: auth.users (built-in), existing user_profiles table

-- Add Mateo1001 user with specific credentials
DO $$
DECLARE
    mateo_uuid UUID := gen_random_uuid();
BEGIN
    -- Create complete auth user with required fields
    -- **ALWAYS include all fields for auth.users** All of them even the null. Without it the user will not be able to signin.
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES
        (mateo_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'mateo@tradingmvp.com', crypt('lamaisonbleu', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Mateo", "username": "Mateo1001", "role": "basic_user"}'::jsonb, 
         '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null)
    ON CONFLICT (email) DO NOTHING;

EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key error: %', SQLERRM;
    WHEN unique_violation THEN
        RAISE NOTICE 'User already exists: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating Mateo1001 user: %', SQLERRM;
END $$;