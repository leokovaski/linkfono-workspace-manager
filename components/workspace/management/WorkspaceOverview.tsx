'use client';

import { Building2, Calendar, Users, CreditCard } from 'lucide-react';
import { getPlanName } from '@/lib/constants/plans';
import type { Workspace, WorkspaceSettings } from '@/types';

interface WorkspaceOverviewProps {
  workspace: Workspace;
  settings: WorkspaceSettings;
}

export function WorkspaceOverview({ workspace, settings }: WorkspaceOverviewProps) {
  const statusColors = {
    trial: 'bg-blue-100 text-blue-800',
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    payment_pending: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800',
    suspended: 'bg-orange-100 text-orange-800',
  };

  const statusLabels = {
    trial: 'Em Teste',
    active: 'Ativo',
    inactive: 'Inativo',
    payment_pending: 'Pagamento Pendente',
    cancelled: 'Cancelado',
    suspended: 'Suspenso',
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{workspace.name}</h2>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              statusColors[workspace.status]
            }`}
          >
            {statusLabels[workspace.status]}
          </span>
          <span className="text-sm text-gray-600">
            Plano {getPlanName(workspace.plan_type)}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pacientes</p>
              <p className="text-2xl font-bold text-gray-900">
                {workspace.max_patients === -1 ? '∞' : workspace.max_patients}
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Membros</p>
              <p className="text-2xl font-bold text-gray-900">
                {workspace.max_members === -1 ? '∞' : workspace.max_members}
              </p>
            </div>
            <Building2 className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Duração</p>
              <p className="text-2xl font-bold text-gray-900">{settings.appointment_duration}min</p>
            </div>
            <Calendar className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Lembrete</p>
              <p className="text-2xl font-bold text-gray-900">{settings.reminder_hours_before}h</p>
            </div>
            <CreditCard className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Workspace Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Informações do Workspace
        </h3>

        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workspace.cpf_cnpj && (
            <div>
              <dt className="text-sm font-medium text-gray-600">CPF/CNPJ</dt>
              <dd className="mt-1 text-sm text-gray-900">{workspace.cpf_cnpj}</dd>
            </div>
          )}

          {workspace.address && (
            <div className="md:col-span-2">
              <dt className="text-sm font-medium text-gray-600">Endereço</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {workspace.address}
                {workspace.number && `, ${workspace.number}`}
                {workspace.complement && ` - ${workspace.complement}`}
                {workspace.neighborhood && (
                  <>
                    <br />
                    {workspace.neighborhood}
                  </>
                )}
                {(workspace.city || workspace.state) && (
                  <>
                    <br />
                    {workspace.city && `${workspace.city}`}
                    {workspace.state && ` - ${workspace.state}`}
                  </>
                )}
                {workspace.zip_code && (
                  <>
                    <br />
                    CEP: {workspace.zip_code}
                  </>
                )}
              </dd>
            </div>
          )}

          <div>
            <dt className="text-sm font-medium text-gray-600">Criado em</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date(workspace.created_at).toLocaleDateString('pt-BR')}
            </dd>
          </div>

          {workspace.trial_ends_at && workspace.status === 'trial' && (
            <div>
              <dt className="text-sm font-medium text-gray-600">Teste termina em</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(workspace.trial_ends_at).toLocaleDateString('pt-BR')}
              </dd>
            </div>
          )}

          {workspace.subscription_ends_at && workspace.status === 'active' && (
            <div>
              <dt className="text-sm font-medium text-gray-600">Próxima cobrança</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(workspace.subscription_ends_at).toLocaleDateString('pt-BR')}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
