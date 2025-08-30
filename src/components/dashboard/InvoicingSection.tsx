import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { DollarSign, FileText, Clock, AlertCircle, Send, Edit, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Data structures to match the updated invoice table
interface PlannerInvoice {
  id: string;
  client_id: string;
  planner_id: string;
  job_title: string;
  client_name: string;
  client_contact_email: string;
  planner_name: string;
  event_date: string;
  amount: number;
  status: 'draft' | 'sent_to_planner' | 'awaiting_payment' | 'paid_planner' | 'completed';
  sent_at?: string;
  paid_at?: string;
  completed_at?: string;
  notes?: string;
  created_at: string;
  line_items: any; // Changed to any to handle JSON from database
}

interface Client {
  id: string;
  full_name: string;
  email: string;
}

interface InvoicingSectionProps {
  plannerProfile: any;
}

const InvoicingSection: React.FC<InvoicingSectionProps> = ({ plannerProfile }) => {
  const [invoices, setInvoices] = useState<PlannerInvoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<PlannerInvoice | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    amount: '',
    notes: '',
    line_items: []
  });

  useEffect(() => {
    if (plannerProfile?.id) {
      fetchInvoicesAndData();
    }
  }, [plannerProfile]);

  const fetchInvoicesAndData = async () => {
    try {
      setLoading(true);

      // Fetch invoices for this planner
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('planner_invoices')
        .select('*')
        .eq('planner_id', plannerProfile.id)
        .order('created_at', { ascending: false });

      if (invoicesError) {
        console.error('Error fetching invoices:', invoicesError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch invoices"
        });
        return;
      }

      // Fetch client data
      const clientIds = [...new Set((invoicesData || []).map(inv => inv.client_id))];
      if (clientIds.length > 0) {
        const { data: clientsData, error: clientsError } = await supabase
          .from('clients')
          .select('id, full_name, email')
          .in('id', clientIds);

        if (clientsError) {
          console.error('Error fetching clients:', clientsError);
        } else {
          setClients(clientsData || []);
        }
      }

      setInvoices(invoicesData || []);
    } catch (error) {
      console.error('Error in fetchInvoicesAndData:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle invoice actions
  const handleSendInvoice = async (invoiceId: string) => {
    try {
      const { error } = await supabase
        .from('planner_invoices')
        .update({ status: 'awaiting_payment' })
        .eq('id', invoiceId);

      if (error) throw error;

      await fetchInvoicesAndData();
      toast({
        title: "Success",
        description: "Invoice sent to client successfully"
      });
    } catch (error) {
      console.error('Error sending invoice:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send invoice"
      });
    }
  };

  const handleConfirmPayment = async (invoiceId: string) => {
    try {
      const { error } = await supabase
        .from('planner_invoices')
        .update({ status: 'completed' })
        .eq('id', invoiceId);

      if (error) throw error;

      await fetchInvoicesAndData();
      toast({
        title: "Success",
        description: "Payment confirmed successfully"
      });
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to confirm payment"
      });
    }
  };

  const handleEditInvoice = (invoice: PlannerInvoice) => {
    setSelectedInvoice(invoice);
    setEditFormData({
      amount: invoice.amount.toString(),
      notes: invoice.notes || '',
      line_items: invoice.line_items || []
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateInvoice = async () => {
    if (!selectedInvoice) return;

    try {
      const { error } = await supabase
        .from('planner_invoices')
        .update({
          amount: parseFloat(editFormData.amount),
          notes: editFormData.notes,
          line_items: editFormData.line_items
        })
        .eq('id', selectedInvoice.id);

      if (error) throw error;

      await fetchInvoicesAndData();
      setIsEditDialogOpen(false);
      toast({
        title: "Success",
        description: "Invoice updated successfully"
      });
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update invoice"
      });
    }
  };

  // Get status color and display text for badges
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'secondary';
      case 'awaiting_payment':
        return 'default';
      case 'paid_planner':
        return 'outline';
      case 'completed':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Draft';
      case 'awaiting_payment':
        return 'Sent to Client';
      case 'paid_planner':
        return 'Paid by Client';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  // Get client name from clients array
  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.full_name : 'Unknown Client';
  };

  // Calculate financial summaries
  const totalRevenue = invoices
    .filter(inv => inv.status === 'completed')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const pendingAmount = invoices
    .filter(inv => inv.status === 'awaiting_payment')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const paidAmount = invoices
    .filter(inv => inv.status === 'paid_planner')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const totalInvoices = invoices.length;

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Invoice Management</h2>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Pending Payment</p>
                <p className="text-2xl font-bold">${pendingAmount.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Paid by Client</p>
                <p className="text-2xl font-bold">${paidAmount.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Total Invoices</p>
                <p className="text-2xl font-bold">{totalInvoices}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Management</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 mb-4" />
              <p>No invoices found</p>
              <p className="text-sm">Invoices will appear here when clients approve your applications</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Event Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      {invoice.job_title}
                    </TableCell>
                    <TableCell>{invoice.client_name}</TableCell>
                    <TableCell>
                      {invoice.event_date ? new Date(invoice.event_date).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>${invoice.amount?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(invoice.status)}>
                        {getStatusText(invoice.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        {invoice.status === 'draft' && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditInvoice(invoice)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleSendInvoice(invoice.id)}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {invoice.status === 'paid_planner' && (
                          <Button 
                            size="sm"
                            onClick={() => handleConfirmPayment(invoice.id)}
                          >
                            <Check className="h-4 w-4" />
                            Confirm Receipt
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Invoice Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Invoice</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-amount">Amount</Label>
              <Input 
                id="edit-amount" 
                type="number" 
                value={editFormData.amount}
                onChange={(e) => setEditFormData(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00" 
              />
            </div>
            <div>
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea 
                id="edit-notes" 
                value={editFormData.notes}
                onChange={(e) => setEditFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes..." 
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleUpdateInvoice} className="flex-1">
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { InvoicingSection };
export default InvoicingSection;