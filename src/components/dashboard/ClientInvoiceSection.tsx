import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { DollarSign, FileText, Clock, AlertCircle, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ClientInvoice {
  id: string;
  job_title: string;
  planner_name: string;
  client_contact_email: string;
  event_date: string;
  amount: number;
  status: 'draft' | 'sent_to_planner' | 'awaiting_payment' | 'paid_planner' | 'completed';
  sent_at?: string;
  paid_at?: string;
  completed_at?: string;
  notes?: string;
  created_at: string;
}

interface ClientInvoiceSectionProps {
  clientProfile: any;
}

const ClientInvoiceSection: React.FC<ClientInvoiceSectionProps> = ({ clientProfile }) => {
  const [invoices, setInvoices] = useState<ClientInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (clientProfile?.id) {
      fetchInvoices();
    }
  }, [clientProfile]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);

      const { data: invoicesData, error } = await supabase
        .from('planner_invoices')
        .select('*')
        .eq('client_id', clientProfile.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching invoices:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch invoices"
        });
        return;
      }

      setInvoices((invoicesData as any) || []);
    } catch (error) {
      console.error('Error in fetchInvoices:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (invoiceId: string) => {
    try {
      const { error } = await supabase
        .from('planner_invoices')
        .update({ status: 'paid_planner' } as any)
        .eq('id', invoiceId);

      if (error) throw error;

      await fetchInvoices();
      toast({
        title: "Success",
        description: "Invoice marked as paid successfully"
      });
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to mark invoice as paid"
      });
    }
  };

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
        return 'Draft (Planner Editing)';
      case 'awaiting_payment':
        return 'Payment Required';
      case 'paid_planner':
        return 'Payment Sent';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  // Calculate summaries
  const totalPaid = invoices
    .filter(inv => inv.status === 'completed')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const pendingPayments = invoices
    .filter(inv => inv.status === 'awaiting_payment')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const awaitingConfirmation = invoices
    .filter(inv => inv.status === 'paid_planner')
    .reduce((sum, inv) => sum + inv.amount, 0);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Total Paid</p>
                <p className="text-2xl font-bold">${totalPaid.toFixed(2)}</p>
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
                <p className="text-2xl font-bold">${pendingPayments.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Awaiting Confirmation</p>
                <p className="text-2xl font-bold">${awaitingConfirmation.toFixed(2)}</p>
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
                <p className="text-2xl font-bold">{invoices.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices from Planners</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 mb-4" />
              <p>No invoices found</p>
              <p className="text-sm">Invoices from planners will appear here</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Planner</TableHead>
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
                    <TableCell>{invoice.planner_name}</TableCell>
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
                      {invoice.status === 'awaiting_payment' && (
                        <Button 
                          size="sm"
                          onClick={() => handleMarkAsPaid(invoice.id)}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Mark as Paid
                        </Button>
                      )}
                      {invoice.status === 'draft' && (
                        <span className="text-sm text-muted-foreground">
                          Planner editing
                        </span>
                      )}
                      {(invoice.status === 'paid_planner' || invoice.status === 'completed') && (
                        <span className="text-sm text-muted-foreground">
                          {invoice.status === 'completed' ? 'Completed' : 'Awaiting planner confirmation'}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientInvoiceSection;