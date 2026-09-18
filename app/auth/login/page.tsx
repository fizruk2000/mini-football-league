'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message === 'Invalid login credentials'
        ? 'Неверный email или пароль'
        : error.message);
      setLoading(false);
      return;
    }

    toast.success('Вход выполнен!');
    router.push('/admin');
    router.refresh();
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="card w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-7 h-7 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold">Вход в систему</h1>
          <p className="text-slate-500 text-sm mt-1">Для администраторов лиги</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label className="label">Пароль</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Нет аккаунта?{' '}
          <Link href="/auth/register" className="text-primary-600 hover:underline">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
}
