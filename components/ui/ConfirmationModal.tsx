import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  isDanger?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen, onClose, onConfirm, title, message, confirmLabel = 'Delete', isDanger = true
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="flex flex-col items-center text-center pt-2 pb-2">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${isDanger ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
          <AlertTriangle size={28} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-500 mb-8 max-w-xs leading-relaxed">{message}</p>
        <div className="flex gap-3 w-full">
          <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
          <Button 
            variant={isDanger ? 'danger' : 'primary'} 
            onClick={() => { onConfirm(); onClose(); }} 
            className="flex-1"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;