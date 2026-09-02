"use client";

import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";

import { cn } from "@/lib/cn";

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
};

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === dialogRef.current) dialogRef.current?.close();
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={handleBackdropClick}
      className={cn("rounded-lg border border-neutral-200 p-6 backdrop:bg-black/50", className)}
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          aria-label="Close"
          className="text-neutral-500 hover:text-neutral-900"
        >
          &times;
        </button>
      </div>
      <div className="mt-4">{children}</div>
    </dialog>
  );
}
