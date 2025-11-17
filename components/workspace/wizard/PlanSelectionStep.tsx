'use client';

import { useState } from 'react';
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
              <span className="font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
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
          className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-5 sm:p-6"
        >
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Info className="w-5 h-5 text-blue-600" />
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

      {/* Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {Object.values(PLANS).map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <PlanCard
              plan={plan}
              selected={selectedPlan === plan.id}
              onSelect={() => setSelectedPlan(plan.id as PlanType)}
            />
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-gray-100">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center justify-center gap-2 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Voltar
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!selectedPlan}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-500/20 transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2 group"
        >
          Continuar
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
