import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementar autenticação
    navigate('/home');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-star-dust-950">
      <div className="max-w-md w-full space-y-8 p-8 bg-star-dust-900 rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-star-dust-50">
            Daily Diet
          </h2>
          <p className="mt-2 text-center text-sm text-star-dust-400">
            Faça login para continuar
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-star-dust-700 bg-star-dust-800 placeholder-star-dust-400 text-star-dust-50 rounded-t-md focus:outline-none focus:ring-star-dust-500 focus:border-star-dust-500 focus:z-10 sm:text-sm"
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
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-star-dust-700 bg-star-dust-800 placeholder-star-dust-400 text-star-dust-50 rounded-b-md focus:outline-none focus:ring-star-dust-500 focus:border-star-dust-500 focus:z-10 sm:text-sm"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-star-dust-50 bg-star-dust-700 hover:bg-star-dust-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-star-dust-500"
            >
              Entrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
