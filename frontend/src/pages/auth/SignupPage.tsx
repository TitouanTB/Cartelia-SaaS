import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../providers/AuthProvider';
import { useToast } from '../../components/Toast';
import { Eye, EyeOff } from 'lucide-react';

export default function SignupPage() {
  const { signup, status } = useAuth();
  const { success, error: err } = useToast();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pass !== confirm) return err('Mots de passe différents');
    setLoading(true);
    try {
      await signup(email, pass);
      success('Compte créé – vérifiez vos emails !');
    } catch (e: any) { err(e.message || 'Erreur'); }
    setLoading(false);
  };

  if (status === 'authenticated') return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900/20">
      <div className="bg-white/95 rounded-2xl p-10 shadow-xl max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center text-3xl font-bold text-white mx-auto mb-4">C</div>
          <h1 className="text-3xl font-bold">Créer un compte Cartelia</h1>
        </div>
        <form onSubmit={submit} className="space-y-6">
          <input type="email" placeholder="vous@votreresto.com" value={email} onChange={e=>setEmail(e.target.value)} className="w-full px-4 py-3 rounded-lg border" required />
          <div className="relative">
            <input type={show1?"text":"password"} placeholder="Mot de parasse" value={pass} onChange={e=>setPass(e.target.value)} className="w-full px-4 py-3 pr-12 rounded-lg border" required />
            <button type="button" onClick={()=>setShow1(!show1)} className="absolute right-3 top-3.5">{show1?<EyeOff size={20}/>:<Eye size={20}/>}</button>
          </div>
          <div className="relative">
            <input type={show2?"text":"password"} placeholder="Confirmer" value={confirm} onChange={e=>setConfirm(e.target.value)} className="w-full px-4 py-3 pr-12 rounded-lg border" required />
            <button type="button" onClick={()=>setShow2(!show2)} className="absolute right-3 top-3.5">{show2?<EyeOff size={20}/>:<Eye size={20}/>}</button>
          </div>
          <Button type="submit" loading={loading} fullWidth size="lg">Créer mon compte</Button>
        </form>
        <p className="text-center mt-6 text-gray-600">
          Déjà un compte ? <Link to="/login" className="text-purple-600 font-medium">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
