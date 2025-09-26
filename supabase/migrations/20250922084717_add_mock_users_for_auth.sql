-- Location: supabase/migrations/20250922084717_add_mock_users_for_auth.sql
-- Schema Analysis: Complete trading platform schema exists with 23 tables
-- Integration Type: Authentication enhancement with mock users
-- Dependencies: Existing user_profiles table, handle_new_user trigger

-- Add mock authentication users for testing
DO $$
DECLARE
    admin_uuid UUID := gen_random_uuid();
    trader_uuid UUID := gen_random_uuid();
    premium_uuid UUID := gen_random_uuid();
BEGIN
    -- Create mock auth users with all required fields
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES
        (admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'admin@tradingplatform.com', crypt('admin123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Admin User", "role": "admin"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (trader_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'trader@tradingplatform.com', crypt('trader123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Professional Trader", "role": "basic_user"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (premium_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'premium@tradingplatform.com', crypt('premium123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Premium Trader", "role": "premium_user"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null);

    RAISE NOTICE 'Mock users created successfully. Use these credentials:';
    RAISE NOTICE 'Admin: admin@tradingplatform.com / admin123';
    RAISE NOTICE 'Trader: trader@tradingplatform.com / trader123'; 
    RAISE NOTICE 'Premium: premium@tradingplatform.com / premium123';

EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key error: %', SQLERRM;
    WHEN unique_violation THEN
        RAISE NOTICE 'User already exists: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Unexpected error: %', SQLERRM;
END $$;

-- Function to cleanup test users if needed
CREATE OR REPLACE FUNCTION public.cleanup_mock_auth_users()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    mock_user_ids UUID[];
BEGIN
    -- Get mock user IDs
    SELECT ARRAY_AGG(id) INTO mock_user_ids
    FROM auth.users
    WHERE email LIKE '%@tradingplatform.com';

    IF mock_user_ids IS NOT NULL THEN
        -- Delete in dependency order
        DELETE FROM public.user_profiles WHERE id = ANY(mock_user_ids);
        DELETE FROM auth.users WHERE id = ANY(mock_user_ids);
        
        RAISE NOTICE 'Cleaned up % mock users', array_length(mock_user_ids, 1);
    ELSE
        RAISE NOTICE 'No mock users found to cleanup';
    END IF;
END;
$$;