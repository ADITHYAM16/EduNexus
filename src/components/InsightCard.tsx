import React from "react";
import { AlertCircle, CheckCircle2, AlertTriangle, Info } from "lucide-react";

interface InsightCardProps {
  type: "success" | "warning" | "danger" | "info";
  message: string;
}

const styles = {
  success: { bg: "bg-success/5 border-success/20", hover: "hover:bg-success/10 hover:border-success/40 hover:shadow-elevated hover:scale-[1.02]", icon: CheckCircle2, iconColor: "text-success" },
  warning: { bg: "bg-warning/5 border-warning/20", hover: "hover:bg-warning/10 hover:border-warning/40 hover:shadow-elevated hover:scale-[1.02]", icon: AlertTriangle, iconColor: "text-warning" },
  danger:  { bg: "bg-destructive/5 border-destructive/20", hover: "hover:bg-destructive/10 hover:border-destructive/40 hover:shadow-elevated hover:scale-[1.02]", icon: AlertCircle, iconColor: "text-destructive" },
  info:    { bg: "bg-info/5 border-info/20", hover: "hover:bg-info/10 hover:border-info/40 hover:shadow-elevated hover:scale-[1.02]", icon: Info, iconColor: "text-info" },
};

const InsightCard: React.FC<InsightCardProps> = ({ type, message }) => {
  const { bg, hover, icon: Icon, iconColor } = styles[type];
  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border ${bg} ${hover} animate-fade-in transition-all duration-200 cursor-default`}>
      <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${iconColor}`} />
      <p className="text-sm text-card-foreground">{message}</p>
    </div>
  );
};

export default InsightCard;
