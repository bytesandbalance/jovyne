import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface HelperTask {
  id: string;
  helper_id: string;
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high';
  is_completed: boolean;
  due_date: string | null;
}

interface HelperTasksProps {
  helperId: string;
}

export default function HelperTasks({ helperId }: HelperTasksProps) {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<HelperTask[]>([]);
  const [loading, setLoading] = useState(true);

  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<HelperTask | null>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    due_date: ''
  });

  useEffect(() => {
    if (helperId) {
      fetchTasks();
    }
  }, [helperId]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('helper_tasks')
        .select('*')
        .eq('helper_id', helperId)
        .order('due_date', { ascending: true, nullsFirst: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks((data as any) || []);
    } catch (e) {
      console.error('Error loading tasks', e);
      toast({ title: 'Error', description: 'Failed to load tasks', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => setForm({ title: '', description: '', priority: 'medium', due_date: '' });

  const createTask = async () => {
    if (!form.title.trim()) {
      toast({ title: 'Title required', description: 'Please enter a task title', variant: 'destructive' });
      return;
    }
    try {
      const { data, error } = await supabase
        .from('helper_tasks')
        .insert({
          helper_id: helperId,
          title: form.title.trim(),
          description: form.description.trim() || null,
          priority: form.priority,
          due_date: form.due_date || null,
        })
        .select('*')
        .single();
      if (error) throw error;
      setTasks(prev => [data as HelperTask, ...prev]);
      setIsOpen(false);
      resetForm();
      toast({ title: 'Task added', description: 'Your task has been created.' });
    } catch (e: any) {
      console.error('Error creating task', e);
      toast({ title: 'Error', description: e.message || 'Failed to create task', variant: 'destructive' });
    }
  };

  const toggleComplete = async (task: HelperTask, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('helper_tasks')
        .update({ is_completed: completed })
        .eq('id', task.id);
      if (error) throw error;
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, is_completed: completed } : t));
    } catch (e: any) {
      console.error('Error updating task', e);
      toast({ title: 'Error', description: 'Failed to update task', variant: 'destructive' });
    }
  };

  const openEdit = (task: HelperTask) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      due_date: task.due_date || ''
    });
    setIsEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editingTask) return;
    try {
      const { data, error } = await supabase
        .from('helper_tasks')
        .update({
          title: form.title.trim(),
          description: form.description.trim() || null,
          priority: form.priority,
          due_date: form.due_date || null,
        })
        .eq('id', editingTask.id)
        .select('*')
        .single();
      if (error) throw error;
      setTasks(prev => prev.map(t => t.id === editingTask.id ? (data as HelperTask) : t));
      setIsEditOpen(false);
      setEditingTask(null);
      toast({ title: 'Task updated', description: 'Your changes have been saved.' });
    } catch (e: any) {
      console.error('Error saving task', e);
      toast({ title: 'Error', description: e.message || 'Failed to save task', variant: 'destructive' });
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('helper_tasks')
        .delete()
        .eq('id', taskId);
      if (error) throw error;
      setTasks(prev => prev.filter(t => t.id !== taskId));
      toast({ title: 'Task deleted' });
    } catch (e: any) {
      console.error('Error deleting task', e);
      toast({ title: 'Error', description: e.message || 'Failed to delete task', variant: 'destructive' });
    }
  };

  const getPriorityVariant = (p: string) => {
    switch (p) {
      case 'high': return 'destructive';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading tasks...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">My Tasks</h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="task-title">Title</Label>
                <Input id="task-title" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="task-desc">Description</Label>
                <Textarea id="task-desc" rows={3} value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Priority</Label>
                  <Select value={form.priority} onValueChange={(v: any) => setForm(f => ({ ...f, priority: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="task-due">Due date</Label>
                  <Input id="task-due" type="date" value={form.due_date} onChange={(e) => setForm(f => ({ ...f, due_date: e.target.value }))} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button onClick={createTask}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Task List</CardTitle>
          <CardDescription>Personal tasks not tied to a specific event</CardDescription>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <p className="text-muted-foreground">No tasks yet. Add your first task.</p>
          ) : (
            <div className="space-y-3">
              {tasks.map(task => (
                <div key={task.id} className="flex flex-col sm:flex-row sm:items-start gap-3 p-4 border rounded-lg">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <Checkbox checked={task.is_completed} onCheckedChange={(c) => toggleComplete(task, !!c)} className="flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`font-medium break-words ${task.is_completed ? 'line-through text-muted-foreground' : ''}`}>{task.title}</span>
                        <Badge variant={getPriorityVariant(task.priority)} className="capitalize">{task.priority}</Badge>
                        {task.due_date && !task.is_completed && new Date(task.due_date) < new Date() && (
                          <Badge variant="destructive">Overdue</Badge>
                        )}
                      </div>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1 break-words">{task.description.length > 100 ? `${task.description.substring(0, 100)}...` : task.description}</p>
                      )}
                      {task.due_date && (
                        <p className="text-xs text-muted-foreground mt-1">Due: {new Date(task.due_date).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 justify-end sm:justify-start flex-shrink-0">
                    <Button variant="outline" size="icon" onClick={() => openEdit(task)} aria-label="Edit task">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => deleteTask(task.id)} aria-label="Delete task">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input id="edit-title" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-desc">Description</Label>
              <Textarea id="edit-desc" rows={3} value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={(v: any) => setForm(f => ({ ...f, priority: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-due">Due date</Label>
                <Input id="edit-due" type="date" value={form.due_date} onChange={(e) => setForm(f => ({ ...f, due_date: e.target.value }))} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button onClick={saveEdit}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
