import type { InjectionKey } from 'vue'
import type { GridProvidedValues } from '@/types'

export const GRID_PROVIDER_INJECTION_KEY: InjectionKey<GridProvidedValues> = Symbol('GRID_PROVIDER')

export const INTERSECTION_OBSERVER_ID = Symbol('INTERSECTION_OBSERVER_ID')

export const RESIZABLE_HANDLE_CLASS = 'vue-resizable-handle' as const
