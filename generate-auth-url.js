const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

// ATENÇÃO: Substitua estes valores pelos dados reais do usuário
const testUser = {
  userId: '123e4567-e89b-12d3-a456-426614174000', // UUID do usuário na tabela profiles
  email: 'teste@exemplo.com', // Email do usuário
};

/**
 * Gera hash SHA-256 de um email
 * Mesmo algoritmo usado no middleware (compatível com Edge Runtime)
 */
function generateEmailHash(email) {
  return crypto
    .createHash('sha256')
    .update(email.toLowerCase().trim())
    .digest('hex');
}

// Gera o hash do email
const emailHash = generateEmailHash(testUser.email);

// Gera URLs para diferentes rotas
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const authParams = `userId=${testUser.userId}&emailHash=${emailHash}`;

const urls = {
  newWorkspace: `${baseUrl}/workspace/new?${authParams}`,
  dashboard: `${baseUrl}/dashboard?${authParams}`,
};

console.log('\n=================================');
console.log('🔐 Autenticação Simples Gerada');
console.log('=================================\n');

console.log('📋 Dados do usuário:');
console.log('  User ID:', testUser.userId);
console.log('  Email:', testUser.email);
console.log('  Hash MD5:', emailHash);

console.log('\n🌐 URLs para acessar:\n');
console.log('Nova Workspace:');
console.log(urls.newWorkspace);
console.log('\nDashboard:');
console.log(urls.dashboard);

console.log('\n=================================');
console.log('💡 Como usar:');
console.log('=================================\n');
console.log('1. Copie uma das URLs acima');
console.log('2. Acesse no navegador');
console.log('3. O middleware validará automaticamente');
console.log('4. Os cookies serão criados para sessão');
console.log('\n');
