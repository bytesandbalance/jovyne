-- Fix security definer functions by setting search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.update_planner_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.planners 
  SET 
    average_rating = (
      SELECT ROUND(AVG(rating::numeric), 1) 
      FROM public.reviews 
      WHERE planner_id = COALESCE(NEW.planner_id, OLD.planner_id)
    ),
    total_reviews = (
      SELECT COUNT(*) 
      FROM public.reviews 
      WHERE planner_id = COALESCE(NEW.planner_id, OLD.planner_id)
    )
  WHERE id = COALESCE(NEW.planner_id, OLD.planner_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, user_role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'user_role')::public.user_role, 'client')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';