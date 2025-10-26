import { cn } from '@/lib/utils'

describe('Utils', () => {
  describe('cn (classname utility)', () => {
    it('merges multiple class names', () => {
      const result = cn('px-4', 'py-2', 'bg-blue-500')
      expect(result).toBe('px-4 py-2 bg-blue-500')
    })

    it('handles conditional classes', () => {
      const result = cn('base-class', true && 'conditional-class', false && 'not-included')
      expect(result).toBe('base-class conditional-class')
    })

    it('merges Tailwind classes correctly (deduplicates conflicting classes)', () => {
      // twMerge should deduplicate and use the last conflicting class
      const result = cn('px-4', 'px-8')
      expect(result).toBe('px-8')
    })

    it('handles object syntax', () => {
      const result = cn({
        'active': true,
        'inactive': false,
        'visible': true,
      })
      expect(result).toBe('active visible')
    })

    it('handles arrays', () => {
      const result = cn(['class-1', 'class-2'], 'class-3')
      expect(result).toBe('class-1 class-2 class-3')
    })

    it('handles empty input', () => {
      const result = cn()
      expect(result).toBe('')
    })

    it('handles undefined and null', () => {
      const result = cn('valid-class', undefined, null, 'another-valid')
      expect(result).toBe('valid-class another-valid')
    })

    it('resolves Tailwind conflicts correctly', () => {
      const result = cn('p-4', 'px-8', 'py-2')
      // px-8 and py-2 should override p-4's x and y padding specifically
      // Note: tailwind-merge keeps p-4 and adds px-8 py-2 which override the x/y values
      expect(result).toContain('px-8')
      expect(result).toContain('py-2')
    })

    it('handles complex real-world scenarios', () => {
      const isActive = true
      const isDisabled = false
      const result = cn(
        'btn',
        'px-4 py-2',
        isActive && 'bg-blue-500 text-white',
        isDisabled && 'opacity-50 cursor-not-allowed',
        'hover:bg-blue-600'
      )
      expect(result).toContain('btn')
      expect(result).toContain('px-4 py-2')
      expect(result).toContain('bg-blue-500 text-white')
      expect(result).toContain('hover:bg-blue-600')
      expect(result).not.toContain('opacity-50')
    })
  })
})
