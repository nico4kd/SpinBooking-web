import React from 'react';
import { Card } from './card';
import { Button } from './button';
import { Check } from 'lucide-react';

interface ActionCardProps {
  title: string;
  description: string;
  illustration: React.ReactNode;
  benefits?: string[];
  cta: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'hot' | 'outline';
  };
  highlighted?: boolean;
  className?: string;
}

/**
 * ActionCard - Call-to-action card with illustration and benefits
 *
 * Used for: Upsells, feature promotions, onboarding flows
 *
 * @example
 * <ActionCard
 *   title="Paquete Unlimited"
 *   description="Entrena sin límites con acceso ilimitado a todas las clases"
 *   illustration={<Zap className="w-16 h-16" />}
 *   benefits={[
 *     'Clases ilimitadas por 30 días',
 *     'Reserva hasta 7 días anticipados',
 *     'Prioridad en lista de espera',
 *   ]}
 *   cta={{
 *     label: 'Comprar Ahora - $35,000',
 *     onClick: () => handlePurchase('UNLIMITED'),
 *     variant: 'hot',
 *   }}
 *   highlighted
 * />
 */
export function ActionCard({
  title,
  description,
  illustration,
  benefits,
  cta,
  highlighted = false,
  className,
}: ActionCardProps) {
  return (
    <Card
      variant={highlighted ? 'elevated' : 'default'}
      className={`p-8 flex flex-col items-center text-center gap-6 relative ${
        highlighted ? 'border-[hsl(var(--primary))]' : ''
      } ${className || ''}`}
    >
      {/* Glow effect for highlighted cards */}
      {highlighted && (
        <div
          className="absolute inset-0 rounded-[var(--radius-lg)] opacity-20 pointer-events-none"
          style={{
            boxShadow: '0 0 32px hsl(var(--primary) / 0.4)',
          }}
        />
      )}

      {/* Illustration */}
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center"
        style={{
          backgroundColor: highlighted
            ? 'hsl(var(--primary) / 0.15)'
            : 'hsl(var(--surface-2))',
          color: highlighted
            ? 'hsl(var(--primary))'
            : 'hsl(var(--text-secondary))',
        }}
      >
        {illustration}
      </div>

      {/* Content */}
      <div className="space-y-3">
        <h3 className="text-title text-primary">{title}</h3>
        <p className="text-sm text-secondary max-w-sm mx-auto">
          {description}
        </p>
      </div>

      {/* Benefits */}
      {benefits && benefits.length > 0 && (
        <ul className="space-y-2 w-full max-w-sm">
          {benefits.map((benefit, index) => (
            <li
              key={index}
              className="flex items-start gap-2 text-sm text-secondary text-left"
            >
              <Check
                className="w-4 h-4 flex-shrink-0 mt-0.5"
                style={{
                  color: highlighted
                    ? 'hsl(var(--primary))'
                    : 'hsl(var(--success))',
                }}
              />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      )}

      {/* CTA */}
      <Button
        variant={cta.variant || 'primary'}
        onClick={cta.onClick}
        className="w-full max-w-sm mt-2"
        size="lg"
      >
        {cta.label}
      </Button>
    </Card>
  );
}
