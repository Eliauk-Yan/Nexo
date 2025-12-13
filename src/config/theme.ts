/**
 * 主题配置
 * 定义应用的颜色、字体、间距等设计规范
 */

export const colors = {
  // 主色调（金色/古铜色系，适合艺术品、文物、历史主题）
  primary: '#D4AF37', // 金色
  primaryDark: '#B8860B', // 深金色/古铜色
  primaryLight: '#F4D03F', // 浅金色
  
  // 背景色（全局纯黑系）
  background: '#000000',
  backgroundSecondary: '#050505',
  backgroundTertiary: '#0a0a0a',
  backgroundCard: '#0f0f0f',
  
  // 文字颜色
  text: '#FFFFFF',
  textSecondary: '#888888',
  textTertiary: '#666666',
  textDisabled: '#444444',
  
  // 边框颜色
  border: '#3a3a3a',
  borderLight: '#2a2a2a',
  borderDark: '#1a1a1a',
  
  // 状态颜色
  success: '#00C851',
  error: '#FF4444',
  warning: '#FFBB33',
  info: '#33B5E5',
  
  // 渐变
  gradient: {
    primary: ['#D4AF37', '#B8860B'], // 金色到古铜色
    secondary: ['#CD853F', '#8B6914'], // 古铜色渐变
    dark: ['#000000', '#000000'],
  },
  
  // 透明度
  overlay: 'rgba(0, 0, 0, 0.6)',
  glass: 'rgba(255, 255, 255, 0.1)',
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
}

export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 24,
    xxxl: 32,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.8,
  },
}

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  primary: {
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
}

export const theme = {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
}

export type Theme = typeof theme

