import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger'
}) => {
  const colors = {
    danger: 'bg-red-600 hover:bg-red-700 shadow-red-500/20 text-white',
    warning: 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20 text-white',
    info: 'bg-primary-600 hover:bg-primary-700 shadow-primary-500/20 text-white'
  };

  const iconColors = {
    danger: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    warning: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    info: 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[201] p-4"
          >
            <div className="bg-white dark:bg-dark-card rounded-3xl shadow-3xl border border-gray-100 dark:border-dark-border overflow-hidden">
              <div className="p-8">
                <div className="flex items-center justify-center mb-6">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${iconColors[type]}`}>
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                </div>
                
                <h3 className="text-xl font-black text-center text-gray-900 dark:text-white mb-2">
                  {title}
                </h3>
                <p className="text-sm text-center text-gray-500 dark:text-gray-400 leading-relaxed">
                  {message}
                </p>

                <div className="grid grid-cols-2 gap-4 mt-8">
                  <button
                    onClick={onClose}
                    className="px-6 py-3 bg-gray-100 dark:bg-dark-bg hover:bg-gray-200 dark:hover:bg-dark-border text-gray-700 dark:text-gray-300 font-bold rounded-2xl transition-all"
                  >
                    {cancelText}
                  </button>
                  <button
                    onClick={() => {
                      onConfirm();
                      onClose();
                    }}
                    className={`px-6 py-3 font-bold rounded-2xl shadow-lg transition-all ${colors[type]}`}
                  >
                    {confirmText}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
