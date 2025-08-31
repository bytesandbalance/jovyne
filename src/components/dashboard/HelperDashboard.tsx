import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, DollarSign, MapPin, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import HelperInvoices from '@/components/helpers/HelperInvoices';
import HelperRequestsNew from './HelperRequestsNew';

interface HelperDashboardProps {
  user: any;
  helperData: any;
}

export default function HelperDashboard({ user, helperData }: HelperDashboardProps) {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'profile';
  const [helperProfile, setHelperProfile] = useState<any>(helperData);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    bio: helperData?.bio || '',
    hourly_rate: helperData?.hourly_rate ? String(helperData.hourly_rate) : '',
    experience_years: helperData?.experience_years ? String(helperData.experience_years) : '',
    skills: (helperData?.skills || []).join(', '),
    cities: (helperData?.availability_cities || []).join(', '),
    portfolio: (helperData?.portfolio_images || []).join(', '),
  });

  useEffect(() => {
    if (helperData) {
      setHelperProfile(helperData);
      setEditForm({
        bio: helperData.bio || '',
        hourly_rate: helperData.hourly_rate ? String(helperData.hourly_rate) : '',
        experience_years: helperData.experience_years ? String(helperData.experience_years) : '',
        skills: (helperData.skills || []).join(', '),
        cities: (helperData.availability_cities || []).join(', '),
        portfolio: (helperData.portfolio_images || []).join(', '),
      });
    }
  }, [helperData]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!helperData?.user_id) return;
      const { data } = await supabase
        .from('profiles')
        .select('full_name, email, phone, avatar_url')
        .eq('user_id', helperData.user_id)
        .maybeSingle();
      setUserProfile(data || null);
    };
    loadProfile();
  }, [helperData?.user_id]);

  const handleSaveProfile = async () => {
    try {
      const payload: any = {
        bio: editForm.bio || null,
        hourly_rate: editForm.hourly_rate ? parseFloat(editForm.hourly_rate) : null,
        experience_years: editForm.experience_years ? parseInt(editForm.experience_years) : null,
        skills: editForm.skills ? editForm.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
        availability_cities: editForm.cities ? editForm.cities.split(',').map(s => s.trim()).filter(Boolean) : [],
        portfolio_images: editForm.portfolio ? editForm.portfolio.split(',').map(s => s.trim()).filter(Boolean) : [],
      };

      const { error } = await supabase
        .from('helpers')
        .update(payload)
        .eq('id', helperData.id);

      if (error) throw error;

      setHelperProfile((prev: any) => ({ ...prev, ...payload }));
      toast({
        title: 'Profile updated',
        description: 'Your helper profile has been saved.',
      });
      setEditOpen(false);
    } catch (e: any) {
      console.error('Error updating helper profile:', e);
      toast({
        title: 'Update failed',
        description: e.message || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue={defaultTab} className="space-y-6">
        <TabsList className="flex flex-wrap justify-center gap-1 w-full max-w-md mx-auto p-1 h-auto sm:grid sm:grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="invoicing">Invoicing</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          <HelperRequestsNew helperId={helperData.id} />
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={userProfile?.avatar_url || ''} alt={userProfile?.full_name || 'Helper avatar'} />
                  <AvatarFallback>{(userProfile?.full_name || 'H').split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {userProfile?.full_name || 'Helper'}
                    <Badge variant="secondary">Helper</Badge>
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {userProfile?.email}{userProfile?.phone ? ` • ${userProfile.phone}` : ''}
                  </CardDescription>
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      <span>{helperProfile?.average_rating?.toFixed ? helperProfile.average_rating.toFixed(1) : (helperProfile?.average_rating || 0)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{helperProfile?.experience_years || 0} years</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      <span>€{helperProfile?.hourly_rate || 0}/hr</span>
                    </div>
                    {helperProfile?.availability_cities?.length ? (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{helperProfile.availability_cities.join(', ')}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
              <Button onClick={() => setEditOpen(true)}>Edit Profile</Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {helperProfile?.bio ? (
                <section>
                  <h4 className="font-semibold mb-2">About</h4>
                  <p className="text-muted-foreground">{helperProfile.bio}</p>
                </section>
              ) : null}

              {helperProfile?.skills?.length ? (
                <section>
                  <h4 className="font-semibold mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {helperProfile.skills.map((s: string, i: number) => (
                      <Badge key={i} variant="outline">{s}</Badge>
                    ))}
                  </div>
                </section>
              ) : null}

              {helperProfile?.portfolio_images?.length ? (
                <section>
                  <h4 className="font-semibold mb-2">Portfolio</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {helperProfile.portfolio_images.map((url: string, i: number) => (
                      <img key={i} src={url} alt={`Portfolio image ${i + 1}`} loading="lazy" className="w-full h-24 object-cover rounded-md" />
                    ))}
                  </div>
                </section>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoicing" className="space-y-4">
          <HelperInvoices helperId={helperData.id} />
        </TabsContent>
      </Tabs>

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={editForm.bio}
                onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell clients about yourself..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="hourly_rate">Hourly Rate (€)</Label>
                <Input
                  id="hourly_rate"
                  type="number"
                  value={editForm.hourly_rate}
                  onChange={(e) => setEditForm(prev => ({ ...prev, hourly_rate: e.target.value }))}
                  placeholder="25"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="experience_years">Years of Experience</Label>
                <Input
                  id="experience_years"
                  type="number"
                  value={editForm.experience_years}
                  onChange={(e) => setEditForm(prev => ({ ...prev, experience_years: e.target.value }))}
                  placeholder="3"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              <Input
                id="skills"
                value={editForm.skills}
                onChange={(e) => setEditForm(prev => ({ ...prev, skills: e.target.value }))}
                placeholder="Photography, Event Setup, Catering"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cities">Available Cities (comma-separated)</Label>
              <Input
                id="cities"
                value={editForm.cities}
                onChange={(e) => setEditForm(prev => ({ ...prev, cities: e.target.value }))}
                placeholder="Madrid, Barcelona, Valencia"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="portfolio">Portfolio Images (URLs, comma-separated)</Label>
              <Textarea
                id="portfolio"
                value={editForm.portfolio}
                onChange={(e) => setEditForm(prev => ({ ...prev, portfolio: e.target.value }))}
                placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveProfile}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}