import { useApp } from '../context/AppContext'

// Explicit hex values for SVG chart attributes, chosen per theme.
// Series palette validated (lightness band, chroma, CVD, contrast) for each surface.
const themes = {
  dark: {
    grid: 'rgba(255,255,255,0.06)',
    axis: '#6b7685',
    ink: '#f3f6f9',
    ink2: '#a2acb9',
    surface: '#0f141b',
    accent: '#c6ff3d',
    accentFrom: '#c6ff3d',
    accentTo: '#22d3ee',
    cursor: 'rgba(255,255,255,0.05)',
    series: ['#65a30d', '#0891b2', '#a855f7'],
  },
  light: {
    grid: 'rgba(15,23,42,0.07)',
    axis: '#8a94a3',
    ink: '#0b1220',
    ink2: '#475467',
    surface: '#ffffff',
    accent: '#65a30d',
    accentFrom: '#84cc16',
    accentTo: '#0891b2',
    cursor: 'rgba(15,23,42,0.04)',
    series: ['#65a30d', '#0891b2', '#9333ea'],
  },
}

export default function useChartTheme() {
  const { theme } = useApp()
  return themes[theme] ?? themes.dark
}
