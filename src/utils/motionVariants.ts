import { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { resolveMotionTokens, MotionTimingTokens } from './calculations';

export const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];
export const EASE_SPRING_SOFT: [number, number, number, number] = [0.22, 1.2, 0.36, 1];

export function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReduced(e.matches);
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReduced;
}

export function useMotionSystem(): {
  tokens: MotionTimingTokens;
  reducedMotion: boolean;
  pageVariants: {
    initial: { opacity: number; y: number };
    animate: { opacity: number; y: number; transition: { duration: number; ease: [number, number, number, number] } };
    exit: { opacity: number; y: number; transition: { duration: number; ease: [number, number, number, number] } };
  };
  staggerContainer: {
    hidden: { opacity: number };
    visible: {
      opacity: number;
      transition: { staggerChildren: number; delayChildren: number };
    };
  };
  staggerItem: {
    hidden: { opacity: number; y: number };
    visible: {
      opacity: number;
      y: number;
      transition: { duration: number; ease: [number, number, number, number] };
    };
  };
  modalOverlayVariants: {
    initial: { opacity: number };
    animate: { opacity: number; transition: { duration: number } };
    exit: { opacity: number; transition: { duration: number } };
  };
  modalDialogVariants: {
    initial: { opacity: number; scale: number; y: number };
    animate: {
      opacity: number;
      scale: number;
      y: number;
      transition: { duration: number; ease: [number, number, number, number] };
    };
    exit: {
      opacity: number;
      scale: number;
      y: number;
      transition: { duration: number; ease: [number, number, number, number] };
    };
  };
} {
  const prefersReduced = usePrefersReducedMotion();
  const { uiSettings } = useLanguage();
  const tokens = resolveMotionTokens(uiSettings.animationSpeed, prefersReduced);

  return {
    tokens,
    reducedMotion: prefersReduced,
    pageVariants: {
      initial: { opacity: 0, y: tokens.enterYOffsetPx },
      animate: {
        opacity: 1,
        y: 0,
        transition: {
          duration: tokens.pageDurationSec,
          ease: EASE_OUT_EXPO,
        },
      },
      exit: {
        opacity: 0,
        y: prefersReduced ? 0 : -6,
        transition: {
          duration: Math.max(0.01, tokens.pageDurationSec * 0.75),
          ease: EASE_OUT_EXPO,
        },
      },
    },
    staggerContainer: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: tokens.staggerSec,
          delayChildren: prefersReduced ? 0 : 0.02,
        },
      },
    },
    staggerItem: {
      hidden: { opacity: 0, y: tokens.enterYOffsetPx },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: tokens.pageDurationSec,
          ease: EASE_OUT_EXPO,
        },
      },
    },
    modalOverlayVariants: {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { duration: prefersReduced ? 0.01 : 0.18 } },
      exit: { opacity: 0, transition: { duration: prefersReduced ? 0.01 : 0.15 } },
    },
    modalDialogVariants: {
      initial: {
        opacity: 0,
        scale: prefersReduced ? 1 : 0.96,
        y: prefersReduced ? 0 : 10,
      },
      animate: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
          duration: tokens.pageDurationSec,
          ease: EASE_OUT_EXPO,
        },
      },
      exit: {
        opacity: 0,
        scale: prefersReduced ? 1 : 0.97,
        y: prefersReduced ? 0 : 6,
        transition: {
          duration: Math.max(0.01, tokens.pageDurationSec * 0.75),
          ease: EASE_OUT_EXPO,
        },
      },
    },
  };
}
