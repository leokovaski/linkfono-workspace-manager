'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Info, ArrowLeft, ArrowRight } from 'lucide-react';
import { PlanCard } from '../PlanCard';
import { PLANS } from '@/lib/constants/plans';
import type { PlanType } from '@/types';

interface PlanSelectionStepProps {
  initialPlan?: PlanType;
  trialAvailable: boolean;
  onNext: (planType: PlanType) => void;
  onBack: () => void;
}

export function PlanSelectionStep({
  initialPlan,
  trialAvailable,
  onNext,
  onBack
}: PlanSelectionStepProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanType | undefined>(initialPlan);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Center Fono+ plan on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const fonoPlusIndex = 1; // Fono+ is the second plan (index 1)
      const cardWidth = 320; // 80 * 4 (w-80)
      const gap = 24; // gap-6
      const scrollPosition = (cardWidth + gap) * fonoPlusIndex - (container.offsetWidth / 2) + (cardWidth / 2);

      setTimeout(() => {
        container.scrollTo({ left: scrollPosition, behavior: 'smooth' });
      }, 100);
    }
  }, []);

  const handleNext = () => {
    if (!selectedPlan) {
      alert('Por favor, selecione um plano');
      return;
    }
    onNext(selectedPlan);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-purple-600" />
          Escolha seu Plano
        </h2>
        <p className="text-gray-600 text-sm sm:text-base">
          {trialAvailable ? (
            <>
              Você tem direito a{' '}
              <span className="font-bold text-transparent bg-purple-600 bg-clip-text">
                7 dias de teste grátis
              </span>
              ! Escolha o plano ideal para suas necessidades.
            </>
          ) : (
            'Escolha o plano ideal para suas necessidades.'
          )}
        </p>
      </div>

      {/* Trial Info Banner */}
      {trialAvailable && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-50 to-purple-50 border-2 border-purple-200 rounded-2xl p-5 sm:p-6"
        >
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Info className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">
                Período de Teste Disponível
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Teste gratuitamente por 7 dias. Após o período de teste, sua assinatura será automaticamente
                ativada com o plano escolhido. Cancele a qualquer momento.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Plans Horizontal Scroll */}
      <div className="relative -mx-4 sm:-mx-6 lg:-mx-8">
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 px-4 sm:px-6 lg:px-8 scrollbar-hide"
        >
          {/* Spacer for centering */}
          <div className="flex-shrink-0 w-[calc((100vw-20rem)/2-2rem)]" />

          {Object.values(PLANS).map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex-shrink-0 w-80 snap-center"
            >
              <PlanCard
                plan={plan}
                selected={selectedPlan === plan.id}
                onSelect={() => setSelectedPlan(plan.id as PlanType)}
              />
            </motion.div>
          ))}

          {/* Spacer for centering */}
          <div className="flex-shrink-0 w-[calc((100vw-20rem)/2-2rem)]" />
        </div>

        {/* Scroll indicators */}
        <div className="flex justify-center gap-2 mt-2">
          {Object.values(PLANS).map((plan, index) => (
            <div
              key={plan.id}
              className={`h-2 rounded-full transition-all ${
                selectedPlan === plan.id
                  ? 'w-8 bg-purple-600'
                  : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Actions */}
      <div className="flex justify-between items-center gap-4 pt-6 border-t border-gray-100 mt-6">
        <button
          type="button"
          onClick={onBack}
          className="text-gray-700 font-semibold hover:text-gray-900 transition-all flex items-center gap-2 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Voltar
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!selectedPlan}
          className="px-8 py-3 bg-purple-500 text-white font-semibold rounded-xl hover:bg-purple-700-700 focus:ring-4 focus:ring-blue-500/20 transition-all shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2 group"
        >
          Continuar
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
