'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { Swords, Save, Plus } from 'lucide-react';

export default function AdminMatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [matchDate, setMatchDate] = useState('');
  const [matchTime, setMatchTime] = useState('');
  const [players, setPlayers] = useState<any[]>([]);
  const [eventPlayer, setEventPlayer] = useState('');
  const [eventType, setEventType] = useState('goal');
  const [eventMinute, setEventMinute] = useState('');
  const [events, setEvents] = useState<any[]>([]);
  const supabase = createClient();

  const loadMatches = async () => {
    const { data: s } = await supabase.from('seasons').select('id').eq('is_active', true).single();
    if (!s) return;

    const { data } = await supabase
      .from('matches')
      .select(`
        *,
        home_team:teams!matches_home_team_id_fkey(id, name),
        away_team:teams!matches_away_team_id_fkey(id, name),
        round:rounds(name, number)
      `)
      .eq('season_id', s.id)
      .order('match_date', { ascending: true, nullsFirst: false })
      .order('round_id');
    setMatches(data || []);
  };

  useEffect(() => {
    loadMatches();
  }, []);

  const openMatch = async (m: any) => {
    setSelectedMatch(m);
    setHomeScore(m.home_score?.toString() ?? '');
    setAwayScore(m.away_score?.toString() ?? '');
    setMatchDate(m.match_date || '');
    setMatchTime(m.match_time ? String(m.match_time).slice(0, 5) : '');

    // Load players of both teams
    const { data: pl } = await supabase
      .from('players')
      .select('*, team:teams(name)')
      .in('team_id', [m.home_team_id, m.away_team_id])
      .eq('is_active', true)
      .order('last_name');
    setPlayers(pl || []);

    // Load events
    const { data: ev } = await supabase
      .from('match_events')
      .select('*, player:players(first_name, last_name)')
      .eq('match_id', m.id)
      .order('minute');
    setEvents(ev || []);
  };

  const saveMatch = async () => {
    if (!selectedMatch) return;

    const updates: any = {
      match_date: matchDate || null,
      match_time: matchTime || null,
      updated_at: new Date().toISOString(),
    };

    if (homeScore !== '' && awayScore !== '') {
      updates.home_score = Number(homeScore);
      updates.away_score = Number(awayScore);
      updates.status = 'finished';
    }

    const { error } = await supabase
      .from('matches')
      .update(updates)
      .eq('id', selectedMatch.id);

    if (error) toast.error(error.message);
    else {
      toast.success('Матч сохранён');
      loadMatches();
      setSelectedMatch(null);
    }
  };

  const addEvent = async () => {
    if (!selectedMatch || !eventPlayer) return;

    const player = players.find((p) => p.id === eventPlayer);
    if (!player) return;

    const { error } = await supabase.from('match_events').insert({
      match_id: selectedMatch.id,
      player_id: eventPlayer,
      team_id: player.team_id,
      event_type: eventType,
      minute: eventMinute ? Number(eventMinute) : null,
    });

    if (error) toast.error(error.message);
    else {
      toast.success('Событие добавлено');
      setEventPlayer('');
      setEventMinute('');
      // Reload events
      const { data: ev } = await supabase
        .from('match_events')
        .select('*, player:players(first_name, last_name)')
        .eq('match_id', selectedMatch.id)
        .order('minute');
      setEvents(ev || []);
    }
  };

  const eventLabels: Record<string, string> = {
    goal: 'Гол',
    assist: 'Ассист',
    yellow_card: 'Жёлтая',
    red_card: 'Красная',
    own_goal: 'Автогол',
    save: 'Сейв',
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Swords className="w-7 h-7 text-orange-600" />
        <h1 className="text-2xl font-bold">Матчи и результаты</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* List */}
        <div className="card max-h-[70vh] overflow-y-auto">
          <div className="px-5 py-4 border-b sticky top-0 bg-white">
            <h2 className="font-bold">Все матчи</h2>
          </div>
          <ul className="divide-y">
            {matches.length === 0 ? (
              <li className="px-5 py-8 text-center text-slate-400">Матчей нет</li>
            ) : (
              matches.map((m) => (
                <li
                  key={m.id}
                  onClick={() => openMatch(m)}
                  className={`px-5 py-3 cursor-pointer hover:bg-slate-50 transition ${
                    selectedMatch?.id === m.id ? 'bg-primary-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">{m.round?.name || '—'}</span>
                    <span className={`badge text-xs ${
                      m.status === 'finished' ? 'bg-green-100 text-green-700' :
                      m.status === 'live' ? 'bg-red-100 text-red-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {m.status === 'finished' ? 'Завершён' : m.status === 'scheduled' ? 'Запланирован' : m.status}
                    </span>
                  </div>
                  <div className="mt-1 font-medium flex items-center gap-2">
                    <span className="flex-1 text-right truncate">{m.home_team?.name}</span>
                    <span className="font-bold tabular-nums">
                      {m.status === 'finished' ? `${m.home_score}:${m.away_score}` : 'vs'}
                    </span>
                    <span className="flex-1 truncate">{m.away_team?.name}</span>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Edit panel */}
        <div className="card p-6">
          {!selectedMatch ? (
            <div className="text-center text-slate-400 py-12">
              Выберите матч слева для редактирования
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="font-bold text-lg">
                {selectedMatch.home_team?.name} — {selectedMatch.away_team?.name}
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Дата</label>
                  <input type="date" className="input" value={matchDate} onChange={(e) => setMatchDate(e.target.value)} />
                </div>
                <div>
                  <label className="label">Время</label>
                  <input type="time" className="input" value={matchTime} onChange={(e) => setMatchTime(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Голы хозяев</label>
                  <input type="number" className="input" min={0} value={homeScore} onChange={(e) => setHomeScore(e.target.value)} />
                </div>
                <div>
                  <label className="label">Голы гостей</label>
                  <input type="number" className="input" min={0} value={awayScore} onChange={(e) => setAwayScore(e.target.value)} />
                </div>
              </div>

              <button onClick={saveMatch} className="btn-primary w-full">
                <Save className="w-4 h-4" />
                Сохранить результат
              </button>

              {/* Events */}
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-3">События матча (голы, ассисты...)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                  <div className="sm:col-span-2">
                    <label className="label">Игрок</label>
                    <select className="input" value={eventPlayer} onChange={(e) => setEventPlayer(e.target.value)}>
                      <option value="">Выберите</option>
                      {players.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.last_name} {p.first_name} ({p.team?.name})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Тип</label>
                    <select className="input" value={eventType} onChange={(e) => setEventType(e.target.value)}>
                      <option value="goal">Гол</option>
                      <option value="assist">Ассист</option>
                      <option value="yellow_card">Жёлтая</option>
                      <option value="red_card">Красная</option>
                      <option value="own_goal">Автогол</option>
                      <option value="save">Сейв</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Минута</label>
                    <input type="number" className="input" min={1} max={90} value={eventMinute} onChange={(e) => setEventMinute(e.target.value)} />
                  </div>
                </div>
                <button onClick={addEvent} className="btn-secondary mt-3">
                  <Plus className="w-4 h-4" />
                  Добавить событие
                </button>

                <ul className="mt-4 space-y-2">
                  {events.map((ev) => (
                    <li key={ev.id} className="text-sm flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
                      <span className="badge bg-slate-200 text-slate-700">{eventLabels[ev.event_type]}</span>
                      <span className="font-medium">
                        {ev.player?.last_name} {ev.player?.first_name}
                      </span>
                      {ev.minute && <span className="text-slate-400">{ev.minute}&apos;</span>}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
