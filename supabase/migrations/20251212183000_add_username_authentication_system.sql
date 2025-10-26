-- Location: supabase/migrations/20251212183000_add_username_authentication_system.sql
-- Schema Analysis: Enhance existing authentication system with username support
-- Integration Type: Extension - adding username functionality to existing auth
-- Dependencies: auth.users (built-in), existing user_profiles table

-- 1. Add username support to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN username TEXT UNIQUE;

-- 2. Create index for username lookups
CREATE INDEX idx_user_profiles_username ON public.user_profiles(username);

-- 3. Update handle_new_user function to include username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, username, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'basic_user'::public.user_role)
  );
  RETURN NEW;
END;
$$;

-- 4. Function to check username availability
CREATE OR REPLACE FUNCTION public.is_username_available(username_param TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT NOT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.username = username_param
)
$$;

-- 5. Function to update user profile with username validation
CREATE OR REPLACE FUNCTION public.update_user_profile_with_username(
    user_id_param UUID,
    full_name_param TEXT DEFAULT NULL,
    username_param TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result_record public.user_profiles;
BEGIN
    -- Check if user exists and can update their own profile
    IF user_id_param != auth.uid() THEN
        RETURN json_build_object('success', false, 'error', 'Unauthorized');
    END IF;
    
    -- Check username availability if provided
    IF username_param IS NOT NULL THEN
        IF NOT public.is_username_available(username_param) THEN
            -- Check if it's the user's current username
            IF NOT EXISTS (
                SELECT 1 FROM public.user_profiles up 
                WHERE up.id = user_id_param AND up.username = username_param
            ) THEN
                RETURN json_build_object('success', false, 'error', 'Username already taken');
            END IF;
        END IF;
    END IF;
    
    -- Update the profile
    UPDATE public.user_profiles
    SET 
        full_name = COALESCE(full_name_param, full_name),
        username = COALESCE(username_param, username),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = user_id_param
    RETURNING * INTO result_record;
    
    IF result_record IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Profile not found');
    END IF;
    
    RETURN json_build_object(
        'success', true, 
        'data', row_to_json(result_record)
    );
    
EXCEPTION
    WHEN unique_violation THEN
        RETURN json_build_object('success', false, 'error', 'Username already exists');
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', 'Failed to update profile');
END;
$$;

-- 6. Add mock data with usernames for testing
DO $$
DECLARE
    admin_uuid UUID := gen_random_uuid();
    user_uuid UUID := gen_random_uuid();
BEGIN
    -- Create complete auth users with username metadata
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
         'admin@tradingmvp.com', crypt('admin123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Admin User", "username": "AdminUser", "role": "admin"}'::jsonb, 
         '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (user_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'user@tradingmvp.com', crypt('user123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Demo User", "username": "DemoUser", "role": "basic_user"}'::jsonb, 
         '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null)
    ON CONFLICT (email) DO NOTHING;

EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key error: %', SQLERRM;
    WHEN unique_violation THEN
        RAISE NOTICE 'User already exists: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating mock users: %', SQLERRM;
END $$;