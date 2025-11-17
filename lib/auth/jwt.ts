import { jwtVerify, SignJWT, decodeJwt } from 'jose';
import type { JWTPayload } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET;
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

function getSecret() {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET or NEXT_PUBLIC_JWT_SECRET must be set');
  }
  return new TextEncoder().encode(JWT_SECRET);
}

function getSupabaseSecret() {
  if (!SUPABASE_JWT_SECRET) {
    throw new Error('SUPABASE_JWT_SECRET must be set to verify Supabase tokens');
  }
  return new TextEncoder().encode(SUPABASE_JWT_SECRET);
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    console.log('🔐 Starting JWT verification...');
    // Primeiro, tenta verificar como JWT customizado
    try {
      console.log('🔍 Trying custom JWT verification...');
      const { payload } = await jwtVerify(token, getSecret());
      console.log('✅ Custom JWT verified successfully');
      return payload as unknown as JWTPayload;
    } catch (customError) {
      // Se falhar, tenta verificar como JWT do Supabase
      console.log('⚠️  Custom JWT failed, trying Supabase JWT...');
      return await verifySupabaseJWT(token);
    }
  } catch (error) {
    console.error('❌ JWT verification completely failed:', error);
    return null;
  }
}

export async function verifySupabaseJWT(token: string): Promise<JWTPayload | null> {
  try {
    if (!SUPABASE_JWT_SECRET) {
      // Se não tiver o secret do Supabase configurado, tenta decodificar sem verificar
      // (apenas para desenvolvimento - NÃO use em produção!)
      console.warn('⚠️  SUPABASE_JWT_SECRET not configured, decoding without verification');
      console.log('🔍 Token length:', token.length);
      console.log('🔍 Token preview:', token.substring(0, 50) + '...');

      const payload = decodeJwt(token);
      console.log('✅ Decoded payload:', JSON.stringify(payload, null, 2));

      // Extrair userId e email do formato Supabase
      const result = {
        userId: (payload.sub || '') as string,
        email: (payload.email || '') as string,
      };
      console.log('✅ Extracted user info:', result);
      return result;
    }

    // Verifica com o secret do Supabase
    const { payload } = await jwtVerify(token, getSupabaseSecret());

    // Converter formato Supabase para o nosso formato
    return {
      userId: (payload.sub || '') as string,
      email: (payload.email || '') as string,
    };
  } catch (error) {
    console.error('❌ Supabase JWT verification failed:', error);
    console.error('❌ Token that failed:', token.substring(0, 50) + '...');
    return null;
  }
}

export async function signJWT(payload: Omit<JWTPayload, 'exp' | 'iat'>): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(getSecret());
}

export function extractTokenFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get('token');
  } catch {
    return null;
  }
}
