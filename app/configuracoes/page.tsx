'use client';

import { useState, useEffect } from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import {
  FiUser,
  FiTag,
  FiPlus,
  FiEye,
  FiEyeOff,
  FiLogOut,
  FiCalendar,
} from 'react-icons/fi';
import { PageLayout } from '@/components/PageLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton, IconButton } from '@/components/ui/GlassButton';
import { GlassTabs } from '@/components/ui/Tabs';
import { InputField } from '@/components/ui/InputField';
import { SelectField } from '@/components/ui/SelectField';
import { useFinanceStore } from '@/store/financeStore';
import { useAuth } from '@/hooks/useAuth';
import { showSuccess, showWarning, showConfirm } from '@/lib/sweetalert';
import { CATEGORY_EMOJIS } from '@/types';

export default function ConfiguracoesPage() {
  const {
    categories,
    hiddenDefaultCategories,
    addCategory,
    hideDefaultCategory,
    showDefaultCategory,
    userSettings,
    updateUserSettings,
    loadUserSettings,
  } = useFinanceStore();
  const { user, signOut } = useAuth();

  const [activeTab, setActiveTab] = useState('categorias');
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(false);

  // Period settings state
  const [periodEnabled, setPeriodEnabled] = useState(false);
  const [period1End, setPeriod1End] = useState('5');
  const [period2Start, setPeriod2Start] = useState('20');
  const [savingPeriod, setSavingPeriod] = useState(false);

  // Load user settings on mount
  useEffect(() => {
    loadUserSettings();
  }, [loadUserSettings]);

  // Sync local state with userSettings
  useEffect(() => {
    if (userSettings) {
      setPeriodEnabled(userSettings.period_separation_enabled || false);
      setPeriod1End(String(userSettings.period_1_end || 5));
      setPeriod2Start(String(userSettings.period_2_start || 20));
    }
  }, [userSettings]);

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      showWarning('Digite o nome da categoria');
      return;
    }

    if (categories.includes(newCategory.trim())) {
      showWarning('Esta categoria já existe');
      return;
    }

    setLoading(true);
    try {
      await addCategory(newCategory.trim());
      setNewCategory('');
      showSuccess('Categoria adicionada!');
    } catch (error) {
      console.error('Error adding category:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCategory = async (category: string) => {
    if (hiddenDefaultCategories.includes(category)) {
      await showDefaultCategory(category);
    } else {
      await hideDefaultCategory(category);
    }
  };

  const handleSignOut = async () => {
    const result = await showConfirm('Sair da conta?', 'Você será desconectado do sistema.');
    if (result.isConfirmed) {
      await signOut();
    }
  };

  const handleSavePeriodSettings = async () => {
    const p1End = parseInt(period1End);
    const p2Start = parseInt(period2Start);

    if (periodEnabled && p1End >= p2Start) {
      showWarning('O fim do período 1 deve ser menor que o início do período 2');
      return;
    }

    setSavingPeriod(true);
    try {
      await updateUserSettings({
        period_separation_enabled: periodEnabled,
        period_1_end: p1End,
        period_2_start: p2Start,
      });
      showSuccess('Configurações de período salvas!');
    } catch (error) {
      console.error('Error saving period settings:', error);
    } finally {
      setSavingPeriod(false);
    }
  };

  // Generate day options (1-28)
  const dayOptions = Array.from({ length: 28 }, (_, i) => ({
    value: String(i + 1),
    label: `Dia ${i + 1}`,
  }));

  const inputStyle: React.CSSProperties = {
    background: 'var(--glass-bg)',
    border: '1px solid var(--glass-border)',
    color: 'var(--text-primary)',
  };

  const labelStyle: React.CSSProperties = {
    color: 'var(--text-secondary)',
  };

  const tabs = [
    { id: 'categorias', label: 'Categorias', icon: <FiTag size={16} /> },
    { id: 'periodos', label: 'Períodos', icon: <FiCalendar size={16} /> },
    { id: 'conta', label: 'Conta', icon: <FiUser size={16} /> },
  ];

  return (
    <PageLayout
      title="Configurações"
      subtitle="Personalize sua experiência"
    >
      <GlassTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-4" />

      {activeTab === 'categorias' && (
        <>
          {/* Add Category */}
          <GlassCard className="mb-4">
            <h5 className="mb-3 d-flex align-items-center" style={{ color: 'var(--text-primary)' }}>
              <FiPlus className="me-2" />
              Nova Categoria
            </h5>
            <Row className="align-items-end">
              <Col md={8}>
                <InputField
                  label="Nome da Categoria"
                  value={newCategory}
                  onChange={setNewCategory}
                  placeholder="Ex: Investimentos, Pets..."
                  style={inputStyle}
                  labelStyle={labelStyle}
                />
              </Col>
              <Col md={4}>
                <GlassButton
                  variant="primary"
                  icon={<FiPlus />}
                  onClick={handleAddCategory}
                  loading={loading}
                  className="w-100"
                  style={{ marginBottom: '1rem' }}
                >
                  Adicionar
                </GlassButton>
              </Col>
            </Row>
          </GlassCard>

          {/* Categories List */}
          <GlassCard>
            <h5 className="mb-3 d-flex align-items-center" style={{ color: 'var(--text-primary)' }}>
              <FiTag className="me-2" />
              Gerenciar Categorias
            </h5>
            <p style={{ color: 'var(--text-muted)' }} className="mb-4">
              Oculte categorias que você não usa. Categorias ocultas não aparecem nos formulários,
              mas suas transações existentes são mantidas.
            </p>

            <div className="d-flex flex-column gap-2">
              {categories.map((category) => {
                const isHidden = hiddenDefaultCategories.includes(category);
                return (
                  <div
                    key={category}
                    className={`
                      d-flex align-items-center justify-content-between p-3 rounded-3
                      ${isHidden ? 'opacity-50' : ''}
                    `}
                    style={{
                      background: 'var(--glass-bg)',
                      border: '1px solid var(--glass-border)',
                    }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <span style={{ fontSize: '1.5rem' }}>
                        {CATEGORY_EMOJIS[category] || '📦'}
                      </span>
                      <span
                        style={{
                          color: isHidden ? 'var(--text-muted)' : 'var(--text-primary)',
                          textDecoration: isHidden ? 'line-through' : 'none',
                        }}
                      >
                        {category}
                      </span>
                    </div>
                    <IconButton
                      icon={isHidden ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      variant={isHidden ? 'glass' : 'primary'}
                      size="sm"
                      onClick={() => handleToggleCategory(category)}
                      tooltip={isHidden ? 'Mostrar categoria' : 'Ocultar categoria'}
                    />
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </>
      )}

      {activeTab === 'periodos' && (
        <>
          {/* Period Settings */}
          <GlassCard className="mb-4">
            <h5 className="mb-3 d-flex align-items-center" style={{ color: 'var(--text-primary)' }}>
              <FiCalendar className="me-2" />
              Divisão por Períodos
            </h5>
            <p style={{ color: 'var(--text-muted)' }} className="mb-4">
              Ative esta opção se você recebe em duas datas diferentes no mês (ex: dia 5 e dia 20).
              Isso permite visualizar suas transações separadas por período de pagamento.
            </p>

            {/* Enable/Disable Toggle */}
            <div
              className="p-4 rounded-3 mb-4"
              style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
              }}
            >
              <Form.Check
                type="switch"
                id="period-switch"
                label={
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                    Ativar divisão por períodos
                  </span>
                }
                checked={periodEnabled}
                onChange={(e) => setPeriodEnabled(e.target.checked)}
              />
            </div>

            {/* Period Configuration */}
            {periodEnabled && (
              <div
                className="p-4 rounded-3 mb-4"
                style={{
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                }}
              >
                <h6 className="mb-3" style={{ color: 'var(--text-primary)' }}>
                  Configurar Períodos
                </h6>

                <Row>
                  <Col md={6}>
                    <div
                      className="p-3 rounded-3 mb-3"
                      style={{
                        background: 'var(--income-bg)',
                        border: '1px solid var(--income-color)',
                      }}
                    >
                      <h6 style={{ color: 'var(--income-color)' }}>📅 Período 1</h6>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }} className="mb-2">
                        Do dia 1 até o dia:
                      </p>
                      <SelectField
                        label=""
                        value={period1End}
                        onChange={setPeriod1End}
                        options={dayOptions}
                        style={inputStyle}
                      />
                    </div>
                  </Col>
                  <Col md={6}>
                    <div
                      className="p-3 rounded-3 mb-3"
                      style={{
                        background: 'rgba(79, 172, 254, 0.15)',
                        border: '1px solid var(--accent-blue)',
                      }}
                    >
                      <h6 style={{ color: 'var(--accent-blue)' }}>📅 Período 2</h6>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }} className="mb-2">
                        Do dia {parseInt(period1End) + 1} até o fim do mês
                      </p>
                      <SelectField
                        label=""
                        value={period2Start}
                        onChange={setPeriod2Start}
                        options={dayOptions.filter((d) => parseInt(d.value) > parseInt(period1End))}
                        style={inputStyle}
                      />
                    </div>
                  </Col>
                </Row>

                <div
                  className="p-3 rounded-3 text-center"
                  style={{
                    background: 'var(--glass-bg)',
                    border: '1px dashed var(--glass-border)',
                  }}
                >
                  <p style={{ color: 'var(--text-muted)', marginBottom: 0 }}>
                    <strong style={{ color: 'var(--income-color)' }}>Período 1:</strong> Dia 1 até dia {period1End}
                    <span className="mx-3">|</span>
                    <strong style={{ color: 'var(--accent-blue)' }}>Período 2:</strong> Dia {parseInt(period1End) + 1} até fim do mês
                  </p>
                </div>
              </div>
            )}

            <GlassButton
              variant="primary"
              onClick={handleSavePeriodSettings}
              loading={savingPeriod}
              fullWidth
            >
              Salvar Configurações
            </GlassButton>
          </GlassCard>

          {/* Example */}
          <GlassCard>
            <h5 className="mb-3" style={{ color: 'var(--text-primary)' }}>
              💡 Como funciona?
            </h5>
            <div style={{ color: 'var(--text-secondary)' }}>
              <p>
                <strong>Exemplo:</strong> Se você recebe dia 5 e dia 20, configure:
              </p>
              <ul>
                <li><strong>Período 1:</strong> Dia 1 até dia 5 (primeiro pagamento)</li>
                <li><strong>Período 2:</strong> Dia 6 até fim do mês (segundo pagamento)</li>
              </ul>
              <p className="mb-0">
                Na página de Transações, você poderá filtrar por período e ver o resumo de receitas/despesas
                de cada quinzena separadamente.
              </p>
            </div>
          </GlassCard>
        </>
      )}

      {activeTab === 'conta' && (
        <>
          {/* User Info */}
          <GlassCard className="mb-4">
            <h5 className="mb-3 d-flex align-items-center" style={{ color: 'var(--text-primary)' }}>
              <FiUser className="me-2" />
              Informações da Conta
            </h5>

            <div
              className="p-4 rounded-3 mb-4"
              style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
              }}
            >
              <div className="d-flex align-items-center gap-4">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle"
                  style={{
                    width: '80px',
                    height: '80px',
                    background: 'var(--gradient-primary)',
                    fontSize: '2rem',
                    color: 'white',
                  }}
                >
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <h4 className="mb-1" style={{ color: 'var(--text-primary)' }}>
                    {user?.email?.split('@')[0] || 'Usuário'}
                  </h4>
                  <p className="mb-0" style={{ color: 'var(--text-muted)' }}>
                    {user?.email || 'email@exemplo.com'}
                  </p>
                </div>
              </div>
            </div>

            <Row>
              <Col md={6}>
                <div className="mb-3">
                  <label style={labelStyle}>Email</label>
                  <div
                    className="p-3 rounded-3"
                    style={{
                      background: 'var(--glass-bg)',
                      border: '1px solid var(--glass-border)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {user?.email || 'N/A'}
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <label style={labelStyle}>ID do Usuário</label>
                  <div
                    className="p-3 rounded-3 text-truncate"
                    style={{
                      background: 'var(--glass-bg)',
                      border: '1px solid var(--glass-border)',
                      color: 'var(--text-muted)',
                      fontSize: '0.85rem',
                    }}
                  >
                    {user?.id || 'N/A'}
                  </div>
                </div>
              </Col>
            </Row>
          </GlassCard>

          {/* Danger Zone */}
          <GlassCard
            style={{
              borderColor: 'var(--expense-color)',
            }}
          >
            <h5 className="mb-3" style={{ color: 'var(--expense-color)' }}>
              ⚠️ Zona de Perigo
            </h5>

            <div
              className="p-4 rounded-3"
              style={{
                background: 'var(--expense-bg)',
                border: '1px solid var(--expense-color)',
              }}
            >
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                <div>
                  <h6 className="mb-1" style={{ color: 'var(--text-primary)' }}>
                    Sair da Conta
                  </h6>
                  <p className="mb-0" style={{ color: 'var(--text-muted)' }}>
                    Você será desconectado e redirecionado para a página de login.
                  </p>
                </div>
                <GlassButton variant="danger" icon={<FiLogOut />} onClick={handleSignOut}>
                  Sair
                </GlassButton>
              </div>
            </div>
          </GlassCard>
        </>
      )}
    </PageLayout>
  );
}
