import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import InsightCard from "@/components/InsightCard";
import StatCard from "@/components/StatCard";
import { mockStaffList, getDepartmentAIInsights, mockDepartmentStats } from "@/data/mockData";
import { useCollege } from "@/contexts/CollegeContext";
import { useTodo } from "@/contexts/TodoContext";
import { Brain, BarChart3, Users, Plus, Trash2, CheckCircle2, Circle, TrendingUp, TrendingDown, Zap, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StaffPerformanceInsight {
  staffName: string;
  subject: string;
  performanceScore: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  strengths: string[];
  improvementAreas: string[];
  syllabusCompletion: number;
}

interface DepartmentPrediction {
  metric: string;
  currentValue: number;
  predictedValue: number;
  confidence: number;
  factors: string[];
  recommendations: string[];
}

interface ClassPerformancePrediction {
  year: string;
  sections: {
    name: string;
    currentMarks: number;
    predictedMarks: number;
    currentAttendance: number;
    predictedAttendance: number;
    studentCount: number;
    trend: 'UP' | 'DOWN' | 'STABLE';
  }[];
  bestSection: {
    name: string;
    reason: string;
  };
  confidence: number;
}

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

  const staffPerformanceInsights: StaffPerformanceInsight[] = [
    {
      staffName: "Prof. Anita Sharma",
      subject: "Programming in C",
      performanceScore: 92,
      trend: 'UP',
      strengths: ["Excellent student engagement", "High syllabus completion", "Innovative teaching methods"],
      improvementAreas: ["Could increase practical sessions"],
      syllabusCompletion: 95
    },
    {
      staffName: "Prof. Vikram Patel",
      subject: "Data Structures",
      performanceScore: 78,
      trend: 'DOWN',
      strengths: ["Strong theoretical knowledge", "Good assessment design"],
      improvementAreas: ["Student engagement needs improvement", "Slower syllabus pace"],
      syllabusCompletion: 72
    },
    {
      staffName: "Prof. Meera Iyer",
      subject: "Database Systems",
      performanceScore: 85,
      trend: 'STABLE',
      strengths: ["Consistent performance", "Good practical approach"],
      improvementAreas: ["Could use more interactive tools"],
      syllabusCompletion: 88
    }
  ];

  const [selectedYear, setSelectedYear] = useState("");

  // Mock class performance data
  const classPerformanceData: Record<string, ClassPerformancePrediction> = {
    "1st Year": {
      year: "1st Year",
      sections: [
        {
          name: "A",
          currentMarks: 85,
          predictedMarks: 87,
          currentAttendance: 90,
          predictedAttendance: 92,
          studentCount: 8,
          trend: 'UP'
        },
        {
          name: "B",
          currentMarks: 78,
          predictedMarks: 80,
          currentAttendance: 85,
          predictedAttendance: 87,
          studentCount: 8,
          trend: 'UP'
        }
      ],
      bestSection: {
        name: "A",
        reason: "Higher marks (87% vs 80%) and better attendance (92% vs 87%)"
      },
      confidence: 88
    },
    "2nd Year": {
      year: "2nd Year",
      sections: [
        {
          name: "A",
          currentMarks: 88,
          predictedMarks: 91,
          currentAttendance: 92,
          predictedAttendance: 94,
          studentCount: 8,
          trend: 'UP'
        },
        {
          name: "B",
          currentMarks: 83,
          predictedMarks: 85,
          currentAttendance: 88,
          predictedAttendance: 90,
          studentCount: 8,
          trend: 'STABLE'
        }
      ],
      bestSection: {
        name: "A",
        reason: "Consistently higher performance in both marks (91% vs 85%) and attendance (94% vs 90%)"
      },
      confidence: 92
    },
    "3rd Year": {
      year: "3rd Year",
      sections: [
        {
          name: "A",
          currentMarks: 82,
          predictedMarks: 84,
          currentAttendance: 85,
          predictedAttendance: 87,
          studentCount: 8,
          trend: 'STABLE'
        },
        {
          name: "B",
          currentMarks: 84,
          predictedMarks: 86,
          currentAttendance: 86,
          predictedAttendance: 88,
          studentCount: 8,
          trend: 'UP'
        }
      ],
      bestSection: {
        name: "B",
        reason: "Better predicted performance with marks (86% vs 84%) and attendance (88% vs 87%)"
      },
      confidence: 86
    },
    "4th Year": {
      year: "4th Year",
      sections: [
        {
          name: "A",
          currentMarks: 90,
          predictedMarks: 93,
          currentAttendance: 94,
          predictedAttendance: 96,
          studentCount: 8,
          trend: 'UP'
        },
        {
          name: "B",
          currentMarks: 85,
          predictedMarks: 87,
          currentAttendance: 89,
          predictedAttendance: 91,
          studentCount: 8,
          trend: 'UP'
        }
      ],
      bestSection: {
        name: "A",
        reason: "Excellent performance with highest marks (93% vs 87%) and attendance (96% vs 91%)"
      },
      confidence: 94
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'UP': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'DOWN': return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'STABLE': return <BarChart3 className="w-4 h-4 text-blue-600" />;
      default: return null;
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-foreground mb-1">AI-Powered Department Analytics</h1>
      <p className="text-muted-foreground text-sm mb-8">Strategic insights and predictive analytics for department excellence</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <StatCard title="Dept. Performance" value={`${mockDepartmentStats.avgAttendance}%`} icon={BarChart3} variant="primary" />
        <StatCard title="Active Staff" value={mockDepartmentStats.totalStaff} icon={Users} variant="success" />
      </div>

      <div className="mb-2"></div>

      {/* Year Selection - Centered with Gradient Border */}
      <div className="flex justify-center mb-8">
        <div className="relative">
          {/* Gradient Border Container */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
          <div className="relative bg-white dark:bg-gray-900 rounded-xl p-6 shadow-2xl">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 bg-clip-text text-transparent">
                Select Academic Year
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Choose a year to view section performance predictions</p>
            </div>
            <div className="min-w-[300px]">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="h-12 text-base border-2 border-gray-200 hover:border-purple-400 transition-colors duration-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200">
                  <SelectValue placeholder="Select Academic Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1st Year" className="text-base py-3">1st Year</SelectItem>
                  <SelectItem value="2nd Year" className="text-base py-3">2nd Year</SelectItem>
                  <SelectItem value="3rd Year" className="text-base py-3">3rd Year</SelectItem>
                  <SelectItem value="4th Year" className="text-base py-3">4th Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Class Performance Predictions */}
      {selectedYear && classPerformanceData[selectedYear] && (
        <Card className="shadow-card mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-600" />
                {selectedYear} - Section Performance Analysis
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedYear("")}
                className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 transition-colors duration-200"
                title="Close Analysis"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Best Section Prediction */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-green-800">
                    🏆 Predicted Best Performing Section: {classPerformanceData[selectedYear].bestSection.name}
                  </h3>
                  <Badge variant="default" className="bg-green-600">
                    {classPerformanceData[selectedYear].confidence}% Confidence
                  </Badge>
                </div>
                <p className="text-sm text-green-700">
                  <strong>Reason:</strong> {classPerformanceData[selectedYear].bestSection.reason}
                </p>
              </div>

              {/* Section Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classPerformanceData[selectedYear].sections.map((section, i) => {
                  const isWinner = section.name === classPerformanceData[selectedYear].bestSection.name;
                  return (
                    <div key={i} className={`border rounded-lg p-4 ${
                      isWinner ? 'border-green-300 bg-green-50' : 'border-border bg-card'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-lg font-bold text-foreground flex items-center gap-2">
                          Section {section.name}
                          {isWinner && <Badge variant="default" className="bg-green-600 text-xs">WINNER</Badge>}
                        </h4>
                        {getTrendIcon(section.trend)}
                      </div>
                      
                      <div className="space-y-3">
                        {/* Marks Comparison */}
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-foreground">Average Marks</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Current: {section.currentMarks}%</span>
                              <span className="text-sm font-bold text-blue-600">Predicted: {section.predictedMarks}%</span>
                            </div>
                          </div>
                          <Progress value={section.predictedMarks} className="h-2" />
                        </div>

                        {/* Attendance Comparison */}
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-foreground">Attendance</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Current: {section.currentAttendance}%</span>
                              <span className="text-sm font-bold text-green-600">Predicted: {section.predictedAttendance}%</span>
                            </div>
                          </div>
                          <Progress value={section.predictedAttendance} className="h-2" />
                        </div>

                        {/* Student Count */}
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-foreground">Students</span>
                          <span className="text-sm font-bold text-foreground">{section.studentCount}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Performance Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-bold text-blue-800 mb-2">📊 Performance Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Highest Predicted Marks: </span>
                    <span className="font-bold text-blue-800">
                      Section {classPerformanceData[selectedYear].sections.reduce((prev, current) => 
                        prev.predictedMarks > current.predictedMarks ? prev : current
                      ).name} ({Math.max(...classPerformanceData[selectedYear].sections.map(s => s.predictedMarks))}%)
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700">Highest Predicted Attendance: </span>
                    <span className="font-bold text-blue-800">
                      Section {classPerformanceData[selectedYear].sections.reduce((prev, current) => 
                        prev.predictedAttendance > current.predictedAttendance ? prev : current
                      ).name} ({Math.max(...classPerformanceData[selectedYear].sections.map(s => s.predictedAttendance))}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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

        {/* Original AI Insights */}
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