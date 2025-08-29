import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, CheckCircle, XCircle, Clock, DollarSign, Calendar, MapPin, Star } from 'lucide-react';

interface PlannerApplication {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  message: string;
  proposed_fee: number;
  applied_at: string;
  planner_id: string;
  planner_request_id: string;
  planners: {
    id: string;
    business_name: string;
    description: string;
    years_experience: number;
    base_price: number;
    location_city: string;
    average_rating: number;
    total_reviews: number;
    services: string[];
    profiles: {
      full_name: string;
      avatar_url: string;
      email: string;
      phone: string;
    } | null;
  } | null;
  planner_requests: {
    title: string;
    event_date: string;
    location_city: string;
    budget: number;
  } | null;
}

interface PlannerApplicationsProps {
  clientData: any;
}

export default function PlannerApplications({ clientData }: PlannerApplicationsProps) {
  const { toast } = useToast();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Planner Applications</CardTitle>
        <CardDescription>Applications will appear here when the new workflow is implemented</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No applications yet</p>
          <p className="text-sm text-muted-foreground">Planner applications will be managed through the new request system</p>
        </div>
      </CardContent>
    </Card>
  );
}