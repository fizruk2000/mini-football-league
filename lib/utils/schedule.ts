/**
 * Генератор расписания для разных систем проведения
 */

export type TeamId = string;

export interface GeneratedMatch {
  home_team_id: TeamId;
  away_team_id: TeamId;
  round: number;
}

/**
 * Круговая система (каждый с каждым)
 * Классический алгоритм "круг" / "круг-робин"
 */
export function generateRoundRobin(teams: TeamId[], double: boolean = false): GeneratedMatch[] {
  if (teams.length < 2) return [];

  const n = teams.length;
  const isOdd = n % 2 === 1;
  const teamList = isOdd ? [...teams, 'BYE'] : [...teams];
  const totalTeams = teamList.length;
  const rounds = totalTeams - 1;
  const matchesPerRound = totalTeams / 2;

  const matches: GeneratedMatch[] = [];

  for (let round = 0; round < rounds; round++) {
    for (let i = 0; i < matchesPerRound; i++) {
      const home = teamList[i];
      const away = teamList[totalTeams - 1 - i];

      if (home !== 'BYE' && away !== 'BYE') {
        matches.push({
          home_team_id: home,
          away_team_id: away,
          round: round + 1,
        });
      }
    }

    // Rotate teams (кроме первого)
    const last = teamList.pop()!;
    teamList.splice(1, 0, last);
  }

  if (double) {
    // Второй круг — меняем хозяев и гостей
    const secondHalf = matches.map((m) => ({
      home_team_id: m.away_team_id,
      away_team_id: m.home_team_id,
      round: m.round + rounds,
    }));
    return [...matches, ...secondHalf];
  }

  return matches;
}

/**
 * Групповой этап + плей-офф (упрощённо)
 * Разбивает команды на группы по 4 (или меньше)
 */
export function generateGroups(
  teams: TeamId[],
  groupSize: number = 4
): { groups: TeamId[][]; matches: GeneratedMatch[] } {
  const groups: TeamId[][] = [];
  const shuffled = [...teams].sort(() => Math.random() - 0.5);

  for (let i = 0; i < shuffled.length; i += groupSize) {
    groups.push(shuffled.slice(i, i + groupSize));
  }

  const matches: GeneratedMatch[] = [];
  let roundOffset = 0;

  groups.forEach((group, groupIndex) => {
    const groupMatches = generateRoundRobin(group, false);
    groupMatches.forEach((m) => {
      matches.push({
        ...m,
        round: m.round + roundOffset,
      });
    });
    // Каждая группа имеет свои туры
    const maxRound = Math.max(...groupMatches.map((m) => m.round), 0);
    roundOffset += maxRound;
  });

  return { groups, matches };
}

/**
 * Простой плей-офф (на 4, 8, 16 команд)
 */
export function generatePlayoff(teams: TeamId[]): GeneratedMatch[] {
  if (teams.length < 2 || (teams.length & (teams.length - 1)) !== 0) {
    // Не степень двойки — дополняем BYE или ошибка
    console.warn('Количество команд должно быть степенью 2 для чистого плей-офф');
  }

  const matches: GeneratedMatch[] = [];
  let current = [...teams];
  let round = 1;

  while (current.length > 1) {
    const next: TeamId[] = [];
    for (let i = 0; i < current.length; i += 2) {
      if (i + 1 < current.length) {
        matches.push({
          home_team_id: current[i],
          away_team_id: current[i + 1],
          round,
        });
        // Победитель пока неизвестен — в реальном приложении заполняется после матча
        next.push(`WINNER_${round}_${i / 2}`);
      } else {
        next.push(current[i]); // BYE
      }
    }
    current = next;
    round++;
  }

  return matches;
}

/**
 * Главная функция генерации по системе
 */
export function generateSchedule(
  teams: TeamId[],
  system: 'round_robin' | 'groups' | 'playoff' | 'swiss',
  options: { double?: boolean; groupSize?: number } = {}
): GeneratedMatch[] {
  switch (system) {
    case 'round_robin':
      return generateRoundRobin(teams, options.double ?? true);
    case 'groups':
      return generateGroups(teams, options.groupSize ?? 4).matches;
    case 'playoff':
      return generatePlayoff(teams);
    case 'swiss':
      // Упрощённый швейцарский — пока как круговой
      return generateRoundRobin(teams, false);
    default:
      return generateRoundRobin(teams, true);
  }
}
