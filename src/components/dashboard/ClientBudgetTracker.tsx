import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { Plus, DollarSign, TrendingUp, TrendingDown, Trash2, Receipt } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface BudgetCategory {
  id: string;
  name: string;
  allocated_amount: number;
  spent_amount: number;
  client_id: string;
  created_at: string;
}

interface BudgetExpense {
  id: string;
  category_id: string;
  amount: number;
  description: string;
  expense_date: string;
  vendor?: string;
  receipt_url?: string;
  created_at: string;
}

interface ClientBudgetTrackerProps {
  clientData: any;
}

export default function ClientBudgetTracker({ clientData }: ClientBudgetTrackerProps) {
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [expenses, setExpenses] = useState<BudgetExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    allocated_amount: ''
  });
  const [newExpense, setNewExpense] = useState({
    category_id: '',
    amount: '',
    description: '',
    expense_date: new Date().toISOString().split('T')[0],
    vendor: ''
  });

  const defaultCategories = [
    'Venue',
    'Catering',
    'Entertainment',
    'Decorations',
    'Photography',
    'Transportation',
    'Invitations',
    'Flowers',
    'Miscellaneous'
  ];

  useEffect(() => {
    if (clientData) {
      fetchBudgetData();
    }
  }, [clientData]);

  const fetchBudgetData = async () => {
    try {
      // Fetch budget categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('client_budget_categories')
        .select('*')
        .eq('client_id', clientData.id)
        .order('name', { ascending: true });

      if (categoriesError) throw categoriesError;

      // Fetch expenses
      const { data: expensesData, error: expensesError } = await supabase
        .from('client_budget_expenses')
        .select('*')
        .eq('client_id', clientData.id)
        .order('expense_date', { ascending: false });

      if (expensesError) throw expensesError;

      setCategories(categoriesData || []);
      setExpenses(expensesData || []);
    } catch (error) {
      console.error('Error fetching budget data:', error);
      toast({
        title: "Error",
        description: "Failed to load budget data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategory.name.trim() || !newCategory.allocated_amount) {
      toast({
        title: "Validation Error",
        description: "Category name and allocated amount are required",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('client_budget_categories')
        .insert([{
          name: newCategory.name,
          allocated_amount: parseFloat(newCategory.allocated_amount),
          spent_amount: 0,
          client_id: clientData.id
        }]);

      if (error) throw error;
      
      toast({ title: "Budget category created successfully!" });
      setIsCategoryDialogOpen(false);
      setNewCategory({ name: '', allocated_amount: '' });
      fetchBudgetData();
    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        title: "Error",
        description: "Failed to create budget category",
        variant: "destructive"
      });
    }
  };

  const handleCreateExpense = async () => {
    if (!newExpense.category_id || !newExpense.amount || !newExpense.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Category, amount, and description are required",
        variant: "destructive"
      });
      return;
    }

    try {
      const amount = parseFloat(newExpense.amount);
      
      // Insert expense
      const { error: expenseError } = await supabase
        .from('client_budget_expenses')
        .insert([{
          category_id: newExpense.category_id,
          amount: amount,
          description: newExpense.description,
          expense_date: newExpense.expense_date,
          vendor: newExpense.vendor || null,
          client_id: clientData.id
        }]);

      if (expenseError) throw expenseError;

      // Update spent amount in category
      const category = categories.find(c => c.id === newExpense.category_id);
      if (category) {
        const { error: updateError } = await supabase
          .from('client_budget_categories')
          .update({ spent_amount: category.spent_amount + amount })
          .eq('id', newExpense.category_id);

        if (updateError) throw updateError;
      }
      
      toast({ title: "Expense added successfully!" });
      setIsExpenseDialogOpen(false);
      setNewExpense({
        category_id: '',
        amount: '',
        description: '',
        expense_date: new Date().toISOString().split('T')[0],
        vendor: ''
      });
      fetchBudgetData();
    } catch (error) {
      console.error('Error creating expense:', error);
      toast({
        title: "Error",
        description: "Failed to add expense",
        variant: "destructive"
      });
    }
  };

  const handleDeleteExpense = async (expense: BudgetExpense) => {
    try {
      // Delete expense
      const { error: deleteError } = await supabase
        .from('client_budget_expenses')
        .delete()
        .eq('id', expense.id);

      if (deleteError) throw deleteError;

      // Update spent amount in category
      const category = categories.find(c => c.id === expense.category_id);
      if (category) {
        const { error: updateError } = await supabase
          .from('client_budget_categories')
          .update({ spent_amount: Math.max(0, category.spent_amount - expense.amount) })
          .eq('id', expense.category_id);

        if (updateError) throw updateError;
      }

      toast({ title: "Expense deleted successfully!" });
      fetchBudgetData();
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        title: "Error",
        description: "Failed to delete expense",
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
            <p className="text-muted-foreground">Loading budget data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalBudget = categories.reduce((sum, cat) => sum + cat.allocated_amount, 0);
  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent_amount, 0);
  const remaining = totalBudget - totalSpent;
  const spentPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Budget Tracker</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsCategoryDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
          <Button onClick={() => setIsExpenseDialogOpen(true)}>
            <Receipt className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold">€{totalBudget.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold">€{totalSpent.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className={`w-4 h-4 ${remaining >= 0 ? 'text-green-500' : 'text-red-500'}`} />
              <div>
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className={`text-2xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  €{remaining.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Budget Used</p>
              <Progress value={spentPercentage} className="mb-2" />
              <p className="text-sm font-medium">{spentPercentage.toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Categories</CardTitle>
          <CardDescription>Track spending by category</CardDescription>
        </CardHeader>
        <CardContent>
          {categories.length > 0 ? (
            <div className="space-y-4">
              {categories.map((category) => {
                const percentage = category.allocated_amount > 0 ? (category.spent_amount / category.allocated_amount) * 100 : 0;
                const isOverBudget = category.spent_amount > category.allocated_amount;
                
                return (
                  <div key={category.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{category.name}</h4>
                      <Badge variant={isOverBudget ? 'destructive' : 'default'}>
                        €{category.spent_amount.toFixed(2)} / €{category.allocated_amount.toFixed(2)}
                      </Badge>
                    </div>
                    <Progress 
                      value={Math.min(percentage, 100)} 
                      className={`mb-2 ${isOverBudget ? '[&>div]:bg-red-500' : ''}`}
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{percentage.toFixed(1)}% used</span>
                      <span>€{(category.allocated_amount - category.spent_amount).toFixed(2)} remaining</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No budget categories yet. Create your first category to get started!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Expenses */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
          <CardDescription>Your latest spending</CardDescription>
        </CardHeader>
        <CardContent>
          {expenses.length > 0 ? (
            <div className="space-y-3">
              {expenses.slice(0, 10).map((expense) => {
                const category = categories.find(c => c.id === expense.category_id);
                return (
                  <div key={expense.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{expense.description}</span>
                        <Badge variant="outline">{category?.name}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {new Date(expense.expense_date).toLocaleDateString()}
                        {expense.vendor && ` • ${expense.vendor}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">€{expense.amount.toFixed(2)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteExpense(expense)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No expenses recorded yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Add Budget Category</DialogTitle>
            <DialogDescription>
              Create a new budget category for your event
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="category-name">Category Name *</Label>
              <Select value={newCategory.name} onValueChange={(value) => setNewCategory(prev => ({ ...prev, name: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select or type category name" />
                </SelectTrigger>
                <SelectContent>
                  {defaultCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="allocated-amount">Allocated Amount (€) *</Label>
              <Input
                id="allocated-amount"
                type="number"
                step="0.01"
                min="0"
                value={newCategory.allocated_amount}
                onChange={(e) => setNewCategory(prev => ({ ...prev, allocated_amount: e.target.value }))}
                placeholder="0.00"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCategory}>
                Create Category
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Expense Dialog */}
      <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
            <DialogDescription>
              Record a new expense for your event budget
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="expense-category">Category *</Label>
              <Select value={newExpense.category_id} onValueChange={(value) => setNewExpense(prev => ({ ...prev, category_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expense-amount">Amount (€) *</Label>
                <Input
                  id="expense-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <Label htmlFor="expense-date">Date *</Label>
                <Input
                  id="expense-date"
                  type="date"
                  value={newExpense.expense_date}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, expense_date: e.target.value }))}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="expense-description">Description *</Label>
              <Input
                id="expense-description"
                value={newExpense.description}
                onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                placeholder="What was this expense for?"
              />
            </div>

            <div>
              <Label htmlFor="expense-vendor">Vendor (Optional)</Label>
              <Input
                id="expense-vendor"
                value={newExpense.vendor}
                onChange={(e) => setNewExpense(prev => ({ ...prev, vendor: e.target.value }))}
                placeholder="Name of vendor or supplier"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsExpenseDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateExpense}>
                Add Expense
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}