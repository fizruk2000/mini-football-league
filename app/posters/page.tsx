'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Image as ImageIcon, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';

export default function PostersPage() {
  const [rounds, setRounds] = useState<any[]>([]);
  const [selectedRound, setSelectedRound] = useState<string>('');
  const [matches, setMatches] = useState<any[]>([]);
  const [season, setSeason] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const posterRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: s } = await supabase
        .from('seasons')
        .select('*')
        .eq('is_active', true)
        .single();
      setSeason(s);

      if (s) {
        const { data: r } = await supabase
          .from('rounds')
          .select('*')
          .eq('season_id', s.id)
          .order('number');
        setRounds(r || []);
        if (r && r.length > 0) setSelectedRound(r[0].id);
      }
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectedRound) return;
    const loadMatches = async () => {
      const { data } = await supabase
        .from('matches')
        .select(`
          *,
          home_team:teams!matches_home_team_id_fkey(name, short_name, emblem_url, color_primary),
          away_team:teams!matches_away_team_id_fkey(name, short_name, emblem_url, color_primary)
        `)
        .eq('round_id', selectedRound)
        .order('match_date')
        .order('match_time');
      setMatches(data || []);
    };
    loadMatches();
  }, [selectedRound]);

  const downloadPoster = async () => {
    if (!posterRef.current) return;
    try {
      const canvas = await html2canvas(posterRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      });
      const link = document.createElement('a');
      const round = rounds.find((r) => r.id === selectedRound);
      link.download = `afisha-${round?.name || 'tur'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('Афиша скачана!');
    } catch (e) {
      toast.error('Ошибка генерации афиши');
      console.error(e);
    }
  };

  if (loading) {
    return <div className="card p-12 text-center text-slate-400">Загрузка...</div>;
  }

  if (!season) {
    return <div className="card p-12 text-center text-slate-400">Активный сезон не найден</div>;
  }

  const currentRound = rounds.find((r) => r.id === selectedRound);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ImageIcon className="w-8 h-8 text-purple-500" />
          <div>
            <h1 className="text-2xl font-bold">Афиши туров</h1>
            <p className="text-slate-500 text-sm">Генерация красивых афиш с эмблемами команд</p>
          </div>
        </div>
        <div className="flex gap-3">
          <select
            className="input max-w-xs"
            value={selectedRound}
            onChange={(e) => setSelectedRound(e.target.value)}
          >
            {rounds.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          <button onClick={downloadPoster} className="btn-primary" disabled={matches.length === 0}>
            <Download className="w-4 h-4" />
            Скачать PNG
          </button>
        </div>
      </div>

      {/* Poster preview */}
      <div className="flex justify-center overflow-x-auto">
        <div
          ref={posterRef}
          className="w-[600px] min-h-[800px] bg-gradient-to-br from-pitch-green via-primary-800 to-slate-900 text-white p-8 rounded-2xl shadow-2xl relative overflow-hidden"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-400/10 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/3" />

          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-8">
              <p className="text-yellow-400 font-semibold tracking-widest text-sm uppercase">
                Гимназическая мини-футбольная лига
              </p>
              <h2 className="text-4xl font-extrabold mt-2 tracking-tight">
                {currentRound?.name || 'Тур'}
              </h2>
              <p className="text-white/60 mt-1">{season.name}</p>
              {currentRound?.start_date && (
                <p className="text-white/50 text-sm mt-1">
                  {new Date(currentRound.start_date).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              )}
            </div>

            {/* Matches */}
            <div className="space-y-4">
              {matches.length === 0 ? (
                <p className="text-center text-white/50 py-12">Нет матчей в этом туре</p>
              ) : (
                matches.map((m) => (
                  <div
                    key={m.id}
                    className="bg-white/10 backdrop-blur rounded-xl p-4 flex items-center gap-3"
                  >
                    {/* Home */}
                    <div className="flex-1 flex items-center gap-3 justify-end">
                      <span className="font-bold text-right text-sm sm:text-base truncate max-w-[120px]">
                        {m.home_team?.short_name || m.home_team?.name}
                      </span>
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold overflow-hidden shrink-0 border-2 border-white/30"
                        style={{ backgroundColor: m.home_team?.color_primary || '#16a34a' }}
                      >
                        {m.home_team?.emblem_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={m.home_team.emblem_url}
                            alt=""
                            className="w-full h-full object-cover"
                            crossOrigin="anonymous"
                          />
                        ) : (
                          (m.home_team?.short_name || '?').slice(0, 2)
                        )}
                      </div>
                    </div>

                    {/* Score / vs */}
                    <div className="px-3 text-center shrink-0">
                      {m.status === 'finished' ? (
                        <span className="text-2xl font-black tabular-nums">
                          {m.home_score}:{m.away_score}
                        </span>
                      ) : (
                        <div>
                          <span className="text-white/40 text-sm font-bold">VS</span>
                          {m.match_time && (
                            <p className="text-xs text-yellow-300 mt-0.5">
                              {String(m.match_time).slice(0, 5)}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Away */}
                    <div className="flex-1 flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold overflow-hidden shrink-0 border-2 border-white/30"
                        style={{ backgroundColor: m.away_team?.color_primary || '#16a34a' }}
                      >
                        {m.away_team?.emblem_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={m.away_team.emblem_url}
                            alt=""
                            className="w-full h-full object-cover"
                            crossOrigin="anonymous"
                          />
                        ) : (
                          (m.away_team?.short_name || '?').slice(0, 2)
                        )}
                      </div>
                      <span className="font-bold text-sm sm:text-base truncate max-w-[120px]">
                        {m.away_team?.short_name || m.away_team?.name}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="mt-10 text-center text-white/40 text-xs">
              <p>Следите за результатами на сайте лиги</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
