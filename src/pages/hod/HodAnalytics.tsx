import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import InsightCard from "@/components/InsightCard";
import StatCard from "@/components/StatCard";
import { mockStaffList, getDepartmentAIInsights, mockDepartmentStats } from "@/data/mockData";
import { useCollege } from "@/contexts/CollegeContext";
import { useTodo } from "@/contexts/TodoContext";
import { Brain, BarChart3, Users, Plus, Trash2, CheckCircle2, Circle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const HodAnalytics: React.FC = () => {
  const { departments } = useCollege();
  const insights = getDepartmentAIInsights(mockStaffList);
  const { todos, addTodo: addTodoCtx, toggleTodo, deleteTodo } = useTodo();
  const [newTodo, setNewTodo] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const addTodo = () => {
    if (!newTodo.trim()) return;
    addTodoCtx(newTodo.trim());
    setNewTodo("");
    setShowAdd(false);
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-foreground mb-1">AI-Powered Department Analytics</h1>
      <p className="text-muted-foreground text-sm mb-8">Strategic insights and predictive analytics for department excellence</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <StatCard title="Dept. Performance" value={`${mockDepartmentStats.avgAttendance}%`} icon={BarChart3} variant="primary" />
        <StatCard title="Active Staff" value={mockDepartmentStats.totalStaff} icon={Users} variant="success" />
      </div>

      <div className="grid grid-cols-1 gap-6 mb-6">
        {/* To-Do List */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">📋 Strategic To-Do List</h2>
            <Button size="sm" onClick={() => setShowAdd(true)} className="gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Add Task
            </Button>
          </div>

          {todos.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">No tasks yet. Create one!</p>
          )}

          <div className="space-y-2">
            {todos.map((todo) => (
              <div
                key={todo.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  todo.done ? "bg-muted/30 border-border/50" : "bg-background border-border"
                }`}
              >
                <button onClick={() => toggleTodo(todo.id)} className="shrink-0">
                  {todo.done
                    ? <CheckCircle2 className="w-5 h-5 text-success" />
                    : <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                  }
                </button>
                <span className={`flex-1 text-sm ${todo.done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                  {todo.text}
                </span>
                <button onClick={() => deleteTodo(todo.id)} className="shrink-0 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-3 text-xs text-muted-foreground">
            {todos.filter((t) => t.done).length}/{todos.length} completed
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" /> Department Performance Insights
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {insights.map((insight, i) => (
              <InsightCard key={i} type={insight.type} message={insight.message} />
            ))}
          </div>
        </div>
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input
              placeholder="Enter task description..."
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTodo()}
              autoFocus
            />
            <Button onClick={addTodo} className="w-full">Add Task</Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default HodAnalytics;
