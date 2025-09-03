-- Create missing triggers for the database functions

-- Trigger for handling new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger for creating client profiles when profiles are inserted  
CREATE TRIGGER on_client_profile_created
  AFTER INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.ensure_client_profile();

-- Trigger for planner request approvals (creates events and should create invoices)
CREATE TRIGGER on_planner_request_status_change
  AFTER UPDATE ON public.planner_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_planner_request_approval();

-- Trigger for planner application approvals (creates invoices)
CREATE TRIGGER on_planner_application_status_change
  AFTER UPDATE ON public.planner_applications  
  FOR EACH ROW EXECUTE FUNCTION public.create_planner_invoice_on_approval();

-- Trigger for planner invoice status transitions
CREATE TRIGGER on_planner_invoice_status_change
  BEFORE UPDATE ON public.planner_invoices
  FOR EACH ROW EXECUTE FUNCTION public.enforce_planner_invoice_transitions();

-- Trigger for updating planner ratings when reviews change
CREATE TRIGGER on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_planner_rating();

-- Trigger for updating timestamps
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_planners_updated_at
  BEFORE UPDATE ON public.planners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_planner_requests_updated_at
  BEFORE UPDATE ON public.planner_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_planner_applications_updated_at
  BEFORE UPDATE ON public.planner_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_planner_invoices_updated_at
  BEFORE UPDATE ON public.planner_invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for notifying clients of planner applications
CREATE TRIGGER on_planner_application_created
  AFTER INSERT ON public.planner_applications
  FOR EACH ROW EXECUTE FUNCTION public.notify_client_of_planner_application();

-- Trigger for message notifications
CREATE TRIGGER on_message_created
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_direct_message();

-- Trigger for linking existing planner profiles on user creation
CREATE TRIGGER on_auth_user_created_link_planner
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.link_existing_planner_profile();