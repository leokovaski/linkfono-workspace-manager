'use client';

import { motion } from 'framer-motion';
import { Building2, MapPin, Clock, Sparkles, ArrowLeft, CheckCircle } from 'lucide-react';
import { PLANS } from '@/lib/constants/plans';
import type { WorkspaceFormData, PlanType, WorkspaceSettingsFormData } from '@/types';

interface ConfirmStepProps {
  workspaceData: WorkspaceFormData & { settings: WorkspaceSettingsFormData };
  planType: PlanType;
  trialAvailable: boolean;
  onBack: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export function ConfirmStep({
  workspaceData,
  planType,
  trialAvailable,
  onBack,
  onConfirm,
  loading = false,
}: ConfirmStepProps) {
  const selectedPlan = PLANS[planType];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <CheckCircle className="w-7 h-7 text-green-600" />
          Confirme seus dados
        </h2>
        <p className="text-gray-600 text-sm sm:text-base">
          Revise as informações antes de finalizar
        </p>
      </div>

      {/* Summary Cards */}
      <div className="space-y-6">
        {/* Workspace Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-2 border-gray-200 rounded-2xl p-6"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-3">Seu Espaço</h3>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-gray-500 inline">Nome:</dt>
                  <dd className="text-gray-900 font-medium inline ml-2">{workspaceData.name}</dd>
                </div>
                {workspaceData.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <dd className="text-gray-900">
                        {workspaceData.address}, {workspaceData.number}
                        {workspaceData.complement && ` - ${workspaceData.complement}`}
                      </dd>
                      <dd className="text-gray-600">
                        {workspaceData.neighborhood && `${workspaceData.neighborhood}, `}
                        {workspaceData.city} - {workspaceData.state}
                      </dd>
                      <dd className="text-gray-600">CEP: {workspaceData.zip_code}</dd>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">
                    Atendimentos de {workspaceData.settings.appointment_duration} minutos
                  </span>
                </div>
              </dl>
            </div>
          </div>
        </motion.div>

        {/* Plan Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-6"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedPlan.name}</h3>
                  <p className="text-sm text-gray-600">{selectedPlan.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    R$ {selectedPlan.price}
                  </div>
                  <div className="text-sm text-gray-600">/mês</div>
                </div>
              </div>

              {trialAvailable && (
                <div className="bg-white border border-blue-300 rounded-xl p-4 mb-4">
                  <p className="text-sm font-medium text-blue-900">
                    🎉 Você tem 7 dias grátis para testar!
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Aproveite o período de teste sem compromisso. Cancele quando quiser.
                  </p>
                </div>
              )}

              <ul className="space-y-2">
                {selectedPlan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Terms */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-50 border border-gray-200 rounded-xl p-4"
      >
        <p className="text-xs text-gray-600 leading-relaxed">
          Ao clicar em "Finalizar", você concorda com nossos{' '}
          <a href="#" className="text-blue-600 hover:underline">
            Termos de Serviço
          </a>{' '}
          e{' '}
          <a href="#" className="text-blue-600 hover:underline">
            Política de Privacidade
          </a>
          . {trialAvailable && 'Seu período de teste começará imediatamente e você poderá cancelar a qualquer momento.'} Após o período de teste, sua assinatura será automaticamente ativada.
        </p>
      </motion.div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-gray-100">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Voltar
        </button>

        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 focus:ring-4 focus:ring-green-500/20 transition-all shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2 min-w-[200px]"
        >
          {loading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
              Processando...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              Finalizar
            </>
          )}
        </button>
      </div>
    </div>
  );
}
