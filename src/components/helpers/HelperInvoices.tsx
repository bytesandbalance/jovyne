import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { ArrowRightCircle, CheckCircle, FileText, SendHorizonal } from 'lucide-react';

interface HelperInvoicesProps {
  helperId: string;
}

interface HelperInvoice {
  id: string;
  job_title: string;
  planner_name: string | null;
  event_date: string | null;
  amount: number | null;
  status: 'draft' | 'awaiting_payment' | 'paid_planner' | 'completed';
  sent_at?: string | null;
  paid_at?: string | null;
  created_at: string;
}

const statusBadge = (status: HelperInvoice['status']) => {
  switch (status) {
    case 'draft':
      return { label: 'Draft', variant: 'outline' as const };
    case 'awaiting_payment':
      return { label: 'Awaiting Payment', variant: 'secondary' as const };
    case 'paid_planner':
      return { label: 'Paid by Planner', variant: 'default' as const };
    case 'completed':
    default:
      return { label: 'Completed', variant: 'default' as const };
  }
};

export default function HelperInvoices({ helperId }: HelperInvoicesProps) {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<HelperInvoice[]>([]);

  const load = async () => {
    try {
      const { data, error } = await supabase
        .from('helper_invoices')
        .select('id, job_title, planner_name, event_date, amount, status, sent_at, paid_at, created_at')
        .eq('helper_id', helperId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setInvoices((data as any) || []);
    } catch (e) {
      console.error('Failed to load helper invoices', e);
      toast({ title: 'Load failed', description: 'Could not load your invoices', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (helperId) load();
  }, [helperId]);

  const sendToPlanner = async (id: string) => {
    try {
      const { error } = await supabase
        .from('helper_invoices')
        .update({ status: 'sent_to_planner' })
        .eq('id', id);
      if (error) throw error;
      setInvoices(prev => prev.map(i => (i.id === id ? { ...i, status: 'awaiting_payment' } : i)));
      toast({ title: 'Invoice sent', description: 'Planner will be notified and can mark payment.' });
    } catch (e: any) {
      toast({ title: 'Send failed', description: e.message || 'Try again', variant: 'destructive' });
    }
  };

  const confirmReceived = async (id: string) => {
    try {
      const { error } = await supabase
        .from('helper_invoices')
        .update({ status: 'completed' })
        .eq('id', id);
      if (error) throw error;
      setInvoices(prev => prev.map(i => (i.id === id ? { ...i, status: 'completed' } : i)));
      toast({ title: 'Payment confirmed', description: 'Invoice marked as completed.' });
    } catch (e: any) {
      toast({ title: 'Update failed', description: e.message || 'Try again', variant: 'destructive' });
    }
  };

  const totalOpen = invoices.filter(i => i.status === 'awaiting_payment').reduce((s, i) => s + (i.amount || 0), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Helper Invoices</CardTitle>
        <CardDescription>Send invoices and track payments</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No invoices yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded bg-muted/40">
              <span className="flex items-center gap-2"><ArrowRightCircle className="w-4 h-4" />Open Balance (awaiting payment)</span>
              <span className="text-lg font-bold">${totalOpen.toFixed(2)}</span>
            </div>
            {invoices.map((inv) => {
              const sb = statusBadge(inv.status);
              return (
                <div key={inv.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-semibold">{inv.job_title}</div>
                    <div className="text-sm text-muted-foreground">
                      {inv.planner_name || 'Planner'}{inv.event_date ? ` • ${new Date(inv.event_date).toLocaleDateString()}` : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-semibold">${(inv.amount || 0).toFixed(2)}</div>
                      <Badge variant={sb.variant}>{sb.label}</Badge>
                    </div>
                    {inv.status === 'draft' && (
                      <Button onClick={() => sendToPlanner(inv.id)}>
                        <SendHorizonal className="w-4 h-4 mr-2" /> Send to Planner
                      </Button>
                    )}
                    {inv.status === 'paid_planner' && (
                      <Button onClick={() => confirmReceived(inv.id)}>
                        <CheckCircle className="w-4 h-4 mr-2" /> Confirm Received
                      </Button>
                    )}
                    {inv.status !== 'draft' && inv.status !== 'paid_planner' && (
                      <Button variant="outline" disabled>
                        <FileText className="w-4 h-4 mr-2" /> View
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
