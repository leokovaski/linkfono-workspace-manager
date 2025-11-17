const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.env.local' });

// ATENÇÃO: Substitua estes valores pelos dados reais do seu banco
const testUser = {
  userId: '123e4567-e89b-12d3-a456-426614174000', // UUID do usuário na tabela profiles
  email: 'teste@exemplo.com', // Email do usuário
};

// Pega do .env.local
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('\n❌ ERRO: JWT_SECRET não encontrado!');
  console.error('Certifique-se que o arquivo .env.local existe e contém JWT_SECRET\n');
  process.exit(1);
}

const token = jwt.sign(
  testUser,
  JWT_SECRET,
  { expiresIn: '24h' }
);

const url = `http://localhost:3000/workspace/new?token=${token}`;

console.log('\n=================================');
console.log('🔑 JWT Token Gerado:');
console.log('=================================\n');
console.log(token);
console.log('\n=================================');
console.log('🌐 URL para acessar:');
console.log('=================================\n');
console.log(url);
console.log('\n=================================');
console.log('📋 Dados do usuário:');
console.log('=================================\n');
console.log(JSON.stringify(testUser, null, 2));
console.log('\n');
