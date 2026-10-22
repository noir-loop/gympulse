import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = false,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-editorial-wrap animate-fade-in" onClick={onClose}>
      <div className="modal-editorial-body p-8 max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-white border border-[#e6e4df] rounded shrink-0">
            <AlertTriangle className={`w-5 h-5 ${isDanger ? 'text-[#b91c1c]' : 'text-[#b45309]'}`} />
          </div>
          <div>
            <h3 className="font-serif text-2xl font-semibold text-[#1a1a1a] mb-1">{title}</h3>
            <p className="text-xs text-[#8a8a8a] leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-6 border-t border-[#e6e4df]">
          <button
            onClick={onClose}
            className="btn-editorial-outline cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`cursor-pointer ${
              isDanger
                ? 'bg-[#b91c1c] text-white py-2 px-4 text-xs uppercase font-semibold tracking-wider rounded'
                : 'btn-editorial-primary'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
