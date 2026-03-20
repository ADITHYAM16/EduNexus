import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { mockMessages } from "@/data/mockData";
import { Megaphone, User, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  date: string;
  type: "announcement" | "personal";
}

const StaffMessages: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([...mockMessages]);
  const [showCreate, setShowCreate] = useState(false);
  const [newMsg, setNewMsg] = useState({ subject: "", body: "", type: "personal" as "personal" | "announcement" });
  const { toast } = useToast();

  const handleSend = () => {
    if (!newMsg.subject.trim() || !newMsg.body.trim()) {
      toast({ title: "Missing fields", description: "Please fill in subject and body.", variant: "destructive" });
      return;
    }
    const msg: Message = {
      id: `m${Date.now()}`,
      from: "Prof. Anita Sharma",
      to: newMsg.type === "announcement" ? "All Staff" : "Dr. Rajesh Kumar (HOD)",
      subject: newMsg.subject.trim(),
      body: newMsg.body.trim(),
      date: new Date().toISOString().split("T")[0],
      type: newMsg.type,
    };
    setMessages([msg, ...messages]);
    setNewMsg({ subject: "", body: "", type: "personal" });
    setShowCreate(false);
    toast({ title: "Message sent", description: `Your ${newMsg.type} has been sent.` });
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-foreground">Messages</h1>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Compose
        </button>
      </div>
      <p className="text-muted-foreground text-sm mb-8">Communication from HOD</p>

      <div className="space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className="bg-card border border-border rounded-xl p-5 shadow-card animate-fade-in">
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                msg.type === "announcement" ? "bg-warning/10" : "bg-primary/10"
              }`}>
                {msg.type === "announcement" ? <Megaphone className="w-5 h-5 text-warning" /> : <User className="w-5 h-5 text-primary" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-foreground">{msg.subject}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${
                    msg.type === "announcement" ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary"
                  }`}>
                    {msg.type === "announcement" ? "Announcement" : "Personal"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{msg.body}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground/60">
                  <span>{msg.from}</span> · <span>{msg.date}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Compose Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Compose Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Type</Label>
              <div className="flex gap-2 mt-1.5">
                <button onClick={() => setNewMsg({ ...newMsg, type: "personal" })}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    newMsg.type === "personal" ? "bg-primary/10 border-primary text-primary" : "border-border text-muted-foreground hover:bg-muted/40"
                  }`}>
                  <User className="w-4 h-4 inline mr-1.5" /> Personal
                </button>
                <button onClick={() => setNewMsg({ ...newMsg, type: "announcement" })}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    newMsg.type === "announcement" ? "bg-warning/10 border-warning text-warning" : "border-border text-muted-foreground hover:bg-muted/40"
                  }`}>
                  <Megaphone className="w-4 h-4 inline mr-1.5" /> Announcement
                </button>
              </div>
            </div>
            <div>
              <Label htmlFor="msg-subject">Subject</Label>
              <Input id="msg-subject" placeholder="Message subject" value={newMsg.subject}
                onChange={(e) => setNewMsg({ ...newMsg, subject: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="msg-body">Message</Label>
              <Textarea id="msg-body" placeholder="Type your message..." rows={4} value={newMsg.body}
                onChange={(e) => setNewMsg({ ...newMsg, body: e.target.value })} />
            </div>
            <button onClick={handleSend}
              className="w-full px-4 py-2.5 rounded-lg bg-gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
              Send Message
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default StaffMessages;
