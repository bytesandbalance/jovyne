import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Star, MapPin, Clock, DollarSign, Mail, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface HelperProfileModalProps {
  helper: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId?: string;
}

export function HelperProfileModal({ 
  helper, 
  open, 
  onOpenChange, 
  currentUserId 
}: HelperProfileModalProps) {
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: ''
  });
  const [sending, setSending] = useState(false);

  const handleSendMessage = async () => {
    if (!contactForm.subject.trim() || !contactForm.message.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in both subject and message",
        variant: "destructive"
      });
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: currentUserId,
          recipient_id: helper.user_id,
          subject: contactForm.subject,
          message: contactForm.message
        });

      if (error) throw error;

      toast({
        title: "Message sent! 📬",
        description: "Your message has been sent to the helper"
      });

      setContactForm({ subject: '', message: '' });
      setShowContactForm(false);
    } catch (error: any) {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Helper Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-start gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={helper.profiles?.avatar_url} />
              <AvatarFallback className="text-lg">
                {helper.profiles?.full_name ? getInitials(helper.profiles.full_name) : 'H'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h3 className="text-2xl font-bold">{helper.profiles?.full_name || 'Helper'}</h3>
              
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{helper.average_rating || 0}</span>
                  <span className="text-muted-foreground">({helper.total_jobs || 0} jobs)</span>
                </div>
              </div>
              
              <div className="flex items-center gap-1 mt-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{helper.experience_years || 0} years experience</span>
              </div>

              <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                <DollarSign className="w-4 h-4" />
                <span>${helper.hourly_rate || 0}/hour</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Bio Section */}
          {helper.bio && (
            <div>
              <h4 className="font-semibold mb-2">About</h4>
              <p className="text-muted-foreground">{helper.bio}</p>
            </div>
          )}

          {/* Skills Section */}
          {helper.skills && helper.skills.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {helper.skills.map((skill: string, index: number) => (
                  <Badge key={index} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Location Section */}
          {helper.availability_cities && helper.availability_cities.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Service Areas</h4>
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{helper.availability_cities.join(', ')}</span>
              </div>
            </div>
          )}

          {/* Portfolio Images */}
          {helper.portfolio_images && helper.portfolio_images.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Portfolio</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {helper.portfolio_images.map((image: string, index: number) => (
                  <img 
                    key={index}
                    src={image} 
                    alt={`Portfolio ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Contact Section */}
          <div className="space-y-4">
            {!showContactForm ? (
              <Button 
                onClick={() => setShowContactForm(true)}
                className="w-full"
                size="lg"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Contact Helper
              </Button>
            ) : (
              <Card>
                <CardContent className="p-4 space-y-4">
                  <h4 className="font-semibold">Send a Message</h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="e.g., Interested in your catering services"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell the helper about your event and what you need..."
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSendMessage}
                      disabled={sending}
                      className="flex-1"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      {sending ? 'Sending...' : 'Send Message'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowContactForm(false)}
                      disabled={sending}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}