import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, MapPin, DollarSign, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ClientRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  recipientId: string;
  recipientType: 'planner' | 'helper';
  recipientName: string;
  clientData: any;
}

export default function ClientRequestDialog({
  isOpen,
  onClose,
  recipientId,
  recipientType,
  recipientName,
  clientData
}: ClientRequestDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    start_time: '',
    end_time: '',
    location_city: '',
    budget: '',
    hourly_rate: '',
    required_services: [] as string[],
    required_skills: [] as string[],
    message: ''
  });

  const [newSkill, setNewSkill] = useState('');
  const [newService, setNewService] = useState('');

  const calculateTotalHours = (startTime: string, endTime: string): number => {
    if (!startTime || !endTime) return 0;
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    if (end < start) end.setDate(end.getDate() + 1);
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  };

  const addSkill = () => {
    if (newSkill && !formData.required_skills.includes(newSkill)) {
      setFormData(prev => ({
        ...prev,
        required_skills: [...prev.required_skills, newSkill]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      required_skills: prev.required_skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addService = () => {
    if (newService && !formData.required_services.includes(newService)) {
      setFormData(prev => ({
        ...prev,
        required_services: [...prev.required_services, newService]
      }));
      setNewService('');
    }
  };

  const removeService = (serviceToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      required_services: prev.required_services.filter(service => service !== serviceToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const totalHours = calculateTotalHours(formData.start_time, formData.end_time);

      if (recipientType === 'planner') {
        // Create planner request
        const { error } = await supabase
          .from('planner_requests')
          .insert({
            client_id: clientData.id,
            title: formData.title,
            description: formData.description,
            event_date: formData.event_date,
            start_time: formData.start_time,
            end_time: formData.end_time,
            location_city: formData.location_city,
            budget: formData.budget ? parseFloat(formData.budget) : null,
            total_hours: totalHours,
            required_services: formData.required_services,
        status: 'pending'
          });

        if (error) throw error;

        // Send direct message to planner
        const { data: plannerProfile } = await supabase
          .from('planners')
          .select('user_id')
          .eq('id', recipientId)
          .single();

        if (plannerProfile) {
          await supabase
            .from('messages')
            .insert({
              sender_id: clientData.user_id,
              recipient_id: plannerProfile.user_id,
              subject: 'New Event Planning Request',
              message: `Hi ${recipientName}, I would like to request your services for "${formData.title}" on ${new Date(formData.event_date).toLocaleDateString()}. ${formData.message || 'Please check your requests dashboard for details.'}`
            });
        }

      } else {
        // Helper requests are no longer supported
        throw new Error('Helper requests are not supported');
      }

      toast({
        title: "Request sent!",
        description: `Your request has been sent to ${recipientName}`
      });

      // Reset form and close dialog
      setFormData({
        title: '',
        description: '',
        event_date: '',
        start_time: '',
        end_time: '',
        location_city: '',
        budget: '',
        hourly_rate: '',
        required_services: [],
        required_skills: [],
        message: ''
      });
      onClose();

    } catch (error) {
      console.error('Error sending request:', error);
      toast({
        title: "Error",
        description: "Failed to send request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Send Request to {recipientName}
          </DialogTitle>
          <DialogDescription>
            Send a {recipientType} request with your event details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                placeholder="e.g., Wedding Reception"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location_city">Location</Label>
              <Input
                id="location_city"
                placeholder="City name"
                value={formData.location_city}
                onChange={(e) => setFormData(prev => ({ ...prev, location_city: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Event Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your event and what you need help with..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="event_date">Event Date</Label>
              <Input
                id="event_date"
                type="date"
                value={formData.event_date}
                onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time</Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_time">End Time</Label>
              <Input
                id="end_time"
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                required
              />
            </div>
          </div>

          {formData.start_time && formData.end_time && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Total hours: {calculateTotalHours(formData.start_time, formData.end_time).toFixed(1)}</span>
            </div>
          )}

          {recipientType === 'planner' ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="budget">Budget (€)</Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="e.g., 5000"
                  value={formData.budget}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Required Services</Label>
                <div className="flex gap-2">
                  <Select value={newService} onValueChange={setNewService}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Event Planning">Event Planning</SelectItem>
                      <SelectItem value="Venue Coordination">Venue Coordination</SelectItem>
                      <SelectItem value="Vendor Management">Vendor Management</SelectItem>
                      <SelectItem value="Timeline Management">Timeline Management</SelectItem>
                      <SelectItem value="Guest Coordination">Guest Coordination</SelectItem>
                      <SelectItem value="Decoration Setup">Decoration Setup</SelectItem>
                      <SelectItem value="Catering Coordination">Catering Coordination</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="button" onClick={addService} disabled={!newService}>
                    Add
                  </Button>
                </div>
                {formData.required_services.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.required_services.map((service) => (
                      <Badge key={service} variant="secondary" className="flex items-center gap-1">
                        {service}
                        <X 
                          className="w-3 h-3 cursor-pointer hover:text-destructive" 
                          onClick={() => removeService(service)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="hourly_rate">Hourly Rate (€)</Label>
                <Input
                  id="hourly_rate"
                  type="number"
                  placeholder="e.g., 25"
                  value={formData.hourly_rate}
                  onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Required Skills</Label>
                <div className="flex gap-2">
                  <Select value={newSkill} onValueChange={setNewSkill}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select a skill" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Event Setup">Event Setup</SelectItem>
                      <SelectItem value="Catering Service">Catering Service</SelectItem>
                      <SelectItem value="Guest Management">Guest Management</SelectItem>
                      <SelectItem value="Technical Support">Technical Support</SelectItem>
                      <SelectItem value="Decoration">Decoration</SelectItem>
                      <SelectItem value="Photography">Photography</SelectItem>
                      <SelectItem value="Music/DJ">Music/DJ</SelectItem>
                      <SelectItem value="Bartending">Bartending</SelectItem>
                      <SelectItem value="Security">Security</SelectItem>
                      <SelectItem value="Cleanup">Cleanup</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="button" onClick={addSkill} disabled={!newSkill}>
                    Add
                  </Button>
                </div>
                {formData.required_skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.required_skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                        {skill}
                        <X 
                          className="w-3 h-3 cursor-pointer hover:text-destructive" 
                          onClick={() => removeSkill(skill)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="message">Additional Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Any additional details or special requests..."
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}