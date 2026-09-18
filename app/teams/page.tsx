import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function TeamsPage() {
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

  const { data: teams } = await supabase
    .from('teams')
    .select(`
      *,
      players:players(count)
    `)
    .eq('season_id', season.id)
    .order('name');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="w-8 h-8 text-blue-500" />
        <div>
          <h1 className="text-2xl font-bold">Команды</h1>
          <p className="text-slate-500 text-sm">{season.name} • {teams?.length || 0} команд</p>
        </div>
      </div>

      {!teams || teams.length === 0 ? (
        <div className="card p-12 text-center text-slate-400">
          Команды ещё не добавлены
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {teams.map((team: any) => (
            <Link
              key={team.id}
              href={`/teams/${team.id}`}
              className="card p-5 hover:shadow-md transition group"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-inner overflow-hidden"
                  style={{ backgroundColor: team.color_primary || '#16a34a' }}
                >
                  {team.emblem_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={team.emblem_url} alt={team.name} className="w-full h-full object-cover" />
                  ) : (
                    team.short_name?.slice(0, 2).toUpperCase() || team.name.slice(0, 2).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg group-hover:text-primary-600 transition truncate">
                    {team.name}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {team.players?.[0]?.count || 0} игроков
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
