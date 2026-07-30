'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Container, Dropdown, Nav, Navbar, Offcanvas } from 'react-bootstrap';
import {
  FiChevronDown,
  FiDollarSign,
  FiHome,
  FiLogOut,
  FiMenu,
  FiMoon,
  FiPieChart,
  FiRepeat,
  FiSettings,
  FiSun,
  FiTarget,
} from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';

const primaryItems = [
  { href: '/', label: 'Visão geral', icon: FiHome },
  { href: '/transacoes', label: 'Transações', icon: FiDollarSign },
];

const planningItems = [
  { href: '/recorrentes', label: 'Recorrentes', icon: FiRepeat },
  { href: '/metas', label: 'Metas', icon: FiTarget },
  { href: '/orcamento', label: 'Orçamento', icon: FiPieChart },
];

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme, mounted } = useTheme();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const planningIsActive = planningItems.some((item) => pathname === item.href);
  const userName = user?.email?.split('@')[0] || 'Usuário';
  const userInitial = userName.charAt(0).toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <>
      <Navbar fixed="top" className="app-header">
        <Container fluid className="app-header-container px-3 px-lg-4">
          <Link href="/" className="app-brand">
            <span className="app-brand-mark">💰</span>
            <span className="app-brand-name">Financeiro</span>
          </Link>

          <Nav className="app-nav d-none d-lg-flex">
            {primaryItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} className={`app-nav-link ${isActive ? 'active' : ''}`}>
                  <Icon />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <Dropdown className="app-planning-dropdown">
              <Dropdown.Toggle as="button" className={`app-nav-link ${planningIsActive ? 'active' : ''}`}>
                <FiTarget />
                <span>Planejamento</span>
                <FiChevronDown className="app-nav-chevron" />
              </Dropdown.Toggle>
              <Dropdown.Menu className="app-dropdown-menu">
                <span className="app-dropdown-label">Planejamento</span>
                {planningItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Dropdown.Item
                      key={item.href}
                      as={Link}
                      href={item.href}
                      className={`app-dropdown-item ${pathname === item.href ? 'active' : ''}`}
                    >
                      <Icon />
                      <span>{item.label}</span>
                    </Dropdown.Item>
                  );
                })}
              </Dropdown.Menu>
            </Dropdown>
          </Nav>

          <div className="app-header-actions">
            {mounted && (
              <button
                type="button"
                onClick={toggleTheme}
                className="app-icon-button"
                title={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
                aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
              >
                {theme === 'dark' ? <FiSun /> : <FiMoon />}
              </button>
            )}

            <Dropdown align="end" className="d-none d-lg-block">
              <Dropdown.Toggle as="button" className="app-user-button">
                <span className="app-user-avatar">{userInitial}</span>
                <span className="app-user-copy">
                  <strong>{userName}</strong>
                  <small>Minha conta</small>
                </span>
                <FiChevronDown className="app-user-chevron" />
              </Dropdown.Toggle>
              <Dropdown.Menu className="app-dropdown-menu app-user-menu">
                <div className="app-user-menu-header">
                  <span className="app-user-avatar large">{userInitial}</span>
                  <div><strong>{userName}</strong><small>{user?.email}</small></div>
                </div>
                <Dropdown.Item as={Link} href="/configuracoes" className="app-dropdown-item">
                  <FiSettings /><span>Configurações</span>
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleSignOut} className="app-dropdown-item danger">
                  <FiLogOut /><span>Sair</span>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            <button
              type="button"
              className="app-icon-button d-lg-none"
              onClick={() => setShowMobileMenu(true)}
              aria-label="Abrir menu"
            >
              <FiMenu />
            </button>
          </div>
        </Container>
      </Navbar>

      <Offcanvas
        show={showMobileMenu}
        onHide={() => setShowMobileMenu(false)}
        placement="end"
        className="app-mobile-menu"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title className="app-mobile-title">
            <span className="app-brand-mark">💰</span> Financeiro
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className="app-mobile-profile">
            <span className="app-user-avatar large">{userInitial}</span>
            <div><strong>{userName}</strong><small>{user?.email}</small></div>
          </div>

          <nav className="app-mobile-nav">
            <span className="app-dropdown-label">Navegação</span>
            {primaryItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setShowMobileMenu(false)}
                  className={`app-mobile-link ${pathname === item.href ? 'active' : ''}`}
                >
                  <Icon /><span>{item.label}</span>
                </Link>
              );
            })}

            <span className="app-dropdown-label app-mobile-section-label">Planejamento</span>
            {planningItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setShowMobileMenu(false)}
                  className={`app-mobile-link ${pathname === item.href ? 'active' : ''}`}
                >
                  <Icon /><span>{item.label}</span>
                </Link>
              );
            })}

            <span className="app-dropdown-label app-mobile-section-label">Conta</span>
            <Link href="/configuracoes" onClick={() => setShowMobileMenu(false)} className="app-mobile-link">
              <FiSettings /><span>Configurações</span>
            </Link>
          </nav>

          <button type="button" onClick={handleSignOut} className="app-mobile-signout">
            <FiLogOut /><span>Sair da conta</span>
          </button>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default Navigation;
