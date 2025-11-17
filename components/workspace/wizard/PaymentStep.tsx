'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { getPlanConfig } from '@/lib/constants/plans';
import type { PlanType, WorkspaceFormData } from '@/types';

interface PaymentStepProps {
  workspaceData: WorkspaceFormData;
  planType: PlanType;
  settings: {
    appointment_duration: number;
    reminder_hours_before: number;
  };
  trialAvailable: boolean;
  onBack: () => void;
}

export function PaymentStep({
  workspaceData,
  planType,
  settings,
  trialAvailable,
  onBack
}: PaymentStepProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plan = getPlanConfig(planType);

  const handleSubmit = async () => {
    if (!plan) return;

    setLoading(true);
    setError(null);

    try {
      // Create workspace
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...workspaceData,
          plan_type: planType,
          settings,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create workspace');
      }

      // Get client secret from subscription
      const subscription = result.data.workspace.stripe_subscription_id;

      if (!subscription) {
        throw new Error('No subscription created');
      }

      // For simplicity, redirect to success page
      // In production, you would handle Stripe payment confirmation here
      window.location.href = `/workspace/${result.data.workspace.id}?success=true`;
    } catch (err) {
      console.error('Error creating workspace:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!plan) {
    return <div>Plano inválido</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Confirme e Finalize
        </h2>
        <p className="text-gray-600">
          Revise as informações antes de criar seu workspace
        </p>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Workspace</h3>
          <p className="text-lg font-semibold text-gray-900">{workspaceData.name}</p>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Plano Selecionado</h3>
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-lg font-semibold text-gray-900">{plan.name}</p>
              <p className="text-sm text-gray-600">{plan.description}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">R$ {plan.price}</p>
              <p className="text-sm text-gray-600">/mês</p>
            </div>
          </div>
        </div>

        {trialAvailable && (
          <div className="border-t border-gray-200 pt-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm font-medium text-green-800">
                Período de Teste: 7 dias grátis
              </p>
              <p className="text-xs text-green-700 mt-1">
                Você será cobrado apenas após o término do período de teste
              </p>
            </div>
          </div>
        )}

        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Configurações</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Duração do agendamento:</span>
              <span className="font-medium text-gray-900">{settings.appointment_duration} minutos</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Lembrete enviado:</span>
              <span className="font-medium text-gray-900">{settings.reminder_hours_before}h antes</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Recursos Incluídos</h3>
          <ul className="space-y-1">
            {plan.features.map((feature, index) => (
              <li key={index} className="text-sm text-gray-700 flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-xs text-blue-700">
          Ao clicar em "Criar Workspace", você concorda com nossos termos de serviço e
          autoriza a cobrança mensal de R$ {plan.price} após o período de teste (se aplicável).
          Você pode cancelar a qualquer momento.
        </p>
      </div>

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Voltar
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
              Criando...
            </>
          ) : (
            'Criar Workspace'
          )}
        </button>
      </div>
    </div>
  );
}
