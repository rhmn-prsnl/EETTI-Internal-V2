import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { XCircle } from 'lucide-react';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

const AlertModal: React.FC<AlertModalProps> = ({ isOpen, onClose, title, message }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="flex flex-col items-center text-center pt-2 pb-2">
        <div className="w-14 h-14 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mb-4">
          <XCircle size={28} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-500 mb-8 max-w-xs leading-relaxed">{message}</p>
        <Button variant="secondary" onClick={onClose} className="w-full">
          Understood
        </Button>
      </div>
    </Modal>
  );
};

export default AlertModal;