export type AppTheme = 'dark' | 'light';

export const THEME_COLORS: Record<AppTheme, string> = {
  dark: '#0f0c29',
  light: '#f5f7fa',
};

export function applyAppTheme(theme: AppTheme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.style.backgroundColor = THEME_COLORS[theme];

  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => {
    meta.setAttribute('content', THEME_COLORS[theme]);
  });
}
