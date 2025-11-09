import { useState, useCallback } from "react";

interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  onConfirm?: () => void;
  onCancel?: () => void;
}

export function useConfirmDialog() {
  const [dialogState, setDialogState] = useState<ConfirmDialogState>({
    isOpen: false,
    title: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  const confirm = useCallback(
    (options: Omit<ConfirmDialogState, "isOpen">): Promise<boolean> => {
      return new Promise((resolve) => {
        setDialogState({
          isOpen: true,
          title: options.title,
          description: options.description,
          confirmText: options.confirmText,
          cancelText: options.cancelText,
          variant: options.variant,
          onConfirm: () => {
            setLoading(true);
            options.onConfirm?.();
            resolve(true);
          },
          onCancel: () => {
            options.onCancel?.();
            resolve(false);
            setDialogState((prev) => ({ ...prev, isOpen: false }));
          },
        });
      });
    },
    []
  );

  const closeDialog = useCallback(() => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
    setLoading(false);
  }, []);

  const reset = useCallback(() => {
    setDialogState({
      isOpen: false,
      title: "",
      description: "",
    });
    setLoading(false);
  }, []);

  return {
    isOpen: dialogState.isOpen,
    title: dialogState.title,
    description: dialogState.description,
    confirmText: dialogState.confirmText,
    cancelText: dialogState.cancelText,
    variant: dialogState.variant,
    loading,
    confirm,
    closeDialog,
    reset,
    onConfirm: dialogState.onConfirm,
    onCancel: dialogState.onCancel,
  };
}
