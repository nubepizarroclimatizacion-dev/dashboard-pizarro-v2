
import React, { useState, FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, BarChart3, AlertCircle } from 'lucide-react';

const pizarroLogo = 'data:image/png;base64,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';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(username, password);
      // On success, the AuthProvider will handle navigation
    } catch (e) {
      const err = e as any;
      if (err && err.code) {
        switch (err.code) {
          case 'auth/invalid-credential':
          case 'auth/user-not-found':
          case 'auth/wrong-password':
            setError('Usuario o contraseña incorrectos.');
            break;
          default:
            setError(`Ocurrió un error. Por favor, inténtelo de nuevo. (${err.code})`);
            break;
        }
      } else {
         setError('Ocurrió un error inesperado.');
         console.error(e);
      }
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img className="mx-auto h-16 w-auto" src={pizarroLogo} alt="Pizarro Climatización" />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 flex items-center justify-center">
            <BarChart3 className="w-8 h-8 mr-2 text-pizarro-blue-600"/>
            <span>Dashboard Analítico</span>
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Ingrese a su cuenta
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Usuario
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pizarro-blue-500 focus:border-pizarro-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pizarro-blue-500 focus:border-pizarro-blue-500 sm:text-sm"
                />
              </div>
            </div>

            {error && (
                <div className="bg-red-50 p-3 rounded-md flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}


            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pizarro-blue-600 hover:bg-pizarro-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pizarro-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogIn className="w-5 h-5 mr-2 -ml-1"/>
                {isLoading ? 'Ingresando...' : 'Ingresar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
