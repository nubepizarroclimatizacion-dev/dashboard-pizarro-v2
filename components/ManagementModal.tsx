import React from 'react';
import { X, ShieldCheck } from 'lucide-react';
import UserManagementPanel from './UserManagementPanel';

interface ManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ManagementModal: React.FC<ManagementModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center">
            <ShieldCheck className="mr-3 text-pizarro-blue-600 w-7 h-7"/>
            <h2 className="text-xl font-bold text-gray-800">
              Panel de Gestión de Usuarios
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 transition-colors">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </header>
        
        <main className="p-6 overflow-y-auto bg-gray-50 flex-grow">
          <UserManagementPanel />
        </main>
         <footer className="p-4 bg-gray-100 border-t border-gray-200 mt-auto text-right">
            <button
                onClick={onClose}
                className="px-5 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-pizarro-blue-600 hover:bg-pizarro-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pizarro-blue-500"
            >
                Cerrar
            </button>
        </footer>
      </div>
    </div>
  );
};

export default ManagementModal;