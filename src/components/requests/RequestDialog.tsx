import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { X, Plus } from 'lucide-react';

interface RequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  recipientId: string;
  recipientType: 'helper' | 'planner';
  senderType: 'client' | 'planner';
}

export function RequestDialog({
  isOpen,
  onClose,
  recipientId,
  recipientType,
  senderType
}: RequestDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: '',
    startTime: '',
    endTime: '',
    locationCity: '',
    hourlyRate: '',
    message: ''
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const calculateTotalHours = () => {
    if (!formData.startTime || !formData.endTime) return 0;
    
    const start = new Date(`2000-01-01T${formData.startTime}`);
    const end = new Date(`2000-01-01T${formData.endTime}`);
    
    if (end <= start) return 0;
    
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60) * 100) / 100;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const totalHours = calculateTotalHours();

      if (recipientType === 'planner' && senderType === 'client') {
        // Get client data
        const { data: clientData } = await supabase
          .from('clients')
          .select('id')
          .eq('user_id', userData.user.id)
          .single();

        if (!clientData) throw new Error('Client profile not found');

        // Create planner request
        const { error } = await supabase
          .from('planner_requests')
          .insert({
            client_id: clientData.id,
            title: formData.title,
            description: formData.description,
            event_date: formData.eventDate,
            start_time: formData.startTime || null,
            end_time: formData.endTime || null,
            location_city: formData.locationCity,
            budget: formData.hourlyRate ? parseFloat(formData.hourlyRate) : null,
            total_hours: totalHours,
            required_services: skills,
        status: 'pending'
          });

        if (error) throw error;
      } else if (recipientType === 'helper' && senderType === 'planner') {
        // Get planner data
        const { data: plannerData } = await supabase
          .from('planners')
          .select('id')
          .eq('user_id', userData.user.id)
          .single();

        if (!plannerData) throw new Error('Planner profile not found');

        // Create helper request sent directly to specific helper
        const { error } = await supabase
          .from('helper_requests')
          .insert({
            planner_id: plannerData.id,
            helper_id: recipientId, // Direct request to specific helper
            title: formData.title,
            description: formData.description,
            event_date: formData.eventDate,
            start_time: formData.startTime || null,
            end_time: formData.endTime || null,
            location_city: formData.locationCity,
            hourly_rate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : null,
            total_hours: totalHours,
            required_skills: skills,
            status: 'pending' as any // Direct request starts as pending
          });

        if (error) throw error;
      } else if (recipientType === 'helper' && senderType === 'client') {
        // Get client data
        const { data: clientData } = await supabase
          .from('clients')
          .select('id')
          .eq('user_id', userData.user.id)
          .single();

        if (!clientData) throw new Error('Client profile not found');

        // Create helper request with client_id (planner_id as null/undefined)
        const { error } = await supabase
          .from('helper_requests')
          .insert({
            client_id: clientData.id,
            planner_id: null,
            title: formData.title,
            description: formData.description,
            event_date: formData.eventDate,
            start_time: formData.startTime || null,
            end_time: formData.endTime || null,
            location_city: formData.locationCity,
            hourly_rate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : null,
            total_hours: totalHours,
            required_skills: skills,
            status: 'open'
          });

        if (error) throw error;
      } else {
        // Fallback to direct message for unsupported combinations
        const { error } = await supabase
          .from('messages')
          .insert({
            sender_id: userData.user.id,
            recipient_id: recipientId,
            subject: `Request: ${formData.title}`,
            message: `${formData.description}

Event Details:
- Date: ${formData.eventDate}
- Time: ${formData.startTime || 'TBD'} - ${formData.endTime || 'TBD'}
- Location: ${formData.locationCity}
- Hours: ${totalHours} hours
- Hourly Rate: $${formData.hourlyRate}
- Required Skills: ${skills.join(', ')}

${formData.message ? `Additional Message: ${formData.message}` : ''}`
          });

        if (error) throw error;
      }

      toast({
        title: "Request sent! 🎉",
        description: `Your request has been sent to the ${recipientType}.`
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        eventDate: '',
        startTime: '',
        endTime: '',
        locationCity: '',
        hourlyRate: '',
        message: ''
      });
      setSkills([]);
      onClose();
    } catch (error: any) {
      toast({
        title: "Error sending request",
        description: error.message,
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
          <DialogTitle>Send Request to {recipientType === 'helper' ? 'Helper' : 'Planner'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="Birthday Party"
              />
            </div>

            <div>
              <Label htmlFor="eventDate">Event Date *</Label>
              <Input
                id="eventDate"
                type="date"
                value={formData.eventDate}
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              placeholder="Describe your event and what you need help with..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
              <Input
                id="hourlyRate"
                type="number"
                min="0"
                step="0.01"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                placeholder="25.00"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="locationCity">Location (City) *</Label>
            <Input
              id="locationCity"
              value={formData.locationCity}
              onChange={(e) => setFormData({ ...formData, locationCity: e.target.value })}
              required
              placeholder="New York, NY"
            />
          </div>

          <div>
            <Label>Required Skills</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <Button type="button" onClick={addSkill} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm flex items-center gap-1"
                >
                  {skill}
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-destructive"
                    onClick={() => removeSkill(skill)}
                  />
                </span>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="message">Additional Message</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Any additional details or questions..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}