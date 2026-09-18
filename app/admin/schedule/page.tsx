'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { generateSchedule } from '@/lib/utils/schedule';
import toast from 'react-hot-toast';
import { Calendar, Wand2 } from 'lucide-react';

export default function AdminSchedulePage() {
  const [season, setSeason] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [doubleRound, setDoubleRound] = useState(true);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: s } = await supabase.from('seasons').select('*').eq('is_active', true).single();
      setSeason(s);
      if (s) {
        const { data } = await supabase.from('teams').select('id, name').eq('season_id', s.id);
        setTeams(data || []);
      }
    };
    load();
  }, []);

  const generatePreview = () => {
    if (teams.length < 2) {
      toast.error('Нужно минимум 2 команды');
      return;
    }
    const teamIds = teams.map((t) => t.id);
    const matches = generateSchedule(teamIds, season?.system || 'round_robin', {
      double: doubleRound,
    });
    setPreview(matches);
    toast.success(`Сгенерировано ${matches.length} матчей`);
  };

  const saveSchedule = async () => {
    if (preview.length === 0) {
      toast.error('Сначала сгенерируйте расписание');
      return;
    }
    if (!confirm('Это удалит существующие матчи и туры текущего сезона. Продолжить?')) return;

    setLoading(true);

    // Delete old
    await supabase.from('matches').delete().eq('season_id', season.id);
    await supabase.from('rounds').delete().eq('season_id', season.id);

    // Create rounds
    const maxRound = Math.max(...preview.map((m) => m.round));
    const roundMap: Record<number, string> = {};

    for (let i = 1; i <= maxRound; i++) {
      const { data, error } = await supabase
        .from('rounds')
        .insert({
          season_id: season.id,
          number: i,
          name: `Тур ${i}`,
        })
        .select()
        .single();
      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }
      roundMap[i] = data.id;
    }

    // Create matches
    const matchInserts = preview.map((m) => ({
      season_id: season.id,
      round_id: roundMap[m.round],
      home_team_id: m.home_team_id,
      away_team_id: m.away_team_id,
      status: 'scheduled',
    }));

    const { error } = await supabase.from('matches').insert(matchInserts);
    if (error) toast.error(error.message);
    else {
      toast.success(`Сохранено: ${maxRound} туров, ${matchInserts.length} матчей`);
      setPreview([]);
    }
    setLoading(false);
  };

  const teamName = (id: string) => teams.find((t) => t.id === id)?.name || id.slice(0, 6);

  if (!season) {
    return (
      <div className="card p-12 text-center text-slate-400">
        Сначала создайте сезон
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Calendar className="w-7 h-7 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold">Генератор расписания</h1>
          <p className="text-sm text-slate-500">
            Система: {season.system === 'round_robin' ? 'круговая' : season.system} • Команд: {teams.length}
          </p>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        {season.system === 'round_robin' && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={doubleRound}
              onChange={(e) => setDoubleRound(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm font-medium">Двухкруговой турнир (дома и в гостях)</span>
          </label>
        )}

        <div className="flex gap-3">
          <button onClick={generatePreview} className="btn-primary">
            <Wand2 className="w-4 h-4" />
            Сгенерировать превью
          </button>
          {preview.length > 0 && (
            <button onClick={saveSchedule} className="btn-secondary" disabled={loading}>
              {loading ? 'Сохранение...' : `Сохранить ${preview.length} матчей`}
            </button>
          )}
        </div>
      </div>

      {preview.length > 0 && (
        <div className="card">
          <div className="px-5 py-4 border-b">
            <h2 className="font-bold">Превью расписания</h2>
          </div>
          <div className="max-h-[500px] overflow-y-auto divide-y text-sm">
            {preview.map((m, i) => (
              <div key={i} className="px-5 py-2 flex items-center gap-4">
                <span className="w-16 text-slate-400">Тур {m.round}</span>
                <span className="flex-1 text-right font-medium">{teamName(m.home_team_id)}</span>
                <span className="text-slate-400">vs</span>
                <span className="flex-1 font-medium">{teamName(m.away_team_id)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
