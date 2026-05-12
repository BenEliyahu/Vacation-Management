import { reactive } from "vue";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

// Module-level singleton so all components share the same toast queue
const toasts = reactive<Toast[]>([]);
let _id = 0;

export function useToast() {
  function show(message: string, type: ToastType = "info", duration = 3500) {
    const id = ++_id;
    toasts.push({ id, message, type });
    setTimeout(() => {
      const idx = toasts.findIndex((t) => t.id === id);
      if (idx !== -1) toasts.splice(idx, 1);
    }, duration);
  }

  return {
    toasts,
    success: (msg: string) => show(msg, "success"),
    error:   (msg: string) => show(msg, "error"),
    warning: (msg: string) => show(msg, "warning"),
    info:    (msg: string) => show(msg, "info"),
  };
}
