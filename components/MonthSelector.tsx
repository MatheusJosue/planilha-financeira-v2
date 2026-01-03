'use client';

import { useState, useEffect } from 'react';
import { Modal, Row, Col } from 'react-bootstrap';
import { FiChevronLeft, FiChevronRight, FiX, FiPlus } from 'react-icons/fi';
import { useFinanceStore } from '@/store/financeStore';
import { formatMonth, getCurrentMonth, getPreviousMonth, getNextMonth } from '@/utils/formatDate';
import { GlassButton } from '@/components/ui/GlassButton';

export function MonthSelector() {
  const {
    currentMonth,
    showMonthPicker,
    toggleShowMonthPicker,
    setCurrentMonth,
    getAvailableMonths,
    createNewMonth,
  } = useFinanceStore();

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const availableMonths = getAvailableMonths();

  useEffect(() => {
    if (currentMonth) {
      setSelectedYear(parseInt(currentMonth.split('-')[0]));
    }
  }, [currentMonth]);

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril',
    'Maio', 'Junho', 'Julho', 'Agosto',
    'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];

  const handleSelectMonth = async (monthIndex: number) => {
    const month = `${selectedYear}-${String(monthIndex + 1).padStart(2, '0')}`;
    await setCurrentMonth(month);
    toggleShowMonthPicker();
  };

  const handlePrevMonth = async () => {
    const prevMonth = getPreviousMonth(currentMonth);
    await setCurrentMonth(prevMonth);
  };

  const handleNextMonth = async () => {
    const nextMonth = getNextMonth(currentMonth);
    await setCurrentMonth(nextMonth);
  };

  const isMonthAvailable = (monthIndex: number) => {
    const month = `${selectedYear}-${String(monthIndex + 1).padStart(2, '0')}`;
    return availableMonths.includes(month);
  };

  const isCurrentSelection = (monthIndex: number) => {
    const month = `${selectedYear}-${String(monthIndex + 1).padStart(2, '0')}`;
    return month === currentMonth;
  };

  const currentMonthNum = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const isCurrentMonth = (monthIndex: number) => {
    return selectedYear === currentYear && monthIndex === currentMonthNum;
  };

  return (
    <>
      {/* Quick Navigation Bar (shown inline) */}
      <div className="d-flex align-items-center justify-content-center gap-2 mb-4">
        <GlassButton variant="glass" size="sm" onClick={handlePrevMonth}>
          <FiChevronLeft size={18} />
        </GlassButton>

        <button
          onClick={toggleShowMonthPicker}
          className="btn-glass px-4 py-2 fw-semibold"
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: '12px',
            color: 'var(--text-primary)',
            minWidth: '180px',
          }}
        >
          {formatMonth(currentMonth)}
        </button>

        <GlassButton variant="glass" size="sm" onClick={handleNextMonth}>
          <FiChevronRight size={18} />
        </GlassButton>
      </div>

      {/* Month Picker Modal */}
      <Modal
        show={showMonthPicker}
        onHide={toggleShowMonthPicker}
        centered
        size="lg"
        className="modal-glass"
      >
        <Modal.Header
          style={{
            background: 'var(--gradient-primary)',
            borderBottom: 'none',
            borderRadius: 'var(--border-radius-xl) var(--border-radius-xl) 0 0',
          }}
        >
          <Modal.Title className="text-white fw-semibold">
            Selecionar Mês
          </Modal.Title>
          <button
            onClick={toggleShowMonthPicker}
            className="btn text-white"
            style={{ opacity: 0.8 }}
          >
            <FiX size={20} />
          </button>
        </Modal.Header>

        <Modal.Body
          style={{
            background: 'var(--glass-bg-strong)',
            backdropFilter: 'blur(var(--glass-blur-strong))',
          }}
        >
          {/* Year Selector */}
          <div className="d-flex align-items-center justify-content-center gap-4 mb-4">
            <button
              onClick={() => setSelectedYear((y) => y - 1)}
              className="btn p-2"
              style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: '10px',
                color: 'var(--text-primary)',
              }}
            >
              <FiChevronLeft size={20} />
            </button>

            <span
              className="fw-bold"
              style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}
            >
              {selectedYear}
            </span>

            <button
              onClick={() => setSelectedYear((y) => y + 1)}
              className="btn p-2"
              style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: '10px',
                color: 'var(--text-primary)',
              }}
            >
              <FiChevronRight size={20} />
            </button>
          </div>

          {/* Month Grid */}
          <Row className="g-2">
            {months.map((month, index) => {
              const isAvailable = isMonthAvailable(index);
              const isCurrent = isCurrentSelection(index);
              const isToday = isCurrentMonth(index);

              return (
                <Col xs={6} sm={4} md={3} key={month}>
                  <button
                    onClick={() => handleSelectMonth(index)}
                    className={`w-100 p-3 text-center rounded-3 transition-all ${
                      isCurrent ? 'active' : ''
                    }`}
                    style={{
                      background: isCurrent
                        ? 'var(--gradient-primary)'
                        : isAvailable
                        ? 'var(--glass-bg)'
                        : 'transparent',
                      border: `1px solid ${
                        isCurrent
                          ? 'transparent'
                          : isToday
                          ? 'var(--accent-blue)'
                          : 'var(--glass-border)'
                      }`,
                      color: isCurrent
                        ? 'white'
                        : isAvailable
                        ? 'var(--text-primary)'
                        : 'var(--text-hint)',
                      fontWeight: isCurrent || isToday ? 600 : 400,
                      cursor: 'pointer',
                    }}
                  >
                    {month.slice(0, 3)}
                    {isToday && !isCurrent && (
                      <span
                        className="d-block"
                        style={{ fontSize: '0.65rem', color: 'var(--accent-blue)' }}
                      >
                        Atual
                      </span>
                    )}
                  </button>
                </Col>
              );
            })}
          </Row>

          {/* Quick Actions */}
          <div className="d-flex gap-2 mt-4 pt-3 border-top" style={{ borderColor: 'var(--glass-border) !important' }}>
            <GlassButton
              variant="glass"
              size="sm"
              onClick={() => {
                setSelectedYear(currentYear);
                handleSelectMonth(currentMonthNum);
              }}
              className="flex-1"
            >
              Ir para hoje
            </GlassButton>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default MonthSelector;
