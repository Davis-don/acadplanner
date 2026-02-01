import { create } from 'zustand';

export type ToastType = 'success' | 'info' | 'error';

interface ToastState {
  isMounted: boolean;
  message: string | null;
  type: ToastType | null;
  duration: number; // seconds
  color: string | null;

  showToast: (
    message: string,
    type?: ToastType,
    duration?: number
  ) => void;

  clearToast: () => void;
}

let toastTimer: ReturnType<typeof setTimeout> | null = null;

export const useToast = create<ToastState>((set) => ({
  isMounted: false,
  message: null,
  type: null,
  duration: 3,
  color: null,

  showToast: (message, type = 'info', duration = 3) => {
    // 🔁 clear any existing toast
    if (toastTimer) {
      clearTimeout(toastTimer);
      toastTimer = null;
    }

    // 🎨 color mapping
    const colorMap: Record<ToastType, string> = {
      success: '#22c55e', // green
      info: '#3b82f6',    // blue
      error: '#ef4444',   // red
    };

    set({
      isMounted: true,
      message,
      type,
      duration,
      color: colorMap[type],
    });

    // ⏱ auto clear after duration
    toastTimer = setTimeout(() => {
      set({
        isMounted: false,
        message: null,
        type: null,
        color: null,
      });
    }, duration * 1000);
  },

  clearToast: () => {
    if (toastTimer) {
      clearTimeout(toastTimer);
      toastTimer = null;
    }

    set({
      isMounted: false,
      message: null,
      type: null,
      color: null,
    });
  },
}));