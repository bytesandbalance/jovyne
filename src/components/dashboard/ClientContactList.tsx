import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { Phone, Mail, MapPin, User, Edit, Search, Plus, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Client {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  notes?: string;
  created_at: string;
  user_id?: string | null;
}

interface ClientContactListProps {
  plannerProfile: any;
}

export default function ClientContactList({ plannerProfile }: ClientContactListProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewClientDialogOpen, setIsNewClientDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [newClientForm, setNewClientForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });
  const [editClientForm, setEditClientForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });

  useEffect(() => {
    if (plannerProfile) {
      fetchClients();
    }
  }, [plannerProfile]);

  useEffect(() => {
    const filtered = clients.filter(client =>
      client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.phone && client.phone.includes(searchTerm))
    );
    setFilteredClients(filtered);
  }, [clients, searchTerm]);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('planner_id', plannerProfile.id)
        .order('full_name', { ascending: true });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Error",
        description: "Failed to load client contacts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = async () => {
    try {
      if (!newClientForm.full_name || !newClientForm.email) {
        toast({
          title: "Validation Error",
          description: "Please fill in name and email",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('clients')
        .insert({
          full_name: newClientForm.full_name,
          email: newClientForm.email,
          phone: newClientForm.phone || null,
          address: newClientForm.address || null,
          notes: newClientForm.notes || null,
          planner_id: plannerProfile.id,
          user_id: null // Manual clients don't have user accounts
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "External client added successfully"
      });

      setIsNewClientDialogOpen(false);
      setNewClientForm({
        full_name: '',
        email: '',
        phone: '',
        address: '',
        notes: ''
      });
      fetchClients();
    } catch (error) {
      console.error('Error adding client:', error);
      toast({
        title: "Error",
        description: "Failed to add client",
        variant: "destructive"
      });
    }
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setEditClientForm({
      full_name: client.full_name,
      email: client.email,
      phone: client.phone || '',
      address: client.address || '',
      notes: client.notes || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateClient = async () => {
    if (!editingClient) return;

    try {
      if (!editClientForm.full_name || !editClientForm.email) {
        toast({
          title: "Validation Error",
          description: "Please fill in name and email",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('clients')
        .update({
          full_name: editClientForm.full_name,
          email: editClientForm.email,
          phone: editClientForm.phone || null,
          address: editClientForm.address || null,
          notes: editClientForm.notes || null,
        })
        .eq('id', editingClient.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Client updated successfully"
      });

      setIsEditDialogOpen(false);
      setEditingClient(null);
      fetchClients();
    } catch (error) {
      console.error('Error updating client:', error);
      toast({
        title: "Error",
        description: "Failed to update client",
        variant: "destructive"
      });
    }
  };

  const handleDeleteClient = async (client: Client) => {
    if (!confirm(`Are you sure you want to delete ${client.full_name}? This action cannot be undone.`)) {
      return;
    }

    try {
      console.log('Attempting to delete client:', {
        clientId: client.id,
        clientUserId: client.user_id,
        plannerProfileId: plannerProfile?.id
      });

      const { data, error } = await supabase
        .from('clients')
        .delete()
        .eq('id', client.id)
        .select();

      console.log('Delete result:', { data, error });

      if (error) throw error;

      if (data && data.length === 0) {
        console.warn('No rows were deleted - possibly due to RLS policy');
        toast({
          title: "Error",
          description: "Unable to delete client - permission denied",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "External client deleted successfully"
      });

      fetchClients();
    } catch (error) {
      console.error('Error deleting client:', error);
      toast({
        title: "Error",
        description: "Failed to delete client",
        variant: "destructive"
      });
    }
  };


  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading clients...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Client Contacts</h2>
        <Dialog open={isNewClientDialogOpen} onOpenChange={setIsNewClientDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New External Client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New External Client</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={newClientForm.full_name}
                    onChange={(e) => setNewClientForm(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Enter client name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newClientForm.email}
                    onChange={(e) => setNewClientForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newClientForm.phone}
                    onChange={(e) => setNewClientForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={newClientForm.address}
                    onChange={(e) => setNewClientForm(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter address"
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={newClientForm.notes}
                    onChange={(e) => setNewClientForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes about client"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsNewClientDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleAddClient} className="flex-1">
                  Add Client
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Client Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit External Client</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="edit_full_name">Full Name *</Label>
                  <Input
                    id="edit_full_name"
                    value={editClientForm.full_name}
                    onChange={(e) => setEditClientForm(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Enter client name"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_email">Email *</Label>
                  <Input
                    id="edit_email"
                    type="email"
                    value={editClientForm.email}
                    onChange={(e) => setEditClientForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_phone">Phone</Label>
                  <Input
                    id="edit_phone"
                    value={editClientForm.phone}
                    onChange={(e) => setEditClientForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_address">Address</Label>
                  <Input
                    id="edit_address"
                    value={editClientForm.address}
                    onChange={(e) => setEditClientForm(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter address"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_notes">Notes</Label>
                  <Textarea
                    id="edit_notes"
                    value={editClientForm.notes}
                    onChange={(e) => setEditClientForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes about client"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleUpdateClient} className="flex-1">
                  Update Client
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search clients by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Client Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Clients</p>
                <p className="text-2xl font-bold">{clients.length}</p>
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
                <p className="text-2xl font-bold">{clients.filter(c => c.email).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">With Phone</p>
                <p className="text-2xl font-bold">{clients.filter(c => c.phone).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clients List */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Directory</CardTitle>
          <CardDescription>Manage your client contact information</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredClients.length === 0 ? (
            <div className="text-center py-8">
              {clients.length === 0 ? (
                <>
                  <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No clients yet</p>
                  <p className="text-sm text-muted-foreground">Add your first client to get started</p>
                </>
              ) : (
                <>
                  <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No clients match your search</p>
                </>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredClients.map((client) => (
                <div key={client.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{client.full_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Client since {new Date(client.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {/* Only show edit/delete buttons for external clients (user_id is null) */}
                    {!client.user_id && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditClient(client)}>
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteClient(client)}>
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{client.email}</span>
                      </div>
                      {client.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span>{client.phone}</span>
                        </div>
                      )}
                      {client.address && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{client.address}</span>
                        </div>
                      )}
                    </div>
                    
                    {client.notes && (
                      <div>
                        <p className="text-sm font-medium mb-1">Notes:</p>
                        <p className="text-sm text-muted-foreground">{client.notes}</p>
                      </div>
                    )}
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