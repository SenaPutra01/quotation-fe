"use client";

import { toast as sonnerToast } from "sonner";

export function useToast() {
  return {
    toast: (props: { title: string; description: string }) => {
      sonnerToast(props.title, {
        description: props.description,
      });
    },
  };
}
