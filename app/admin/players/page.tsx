'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { UserPlus, Trash2 } from 'lucide-react';

export default function AdminPlayersPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [number, setNumber] = useState('');
  const [position, setPosition] = useState('MID');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const loadTeams = async () => {
    const { data: s } = await supabase.from('seasons').select('id').eq('is_active', true).single();
    if (s) {
      const { data } = await supabase.from('teams').select('*').eq('season_id', s.id).order('name');
      setTeams(data || []);
      if (data && data.length > 0 && !selectedTeam) setSelectedTeam(data[0].id);
    }
  };

  const loadPlayers = async () => {
    if (!selectedTeam) return;
    const { data } = await supabase
      .from('players')
      .select('*')
      .eq('team_id', selectedTeam)
      .order('number', { ascending: true, nullsFirst: false });
    setPlayers(data || []);
  };

  useEffect(() => {
    loadTeams();
  }, []);

  useEffect(() => {
    loadPlayers();
  }, [selectedTeam]);

  const addPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam) return;
    setLoading(true);

    const { error } = await supabase.from('players').insert({
      team_id: selectedTeam,
      first_name: firstName,
      last_name: lastName,
      number: number ? Number(number) : null,
      position,
    });

    if (error) toast.error(error.message);
    else {
      toast.success('Игрок добавлен');
      setFirstName('');
      setLastName('');
      setNumber('');
      loadPlayers();
    }
    setLoading(false);
  };

  const deletePlayer = async (id: string) => {
    if (!confirm('Удалить игрока?')) return;
    const { error } = await supabase.from('players').delete().eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success('Удалён');
      loadPlayers();
    }
  };

  const posLabels: Record<string, string> = {
    GK: 'Вратарь',
    DEF: 'Защитник',
    MID: 'Полузащитник',
    FWD: 'Нападающий',
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <UserPlus className="w-7 h-7 text-green-600" />
        <h1 className="text-2xl font-bold">Управление игроками</h1>
      </div>

      <div className="card p-6">
        <label className="label">Выберите команду</label>
        <select className="input max-w-md" value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)}>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      {selectedTeam && (
        <>
          <div className="card p-6">
            <h2 className="font-bold mb-4">Добавить игрока</h2>
            <form onSubmit={addPlayer} className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-end">
              <div>
                <label className="label">Фамилия</label>
                <input className="input" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
              <div>
                <label className="label">Имя</label>
                <input className="input" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </div>
              <div>
                <label className="label">Номер</label>
                <input type="number" className="input" value={number} onChange={(e) => setNumber(e.target.value)} min={1} max={99} />
              </div>
              <div>
                <label className="label">Позиция</label>
                <select className="input" value={position} onChange={(e) => setPosition(e.target.value)}>
                  <option value="GK">Вратарь</option>
                  <option value="DEF">Защитник</option>
                  <option value="MID">Полузащитник</option>
                  <option value="FWD">Нападающий</option>
                </select>
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                Добавить
              </button>
            </form>
          </div>

          <div className="card">
            <div className="px-5 py-4 border-b">
              <h2 className="font-bold">Состав ({players.length})</h2>
            </div>
            <ul className="divide-y">
              {players.length === 0 ? (
                <li className="px-5 py-8 text-center text-slate-400">Игроков нет</li>
              ) : (
                players.map((p) => (
                  <li key={p.id} className="px-5 py-3 flex items-center gap-4">
                    <span className="w-8 text-center font-mono text-slate-400">{p.number ?? '—'}</span>
                    <div className="flex-1">
                      <p className="font-medium">{p.last_name} {p.first_name}</p>
                    </div>
                    <span className="badge bg-slate-100 text-slate-600">{posLabels[p.position]}</span>
                    <button onClick={() => deletePlayer(p.id)} className="btn-ghost text-red-500 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
