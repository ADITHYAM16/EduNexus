import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Megaphone, User, Loader2, MailOpen } from "lucide-react";

interface Message {
  id: string;
  sender_id: string;
  subject: string;
  body: string;
  is_broadcast: boolean;
  is_read: boolean;
  created_at: string;
}

const StaffMessages: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data } = await supabase
      .from("messages")
      .select("id,sender_id,subject,body,is_broadcast,is_read,created_at")
      .eq("recipient_id", user.id)
      .order("created_at", { ascending: false });
    setMessages(data || []);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const markAsRead = async (id: string) => {
    await supabase.from("messages").update({ is_read: true }).eq("id", id);
    setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m));
  };

  const unreadCount = messages.filter(m => !m.is_read).length;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-foreground">Messages</h1>
        {unreadCount > 0 && (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-primary text-primary-foreground">
            {unreadCount} unread
          </span>
        )}
      </div>
      <p className="text-muted-foreground text-sm mb-8">Messages and announcements from HOD</p>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
        </div>
      ) : messages.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center shadow-card">
          <MailOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">No messages yet</p>
          <p className="text-xs text-muted-foreground">Messages from your HOD will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map(msg => (
            <div
              key={msg.id}
              onClick={() => !msg.is_read && markAsRead(msg.id)}
              className={`bg-card border rounded-xl p-5 shadow-card cursor-pointer transition-all ${
                !msg.is_read ? "border-primary/40 bg-primary/5" : "border-border"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  msg.is_broadcast ? "bg-warning/10" : "bg-primary/10"
                }`}>
                  {msg.is_broadcast
                    ? <Megaphone className="w-5 h-5 text-warning" />
                    : <User className="w-5 h-5 text-primary" />
                  }
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className={`text-sm font-semibold text-foreground ${!msg.is_read ? "text-primary" : ""}`}>
                      {msg.subject}
                    </h3>
                    <div className="flex items-center gap-2 shrink-0">
                      {!msg.is_read && (
                        <span className="w-2 h-2 rounded-full bg-primary" />
                      )}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        msg.is_broadcast ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary"
                      }`}>
                        {msg.is_broadcast ? "Announcement" : "Personal"}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{msg.body}</p>
                  <p className="text-[11px] text-muted-foreground/60 mt-2">
                    {new Date(msg.created_at).toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default StaffMessages;
