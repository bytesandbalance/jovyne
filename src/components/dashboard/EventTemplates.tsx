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
import { Plus, FileText, Clock, DollarSign, Copy, Edit, Search, Package } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Template {
  id: string;
  name: string;
  template_type: string;
  event_type?: string;
  content: any;
  estimated_budget?: number;
  estimated_hours?: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface EventTemplatesProps {
  plannerProfile: any;
}

export default function EventTemplates({ plannerProfile }: EventTemplatesProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    template_type: '',
    event_type: '',
    estimated_budget: '',
    estimated_hours: '',
    description: '',
    content: ''
  });

  const templateTypes = [
    { value: 'checklist', label: 'Checklist' },
    { value: 'timeline', label: 'Timeline' },
    { value: 'budget', label: 'Budget Breakdown' },
    { value: 'package', label: 'Service Package' }
  ];

  const prebuiltTemplates = {
    wedding: {
      checklist: {
        name: "Wedding Planning Checklist",
        description: "Comprehensive wedding planning checklist",
        content: `• 12-6 months before: Book venue, set budget, create guest list
• 6-4 months before: Send invitations, book catering, order flowers
• 4-2 months before: Final headcount, wedding cake, seating chart
• 2 weeks before: Confirm all vendors, final dress fitting
• 1 week before: Pack for honeymoon, final venue walkthrough
• Day of: Relax and enjoy your special day!`,
        estimated_budget: 25000,
        estimated_hours: 200
      },
      timeline: {
        name: "Wedding Day Timeline",
        description: "Sample wedding day schedule",
        content: `10:00 AM - Bridal party hair & makeup begins
2:00 PM - Groom and groomsmen get ready
3:00 PM - First look photos
4:00 PM - Wedding party photos
5:30 PM - Ceremony begins
6:00 PM - Cocktail hour
7:00 PM - Reception dinner
9:00 PM - Dancing begins
11:00 PM - Last dance & send-off`,
        estimated_budget: 5000,
        estimated_hours: 12
      },
      budget: {
        name: "Wedding Budget Breakdown",
        description: "Typical wedding budget allocation",
        content: `Venue (40%): $10,000
Catering (30%): $7,500
Photography/Video (15%): $3,750
Flowers/Decor (10%): $2,500
Music/Entertainment (8%): $2,000
Wedding Attire (5%): $1,250
Miscellaneous (7%): $1,750
Total: $28,750`,
        estimated_budget: 28750,
        estimated_hours: 150
      }
    },
    birthday: {
      checklist: {
        name: "Birthday Party Checklist",
        description: "Complete birthday party planning guide",
        content: `• 4-6 weeks before: Choose theme, set date, create guest list
• 3-4 weeks before: Send invitations, book venue if needed
• 2-3 weeks before: Order cake, plan menu, buy decorations
• 1 week before: Confirm RSVPs, prepare party favors
• Day before: Set up decorations, prepare food
• Day of: Final setup, enjoy the celebration!`,
        estimated_budget: 800,
        estimated_hours: 25
      },
      timeline: {
        name: "Birthday Party Timeline",
        description: "Sample birthday party schedule",
        content: `2:00 PM - Setup begins (decorations, tables)
3:00 PM - Final food preparation
4:00 PM - Guests arrive, welcome drinks
4:30 PM - Party activities/games
5:30 PM - Cake ceremony & singing
6:00 PM - Dinner/food service
7:00 PM - More activities, dancing
8:00 PM - Party favors, thank you & goodbye`,
        estimated_budget: 600,
        estimated_hours: 8
      }
    },
    corporate: {
      checklist: {
        name: "Corporate Event Checklist",
        description: "Professional corporate event planning",
        content: `• 8-10 weeks before: Define objectives, set budget, book venue
• 6-8 weeks before: Send invitations, arrange catering
• 4-6 weeks before: Confirm speakers, plan agenda
• 2-4 weeks before: Final headcount, AV equipment check
• 1 week before: Rehearsal, final confirmations
• Day of: Setup, registration, smooth execution`,
        estimated_budget: 15000,
        estimated_hours: 80
      },
      timeline: {
        name: "Corporate Event Timeline",
        description: "Sample corporate event schedule",
        content: `8:00 AM - Setup begins, AV equipment test
9:00 AM - Registration opens, welcome coffee
9:30 AM - Opening remarks
10:00 AM - Keynote presentation
11:00 AM - Networking break
11:30 AM - Panel discussion
12:30 PM - Lunch break
2:00 PM - Workshops/breakout sessions
4:00 PM - Closing remarks & networking
5:00 PM - Event concludes`,
        estimated_budget: 8000,
        estimated_hours: 10
      }
    }
  };

  const eventTypes = [
    { value: 'wedding', label: 'Wedding' },
    { value: 'corporate', label: 'Corporate Event' },
    { value: 'birthday', label: 'Birthday Party' },
    { value: 'conference', label: 'Conference' },
    { value: 'gala', label: 'Gala' },
    { value: 'anniversary', label: 'Anniversary' },
    { value: 'graduation', label: 'Graduation' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    if (plannerProfile) {
      fetchTemplates();
    }
  }, [plannerProfile]);

  useEffect(() => {
    let filtered = templates;
    
    if (searchTerm) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.event_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterType !== 'all') {
      filtered = filtered.filter(template => template.template_type === filterType);
    }
    
    setFilteredTemplates(filtered);
  }, [templates, searchTerm, filterType]);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('planner_templates')
        .select('*')
        .eq('planner_id', plannerProfile.id)
        .order('name', { ascending: true });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error",
        description: "Failed to load templates",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!newTemplate.name.trim() || !newTemplate.template_type) {
      toast({
        title: "Validation Error",
        description: "Template name and type are required",
        variant: "destructive"
      });
      return;
    }

    try {
      // Parse content as JSON if it's a string
      let content = newTemplate.content;
      if (typeof content === 'string') {
        try {
          content = JSON.parse(content);
        } catch {
          // If it's not valid JSON, store as simple text
          content = content;
        }
      }

      const templateData = {
        name: newTemplate.name,
        template_type: newTemplate.template_type,
        event_type: newTemplate.event_type || null,
        estimated_budget: newTemplate.estimated_budget ? parseFloat(newTemplate.estimated_budget) : null,
        estimated_hours: newTemplate.estimated_hours ? parseFloat(newTemplate.estimated_hours) : null,
        description: newTemplate.description || null,
        content: content,
        planner_id: plannerProfile.id
      };

      if (editingTemplate) {
        const { error } = await supabase
          .from('planner_templates')
          .update(templateData)
          .eq('id', editingTemplate.id);
        
        if (error) throw error;
        toast({ title: "Template updated successfully!" });
      } else {
        const { error } = await supabase
          .from('planner_templates')
          .insert([templateData]);
        
        if (error) throw error;
        toast({ title: "Template created successfully!" });
      }

      setIsDialogOpen(false);
      setEditingTemplate(null);
      setNewTemplate({
        name: '', template_type: '', event_type: '', estimated_budget: '',
        estimated_hours: '', description: '', content: ''
      });
      fetchTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive"
      });
    }
  };

  const duplicateTemplate = async (template: Template) => {
    try {
      const templateData = {
        name: `${template.name} (Copy)`,
        template_type: template.template_type,
        event_type: template.event_type,
        estimated_budget: template.estimated_budget,
        estimated_hours: template.estimated_hours,
        description: template.description,
        content: template.content,
        planner_id: plannerProfile.id
      };

      const { error } = await supabase
        .from('planner_templates')
        .insert([templateData]);
      
      if (error) throw error;
      fetchTemplates();
      toast({ title: "Template duplicated successfully!" });
    } catch (error) {
      console.error('Error duplicating template:', error);
      toast({
        title: "Error",
        description: "Failed to duplicate template",
        variant: "destructive"
      });
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('planner_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;
      fetchTemplates();
      toast({ title: "Template deleted successfully!" });
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (template: Template) => {
    setEditingTemplate(template);
    setNewTemplate({
      name: template.name,
      template_type: template.template_type,
      event_type: template.event_type || '',
      estimated_budget: template.estimated_budget?.toString() || '',
      estimated_hours: template.estimated_hours?.toString() || '',
      description: template.description || '',
      content: typeof template.content === 'object' ? JSON.stringify(template.content, null, 2) : template.content || ''
    });
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading templates...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatContent = (content: any) => {
    if (typeof content === 'object' && content.text) {
      return content.text;
    }
    if (typeof content === 'object') {
      return JSON.stringify(content, null, 2);
    }
    return content || 'No content';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Event Templates</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsDialogOpen(true)}
            className="mr-2"
          >
            Use Pre-built Template
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingTemplate(null);
                setNewTemplate({
                  name: '', template_type: '', event_type: '', estimated_budget: '',
                  estimated_hours: '', description: '', content: ''
                });
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTemplate ? 'Edit Template' : 'Create New Template'}</DialogTitle>
              <DialogDescription>
                {editingTemplate ? 'Update template details' : 'Create a reusable template for your events'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="template-name">Template Name *</Label>
                  <Input
                    id="template-name"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Template name"
                  />
                </div>
                <div>
                  <Label htmlFor="template-type">Template Type *</Label>
                  <Select value={newTemplate.template_type} onValueChange={(value) => setNewTemplate(prev => ({ ...prev, template_type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {templateTypes.map((type) => (
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
                  <Label htmlFor="event-type">Event Type</Label>
                  <Select value={newTemplate.event_type} onValueChange={(value) => setNewTemplate(prev => ({ ...prev, event_type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="estimated-budget">Estimated Budget ($)</Label>
                  <Input
                    id="estimated-budget"
                    type="number"
                    value={newTemplate.estimated_budget}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, estimated_budget: e.target.value }))}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="estimated-hours">Estimated Hours</Label>
                <Input
                  id="estimated-hours"
                  type="number"
                  step="0.5"
                  value={newTemplate.estimated_hours}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, estimated_hours: e.target.value }))}
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="template-description">Description</Label>
                <Textarea
                  id="template-description"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Template description"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="template-content">Template Content</Label>
                <Textarea
                  id="template-content"
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter your template content (checklist items, timeline steps, budget categories, etc.)"
                  rows={8}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  You can enter plain text or JSON format for structured data
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  {editingTemplate ? 'Update Template' : 'Create Template'}
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
                  placeholder="Search templates by name, event type, description..."
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
                  <SelectItem value="all">All Templates</SelectItem>
                  {templateTypes.map((type) => (
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

      {/* Template Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Templates</p>
                <p className="text-2xl font-bold">{templates.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Checklists</p>
                <p className="text-2xl font-bold">{templates.filter(t => t.template_type === 'checklist').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Timelines</p>
                <p className="text-2xl font-bold">{templates.filter(t => t.template_type === 'timeline').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Budgets</p>
                <p className="text-2xl font-bold">{templates.filter(t => t.template_type === 'budget').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pre-built Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Pre-built Templates</CardTitle>
          <CardDescription>Quick start with professionally designed templates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(prebuiltTemplates).map(([eventType, templates]) => (
              <div key={eventType} className="space-y-3">
                <h4 className="font-semibold capitalize">{eventType} Templates</h4>
                {Object.entries(templates).map(([templateType, template]) => (
                  <div key={templateType} className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                       onClick={() => {
                         setNewTemplate({
                           name: template.name,
                           template_type: templateType,
                           event_type: eventType,
                           description: template.description,
                           content: template.content,
                           estimated_budget: template.estimated_budget?.toString() || '',
                           estimated_hours: template.estimated_hours?.toString() || ''
                         });
                         setEditingTemplate(null);
                         setIsDialogOpen(true);
                       }}>
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-medium text-sm">{template.name}</h5>
                      <Badge variant="secondary" className="text-xs">
                        {templateTypes.find(t => t.value === templateType)?.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{template.description}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Templates List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Template Library</CardTitle>
          <CardDescription>Reusable templates to streamline your event planning process</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No templates found</p>
              <p className="text-sm text-muted-foreground">Create templates to standardize your event planning</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredTemplates.map((template) => (
                <div key={template.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{template.name}</h3>
                        <Badge variant="secondary">
                          {templateTypes.find(t => t.value === template.template_type)?.label}
                        </Badge>
                        {template.event_type && (
                          <Badge variant="outline">
                            {eventTypes.find(t => t.value === template.event_type)?.label}
                          </Badge>
                        )}
                      </div>
                      {template.description && (
                        <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {template.estimated_budget && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            <span>${template.estimated_budget.toLocaleString()}</span>
                          </div>
                        )}
                        {template.estimated_hours && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{template.estimated_hours}h</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="outline" size="sm" onClick={() => duplicateTemplate(template)}>
                        <Copy className="w-3 h-3 mr-1" />
                        Duplicate
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(template)}>
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this template?')) {
                            deleteTemplate(template.id);
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-muted/30 rounded p-3">
                    <p className="text-sm font-medium mb-1">Template Content:</p>
                    <div className="text-sm text-muted-foreground whitespace-pre-wrap max-h-32 overflow-y-auto">
                      {formatContent(template.content)}
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