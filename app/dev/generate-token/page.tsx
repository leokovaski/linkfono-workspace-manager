'use client';

import { useState } from 'react';
import { signJWT } from '@/lib/auth/jwt';

// ATENÇÃO: Remover em produção! Apenas para desenvolvimento
export default function GenerateTokenPage() {
  const [userId, setUserId] = useState('123e4567-e89b-12d3-a456-426614174000');
  const [email, setEmail] = useState('teste@exemplo.com');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  const generateToken = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/dev/generate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email }),
      });

      const data = await response.json();
      setToken(data.token);
    } catch (error) {
      console.error('Error generating token:', error);
      alert('Erro ao gerar token');
    } finally {
      setLoading(false);
    }
  };

  const url = token ? `${window.location.origin}/workspace/new?token=${token}` : '';

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          ⚠️ Gerador de Token - APENAS DESENVOLVIMENTO
        </h1>

        <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-6">
          <p className="text-sm text-yellow-800">
            Esta página deve ser removida em produção! Use apenas para testes locais.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User ID (UUID)
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="123e4567-e89b-12d3-a456-426614174000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="teste@exemplo.com"
            />
          </div>

          <button
            onClick={generateToken}
            disabled={loading}
            className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Gerando...' : 'Gerar Token JWT'}
          </button>
        </div>

        {token && (
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Token Gerado:
              </label>
              <textarea
                value={token}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-xs"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL para Acessar:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={url}
                  readOnly
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(url)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Copiar
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-6 py-3 bg-green-600 text-white text-center font-medium rounded-lg hover:bg-green-700"
              >
                Abrir Nova Aba
              </a>
              <a
                href={url}
                className="flex-1 px-6 py-3 bg-purple-600 text-white text-center font-medium rounded-lg hover:bg-purple-700"
              >
                Abrir Aqui
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
