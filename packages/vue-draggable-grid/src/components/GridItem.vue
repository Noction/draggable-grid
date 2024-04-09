<script setup lang="ts">
import type { CSSProperties } from 'vue'
import interact from '@interactjs/interactjs'
import {
  computed,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
} from 'vue'
import type { CompleteMargins } from '@/types'
import useGridProvider from '@/composables/useGridProvider'
import type { Dimensions, GridItemPosition, HTMLDivElementWithId } from '@/types/components'
import type { GridItemEvents, GridItemProps } from '@/types/grid-item'
import { INTERSECTION_OBSERVER_ID, RESIZABLE_HANDLE_CLASS } from '@/constants'
import { createCoreData, getControlPosition } from '@/helpers/draggableUtils'
import { normalizeMargins, setTopLeft, setTransform, stringReplacer } from '@/helpers/utils'

/* eslint perfectionist/sort-objects: "error" */
const props = withDefaults(
  defineProps<GridItemProps>(),
  {
    dragAllowFrom: null,
    dragIgnoreFrom: 'a, button',
    dragOption: () => ({}),
    isStatic: false,
    maxH: Number.POSITIVE_INFINITY,
    maxW: Number.POSITIVE_INFINITY,
    minH: 1,
    minW: 1,
    observer: undefined,
  },
)

const emit = defineEmits<GridItemEvents>()

const {
  handleDragEvent,
  handleResizeEvent,
} = useGridProvider()

const item = ref<HTMLDivElementWithId | null>(null)

const dragEventSet = ref(false)
const dragging = ref<{ left?: number, top?: number }>({})
const inner = ref<Dimensions>({ h: props.h, w: props.w, x: props.x, y: props.y })

const interactObj = ref<any>(null)
const isDragging = ref(false)
const isResizing = ref(false)
const lastInner = ref<Dimensions>({ h: Number.NaN, w: Number.NaN, x: Number.NaN, y: Number.NaN })
const previousInner = ref<Dimensions>({ h: Number.NaN, w: Number.NaN, x: Number.NaN, y: Number.NaN })
const resizeEventSet = ref(false)
const resizing = ref<{ height: number, width: number } | null>(null)
const style: { props: CSSProperties } = reactive({ props: {} })

const isNoTouch = computed(() => {
  const isDraggableOrResizable = props.isDraggable || props.isResizable
  const isAndroid = navigator.userAgent
    .toLowerCase()
    .includes('android')

  return isAndroid && isDraggableOrResizable && !props.isStatic
})

const isResizableAndNotStatic = computed(() => props.isResizable && !props.isStatic)

const cssClasses = computed(() => {
  return {
    'css-transforms': props.useCssTransforms,
    'disable-user-select': isDragging.value,
    'no-touch': isNoTouch.value,
    'resizing': isResizing.value,
    'static': props.isStatic,
    'vue-draggable-dragging': isDragging.value,
    'vue-resizable': isResizableAndNotStatic.value,
  } as const
})

watch(() => props.observer, () => {
  if (props.observer && item.value) {
    props.observer.observe(item.value)

    item.value[INTERSECTION_OBSERVER_ID] = props.id
  }
})

watch(() => props.colNum, () => {
  tryMakeResizable()
  emitContainerResized()
})

watch(() => props.containerWidth, () => {
  tryMakeResizable()
  emitContainerResized()
})

watch(() => props.h, (value) => {
  inner.value.h = value
  emitContainerResized()
})

watch(() => props.isDraggable, () => {
  tryMakeDraggable()
})

watch([
  () => props.isResizable,
  () => props.maxH,
  () => props.maxW,
  () => props.minH,
  () => props.minW,
], () => {
  tryMakeResizable()
})

watch(() => props.rowHeight, () => {
  emitContainerResized()
})

watch(() => props.isStatic, () => {
  tryMakeResizable()
  tryMakeDraggable()
})

watch(() => props.w, (value) => {
  inner.value.w = value
  createStyle()
})

watch(() => props.x, (value) => {
  inner.value.x = value
  createStyle()
})

watch(() => props.y, (value) => {
  inner.value.y = value
  createStyle()
})

watch(() => props.calculateStylesTrigger, () => {
  createStyle()
})

function calcColWidth(): GridItemPosition['width'] {
  const [marginY] = normalizeMargins(props.margin)

  return (props.containerWidth - (marginY * (props.colNum + 1))) / props.colNum
}

function calcPosition({ h, w, x, y }: Dimensions): GridItemPosition {
  const colWidth = calcColWidth()

  const handleMargins = ([marginY, marginX]: CompleteMargins) => {
    return {
      height: h === Number.POSITIVE_INFINITY ? h : Math.round(props.rowHeight * h + Math.max(0, h - 1) * marginY),
      left: Math.floor(colWidth * x + (x + 1) * marginX),
      top: Math.round(props.rowHeight * y + (y + 1) * marginY),
      width: w === Number.POSITIVE_INFINITY ? w : Math.round(colWidth * w + Math.max(0, w - 1) * marginX),
    }
  }

  const margins = normalizeMargins(props.margin)

  return handleMargins(margins)
}

function calcWH(height: GridItemPosition['height'], width: GridItemPosition['width']): Pick<Dimensions, 'w' | 'h'> {
  const colWidth = calcColWidth()
  const [marginY, marginX] = normalizeMargins(props.margin)

  const w = Math.round((width + marginY) / (colWidth + marginY))
  const h = Math.round((height + marginX) / (props.rowHeight + marginX))

  return {
    h: Math.max(Math.min(h, props.maxRows - inner.value.y), 0),
    w: Math.max(Math.min(w, props.colNum - inner.value.x), 0),
  }
}

function calcXY(top: GridItemPosition['top'], left: GridItemPosition['left']): Pick<Dimensions, 'x' | 'y'> {
  const colWidth = calcColWidth()
  const [marginY, marginX] = normalizeMargins(props.margin)

  const x = Math.round((left - marginY) / (colWidth + marginY))
  const y = Math.round((top - marginX) / (props.rowHeight + marginX))

  return {
    x: Math.max(Math.min(x, props.colNum - inner.value.w), 0),
    y: Math.max(Math.min(y, props.maxRows - inner.value.h), 0),
  }
}

function createStyle(): void {
  const pos = calcPosition({
    h: inner.value.h,
    w: inner.value.w,
    x: inner.value.x,
    y: inner.value.y,
  })

  if (props.x + props.w > props.colNum) {
    inner.value.x = 0
    inner.value.w = (props.w > props.colNum) ? props.colNum : props.w
  }
  else {
    inner.value.x = props.x
    inner.value.w = props.w
  }

  if (isDragging.value) {
    pos.top = dragging.value.top ?? 0
    pos.left = dragging.value.left ?? 0
  }

  if (isResizing.value) {
    pos.width = resizing?.value?.width ?? 0
    pos.height = resizing?.value?.height ?? 0
  }

  style.props = props.useCssTransforms
    ? setTransform(pos.top, pos.left, pos.width, pos.height)
    : setTopLeft(pos.top, pos.left, pos.width, pos.height)
}
function emitContainerResized() {
  createStyle()

  const styleProps = {} as { height: number, width: number }

  for (const prop of ['width', 'height'] as const) {
    const val = style.props[prop]
    const matches = val?.toString().match(/^(\d+)px$/)

    if (!matches)
      return

    styleProps[prop] = +matches[1]
  }

  emit('nocResizeContainer', {
    h: props.h,
    height: styleProps.height,
    id: props.id,
    w: props.w,
    width: styleProps.width,
  })
}

function handleDrag(event: any): void {
  if (props.isStatic || isResizing.value)
    return

  const position = getControlPosition(event)

  if (!position)
    return

  const { x, y } = position

  const newPosition = { left: 0, top: 0 }

  switch (event.type) {
    case 'dragstart': {
      previousInner.value.x = inner.value.x
      previousInner.value.y = inner.value.y

      const parentRect = event.target.offsetParent.getBoundingClientRect()
      const clientRect = event.target.getBoundingClientRect()

      newPosition.left = clientRect.left - parentRect.left
      newPosition.top = clientRect.top - parentRect.top

      dragging.value = newPosition
      isDragging.value = true
      break
    }
    case 'dragend': {
      if (!isDragging.value)
        return
      const parentRect = event.target.offsetParent.getBoundingClientRect()
      const clientRect = event.target.getBoundingClientRect()

      newPosition.left = clientRect.left - parentRect.left
      newPosition.top = clientRect.top - parentRect.top

      dragging.value = {}
      isDragging.value = false
      break
    }
    case 'dragmove': {
      const coreEvent = createCoreData(lastInner.value.x, lastInner.value.y, x, y)

      newPosition.left = (dragging?.value?.left ?? 0) + coreEvent.deltaX
      newPosition.top = (dragging?.value?.top ?? 0) + coreEvent.deltaY

      dragging.value = newPosition
      break
    }
  }

  const pos = calcXY(newPosition.top, newPosition.left)

  lastInner.value.x = x
  lastInner.value.y = y

  if (inner.value.x !== pos.x || inner.value.y !== pos.y) {
    emit('nocMove', {
      id: props.id,
      x: pos.x,
      y: pos.y,
    })
  }

  if (event.type === 'dragend' && (previousInner.value.x !== inner.value.x || previousInner.value.y !== inner.value.y)) {
    emit('nocMoveEnd', {
      id: props.id,
      x: pos.x,
      y: pos.y,
    })
  }

  handleDragEvent({
    callback: createStyle,
    eventType: event.type,
    h: inner.value.h,
    id: props.id,
    w: inner.value.w,
    x: pos.x,
    y: pos.y,
  })
}

function handleResize(event: any): void {
  if (props.isStatic)
    return

  const position = getControlPosition(event)

  if (!position)
    return

  const { x, y } = position
  const newSize = { height: 0, width: 0 }

  switch (event.type) {
    case 'resizestart': {
      previousInner.value.w = inner.value.w
      previousInner.value.h = inner.value.h

      const { height, width } = calcPosition({
        h: inner.value.h,
        w: inner.value.w,
        x: inner.value.x,
        y: inner.value.y,
      })

      newSize.width = width
      newSize.height = height

      resizing.value = newSize
      isResizing.value = true
      break
    }
    case 'resizemove': {
      const coreEvent = createCoreData(lastInner.value.x, lastInner.value.h, x, y)

      newSize.width = (resizing?.value?.width ?? 0) + coreEvent.deltaX
      newSize.height = (resizing?.value?.height ?? 0) + coreEvent.deltaY

      resizing.value = newSize
      isResizing.value = true
      break
    }
    case 'resizeend': {
      const { height, width } = calcPosition({
        h: inner.value.h,
        w: inner.value.w,
        x: inner.value.x,
        y: inner.value.y,
      })

      newSize.width = width
      newSize.height = height

      resizing.value = null
      isResizing.value = false
      break
    }
  }

  const pos = calcWH(newSize.height, newSize.width)

  if (pos.w < props.minW)
    pos.w = props.minW
  if (pos.w > props.maxW)
    pos.w = props.maxW
  if (pos.h < props.minH)
    pos.h = props.minH
  if (pos.h > props.maxH)
    pos.h = props.maxH
  if (pos.h < 1)
    pos.h = 1
  if (pos.w < 1)
    pos.w = 1

  lastInner.value.x = x
  lastInner.value.h = y

  if (inner.value.w !== pos.w || inner.value.h !== pos.h) {
    emit('nocResize', {
      h: pos.h,
      height: newSize.height,
      id: props.id,
      w: pos.w,
      width: newSize.width,
    })
  }

  if (event.type === 'resizeend' && (previousInner.value.w !== inner.value.w || previousInner.value.h !== inner.value.h)) {
    emit('nocResizeEnd', {
      h: pos.h,
      height: newSize.height,
      id: props.id,
      w: pos.w,
      width: newSize.width,
    })
  }

  handleResizeEvent({
    callback: createStyle,
    eventType: event.type,
    h: pos.h,
    id: props.id,
    w: pos.w,
    x: inner.value.x,
    y: inner.value.y,
  })
}
function tryMakeDraggable(): void {
  if (!interactObj.value && item.value)
    interactObj.value = interact(item.value)

  if (props.isDraggable && !props.isStatic) {
    interactObj.value.draggable({
      allowFrom: props.dragAllowFrom,
      ignoreFrom: props.dragIgnoreFrom,
      ...props.dragOption,
    })

    if (!dragEventSet.value) {
      dragEventSet.value = true
      interactObj.value.on('dragstart dragmove dragend', handleDrag)
    }
  }
  else {
    interactObj.value.draggable({ enabled: false })
  }
}
function tryMakeResizable(): void {
  if (!interactObj.value && item.value)
    interactObj.value = interact(item.value)

  if (props.isResizable && !props.isStatic) {
    const selector = `.${stringReplacer(RESIZABLE_HANDLE_CLASS, ' ', '.')}`
    const maximum = calcPosition({
      h: props.maxH,
      w: props.maxW,
      x: 0,
      y: 0,
    })
    const minimum = calcPosition({
      h: props.minH,
      w: props.minW,
      x: 0,
      y: 0,
    })
    const opts = {
      edges: { bottom: selector, left: false, right: selector, top: false },
      ignoreFrom: 'a, button',
      restrictSize: {
        max: { height: maximum.height, width: maximum.width },
        min: { height: minimum.height, width: minimum.width },
      },
    }

    interactObj.value.resizable(opts)

    if (!resizeEventSet.value) {
      resizeEventSet.value = true
      interactObj.value.on('resizestart resizemove resizeend', handleResize)
    }
  }
  else {
    interactObj.value.resizable({ enabled: false })
  }
}

onBeforeUnmount(() => {
  if (interactObj.value)
    interactObj.value.unset()

  if (props.observer && item.value !== null)
    props.observer.unobserve(item.value)
})
onMounted(() => {
  tryMakeResizable()
  tryMakeDraggable()
  createStyle()
})
</script>

<template>
  <div
    ref="item"
    class="vue-grid-item"
    :class="cssClasses"
    :style="style.props"
  >
    <slot />
    <div
      v-if="isResizableAndNotStatic"
      :class="RESIZABLE_HANDLE_CLASS"
    >
      <div class="corner-handle" />
    </div>
  </div>
</template>

<style lang="scss">
  .vue-grid-item {
    box-sizing: border-box;
    touch-action: none;
    transition: all .2s ease;
    transition-property: left, top, right;

    &.no-touch {
      touch-action: none;
    }

    &.css-transforms {
      right: auto;
      left: 0;
      transition-property: transform;
    }

    &.resizing {
      z-index: 3;
      opacity: .6;
    }

    &.vue-draggable-dragging {
      z-index: 3;
      transition: none;
    }

    &.vue-grid-placeholder {
      z-index: 2;
      user-select: none;
      background: red;
      opacity: .2;
      transition-duration: .1s;
    }

    & > .vue-resizable-handle {
      position: absolute;
      right: 0;
      bottom: 0;
      z-index: 20;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 1rem;
      height: 1rem;
      cursor: se-resize;

      &:hover .corner-handle { opacity: 1 }
      &:active .corner-handle { transform: scale(120%); }

      .corner-handle {
        width: 4px;
        height: 4px;
        background-color: gray;
        border-radius: 999px;
        opacity: 0.5;
        transition: .2s;
        transition-property: opacity, transform;
      }
    }

    &.disable-user-select { user-select: none }
  }
</style>
