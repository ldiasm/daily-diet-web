import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const { user, signOut, deleteAccount, isLoading } = useAuth();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleSignOut = () => {
    signOut();
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      setError('');
      await deleteAccount();
      navigate('/login');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro ao deletar conta. Tente novamente.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-star-dust-950 flex items-center justify-center">
        <div className="text-star-dust-50 text-xl">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-star-dust-950 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-star-dust-50">
            Daily Diet
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Deletar Conta
            </button>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-star-dust-600 text-white rounded-md hover:bg-star-dust-700 focus:outline-none focus:ring-2 focus:ring-star-dust-500"
            >
              Sair
            </button>
          </div>
        </div>

        <div className="bg-star-dust-900 rounded-lg p-6 shadow-lg">
          <div className="flex items-center space-x-4 mb-6">
            {user.photoUrl ? (
              <img
                src={user.photoUrl}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-16 h-16 rounded-full"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-star-dust-700 flex items-center justify-center">
                <span className="text-2xl text-star-dust-300">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </span>
              </div>
            )}
            <div>
              <h2 className="text-2xl font-semibold text-star-dust-50">
                Olá, {user.firstName}! 👋
              </h2>
              <p className="text-star-dust-400">Que bom ter você por aqui!</p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xl text-star-dust-300">
              Vamos começar a cuidar da sua alimentação?
            </p>
            <p className="text-star-dust-400">
              Aqui você pode registrar suas refeições diárias, acompanhar sua dieta e manter um estilo de vida saudável.
            </p>
          </div>
        </div>
      </div>

      {/* Modal de confirmação para deletar conta */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-star-dust-900 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-star-dust-50 mb-4">
              Tem certeza que deseja deletar sua conta?
            </h3>
            <p className="text-star-dust-400 mb-6">
              Esta ação não pode ser desfeita. Todos os seus dados serão permanentemente removidos.
            </p>
            {error && (
              <p className="text-red-500 text-sm mb-4">{error}</p>
            )}
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-star-dust-700 text-white rounded-md hover:bg-star-dust-600 focus:outline-none focus:ring-2 focus:ring-star-dust-500"
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deletando...' : 'Sim, deletar conta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
