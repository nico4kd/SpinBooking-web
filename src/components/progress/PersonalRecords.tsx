import React from 'react';
import { Trophy, Flame, Calendar, Target, TrendingUp, Award } from 'lucide-react';
import { Card } from '../ui';

interface Record {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  isPersonalBest?: boolean;
}

interface PersonalRecordsProps {
  records: Record[];
  className?: string;
}

/**
 * PersonalRecords - Display achievements and milestones
 *
 * Shows personal bests and notable achievements
 *
 * @example
 * <PersonalRecords
 *   records={[
 *     {
 *       label: 'Racha Más Larga',
 *       value: 14,
 *       icon: Flame,
 *       description: 'días consecutivos',
 *       isPersonalBest: true,
 *     },
 *   ]}
 * />
 */
export function PersonalRecords({ records, className }: PersonalRecordsProps) {
  return (
    <div className={className}>
      <h3 className="text-title mb-4">Récords Personales</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {records.map((record, index) => {
          const Icon = record.icon;

          return (
            <Card
              key={index}
              variant="default"
              className={`p-4 relative overflow-hidden ${
                record.isPersonalBest
                  ? 'ring-2 ring-[hsl(var(--primary))] bg-gradient-to-br from-[hsl(var(--primary)/0.05)] to-transparent'
                  : ''
              }`}
            >
              {/* Personal best badge */}
              {record.isPersonalBest && (
                <div className="absolute top-2 right-2">
                  <div className="w-6 h-6 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center">
                    <Award className="w-3 h-3 text-white" />
                  </div>
                </div>
              )}

              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="w-12 h-12 rounded-lg bg-[hsl(var(--primary)/0.15)] flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-[hsl(var(--primary))]" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-label text-tertiary mb-1">
                    {record.label}
                  </p>
                  <p className="text-data text-3xl mb-1">
                    {record.value}
                  </p>
                  {record.description && (
                    <p className="text-xs text-secondary">
                      {record.description}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Default records with sample data
 */
export const sampleRecords: Record[] = [
  {
    label: 'Racha Más Larga',
    value: 14,
    icon: Flame,
    description: 'días consecutivos',
    isPersonalBest: true,
  },
  {
    label: 'Clases en un Mes',
    value: 28,
    icon: Calendar,
    description: 'Marzo 2026',
    isPersonalBest: true,
  },
  {
    label: 'Calorías en un Día',
    value: 1250,
    icon: Target,
    description: '5 clases en un día',
  },
  {
    label: 'Promedio Mensual',
    value: 18,
    icon: TrendingUp,
    description: 'clases por mes',
  },
  {
    label: 'Nivel Alcanzado',
    value: 'Avanzado',
    icon: Trophy,
    description: '60% clases avanzadas',
  },
  {
    label: 'Total Acumulado',
    value: 156,
    icon: Award,
    description: 'clases completadas',
  },
];
