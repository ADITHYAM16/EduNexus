import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { mockMessages } from "@/data/mockData";
import { Megaphone, User } from "lucide-react";

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
  const [messages] = useState<Message[]>([...mockMessages]);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-foreground">Messages</h1>
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

    </DashboardLayout>
  );
};

export default StaffMessages;
