/**
 * EXEMPLO: Como redirecionar do app principal para o Workspace Manager
 *
 * Cole este código no seu app principal (React/Next.js)
 */

import { createClient } from '@supabase/supabase-js';

// ============================================
// Opção 1: Redirecionamento Simples (Client-Side)
// ============================================

export function RedirectToWorkspaceButton() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleRedirect = async () => {
    // Pega o token da sessão atual do Supabase
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      alert('Você precisa estar logado!');
      return;
    }

    // Token JWT do Supabase
    const token = session.access_token;

    // URL do workspace manager (ajuste conforme necessário)
    const workspaceManagerUrl = process.env.NEXT_PUBLIC_WORKSPACE_MANAGER_URL || 'http://localhost:3000';

    // Redireciona com o token na URL
    window.location.href = `${workspaceManagerUrl}/workspace/new?token=${token}`;
  };

  return (
    <button
      onClick={handleRedirect}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Criar Novo Workspace
    </button>
  );
}

// ============================================
// Opção 2: Link Direto com Token (Server-Side)
// ============================================

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function getWorkspaceManagerLink() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return null;
  }

  const workspaceManagerUrl = process.env.NEXT_PUBLIC_WORKSPACE_MANAGER_URL || 'http://localhost:3000';
  return `${workspaceManagerUrl}/workspace/new?token=${session.access_token}`;
}

// Uso:
export async function WorkspaceLink() {
  const link = await getWorkspaceManagerLink();

  if (!link) {
    return null;
  }

  return (
    <a
      href={link}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Criar Novo Workspace
    </a>
  );
}

// ============================================
// Opção 3: API Route para Redirecionar
// ============================================

// Crie: app/api/workspace/redirect/route.ts no seu app principal
export async function GET(request: Request) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.headers.get('cookie')?.split('; ')
            .find(c => c.startsWith(`${name}=`))
            ?.split('=')[1];
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return Response.redirect(new URL('/login', request.url));
  }

  const workspaceManagerUrl = process.env.NEXT_PUBLIC_WORKSPACE_MANAGER_URL || 'http://localhost:3000';
  const redirectUrl = `${workspaceManagerUrl}/workspace/new?token=${session.access_token}`;

  return Response.redirect(redirectUrl);
}

// Uso:
// <a href="/api/workspace/redirect">Criar Workspace</a>

// ============================================
// Opção 4: Para gerenciar workspace específico
// ============================================

export function RedirectToWorkspaceManagement(workspaceId: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleRedirect = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      alert('Você precisa estar logado!');
      return;
    }

    const workspaceManagerUrl = process.env.NEXT_PUBLIC_WORKSPACE_MANAGER_URL || 'http://localhost:3000';

    // Redireciona para workspace específico
    window.location.href = `${workspaceManagerUrl}/workspace/${workspaceId}?token=${session.access_token}`;
  };

  return (
    <button
      onClick={handleRedirect}
      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
    >
      Gerenciar Workspace
    </button>
  );
}

// ============================================
// Configurações Necessárias
// ============================================

/**
 * No .env do seu APP PRINCIPAL, adicione:
 *
 * NEXT_PUBLIC_WORKSPACE_MANAGER_URL=http://localhost:3000
 *
 * Em produção:
 * NEXT_PUBLIC_WORKSPACE_MANAGER_URL=https://workspace.seudominio.com
 */
