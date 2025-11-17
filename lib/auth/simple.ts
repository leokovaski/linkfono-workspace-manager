import { createClient as createMiddlewareClient } from '@/lib/supabase/middleware';

export interface SimpleAuthPayload {
  userId: string;
  email: string;
}

/**
 * Gera hash SHA-256 de um email usando Web Crypto API
 * Compatível com Edge Runtime do Next.js
 * SHA-256 é mais seguro que MD5 e suportado nativamente pela Web Crypto API
 */
export async function generateEmailHash(email: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(email.toLowerCase().trim());

  // Web Crypto API suporta apenas SHA-256, SHA-384, SHA-512
  // Vamos usar SHA-256 ao invés de MD5 (mais seguro)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

  // Converte para hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex;
}

/**
 * Verifica se o userId e emailHash são válidos
 * Busca o usuário no banco e compara o hash do email
 * Esta versão usa o cliente do middleware (service role)
 */
export async function verifySimpleAuth(
  userId: string,
  emailHash: string
): Promise<SimpleAuthPayload | null> {
  try {
    console.log('🔐 Verificando autenticação simples...');
    console.log('🔍 UserId:', userId);
    console.log('🔍 EmailHash:', emailHash);

    // Busca o usuário no banco de dados
    const supabase = createMiddlewareClient();
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      console.error('❌ Usuário não encontrado:', error?.message);
      return null;
    }

    // Type assertion para garantir que temos os dados corretos
    const userProfile = profile as { id: string; email: string; full_name: string };

    console.log('✅ Usuário encontrado:', userProfile.email);

    // Gera o hash do email do usuário
    const expectedHash = await generateEmailHash(userProfile.email);
    console.log('🔍 Hash esperado:', expectedHash);
    console.log('🔍 Hash recebido:', emailHash);

    // Compara os hashes
    if (expectedHash !== emailHash.toLowerCase()) {
      console.error('❌ Hash do email não confere');
      return null;
    }

    console.log('✅ Autenticação validada com sucesso');

    return {
      userId: userProfile.id,
      email: userProfile.email,
    };
  } catch (error) {
    console.error('❌ Erro ao verificar autenticação:', error);
    return null;
  }
}

/**
 * Extrai userId e emailHash da URL
 */
export function extractAuthFromUrl(url: string): {
  userId: string | null;
  emailHash: string | null;
} {
  try {
    const urlObj = new URL(url);
    return {
      userId: urlObj.searchParams.get('userId'),
      emailHash: urlObj.searchParams.get('emailHash'),
    };
  } catch {
    return {
      userId: null,
      emailHash: null,
    };
  }
}
