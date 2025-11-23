import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider';
import { useToast } from '../../components/Toast';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { login, status } = useAuth();
  const { error: err } = useToast();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !pass) return err('Champs requis');
    setLoading(true);
    try {
      await login(email, pass);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur';
      err(message);
      setLoading(false);
    }
  };

  if (status === 'authenticated') return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700" style={{ background: 'linear-gradient(135deg, #9317FD 0%, #7B2FF7 50%, #6B46E5 100%)' }}>
      <div className="bg-white rounded-3xl shadow-2xl p-12 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center mb-6 shadow-lg" style={{ background: 'linear-gradient(135deg, #9317FD, #B931FC)' }}>
            <span className="text-5xl font-bold text-white">C</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bienvenue sur Cartelia</h1>
          <p className="text-gray-600 text-center">Connectez-vous à votre compte</p>
        </div>
        
        <form onSubmit={submit} className="space-y-5">
          <div>
            <input
              type="email"
              placeholder="vous@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              required
            />
          </div>
          
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              placeholder="••••••••"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              required
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              {show ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: '#9317FD' }}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Pas de compte ?{' '}
          <Link to="/signup" className="font-semibold hover:underline" style={{ color: '#9317FD' }}>
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
