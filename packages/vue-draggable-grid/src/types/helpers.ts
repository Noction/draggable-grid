import type { Id } from './components'

export type Breakpoints = RecordBreakpoint<number>

export type BreakpointsKeys = 'lg' | 'md' | 'sm' | 'xs' | 'xxs' | ''

export type Layout = LayoutItem[]

export type LayoutItem = LayoutItemRequired & LayoutItemOptional

export interface LayoutItemOptional {
  minW?: number
  minH?: number
  maxW?: number
  maxH?: number
  moved?: boolean
  isStatic?: boolean
  isDraggable?: boolean
  isResizable?: boolean
}

export interface LayoutItemRequired { w: number, h: number, x: number, y: number, id: Id }

export type MovingDirection = keyof typeof MovingDirections

export enum MovingDirections {
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  UP = 'UP',
}

export type RecordBreakpoint<Type> = Partial<Record<BreakpointsKeys, Type>>

export type ResponsiveLayout = RecordBreakpoint<Layout>

export type findOrGenerateResponsiveLayoutFnc = (orgLayout: Layout, layouts: ResponsiveLayout, breakpoints: Breakpoints, breakpoint: BreakpointsKeys, lastBreakpoint: BreakpointsKeys, cols: number, verticalCompact: boolean) => Layout

export type setPositionFnc<Position> = (top: number, left: number, width: number, height: number) => Position
