import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useStaff } from "@/contexts/StaffContext";
import { Send, Megaphone, Loader2, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string | null;
  subject: string;
  body: string;
  is_broadcast: boolean;
  created_at: string;
}

const HodCommunication: React.FC = () => {
  const { user } = useAuth();
  const { staffList } = useStaff();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [recipient, setRecipient] = useState("all");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("sender_id", user?.id)
      .order("created_at", { ascending: false });
    setMessages(data || []);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim() || !user?.id) return;
    setSending(true);

    const isBroadcast = recipient === "all";

    if (isBroadcast) {
      // Send to all non-HOD staff
      const nonHodStaff = staffList.filter(s => s.role !== "ROLE_HOD");
      await Promise.all(nonHodStaff.map(s =>
        supabase.from("messages").insert({
          sender_id: user.id,
          recipient_id: s.id,
          subject: subject.trim(),
          body: body.trim(),
          is_broadcast: true,
        })
      ));
    } else {
      await supabase.from("messages").insert({
        sender_id: user.id,
        recipient_id: recipient,
        subject: subject.trim(),
        body: body.trim(),
        is_broadcast: false,
      });
    }

    toast({ title: "Message Sent", description: isBroadcast ? "Sent to all staff." : `Sent to ${staffList.find(s => s.id === recipient)?.name}` });
    setSubject(""); setBody(""); setRecipient("all");
    setSending(false);
    fetchMessages();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("messages").delete().eq("id", id);
    toast({ title: "Message Deleted" });
    fetchMessages();
  };

  const getRecipientName = (msg: Message) => {
    if (msg.is_broadcast) return "All Staff";
    const staff = staffList.find(s => s.id === msg.recipient_id);
    return staff?.name || "Unknown";
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-foreground mb-1">Communication</h1>
      <p className="text-muted-foreground text-sm mb-8">Send messages and announcements to staff</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compose */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Send className="w-4 h-4 text-primary" /> Compose Message
          </h2>
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">To</label>
              <select value={recipient} onChange={e => setRecipient(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring/30">
                <option value="all">📢 All Staff (Broadcast)</option>
                {staffList.filter(s => s.role !== "ROLE_HOD").map(s =>
                  <option key={s.id} value={s.id}>{s.name}</option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Subject</label>
              <input value={subject} onChange={e => setSubject(e.target.value)} required
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
                placeholder="Message subject" />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Message</label>
              <textarea value={body} onChange={e => setBody(e.target.value)} required rows={4}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 resize-none"
                placeholder="Type your message..." />
            </div>
            <button type="submit" disabled={sending}
              className="w-full py-2.5 px-4 rounded-lg bg-gradient-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {sending ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>

        {/* Sent Messages */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-warning" /> Sent Messages
          </h2>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : messages.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center shadow-card">
              <Megaphone className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No messages sent yet.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {messages.map(msg => (
                <div key={msg.id} className="bg-card border border-border rounded-xl p-4 shadow-card">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-sm font-medium text-foreground">{msg.subject}</h3>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(msg.created_at).toLocaleDateString()}
                      </span>
                      <button onClick={() => handleDelete(msg.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{msg.body}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${msg.is_broadcast ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary"}`}>
                      {msg.is_broadcast ? "Broadcast" : "Personal"}
                    </span>
                    <span className="text-[11px] text-muted-foreground">To: {getRecipientName(msg)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HodCommunication;
