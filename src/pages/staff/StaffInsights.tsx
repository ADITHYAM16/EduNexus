import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import InsightCard from "@/components/InsightCard";
import { useAuth } from "@/contexts/AuthContext";
import { useCollege } from "@/contexts/CollegeContext";
import { getAIInsights } from "@/data/mockData";
import { Brain, Plus, Trash2, Check, Users, BookOpen, TrendingUp, AlertTriangle, Lightbulb, Target, Clock, Award } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Todo {
  id: number;
  text: string;
  done: boolean;
}

interface StudentRiskPrediction {
  studentName: string;
  rollNo: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  predictedGrade: number;
  passLikelihood: number;
  issues: string[];
  recommendations: string[];
}

interface TeachingInsight {
  metric: string;
  value: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  suggestion: string;
}

const StaffInsights: React.FC = () => {
  const { user } = useAuth();
  const { getStaffAssignments } = useCollege();
  const assignments = getStaffAssignments(user?.id || "");
  const insights = getAIInsights(88, 72);
  
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: "Complete Unit 3 lab report", done: false },
    { id: 2, text: "Prepare quiz for next week", done: false },
    { id: 3, text: "Update attendance records", done: true },
  ]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState("");

  // Mock AI-generated data for teacher insights
  const studentRiskPredictions: StudentRiskPrediction[] = [
    {
      studentName: "Rahul Joshi",
      rollNo: "CS011",
      riskLevel: 'HIGH',
      predictedGrade: 45,
      passLikelihood: 35,
      issues: ["Declining attendance", "Poor CIAT 2 performance", "Missing assignments"],
      recommendations: ["Schedule one-on-one session", "Provide additional practice materials", "Contact parents"]
    },
    {
      studentName: "Kavya Rao",
      rollNo: "CS012",
      riskLevel: 'MEDIUM',
      predictedGrade: 62,
      passLikelihood: 70,
      issues: ["Inconsistent performance", "Weak in practical sessions"],
      recommendations: ["Focus on hands-on practice", "Pair with strong peer for group work"]
    },
    {
      studentName: "Anjali Kumar",
      rollNo: "CS010",
      riskLevel: 'LOW',
      predictedGrade: 85,
      passLikelihood: 95,
      issues: [],
      recommendations: ["Consider for advanced topics", "Potential peer mentor"]
    }
  ];

  const teachingInsights: TeachingInsight[] = [];

  const addTodo = () => {
    if (!newTask.trim()) return;
    setTodos([...todos, { id: Date.now(), text: newTask.trim(), done: false }]);
    setNewTask("");
    setDialogOpen(false);
  };

  const toggleTodo = (id: number) => setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const deleteTodo = (id: number) => setTodos(todos.filter(t => t.id !== id));

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'destructive';
      case 'HIGH': return 'destructive';
      case 'MEDIUM': return 'secondary';
      case 'LOW': return 'default';
      default: return 'default';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'UP': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'DOWN': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'STABLE': return <Target className="w-4 h-4 text-blue-600" />;
      default: return null;
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-foreground mb-1">AI Teaching Assistant</h1>
      <p className="text-muted-foreground text-sm mb-8">AI-powered insights to enhance your teaching effectiveness</p>

      <div className="grid grid-cols-1 gap-6 mb-6">
        {/* Student Risk Predictions */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Student Risk Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {studentRiskPredictions.map((student, i) => (
                <div key={i} className="border border-border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="text-sm font-medium text-foreground">{student.studentName}</h4>
                      <p className="text-xs text-muted-foreground">{student.rollNo}</p>
                    </div>
                    <Badge variant={getRiskColor(student.riskLevel)} className="text-xs">
                      {student.riskLevel} RISK
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="text-xs">
                      <span className="text-muted-foreground">Predicted Grade: </span>
                      <span className={`font-medium ${student.predictedGrade >= 60 ? 'text-green-600' : 'text-red-600'}`}>
                        {student.predictedGrade}%
                      </span>
                    </div>
                    <div className="text-xs">
                      <span className="text-muted-foreground">Pass Likelihood: </span>
                      <span className={`font-medium ${student.passLikelihood >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                        {student.passLikelihood}%
                      </span>
                    </div>
                  </div>
                  {student.issues.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs font-medium text-foreground mb-1">Issues:</p>
                      <div className="flex flex-wrap gap-1">
                        {student.issues.map((issue, j) => (
                          <Badge key={j} variant="outline" className="text-xs">{issue}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-medium text-foreground mb-1">AI Recommendations:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {student.recommendations.map((rec, j) => (
                        <li key={j} className="flex items-start gap-1">
                          <Lightbulb className="w-3 h-3 text-yellow-500 mt-0.5 shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Original AI Insights */}
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
