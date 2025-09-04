import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Phone, Mail, MapPin, Star, Globe, Edit, Search, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Vendor {
  id: string;
  name: string;
  business_type: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  rating?: number;
  notes?: string;
  pricing_info?: string;
  availability_notes?: string;
  created_at: string;
  updated_at: string;
}

interface VendorDirectoryProps {
  plannerProfile: any;
}

export default function VendorDirectory({ plannerProfile }: VendorDirectoryProps) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [newVendor, setNewVendor] = useState({
    name: '',
    business_type: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    rating: '',
    notes: '',
    pricing_info: '',
    availability_notes: ''
  });

  const businessTypes = [
    { value: 'caterer', label: 'Caterer' },
    { value: 'florist', label: 'Florist' },
    { value: 'photographer', label: 'Photographer' },
    { value: 'videographer', label: 'Videographer' },
    { value: 'venue', label: 'Venue' },
    { value: 'musician', label: 'Musician/DJ' },
    { value: 'decorator', label: 'Decorator' },
    { value: 'baker', label: 'Baker' },
    { value: 'transportation', label: 'Transportation' },
    { value: 'security', label: 'Security' },
    { value: 'equipment', label: 'Equipment Rental' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    console.log('VendorDirectory useEffect - plannerProfile:', plannerProfile);
    if (plannerProfile) {
      console.log('Calling fetchVendors with planner ID:', plannerProfile.id);
      fetchVendors();
    } else {
      console.log('No plannerProfile available');
    }
  }, [plannerProfile]);

  useEffect(() => {
    let filtered = vendors;
    
    if (searchTerm) {
      filtered = filtered.filter(vendor =>
        vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.business_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterType !== 'all') {
      filtered = filtered.filter(vendor => vendor.business_type === filterType);
    }
    
    setFilteredVendors(filtered);
  }, [vendors, searchTerm, filterType]);

  const fetchVendors = async () => {
    console.log('fetchVendors called with plannerProfile.id:', plannerProfile?.id);
    try {
      const { data, error } = await supabase
        .from('planner_vendors')
        .select('*')
        .eq('planner_id', plannerProfile.id)
        .order('name', { ascending: true });

      console.log('Vendor fetch result - data:', data, 'error:', error);
      if (error) throw error;
      setVendors(data || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast({
        title: "Error",
        description: "Failed to load vendors",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!newVendor.name.trim() || !newVendor.business_type) {
      toast({
        title: "Validation Error",
        description: "Vendor name and business type are required",
        variant: "destructive"
      });
      return;
    }

    try {
      const vendorData = {
        ...newVendor,
        planner_id: plannerProfile.id,
        rating: newVendor.rating ? parseInt(newVendor.rating) : null,
        website: newVendor.website || null,
        contact_person: newVendor.contact_person || null,
        email: newVendor.email || null,
        phone: newVendor.phone || null,
        address: newVendor.address || null,
        notes: newVendor.notes || null,
        pricing_info: newVendor.pricing_info || null,
        availability_notes: newVendor.availability_notes || null
      };

      if (editingVendor) {
        const { error } = await supabase
          .from('planner_vendors')
          .update(vendorData)
          .eq('id', editingVendor.id);
        
        if (error) throw error;
        toast({ title: "Vendor updated successfully!" });
      } else {
        const { error } = await supabase
          .from('planner_vendors')
          .insert([vendorData]);
        
        if (error) throw error;
        toast({ title: "Vendor created successfully!" });
      }

      setIsDialogOpen(false);
      setEditingVendor(null);
      setNewVendor({
        name: '', business_type: '', contact_person: '', email: '', phone: '',
        address: '', website: '', rating: '', notes: '', pricing_info: '', availability_notes: ''
      });
      fetchVendors();
    } catch (error) {
      console.error('Error saving vendor:', error);
      toast({
        title: "Error",
        description: "Failed to save vendor",
        variant: "destructive"
      });
    }
  };

  const deleteVendor = async (vendorId: string) => {
    try {
      const { error } = await supabase
        .from('planner_vendors')
        .delete()
        .eq('id', vendorId);

      if (error) throw error;
      fetchVendors();
      toast({ title: "Vendor deleted successfully!" });
    } catch (error) {
      console.error('Error deleting vendor:', error);
      toast({
        title: "Error",
        description: "Failed to delete vendor",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setNewVendor({
      name: vendor.name,
      business_type: vendor.business_type,
      contact_person: vendor.contact_person || '',
      email: vendor.email || '',
      phone: vendor.phone || '',
      address: vendor.address || '',
      website: vendor.website || '',
      rating: vendor.rating?.toString() || '',
      notes: vendor.notes || '',
      pricing_info: vendor.pricing_info || '',
      availability_notes: vendor.availability_notes || ''
    });
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading vendors...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Vendor Directory</h2>
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                console.log('Add Vendor button clicked');
                setEditingVendor(null);
                setNewVendor({
                  name: '', business_type: '', contact_person: '', email: '', phone: '',
                  address: '', website: '', rating: '', notes: '', pricing_info: '', availability_notes: ''
                });
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Vendor
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingVendor ? 'Edit Vendor' : 'Add New Vendor'}</DialogTitle>
                <DialogDescription>
                  {editingVendor ? 'Update vendor information' : 'Add a new vendor to your directory'}
                </DialogDescription>
              </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vendor-name">Vendor Name *</Label>
                  <Input
                    id="vendor-name"
                    value={newVendor.name}
                    onChange={(e) => setNewVendor(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Vendor business name"
                  />
                </div>
                <div>
                  <Label htmlFor="vendor-type">Business Type *</Label>
                  <Select value={newVendor.business_type} onValueChange={(value) => setNewVendor(prev => ({ ...prev, business_type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vendor-contact">Contact Person</Label>
                  <Input
                    id="vendor-contact"
                    value={newVendor.contact_person}
                    onChange={(e) => setNewVendor(prev => ({ ...prev, contact_person: e.target.value }))}
                    placeholder="Contact person name"
                  />
                </div>
                <div>
                  <Label htmlFor="vendor-rating">Rating (1-5)</Label>
                  <Select value={newVendor.rating} onValueChange={(value) => setNewVendor(prev => ({ ...prev, rating: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No rating</SelectItem>
                      <SelectItem value="1">1 Star</SelectItem>
                      <SelectItem value="2">2 Stars</SelectItem>
                      <SelectItem value="3">3 Stars</SelectItem>
                      <SelectItem value="4">4 Stars</SelectItem>
                      <SelectItem value="5">5 Stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vendor-email">Email</Label>
                  <Input
                    id="vendor-email"
                    type="email"
                    value={newVendor.email}
                    onChange={(e) => setNewVendor(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="vendor@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="vendor-phone">Phone</Label>
                  <Input
                    id="vendor-phone"
                    value={newVendor.phone}
                    onChange={(e) => setNewVendor(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="vendor-website">Website</Label>
                <Input
                  id="vendor-website"
                  type="url"
                  value={newVendor.website}
                  onChange={(e) => setNewVendor(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://vendor-website.com"
                />
              </div>

              <div>
                <Label htmlFor="vendor-address">Address</Label>
                <Textarea
                  id="vendor-address"
                  value={newVendor.address}
                  onChange={(e) => setNewVendor(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Business address"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="vendor-pricing">Pricing Information</Label>
                <Textarea
                  id="vendor-pricing"
                  value={newVendor.pricing_info}
                  onChange={(e) => setNewVendor(prev => ({ ...prev, pricing_info: e.target.value }))}
                  placeholder="Pricing details, packages, rates..."
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="vendor-availability">Availability Notes</Label>
                <Textarea
                  id="vendor-availability"
                  value={newVendor.availability_notes}
                  onChange={(e) => setNewVendor(prev => ({ ...prev, availability_notes: e.target.value }))}
                  placeholder="Availability information, booking requirements..."
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="vendor-notes">Notes</Label>
                <Textarea
                  id="vendor-notes"
                  value={newVendor.notes}
                  onChange={(e) => setNewVendor(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes about this vendor"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  {editingVendor ? 'Update Vendor' : 'Add Vendor'}
                </Button>
              </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search vendors by name, type, contact..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="min-w-[200px]">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {businessTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vendor Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Vendors</p>
                <p className="text-2xl font-bold">{vendors.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Highly Rated</p>
                <p className="text-2xl font-bold">{vendors.filter(v => v.rating && v.rating >= 4).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">With Email</p>
                <p className="text-2xl font-bold">{vendors.filter(v => v.email).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">With Website</p>
                <p className="text-2xl font-bold">{vendors.filter(v => v.website).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vendors List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Vendor Directory</CardTitle>
          <CardDescription>Manage your network of trusted vendors and suppliers</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredVendors.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No vendors found</p>
              <p className="text-sm text-muted-foreground">Add vendors to build your professional network</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredVendors.map((vendor) => (
                <div key={vendor.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{vendor.name}</h3>
                        <Badge variant="secondary">
                          {businessTypes.find(t => t.value === vendor.business_type)?.label}
                        </Badge>
                        {vendor.rating && renderStars(vendor.rating)}
                      </div>
                      {vendor.contact_person && (
                        <p className="text-sm text-muted-foreground mb-2">
                          Contact: {vendor.contact_person}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(vendor)}>
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this vendor?')) {
                            deleteVendor(vendor.id);
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      {vendor.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <a href={`mailto:${vendor.email}`} className="text-blue-600 hover:underline">
                            {vendor.email}
                          </a>
                        </div>
                      )}
                      {vendor.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <a href={`tel:${vendor.phone}`} className="text-blue-600 hover:underline">
                            {vendor.phone}
                          </a>
                        </div>
                      )}
                      {vendor.website && (
                        <div className="flex items-center gap-2 text-sm">
                          <Globe className="w-4 h-4 text-muted-foreground" />
                          <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            Website
                          </a>
                        </div>
                      )}
                      {vendor.address && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{vendor.address}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      {vendor.pricing_info && (
                        <div>
                          <p className="text-sm font-medium mb-1">Pricing:</p>
                          <p className="text-sm text-muted-foreground">{vendor.pricing_info}</p>
                        </div>
                      )}
                      {vendor.availability_notes && (
                        <div>
                          <p className="text-sm font-medium mb-1">Availability:</p>
                          <p className="text-sm text-muted-foreground">{vendor.availability_notes}</p>
                        </div>
                      )}
                      {vendor.notes && (
                        <div>
                          <p className="text-sm font-medium mb-1">Notes:</p>
                          <p className="text-sm text-muted-foreground">{vendor.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}