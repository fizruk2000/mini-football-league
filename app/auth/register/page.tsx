'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'viewer', // По умолчанию viewer. Админа нужно назначить вручную в Supabase.
        },
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success('Регистрация успешна! Проверьте email для подтверждения.');
    router.push('/auth/login');
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="card w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-7 h-7 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold">Регистрация</h1>
          <p className="text-slate-500 text-sm mt-1">
            После регистрации роль «viewer». Админа назначает администратор БД.
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="label">ФИО</label>
            <input
              type="text"
              className="input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Иван Иванов"
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Пароль (мин. 6 символов)</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Уже есть аккаунт?{' '}
          <Link href="/auth/login" className="text-primary-600 hover:underline">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
