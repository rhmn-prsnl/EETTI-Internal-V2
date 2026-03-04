import React, { Fragment } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-slate-900/75 transition-opacity backdrop-blur-sm" 
          onClick={onClose}
        ></div>

        {/* Modal Panel */}
        <div className="relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all border border-slate-100">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold leading-6 text-slate-900">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-500 transition-colors focus:outline-none"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="mt-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;