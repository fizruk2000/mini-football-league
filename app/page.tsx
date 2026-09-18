import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Trophy, Calendar, Users, Target, Shield } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getDashboardData() {
  const supabase = createClient();

  const { data: season } = await supabase
    .from('seasons')
    .select('*')
    .eq('is_active', true)
    .single();

  if (!season) {
    return { season: null, standings: [], topScorers: [], upcoming: [] };
  }

  const [{ data: standings }, { data: topScorers }, { data: upcoming }] = await Promise.all([
    supabase
      .from('standings')
      .select('*')
      .eq('season_id', season.id)
      .order('points', { ascending: false })
      .limit(5),
    supabase
      .from('top_scorers')
      .select('*')
      .eq('season_id', season.id)
      .order('goals', { ascending: false })
      .limit(5),
    supabase
      .from('matches')
      .select(`
        *,
        home_team:teams!matches_home_team_id_fkey(name, short_name, emblem_url),
        away_team:teams!matches_away_team_id_fkey(name, short_name, emblem_url),
        round:rounds(name, number)
      `)
      .eq('season_id', season.id)
      .eq('status', 'scheduled')
      .order('match_date', { ascending: true })
      .limit(5),
  ]);

  return {
    season,
    standings: standings || [],
    topScorers: topScorers || [],
    upcoming: upcoming || [],
  };
}

export default async function HomePage() {
  const { season, standings, topScorers, upcoming } = await getDashboardData();

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pitch-green to-primary-800 text-white p-8 md:p-12">
        <div className="relative z-10">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Гимназическая<br />мини-футбольная лига
          </h1>
          <p className="mt-4 text-lg text-white/80 max-w-xl">
            {season
              ? `Сезон ${season.name} (${season.year}) — система: ${
                  season.system === 'round_robin' ? 'круговая' :
                  season.system === 'groups' ? 'групповая' :
                  season.system === 'playoff' ? 'плей-офф' : 'швейцарская'
                }`
              : 'Добро пожаловать! Сезон ещё не создан.'}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/standings" className="btn bg-white text-pitch-green hover:bg-slate-100">
              <Trophy className="w-4 h-4" />
              Турнирная таблица
            </Link>
            <Link href="/schedule" className="btn bg-white/20 text-white hover:bg-white/30">
              <Calendar className="w-4 h-4" />
              Расписание
            </Link>
          </div>
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute left-1/2 bottom-0 w-40 h-40 bg-yellow-400/10 rounded-full translate-y-1/2" />
      </section>

      {!season && (
        <div className="card p-8 text-center">
          <p className="text-slate-600">
            Активный сезон не найден. Администратор должен создать сезон в панели управления.
          </p>
          <Link href="/admin" className="btn-primary mt-4 inline-flex">
            Перейти в админ-панель
          </Link>
        </div>
      )}

      {season && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Турнирная таблица (топ-5) */}
          <div className="card lg:col-span-2">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Турнирная таблица
              </h2>
              <Link href="/standings" className="text-sm text-primary-600 hover:underline">
                Полная таблица →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-left">
                    <th className="px-4 py-3 font-medium">#</th>
                    <th className="px-4 py-3 font-medium">Команда</th>
                    <th className="px-4 py-3 font-medium text-center">И</th>
                    <th className="px-4 py-3 font-medium text-center">В</th>
                    <th className="px-4 py-3 font-medium text-center">Н</th>
                    <th className="px-4 py-3 font-medium text-center">П</th>
                    <th className="px-4 py-3 font-medium text-center">М</th>
                    <th className="px-4 py-3 font-medium text-center">О</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                        Матчи ещё не сыграны
                      </td>
                    </tr>
                  ) : (
                    standings.map((row: any, i: number) => (
                      <tr key={row.team_id} className="border-t border-slate-50 hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-semibold text-slate-400">{i + 1}</td>
                        <td className="px-4 py-3 font-medium">{row.team_name}</td>
                        <td className="px-4 py-3 text-center">{row.played}</td>
                        <td className="px-4 py-3 text-center text-green-600">{row.won}</td>
                        <td className="px-4 py-3 text-center text-slate-500">{row.drawn}</td>
                        <td className="px-4 py-3 text-center text-red-500">{row.lost}</td>
                        <td className="px-4 py-3 text-center text-xs">
                          {row.goals_for}:{row.goals_against}
                        </td>
                        <td className="px-4 py-3 text-center font-bold">{row.points}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Бомбардиры */}
          <div className="card">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-red-500" />
                Бомбардиры
              </h2>
              <Link href="/stats" className="text-sm text-primary-600 hover:underline">
                Все →
              </Link>
            </div>
            <ul className="divide-y divide-slate-50">
              {topScorers.length === 0 ? (
                <li className="px-5 py-8 text-center text-slate-400 text-sm">Нет данных</li>
              ) : (
                topScorers.map((s: any, i: number) => (
                  <li key={s.player_id} className="px-5 py-3 flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{s.player_name}</p>
                      <p className="text-xs text-slate-400 truncate">{s.team_name}</p>
                    </div>
                    <span className="font-bold text-primary-600">{s.goals}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      )}

      {/* Ближайшие матчи */}
      {season && upcoming.length > 0 && (
        <div className="card">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Ближайшие матчи
            </h2>
          </div>
          <div className="divide-y divide-slate-50">
            {upcoming.map((m: any) => (
              <div key={m.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="text-sm text-slate-500 w-32">
                  {m.match_date
                    ? new Date(m.match_date).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'short',
                      })
                    : 'Дата не указана'}
                  {m.match_time && (
                    <span className="ml-1 font-medium text-slate-700">
                      {m.match_time.slice(0, 5)}
                    </span>
                  )}
                </div>
                <div className="flex-1 flex items-center justify-center gap-4 font-medium">
                  <span className="text-right flex-1">{m.home_team?.name}</span>
                  <span className="text-slate-400 text-sm">vs</span>
                  <span className="text-left flex-1">{m.away_team?.name}</span>
                </div>
                {m.round && (
                  <span className="badge bg-slate-100 text-slate-600 text-xs">
                    {m.round.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Быстрые ссылки */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { href: '/teams', icon: Users, label: 'Команды', color: 'bg-blue-50 text-blue-600' },
          { href: '/stats', icon: Target, label: 'Статистика', color: 'bg-red-50 text-red-600' },
          { href: '/schedule', icon: Calendar, label: 'Расписание', color: 'bg-green-50 text-green-600' },
          { href: '/posters', icon: Shield, label: 'Афиши туров', color: 'bg-purple-50 text-purple-600' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="card p-5 hover:shadow-md transition flex flex-col items-center gap-2 text-center"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <span className="font-semibold text-sm">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
