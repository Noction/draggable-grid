import type { INTERSECTION_OBSERVER_ID } from '@/constants'

export type Dimension = 'h' | 'w' | 'x' | 'y'

export type Dimensions = Record<Dimension, number>

export type GridItemClass =
  | 'css-transforms'
  | 'disable-user-select'
  | 'no-touch'
  | 'resizing'
  | 'static'
  | 'vue-draggable-dragging'
  | 'vue-resizable'

export interface GridItemPosition {
  height: number
  left: number
  top: number
  width: number
}

export type GridLayoutEvent<TEventType extends string = string> =
  & Dimensions
  & {
    eventType: TEventType
    id: Id
    callback: () => void
  }

export type HTMLDivElementWithId = HTMLDivElement & Record<typeof INTERSECTION_OBSERVER_ID, string | number>

export type HandleDragEventArgs = GridLayoutEvent<'dragmove' | 'dragstart' | 'dragend'>
export type HandleResizeEventArgs = GridLayoutEvent<'resizestart' | 'resizeend' | 'resizemove'>

export type Id =
  | string
  | number

export type IntersectionObserverConfig = IntersectionObserverInit
