export type TodoItem = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  updatedAt: number;
};

export type TodoFilter = "all" | "active" | "completed";

export type ThemeMode = "light" | "dark";
