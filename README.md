# Workspace Manager

Sistema de gestão de workspaces com autenticação JWT, integração com Supabase e Stripe para pagamentos recorrentes.

## 📋 Visão Geral

Esta aplicação permite que usuários autenticados criem e gerenciem workspaces (espaços de trabalho) com diferentes planos de assinatura:

- **Plano Individual**: 15 pacientes, 1 membro - R$ 97/mês
- **Plano Fono+**: 30 pacientes, 3 membros - R$ 197/mês
- **Plano Pro**: Pacientes e membros ilimitados - R$ 397/mês

### Funcionalidades

✅ Autenticação via JWT (token na URL)
✅ Criação de workspace com wizard multi-step
✅ Período de teste de 7 dias (uma vez por usuário)
✅ Integração completa com Stripe (pagamentos e webhooks)
✅ Gestão de workspace (editar, mudar plano, deletar)
✅ Configurações personalizáveis (duração de agendamentos, lembretes)
✅ Soft delete (workspace é desativado, não deletado)

## 🚀 Instalação e Configuração

### 1. Pré-requisitos

- Node.js 20+
- Conta no Supabase
- Conta no Stripe
- Aplicativo principal que gerará o JWT

### 2. Clone e Instale Dependências

```bash
npm install
```

### 3. Configure as Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Preencha as variáveis no arquivo `.env`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# JWT Authentication (mesmo secret do app principal)
JWT_SECRET=your_jwt_secret_key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs (criar no dashboard do Stripe)
NEXT_PUBLIC_STRIPE_PRICE_INDIVIDUAL=price_...
NEXT_PUBLIC_STRIPE_PRICE_FONO_PLUS=price_...
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Configure o Banco de Dados

Execute a migração SQL no Supabase para adicionar o campo `trial_used`:

```sql
-- Arquivo: database/migrations/001_add_trial_used_to_profiles.sql
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS trial_used BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_profiles_trial_used ON public.profiles(trial_used);
```

### 5. Configure os Produtos no Stripe

1. Acesse o [Dashboard do Stripe](https://dashboard.stripe.com/)
2. Vá em **Products** → **Add Product**
3. Crie 3 produtos com preços mensais:
   - Individual: R$ 97/mês
   - Fono+: R$ 197/mês
   - Pro: R$ 397/mês
4. Copie os Price IDs e adicione no `.env`

### 6. Configure Webhooks no Stripe

1. Acesse **Developers** → **Webhooks** no Dashboard do Stripe
2. Clique em **Add endpoint**
3. URL: `https://seu-dominio.com/api/webhooks/stripe`
4. Eventos a escutar:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `checkout.session.completed`
5. Copie o **Signing Secret** e adicione em `STRIPE_WEBHOOK_SECRET`

### 7. Execute a Aplicação

```bash
npm run dev
```

Acesse: `http://localhost:3000`

## 🔐 Autenticação

### Como Funciona

O usuário é redirecionado do app principal com um JWT na URL:

```
http://localhost:3000/workspace/new?token=eyJhbGc...
```

O middleware valida o token e:
1. Verifica a assinatura JWT
2. Extrai `userId` e `email`
3. Cria um cookie de sessão
4. Redireciona para a URL limpa (sem token)

### Gerando o JWT no App Principal

```javascript
import jwt from 'jsonwebtoken';

const token = jwt.sign(
  {
    userId: user.id,
    email: user.email,
  },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);

const url = `http://workspace-manager.com/workspace/new?token=${token}`;
```

## 📁 Estrutura do Projeto

```
├── app/
│   ├── api/
│   │   ├── workspaces/
│   │   │   ├── route.ts                    # POST (criar), GET (listar)
│   │   │   └── [id]/
│   │   │       ├── route.ts                # GET, PATCH, DELETE
│   │   │       ├── settings/route.ts       # PATCH settings
│   │   │       └── change-plan/route.ts    # POST alterar plano
│   │   └── webhooks/
│   │       └── stripe/route.ts             # Webhooks Stripe
│   └── workspace/
│       ├── new/page.tsx                    # Wizard de criação
│       └── [id]/page.tsx                   # Gestão do workspace
│
├── components/
│   └── workspace/
│       ├── PlanCard.tsx                    # Card de plano
│       ├── wizard/                         # Componentes do wizard
│       │   ├── WorkspaceDataStep.tsx
│       │   ├── PlanSelectionStep.tsx
│       │   └── PaymentStep.tsx
│       └── management/                     # Componentes de gestão
│           ├── WorkspaceOverview.tsx
│           ├── WorkspaceSettings.tsx
│           └── PlanManagement.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                       # Client browser
│   │   └── server.ts                       # Client servidor
│   ├── stripe/
│   │   └── index.ts                        # Funções Stripe
│   ├── auth/
│   │   └── jwt.ts                          # Validação JWT
│   └── constants/
│       └── plans.ts                        # Configuração de planos
│
├── types/
│   ├── database.ts                         # Types do banco
│   └── index.ts                            # Types gerais
│
├── database/
│   └── migrations/
│       └── 001_add_trial_used_to_profiles.sql
│
└── middleware.ts                           # Middleware de autenticação
```

## 🔄 Fluxos Principais

### 1. Criação de Workspace

```
1. Usuário acessa /workspace/new?token=...
2. Middleware valida JWT e cria sessão
3. Wizard Step 1: Preenche dados do workspace
4. Wizard Step 2: Escolhe plano (trial disponível se aplicável)
5. Wizard Step 3: Confirma e cria workspace
6. Backend:
   - Cria customer no Stripe
   - Cria subscription (com trial se aplicável)
   - Cria workspace no banco
   - Cria workspace_settings
   - Cria workspace_member (role: owner)
   - Marca trial_used = true se aplicável
7. Redireciona para /workspace/[id]
```

### 2. Gestão do Workspace

```
- Aba "Visão Geral": Exibe informações e métricas
- Aba "Configurações": Edita appointment_duration e reminder_hours_before
- Aba "Plano":
  - Visualiza plano atual
  - Altera para outro plano (com proração)
  - Deleta workspace (soft delete)
```

### 3. Webhooks do Stripe

```
Stripe → /api/webhooks/stripe → Atualiza status no banco

Eventos tratados:
- subscription.created/updated → Atualiza status workspace
- subscription.deleted → Marca como cancelled
- invoice.payment_succeeded → Marca como active
- invoice.payment_failed → Marca como payment_pending
```

## 🎨 Customização

### Alterar Planos

Edite o arquivo `lib/constants/plans.ts`:

```typescript
export const PLANS: Record<string, PlanConfig> = {
  my_plan: {
    id: 'my_plan',
    name: 'Meu Plano',
    price: 150,
    stripePriceId: 'price_...',
    maxPatients: 50,
    maxMembers: 5,
    features: ['Feature 1', 'Feature 2'],
  },
};
```

### Adicionar Campos ao Workspace

1. Adicione no banco de dados
2. Atualize `types/database.ts`
3. Atualize formulários e componentes

## 🐛 Troubleshooting

### Erro: "JWT verification failed"

- Verifique se `JWT_SECRET` é o mesmo do app principal
- Confirme que o token não expirou (padrão: 24h)

### Erro: "Stripe customer creation failed"

- Confirme `STRIPE_SECRET_KEY` está correto
- Verifique se a API key tem permissões de escrita

### Webhooks não funcionam

- Confirme a URL está acessível publicamente
- Verifique `STRIPE_WEBHOOK_SECRET` está correto
- Use Stripe CLI para testar localmente:
  ```bash
  stripe listen --forward-to localhost:3000/api/webhooks/stripe
  ```

## 📝 Próximos Passos

- [ ] Implementar Stripe Checkout completo (com Elements)
- [ ] Adicionar notificações por email (trial expirando, pagamento falhou)
- [ ] Dashboard de métricas e analytics
- [ ] Gerenciamento de membros do workspace
- [ ] Histórico de faturas
- [ ] Testes unitários e e2e

## 📄 Licença

Este projeto é privado e de propriedade exclusiva.
