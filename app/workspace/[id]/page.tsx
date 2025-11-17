'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { WorkspaceOverview } from '@/components/workspace/management/WorkspaceOverview';
import { WorkspaceSettings } from '@/components/workspace/management/WorkspaceSettings';
import { PlanManagement } from '@/components/workspace/management/PlanManagement';
import type { Workspace, WorkspaceSettings as WorkspaceSettingsType } from '@/types';

type TabType = 'overview' | 'settings' | 'plan';

export default function WorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [settings, setSettings] = useState<WorkspaceSettingsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Resolve params promise
  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  useEffect(() => {
    if (!resolvedParams) return;

    const fetchWorkspace = async () => {
      try {
        const response = await fetch(`/api/workspaces/${resolvedParams.id}`);
        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch workspace');
        }

        setWorkspace(result.data.workspace);
        setSettings(result.data.workspace.workspace_settings[0]);
      } catch (err) {
        console.error('Error fetching workspace:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspace();
  }, [resolvedParams]);

  const tabs = [
    { id: 'overview' as TabType, name: 'Visão Geral' },
    { id: 'settings' as TabType, name: 'Configurações' },
    { id: 'plan' as TabType, name: 'Plano' },
  ];

  const handleWorkspaceUpdate = (updatedWorkspace: Workspace) => {
    setWorkspace(updatedWorkspace);
  };

  const handleSettingsUpdate = (updatedSettings: WorkspaceSettingsType) => {
    setSettings(updatedSettings);
  };

  const handleWorkspaceDelete = () => {
    alert('Workspace deletado com sucesso. Redirecionando...');
    // In a real app, you would redirect to a dashboard or home page
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !workspace || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-lg font-semibold text-red-900 mb-2">Erro</h2>
          <p className="text-sm text-red-700">{error || 'Workspace not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <button
              onClick={() => router.back()}
              className="text-sm text-gray-600 hover:text-gray-900 mb-4"
            >
              ← Voltar
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{workspace.name}</h1>
          </div>

          {/* Tabs */}
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <WorkspaceOverview workspace={workspace} settings={settings} />
        )}

        {activeTab === 'settings' && resolvedParams && (
          <WorkspaceSettings
            workspaceId={resolvedParams.id}
            settings={settings}
            onUpdate={handleSettingsUpdate}
          />
        )}

        {activeTab === 'plan' && (
          <PlanManagement
            workspace={workspace}
            onUpdate={handleWorkspaceUpdate}
            onDelete={handleWorkspaceDelete}
          />
        )}
      </div>
    </div>
  );
}
