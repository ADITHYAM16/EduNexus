import React, { createContext, useContext, useState } from "react";

export interface TodoItem {
  id: string;
  text: string;
  done: boolean;
}

interface TodoContextType {
  todos: TodoItem[];
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
}

const TodoContext = createContext<TodoContextType | null>(null);

export const TodoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [todos, setTodos] = useState<TodoItem[]>([
    { id: "1", text: "Review staff attendance reports", done: false },
    { id: "2", text: "Update syllabus targets for next semester", done: false },
    { id: "3", text: "Schedule faculty meeting", done: false },
    { id: "4", text: "Check pending student assessments", done: false },
    { id: "5", text: "Submit department progress report", done: false },
  ]);

  const addTodo = (text: string) =>
    setTodos(prev => [...prev, { id: Date.now().toString(), text, done: false }]);

  const toggleTodo = (id: string) =>
    setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));

  const deleteTodo = (id: string) =>
    setTodos(prev => prev.filter(t => t.id !== id));

  return (
    <TodoContext.Provider value={{ todos, addTodo, toggleTodo, deleteTodo }}>
      {children}
    </TodoContext.Provider>
  );
};

export const useTodo = () => {
  const ctx = useContext(TodoContext);
  if (!ctx) throw new Error("useTodo must be used within TodoProvider");
  return ctx;
};
