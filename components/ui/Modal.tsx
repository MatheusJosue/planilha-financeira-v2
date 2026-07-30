'use client';

import { ReactNode } from 'react';
import { Modal as BSModal } from 'react-bootstrap';
import { FiX } from 'react-icons/fi';

interface GlassModalProps {
  show: boolean;
  onHide: () => void;
  title: string;
  titleIcon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'lg' | 'xl';
  centered?: boolean;
  headerGradient?: 'primary' | 'success' | 'danger' | 'warning' | 'info';
  scrollable?: boolean;
  backdrop?: boolean | 'static';
}

export function GlassModal({
  show,
  onHide,
  title,
  titleIcon,
  children,
  footer,
  size = 'lg',
  centered = true,
  headerGradient = 'primary',
  scrollable = false,
  backdrop = true,
}: GlassModalProps) {
  const gradients = {
    primary: 'var(--gradient-primary)',
    success: 'var(--gradient-success)',
    danger: 'var(--gradient-danger)',
    warning: 'var(--gradient-warning)',
    info: 'var(--gradient-info)',
  };

  return (
    <BSModal
      show={show}
      onHide={onHide}
      size={size}
      centered={centered}
      scrollable={scrollable}
      backdrop={backdrop}
      className="modal-glass"
    >
      <BSModal.Header
        style={{
          background: gradients[headerGradient],
          borderBottom: 'none',
          borderRadius: 'var(--border-radius-xl) var(--border-radius-xl) 0 0',
          padding: '1.25rem 1.5rem',
        }}
      >
        <BSModal.Title className="d-flex align-items-center gap-2 text-white fw-semibold">
          {titleIcon && <span className="text-xl">{titleIcon}</span>}
          {title}
        </BSModal.Title>
        <button
          type="button"
          onClick={onHide}
          aria-label="Fechar"
          className="border-0 bg-transparent text-white opacity-80 hover:opacity-100 transition-opacity"
          style={{ fontSize: '1.25rem' }}
        >
          <FiX />
        </button>
      </BSModal.Header>
      <BSModal.Body
        style={{
          background: 'var(--glass-bg-strong)',
          backdropFilter: 'blur(var(--glass-blur-strong))',
          color: 'var(--text-primary)',
          padding: '1.5rem',
        }}
      >
        {children}
      </BSModal.Body>
      {footer && (
        <BSModal.Footer
          style={{
            background: 'var(--glass-bg)',
            borderTop: '1px solid var(--glass-border)',
            borderRadius: '0 0 var(--border-radius-xl) var(--border-radius-xl)',
            padding: '1rem 1.5rem',
          }}
        >
          {footer}
        </BSModal.Footer>
      )}
    </BSModal>
  );
}

export default GlassModal;
