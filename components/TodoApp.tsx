"use client";

import { ChangeEvent, FormEvent, KeyboardEvent, useEffect, useMemo, useState } from "react";
import type { ThemeMode, TodoFilter, TodoItem } from "@/types/todo";
import {
  parseStoredTheme,
  parseStoredTodos,
  THEME_STORAGE_KEY,
  TODO_STORAGE_KEY,
} from "@/utils/storage";

const FILTERS: Array<{ value: TodoFilter; label: string }> = [
  { value: "all", label: "전체" },
  { value: "active", label: "진행 중" },
  { value: "completed", label: "완료" },
];

function createTodo(text: string): TodoItem {
  const now = Date.now();

  return {
    id: globalThis.crypto?.randomUUID?.() ?? `${now}-${Math.random()}`,
    text,
    completed: false,
    createdAt: now,
    updatedAt: now,
  };
}

export function TodoApp() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodoText, setNewTodoText] = useState("");
  const [filter, setFilter] = useState<TodoFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const storedTodos = parseStoredTodos(
      window.localStorage.getItem(TODO_STORAGE_KEY),
    );
    const storedTheme = parseStoredTheme(
      window.localStorage.getItem(THEME_STORAGE_KEY),
    );
    const preferredTheme: ThemeMode =
      storedTheme ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");

    queueMicrotask(() => {
      setTodos(storedTodos);
      setTheme(preferredTheme);
      setIsLoaded(true);
    });
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");

    if (isLoaded) {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  }, [isLoaded, theme]);

  useEffect(() => {
    if (isLoaded) {
      window.localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(todos));
    }
  }, [isLoaded, todos]);

  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((todo) => todo.completed).length;
    const active = total - completed;
    const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

    return { total, completed, active, completionRate };
  }, [todos]);

  const visibleTodos = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    return todos.filter((todo) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "active" && !todo.completed) ||
        (filter === "completed" && todo.completed);
      const matchesSearch =
        normalizedSearchTerm.length === 0 ||
        todo.text.toLowerCase().includes(normalizedSearchTerm);

      return matchesFilter && matchesSearch;
    });
  }, [filter, searchTerm, todos]);

  const emptyMessage =
    todos.length === 0
      ? "아직 등록된 할일이 없습니다. 첫 할일을 추가해보세요."
      : "조건에 맞는 할일이 없습니다.";

  function handleAddTodo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedText = newTodoText.trim();

    if (!trimmedText) {
      return;
    }

    setTodos((currentTodos) => [createTodo(trimmedText), ...currentTodos]);
    setNewTodoText("");
  }

  function handleToggleTodo(id: string) {
    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === id
          ? { ...todo, completed: !todo.completed, updatedAt: Date.now() }
          : todo,
      ),
    );
  }

  function handleUpdateTodo(id: string, text: string) {
    const trimmedText = text.trim();

    if (!trimmedText) {
      return false;
    }

    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === id
          ? { ...todo, text: trimmedText, updatedAt: Date.now() }
          : todo,
      ),
    );

    return true;
  }

  function handleDeleteTodo(id: string) {
    setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== id));
  }

  function handleClearCompleted() {
    setTodos((currentTodos) => currentTodos.filter((todo) => !todo.completed));
  }

  function handleThemeToggle() {
    setTheme((currentTheme) => {
      const nextTheme = currentTheme === "dark" ? "light" : "dark";
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);

      return nextTheme;
    });
  }

  return (
    <main className="min-h-screen px-4 py-6 text-slate-950 transition-colors duration-300 sm:px-6 lg:px-8 dark:text-slate-100">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl dark:text-white">
              오늘의 할일
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              할일을 빠르게 정리하고, 완료 상태와 진행률을 브라우저에 저장합니다.
            </p>
          </div>

          <button
            type="button"
            aria-label={
              theme === "dark" ? "라이트 모드로 변경" : "다크 모드로 변경"
            }
            onClick={handleThemeToggle}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-teal-300 hover:text-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-teal-500 dark:hover:text-teal-200 dark:focus:ring-teal-900"
          >
            <span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>
            {theme === "dark" ? "라이트 모드" : "다크 모드"}
          </button>
        </header>

        <section className="rounded-3xl border border-white/80 bg-white/88 p-4 shadow-2xl shadow-slate-200/60 backdrop-blur sm:p-6 dark:border-slate-700/80 dark:bg-slate-900/88 dark:shadow-black/30">
          <form
            onSubmit={handleAddTodo}
            className="grid gap-3 sm:grid-cols-[1fr_auto]"
          >
            <label className="sr-only" htmlFor="new-todo">
              새 할일
            </label>
            <input
              id="new-todo"
              value={newTodoText}
              onChange={(event) => setNewTodoText(event.target.value)}
              placeholder="새 할일을 입력하세요"
              className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-teal-400 dark:focus:ring-teal-900/70"
            />
            <button
              type="submit"
              aria-label="할일 추가"
              className="h-12 rounded-2xl bg-teal-600 px-6 text-sm font-bold text-white shadow-lg shadow-teal-600/20 transition hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-200 active:scale-[0.98] dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400 dark:focus:ring-teal-900"
            >
              추가
            </button>
          </form>

          <div className="mt-5 grid gap-3 lg:grid-cols-[auto_1fr_auto] lg:items-center">
            <div
              className="grid grid-cols-3 rounded-2xl bg-slate-100 p-1 dark:bg-slate-950"
              aria-label="할일 필터"
            >
              {FILTERS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  aria-label={`${item.label} 할일 보기`}
                  aria-pressed={filter === item.value}
                  onClick={() => setFilter(item.value)}
                  className={`h-10 rounded-xl px-3 text-sm font-semibold transition focus:outline-none focus:ring-4 focus:ring-teal-200 dark:focus:ring-teal-900 ${
                    filter === item.value
                      ? "bg-white text-teal-700 shadow-sm dark:bg-slate-800 dark:text-teal-200"
                      : "text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-slate-100"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <label className="relative block">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                검색
              </span>
              <input
                value={searchTerm}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setSearchTerm(event.target.value)
                }
                aria-label="할일 검색"
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white py-2 pl-14 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-teal-400 dark:focus:ring-teal-900/70"
                placeholder="할일 텍스트 검색"
              />
            </label>

            <button
              type="button"
              aria-label="완료 항목 전체 삭제"
              onClick={handleClearCompleted}
              disabled={stats.completed === 0}
              className="h-11 rounded-2xl border border-rose-200 px-4 text-sm font-bold text-rose-600 transition hover:border-rose-300 hover:bg-rose-50 focus:outline-none focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300 disabled:hover:bg-transparent dark:border-rose-900/70 dark:text-rose-300 dark:hover:bg-rose-950/30 dark:focus:ring-rose-950 dark:disabled:border-slate-800 dark:disabled:text-slate-600"
            >
              완료 항목 삭제
            </button>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="전체" value={stats.total} />
          <StatCard label="완료" value={stats.completed} tone="teal" />
          <StatCard label="진행 중" value={stats.active} tone="blue" />
          <StatCard label="완료율" value={`${stats.completionRate}%`} tone="slate" />
        </section>

        <section
          className="rounded-3xl border border-white/80 bg-white/88 p-3 shadow-xl shadow-slate-200/50 backdrop-blur sm:p-4 dark:border-slate-700/80 dark:bg-slate-900/88 dark:shadow-black/30"
          aria-live="polite"
        >
          {visibleTodos.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {visibleTodos.map((todo) => (
                <TodoRow
                  key={todo.id}
                  todo={todo}
                  onToggle={handleToggleTodo}
                  onUpdate={handleUpdateTodo}
                  onDelete={handleDeleteTodo}
                />
              ))}
            </ul>
          ) : (
            <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 text-center dark:border-slate-700 dark:bg-slate-950/60">
              <p className="text-base font-semibold text-slate-700 dark:text-slate-200">
                {emptyMessage}
              </p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                검색어와 필터를 조정하거나 새 할일을 추가할 수 있습니다.
              </p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function StatCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number | string;
  tone?: "default" | "teal" | "blue" | "slate";
}) {
  const toneClass = {
    default: "text-slate-950 dark:text-white",
    teal: "text-teal-700 dark:text-teal-300",
    blue: "text-sky-700 dark:text-sky-300",
    slate: "text-slate-700 dark:text-slate-200",
  }[tone];

  return (
    <article className="rounded-2xl border border-white/80 bg-white/82 p-4 shadow-lg shadow-slate-200/45 dark:border-slate-700/80 dark:bg-slate-900/82 dark:shadow-black/20">
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className={`mt-2 text-3xl font-bold ${toneClass}`}>{value}</p>
    </article>
  );
}

function TodoRow({
  todo,
  onToggle,
  onUpdate,
  onDelete,
}: {
  todo: TodoItem;
  onToggle: (id: string) => void;
  onUpdate: (id: string, text: string) => boolean;
  onDelete: (id: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftText, setDraftText] = useState(todo.text);

  function saveDraft() {
    const didSave = onUpdate(todo.id, draftText);

    if (didSave) {
      setIsEditing(false);
    }
  }

  function cancelEdit() {
    setDraftText(todo.text);
    setIsEditing(false);
  }

  function beginEdit() {
    setDraftText(todo.text);
    setIsEditing(true);
  }

  function handleEditKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      saveDraft();
    }

    if (event.key === "Escape") {
      event.preventDefault();
      cancelEdit();
    }
  }

  return (
    <li className="group grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-lg hover:shadow-slate-200/60 sm:grid-cols-[auto_1fr_auto] sm:items-center dark:border-slate-700 dark:bg-slate-950 dark:hover:border-teal-700 dark:hover:shadow-black/20">
      <label className="flex min-w-0 items-center gap-3">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
          aria-label={`${todo.text} 완료 상태 변경`}
          className="h-5 w-5 shrink-0 rounded border-slate-300 text-teal-600 focus:ring-4 focus:ring-teal-200 dark:border-slate-600 dark:bg-slate-900 dark:focus:ring-teal-900"
        />

        {isEditing ? (
          <input
            value={draftText}
            onChange={(event) => setDraftText(event.target.value)}
            onKeyDown={handleEditKeyDown}
            aria-label={`${todo.text} 수정`}
            autoFocus
            className="h-11 min-w-0 flex-1 rounded-xl border border-teal-300 bg-teal-50 px-3 text-sm font-medium text-slate-950 outline-none focus:ring-4 focus:ring-teal-100 dark:border-teal-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-teal-900/70"
          />
        ) : (
          <span
            className={`min-w-0 flex-1 break-words text-base font-medium leading-7 transition ${
              todo.completed
                ? "text-slate-400 line-through dark:text-slate-500"
                : "text-slate-800 dark:text-slate-100"
            }`}
          >
            {todo.text}
          </span>
        )}
      </label>

      <div className="flex justify-end gap-2 sm:col-start-3">
        {isEditing ? (
          <>
            <button
              type="button"
              aria-label="수정 저장"
              onClick={saveDraft}
              disabled={!draftText.trim()}
              className="h-10 rounded-xl bg-teal-600 px-3 text-sm font-bold text-white transition hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-200 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400 dark:focus:ring-teal-900 dark:disabled:bg-slate-800 dark:disabled:text-slate-600"
            >
              저장
            </button>
            <button
              type="button"
              aria-label="수정 취소"
              onClick={cancelEdit}
              className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900 dark:focus:ring-slate-800"
            >
              취소
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              aria-label={`${todo.text} 수정`}
              onClick={beginEdit}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:text-slate-400 dark:hover:border-sky-800 dark:hover:bg-sky-950/40 dark:hover:text-sky-300 dark:focus:ring-sky-950"
            >
              <EditIcon />
            </button>
            <button
              type="button"
              aria-label={`${todo.text} 삭제`}
              onClick={() => onDelete(todo.id)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 focus:outline-none focus:ring-4 focus:ring-rose-100 dark:border-slate-700 dark:text-slate-400 dark:hover:border-rose-900 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 dark:focus:ring-rose-950"
            >
              <TrashIcon />
            </button>
          </>
        )}
      </div>
    </li>
  );
}

function EditIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <path d="m16.9 4.1 3 3L8 19l-4 1 1-4L16.9 4.1Z" />
      <path d="m14 7 3 3" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="m6 6 1 15h10l1-15" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}
