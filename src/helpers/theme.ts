/** Read a Tailwind v4 theme value (emitted as a CSS variable on `:root`). */
export function themeVar(name: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim()
}

/** Palette for the tte-js hero effect, sourced from the Tailwind theme. */
export function themePalette(): string[] {
  return [
    themeVar('--color-medium-red'),
    themeVar('--color-dark-red'),
    themeVar('--color-mist'),
  ]
}
