import { createClient } from '@/lib/supabase/server';
import { Target, Hand, Shield } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function StatsPage() {
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

  const [{ data: scorers }, { data: assists }, { data: keepers }] = await Promise.all([
    supabase
      .from('top_scorers')
      .select('*')
      .eq('season_id', season.id)
      .order('goals', { ascending: false })
      .limit(20),
    supabase
      .from('top_assists')
      .select('*')
      .eq('season_id', season.id)
      .order('assists', { ascending: false })
      .limit(20),
    supabase
      .from('top_goalkeepers')
      .select('*')
      .eq('season_id', season.id)
      .order('clean_sheets', { ascending: false })
      .order('saves', { ascending: false })
      .limit(10),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Статистика игроков</h1>
        <p className="text-slate-500 text-sm mt-1">{season.name}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Бомбардиры */}
        <div className="card">
          <div className="px-5 py-4 border-b border-slate-100 bg-red-50/50">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-red-500" />
              Лучшие бомбардиры
            </h2>
          </div>
          <ul className="divide-y divide-slate-50">
            {!scorers || scorers.length === 0 ? (
              <li className="px-5 py-8 text-center text-slate-400 text-sm">Нет данных</li>
            ) : (
              scorers.map((s: any, i: number) => (
                <li key={s.player_id} className="px-5 py-3 flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? 'bg-yellow-400 text-yellow-900' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{s.player_name}</p>
                    <p className="text-xs text-slate-400 truncate">{s.team_name}</p>
                  </div>
                  <span className="font-bold text-red-600 text-lg">{s.goals}</span>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Ассистенты */}
        <div className="card">
          <div className="px-5 py-4 border-b border-slate-100 bg-blue-50/50">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Hand className="w-5 h-5 text-blue-500" />
              Лучшие ассистенты
            </h2>
          </div>
          <ul className="divide-y divide-slate-50">
            {!assists || assists.length === 0 ? (
              <li className="px-5 py-8 text-center text-slate-400 text-sm">Нет данных</li>
            ) : (
              assists.map((s: any, i: number) => (
                <li key={s.player_id} className="px-5 py-3 flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? 'bg-yellow-400 text-yellow-900' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{s.player_name}</p>
                    <p className="text-xs text-slate-400 truncate">{s.team_name}</p>
                  </div>
                  <span className="font-bold text-blue-600 text-lg">{s.assists}</span>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Вратари */}
        <div className="card">
          <div className="px-5 py-4 border-b border-slate-100 bg-green-50/50">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              Лучшие вратари
            </h2>
          </div>
          <ul className="divide-y divide-slate-50">
            {!keepers || keepers.length === 0 ? (
              <li className="px-5 py-8 text-center text-slate-400 text-sm">Нет данных</li>
            ) : (
              keepers.map((s: any, i: number) => (
                <li key={s.player_id} className="px-5 py-3 flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? 'bg-yellow-400 text-yellow-900' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{s.player_name}</p>
                    <p className="text-xs text-slate-400 truncate">{s.team_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{s.clean_sheets}</p>
                    <p className="text-[10px] text-slate-400">сухие</p>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
