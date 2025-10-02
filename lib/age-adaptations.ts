// Age-based UI adaptation utilities for simplified thesis prototype

export type AgeGroup = 'young' | 'teen' | 'older-teen'

export interface AgeAdaptation {
  group: AgeGroup
  colors: {
    primary: string
    secondary: string
    accent: string
  }
  typography: {
    headingSize: string
    textSize: string
    buttonSize: string
  }
  spacing: {
    cardPadding: string
    buttonPadding: string
    iconSize: string
  }
  animations: {
    duration: string
    scale: string
  }
  language: {
    tone: 'playful' | 'encouraging' | 'mature'
    complexity: 'simple' | 'moderate' | 'advanced'
  }
}

export function getAgeGroup(age: number | null): AgeGroup {
  if (!age || age < 7) return 'young'

  if (age >= 7 && age <= 12) return 'young'      // 7-12: More colorful, playful
  if (age >= 13 && age <= 15) return 'teen'      // 13-15: Balanced, engaging
  return 'older-teen'                            // 16-18: Cleaner, mature
}

export function getAgeAdaptation(age: number | null): AgeAdaptation {
  const group = getAgeGroup(age)

  const adaptations: Record<AgeGroup, AgeAdaptation> = {
    young: {
      group: 'young',
      colors: {
        primary: 'from-coral to-warm-green',
        secondary: 'from-warm-green to-coral',
        accent: 'bg-coral/15'
      },
      typography: {
        headingSize: 'text-4xl md:text-5xl',
        textSize: 'text-lg',
        buttonSize: 'text-lg px-8 py-4'
      },
      spacing: {
        cardPadding: 'p-8',
        buttonPadding: 'px-8 py-4',
        iconSize: 'w-20 h-20'
      },
      animations: {
        duration: 'duration-300',
        scale: 'hover:scale-110'
      },
      language: {
        tone: 'playful',
        complexity: 'simple'
      }
    },
    teen: {
      group: 'teen',
      colors: {
        primary: 'from-sage-blue to-warm-green',
        secondary: 'from-warm-green to-sage-blue',
        accent: 'bg-sage-blue/15'
      },
      typography: {
        headingSize: 'text-3xl md:text-4xl',
        textSize: 'text-base',
        buttonSize: 'text-base px-6 py-3'
      },
      spacing: {
        cardPadding: 'p-6',
        buttonPadding: 'px-6 py-3',
        iconSize: 'w-16 h-16'
      },
      animations: {
        duration: 'duration-300',
        scale: 'hover:scale-105'
      },
      language: {
        tone: 'encouraging',
        complexity: 'moderate'
      }
    },
    'older-teen': {
      group: 'older-teen',
      colors: {
        primary: 'from-charcoal to-sage-blue',
        secondary: 'from-sage-blue to-charcoal',
        accent: 'bg-charcoal/15'
      },
      typography: {
        headingSize: 'text-2xl md:text-3xl',
        textSize: 'text-sm',
        buttonSize: 'text-sm px-4 py-2'
      },
      spacing: {
        cardPadding: 'p-4',
        buttonPadding: 'px-4 py-2',
        iconSize: 'w-12 h-12'
      },
      animations: {
        duration: 'duration-200',
        scale: 'hover:scale-102'
      },
      language: {
        tone: 'mature',
        complexity: 'advanced'
      }
    }
  }

  return adaptations[group]
}

export function getAgeAppropriateMessage(age: number | null, messageType: 'welcome' | 'encouragement' | 'achievement'): string {
  const group = getAgeGroup(age)

  const messages = {
    welcome: {
      young: "🎉 Welcome to your learning adventure!",
      teen: "🎯 Ready to level up your skills?",
      'older-teen': "👋 Welcome to your personalized learning experience"
    },
    encouragement: {
      young: "You're doing amazing! Keep it up! 🌟",
      teen: "Great progress! You've got this! 💪",
      'older-teen': "Excellent work. You're making real progress."
    },
    achievement: {
      young: "🎊 Woohoo! You unlocked something awesome!",
      teen: "🏆 Achievement unlocked! Nice work!",
      'older-teen': "🎯 Achievement completed. Well done."
    }
  }

  return messages[messageType][group]
}

export function getAgeAppropriateEmojis(age: number | null): {
  points: string
  streak: string
  level: string
  achievement: string
} {
  const group = getAgeGroup(age)

  const emojis = {
    young: {
      points: '🌟',
      streak: '🔥',
      level: '🚀',
      achievement: '🎊'
    },
    teen: {
      points: '⭐',
      streak: '🔥',
      level: '⬆️',
      achievement: '🏆'
    },
    'older-teen': {
      points: '●',
      streak: '▲',
      level: '↗',
      achievement: '✓'
    }
  }

  return emojis[group]
}