import React from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  variant?: "default" | "primary" | "success" | "warning" | "danger";
  linkTo?: string;
}

const variantStyles = {
  default: "bg-card border border-border",
  primary: "bg-primary/5 border border-primary/20",
  success: "bg-success/5 border border-success/20",
  warning: "bg-warning/5 border border-warning/20",
  danger: "bg-destructive/5 border border-destructive/20",
};

const iconVariantStyles = {
  default: "bg-muted text-muted-foreground",
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-destructive/10 text-destructive",
};

const StatCard: React.FC<StatCardProps> = ({
  title, value, subtitle, icon: Icon, trend, trendValue, variant = "default", linkTo,
}) => {
  const navigate = useNavigate();
  const handleClick = () => { if (linkTo) navigate(linkTo); };

  return (
    <div
      onClick={handleClick}
      className={`rounded-xl p-5 shadow-card animate-fade-in ${variantStyles[variant]} ${linkTo ? "cursor-pointer hover:scale-[1.02] transition-transform" : ""}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-card-foreground">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconVariantStyles[variant]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {trend && trendValue && (
        <div className="mt-3 flex items-center gap-1.5">
          {trend === "up" && <TrendingUp className="w-3.5 h-3.5 text-success" />}
          {trend === "down" && <TrendingDown className="w-3.5 h-3.5 text-destructive" />}
          {trend === "neutral" && <Minus className="w-3.5 h-3.5 text-muted-foreground" />}
          <span className={`text-xs font-medium ${
            trend === "up" ? "text-success" : trend === "down" ? "text-destructive" : "text-muted-foreground"
          }`}>
            {trendValue}
          </span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
