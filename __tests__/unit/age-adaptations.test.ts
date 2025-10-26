import {
  getAgeGroup,
  getAgeAdaptation,
  getAgeAppropriateMessage,
  getAgeAppropriateEmojis,
  type AgeGroup,
} from '@/lib/age-adaptations'

describe('Age Adaptations', () => {
  describe('getAgeGroup', () => {
    it('returns "young" for ages 7-12', () => {
      expect(getAgeGroup(7)).toBe('young')
      expect(getAgeGroup(10)).toBe('young')
      expect(getAgeGroup(12)).toBe('young')
    })

    it('returns "teen" for ages 13-15', () => {
      expect(getAgeGroup(13)).toBe('teen')
      expect(getAgeGroup(14)).toBe('teen')
      expect(getAgeGroup(15)).toBe('teen')
    })

    it('returns "older-teen" for ages 16-18', () => {
      expect(getAgeGroup(16)).toBe('older-teen')
      expect(getAgeGroup(17)).toBe('older-teen')
      expect(getAgeGroup(18)).toBe('older-teen')
    })

    it('returns "young" for ages below 7', () => {
      expect(getAgeGroup(5)).toBe('young')
      expect(getAgeGroup(0)).toBe('young')
    })

    it('returns "young" for null age', () => {
      expect(getAgeGroup(null)).toBe('young')
    })

    it('returns "older-teen" for ages above 18', () => {
      expect(getAgeGroup(19)).toBe('older-teen')
      expect(getAgeGroup(25)).toBe('older-teen')
    })

    it('handles boundary ages correctly', () => {
      // Lower boundary of "young"
      expect(getAgeGroup(7)).toBe('young')
      // Upper boundary of "young"
      expect(getAgeGroup(12)).toBe('young')
      // Lower boundary of "teen"
      expect(getAgeGroup(13)).toBe('teen')
      // Upper boundary of "teen"
      expect(getAgeGroup(15)).toBe('teen')
      // Lower boundary of "older-teen"
      expect(getAgeGroup(16)).toBe('older-teen')
    })
  })

  describe('getAgeAdaptation', () => {
    it('returns correct adaptation for young age group', () => {
      const adaptation = getAgeAdaptation(10)

      expect(adaptation.group).toBe('young')
      expect(adaptation.colors.primary).toBe('from-coral to-warm-green')
      expect(adaptation.typography.headingSize).toBe('text-4xl md:text-5xl')
      expect(adaptation.spacing.iconSize).toBe('w-20 h-20')
      expect(adaptation.animations.scale).toBe('hover:scale-110')
      expect(adaptation.language.tone).toBe('playful')
      expect(adaptation.language.complexity).toBe('simple')
    })

    it('returns correct adaptation for teen age group', () => {
      const adaptation = getAgeAdaptation(14)

      expect(adaptation.group).toBe('teen')
      expect(adaptation.colors.primary).toBe('from-sage-blue to-warm-green')
      expect(adaptation.typography.headingSize).toBe('text-3xl md:text-4xl')
      expect(adaptation.spacing.iconSize).toBe('w-16 h-16')
      expect(adaptation.animations.scale).toBe('hover:scale-105')
      expect(adaptation.language.tone).toBe('encouraging')
      expect(adaptation.language.complexity).toBe('moderate')
    })

    it('returns correct adaptation for older-teen age group', () => {
      const adaptation = getAgeAdaptation(17)

      expect(adaptation.group).toBe('older-teen')
      expect(adaptation.colors.primary).toBe('from-charcoal to-sage-blue')
      expect(adaptation.typography.headingSize).toBe('text-2xl md:text-3xl')
      expect(adaptation.spacing.iconSize).toBe('w-12 h-12')
      expect(adaptation.animations.scale).toBe('hover:scale-102')
      expect(adaptation.language.tone).toBe('mature')
      expect(adaptation.language.complexity).toBe('advanced')
    })

    it('returns young adaptation for null age', () => {
      const adaptation = getAgeAdaptation(null)
      expect(adaptation.group).toBe('young')
    })

    it('has all required properties in adaptation object', () => {
      const adaptation = getAgeAdaptation(15)

      expect(adaptation).toHaveProperty('group')
      expect(adaptation).toHaveProperty('colors')
      expect(adaptation.colors).toHaveProperty('primary')
      expect(adaptation.colors).toHaveProperty('secondary')
      expect(adaptation.colors).toHaveProperty('accent')
      expect(adaptation).toHaveProperty('typography')
      expect(adaptation.typography).toHaveProperty('headingSize')
      expect(adaptation.typography).toHaveProperty('textSize')
      expect(adaptation.typography).toHaveProperty('buttonSize')
      expect(adaptation).toHaveProperty('spacing')
      expect(adaptation.spacing).toHaveProperty('cardPadding')
      expect(adaptation.spacing).toHaveProperty('buttonPadding')
      expect(adaptation.spacing).toHaveProperty('iconSize')
      expect(adaptation).toHaveProperty('animations')
      expect(adaptation.animations).toHaveProperty('duration')
      expect(adaptation.animations).toHaveProperty('scale')
      expect(adaptation).toHaveProperty('language')
      expect(adaptation.language).toHaveProperty('tone')
      expect(adaptation.language).toHaveProperty('complexity')
    })
  })

  describe('getAgeAppropriateMessage', () => {
    describe('welcome messages', () => {
      it('returns playful welcome for young age group', () => {
        const message = getAgeAppropriateMessage(10, 'welcome')
        expect(message).toBe("🎉 Welcome to your learning adventure!")
      })

      it('returns engaging welcome for teen age group', () => {
        const message = getAgeAppropriateMessage(14, 'welcome')
        expect(message).toBe("🎯 Ready to level up your skills?")
      })

      it('returns mature welcome for older-teen age group', () => {
        const message = getAgeAppropriateMessage(17, 'welcome')
        expect(message).toBe("👋 Welcome to your personalized learning experience")
      })
    })

    describe('encouragement messages', () => {
      it('returns enthusiastic encouragement for young age group', () => {
        const message = getAgeAppropriateMessage(8, 'encouragement')
        expect(message).toBe("You're doing amazing! Keep it up! 🌟")
      })

      it('returns supportive encouragement for teen age group', () => {
        const message = getAgeAppropriateMessage(13, 'encouragement')
        expect(message).toBe("Great progress! You've got this! 💪")
      })

      it('returns professional encouragement for older-teen age group', () => {
        const message = getAgeAppropriateMessage(18, 'encouragement')
        expect(message).toBe("Excellent work. You're making real progress.")
      })
    })

    describe('achievement messages', () => {
      it('returns celebratory achievement for young age group', () => {
        const message = getAgeAppropriateMessage(9, 'achievement')
        expect(message).toBe("🎊 Woohoo! You unlocked something awesome!")
      })

      it('returns congratulatory achievement for teen age group', () => {
        const message = getAgeAppropriateMessage(15, 'achievement')
        expect(message).toBe("🏆 Achievement unlocked! Nice work!")
      })

      it('returns concise achievement for older-teen age group', () => {
        const message = getAgeAppropriateMessage(16, 'achievement')
        expect(message).toBe("🎯 Achievement completed. Well done.")
      })
    })

    it('handles null age correctly', () => {
      const message = getAgeAppropriateMessage(null, 'welcome')
      expect(message).toBe("🎉 Welcome to your learning adventure!")
    })
  })

  describe('getAgeAppropriateEmojis', () => {
    it('returns colorful emojis for young age group', () => {
      const emojis = getAgeAppropriateEmojis(10)

      expect(emojis.points).toBe('🌟')
      expect(emojis.streak).toBe('🔥')
      expect(emojis.level).toBe('🚀')
      expect(emojis.achievement).toBe('🎊')
    })

    it('returns balanced emojis for teen age group', () => {
      const emojis = getAgeAppropriateEmojis(14)

      expect(emojis.points).toBe('⭐')
      expect(emojis.streak).toBe('🔥')
      expect(emojis.level).toBe('⬆️')
      expect(emojis.achievement).toBe('🏆')
    })

    it('returns minimal symbols for older-teen age group', () => {
      const emojis = getAgeAppropriateEmojis(17)

      expect(emojis.points).toBe('●')
      expect(emojis.streak).toBe('▲')
      expect(emojis.level).toBe('↗')
      expect(emojis.achievement).toBe('✓')
    })

    it('has all required emoji properties', () => {
      const emojis = getAgeAppropriateEmojis(15)

      expect(emojis).toHaveProperty('points')
      expect(emojis).toHaveProperty('streak')
      expect(emojis).toHaveProperty('level')
      expect(emojis).toHaveProperty('achievement')
    })

    it('handles null age correctly', () => {
      const emojis = getAgeAppropriateEmojis(null)
      expect(emojis.points).toBe('🌟')
    })
  })
})
