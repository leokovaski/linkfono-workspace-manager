#!/bin/bash

echo "═══════════════════════════════════════════════════════════"
echo "🏗️  CRIANDO ESTRUTURA COMPLETA DO WORKSPACE MANAGER"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Nome do projeto
PROJECT_NAME="workspace-manager"

# ============================================
# ESTRUTURA DE DIRETÓRIOS
# ============================================

echo ""
echo -e "${BLUE}Criando estrutura de diretórios...${NC}"

# Diretórios principais
mkdir -p app/api/workspaces/\[id\]/settings
mkdir -p app/api/workspaces/\[id\]/change-plan
mkdir -p app/api/webhooks/stripe
mkdir -p app/dashboard
mkdir -p app/workspace/new
mkdir -p app/workspace/\[id\]/edit
mkdir -p app/workspace/\[id\]/settings
mkdir -p components/workspace
mkdir -p components/ui
mkdir -p lib/supabase
mkdir -p lib/stripe
mkdir -p types
mkdir -p utils
mkdir -p database
mkdir -p examples
mkdir -p public

echo -e "${GREEN}✓${NC} Diretórios criados"

# ============================================
# ARQUIVOS RAIZ
# ============================================

echo ""
echo -e "${BLUE}Criando arquivos de configuração raiz...${NC}"

# .gitignore
cat > .gitignore << 'EOF'
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js
.yarn/install-state.gz

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
EOF

# tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

# tailwind.config.ts
cat > tailwind.config.ts << 'EOF'
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
EOF

# postcss.config.js
cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# next.config.js
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  // TODO: Adicionar configuração do Next.js
};

module.exports = nextConfig;
EOF

# middleware.ts
cat > middleware.ts << 'EOF'
// TODO: Adicionar middleware de autenticação
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  return NextResponse.next();
}
EOF

# README.md
cat > README.md << 'EOF'
# Workspace Manager

Sistema de gestão de workspaces com Supabase e Stripe.

## TODO: Adicionar documentação
EOF

echo -e "${GREEN}✓${NC} Arquivos de configuração criados"

# ============================================
# TYPES
# ============================================

echo ""
echo -e "${BLUE}Criando arquivos de tipos...${NC}"

cat > types/index.ts << 'EOF'
// TODO: Adicionar types principais
export type WorkspaceStatus = 'trial' | 'active' | 'canceled' | 'past_due' | 'inactive';
export type PlanType = 'starter' | 'individual' | 'fono_plus' | 'pro';
export type WorkspaceRole = 'owner' | 'member';
EOF

cat > types/database.ts << 'EOF'
// TODO: Adicionar types do database Supabase
// Gerar com: npx supabase gen types typescript
export interface Database {}
EOF

echo -e "${GREEN}✓${NC} Types criados"

# ============================================
# LIB
# ============================================

echo ""
echo -e "${BLUE}Criando arquivos da lib...${NC}"

cat > lib/supabase/client.ts << 'EOF'
// TODO: Adicionar cliente Supabase para browser
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  // Implementar
}
EOF

cat > lib/supabase/server.ts << 'EOF'
// TODO: Adicionar cliente Supabase para servidor
import { createServerClient } from '@supabase/ssr';

export async function createClient() {
  // Implementar
}
EOF

cat > lib/stripe/index.ts << 'EOF'
// TODO: Adicionar configuração e funções do Stripe
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});
EOF

echo -e "${GREEN}✓${NC} Lib criada"

# ============================================
# COMPONENTS
# ============================================

echo ""
echo -e "${BLUE}Criando componentes...${NC}"

cat > components/workspace/PlanCard.tsx << 'EOF'
// TODO: Adicionar componente PlanCard
'use client';

export function PlanCard() {
  return <div>Plan Card</div>;
}
EOF

echo -e "${GREEN}✓${NC} Componentes criados"

# ============================================
# APP - LAYOUT E PÁGINA RAIZ
# ============================================

echo ""
echo -e "${BLUE}Criando app layout e página raiz...${NC}"

cat > app/layout.tsx << 'EOF'
// TODO: Adicionar layout raiz
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Workspace Manager',
  description: 'Sistema de gestão de workspaces',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
EOF

cat > app/page.tsx << 'EOF'
// TODO: Adicionar página inicial
'use client';

export default function HomePage() {
  return (
    <div>
      <h1>Workspace Manager</h1>
    </div>
  );
}
EOF

cat > app/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

/* TODO: Adicionar estilos globais */
EOF

echo -e "${GREEN}✓${NC} App layout criado"

# ============================================
# APP - DASHBOARD
# ============================================

echo ""
echo -e "${BLUE}Criando dashboard...${NC}"

cat > app/dashboard/page.tsx << 'EOF'
// TODO: Adicionar página de dashboard
'use client';

export default function DashboardPage() {
  return <div>Dashboard</div>;
}
EOF

echo -e "${GREEN}✓${NC} Dashboard criado"

# ============================================
# APP - WORKSPACE PAGES
# ============================================

echo ""
echo -e "${BLUE}Criando páginas de workspace...${NC}"

cat > app/workspace/new/page.tsx << 'EOF'
// TODO: Adicionar página de criar workspace
'use client';

export default function NewWorkspacePage() {
  return <div>Criar Workspace</div>;
}
EOF

cat > app/workspace/\[id\]/page.tsx << 'EOF'
// TODO: Adicionar página de visualizar workspace
'use client';

export default function WorkspacePage({ params }: { params: { id: string } }) {
  return <div>Workspace {params.id}</div>;
}
EOF

cat > app/workspace/\[id\]/edit/page.tsx << 'EOF'
// TODO: Adicionar página de editar workspace
'use client';

export default function EditWorkspacePage({ params }: { params: { id: string } }) {
  return <div>Editar Workspace {params.id}</div>;
}
EOF

cat > app/workspace/\[id\]/settings/page.tsx << 'EOF'
// TODO: Adicionar página de configurações do workspace
'use client';

export default function WorkspaceSettingsPage({ params }: { params: { id: string } }) {
  return <div>Configurações Workspace {params.id}</div>;
}
EOF

echo -e "${GREEN}✓${NC} Páginas de workspace criadas"

# ============================================
# API ROUTES
# ============================================

echo ""
echo -e "${BLUE}Criando API routes...${NC}"

cat > app/api/workspaces/route.ts << 'EOF'
// TODO: Adicionar rota POST para criar workspace
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json({ message: 'TODO' });
}
EOF

cat > app/api/workspaces/\[id\]/route.ts << 'EOF'
// TODO: Adicionar rotas PATCH (editar) e DELETE (deletar)
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json({ message: 'TODO' });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json({ message: 'TODO' });
}
EOF

cat > app/api/workspaces/\[id\]/settings/route.ts << 'EOF'
// TODO: Adicionar rota PATCH para atualizar configurações
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json({ message: 'TODO' });
}
EOF

cat > app/api/workspaces/\[id\]/change-plan/route.ts << 'EOF'
// TODO: Adicionar rota POST para alterar plano
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json({ message: 'TODO' });
}
EOF

cat > app/api/webhooks/stripe/route.ts << 'EOF'
// TODO: Adicionar webhook do Stripe
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json({ received: true });
}
EOF

echo -e "${GREEN}✓${NC} API routes criadas"

# ============================================
# DATABASE
# ============================================

echo ""
echo -e "${BLUE}Criando arquivos de database...${NC}"

cat > database/useful-queries.sql << 'EOF'
-- TODO: Adicionar queries SQL úteis

-- Adicionar campo has_used_trial
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS has_used_trial boolean DEFAULT false;

-- TODO: Adicionar mais queries
EOF

echo -e "${GREEN}✓${NC} Database criado"

# ============================================
# EXAMPLES
# ============================================

echo ""
echo -e "${BLUE}Criando exemplos...${NC}"

cat > examples/mobile-integration.tsx << 'EOF'
// TODO: Adicionar exemplo de integração mobile
// Exemplo de como integrar com React Native
EOF

echo -e "${GREEN}✓${NC} Exemplos criados"

# ============================================
# DOCUMENTAÇÃO
# ============================================

echo ""
echo -e "${BLUE}Criando documentação...${NC}"

cat > QUICKSTART.md << 'EOF'
# Quickstart Guide

TODO: Adicionar guia rápido
EOF

cat > PROJECT-SUMMARY.md << 'EOF'
# Project Summary

TODO: Adicionar resumo do projeto
EOF

echo -e "${GREEN}✓${NC} Documentação criada"

# ============================================
# RESUMO FINAL
# ============================================

echo ""
echo "═══════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ ESTRUTURA CRIADA COM SUCESSO!${NC}"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📁 Estrutura criada em: ./$PROJECT_NAME/"
echo ""
echo "📋 Próximos passos:"
echo "   1. cd $PROJECT_NAME"
echo "   2. Adicione o conteúdo em cada arquivo marcado com TODO"
echo "   3. Configure o .env.local com suas credenciais"
echo "   4. npm install"
echo "   5. npm run dev"
echo ""
echo "📝 Arquivos criados:"
echo ""
echo "   Configuração:"
echo "   ├── .env.local"
echo "   ├── package.json"
echo "   ├── tsconfig.json"
echo "   ├── tailwind.config.ts"
echo "   ├── next.config.js"
echo "   └── middleware.ts"
echo ""
echo "   Types:"
echo "   ├── types/index.ts"
echo "   └── types/database.ts"
echo ""
echo "   Lib:"
echo "   ├── lib/supabase/client.ts"
echo "   ├── lib/supabase/server.ts"
echo "   └── lib/stripe/index.ts"
echo ""
echo "   Components:"
echo "   └── components/workspace/PlanCard.tsx"
echo ""
echo "   App:"
echo "   ├── app/layout.tsx"
echo "   ├── app/page.tsx"
echo "   ├── app/globals.css"
echo "   ├── app/dashboard/page.tsx"
echo "   ├── app/workspace/new/page.tsx"
echo "   ├── app/workspace/[id]/page.tsx"
echo "   ├── app/workspace/[id]/edit/page.tsx"
echo "   └── app/workspace/[id]/settings/page.tsx"
echo ""
echo "   API Routes:"
echo "   ├── app/api/workspaces/route.ts"
echo "   ├── app/api/workspaces/[id]/route.ts"
echo "   ├── app/api/workspaces/[id]/settings/route.ts"
echo "   ├── app/api/workspaces/[id]/change-plan/route.ts"
echo "   └── app/api/webhooks/stripe/route.ts"
echo ""
echo "   Database:"
echo "   └── database/useful-queries.sql"
echo ""
echo "   Examples:"
echo "   └── examples/mobile-integration.tsx"
echo ""
echo "   Docs:"
echo "   ├── README.md"
echo "   ├── QUICKSTART.md"
echo "   └── PROJECT-SUMMARY.md"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""
echo -e "${YELLOW}💡 Dica:${NC} Use 'grep -r TODO' para encontrar todos os arquivos"
echo "   que precisam ser preenchidos."
echo ""
echo -e "${GREEN}Boa sorte com seu projeto! 🚀${NC}"
echo ""
EOF

chmod +x create-structure.sh
echo -e "${GREEN}✓${NC} Script criado com sucesso!"
echo ""
echo "Para executar:"
echo "  chmod +x create-structure.sh"
echo "  ./create-structure.sh"
