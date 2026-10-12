'use client';

import { Fragment, ReactNode } from 'react';
import { cn } from '@/lib/utilidades';
import { X } from 'lucide-react';
import { Boton } from './boton';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
}: ModalProps) {
  if (!open) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />

        <div
          className={cn(
            'relative w-full bg-white rounded-lg shadow-xl',
            sizes[size],
            'animate-in fade-in zoom-in-95 duration-200'
          )}
        >
          {(title || showCloseButton) && (
            <div className="flex items-start justify-between p-4 border-b border-gray-200">
              <div>
                {title && (
                  <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                )}
                {description && (
                  <p className="mt-1 text-sm text-gray-500">{description}</p>
                )}
              </div>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              )}
            </div>
          )}

          <div className="p-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  loading?: boolean;
  children?: React.ReactNode;
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'default',
  loading = false,
  children,
}: ConfirmModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} description={message} size="sm">
      {children}
      <div className="flex justify-end gap-3 mt-6">
        <Boton variant="outline" onClick={onClose} disabled={loading}>
          {cancelText}
        </Boton>
        <Boton
          variant={variant === 'destructive' ? 'destructive' : 'primary'}
          onClick={onConfirm}
          isLoading={loading}
        >
          {confirmText}
        </Boton>
      </div>
    </Modal>
  );
}
