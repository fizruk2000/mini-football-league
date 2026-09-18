import { createClient } from '@/lib/supabase/server';
import { Calendar } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SchedulePage() {
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

  const { data: rounds } = await supabase
    .from('rounds')
    .select('*')
    .eq('season_id', season.id)
    .order('number');

  const { data: matches } = await supabase
    .from('matches')
    .select(`
      *,
      home_team:teams!matches_home_team_id_fkey(id, name, short_name, emblem_url, color_primary),
      away_team:teams!matches_away_team_id_fkey(id, name, short_name, emblem_url, color_primary),
      round:rounds(id, name, number)
    `)
    .eq('season_id', season.id)
    .order('match_date', { ascending: true })
    .order('match_time', { ascending: true });

  // Group by round
  const byRound: Record<string, any[]> = {};
  (matches || []).forEach((m: any) => {
    const key = m.round_id || 'no-round';
    if (!byRound[key]) byRound[key] = [];
    byRound[key].push(m);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Calendar className="w-8 h-8 text-blue-500" />
        <div>
          <h1 className="text-2xl font-bold">Расписание матчей</h1>
          <p className="text-slate-500 text-sm">{season.name}</p>
        </div>
      </div>

      {(!rounds || rounds.length === 0) && (!matches || matches.length === 0) ? (
        <div className="card p-12 text-center text-slate-400">
          Расписание пока пустое. Администратор создаст его в панели управления.
        </div>
      ) : (
        <div className="space-y-8">
          {(rounds || []).map((round: any) => {
            const roundMatches = byRound[round.id] || [];
            return (
              <div key={round.id} className="card">
                <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="font-bold text-lg">{round.name}</h2>
                  {round.start_date && (
                    <span className="text-sm text-slate-500">
                      {new Date(round.start_date).toLocaleDateString('ru-RU')}
                      {round.end_date && ` — ${new Date(round.end_date).toLocaleDateString('ru-RU')}`}
                    </span>
                  )}
                </div>
                <div className="divide-y divide-slate-50">
                  {roundMatches.length === 0 ? (
                    <div className="px-5 py-6 text-center text-slate-400 text-sm">Нет матчей</div>
                  ) : (
                    roundMatches.map((m: any) => (
                      <MatchRow key={m.id} match={m} />
                    ))
                  )}
                </div>
              </div>
            );
          })}

          {/* Матчи без тура */}
          {byRound['no-round'] && byRound['no-round'].length > 0 && (
            <div className="card">
              <div className="px-5 py-4 bg-slate-50 border-b">
                <h2 className="font-bold text-lg">Без тура</h2>
              </div>
              <div className="divide-y">
                {byRound['no-round'].map((m: any) => (
                  <MatchRow key={m.id} match={m} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MatchRow({ match }: { match: any }) {
  const isFinished = match.status === 'finished';
  const isLive = match.status === 'live';

  return (
    <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:bg-slate-50/50">
      <div className="text-sm text-slate-500 w-36 shrink-0">
        {match.match_date
          ? new Date(match.match_date).toLocaleDateString('ru-RU', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
            })
          : '—'}
        {match.match_time && (
          <span className="ml-2 font-semibold text-slate-800">
            {String(match.match_time).slice(0, 5)}
          </span>
        )}
      </div>

      <div className="flex-1 flex items-center gap-3">
        <div className="flex-1 text-right font-medium truncate">
          {match.home_team?.name}
        </div>

        <div className="shrink-0 min-w-[80px] text-center">
          {isFinished || isLive ? (
            <span className={`text-xl font-bold tabular-nums ${isLive ? 'text-red-600' : ''}`}>
              {match.home_score ?? 0} : {match.away_score ?? 0}
            </span>
          ) : (
            <span className="text-slate-400 text-sm font-medium">vs</span>
          )}
          {isLive && (
            <span className="block text-[10px] font-bold text-red-500 uppercase tracking-wider">Live</span>
          )}
        </div>

        <div className="flex-1 text-left font-medium truncate">
          {match.away_team?.name}
        </div>
      </div>

      <div className="shrink-0">
        <StatusBadge status={match.status} />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    scheduled: { label: 'Запланирован', className: 'bg-slate-100 text-slate-600' },
    live: { label: 'Идёт', className: 'bg-red-100 text-red-700' },
    finished: { label: 'Завершён', className: 'bg-green-100 text-green-700' },
    cancelled: { label: 'Отменён', className: 'bg-orange-100 text-orange-700' },
  };
  const s = map[status] || map.scheduled;
  return <span className={`badge ${s.className}`}>{s.label}</span>;
}
