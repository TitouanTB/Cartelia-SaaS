import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../providers/AuthProvider';
import { useToast } from '../../components/Toast';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { login, status } = useAuth();
  const { success, error: err } = useToast();
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
      success('Connexion réussie');
    } catch (e: any) { err(e.message || 'Erreur'); }
    setLoading(false);
  };

  if (status === 'authenticated') return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900/20">
      <div className="bg-white/95 rounded-2xl p-10 shadow-xl max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center text-3xl font-bold text-white mx-auto mb-4">C</div>
          <h1 className="text-3xl font-bold">Bienvenue sur Cartelia</h1>
          <p className="text-gray-600 mt-2">Connectez-vous à votre compte</p>
        </div>
        <form onSubmit={submit} className="space-y-6">
          <input type="email" placeholder="vous@exemple.com" value={email} onChange={e=>setEmail(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-300" required />
          <div className="relative">
            <input type={show?"text":"password"} placeholder="••••••••" value={pass} onChange={e=>setPass(e.target.value)} className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300" required />
            <button type="button" onClick={()=>setShow(!show)} className="absolute right-3 top-3.5">{show?<EyeOff size={20}/>:<Eye size={20}/>}</button>
          </div>
          <Button type="submit" loading={loading} fullWidth size="lg">Se connecter</Button>
        </form>
        <p className="text-center mt-6 text-gray-600">
          Pas de compte ? <Link to="/signup" className="text-purple-600 font-medium">Créer un compte</Link>
        </p>
      </div>
    </div>
  );
}
