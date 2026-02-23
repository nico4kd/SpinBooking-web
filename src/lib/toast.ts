import { toast as sonnerToast } from 'sonner';

/**
 * Themed toast notifications for SpinBooking
 *
 * Matches the Studio Dark design system with proper colors and styling.
 * All toasts auto-dismiss after 5 seconds and include a close button.
 */

export const toast = {
  /**
   * Success notification (green)
   * Use for: Successful bookings, saved changes, completed actions
   */
  success: (message: string, options?: { description?: string; duration?: number }) => {
    return sonnerToast.success(message, {
      description: options?.description,
      duration: options?.duration || 5000,
      style: {
        background: 'hsl(var(--surface-2))',
        border: '1px solid hsl(142 71% 45% / 0.3)',
        color: 'hsl(var(--text-primary))',
      },
    });
  },

  /**
   * Error notification (red)
   * Use for: Failed operations, validation errors, API errors
   */
  error: (message: string, options?: { description?: string; duration?: number }) => {
    return sonnerToast.error(message, {
      description: options?.description,
      duration: options?.duration || 5000,
      style: {
        background: 'hsl(var(--surface-2))',
        border: '1px solid hsl(0 84% 60% / 0.3)',
        color: 'hsl(var(--text-primary))',
      },
    });
  },

  /**
   * Warning notification (amber)
   * Use for: Important notices, deprecation warnings, cautionary messages
   */
  warning: (message: string, options?: { description?: string; duration?: number }) => {
    return sonnerToast.warning(message, {
      description: options?.description,
      duration: options?.duration || 5000,
      style: {
        background: 'hsl(var(--surface-2))',
        border: '1px solid hsl(38 92% 50% / 0.3)',
        color: 'hsl(var(--text-primary))',
      },
    });
  },

  /**
   * Info notification (cyan)
   * Use for: General information, tips, feature announcements
   */
  info: (message: string, options?: { description?: string; duration?: number }) => {
    return sonnerToast.info(message, {
      description: options?.description,
      duration: options?.duration || 5000,
      style: {
        background: 'hsl(var(--surface-2))',
        border: '1px solid hsl(189 94% 43% / 0.3)',
        color: 'hsl(var(--text-primary))',
      },
    });
  },

  /**
   * Loading notification
   * Use for: Long-running operations, API calls
   * Remember to dismiss with toast.dismiss(id) when done
   */
  loading: (message: string, options?: { description?: string }) => {
    return sonnerToast.loading(message, {
      description: options?.description,
      style: {
        background: 'hsl(var(--surface-2))',
        border: '1px solid hsl(var(--border-default))',
        color: 'hsl(var(--text-primary))',
      },
    });
  },

  /**
   * Promise-based toast
   * Automatically shows loading, success, or error based on promise state
   *
   * Example:
   * toast.promise(
   *   api.post('/bookings', data),
   *   {
   *     loading: 'Reservando clase...',
   *     success: '¡Reserva confirmada!',
   *     error: 'Error al reservar',
   *   }
   * );
   */
  promise: <T,>(
    promise: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return sonnerToast.promise(promise, {
      loading: options.loading,
      success: options.success,
      error: options.error,
      style: {
        background: 'hsl(var(--surface-2))',
        border: '1px solid hsl(var(--border-default))',
        color: 'hsl(var(--text-primary))',
      },
    });
  },

  /**
   * Custom toast with action button
   * Use for: Undo actions, navigation prompts
   *
   * Example:
   * toast.action('Clase cancelada', {
   *   action: {
   *     label: 'Deshacer',
   *     onClick: () => restoreBooking(),
   *   }
   * });
   */
  action: (
    message: string,
    options: {
      description?: string;
      action: {
        label: string;
        onClick: () => void;
      };
    }
  ) => {
    return sonnerToast(message, {
      description: options.description,
      action: options.action,
      duration: 5000,
      style: {
        background: 'hsl(var(--surface-2))',
        border: '1px solid hsl(var(--border-default))',
        color: 'hsl(var(--text-primary))',
      },
    });
  },

  /**
   * Dismiss a specific toast by ID
   */
  dismiss: (toastId?: string | number) => {
    return sonnerToast.dismiss(toastId);
  },
};
