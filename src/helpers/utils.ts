import { Layout, LayoutItem, PositionLeft, Transform, setPositionFnc } from '@/types/helpers'

export const bottom = (layout: Layout): number => {
  let max = 0

  let bottomY: number

  for (let i = 0, len = layout.length; i < len; i++) {
    bottomY = layout[i].y + layout[i].h

    if (bottomY > max) {
      max = bottomY
    }
  }
  return max
}

export const cloneLayout = (layout: Layout): Layout => {
  const newLayout = Array(layout.length)

  for (let i = 0, len = layout.length; i < len; i++) {
    newLayout[i] = cloneLayoutItem(layout[i])
  }
  return newLayout
}

export const cloneLayoutItem = (layoutItem: LayoutItem): LayoutItem => JSON.parse(JSON.stringify(layoutItem))

export const collides = (l1: LayoutItem, l2: LayoutItem): boolean => {
  return !(l1 === l2 || l1.x + l1.w <= l2.x || l1.x >= l2.x + l2.w || l1.y + l1.h <= l2.y || l1.y >= l2.y + l2.h)
}

export const compact = (layout: Layout, verticalCompact: boolean): Layout => {
  const compareWith = getStatics(layout)
  const sorted = sortLayoutItemsByRowCol(layout)
  const out = Array(layout.length)

  for (let i = 0, len = sorted.length; i < len; i++) {

    let l = sorted[i]

    if (!l.static) {

      l = compactItem(compareWith, l, verticalCompact)
      compareWith.push(l)
    }

    out[layout.indexOf(l)] = l

    l.moved = false
  }
  return out
}

export const compactItem = (compareWith: Layout, l: LayoutItem, verticalCompact: boolean): LayoutItem => {
  if (verticalCompact) {
    while (l.y > 0 && !getFirstCollision(compareWith, l)) {
      l.y--
    }
  }

  let collides

  while ((collides = getFirstCollision(compareWith, l))) {
    l.y = collides.y + collides.h
  }

  return l
}

export const correctBounds  = (layout: Layout, bounds: {cols: number}): Layout => {
  const collidesWith = getStatics(layout)

  for (let i = 0, len = layout.length; i < len; i++) {
    const l = layout[i]

    if (l.x + l.w > bounds.cols) l.x = bounds.cols - l.w

    if (l.x < 0) {
      l.x = 0
      l.w = bounds.cols
    }

    if (!l.static) collidesWith.push(l)

    else {
      while (getFirstCollision(collidesWith, l)) {
        l.y++
      }
    }
  }

  return layout
}

export const getAllCollisions = (layout: Layout, layoutItem: LayoutItem): LayoutItem[]  => {
  return layout.filter(l => collides(l, layoutItem))
}

export const getFirstCollision = (layout: Layout, layoutItem: LayoutItem): LayoutItem | void => {
  for (let i = 0, len = layout.length; i < len; i++) {
    if (collides(layout[i], layoutItem)) return layout[i]
  }
}

export const getLayoutItem = (layout: Layout, id: string): LayoutItem | void => {
  for (let i = 0, len = layout.length; i < len; i++) {
    if (layout[i].i === id) return layout[i]
  }
}

export const getStatics = (layout: Layout): LayoutItem[] => layout.filter(l => l.static)

export const hyphenate = (str: string) => str.replace(hyphenateRE, '$1-$2').toLowerCase()

export const hyphenateRE = /([a-z\d])([A-Z])/g

export const moveElement = (layout: Layout, l: LayoutItem, x: number, y: number, isUserAction: boolean, preventCollision?: boolean): Layout => {
  if (l.static) return layout

  const oldX = l.x
  const oldY = l.y
  const movingUp = y && l.y > y

  if (typeof x === 'number') l.x = x
  if (typeof y === 'number') l.y = y

  l.moved = true

  let sorted = sortLayoutItemsByRowCol(layout)

  if (movingUp) sorted = sorted.reverse()

  const collisions = getAllCollisions(sorted, l)

  if (preventCollision && collisions.length) {
    l.x = oldX
    l.y = oldY
    l.moved = false

    return layout
  }

  for (let i = 0, len = collisions.length; i < len; i++) {
    const collision = collisions[i]

    if (collision.moved) continue

    if (l.y > collision.y && l.y - collision.y > collision.h / 4) continue

    if (collision.static) {
      layout = moveElementAwayFromCollision(layout, collision, l, isUserAction)
    } else {
      layout = moveElementAwayFromCollision(layout, l, collision, isUserAction)
    }
  }

  return layout
}
export const moveElementAwayFromCollision = (layout: Layout, collidesWith: LayoutItem, itemToMove: LayoutItem, isUserAction?: boolean): Layout => {

  const preventCollision = false

  if (isUserAction) {
    const fakeItem: LayoutItem = {
      h: itemToMove.h,
      i: '-1',
      w: itemToMove.w,
      x: itemToMove.x,
      y: itemToMove.y
    }

    fakeItem.y = Math.max(collidesWith.y - itemToMove.h, 0)
    if (!getFirstCollision(layout, fakeItem)) {

      return moveElement(layout, itemToMove, fakeItem.x, fakeItem.y, preventCollision)
    }
  }

  return moveElement(layout, itemToMove, itemToMove.x, itemToMove.y + 1, preventCollision)
}

export const setTopLeft: setPositionFnc<PositionLeft> = (top, left, width, height) => ({
  height: `${height}px`,
  left: `${left}px`,
  position: 'absolute',
  top: `${top}px`,
  width: `${width}px`
})

export const setTransform = (top: number, left: number, width: number, height: number): Transform => ({
  height: `${height}px`,
  position: 'absolute',
  transform: `translate3d(${left}px,${top}px, 0)`,
  width: `${width}px`
})

export const sortLayoutItemsByRowCol = (layout: Layout): Layout => {
  return [...layout].sort( (a, b) => {
    if (a.y === b.y && a.x === b.x) return 0

    if (a.y > b.y || (a.y === b.y && a.x > b.x)) return 1

    return -1
  })
}

export const validateLayout = (layout: Layout, contextName: string): void => {
  contextName = contextName || 'Layout'

  const subProps = ['x', 'y', 'w', 'h']

  if (!Array.isArray(layout)) {
    throw new Error(`${contextName  } must be an array!`)
  }

  for (let i = 0, len = layout.length; i < len; i++) {

    const item = layout[i]

    for (let j = 0; j < subProps.length; j++) {

      if (typeof item[subProps[j]] !== 'number') {
        throw new Error(`VueGridLayout: ${  contextName  }[${  i  }].${  subProps[j]  } must be a number!`)
      }
    }

    if (item.static !== undefined && typeof item.static !== 'boolean') {
      throw new Error(`VueGridLayout: ${contextName}[${i}].static must be a boolean!`)
    }
  }
}
