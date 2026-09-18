import { createClient } from '@/lib/supabase/server';
import { Trophy } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function StandingsPage() {
  const supabase = createClient();

  const { data: season } = await supabase
    .from('seasons')
    .select('*')
    .eq('is_active', true)
    .single();

  if (!season) {
    return (
      <div className="card p-12 text-center">
        <p className="text-slate-500">Активный сезон не найден</p>
      </div>
    );
  }

  const { data: standings } = await supabase
    .from('standings')
    .select('*')
    .eq('season_id', season.id)
    .order('points', { ascending: false })
    .order('goal_diff', { ascending: false })
    .order('goals_for', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Trophy className="w-8 h-8 text-yellow-500" />
        <div>
          <h1 className="text-2xl font-bold">Турнирная таблица</h1>
          <p className="text-slate-500 text-sm">{season.name} • {season.year}</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-pitch-green text-white">
                <th className="px-4 py-3 text-left font-semibold w-12">#</th>
                <th className="px-4 py-3 text-left font-semibold">Команда</th>
                <th className="px-4 py-3 text-center font-semibold">И</th>
                <th className="px-4 py-3 text-center font-semibold">В</th>
                <th className="px-4 py-3 text-center font-semibold">Н</th>
                <th className="px-4 py-3 text-center font-semibold">П</th>
                <th className="px-4 py-3 text-center font-semibold">ЗМ</th>
                <th className="px-4 py-3 text-center font-semibold">ПМ</th>
                <th className="px-4 py-3 text-center font-semibold">РМ</th>
                <th className="px-4 py-3 text-center font-semibold">О</th>
              </tr>
            </thead>
            <tbody>
              {!standings || standings.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-slate-400">
                    Матчи ещё не сыграны. Таблица появится после внесения результатов.
                  </td>
                </tr>
              ) : (
                standings.map((row: any, i: number) => (
                  <tr
                    key={row.team_id}
                    className={`border-t border-slate-100 hover:bg-slate-50 transition ${
                      i < 3 ? 'bg-green-50/50' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex w-7 h-7 items-center justify-center rounded-full text-xs font-bold ${
                          i === 0
                            ? 'bg-yellow-400 text-yellow-900'
                            : i === 1
                            ? 'bg-slate-300 text-slate-700'
                            : i === 2
                            ? 'bg-amber-600 text-white'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold">{row.team_name}</td>
                    <td className="px-4 py-3 text-center">{row.played}</td>
                    <td className="px-4 py-3 text-center text-green-600 font-medium">{row.won}</td>
                    <td className="px-4 py-3 text-center text-slate-500">{row.drawn}</td>
                    <td className="px-4 py-3 text-center text-red-500 font-medium">{row.lost}</td>
                    <td className="px-4 py-3 text-center">{row.goals_for}</td>
                    <td className="px-4 py-3 text-center">{row.goals_against}</td>
                    <td className="px-4 py-3 text-center font-medium">
                      <span className={row.goal_diff > 0 ? 'text-green-600' : row.goal_diff < 0 ? 'text-red-500' : ''}>
                        {row.goal_diff > 0 ? '+' : ''}{row.goal_diff}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-lg">{row.points}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 bg-slate-50 text-xs text-slate-500 border-t">
          И — игры, В — победы, Н — ничьи, П — поражения, ЗМ — забитые мячи, ПМ — пропущенные, РМ — разница мячей, О — очки
        </div>
      </div>
    </div>
  );
}
