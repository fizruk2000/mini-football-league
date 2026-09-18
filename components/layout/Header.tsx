'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils/cn';
import { Trophy, Users, Calendar, BarChart3, LayoutDashboard, LogIn, LogOut, Menu, X } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Главная', icon: Trophy },
  { href: '/standings', label: 'Таблица', icon: BarChart3 },
  { href: '/schedule', label: 'Расписание', icon: Calendar },
  { href: '/teams', label: 'Команды', icon: Users },
  { href: '/stats', label: 'Статистика', icon: BarChart3 },
  { href: '/posters', label: 'Афиши', icon: LayoutDashboard },
];

export function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        setIsAdmin(profile?.role === 'admin');
      }
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => setIsAdmin(data?.role === 'admin'));
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <header className="bg-pitch-green text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Trophy className="w-7 h-7 text-yellow-400" />
            <span className="hidden sm:inline">Мини-футбольная лига</span>
            <span className="sm:hidden">МФЛ</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition',
                    active ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
            {isAdmin && (
              <Link
                href="/admin"
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition',
                  pathname.startsWith('/admin')
                    ? 'bg-yellow-500 text-slate-900'
                    : 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30'
                )}
              >
                <LayoutDashboard className="w-4 h-4" />
                Админ
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <button onClick={handleLogout} className="btn-ghost text-white hover:bg-white/10 hidden sm:flex">
                <LogOut className="w-4 h-4" />
                Выйти
              </button>
            ) : (
              <Link href="/auth/login" className="btn-ghost text-white hover:bg-white/10 hidden sm:flex">
                <LogIn className="w-4 h-4" />
                Войти
              </Link>
            )}

            <button
              className="md:hidden p-2 rounded-lg hover:bg-white/10"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="md:hidden pb-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium',
                    pathname === item.href ? 'bg-white/20' : 'hover:bg-white/10'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium bg-yellow-500/20 text-yellow-300"
              >
                <LayoutDashboard className="w-4 h-4" />
                Админ-панель
              </Link>
            )}
            {user ? (
              <button
                onClick={() => { handleLogout(); setMobileOpen(false); }}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium w-full hover:bg-white/10"
              >
                <LogOut className="w-4 h-4" />
                Выйти
              </button>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-white/10"
              >
                <LogIn className="w-4 h-4" />
                Войти
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
