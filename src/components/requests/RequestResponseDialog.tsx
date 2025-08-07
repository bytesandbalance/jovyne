import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Euro, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface CommunicationRequest {
  id: string;
  title: string;
  description: string;
  event_date: string;
  start_time?: string;
  end_time?: string;
  location_city: string;
  required_skills: string[];
  total_hours?: number;
  hourly_rate?: number;
  message?: string;
  status: string;
  sender_type: string;
  recipient_type: string;
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

interface RequestResponseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  request: CommunicationRequest | null;
  onRequestUpdate: () => void;
}

export function RequestResponseDialog({
  isOpen,
  onClose,
  request,
  onRequestUpdate
}: RequestResponseDialogProps) {
  const [responseMessage, setResponseMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!request) return null;

  const handleResponse = async (status: 'accepted' | 'declined') => {
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('communication_requests')
        .update({
          status,
          response_message: responseMessage || null,
          responded_at: new Date().toISOString()
        })
        .eq('id', request.id);

      if (error) throw error;

      toast({
        title: `Request ${status}`,
        description: `You have ${status} the request from ${request.profiles?.full_name}.`
      });

      onRequestUpdate();
      onClose();
      setResponseMessage('');
    } catch (error) {
      console.error('Error responding to request:', error);
      toast({
        title: "Error responding to request",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Request from {request.profiles?.full_name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">{request.title}</h3>
            <p className="text-muted-foreground mb-3">{request.description}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(request.event_date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{request.location_city}</span>
              </div>
              {request.start_time && request.end_time && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{request.start_time} - {request.end_time}</span>
                </div>
              )}
              {request.hourly_rate && (
                <div className="flex items-center gap-2">
                  <Euro className="h-4 w-4" />
                  <span>€{request.hourly_rate}/hour</span>
                </div>
              )}
            </div>

            {request.required_skills.length > 0 && (
              <div className="mb-3">
                <Label className="text-sm font-medium">Required Skills:</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {request.required_skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {request.total_hours && (
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4" />
                <span>Total Hours: {request.total_hours}</span>
              </div>
            )}

            {request.message && (
              <div className="border-l-2 border-primary pl-3">
                <Label className="text-sm font-medium">Additional Message:</Label>
                <p className="text-sm text-muted-foreground mt-1">{request.message}</p>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="response">Your Response (Optional)</Label>
            <Textarea
              id="response"
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
              placeholder="Send a reply or ask questions..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleResponse('declined')}
              disabled={isSubmitting}
            >
              Decline
            </Button>
            <Button
              onClick={() => handleResponse('accepted')}
              disabled={isSubmitting}
            >
              Accept
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}