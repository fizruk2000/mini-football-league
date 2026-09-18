'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { Users, Plus, Trash2, Upload } from 'lucide-react';

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [season, setSeason] = useState<any>(null);
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [colorPrimary, setColorPrimary] = useState('#16a34a');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const load = async () => {
    const { data: s } = await supabase.from('seasons').select('*').eq('is_active', true).single();
    setSeason(s);
    if (s) {
      const { data } = await supabase.from('teams').select('*').eq('season_id', s.id).order('name');
      setTeams(data || []);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const addTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!season) {
      toast.error('Сначала создайте сезон');
      return;
    }
    setLoading(true);

    const { error } = await supabase.from('teams').insert({
      season_id: season.id,
      name,
      short_name: shortName || name.slice(0, 3).toUpperCase(),
      color_primary: colorPrimary,
    });

    if (error) toast.error(error.message);
    else {
      toast.success('Команда добавлена');
      setName('');
      setShortName('');
      load();
    }
    setLoading(false);
  };

  const deleteTeam = async (id: string) => {
    if (!confirm('Удалить команду и всех её игроков?')) return;
    const { error } = await supabase.from('teams').delete().eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success('Удалено');
      load();
    }
  };

  const uploadEmblem = async (teamId: string, file: File) => {
    const ext = file.name.split('.').pop();
    const path = `${teamId}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('emblems')
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast.error('Ошибка загрузки: ' + uploadError.message);
      return;
    }

    const { data: urlData } = supabase.storage.from('emblems').getPublicUrl(path);

    const { error } = await supabase
      .from('teams')
      .update({ emblem_url: urlData.publicUrl })
      .eq('id', teamId);

    if (error) toast.error(error.message);
    else {
      toast.success('Эмблема загружена');
      load();
    }
  };

  if (!season) {
    return (
      <div className="card p-12 text-center">
        <p className="text-slate-500">Сначала создайте и активируйте сезон в Настройках</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Users className="w-7 h-7 text-blue-600" />
        <h1 className="text-2xl font-bold">Управление командами</h1>
      </div>

      {/* Add form */}
      <div className="card p-6">
        <h2 className="font-bold mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Добавить команду
        </h2>
        <form onSubmit={addTeam} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div className="sm:col-span-2">
            <label className="label">Название</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Спартак" />
          </div>
          <div>
            <label className="label">Краткое</label>
            <input className="input" value={shortName} onChange={(e) => setShortName(e.target.value)} placeholder="СПА" maxLength={5} />
          </div>
          <div>
            <label className="label">Цвет</label>
            <input type="color" className="input h-10 p-1" value={colorPrimary} onChange={(e) => setColorPrimary(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary sm:col-span-4" disabled={loading}>
            {loading ? 'Добавление...' : 'Добавить команду'}
          </button>
        </form>
      </div>

      {/* List */}
      <div className="card">
        <div className="px-5 py-4 border-b">
          <h2 className="font-bold">Команды сезона ({teams.length})</h2>
        </div>
        <ul className="divide-y">
          {teams.length === 0 ? (
            <li className="px-5 py-8 text-center text-slate-400">Команд пока нет</li>
          ) : (
            teams.map((t) => (
              <li key={t.id} className="px-5 py-4 flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold overflow-hidden shrink-0"
                  style={{ backgroundColor: t.color_primary }}
                >
                  {t.emblem_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.emblem_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    t.short_name?.slice(0, 2)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-sm text-slate-500">{t.short_name}</p>
                </div>
                <label className="btn-secondary text-sm cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Эмблема
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadEmblem(t.id, f);
                    }}
                  />
                </label>
                <button onClick={() => deleteTeam(t.id)} className="btn-ghost text-red-500 hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
