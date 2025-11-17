'use client';

import { useState } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { PlanCard } from '../PlanCard';
import { PLANS, getPlanConfig } from '@/lib/constants/plans';
import type { Workspace, PlanType } from '@/types';

interface PlanManagementProps {
  workspace: Workspace;
  onUpdate: (workspace: Workspace) => void;
  onDelete: () => void;
}

export function PlanManagement({ workspace, onUpdate, onDelete }: PlanManagementProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanType | undefined>();
  const [changingPlan, setChangingPlan] = useState(false);
  const [deletingWorkspace, setDeletingWorkspace] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentPlan = getPlanConfig(workspace.plan_type);

  const handleChangePlan = async () => {
    if (!selectedPlan) {
      alert('Por favor, selecione um plano');
      return;
    }

    if (selectedPlan === workspace.plan_type) {
      alert('Este já é o plano atual');
      return;
    }

    setChangingPlan(true);
    setError(null);

    try {
      const response = await fetch(`/api/workspaces/${workspace.id}/change-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ new_plan_type: selectedPlan }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to change plan');
      }

      onUpdate(result.data.workspace);
      setSelectedPlan(undefined);
      alert('Plano alterado com sucesso!');
    } catch (err) {
      console.error('Error changing plan:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setChangingPlan(false);
    }
  };

  const handleDelete = async () => {
    setDeletingWorkspace(true);
    setError(null);

    try {
      const response = await fetch(`/api/workspaces/${workspace.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete workspace');
      }

      onDelete();
    } catch (err) {
      console.error('Error deleting workspace:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setShowDeleteConfirm(false);
    } finally {
      setDeletingWorkspace(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Current Plan */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Plano Atual</h2>
        {currentPlan && (
          <div className="max-w-md">
            <PlanCard plan={currentPlan} selected={false} />
          </div>
        )}
      </div>

      {/* Change Plan */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Alterar Plano</h3>
        <p className="text-sm text-gray-600 mb-4">
          Escolha um novo plano para seu workspace. A mudança será aplicada imediatamente com proração proporcional.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {Object.values(PLANS).map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              selected={selectedPlan === plan.id}
              onSelect={() => setSelectedPlan(plan.id as PlanType)}
            />
          ))}
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleChangePlan}
            disabled={changingPlan || !selectedPlan || selectedPlan === workspace.plan_type}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {changingPlan ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                Alterando Plano...
              </>
            ) : (
              'Alterar Plano'
            )}
          </button>
        </div>
      </div>

      {/* Delete Workspace */}
      <div className="border-t border-gray-200 pt-8">
        <h3 className="text-xl font-bold text-red-600 mb-2">Zona de Perigo</h3>
        <p className="text-sm text-gray-600 mb-4">
          Deletar o workspace é uma ação permanente. Seus dados serão mantidos, mas o workspace será desativado.
        </p>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center"
          >
            <Trash2 className="-ml-1 mr-2 h-5 w-5" />
            Deletar Workspace
          </button>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-red-900 mb-2">
              Tem certeza?
            </h4>
            <p className="text-sm text-red-700 mb-4">
              Esta ação irá cancelar sua assinatura e desativar o workspace.
              Os dados serão preservados, mas você não poderá mais acessá-los.
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleDelete}
                disabled={deletingWorkspace}
                className="px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {deletingWorkspace ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    Deletando...
                  </>
                ) : (
                  'Sim, Deletar Workspace'
                )}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deletingWorkspace}
                className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
