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
import { Plus, Package, MapPin, DollarSign, Calendar, AlertTriangle, Edit, Search, Wrench } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface InventoryItem {
  id: string;
  item_name: string;
  category: string;
  quantity: number;
  condition: string;
  purchase_date?: string;
  purchase_price?: number;
  current_value?: number;
  location?: string;
  description?: string;
  maintenance_notes?: string;
  last_maintenance_date?: string;
  next_maintenance_date?: string;
  created_at: string;
  updated_at: string;
}

interface InventoryManagementProps {
  plannerProfile: any;
}

export default function InventoryManagement({ plannerProfile }: InventoryManagementProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterCondition, setFilterCondition] = useState('all');
  const [newItem, setNewItem] = useState({
    item_name: '',
    category: '',
    quantity: '1',
    condition: 'excellent',
    purchase_date: '',
    purchase_price: '',
    current_value: '',
    location: '',
    description: '',
    maintenance_notes: '',
    last_maintenance_date: '',
    next_maintenance_date: ''
  });

  const categories = [
    { value: 'equipment', label: 'Equipment' },
    { value: 'decorations', label: 'Decorations' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'supplies', label: 'Supplies' },
    { value: 'linens', label: 'Linens' },
    { value: 'lighting', label: 'Lighting' },
    { value: 'audio_visual', label: 'Audio/Visual' },
    { value: 'tableware', label: 'Tableware' },
    { value: 'other', label: 'Other' }
  ];

  const conditions = [
    { value: 'excellent', label: 'Excellent', color: 'bg-green-100 text-green-800' },
    { value: 'good', label: 'Good', color: 'bg-blue-100 text-blue-800' },
    { value: 'fair', label: 'Fair', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'poor', label: 'Poor', color: 'bg-orange-100 text-orange-800' },
    { value: 'needs_repair', label: 'Needs Repair', color: 'bg-red-100 text-red-800' }
  ];

  useEffect(() => {
    if (plannerProfile) {
      fetchInventory();
    }
  }, [plannerProfile]);

  useEffect(() => {
    let filtered = inventory;
    
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => item.category === filterCategory);
    }
    
    if (filterCondition !== 'all') {
      filtered = filtered.filter(item => item.condition === filterCondition);
    }
    
    setFilteredInventory(filtered);
  }, [inventory, searchTerm, filterCategory, filterCondition]);

  const fetchInventory = async () => {
    try {
      const { data, error } = await supabase
        .from('planner_inventory')
        .select('*')
        .eq('planner_id', plannerProfile.id)
        .order('item_name', { ascending: true });

      if (error) throw error;
      setInventory(data || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast({
        title: "Error",
        description: "Failed to load inventory",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!newItem.item_name.trim() || !newItem.category) {
      toast({
        title: "Validation Error",
        description: "Item name and category are required",
        variant: "destructive"
      });
      return;
    }

    try {
      const itemData = {
        item_name: newItem.item_name,
        category: newItem.category,
        quantity: parseInt(newItem.quantity) || 1,
        condition: newItem.condition,
        purchase_date: newItem.purchase_date || null,
        purchase_price: newItem.purchase_price ? parseFloat(newItem.purchase_price) : null,
        current_value: newItem.current_value ? parseFloat(newItem.current_value) : null,
        location: newItem.location || null,
        description: newItem.description || null,
        maintenance_notes: newItem.maintenance_notes || null,
        last_maintenance_date: newItem.last_maintenance_date || null,
        next_maintenance_date: newItem.next_maintenance_date || null,
        planner_id: plannerProfile.id
      };

      if (editingItem) {
        const { error } = await supabase
          .from('planner_inventory')
          .update(itemData)
          .eq('id', editingItem.id);
        
        if (error) throw error;
        toast({ title: "Item updated successfully!" });
      } else {
        const { error } = await supabase
          .from('planner_inventory')
          .insert([itemData]);
        
        if (error) throw error;
        toast({ title: "Item added successfully!" });
      }

      setIsDialogOpen(false);
      setEditingItem(null);
      setNewItem({
        item_name: '', category: '', quantity: '1', condition: 'excellent',
        purchase_date: '', purchase_price: '', current_value: '', location: '',
        description: '', maintenance_notes: '', last_maintenance_date: '', next_maintenance_date: ''
      });
      fetchInventory();
    } catch (error) {
      console.error('Error saving item:', error);
      toast({
        title: "Error",
        description: "Failed to save item",
        variant: "destructive"
      });
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('planner_inventory')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      fetchInventory();
      toast({ title: "Item deleted successfully!" });
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (item: InventoryItem) => {
    setEditingItem(item);
    setNewItem({
      item_name: item.item_name,
      category: item.category,
      quantity: item.quantity.toString(),
      condition: item.condition,
      purchase_date: item.purchase_date || '',
      purchase_price: item.purchase_price?.toString() || '',
      current_value: item.current_value?.toString() || '',
      location: item.location || '',
      description: item.description || '',
      maintenance_notes: item.maintenance_notes || '',
      last_maintenance_date: item.last_maintenance_date || '',
      next_maintenance_date: item.next_maintenance_date || ''
    });
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading inventory...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getConditionColor = (condition: string) => {
    return conditions.find(c => c.value === condition)?.color || 'bg-gray-100 text-gray-800';
  };

  const getTotalValue = () => {
    return inventory.reduce((total, item) => total + (item.current_value || item.purchase_price || 0), 0);
  };

  const getItemsNeedingMaintenance = () => {
    const today = new Date();
    return inventory.filter(item => {
      if (!item.next_maintenance_date) return false;
      const maintenanceDate = new Date(item.next_maintenance_date);
      const diffTime = maintenanceDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7 && diffDays >= 0;
    }).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Inventory Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingItem(null);
              setNewItem({
                item_name: '', category: '', quantity: '1', condition: 'excellent',
                purchase_date: '', purchase_price: '', current_value: '', location: '',
                description: '', maintenance_notes: '', last_maintenance_date: '', next_maintenance_date: ''
              });
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Inventory Item' : 'Add New Item'}</DialogTitle>
              <DialogDescription>
                {editingItem ? 'Update item information' : 'Add a new item to your inventory'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="item-name">Item Name *</Label>
                  <Input
                    id="item-name"
                    value={newItem.item_name}
                    onChange={(e) => setNewItem(prev => ({ ...prev, item_name: e.target.value }))}
                    placeholder="Item name"
                  />
                </div>
                <div>
                  <Label htmlFor="item-category">Category *</Label>
                  <Select value={newItem.category} onValueChange={(value) => setNewItem(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="item-quantity">Quantity</Label>
                  <Input
                    id="item-quantity"
                    type="number"
                    min="1"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem(prev => ({ ...prev, quantity: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="item-condition">Condition</Label>
                  <Select value={newItem.condition} onValueChange={(value) => setNewItem(prev => ({ ...prev, condition: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {conditions.map((condition) => (
                        <SelectItem key={condition.value} value={condition.value}>
                          {condition.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="purchase-price">Purchase Price ($)</Label>
                  <Input
                    id="purchase-price"
                    type="number"
                    step="0.01"
                    value={newItem.purchase_price}
                    onChange={(e) => setNewItem(prev => ({ ...prev, purchase_price: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="current-value">Current Value ($)</Label>
                  <Input
                    id="current-value"
                    type="number"
                    step="0.01"
                    value={newItem.current_value}
                    onChange={(e) => setNewItem(prev => ({ ...prev, current_value: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="purchase-date">Purchase Date</Label>
                  <Input
                    id="purchase-date"
                    type="date"
                    value={newItem.purchase_date}
                    onChange={(e) => setNewItem(prev => ({ ...prev, purchase_date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="item-location">Storage Location</Label>
                  <Input
                    id="item-location"
                    value={newItem.location}
                    onChange={(e) => setNewItem(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Storage location"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="item-description">Description</Label>
                <Textarea
                  id="item-description"
                  value={newItem.description}
                  onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Item description, specifications, notes..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="maintenance-notes">Maintenance Notes</Label>
                <Textarea
                  id="maintenance-notes"
                  value={newItem.maintenance_notes}
                  onChange={(e) => setNewItem(prev => ({ ...prev, maintenance_notes: e.target.value }))}
                  placeholder="Maintenance requirements, care instructions..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="last-maintenance">Last Maintenance</Label>
                  <Input
                    id="last-maintenance"
                    type="date"
                    value={newItem.last_maintenance_date}
                    onChange={(e) => setNewItem(prev => ({ ...prev, last_maintenance_date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="next-maintenance">Next Maintenance</Label>
                  <Input
                    id="next-maintenance"
                    type="date"
                    value={newItem.next_maintenance_date}
                    onChange={(e) => setNewItem(prev => ({ ...prev, next_maintenance_date: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  {editingItem ? 'Update Item' : 'Add Item'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search items by name, location, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={filterCondition} onValueChange={setFilterCondition}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Conditions</SelectItem>
                  {conditions.map((condition) => (
                    <SelectItem key={condition.value} value={condition.value}>
                      {condition.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{inventory.reduce((total, item) => total + item.quantity, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">${getTotalValue().toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Needs Repair</p>
                <p className="text-2xl font-bold">{inventory.filter(i => i.condition === 'needs_repair').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Maintenance Due</p>
                <p className="text-2xl font-bold">{getItemsNeedingMaintenance()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Inventory</CardTitle>
          <CardDescription>Track and manage your event planning equipment and supplies</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredInventory.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No inventory items found</p>
              <p className="text-sm text-muted-foreground">Add items to track your equipment and supplies</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredInventory.map((item) => (
                <div key={item.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{item.item_name}</h3>
                        <Badge variant="secondary">
                          {categories.find(c => c.value === item.category)?.label}
                        </Badge>
                        <Badge className={getConditionColor(item.condition)}>
                          {conditions.find(c => c.value === item.condition)?.label}
                        </Badge>
                        <Badge variant="outline">
                          Qty: {item.quantity}
                        </Badge>
                      </div>
                      {item.description && (
                        <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(item)}>
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this item?')) {
                            deleteItem(item.id);
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      {item.purchase_price && (
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="w-3 h-3 text-muted-foreground" />
                          <span>Purchase: ${item.purchase_price}</span>
                        </div>
                      )}
                      {item.current_value && (
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="w-3 h-3 text-muted-foreground" />
                          <span>Current: ${item.current_value}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      {item.location && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          <span>{item.location}</span>
                        </div>
                      )}
                      {item.purchase_date && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          <span>Purchased: {format(new Date(item.purchase_date), 'MMM d, yyyy')}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      {item.last_maintenance_date && (
                        <div className="flex items-center gap-2 text-sm">
                          <Wrench className="w-3 h-3 text-muted-foreground" />
                          <span>Last: {format(new Date(item.last_maintenance_date), 'MMM d, yyyy')}</span>
                        </div>
                      )}
                      {item.next_maintenance_date && (
                        <div className="flex items-center gap-2 text-sm">
                          <Wrench className="w-3 h-3 text-muted-foreground" />
                          <span>Next: {format(new Date(item.next_maintenance_date), 'MMM d, yyyy')}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      {item.maintenance_notes && (
                        <div>
                          <p className="text-xs font-medium mb-1">Maintenance:</p>
                          <p className="text-xs text-muted-foreground">{item.maintenance_notes}</p>
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