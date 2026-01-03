'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import { FiLock, FiCheck } from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassInput } from '@/components/ui/GlassInput';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { updatePassword, loading } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    const result = await updatePassword(password);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } else {
      setError(result.error || 'Erro ao atualizar senha');
    }
  };

  if (success) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: 'var(--bg-gradient)' }}
      >
        <Container>
          <Row className="justify-content-center">
            <Col xs={12} sm={10} md={8} lg={6} xl={5}>
              <div className="glass-card p-5 text-center">
                <div
                  className="mx-auto mb-4 d-flex align-items-center justify-content-center"
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'var(--gradient-success)',
                    fontSize: '36px',
                  }}
                >
                  <FiCheck color="white" />
                </div>
                <h2 className="h4 fw-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                  Senha atualizada!
                </h2>
                <p style={{ color: 'var(--text-muted)' }}>
                  Redirecionando para o dashboard...
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--bg-gradient)' }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={8} lg={6} xl={5}>
            <div className="glass-card p-4 p-md-5">
              {/* Header */}
              <div className="text-center mb-5">
                <div
                  className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '16px',
                    background: 'var(--gradient-primary)',
                  }}
                >
                  <FiLock size={28} color="white" />
                </div>
                <h1 className="h3 fw-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Nova Senha
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>
                  Digite sua nova senha abaixo
                </p>
              </div>

              {/* Error */}
              {error && (
                <Alert
                  variant="danger"
                  className="mb-4"
                  style={{
                    background: 'rgba(244, 92, 67, 0.15)',
                    border: '1px solid rgba(244, 92, 67, 0.3)',
                    color: 'var(--expense-color)',
                  }}
                >
                  {error}
                </Alert>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <GlassInput
                  label="Nova Senha"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  icon={<FiLock />}
                  required
                  hint="Mínimo de 6 caracteres"
                />

                <GlassInput
                  label="Confirmar Senha"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  icon={<FiLock />}
                  required
                />

                <GlassButton
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={loading}
                  className="mt-4"
                >
                  Atualizar Senha
                </GlassButton>
              </form>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
