# 🚀 Guia Rápido de Início

## Setup em 5 minutos

### 1. Instale as dependências

```bash
npm install
```

### 2. Configure o ambiente

```bash
cp .env.example .env
```

Edite `.env` com suas credenciais.

### 3. Execute a migração no Supabase

Cole o conteúdo de `database/migrations/001_add_trial_used_to_profiles.sql` no SQL Editor do Supabase.

### 4. Configure produtos no Stripe

Crie 3 produtos no [Dashboard do Stripe](https://dashboard.stripe.com/products):

1. **Individual** - R$ 97/mês
2. **Fono+** - R$ 197/mês
3. **Pro** - R$ 397/mês

Adicione os Price IDs no `.env`.

### 5. Execute

```bash
npm run dev
```

## 🧪 Testando Localmente

### 1. Gere uma URL de autenticação de teste

Execute o script de geração de URL:

```bash
node generate-auth-url.js
```

Copie e cole a URL gerada no navegador.

### Como funciona a autenticação

A autenticação é feita via **UUID do usuário + Hash SHA-256 do email**:

```
http://localhost:3000/workspace/new?userId=UUID&emailHash=SHA256_HASH
```

**Exemplo de geração no seu app principal:**

```javascript
const crypto = require('crypto');

function generateEmailHash(email) {
  return crypto
    .createHash('sha256')
    .update(email.toLowerCase().trim())
    .digest('hex');
}

const userId = 'uuid-do-usuario';
const email = 'usuario@exemplo.com';
const emailHash = generateEmailHash(email);

const url = `https://workspace-manager.com/workspace/new?userId=${userId}&emailHash=${emailHash}`;
```

**Segurança:**
- O middleware valida o hash consultando o banco de dados
- Compara o SHA-256 do email do usuário com o hash recebido
- Se não houver match, retorna 401 Unauthorized
- SHA-256 é mais seguro que MD5

### 2. Teste Webhooks do Stripe

Instale o Stripe CLI:

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Ou baixe em: https://stripe.com/docs/stripe-cli
```

Execute:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copie o webhook signing secret exibido e adicione ao `.env` como `STRIPE_WEBHOOK_SECRET`.

### 3. Teste criação de workspace

1. Acesse a URL com token gerado
2. Preencha os dados do workspace
3. Escolha um plano
4. Clique em "Criar Workspace"

O workspace será criado e você será redirecionado para a página de gestão.

## 📱 URLs Disponíveis

- **Criar workspace**: `/workspace/new?userId=UUID&emailHash=SHA256_HASH`
- **Dashboard**: `/dashboard?userId=UUID&emailHash=SHA256_HASH`
- **Visualizar workspace**: `/workspace/[id]?userId=UUID&emailHash=SHA256_HASH`
- **API - Criar workspace**: `POST /api/workspaces`
- **API - Webhooks Stripe**: `POST /api/webhooks/stripe`

**Nota:** Após o primeiro acesso, os parâmetros de autenticação são salvos em cookies por 24h.

## 🔍 Verificando no Supabase

Após criar um workspace, verifique as tabelas:

```sql
-- Workspace criado
SELECT * FROM workspaces ORDER BY created_at DESC LIMIT 1;

-- Settings do workspace
SELECT * FROM workspace_settings ORDER BY created_at DESC LIMIT 1;

-- Membro (owner) do workspace
SELECT * FROM workspace_members ORDER BY created_at DESC LIMIT 1;

-- Trial foi marcado
SELECT trial_used FROM profiles WHERE id = 'seu_user_id';
```

## 🎯 Próximos Passos

1. ✅ Workspace criado
2. Configure webhooks do Stripe em produção
3. Adicione o link no seu app principal
4. Teste os fluxos de pagamento

## ⚠️ Problemas Comuns

### Erro: "Authentication required"

- Verifique se está passando `userId` e `emailHash` na URL
- Confirme que o usuário existe no banco de dados (tabela `profiles`)
- Verifique se o hash SHA-256 está sendo gerado corretamente

### Erro: "Invalid authentication"

- O hash do email não confere
- Verifique se o email está em lowercase e sem espaços ao gerar o hash
- Confirme que o userId corresponde a um usuário existente

### Erro: "Invalid plan type"

- Verifique se os planos em `lib/constants/plans.ts` correspondem aos do Stripe
- Confirme que os Price IDs no `.env` estão corretos

### Subscription não cria no Stripe

- Verifique se STRIPE_SECRET_KEY está correto
- Confirme que a API key tem permissões de escrita
- Tente criar um customer manualmente no dashboard do Stripe

### Workspace não aparece

- Verifique se o user_id no JWT corresponde a um profile existente
- Confirme que as políticas RLS do Supabase estão corretas

## 📞 Suporte

Para problemas, consulte:
- README.md completo
- Logs do navegador (F12 → Console)
- Logs do servidor (terminal onde executou `npm run dev`)
- Dashboard do Stripe (para erros de pagamento)
