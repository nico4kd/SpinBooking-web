import { Badge } from '../../components/ui';

const DIFFICULTY_MAP: Record<string, { label: string; variant: 'success' | 'primary' | 'hot' | 'default' }> = {
  BEGINNER: { label: 'Principiante', variant: 'success' },
  INTERMEDIATE: { label: 'Intermedio', variant: 'primary' },
  ADVANCED: { label: 'Avanzado', variant: 'hot' },
  ALL_LEVELS: { label: 'Todos los niveles', variant: 'default' },
};

export function getDifficultyBadge(level: string) {
  const entry = DIFFICULTY_MAP[level];
  if (!entry) return <Badge variant="default">{level}</Badge>;
  return <Badge variant={entry.variant}>{entry.label}</Badge>;
}

export function getDifficultyLabel(level: string): string {
  return DIFFICULTY_MAP[level]?.label ?? level;
}
