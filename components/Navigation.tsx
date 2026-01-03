'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Container, Nav, Navbar, Dropdown, Offcanvas } from 'react-bootstrap';
import {
  FiHome,
  FiDollarSign,
  FiTarget,
  FiPieChart,
  FiSettings,
  FiLogOut,
  FiUser,
  FiMenu,
  FiSun,
  FiMoon,
  FiCalendar,
  FiRepeat,
} from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useFinanceStore } from '@/store/financeStore';
import { formatMonth } from '@/utils/formatDate';

const navItems = [
  { href: '/', label: 'Dashboard', icon: FiHome },
  { href: '/transacoes', label: 'Transações', icon: FiDollarSign },
  { href: '/recorrentes', label: 'Recorrentes', icon: FiRepeat },
  { href: '/metas', label: 'Metas', icon: FiTarget },
  { href: '/orcamento', label: 'Orçamento', icon: FiPieChart },
  { href: '/configuracoes', label: 'Configurações', icon: FiSettings },
];

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme, mounted } = useTheme();
  const { currentMonth, toggleShowMonthPicker } = useFinanceStore();

  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const handleCloseMobileMenu = () => setShowMobileMenu(false);
  const handleShowMobileMenu = () => setShowMobileMenu(true);

  return (
    <>
      <Navbar
        fixed="top"
        expand="lg"
        className="navbar-glass py-2"
        style={{
          background: 'var(--glass-bg-strong)',
          backdropFilter: 'blur(var(--glass-blur-strong))',
          borderBottom: '1px solid var(--glass-border)',
        }}
      >
        <Container fluid className="px-3 px-lg-4">
          {/* Brand */}
          <Link href="/" className="navbar-brand d-flex align-items-center gap-2 text-decoration-none">
            <div
              className="d-flex align-items-center justify-content-center"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'var(--gradient-primary)',
                fontSize: '18px',
              }}
            >
              💰
            </div>
            <span
              className="fw-bold d-none d-sm-inline"
              style={{ color: 'var(--text-primary)', fontSize: '1.1rem' }}
            >
              Planilha Financeira
            </span>
          </Link>

          {/* Month Selector (Desktop) */}
          <div className="d-none d-lg-flex align-items-center mx-4">
            <button
              onClick={toggleShowMonthPicker}
              className="btn-glass d-flex align-items-center gap-2 px-3 py-2"
              style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: '10px',
                color: 'var(--text-primary)',
              }}
            >
              <FiCalendar size={16} />
              <span className="fw-medium">{formatMonth(currentMonth)}</span>
            </button>
          </div>

          {/* Desktop Nav */}
          <Nav className="d-none d-lg-flex align-items-center gap-1 mx-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-link d-flex align-items-center gap-2 px-3 py-2 rounded-3 transition-all ${
                    isActive ? 'active' : ''
                  }`}
                  style={{
                    color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                    background: isActive ? 'var(--glass-bg)' : 'transparent',
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </Nav>

          {/* Right Side */}
          <div className="d-flex align-items-center gap-2">
            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={toggleTheme}
                className="btn p-2 rounded-3"
                style={{
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--text-primary)',
                }}
                title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
              >
                {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
              </button>
            )}

            {/* User Dropdown (Desktop) */}
            <Dropdown align="end" className="d-none d-lg-block">
              <Dropdown.Toggle
                as="button"
                className="btn p-2 rounded-3 d-flex align-items-center gap-2"
                style={{
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--text-primary)',
                }}
              >
                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    background: 'var(--gradient-primary)',
                  }}
                >
                  <FiUser size={14} color="white" />
                </div>
              </Dropdown.Toggle>

              <Dropdown.Menu
                style={{
                  background: 'var(--glass-bg-strong)',
                  backdropFilter: 'blur(var(--glass-blur-strong))',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '12px',
                  minWidth: '200px',
                }}
              >
                <div className="px-3 py-2 border-bottom" style={{ borderColor: 'var(--glass-border) !important' }}>
                  <p className="mb-0 fw-semibold" style={{ color: 'var(--text-primary)' }}>
                    {user?.email?.split('@')[0]}
                  </p>
                  <small style={{ color: 'var(--text-muted)' }}>{user?.email}</small>
                </div>
                <Dropdown.Item
                  as={Link}
                  href="/configuracoes"
                  className="d-flex align-items-center gap-2 py-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <FiSettings size={16} />
                  Configurações
                </Dropdown.Item>
                <Dropdown.Divider style={{ borderColor: 'var(--glass-border)' }} />
                <Dropdown.Item
                  onClick={handleSignOut}
                  className="d-flex align-items-center gap-2 py-2"
                  style={{ color: 'var(--expense-color)' }}
                >
                  <FiLogOut size={16} />
                  Sair
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            {/* Mobile Menu Button */}
            <button
              className="btn d-lg-none p-2 rounded-3"
              onClick={handleShowMobileMenu}
              style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                color: 'var(--text-primary)',
              }}
            >
              <FiMenu size={20} />
            </button>
          </div>
        </Container>
      </Navbar>

      {/* Mobile Menu Offcanvas */}
      <Offcanvas
        show={showMobileMenu}
        onHide={handleCloseMobileMenu}
        placement="end"
        style={{
          background: 'var(--bg-gradient)',
          borderLeft: '1px solid var(--glass-border)',
        }}
      >
        <Offcanvas.Header
          closeButton
          style={{ borderBottom: '1px solid var(--glass-border)' }}
        >
          <Offcanvas.Title style={{ color: 'var(--text-primary)' }}>
            Menu
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {/* Month Selector Mobile */}
          <button
            onClick={() => {
              toggleShowMonthPicker();
              handleCloseMobileMenu();
            }}
            className="w-100 btn-glass d-flex align-items-center gap-3 p-3 mb-4"
            style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              borderRadius: '12px',
              color: 'var(--text-primary)',
            }}
          >
            <FiCalendar size={20} />
            <span className="fw-medium">{formatMonth(currentMonth)}</span>
          </button>

          {/* Nav Items */}
          <nav className="d-flex flex-column gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleCloseMobileMenu}
                  className={`d-flex align-items-center gap-3 p-3 rounded-3 text-decoration-none ${
                    isActive ? 'active' : ''
                  }`}
                  style={{
                    color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                    background: isActive ? 'var(--glass-bg)' : 'transparent',
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="mt-auto pt-4 border-top" style={{ borderColor: 'var(--glass-border) !important' }}>
            <div className="d-flex align-items-center gap-3 mb-3">
              <div
                className="d-flex align-items-center justify-content-center"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'var(--gradient-primary)',
                }}
              >
                <FiUser size={18} color="white" />
              </div>
              <div>
                <p className="mb-0 fw-semibold" style={{ color: 'var(--text-primary)' }}>
                  {user?.email?.split('@')[0]}
                </p>
                <small style={{ color: 'var(--text-muted)' }}>{user?.email}</small>
              </div>
            </div>

            <button
              onClick={() => {
                handleCloseMobileMenu();
                handleSignOut();
              }}
              className="w-100 btn d-flex align-items-center justify-content-center gap-2 p-3"
              style={{
                background: 'rgba(244, 92, 67, 0.15)',
                border: '1px solid rgba(244, 92, 67, 0.3)',
                borderRadius: '12px',
                color: 'var(--expense-color)',
              }}
            >
              <FiLogOut size={18} />
              Sair
            </button>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default Navigation;
