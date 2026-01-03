import Swal from 'sweetalert2';

// Custom theme colors matching glassmorphism design
const customTheme = {
  background: 'rgba(26, 26, 46, 0.95)',
  color: '#ffffff',
  confirmButtonColor: '#667eea',
  cancelButtonColor: '#6c757d',
  iconColor: '#667eea',
};

// Success alert
export const showSuccess = (title: string, text?: string) => {
  return Swal.fire({
    title,
    text,
    icon: 'success',
    background: customTheme.background,
    color: customTheme.color,
    confirmButtonColor: customTheme.confirmButtonColor,
    confirmButtonText: 'OK',
    customClass: {
      popup: 'glass-strong',
      confirmButton: 'btn-gradient',
    },
  });
};

// Error alert
export const showError = (title: string, text?: string) => {
  return Swal.fire({
    title,
    text,
    icon: 'error',
    background: customTheme.background,
    color: customTheme.color,
    confirmButtonColor: customTheme.confirmButtonColor,
    confirmButtonText: 'OK',
    customClass: {
      popup: 'glass-strong',
      confirmButton: 'btn-gradient',
    },
  });
};

// Warning alert
export const showWarning = (title: string, text?: string) => {
  return Swal.fire({
    title,
    text,
    icon: 'warning',
    background: customTheme.background,
    color: customTheme.color,
    confirmButtonColor: customTheme.confirmButtonColor,
    confirmButtonText: 'OK',
    customClass: {
      popup: 'glass-strong',
      confirmButton: 'btn-gradient',
    },
  });
};

// Info alert
export const showInfo = (title: string, text?: string) => {
  return Swal.fire({
    title,
    text,
    icon: 'info',
    background: customTheme.background,
    color: customTheme.color,
    confirmButtonColor: customTheme.confirmButtonColor,
    confirmButtonText: 'OK',
    customClass: {
      popup: 'glass-strong',
      confirmButton: 'btn-gradient',
    },
  });
};

// Confirmation dialog
export const showConfirm = (
  title: string,
  text?: string,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar'
) => {
  return Swal.fire({
    title,
    text,
    icon: 'question',
    showCancelButton: true,
    background: customTheme.background,
    color: customTheme.color,
    confirmButtonColor: customTheme.confirmButtonColor,
    cancelButtonColor: customTheme.cancelButtonColor,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    customClass: {
      popup: 'glass-strong',
      confirmButton: 'btn-gradient',
      cancelButton: 'btn-glass',
    },
  });
};

// Delete confirmation dialog
export const showDeleteConfirm = (itemName: string) => {
  return Swal.fire({
    title: 'Excluir?',
    text: `Tem certeza que deseja excluir "${itemName}"? Esta ação não pode ser desfeita.`,
    icon: 'warning',
    showCancelButton: true,
    background: customTheme.background,
    color: customTheme.color,
    confirmButtonColor: '#eb3349',
    cancelButtonColor: customTheme.cancelButtonColor,
    confirmButtonText: 'Sim, excluir',
    cancelButtonText: 'Cancelar',
    customClass: {
      popup: 'glass-strong',
      confirmButton: 'btn-gradient-danger',
      cancelButton: 'btn-glass',
    },
  });
};

// Success toast (top-right)
export const showSuccessToast = (title: string) => {
  return Swal.fire({
    title,
    icon: 'success',
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: customTheme.background,
    color: customTheme.color,
    customClass: {
      popup: 'glass-strong',
    },
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
  });
};

// Error toast (top-right)
export const showErrorToast = (title: string) => {
  return Swal.fire({
    title,
    icon: 'error',
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 4000,
    timerProgressBar: true,
    background: customTheme.background,
    color: customTheme.color,
    customClass: {
      popup: 'glass-strong',
    },
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
  });
};

// Info toast (top-right)
export const showInfoToast = (title: string) => {
  return Swal.fire({
    title,
    icon: 'info',
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: customTheme.background,
    color: customTheme.color,
    customClass: {
      popup: 'glass-strong',
    },
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
  });
};

// Input dialog
export const showInput = (title: string, placeholder?: string, inputValue?: string) => {
  return Swal.fire({
    title,
    input: 'text',
    inputPlaceholder: placeholder,
    inputValue: inputValue || '',
    showCancelButton: true,
    background: customTheme.background,
    color: customTheme.color,
    confirmButtonColor: customTheme.confirmButtonColor,
    cancelButtonColor: customTheme.cancelButtonColor,
    confirmButtonText: 'Confirmar',
    cancelButtonText: 'Cancelar',
    customClass: {
      popup: 'glass-strong',
      input: 'input-glass',
      confirmButton: 'btn-gradient',
      cancelButton: 'btn-glass',
    },
    inputValidator: (value) => {
      if (!value) {
        return 'Por favor, preencha o campo';
      }
      return null;
    },
  });
};

// Loading indicator
export const showLoading = (title = 'Carregando...') => {
  return Swal.fire({
    title,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    background: customTheme.background,
    color: customTheme.color,
    customClass: {
      popup: 'glass-strong',
    },
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

// Close loading
export const closeLoading = () => {
  Swal.close();
};

export default Swal;
