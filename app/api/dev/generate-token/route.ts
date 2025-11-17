import { NextRequest, NextResponse } from 'next/server';
import { signJWT } from '@/lib/auth/jwt';

// ATENÇÃO: Esta rota deve ser removida em produção!
// Apenas para desenvolvimento/testes

export async function POST(request: NextRequest) {
  // Verificar se está em ambiente de desenvolvimento
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is not available in production' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { userId, email } = body;

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'userId and email are required' },
        { status: 400 }
      );
    }

    // Gerar o token JWT
    const token = await signJWT({ userId, email });

    return NextResponse.json({
      success: true,
      token,
      payload: { userId, email },
      expiresIn: '24h',
    });
  } catch (error) {
    console.error('Error generating token:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}
