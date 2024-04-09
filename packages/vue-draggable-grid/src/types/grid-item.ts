import type { Ref } from 'vue'
import type { Margin } from '@/types/grid-layout'
import type { Breakpoints, BreakpointsKeys } from '@/types/helpers'
import type { Dimensions, GridItemPosition, Id } from '@/types/components'

// eslint-disable-next-line ts/consistent-type-definitions -- it needs to be type instead of interface
export type GridItemEvents = {
  nocResizeContainer: [payload: ResizePayload]
  nocResize: [payload: ResizePayload]
  nocResizeEnd: [payload: ResizePayload]
  nocMove: [payload: MovePayload]
  nocMoveEnd: [payload: MovePayload]
}

export interface GridItemProps {
  breakpointCols: Breakpoints
  colNum: number
  containerWidth: number
  h: number
  id: Id
  isDraggable: boolean
  isResizable: boolean
  lastBreakpoint: BreakpointsKeys
  margin: Margin
  maxRows: number
  rowHeight: number
  useCssTransforms: boolean
  w: number
  x: number
  y: number
  /**
   * @deprecated
   * @description Used only for compatibility after deleting mitt
   */
  calculateStylesTrigger: Ref<boolean>

  dragAllowFrom?: string | null
  dragIgnoreFrom?: string
  dragOption?: object
  maxH?: number
  maxW?: number
  minH?: number
  minW?: number
  observer?: IntersectionObserver | undefined
  isStatic?: boolean
}

export type MovePayload = Pick<Dimensions, 'x' | 'y'> & Record<'id', Id>

export type ResizePayload = Pick<Dimensions, 'h' | 'w'> & Pick<GridItemPosition, 'height' | 'width'> & Record<'id', Id>
