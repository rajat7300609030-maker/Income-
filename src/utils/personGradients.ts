import { Person } from '../types';

export interface GradientTheme {
  id: string;
  name: string;
  labelHindi: string;
  cardBg: string;
  border: string;
  borderHover: string;
  glowShadow: string;
  topGlowLine: string;
  glowOrbColor: string;
  glowOrbColor2: string;
  avatarGradient: string;
  accentText: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  previewGradient: string;
}

export const PERSON_GRADIENT_THEMES: GradientTheme[] = [
  {
    id: 'ocean',
    name: 'Ocean Azure',
    labelHindi: 'समुद्री नीला',
    cardBg: 'bg-gradient-to-br from-blue-50/95 via-sky-50/70 to-indigo-50/80',
    border: 'border-blue-200/80',
    borderHover: 'hover:border-blue-400',
    glowShadow:
      'shadow-[0_8px_25px_-4px_rgba(37,99,235,0.18),0_2px_8px_-2px_rgba(37,99,235,0.12)] hover:shadow-[0_16px_36px_-4px_rgba(37,99,235,0.32),0_4px_16px_-2px_rgba(37,99,235,0.22)]',
    topGlowLine: 'from-blue-500 via-sky-400 to-indigo-500',
    glowOrbColor: 'bg-gradient-to-br from-blue-500 to-cyan-400',
    glowOrbColor2: 'bg-gradient-to-tr from-indigo-500 to-blue-400',
    avatarGradient: 'bg-gradient-to-br from-blue-600 via-sky-600 to-indigo-700 text-white shadow-[0_4px_14px_rgba(37,99,235,0.45)] ring-2 ring-white',
    accentText: 'text-blue-700 group-hover:text-blue-600',
    badgeBg: 'bg-blue-100/80',
    badgeText: 'text-blue-800',
    badgeBorder: 'border-blue-300/80',
    previewGradient: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'sunset',
    name: 'Sunset Coral',
    labelHindi: 'सूर्यास्त नारंगी',
    cardBg: 'bg-gradient-to-br from-amber-50/95 via-orange-50/75 to-rose-50/85',
    border: 'border-orange-200/80',
    borderHover: 'hover:border-orange-400',
    glowShadow:
      'shadow-[0_8px_25px_-4px_rgba(249,115,22,0.2),0_2px_8px_-2px_rgba(249,115,22,0.12)] hover:shadow-[0_16px_36px_-4px_rgba(249,115,22,0.35),0_4px_16px_-2px_rgba(249,115,22,0.22)]',
    topGlowLine: 'from-amber-500 via-orange-500 to-rose-500',
    glowOrbColor: 'bg-gradient-to-br from-orange-500 to-amber-400',
    glowOrbColor2: 'bg-gradient-to-tr from-rose-500 to-orange-400',
    avatarGradient: 'bg-gradient-to-br from-amber-500 via-orange-600 to-rose-600 text-white shadow-[0_4px_14px_rgba(249,115,22,0.45)] ring-2 ring-white',
    accentText: 'text-orange-700 group-hover:text-orange-600',
    badgeBg: 'bg-orange-100/80',
    badgeText: 'text-orange-800',
    badgeBorder: 'border-orange-300/80',
    previewGradient: 'from-amber-500 to-rose-600',
  },
  {
    id: 'emerald',
    name: 'Royal Emerald',
    labelHindi: 'शाही हरा',
    cardBg: 'bg-gradient-to-br from-emerald-50/95 via-teal-50/70 to-green-50/80',
    border: 'border-emerald-200/80',
    borderHover: 'hover:border-emerald-400',
    glowShadow:
      'shadow-[0_8px_25px_-4px_rgba(16,185,129,0.18),0_2px_8px_-2px_rgba(16,185,129,0.12)] hover:shadow-[0_16px_36px_-4px_rgba(16,185,129,0.32),0_4px_16px_-2px_rgba(16,185,129,0.22)]',
    topGlowLine: 'from-emerald-500 via-teal-400 to-green-500',
    glowOrbColor: 'bg-gradient-to-br from-emerald-500 to-teal-400',
    glowOrbColor2: 'bg-gradient-to-tr from-green-500 to-emerald-400',
    avatarGradient: 'bg-gradient-to-br from-emerald-600 via-teal-600 to-green-700 text-white shadow-[0_4px_14px_rgba(16,185,129,0.45)] ring-2 ring-white',
    accentText: 'text-emerald-700 group-hover:text-emerald-600',
    badgeBg: 'bg-emerald-100/80',
    badgeText: 'text-emerald-800',
    badgeBorder: 'border-emerald-300/80',
    previewGradient: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'amethyst',
    name: 'Neon Amethyst',
    labelHindi: 'बैंगनी जामुनी',
    cardBg: 'bg-gradient-to-br from-purple-50/95 via-violet-50/70 to-fuchsia-50/80',
    border: 'border-purple-200/80',
    borderHover: 'hover:border-purple-400',
    glowShadow:
      'shadow-[0_8px_25px_-4px_rgba(168,85,247,0.2),0_2px_8px_-2px_rgba(168,85,247,0.12)] hover:shadow-[0_16px_36px_-4px_rgba(168,85,247,0.35),0_4px_16px_-2px_rgba(168,85,247,0.22)]',
    topGlowLine: 'from-purple-500 via-violet-400 to-fuchsia-500',
    glowOrbColor: 'bg-gradient-to-br from-purple-500 to-violet-400',
    glowOrbColor2: 'bg-gradient-to-tr from-fuchsia-500 to-purple-400',
    avatarGradient: 'bg-gradient-to-br from-purple-600 via-violet-600 to-fuchsia-700 text-white shadow-[0_4px_14px_rgba(168,85,247,0.45)] ring-2 ring-white',
    accentText: 'text-purple-700 group-hover:text-purple-600',
    badgeBg: 'bg-purple-100/80',
    badgeText: 'text-purple-800',
    badgeBorder: 'border-purple-300/80',
    previewGradient: 'from-purple-500 to-violet-600',
  },
  {
    id: 'ruby',
    name: 'Crimson Ruby',
    labelHindi: 'रूबी लाल',
    cardBg: 'bg-gradient-to-br from-rose-50/95 via-red-50/70 to-pink-50/85',
    border: 'border-rose-200/80',
    borderHover: 'hover:border-rose-400',
    glowShadow:
      'shadow-[0_8px_25px_-4px_rgba(244,63,94,0.2),0_2px_8px_-2px_rgba(244,63,94,0.12)] hover:shadow-[0_16px_36px_-4px_rgba(244,63,94,0.35),0_4px_16px_-2px_rgba(244,63,94,0.22)]',
    topGlowLine: 'from-rose-500 via-red-400 to-pink-500',
    glowOrbColor: 'bg-gradient-to-br from-rose-500 to-red-400',
    glowOrbColor2: 'bg-gradient-to-tr from-pink-500 to-rose-400',
    avatarGradient: 'bg-gradient-to-br from-rose-600 via-red-600 to-pink-700 text-white shadow-[0_4px_14px_rgba(244,63,94,0.45)] ring-2 ring-white',
    accentText: 'text-rose-700 group-hover:text-rose-600',
    badgeBg: 'bg-rose-100/80',
    badgeText: 'text-rose-800',
    badgeBorder: 'border-rose-300/80',
    previewGradient: 'from-rose-500 to-red-600',
  },
  {
    id: 'indigo',
    name: 'Twilight Indigo',
    labelHindi: 'गहरा इंडिगो',
    cardBg: 'bg-gradient-to-br from-indigo-50/95 via-blue-50/70 to-slate-50/85',
    border: 'border-indigo-200/80',
    borderHover: 'hover:border-indigo-400',
    glowShadow:
      'shadow-[0_8px_25px_-4px_rgba(99,102,241,0.2),0_2px_8px_-2px_rgba(99,102,241,0.12)] hover:shadow-[0_16px_36px_-4px_rgba(99,102,241,0.35),0_4px_16px_-2px_rgba(99,102,241,0.22)]',
    topGlowLine: 'from-indigo-500 via-blue-400 to-purple-500',
    glowOrbColor: 'bg-gradient-to-br from-indigo-500 to-blue-400',
    glowOrbColor2: 'bg-gradient-to-tr from-purple-500 to-indigo-400',
    avatarGradient: 'bg-gradient-to-br from-indigo-600 via-blue-700 to-purple-700 text-white shadow-[0_4px_14px_rgba(99,102,241,0.45)] ring-2 ring-white',
    accentText: 'text-indigo-700 group-hover:text-indigo-600',
    badgeBg: 'bg-indigo-100/80',
    badgeText: 'text-indigo-800',
    badgeBorder: 'border-indigo-300/80',
    previewGradient: 'from-indigo-500 to-blue-600',
  },
  {
    id: 'teal',
    name: 'Tropical Teal',
    labelHindi: 'ट्रॉपिकल टील',
    cardBg: 'bg-gradient-to-br from-teal-50/95 via-cyan-50/70 to-emerald-50/80',
    border: 'border-teal-200/80',
    borderHover: 'hover:border-teal-400',
    glowShadow:
      'shadow-[0_8px_25px_-4px_rgba(20,184,166,0.18),0_2px_8px_-2px_rgba(20,184,166,0.12)] hover:shadow-[0_16px_36px_-4px_rgba(20,184,166,0.32),0_4px_16px_-2px_rgba(20,184,166,0.22)]',
    topGlowLine: 'from-teal-500 via-cyan-400 to-emerald-500',
    glowOrbColor: 'bg-gradient-to-br from-teal-500 to-cyan-400',
    glowOrbColor2: 'bg-gradient-to-tr from-emerald-500 to-teal-400',
    avatarGradient: 'bg-gradient-to-br from-teal-600 via-cyan-600 to-emerald-700 text-white shadow-[0_4px_14px_rgba(20,184,166,0.45)] ring-2 ring-white',
    accentText: 'text-teal-700 group-hover:text-teal-600',
    badgeBg: 'bg-teal-100/80',
    badgeText: 'text-teal-800',
    badgeBorder: 'border-teal-300/80',
    previewGradient: 'from-teal-500 to-cyan-600',
  },
  {
    id: 'golden',
    name: 'Golden Sunburst',
    labelHindi: 'गोल्डन सनबर्स्ट',
    cardBg: 'bg-gradient-to-br from-amber-50/95 via-yellow-50/70 to-orange-50/85',
    border: 'border-amber-200/80',
    borderHover: 'hover:border-amber-400',
    glowShadow:
      'shadow-[0_8px_25px_-4px_rgba(245,158,11,0.2),0_2px_8px_-2px_rgba(245,158,11,0.12)] hover:shadow-[0_16px_36px_-4px_rgba(245,158,11,0.35),0_4px_16px_-2px_rgba(245,158,11,0.22)]',
    topGlowLine: 'from-yellow-400 via-amber-500 to-orange-500',
    glowOrbColor: 'bg-gradient-to-br from-amber-400 to-yellow-400',
    glowOrbColor2: 'bg-gradient-to-tr from-orange-400 to-amber-300',
    avatarGradient: 'bg-gradient-to-br from-amber-500 via-yellow-600 to-orange-600 text-white shadow-[0_4px_14px_rgba(245,158,11,0.45)] ring-2 ring-white',
    accentText: 'text-amber-800 group-hover:text-amber-700',
    badgeBg: 'bg-amber-100/80',
    badgeText: 'text-amber-900',
    badgeBorder: 'border-amber-300/80',
    previewGradient: 'from-yellow-400 to-orange-500',
  },
  {
    id: 'fuchsia',
    name: 'Orchid Magenta',
    labelHindi: 'ऑर्किड मैजेंटा',
    cardBg: 'bg-gradient-to-br from-fuchsia-50/95 via-pink-50/70 to-purple-50/80',
    border: 'border-fuchsia-200/80',
    borderHover: 'hover:border-fuchsia-400',
    glowShadow:
      'shadow-[0_8px_25px_-4px_rgba(217,70,239,0.2),0_2px_8px_-2px_rgba(217,70,239,0.12)] hover:shadow-[0_16px_36px_-4px_rgba(217,70,239,0.35),0_4px_16px_-2px_rgba(217,70,239,0.22)]',
    topGlowLine: 'from-fuchsia-500 via-pink-400 to-purple-500',
    glowOrbColor: 'bg-gradient-to-br from-fuchsia-500 to-pink-400',
    glowOrbColor2: 'bg-gradient-to-tr from-purple-500 to-fuchsia-400',
    avatarGradient: 'bg-gradient-to-br from-fuchsia-600 via-pink-600 to-purple-700 text-white shadow-[0_4px_14px_rgba(217,70,239,0.45)] ring-2 ring-white',
    accentText: 'text-fuchsia-700 group-hover:text-fuchsia-600',
    badgeBg: 'bg-fuchsia-100/80',
    badgeText: 'text-fuchsia-800',
    badgeBorder: 'border-fuchsia-300/80',
    previewGradient: 'from-fuchsia-500 to-purple-600',
  },
  {
    id: 'cyan',
    name: 'Electric Cyan',
    labelHindi: 'इलेक्ट्रिक सियान',
    cardBg: 'bg-gradient-to-br from-cyan-50/95 via-sky-50/70 to-teal-50/80',
    border: 'border-cyan-200/80',
    borderHover: 'hover:border-cyan-400',
    glowShadow:
      'shadow-[0_8px_25px_-4px_rgba(6,182,212,0.18),0_2px_8px_-2px_rgba(6,182,212,0.12)] hover:shadow-[0_16px_36px_-4px_rgba(6,182,212,0.32),0_4px_16px_-2px_rgba(6,182,212,0.22)]',
    topGlowLine: 'from-cyan-500 via-sky-400 to-teal-500',
    glowOrbColor: 'bg-gradient-to-br from-cyan-400 to-sky-400',
    glowOrbColor2: 'bg-gradient-to-tr from-teal-400 to-cyan-300',
    avatarGradient: 'bg-gradient-to-br from-cyan-600 via-sky-600 to-teal-700 text-white shadow-[0_4px_14px_rgba(6,182,212,0.45)] ring-2 ring-white',
    accentText: 'text-cyan-700 group-hover:text-cyan-600',
    badgeBg: 'bg-cyan-100/80',
    badgeText: 'text-cyan-800',
    badgeBorder: 'border-cyan-300/80',
    previewGradient: 'from-cyan-400 to-sky-600',
  },
];

/**
 * Deterministically assigns a distinct gradient theme for any person based on their ID / name / index.
 * If person has an explicitly selected theme, returns that theme.
 */
export const getPersonGradientTheme = (
  person: Partial<Person> | null | undefined,
  index?: number
): GradientTheme => {
  if (!person) return PERSON_GRADIENT_THEMES[0];

  if (person.gradientTheme) {
    const matched = PERSON_GRADIENT_THEMES.find(t => t.id === person.gradientTheme);
    if (matched) return matched;
  }

  // Generate deterministic hash from person id + name
  const seed = `${person.id || ''}_${person.name || ''}_${index !== undefined ? index : ''}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }

  const idx = Math.abs(hash) % PERSON_GRADIENT_THEMES.length;
  return PERSON_GRADIENT_THEMES[idx];
};
