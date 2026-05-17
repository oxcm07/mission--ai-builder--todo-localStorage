import type { ThemeMode, TodoItem } from "@/types/todo";

export const TODO_STORAGE_KEY = "next-todo-app-items";
export const THEME_STORAGE_KEY = "next-todo-app-theme";

export function parseStoredTodos(rawValue: string | null): TodoItem[] {
  if (!rawValue) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(rawValue);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.flatMap((item) => {
      if (!isTodoItem(item)) {
        return [];
      }

      return [item];
    });
  } catch {
    return [];
  }
}

export function parseStoredTheme(rawValue: string | null): ThemeMode | null {
  if (rawValue === "light" || rawValue === "dark") {
    return rawValue;
  }

  return null;
}

function isTodoItem(item: unknown): item is TodoItem {
  if (!item || typeof item !== "object") {
    return false;
  }

  const candidate = item as Record<string, unknown>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.text === "string" &&
    typeof candidate.completed === "boolean" &&
    typeof candidate.createdAt === "number" &&
    typeof candidate.updatedAt === "number"
  );
}
