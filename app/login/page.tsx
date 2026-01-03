'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Container, Row, Col, Form, Alert } from 'react-bootstrap';
import { FiMail, FiLock, FiUser, FiLogIn, FiUserPlus } from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassInput } from '@/components/ui/GlassInput';

type AuthMode = 'login' | 'register' | 'forgot';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/';

  const { signIn, signUp, resetPassword, loading, error } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMessage(null);

    if (mode === 'login') {
      const result = await signIn(email, password);
      if (result.success) {
        router.push(redirectTo);
      }
    } else if (mode === 'register') {
      if (password !== confirmPassword) {
        setLocalError('As senhas não coincidem');
        return;
      }
      if (password.length < 6) {
        setLocalError('A senha deve ter pelo menos 6 caracteres');
        return;
      }

      const result = await signUp(email, password);
      if (result.success) {
        if (result.needsConfirmation) {
          setSuccessMessage('Verifique seu e-mail para confirmar sua conta');
          setMode('login');
        } else {
          router.push(redirectTo);
        }
      }
    } else if (mode === 'forgot') {
      const result = await resetPassword(email);
      if (result.success) {
        setSuccessMessage('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
        setMode('login');
      } else {
        setLocalError(result.error || 'Erro ao enviar e-mail de recuperação');
      }
    }
  };

  const displayError = localError || error;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--bg-gradient)' }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={8} lg={6} xl={5}>
            <div className="glass-card p-4 p-md-5">
              {/* Logo/Title */}
              <div className="text-center mb-5">
                <div
                  className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '16px',
                    background: 'var(--gradient-primary)',
                    fontSize: '28px',
                  }}
                >
                  💰
                </div>
                <h1 className="h3 fw-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Planilha Financeira
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>
                  {mode === 'login' && 'Entre para gerenciar suas finanças'}
                  {mode === 'register' && 'Crie sua conta gratuita'}
                  {mode === 'forgot' && 'Recupere sua senha'}
                </p>
              </div>

              {/* Alerts */}
              {displayError && (
                <Alert variant="danger" className="mb-4" style={{ background: 'rgba(244, 92, 67, 0.15)', border: '1px solid rgba(244, 92, 67, 0.3)', color: 'var(--expense-color)' }}>
                  {displayError}
                </Alert>
              )}

              {successMessage && (
                <Alert variant="success" className="mb-4" style={{ background: 'rgba(56, 239, 125, 0.15)', border: '1px solid rgba(56, 239, 125, 0.3)', color: 'var(--income-color)' }}>
                  {successMessage}
                </Alert>
              )}

              {/* Form */}
              <Form onSubmit={handleSubmit}>
                <GlassInput
                  label="E-mail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  icon={<FiMail />}
                  required
                />

                {mode !== 'forgot' && (
                  <GlassInput
                    label="Senha"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    icon={<FiLock />}
                    required
                  />
                )}

                {mode === 'register' && (
                  <GlassInput
                    label="Confirmar Senha"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    icon={<FiLock />}
                    required
                  />
                )}

                {mode === 'login' && (
                  <div className="text-end mb-4">
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="btn btn-link p-0 text-decoration-none"
                      style={{ color: 'var(--accent-blue)', fontSize: '0.875rem' }}
                    >
                      Esqueceu a senha?
                    </button>
                  </div>
                )}

                <GlassButton
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={loading}
                  icon={mode === 'login' ? <FiLogIn /> : mode === 'register' ? <FiUserPlus /> : <FiMail />}
                  className="mb-4"
                >
                  {mode === 'login' && 'Entrar'}
                  {mode === 'register' && 'Criar Conta'}
                  {mode === 'forgot' && 'Enviar E-mail'}
                </GlassButton>
              </Form>

              {/* Mode Toggle */}
              <div className="text-center">
                {mode === 'login' && (
                  <p style={{ color: 'var(--text-muted)' }}>
                    Não tem uma conta?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('register');
                        setLocalError(null);
                        setSuccessMessage(null);
                      }}
                      className="btn btn-link p-0 text-decoration-none fw-semibold"
                      style={{ color: 'var(--accent-blue)' }}
                    >
                      Criar conta
                    </button>
                  </p>
                )}

                {(mode === 'register' || mode === 'forgot') && (
                  <p style={{ color: 'var(--text-muted)' }}>
                    Já tem uma conta?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setLocalError(null);
                        setSuccessMessage(null);
                      }}
                      className="btn btn-link p-0 text-decoration-none fw-semibold"
                      style={{ color: 'var(--accent-blue)' }}
                    >
                      Entrar
                    </button>
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <p className="text-center mt-4" style={{ color: 'var(--text-hint)', fontSize: '0.875rem' }}>
              Planilha Financeira v2.0 • {new Date().getFullYear()}
            </p>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
