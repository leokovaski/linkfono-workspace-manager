const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

// Seu usuário real
const myUser = {
  userId: 'cca11b4a-0285-4d9d-a7f6-a9624e2640dd',
  email: 'leokovaski@icloud.com',
};

/**
 * Gera hash SHA-256 de um email
 */
function generateEmailHash(email) {
  return crypto
    .createHash('sha256')
    .update(email.toLowerCase().trim())
    .digest('hex');
}

// Gera o hash do email
const emailHash = generateEmailHash(myUser.email);

// Gera URLs para diferentes rotas
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const authParams = `userId=${myUser.userId}&emailHash=${emailHash}`;

const urls = {
  newWorkspace: `${baseUrl}/workspace/new?${authParams}`,
  dashboard: `${baseUrl}/dashboard?${authParams}`,
};

console.log('\n=================================');
console.log('🔐 Sua URL de Autenticação');
console.log('=================================\n');

console.log('📋 Seus dados:');
console.log('  User ID:', myUser.userId);
console.log('  Email:', myUser.email);
console.log('  Hash SHA-256:', emailHash);

console.log('\n🌐 URLs para acessar:\n');
console.log('Nova Workspace:');
console.log(urls.newWorkspace);
console.log('\nDashboard:');
console.log(urls.dashboard);
console.log('\n');
