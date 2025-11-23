import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider';
import { useToast } from '../../components/Toast';
import { Eye, EyeOff } from 'lucide-react';

export default function SignupPage() {
  const { signup, status } = useAuth();
  const { error: err } = useToast();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  useEffect(() => {
    const token_hash = searchParams.get('token_hash');
    const type = searchParams.get('type');
    if (token_hash && type === 'email_change') {
      if (status === 'authenticated') {
        window.location.href = '/';
      }
    }
  }, [status, searchParams]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pass !== confirm) return err('Mots de passe différents');
    setLoading(true);
    try {
      await signup(email, pass);
      setConfirmationSent(true);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur';
      err(message);
      setLoading(false);
    }
  };

  if (status === 'authenticated') return null;

  if (confirmationSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700" style={{ background: 'linear-gradient(135deg, #9317FD 0%, #7B2FF7 50%, #6B46E5 100%)' }}>
        <div className="bg-white rounded-3xl shadow-2xl p-12 w-full max-w-md">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-lg" style={{ background: 'linear-gradient(135deg, #9317FD, #B931FC)' }}>
              <span className="text-5xl font-bold text-white">✓</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Email de confirmation envoyé</h1>
            <p className="text-gray-600 mb-2">Vérifiez votre boîte mail à:</p>
            <p className="font-semibold text-gray-900 mb-6 break-all">{email}</p>
            <p className="text-gray-600">Cliquez sur le lien de confirmation pour activer votre compte.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700" style={{ background: 'linear-gradient(135deg, #9317FD 0%, #7B2FF7 50%, #6B46E5 100%)' }}>
      <div className="bg-white rounded-3xl shadow-2xl p-12 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center mb-6 shadow-lg" style={{ background: 'linear-gradient(135deg, #9317FD, #B931FC)' }}>
            <span className="text-5xl font-bold text-white">C</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Créer un compte Cartelia</h1>
          <p className="text-gray-600 text-center">Rejoignez-nous dès aujourd'hui</p>
        </div>
        
        <form onSubmit={submit} className="space-y-5">
          <div>
            <input
              type="email"
              placeholder="vous@votreresto.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              required
            />
          </div>
          
          <div className="relative">
            <input
              type={show1 ? "text" : "password"}
              placeholder="Mot de passe"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              required
            />
            <button
              type="button"
              onClick={() => setShow1(!show1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              {show1 ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="relative">
            <input
              type={show2 ? "text" : "password"}
              placeholder="Confirmer le mot de passe"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              required
            />
            <button
              type="button"
              onClick={() => setShow2(!show2)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              {show2 ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: '#9317FD' }}
          >
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Déjà un compte ?{' '}
          <Link to="/login" className="font-semibold hover:underline" style={{ color: '#9317FD' }}>
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
