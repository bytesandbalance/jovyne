import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { CheckCircle, Clock, DollarSign, FileText } from 'lucide-react';

interface PlannerPendingPaymentsProps {
  plannerProfile: { id: string };
}

interface HelperInvoice {
  id: string;
  job_title: string;
  helper_name: string | null;
  event_date: string | null;
  amount: number | null;
  status: 'draft' | 'awaiting_payment' | 'paid_planner' | 'completed';
  sent_at?: string | null;
  paid_at?: string | null;
}

const statusBadge = (status: HelperInvoice['status']) => {
  switch (status) {
    case 'awaiting_payment':
      return { label: 'Awaiting Payment', variant: 'secondary' as const };
    case 'paid_planner':
      return { label: 'Marked Paid', variant: 'default' as const };
    case 'completed':
      return { label: 'Completed', variant: 'default' as const };
    case 'draft':
    default:
      return { label: 'Draft (Pending Helper)', variant: 'outline' as const };
  }
};

export default function PlannerPendingPayments({ plannerProfile }: PlannerPendingPaymentsProps) {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<HelperInvoice[]>([]);

  const load = async () => {
    try {
      const { data, error } = await supabase
        .from('helper_invoices')
        .select('id, job_title, helper_name, event_date, amount, status, sent_at, paid_at')
        .eq('planner_id', plannerProfile.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setInvoices((data as any) || []);
    } catch (e) {
      console.error('Failed to load pending payments', e);
      toast({ title: 'Load failed', description: 'Could not load pending payments', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (plannerProfile?.id) load();
  }, [plannerProfile?.id]);

  const markPaid = async (id: string) => {
    try {
      const { error } = await supabase
        .from('helper_invoices')
        .update({ status: 'paid_planner' })
        .eq('id', id);
      if (error) throw error;
      setInvoices(prev => prev.map(i => (i.id === id ? { ...i, status: 'paid_planner' } : i)));
      toast({ title: 'Marked as paid', description: 'Waiting for helper confirmation.' });
    } catch (e: any) {
      toast({ title: 'Update failed', description: e.message || 'Try again', variant: 'destructive' });
    }
  };

  const outstanding = invoices.filter(i => i.status !== 'completed');
  const totalDue = outstanding
    .filter(i => i.status === 'awaiting_payment')
    .reduce((s, i) => s + (i.amount || 0), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Payments</CardTitle>
        <CardDescription>Invoices owed to your helpers</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : outstanding.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No pending payments</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded bg-muted/40">
              <span className="flex items-center gap-2"><DollarSign className="w-4 h-4" />Total Due (awaiting payment)</span>
              <span className="text-lg font-bold">${totalDue.toFixed(2)}</span>
            </div>
            {outstanding.map((inv) => {
              const sb = statusBadge(inv.status);
              return (
                <div key={inv.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-semibold">{inv.job_title}</div>
                    <div className="text-sm text-muted-foreground">
                      {inv.helper_name || 'Helper'}
                      {inv.event_date ? ` • ${new Date(inv.event_date).toLocaleDateString()}` : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-semibold">${(inv.amount || 0).toFixed(2)}</div>
                      <Badge variant={sb.variant}>{sb.label}</Badge>
                    </div>
                    {inv.status === 'awaiting_payment' ? (
                      <Button onClick={() => markPaid(inv.id)}>
                        <CheckCircle className="w-4 h-4 mr-2" /> Mark as Paid
                      </Button>
                    ) : (
                      <Button variant="outline" disabled>
                        <Clock className="w-4 h-4 mr-2" /> {sb.label}
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
