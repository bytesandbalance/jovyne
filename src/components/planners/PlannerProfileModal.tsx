import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Star, MapPin, Clock, DollarSign, Mail, MessageSquare, Building, Globe, Instagram, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { RequestDialog } from '@/components/requests/RequestDialog';

interface PlannerProfileModalProps {
  planner: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId?: string;
  userRole?: string;
  currentUserIsVerified?: boolean;
}

export function PlannerProfileModal({ 
  planner, 
  open, 
  onOpenChange, 
  currentUserId,
  userRole,
  currentUserIsVerified 
}: PlannerProfileModalProps) {
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: ''
  });
  const [sending, setSending] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);

  // Debug logging for verification status
  useEffect(() => {
    console.log('Planner verification debug:', {
      plannerName: planner.business_name,
      isVerified: planner.is_verified,
      isVerifiedType: typeof planner.is_verified,
      userRole,
      currentUserIsVerified
    });
  }, [planner.is_verified, planner.business_name, userRole, currentUserIsVerified]);

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
          recipient_id: planner.user_id,
          subject: contactForm.subject,
          message: contactForm.message
        });

      if (error) throw error;

      toast({
        title: "Message sent! 📬",
        description: "Your message has been sent to the planner"
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
          <DialogTitle>Planner Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-start gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={planner.avatar_url} />
              <AvatarFallback className="text-lg">
                {planner.full_name ? getInitials(planner.full_name) : planner.business_name?.charAt(0) || 'P'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h3 className="text-2xl font-bold">{planner.business_name}</h3>
              <p className="text-lg text-muted-foreground">{planner.full_name}</p>
              
              {planner.total_reviews > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{planner.average_rating || 0}</span>
                    <span className="text-muted-foreground">({planner.total_reviews || 0} reviews)</span>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-1 mt-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{planner.years_experience || 0} years experience</span>
              </div>

              <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                <DollarSign className="w-4 h-4" />
                <span>Starting from ${planner.base_price || 0}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Description Section */}
          {planner.description && (
            <div>
              <h4 className="font-semibold mb-2">About</h4>
              <p className="text-muted-foreground">{planner.description}</p>
            </div>
          )}

          {/* Services Section */}
          {planner.services && planner.services.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Services</h4>
              <div className="flex flex-wrap gap-2">
                {planner.services.map((service: string, index: number) => (
                  <Badge key={index} variant="secondary">{service}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Specialties Section */}
          {planner.specialties && planner.specialties.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Specialties</h4>
              <div className="flex flex-wrap gap-2">
                {planner.specialties.map((specialty: string, index: number) => (
                  <Badge key={index} variant="outline">{specialty}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Location Section */}
          {(planner.location_city || planner.location_state) && (
            <div>
              <h4 className="font-semibold mb-2">Location</h4>
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>
                  {[planner.location_city, planner.location_state].filter(Boolean).join(', ')}
                </span>
              </div>
            </div>
          )}

          {/* Contact Info */}
          <div className="flex flex-wrap gap-4">
            {planner.website_url && (
              <a 
                href={planner.website_url.startsWith('http') ? planner.website_url : `https://${planner.website_url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary hover:underline"
              >
                <Globe className="w-4 h-4" />
                Website
              </a>
            )}
            {planner.instagram_handle && (
              <a 
                href={`https://instagram.com/${planner.instagram_handle.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary hover:underline"
              >
                <Instagram className="w-4 h-4" />
                @{planner.instagram_handle.replace('@', '')}
              </a>
            )}
          </div>

          {/* Portfolio Images */}
          {planner.portfolio_images && planner.portfolio_images.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Portfolio</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {planner.portfolio_images.map((image: string, index: number) => (
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
              <div className={userRole === 'client' ? "grid grid-cols-2 gap-2" : "flex"}>
                {/* Show contact button for verified planners or clients to verified planners */}
                {(userRole === 'client' && planner.is_verified === true) || 
                 (userRole === 'planner' && planner.is_verified === true && currentUserIsVerified) ? (
                  <Button 
                    onClick={() => setShowContactForm(true)}
                    variant="outline"
                    size="lg"
                    className={userRole === 'client' ? "" : "w-full"}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Contact Planner
                  </Button>
                ) : (
                  <Button 
                    disabled
                    variant="outline"
                    size="lg"
                    className={userRole === 'client' ? "" : "w-full"}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Verification Required
                  </Button>
                )}
                
                {userRole === 'client' && planner.is_verified === true && (
                  <Button 
                    onClick={() => setShowRequestDialog(true)}
                    size="lg"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Send Request
                  </Button>
                )}
                
                {userRole === 'client' && planner.is_verified !== true && (
                  <Button 
                    disabled
                    size="lg"
                    variant="outline"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Verification Required
                  </Button>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="p-4 space-y-4">
                  <h4 className="font-semibold">Send a Message</h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="e.g., Interested in your wedding planning services"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell the planner about your event and what you need..."
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
      
      <RequestDialog
        isOpen={showRequestDialog}
        onClose={() => setShowRequestDialog(false)}
        recipientId={planner.user_id}
        recipientType="planner"
        senderType="client"
      />
    </Dialog>
  );
}