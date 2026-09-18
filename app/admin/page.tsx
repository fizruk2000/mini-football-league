import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Users, Calendar, Trophy, Settings, UserPlus, Swords } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const supabase = createClient();

  const { data: season } = await supabase
    .from('seasons')
    .select('*')
    .eq('is_active', true)
    .single();

  const stats = {
    teams: 0,
    players: 0,
    matches: 0,
    finished: 0,
  };

  if (season) {
    const [{ count: teams }, { count: players }, { count: matches }, { count: finished }] =
      await Promise.all([
        supabase.from('teams').select('*', { count: 'exact', head: true }).eq('season_id', season.id),
        supabase
          .from('players')
          .select('*, teams!inner(season_id)', { count: 'exact', head: true })
          .eq('teams.season_id', season.id),
        supabase.from('matches').select('*', { count: 'exact', head: true }).eq('season_id', season.id),
        supabase
          .from('matches')
          .select('*', { count: 'exact', head: true })
          .eq('season_id', season.id)
          .eq('status', 'finished'),
      ]);
    stats.teams = teams || 0;
    stats.players = players || 0;
    stats.matches = matches || 0;
    stats.finished = finished || 0;
  }

  const links = [
    { href: '/admin/teams', icon: Users, label: 'Команды', desc: 'Добавление и редактирование команд' },
    { href: '/admin/players', icon: UserPlus, label: 'Игроки', desc: 'Составы команд' },
    { href: '/admin/schedule', icon: Calendar, label: 'Расписание', desc: 'Генерация и правка туров' },
    { href: '/admin/matches', icon: Swords, label: 'Матчи и результаты', desc: 'Ввод счёта и событий' },
    { href: '/admin/settings', icon: Settings, label: 'Настройки сезона', desc: 'Создание сезона, система' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Админ-панель</h1>
        <p className="text-slate-500 text-sm mt-1">
          {season ? `Активный сезон: ${season.name}` : 'Сезон не создан — начните с настроек'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Команд', value: stats.teams, color: 'text-blue-600' },
          { label: 'Игроков', value: stats.players, color: 'text-green-600' },
          { label: 'Матчей', value: stats.matches, color: 'text-purple-600' },
          { label: 'Сыграно', value: stats.finished, color: 'text-orange-600' },
        ].map((s) => (
          <div key={s.label} className="card p-5 text-center">
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="card p-5 hover:shadow-md transition group flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center group-hover:bg-primary-100 transition">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold group-hover:text-primary-600 transition">{link.label}</h3>
                <p className="text-sm text-slate-500 mt-0.5">{link.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
