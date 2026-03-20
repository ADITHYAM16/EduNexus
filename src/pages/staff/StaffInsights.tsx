import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import InsightCard from "@/components/InsightCard";
import { getAIInsights } from "@/data/mockData";
import { Brain, Plus, Trash2, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Todo {
  id: number;
  text: string;
  done: boolean;
}

const StaffInsights: React.FC = () => {
  const insights = getAIInsights(88, 72);
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: "Complete Unit 3 lab report", done: false },
    { id: 2, text: "Prepare quiz for next week", done: false },
    { id: 3, text: "Update attendance records", done: true },
  ]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState("");

  const addTodo = () => {
    if (!newTask.trim()) return;
    setTodos([...todos, { id: Date.now(), text: newTask.trim(), done: false }]);
    setNewTask("");
    setDialogOpen(false);
  };

  const toggleTodo = (id: number) => setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const deleteTodo = (id: number) => setTodos(todos.filter(t => t.id !== id));

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-foreground mb-1">AI Insights & Tasks</h1>
      <p className="text-muted-foreground text-sm mb-8">AI-powered analysis and your task list</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Insights */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Performance Analysis</h2>
              <p className="text-xs text-muted-foreground">Based on your data</p>
            </div>
          </div>
          <div className="space-y-3">
            {insights.map((insight, i) => (
              <InsightCard key={i} type={insight.type} message={insight.message} />
            ))}
          </div>
          <div className="mt-4 bg-muted/30 border border-border rounded-lg p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">Recommendations</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><span>•</span> Complete Unit 3 topics to reach 80% syllabus target</li>
              <li className="flex items-start gap-2"><span>•</span> Maintain current attendance streak for 3 more weeks</li>
              <li className="flex items-start gap-2"><span>•</span> Submit pending lab reports before deadline</li>
            </ul>
          </div>
        </div>

        {/* To-Do List */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">My To-Do List</h2>
            <button
              onClick={() => setDialogOpen(true)}
              className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            {todos.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No tasks yet</p>}
            {todos.map((todo) => (
              <div key={todo.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${todo.done ? "bg-muted/30 border-border" : "bg-muted/10 border-border"}`}>
                <button onClick={() => toggleTodo(todo.id)} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${todo.done ? "bg-success border-success" : "border-muted-foreground/40 hover:border-primary"}`}>
                  {todo.done && <Check className="w-3 h-3 text-success-foreground" />}
                </button>
                <span className={`flex-1 text-sm ${todo.done ? "line-through text-muted-foreground" : "text-foreground"}`}>{todo.text}</span>
                <button onClick={() => deleteTodo(todo.id)} className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">{todos.filter(t => t.done).length}/{todos.length} completed</p>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <Input placeholder="Task description..." value={newTask} onChange={(e) => setNewTask(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTodo()} />
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={addTodo}>Add Task</Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default StaffInsights;
