import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

let currentIntensity: 'off' | 'soft' | 'crisp' | 'heavy' = 'crisp';

export function setHapticsIntensity(intensity: 'off' | 'soft' | 'crisp' | 'heavy') {
  currentIntensity = intensity;
}

export const triggerHaptic = {
  // Light tick for slider or small collision
  light: async () => {
    if (currentIntensity === 'off') return;
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {
      if (navigator.vibrate) navigator.vibrate(currentIntensity === 'soft' ? 8 : 12);
    }
  },

  // Medium thud on cushion bounce or striker hit
  medium: async () => {
    if (currentIntensity === 'off') return;
    try {
      await Haptics.impact({ style: currentIntensity === 'soft' ? ImpactStyle.Light : ImpactStyle.Medium });
    } catch {
      if (navigator.vibrate) navigator.vibrate(currentIntensity === 'soft' ? 15 : 25);
    }
  },

  // Heavy celebratory pulse when pocketing a puck
  heavy: async () => {
    if (currentIntensity === 'off') return;
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch {
      if (navigator.vibrate) {
        if (currentIntensity === 'soft') navigator.vibrate(20);
        else if (currentIntensity === 'heavy') navigator.vibrate([30, 40, 50, 40]);
        else navigator.vibrate([25, 35]);
      }
    }
  },

  // Success double rumble for Queen or Level Completion
  success: async () => {
    if (currentIntensity === 'off') return;
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch {
      if (navigator.vibrate) navigator.vibrate([40, 60, 40, 80]);
    }
  }
};
