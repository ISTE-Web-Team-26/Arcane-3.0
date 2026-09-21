declare module '@external/*' {
  export interface TextEffectOptions {
    effect?: string
    duration?: number
    colors?: string[]
    hotColors?: string[]
    laserColors?: string[]
    seed?: string | number
    fps?: number
    loop?: boolean
    autoplay?: boolean
    respectReducedMotion?: boolean
    background?: string | null
    text?: string
    onFinish?: () => void
  }

  export interface TextEffectController {
    play(): Promise<{ cancelled: boolean }>
    restart(): Promise<{ cancelled: boolean }>
    stop(): void
    setEffect(
      name: string,
      options?: Partial<TextEffectOptions>,
    ): Promise<{ cancelled: boolean }>
    destroy(): void
  }

  export function createTextEffect(
    target: string | HTMLElement,
    options?: TextEffectOptions,
  ): TextEffectController
  export function effectNames(): string[]
  export function registerEffect(name: string, factory: unknown): void
}
