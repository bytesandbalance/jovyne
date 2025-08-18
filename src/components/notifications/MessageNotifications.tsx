import { useState, useEffect } from 'react';
import { Bell, Mail, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  sender_id: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
  profiles: {
    full_name: string;
    avatar_url?: string;
  } | null;
}

export function MessageNotifications() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMessages();
      
      // Set up real-time subscription for new messages
      const channel = supabase
        .channel('new-messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `recipient_id=eq.${user.id}`
          },
          (payload) => {
            fetchMessages();
            toast({
              title: "New message! 📬",
              description: "You have received a new message"
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchMessages = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // First get the messages
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select('*')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Then get the sender profiles separately
      if (messagesData && messagesData.length > 0) {
        const senderIds = [...new Set(messagesData.map(m => m.sender_id))];
        const { data: profilesData } = await supabase
          .rpc('get_public_profiles', { user_ids: senderIds });

        // Combine messages with profiles
        const messagesWithProfiles = messagesData.map(message => ({
          ...message,
          profiles: profilesData?.find(p => p.user_id === message.sender_id) || null
        }));

        setMessages(messagesWithProfiles as Message[]);
        setUnreadCount(messagesWithProfiles.filter(m => !m.is_read).length);
      } else {
        setMessages([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId);

      if (error) throw error;

      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, is_read: true } : msg
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('recipient_id', user?.id)
        .eq('is_read', false);

      if (error) throw error;

      setMessages(prev => 
        prev.map(msg => ({ ...msg, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all messages as read:', error);
    }
  };

  const handleNotificationClick = async (message: Message) => {
    // Mark as read
    if (!message.is_read) {
      markAsRead(message.id);
    }

    // Get user profile to determine role
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_role')
      .eq('user_id', user?.id)
      .single();

    // Navigate to specific dashboard tab based on message subject and user role
    // Check for invoice-related messages first (more specific)
    if (message.subject.toLowerCase().includes('invoice') || 
       message.subject.toLowerCase().includes('payment') || 
       message.subject.toLowerCase().includes('paid') || 
       message.subject.toLowerCase().includes('billing') || 
       message.subject.toLowerCase().includes('amount') || 
       message.subject.toLowerCase().includes('due') || 
       message.subject.toLowerCase().includes('bill')) {
      navigate('/dashboard?tab=invoicing');
    } else if (message.subject.toLowerCase().includes('application')) {
      navigate('/dashboard?tab=applications'); // Both helpers and planners have applications tab
    } else {
      // Default navigation
      navigate('/dashboard');
    }
  };

  if (!user) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Messages</CardTitle>
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  Mark all read
                </Button>
              )}
            </div>
          </CardHeader>
          
          <Separator />
          
          <CardContent className="p-0">
            <ScrollArea className="h-80">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : messages.length > 0 ? (
                <div className="space-y-1">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-3 hover:bg-muted cursor-pointer border-l-2 ${
                        message.is_read ? 'border-l-transparent' : 'border-l-primary bg-primary/5'
                      }`}
                      onClick={() => !message.is_read && markAsRead(message.id)}
                    >
                       <div className="flex items-start gap-3">
                         <Mail className="w-4 h-4 mt-1 text-muted-foreground" />
                         <div className="flex-1 min-w-0">
                           <div className="flex items-center gap-2">
                             <p className="text-sm font-medium truncate">
                               {message.profiles?.full_name || 'Unknown User'}
                             </p>
                             {!message.is_read && (
                               <div className="w-2 h-2 bg-primary rounded-full" />
                             )}
                           </div>
                           <button 
                             className="text-left w-full hover:bg-muted/50 rounded p-1 -m-1"
                             onClick={() => handleNotificationClick(message)}
                           >
                             <p className="text-sm font-medium text-primary truncate hover:underline">
                               {message.subject}
                             </p>
                             <p className="text-xs text-muted-foreground truncate">
                               {message.message}
                             </p>
                             <p className="text-xs text-muted-foreground mt-1">
                               {new Date(message.created_at).toLocaleDateString()}
                             </p>
                           </button>
                         </div>
                       </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Mail className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No messages yet</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}