'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { Settings, Plus, Check } from 'lucide-react';

export default function AdminSettingsPage() {
  const [seasons, setSeasons] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [system, setSystem] = useState('round_robin');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const load = async () => {
    const { data } = await supabase.from('seasons').select('*').order('year', { ascending: false });
    setSeasons(data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const createSeason = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Deactivate all previous
    await supabase.from('seasons').update({ is_active: false }).neq('id', '00000000-0000-0000-0000-000000000000');

    const { error } = await supabase.from('seasons').insert({
      name,
      year,
      system,
      is_active: true,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Сезон создан и активирован!');
      setName('');
      load();
    }
    setLoading(false);
  };

  const activateSeason = async (id: string) => {
    await supabase.from('seasons').update({ is_active: false }).neq('id', id);
    const { error } = await supabase.from('seasons').update({ is_active: true }).eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success('Сезон активирован');
      load();
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex items-center gap-3">
        <Settings className="w-7 h-7 text-slate-600" />
        <h1 className="text-2xl font-bold">Настройки сезона</h1>
      </div>

      {/* Create */}
      <div className="card p-6">
        <h2 className="font-bold mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Создать новый сезон
        </h2>
        <form onSubmit={createSeason} className="space-y-4">
          <div>
            <label className="label">Название сезона</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Сезон 2025/26"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Год</label>
              <input
                type="number"
                className="input"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                required
              />
            </div>
            <div>
              <label className="label">Система проведения</label>
              <select className="input" value={system} onChange={(e) => setSystem(e.target.value)}>
                <option value="round_robin">Круговая (каждый с каждым)</option>
                <option value="groups">Группы + плей-офф</option>
                <option value="playoff">Плей-офф</option>
                <option value="swiss">Швейцарская</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Создание...' : 'Создать и активировать'}
          </button>
        </form>
      </div>

      {/* List */}
      <div className="card">
        <div className="px-5 py-4 border-b">
          <h2 className="font-bold">Все сезоны</h2>
        </div>
        <ul className="divide-y">
          {seasons.length === 0 ? (
            <li className="px-5 py-8 text-center text-slate-400">Сезонов пока нет</li>
          ) : (
            seasons.map((s) => (
              <li key={s.id} className="px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {s.name}{' '}
                    {s.is_active && (
                      <span className="badge bg-green-100 text-green-700 ml-2">Активный</span>
                    )}
                  </p>
                  <p className="text-sm text-slate-500">
                    {s.year} •{' '}
                    {s.system === 'round_robin'
                      ? 'Круговая'
                      : s.system === 'groups'
                      ? 'Группы'
                      : s.system === 'playoff'
                      ? 'Плей-офф'
                      : 'Швейцарская'}
                  </p>
                </div>
                {!s.is_active && (
                  <button onClick={() => activateSeason(s.id)} className="btn-secondary text-sm">
                    <Check className="w-4 h-4" />
                    Активировать
                  </button>
                )}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
