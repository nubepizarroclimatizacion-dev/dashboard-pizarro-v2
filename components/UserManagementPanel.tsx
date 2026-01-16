
import React, { useState, FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { KeyRound, AlertCircle, CheckCircle, ShieldCheck, UserCog, ExternalLink } from 'lucide-react';

const Message = ({ message, type }: { message: string | null, type: 'error' | 'success' }) => {
    if (!message) return null;
    const isError = type === 'error';
    const config = {
        icon: isError ? <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" /> : <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />,
        containerClasses: isError ? "bg-red-100 border-red-500 text-red-700" : "bg-green-100 border-green-500 text-green-700",
    };

    return (
        <div className={`border-l-4 p-4 rounded-md flex items-start my-4 ${config.containerClasses}`} role="alert">
            {config.icon}
            <span className="text-sm">{message}</span>
        </div>
    );
};

const UserManagementPanel: React.FC = () => {
    const { currentUser, updatePassword } = useAuth();
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [isLoading, setIsLoading] = useState(false);
    
    const [passwordChangeError, setPasswordChangeError] = useState<string | null>(null);
    const [passwordChangeSuccess, setPasswordChangeSuccess] = useState<string | null>(null);

    const clearMessages = () => {
        setPasswordChangeError(null);
        setPasswordChangeSuccess(null);
    };

    const inputClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pizarro-blue-500 focus:border-pizarro-blue-500 sm:text-sm";
    
    const handlePasswordChangeSubmit = async (e: FormEvent) => {
        e.preventDefault();
        clearMessages();
        setIsLoading(true);

        if (passwordData.newPassword.length < 6) {
            setPasswordChangeError("La nueva contraseña debe tener al menos 6 caracteres.");
            setIsLoading(false);
            return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordChangeError("Las contraseñas no coinciden.");
            setIsLoading(false);
            return;
        }

        try {
            await updatePassword(passwordData.currentPassword, passwordData.newPassword);
            setPasswordChangeSuccess("¡Contraseña actualizada exitosamente!");
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            const err = error as any;
            if (err && (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential')) {
                setPasswordChangeError("La contraseña actual es incorrecta.");
            } else {
                setPasswordChangeError("Ocurrió un error al actualizar la contraseña.");
            }
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <UserCog className="w-5 h-5 mr-2 text-pizarro-blue-600"/>
                    Gestión de Usuarios
                </h3>
                <div className="space-y-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-md border">
                    <p>La administración de usuarios (agregar, eliminar, cambiar roles) ahora se maneja de forma centralizada y segura a través de la consola de Firebase.</p>
                    <p>Esto asegura que solo personal autorizado pueda modificar los accesos al sistema.</p>
                    <a 
                        href="https://console.firebase.google.com/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-pizarro-blue-600 hover:bg-pizarro-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pizarro-blue-500"
                    >
                        Ir a la Consola de Firebase
                        <ExternalLink className="w-4 h-4 ml-2"/>
                    </a>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <KeyRound className="w-5 h-5 mr-2 text-pizarro-blue-600"/>
                    Cambiar mi Contraseña
                </h3>
                 <Message message={passwordChangeError} type="error" />
                 <Message message={passwordChangeSuccess} type="success" />
                <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña Actual</label>
                        <input type="password" value={passwordData.currentPassword} onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})} className={inputClasses} required/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
                        <input type="password" value={passwordData.newPassword} onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} className={inputClasses} placeholder="Mínimo 6 caracteres" required/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nueva Contraseña</label>
                        <input type="password" value={passwordData.confirmPassword} onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} className={inputClasses} required/>
                    </div>
                    <div>
                        <button type="submit" disabled={isLoading} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-pizarro-blue-600 hover:bg-pizarro-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pizarro-blue-500 disabled:opacity-50">
                            {isLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserManagementPanel;
