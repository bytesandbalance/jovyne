import { useState, useEffect, useRef } from 'react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { User, Camera, MapPin, Star, Calendar, Phone, Mail, Edit3, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [plannerProfile, setPlannerProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    business_name: '',
    description: '',
    location_city: '',
    location_state: '',
    base_price: '',
    years_experience: '',
    website_url: '',
    instagram_handle: ''
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      // Fetch user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      setProfile(profileData);

      // Check if user is a planner
      const { data: plannerData } = await supabase
        .from('planners')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      setPlannerProfile(plannerData);

      // Set form data
      setFormData({
        full_name: profileData?.full_name || '',
        phone: profileData?.phone || '',
        business_name: plannerData?.business_name || '',
        description: plannerData?.description || '',
        location_city: plannerData?.location_city || '',
        location_state: plannerData?.location_state || '',
        base_price: plannerData?.base_price?.toString() || '',
        years_experience: plannerData?.years_experience?.toString() || '',
        website_url: plannerData?.website_url || '',
        instagram_handle: plannerData?.instagram_handle || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return;
    
    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });
      
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('user_id', user.id);
      
      if (updateError) throw updateError;
      
      await fetchProfile();
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully.",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const uploadPortfolioImage = async (file: File) => {
    if (!user || !plannerProfile) return;
    
    setUploadingPortfolio(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('portfolios')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('portfolios')
        .getPublicUrl(fileName);
      
      const currentImages = plannerProfile.portfolio_images || [];
      const updatedImages = [...currentImages, data.publicUrl];
      
      const { error: updateError } = await supabase
        .from('planners')
        .update({ portfolio_images: updatedImages })
        .eq('user_id', user.id);
      
      if (updateError) throw updateError;
      
      await fetchProfile();
      toast({
        title: "Portfolio image added",
        description: "Your portfolio image has been added successfully.",
      });
    } catch (error) {
      console.error('Error uploading portfolio image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploadingPortfolio(false);
    }
  };

  const removePortfolioImage = async (imageUrl: string) => {
    if (!user || !plannerProfile) return;
    
    try {
      const currentImages = plannerProfile.portfolio_images || [];
      const updatedImages = currentImages.filter((url: string) => url !== imageUrl);
      
      const { error: updateError } = await supabase
        .from('planners')
        .update({ portfolio_images: updatedImages })
        .eq('user_id', user.id);
      
      if (updateError) throw updateError;
      
      await fetchProfile();
      toast({
        title: "Image removed",
        description: "Portfolio image has been removed successfully.",
      });
    } catch (error) {
      console.error('Error removing image:', error);
      toast({
        title: "Error",
        description: "Failed to remove image. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadAvatar(file);
    }
  };

  const handlePortfolioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadPortfolioImage(file);
    }
    // Reset input
    if (portfolioInputRef.current) {
      portfolioInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone
        })
        .eq('user_id', user?.id);

      if (profileError) throw profileError;

      // Update planner profile if exists
      if (plannerProfile) {
        const { error: plannerError } = await supabase
          .from('planners')
          .update({
            business_name: formData.business_name,
            description: formData.description,
            location_city: formData.location_city,
            location_state: formData.location_state,
            base_price: formData.base_price ? parseFloat(formData.base_price) : null,
            years_experience: formData.years_experience ? parseInt(formData.years_experience) : null,
            website_url: formData.website_url,
            instagram_handle: formData.instagram_handle
          })
          .eq('user_id', user?.id);

        if (plannerError) throw plannerError;
      }

      setEditing(false);
      await fetchProfile();
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  const isPlannerView = plannerProfile && profile?.user_role === 'planner';

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="relative inline-block mb-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="text-2xl">
                {profile?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <Button 
              size="sm" 
              variant="outline" 
              className="absolute -bottom-2 -right-2 rounded-full p-2"
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
            >
              {uploadingAvatar ? (
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </Button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
          
          <h1 className="text-3xl font-bold mb-2">{profile?.full_name}</h1>
          <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
            <Mail className="w-4 h-4" />
            <span>{profile?.email}</span>
          </div>
          
          {isPlannerView && (
            <div className="flex items-center justify-center gap-4 text-sm">
              {plannerProfile?.location_city && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{plannerProfile.location_city}, {plannerProfile.location_state}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>{plannerProfile?.average_rating || '0.0'} ({plannerProfile?.total_reviews || 0} reviews)</span>
              </div>
              <Badge variant={plannerProfile?.is_verified ? "default" : "secondary"}>
                {plannerProfile?.is_verified ? "Verified" : "Pending"}
              </Badge>
            </div>
          )}
        </div>

        {/* Profile Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Manage your account details</CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => editing ? handleSave() : setEditing(true)}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                {editing ? 'Save' : 'Edit'}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {editing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">Full Name:</span>
                    <p className="text-muted-foreground">{profile?.full_name}</p>
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span>
                    <p className="text-muted-foreground">{profile?.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Role:</span>
                    <p className="text-muted-foreground capitalize">{profile?.user_role}</p>
                  </div>
                  <div>
                    <span className="font-medium">Member since:</span>
                    <p className="text-muted-foreground">
                      {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {isPlannerView && (
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>Your planner profile details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {editing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="business_name">Business Name</Label>
                        <Input
                          id="business_name"
                          value={formData.business_name}
                          onChange={(e) => setFormData({...formData, business_name: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="base_price">Base Price ($)</Label>
                        <Input
                          id="base_price"
                          type="number"
                          value={formData.base_price}
                          onChange={(e) => setFormData({...formData, base_price: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="location_city">City</Label>
                        <Input
                          id="location_city"
                          value={formData.location_city}
                          onChange={(e) => setFormData({...formData, location_city: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="location_state">State</Label>
                        <Input
                          id="location_state"
                          value={formData.location_state}
                          onChange={(e) => setFormData({...formData, location_state: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="years_experience">Years of Experience</Label>
                        <Input
                          id="years_experience"
                          type="number"
                          value={formData.years_experience}
                          onChange={(e) => setFormData({...formData, years_experience: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="website_url">Website URL</Label>
                        <Input
                          id="website_url"
                          type="url"
                          value={formData.website_url}
                          onChange={(e) => setFormData({...formData, website_url: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="instagram_handle">Instagram Handle</Label>
                        <Input
                          id="instagram_handle"
                          value={formData.instagram_handle}
                          onChange={(e) => setFormData({...formData, instagram_handle: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        rows={4}
                      />
                    </div>
                    
                    {/* Portfolio Images Upload */}
                    <div>
                      <Label>Portfolio Images</Label>
                      <div className="space-y-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => portfolioInputRef.current?.click()}
                          disabled={uploadingPortfolio}
                          className="w-full"
                        >
                          {uploadingPortfolio ? (
                            <>
                              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              Add Portfolio Image
                            </>
                          )}
                        </Button>
                        <input
                          ref={portfolioInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handlePortfolioChange}
                          className="hidden"
                        />
                        
                        {plannerProfile?.portfolio_images && plannerProfile.portfolio_images.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {plannerProfile.portfolio_images.map((image: string, index: number) => (
                              <div key={index} className="relative group">
                                <img
                                  src={image}
                                  alt={`Portfolio ${index + 1}`}
                                  className="w-full h-32 object-cover rounded-lg"
                                />
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="destructive"
                                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
                                  onClick={() => removePortfolioImage(image)}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium">Business Name:</span>
                        <p className="text-muted-foreground">{plannerProfile?.business_name || 'Not provided'}</p>
                      </div>
                      <div>
                        <span className="font-medium">Base Price:</span>
                        <p className="text-muted-foreground">${plannerProfile?.base_price || 'Not set'}</p>
                      </div>
                      <div>
                        <span className="font-medium">Experience:</span>
                        <p className="text-muted-foreground">{plannerProfile?.years_experience || '0'} years</p>
                      </div>
                      <div>
                        <span className="font-medium">Website:</span>
                        <p className="text-muted-foreground">{plannerProfile?.website_url || 'Not provided'}</p>
                      </div>
                      <div>
                        <span className="font-medium">Instagram:</span>
                        <p className="text-muted-foreground">{plannerProfile?.instagram_handle || 'Not provided'}</p>
                      </div>
                    </div>
                    {plannerProfile?.description && (
                      <div>
                        <span className="font-medium">Description:</span>
                        <p className="text-muted-foreground mt-1">{plannerProfile.description}</p>
                      </div>
                    )}
                    
                    {/* Portfolio Images Display */}
                    {plannerProfile?.portfolio_images && plannerProfile.portfolio_images.length > 0 && (
                      <div>
                        <span className="font-medium">Portfolio:</span>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                          {plannerProfile.portfolio_images.map((image: string, index: number) => (
                            <img
                              key={index}
                              src={image}
                              alt={`Portfolio ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Account Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Account Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">0</div>
                  <p className="text-sm text-muted-foreground">Events Hosted</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">0</div>
                  <p className="text-sm text-muted-foreground">Reviews</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {profile?.created_at ? Math.floor((new Date().getTime() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Days Active</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">0</div>
                  <p className="text-sm text-muted-foreground">Connections</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}