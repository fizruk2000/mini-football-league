import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function TeamPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: team } = await supabase
    .from('teams')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!team) notFound();

  const { data: players } = await supabase
    .from('players')
    .select('*')
    .eq('team_id', team.id)
    .eq('is_active', true)
    .order('number', { ascending: true, nullsFirst: false })
    .order('last_name');

  const positionLabels: Record<string, string> = {
    GK: 'Вратарь',
    DEF: 'Защитник',
    MID: 'Полузащитник',
    FWD: 'Нападающий',
  };

  return (
    <div className="space-y-6">
      <Link href="/teams" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-primary-600">
        <ArrowLeft className="w-4 h-4" />
        Все команды
      </Link>

      <div className="card p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow overflow-hidden"
          style={{ backgroundColor: team.color_primary || '#16a34a' }}
        >
          {team.emblem_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={team.emblem_url} alt={team.name} className="w-full h-full object-cover" />
          ) : (
            team.short_name?.slice(0, 2).toUpperCase()
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold">{team.name}</h1>
          <p className="text-slate-500 mt-1">Краткое название: {team.short_name}</p>
        </div>
      </div>

      <div className="card">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <User className="w-5 h-5" />
            Состав ({players?.length || 0})
          </h2>
        </div>
        {!players || players.length === 0 ? (
          <div className="px-5 py-10 text-center text-slate-400">Игроки не добавлены</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-left">
                  <th className="px-4 py-3 font-medium w-16">№</th>
                  <th className="px-4 py-3 font-medium">Игрок</th>
                  <th className="px-4 py-3 font-medium">Позиция</th>
                </tr>
              </thead>
              <tbody>
                {players.map((p: any) => (
                  <tr key={p.id} className="border-t border-slate-50 hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-mono text-slate-400">
                      {p.number ?? '—'}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {p.last_name} {p.first_name}
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge bg-slate-100 text-slate-600">
                        {positionLabels[p.position] || p.position}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
