'use client';

import { ReactNode } from 'react';
import { Container } from 'react-bootstrap';

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'fluid';
  className?: string;
}

export function PageLayout({
  children,
  title,
  subtitle,
  action,
  maxWidth = 'xxl',
  className = '',
}: PageLayoutProps) {
  return (
    <main className="main-content">
      <Container fluid className={`px-3 px-lg-4 ${className}`}>
        {(title || action) && (
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
            <div>
              {title && (
                <h1
                  className="h3 fw-bold mb-1"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="mb-0" style={{ color: 'var(--text-muted)' }}>
                  {subtitle}
                </p>
              )}
            </div>
            {action && <div>{action}</div>}
          </div>
        )}
        {children}
      </Container>
    </main>
  );
}

export default PageLayout;
