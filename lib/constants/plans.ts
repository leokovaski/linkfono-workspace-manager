import type { PlanConfig } from '@/types';

// NOTE: Update these with your actual Stripe Price IDs from your Stripe Dashboard
export const PLANS: Record<string, PlanConfig> = {
  individual: {
    id: 'individual',
    name: 'Plano Individual',
    description: 'Ideal para profissionais autônomos',
    price: 97, // R$ 97/mês
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_INDIVIDUAL || 'price_1RLz2HJ7ZqaKlLkgT0h7fbj7',
    maxPatients: 15,
    maxMembers: 1,
    features: [
      'Até 15 pacientes',
      '1 membro (você)',
      'Gestão de agenda',
      'Prontuário eletrônico',
      'Lembretes automáticos',
      'Suporte via email',
    ],
  },
  fono_plus: {
    id: 'fono_plus',
    name: 'Plano Fono+',
    description: 'Para clínicas pequenas e médias',
    price: 197, // R$ 197/mês
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_FONO_PLUS || 'price_1SUFu5J7ZqaKlLkgU9unKGZN',
    maxPatients: 30,
    maxMembers: 3,
    popular: true,
    features: [
      'Até 30 pacientes',
      'Até 3 membros (1 owner + 2 membros)',
      'Gestão de agenda compartilhada',
      'Prontuário eletrônico',
      'Lembretes automáticos',
      'Relatórios básicos',
      'Suporte prioritário',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Plano Pro',
    description: 'Para clínicas grandes sem limites',
    price: 397, // R$ 397/mês
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || 'price_1RLz3YJ7ZqaKlLkgHElrd0BX',
    maxPatients: -1, // -1 = unlimited
    maxMembers: -1, // -1 = unlimited
    features: [
      'Pacientes ilimitados',
      'Membros ilimitados',
      'Gestão de agenda avançada',
      'Prontuário eletrônico',
      'Lembretes automáticos',
      'Relatórios avançados',
      'Integrações personalizadas',
      'Suporte prioritário 24/7',
      'Treinamento personalizado',
    ],
  },
};

export const PLAN_TYPES = Object.keys(PLANS);

export function getPlanConfig(planType: string): PlanConfig | undefined {
  return PLANS[planType];
}

export function getPlanName(planType: string): string {
  return PLANS[planType]?.name || planType;
}

export function getPlanPrice(planType: string): number {
  return PLANS[planType]?.price || 0;
}

export function getStripePriceId(planType: string): string {
  return PLANS[planType]?.stripePriceId || '';
}
