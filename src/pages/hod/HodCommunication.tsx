import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { mockMessages, mockStaffList } from "@/data/mockData";
import { Send, Megaphone } from "lucide-react";

const HodCommunication: React.FC = () => {
  const [recipient, setRecipient] = useState("all");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => { setSent(false); setSubject(""); setBody(""); setRecipient("all"); }, 2000);
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-foreground mb-1">Communication</h1>
      <p className="text-muted-foreground text-sm mb-8">Send messages and announcements</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compose */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Send className="w-4 h-4 text-primary" /> Compose Message
          </h2>
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">To</label>
              <select value={recipient} onChange={(e) => setRecipient(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring/30">
                <option value="all">All Staff</option>
                {mockStaffList.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Subject</label>
              <input value={subject} onChange={(e) => setSubject(e.target.value)} required
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring/30" placeholder="Message subject" />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Message</label>
              <textarea value={body} onChange={(e) => setBody(e.target.value)} required rows={4}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 resize-none" placeholder="Type your message..." />
            </div>
            <button type="submit" disabled={sent}
              className="w-full py-2.5 px-4 rounded-lg bg-gradient-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
              {sent ? "✓ Sent!" : "Send Message"}
            </button>
          </form>
        </div>

        {/* History */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-warning" /> Sent Messages
          </h2>
          <div className="space-y-3">
            {mockMessages.map((msg) => (
              <div key={msg.id} className="bg-card border border-border rounded-xl p-4 shadow-card">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-medium text-foreground">{msg.subject}</h3>
                  <span className="text-[11px] text-muted-foreground">{msg.date}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-1">{msg.body}</p>
                <p className="text-[11px] text-muted-foreground/50">To: {msg.to}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HodCommunication;
