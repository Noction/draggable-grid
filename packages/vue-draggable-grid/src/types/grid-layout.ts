import type { GridItemEvents } from '@/types/grid-item'
import type { Breakpoints, BreakpointsKeys, Layout, ResponsiveLayout } from '@/types/helpers'
import type {
  Dimensions,
  HandleDragEventArgs,
  HandleResizeEventArgs,
  Id,
  IntersectionObserverConfig,
} from '@/types/components'

type LayoutEventKey =
  | 'nocLayoutBeforeMount'
  | 'nocLayoutCreate'
  | 'nocLayoutMount'
  | 'nocLayoutReady'
  | 'nocLayoutUpdate'

// eslint-disable-next-line ts/consistent-type-definitions -- it needs to be type instead of interface
type VModelEvents = {
  'update:layout': [layout: Layout]
  'update:breakpoints': [breakpoints: BreakpointsKeys]
}

type LayoutEvents = {
  [Key in LayoutEventKey]: [layout: Layout]
}

export type CompleteMargins = [number, number]

export type GridItemPlaceholder = Dimensions & Record<'id', Id>

export type GridLayoutEvents =
  & Pick<GridItemEvents, 'nocResizeContainer'> // Already in camelCase
  & LayoutEvents
  & VModelEvents
  & {
    nocIntersectionObserve: [id: Id[]]
    nocIntersectionUnobserve: [id: Id[]]
    nocItemMove: GridItemEvents['nocMove']
    nocItemMoveEnd: GridItemEvents['nocMoveEnd']
    nocItemResize: GridItemEvents['nocResize']
    nocItemResizeEnd: GridItemEvents['nocResizeEnd']
  }

export interface GridLayoutProps {
  colNum: number
  layout: Layout

  autoSize?: boolean
  breakpoints?: Breakpoints
  cols?: Breakpoints
  horizontalShift?: boolean
  intersectionObserverConfig?: IntersectionObserverConfig
  isDraggable?: boolean
  isResizable?: boolean
  margin?: Margin
  maxRows?: number
  preventCollision?: boolean
  responsive?: boolean
  responsiveLayouts?: ResponsiveLayout
  rowHeight?: number
  useCssTransforms?: boolean
  useObserver?: boolean
  verticalCompact?: boolean
}

export interface GridProvidedValues {
  handleDragEvent: (args: HandleDragEventArgs) => void
  handleResizeEvent: (args: HandleResizeEventArgs) => void
}

export type Margin =
  | [number]
  | CompleteMargins
