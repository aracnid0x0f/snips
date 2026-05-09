export const Colors = {
  brand: {
    primary: '#F1BF98',   // Peach/Action
    background: '#E1F4CB', // Light Green Surface
    border: '#BACBA9',     // Muted Green Border
    text: '#3F4739',       // Dark Olive Text
    secondary: '#717568', // Sage Gray (Secondary Text)
  },
  status: {
    cut: { bg: '#FDE68A', text: '#92400E' },
    sewn: { bg: '#BFDBFE', text: '#1E40AF' },
    ready: { bg: '#BBF7D0', text: '#166534' },
    overdue: { bg: '#FECDD3', text: '#9F1239' },
  },
  dark: {
    background: '#1A1A1A',
    surface: '#2A2A2A',
    border: '#3A3A3A',
    text: '#E1F4CB',
  },
}

export const Fonts = {
  display: 'BorderWall',
  body: 'Caveat_400Regular',
  weight: {
    bold: '700' as const,
    medium: '600' as const,
    normal: '400' as const,
  }
}

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
}

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 999,
}
