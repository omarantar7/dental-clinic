type DialogState<T> = { mode: "create" } | { mode: "edit"; data: T } | null;

export type { DialogState };
