import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Plus, DollarSign, FileText, Calendar, Clock, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  status: string;
  due_date?: string;
  issued_date: string;
  description?: string;
  line_items: any;
  event_id?: string;
  client_id: string;
}

interface Event {
  id: string;
  title: string;
  event_date: string;
}

interface Client {
  id: string;
  full_name: string;
  email: string;
}

interface InvoicingSectionProps {
  plannerProfile: any;
}

export default function InvoicingSection({ plannerProfile }: InvoicingSectionProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    client_id: '',
    event_id: '',
    amount: '',
    description: '',
    due_date: ''
  });

  useEffect(() => {
    if (plannerProfile) {
      fetchInvoicesAndData();
    }
  }, [plannerProfile]);

  const fetchInvoicesAndData = async () => {
    try {
      // Fetch invoices
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select('*')
        .eq('planner_id', plannerProfile.id)
        .order('created_at', { ascending: false });

      if (invoicesError) throw invoicesError;
      setInvoices(invoicesData || []);

      // Fetch events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('id, title, event_date')
        .eq('planner_id', plannerProfile.id);

      if (eventsError) throw eventsError;
      setEvents(eventsData || []);

      // Fetch clients
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('id, full_name, email')
        .eq('planner_id', plannerProfile.id);

      if (clientsError) throw clientsError;
      setClients(clientsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load invoicing data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${year}${month}-${random}`;
  };

  const createInvoice = async () => {
    if (!newInvoice.client_id || !newInvoice.amount) {
      toast({
        title: "Validation Error",
        description: "Please select a client and enter an amount",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('invoices')
        .insert([{
          planner_id: plannerProfile.id,
          invoice_number: generateInvoiceNumber(),
          client_id: newInvoice.client_id,
          event_id: newInvoice.event_id || null,
          amount: parseFloat(newInvoice.amount),
          description: newInvoice.description,
          due_date: newInvoice.due_date || null,
          status: 'draft'
        }])
        .select()
        .single();

      if (error) throw error;

      setInvoices(prev => [data, ...prev]);
      setNewInvoice({
        client_id: '',
        event_id: '',
        amount: '',
        description: '',
        due_date: ''
      });
      setIsDialogOpen(false);

      toast({
        title: "Invoice Created",
        description: "New invoice has been created successfully",
      });
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        title: "Error",
        description: "Failed to create invoice",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'default';
      case 'sent': return 'secondary';
      case 'overdue': return 'destructive';
      case 'cancelled': return 'outline';
      default: return 'secondary';
    }
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.full_name || 'Unknown Client';
  };

  const getEventTitle = (eventId?: string) => {
    if (!eventId) return null;
    const event = events.find(e => e.id === eventId);
    return event?.title || 'Unknown Event';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading invoices...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
  const pendingAmount = invoices.filter(i => i.status === 'sent').reduce((sum, i) => sum + i.amount, 0);
  const overdueAmount = invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Invoicing & Pricing</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
              <DialogDescription>
                Generate an invoice for your client
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="invoice-client">Client *</Label>
                <Select value={newInvoice.client_id} onValueChange={(value) => setNewInvoice(prev => ({ ...prev, client_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.full_name} ({client.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="invoice-event">Event (Optional)</Label>
                <Select value={newInvoice.event_id} onValueChange={(value) => setNewInvoice(prev => ({ ...prev, event_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an event (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map(event => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.title} - {new Date(event.event_date).toLocaleDateString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoice-amount">Amount *</Label>
                  <Input
                    id="invoice-amount"
                    type="number"
                    step="0.01"
                    value={newInvoice.amount}
                    onChange={(e) => setNewInvoice(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="invoice-due-date">Due Date</Label>
                  <Input
                    id="invoice-due-date"
                    type="date"
                    value={newInvoice.due_date}
                    onChange={(e) => setNewInvoice(prev => ({ ...prev, due_date: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="invoice-description">Description</Label>
                <Textarea
                  id="invoice-description"
                  value={newInvoice.description}
                  onChange={(e) => setNewInvoice(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Invoice description or services provided"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createInvoice}>
                  Create Invoice
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">${pendingAmount.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold">${overdueAmount.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Invoices</p>
                <p className="text-2xl font-bold">{invoices.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
          <CardDescription>Manage your billing and pricing</CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No invoices yet</p>
              <p className="text-sm text-muted-foreground">Create your first invoice to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg gap-4">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold truncate">{invoice.invoice_number}</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {getClientName(invoice.client_id)}
                      </p>
                      {getEventTitle(invoice.event_id) && (
                        <p className="text-sm text-muted-foreground truncate">
                          Event: {getEventTitle(invoice.event_id)}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground break-words">
                        Issued: {new Date(invoice.issued_date).toLocaleDateString()}
                        {invoice.due_date && (
                          <span className="block sm:inline">
                            <span className="hidden sm:inline"> • </span>Due: {new Date(invoice.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4 flex-shrink-0">
                    <div className="text-left sm:text-right">
                      <p className="font-semibold text-lg">${invoice.amount.toFixed(2)}</p>
                      <Badge variant={getStatusColor(invoice.status)} className="w-fit">
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm" className="flex-shrink-0">
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
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