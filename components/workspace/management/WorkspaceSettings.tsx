'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, Save } from 'lucide-react';
import type { WorkspaceSettings as WorkspaceSettingsType } from '@/types';

interface WorkspaceSettingsProps {
  workspaceId: string;
  settings: WorkspaceSettingsType;
  onUpdate: (settings: WorkspaceSettingsType) => void;
}

interface SettingsFormData {
  appointment_duration: number;
  reminder_hours_before: number;
}

export function WorkspaceSettings({ workspaceId, settings, onUpdate }: WorkspaceSettingsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<SettingsFormData>({
    defaultValues: {
      appointment_duration: settings.appointment_duration,
      reminder_hours_before: settings.reminder_hours_before,
    },
  });

  const onSubmit = async (data: SettingsFormData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to update settings');
      }

      setSuccess(true);
      onUpdate(result.data);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating settings:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Configurações</h2>
        <p className="text-sm text-gray-600">
          Ajuste as configurações do seu workspace
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <div>
          <label htmlFor="appointment_duration" className="block text-sm font-medium text-gray-700 mb-2">
            Duração Padrão dos Agendamentos (minutos)
          </label>
          <input
            id="appointment_duration"
            type="number"
            min="15"
            max="240"
            step="5"
            {...register('appointment_duration', {
              required: 'Duração é obrigatória',
              min: { value: 15, message: 'Duração mínima é 15 minutos' },
              max: { value: 240, message: 'Duração máxima é 240 minutos' },
            })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.appointment_duration && (
            <p className="mt-1 text-sm text-red-600">{errors.appointment_duration.message}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Tempo padrão para cada consulta/atendimento
          </p>
        </div>

        <div>
          <label htmlFor="reminder_hours_before" className="block text-sm font-medium text-gray-700 mb-2">
            Enviar Lembrete (horas antes)
          </label>
          <input
            id="reminder_hours_before"
            type="number"
            min="1"
            max="168"
            {...register('reminder_hours_before', {
              required: 'Horário do lembrete é obrigatório',
              min: { value: 1, message: 'Mínimo de 1 hora' },
              max: { value: 168, message: 'Máximo de 168 horas (7 dias)' },
            })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.reminder_hours_before && (
            <p className="mt-1 text-sm text-red-600">{errors.reminder_hours_before.message}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Quantas horas antes do agendamento o lembrete será enviado
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">Configurações atualizadas com sucesso!</p>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading || !isDirty}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="-ml-1 mr-2 h-5 w-5" />
                Salvar Alterações
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
