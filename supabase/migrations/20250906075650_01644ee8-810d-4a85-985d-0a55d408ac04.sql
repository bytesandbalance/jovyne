-- Create missing profile record for the current user
INSERT INTO public.profiles (user_id, email, full_name, user_role)
VALUES ('856a2496-e4fa-4815-9d34-13aef8a65099', 'pflashgary@gmail.com', 'Pegah', 'planner')
ON CONFLICT (user_id) DO UPDATE SET
  user_role = 'planner',
  email = 'pflashgary@gmail.com',
  full_name = 'Pegah';