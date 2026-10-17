import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Terminal, Eye, EyeOff } from 'lucide-react';
import { api } from '@/lib/api';
import { toast, Toaster } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Placeholder animasyonları ve şifre görünürlüğü için state'ler
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: tokens } = await api.post(isRegistering ? '/auth/register' : '/auth/login', {
        email,
        password,
        ...(isRegistering ? { firstName, lastName } : {}),
      });
      const { data: user } = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      login(
        {
          id: user.id,
          email: user.email,
          firstName: isRegistering ? firstName : user.email.split('@')[0],
          lastName: isRegistering ? lastName : '',
          role: user.role,
        },
        tokens.access_token,
        tokens.refresh_token,
      );
      navigate('/');
    } catch (error: any) {
      const message = error.response?.data?.message;
      toast.error(Array.isArray(message) ? message.join(', ') : message || (error.request ? 'Backend API sunucusuna ulaşılamadı.' : isRegistering ? 'Kayıt başarısız.' : 'Giriş başarısız.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <Toaster />
      {/* İnce Mühendislik Izgarası Merkez Vurgusu */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900/50 via-slate-950 to-slate-950"></div>
<div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)] opacity-50"></div>
      <div className="relative w-full max-w-md">
        {/* Cam Efektli (Glassmorphism) Ana Kart */}
        <div className="flex flex-col gap-8 rounded-lg border border-slate-800 bg-slate-900/50 p-8 shadow-2xl backdrop-blur-md">
          {/* Üst Başlık ve Logo Alanı */}
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-md border border-slate-700 bg-slate-800/80 shadow-inner">
              <Terminal className="h-7 w-7 text-cyan-500" />
            </div>
            <h1 className="font-sans text-2xl font-semibold tracking-tight text-slate-100">Shipyard Management</h1>
            <p className="font-mono text-sm text-slate-400">
              TACTICAL MARITIME OS <span className="text-cyan-500">v1.0.0</span>
            </p>
          </div>

          {/* Giriş Formu */}
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            {isRegistering && (
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <label className="font-sans text-xs font-medium uppercase tracking-wider text-slate-400">Ad</label>
                  <input value={firstName} onChange={(event) => setFirstName(event.target.value)} className="w-full rounded-md border border-slate-700 bg-slate-950/50 px-4 py-2.5 font-mono text-sm text-slate-200 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" required />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-sans text-xs font-medium uppercase tracking-wider text-slate-400">Soyad</label>
                  <input value={lastName} onChange={(event) => setLastName(event.target.value)} className="w-full rounded-md border border-slate-700 bg-slate-950/50 px-4 py-2.5 font-mono text-sm text-slate-200 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" required />
                </div>
              </div>
            )}

            {/* Üst Etiketli ve Animasyonlu E-Posta Input'u */}
            <div className="flex flex-col gap-2">
              <label className="font-sans text-xs font-medium uppercase tracking-wider text-slate-400">E-Posta</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => setIsEmailFocused(false)}
                  className="w-full rounded-md border border-slate-700 bg-slate-950/50 px-4 py-2.5 font-mono text-sm text-slate-200 transition-colors focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  required
                />
                <span className={`pointer-events-none absolute left-4 top-2.5 font-mono text-sm text-slate-600 transition-all duration-300 ${email || isEmailFocused ? '-translate-y-4 opacity-0' : 'translate-y-0 opacity-100'}`}>ornek@gmail.com</span>
              </div>
            </div>

            {/* Üst Etiketli, Animasyonlu ve Göster/Gizle Butonlu Şifre Input'u */}
            <div className="flex flex-col gap-2">
              <label className="font-sans text-xs font-medium uppercase tracking-wider text-slate-400">Şifre</label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={isRegistering ? 6 : undefined}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  className="w-full rounded-md border border-slate-700 bg-slate-950/50 py-2.5 pl-4 pr-12 font-mono text-sm text-slate-200 transition-colors focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  required
                />
                <span className={`pointer-events-none absolute left-4 top-2.5 font-mono text-sm text-slate-600 transition-all duration-300 ${password || isPasswordFocused ? '-translate-y-4 opacity-0' : 'translate-y-0 opacity-100'}`}>••••••••</span>

                {/* Şifre Göster/Gizle Butonu */}
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 p-1 text-slate-500 transition-colors hover:text-cyan-400 focus:outline-none">
                  {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="mt-2 h-11 rounded-md bg-cyan-600 font-sans font-medium text-white transition-colors hover:bg-cyan-500">
              {isLoading ? (isRegistering ? 'HESAP OLUŞTURULUYOR...' : 'KİMLİK DOĞRULANIYOR...') : isRegistering ? 'HESAP OLUŞTUR' : 'SİSTEME GİRİŞ YAP'}
            </Button>
          </form>

          <button type="button" onClick={() => setIsRegistering((registering) => !registering)} className="text-sm text-cyan-400 hover:text-cyan-300">
            {isRegistering ? 'Zaten hesabın var mı? Giriş yap' : 'Hesabın yok mu? Kayıt ol'}
          </button>

          {/* Alt Uyarı */}
          <div className="flex items-center justify-center gap-2 border-t border-slate-800/60 pt-6">
            <ShieldAlert className="h-4 w-4 text-amber-500" />
            <span className="font-mono text-xs text-slate-500">YETKİSİZ ERİŞİM KAYIT ALTINA ALINIR</span>
          </div>
        </div>
      </div>
    </div>
  );
}
