import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { signIn, signUp, user, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [error, setError] = useState('');
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && !isLoading) {
      navigate('/');
    }
  }, [user, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (isCreatingAccount) {
        const userData = {
          email,
          password,
          firstName,
          lastName,
          ...(photoUrl && { photoUrl }),
        };
        await signUp(userData);
      } else {
        await signIn({ email, password });
      }

      // Aguardar até que os dados do usuário estejam carregados
      if (!user) {
        // Se o usuário ainda não estiver carregado, aguardar um pouco mais
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      navigate('/');
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(isCreatingAccount
          ? 'Erro ao criar conta. Tente novamente.'
          : 'Erro ao fazer login. Verifique seus dados.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-star-dust-950 flex items-center justify-center">
        <div className="text-star-dust-50 text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-star-dust-950">
      <div className="max-w-md w-full space-y-8 p-8 bg-star-dust-900 rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-star-dust-50">
            Daily Diet
          </h2>
          <p className="mt-2 text-center text-sm text-star-dust-400">
            {isCreatingAccount ? 'Crie sua conta para começar' : 'Entre com sua conta'}
          </p>
        </div>

        <div className="flex justify-center space-x-4 mb-6">
          <button
            type="button"
            onClick={() => setIsCreatingAccount(false)}
            className={`px-4 py-2 rounded-md text-sm font-medium ${!isCreatingAccount
              ? 'bg-star-dust-600 text-white'
              : 'text-star-dust-400 hover:text-star-dust-300'
              }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => setIsCreatingAccount(true)}
            className={`px-4 py-2 rounded-md text-sm font-medium ${isCreatingAccount
              ? 'bg-star-dust-600 text-white'
              : 'text-star-dust-400 hover:text-star-dust-300'
              }`}
          >
            Criar Conta
          </button>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-star-dust-700 placeholder-star-dust-500 text-star-dust-50 rounded-t-md focus:outline-none focus:ring-star-dust-500 focus:border-star-dust-500 focus:z-10 sm:text-sm bg-star-dust-800"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-star-dust-700 placeholder-star-dust-500 text-star-dust-50 focus:outline-none focus:ring-star-dust-500 focus:border-star-dust-500 focus:z-10 sm:text-sm bg-star-dust-800"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {isCreatingAccount && (
              <>
                <div>
                  <label htmlFor="firstName" className="sr-only">
                    Nome
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-star-dust-700 placeholder-star-dust-500 text-star-dust-50 focus:outline-none focus:ring-star-dust-500 focus:border-star-dust-500 focus:z-10 sm:text-sm bg-star-dust-800"
                    placeholder="Nome"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="sr-only">
                    Sobrenome
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-star-dust-700 placeholder-star-dust-500 text-star-dust-50 focus:outline-none focus:ring-star-dust-500 focus:border-star-dust-500 focus:z-10 sm:text-sm bg-star-dust-800"
                    placeholder="Sobrenome"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="photoUrl" className="sr-only">
                    URL da Foto
                  </label>
                  <input
                    id="photoUrl"
                    name="photoUrl"
                    type="url"
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-star-dust-700 placeholder-star-dust-500 text-star-dust-50 rounded-b-md focus:outline-none focus:ring-star-dust-500 focus:border-star-dust-500 focus:z-10 sm:text-sm bg-star-dust-800"
                    placeholder="URL da Foto (opcional)"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-star-dust-600 hover:bg-star-dust-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-star-dust-500"
            >
              {isSubmitting ? 'Processando...' : (isCreatingAccount ? 'Criar Conta' : 'Entrar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
