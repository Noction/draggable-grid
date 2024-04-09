<template>
  <div>
    <div
      ref="wrapper"
      class="vue-grid-layout"
      :style="mergedStyle"
    >
      <grid-item
        v-show="isDragging"
        class="vue-grid-placeholder"
        v-bind="{ ...gridItemProps, ...placeholder }"
      />
      <slot :grid-item-props="{ ...gridItemProps, observer }">
        <grid-item
          v-for="layoutItem in layout"
          :key="layoutItem.id"
          v-bind="{ ...gridItemProps, ...layoutItemOptional(layoutItem) }"
          :observer="observer"
          @noc-resize-container="emit('noc-resize-container', $event)"
          @noc-resize-end="emit('noc-item-resize-end', $event)"
          @noc-resize="emit('noc-item-resize', $event)"
          @noc-move="emit('noc-item-move', $event)"
          @noc-move-end="emit('noc-item-move-end', $event)"
        >
          <slot
            name="gridItemContent"
            :item="layoutItem"
          />
        </grid-item>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import GridItem from '@/components/GridItem.vue'
import elementResizeDetectorMaker from 'element-resize-detector'
import {
  BreakpointsKeys,
  Layout, LayoutItemRequired,
  RecordBreakpoint
} from '@/types/helpers'
import { GRID_PROVIDER_INJECTION_KEY, INTERSECTION_OBSERVER_ID } from '@/constants'
import { GridItemPlaceholder, GridLayoutEvents, GridLayoutProps } from '@/types/grid-layout'
import { HandleDragEventArgs, HandleResizeEventArgs, Id } from '@/types/components'
import { addWindowEventListener, removeWindowEventListener } from '@/helpers/DOM'
import {
  bottom,
  cloneLayout,
  compact,
  getAllCollisions,
  getLayoutItem,
  moveElement, normalizeMargins
} from '@/helpers/utils'
import {
  computed,
  defineEmits,
  defineProps,
  nextTick,
  onBeforeMount,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  watch
} from 'vue'
import {
  findOrGenerateResponsiveLayout,
  getBreakpointFromWidth,
  getColsFromBreakpoint
} from '@/helpers/responsiveUtils'

const props = withDefaults(
  defineProps<GridLayoutProps>(),
  {
    autoSize: true,
    breakpoints: () => ({ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }),
    cols: () => ({ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }),
    horizontalShift: false,
    intersectionObserverConfig: () => ({ root: null, rootMargin: '8px', threshold: 0.40 }),
    isDraggable: true,
    isResizable: true,
    margin: () => ([10]),
    maxRows: Infinity,
    preventCollision: false,
    responsive: false,
    responsiveLayouts: () => ({}),
    rowHeight: 150,
    useCssTransforms: true,
    useObserver: false,
    verticalCompact: true
  })

const emit = defineEmits<GridLayoutEvents>()

const layoutItemOptionalKeys = [
  'minW',
  'minH',
  'maxW',
  'maxH',
  'moved',
  'static',
  'isDraggable',
  'isResizable',
  'isBounded',
  'dragIgnoreFrom',
  'dragAllowFrom',
  'resizeIgnoreFrom',
  'preserveAspectRatio',
  'dragOption',
  'resizeOption'
]

const layoutItemRequired = { h: 0, id: -1, w: 0, x: 0, y: 0 } as const

const erd = ref(elementResizeDetectorMaker({ callOnAdd: false, strategy: 'scroll' }))
const isDragging = ref(false)
const lastBreakpoint = ref<BreakpointsKeys>('')
const lastLayoutLength = ref(0)
const layouts = ref<RecordBreakpoint<Layout>>({})
const mergedStyle = ref({})
const originalLayout = ref(props.layout)
const placeholder = ref<GridItemPlaceholder>({ h: 0, id: -1, w: 0, x: 0, y: 0 })
const width = ref(0)
let observer: IntersectionObserver
const wrapper = ref<HTMLDivElement | null>(null)

const columnsNumber = ref(props.colNum)

/**
 * @deprecated
 * @description Used only for compatibility after deleting mitt
 */
const calculateStylesTrigger = ref(false)

const gridItemProps = computed(() => ({
  breakpointCols: props.cols,
  calculateStylesTrigger,
  colNum: columnsNumber.value,
  containerWidth: width.value,
  isDraggable: props.isDraggable,
  isResizable: props.isResizable,
  lastBreakpoint: lastBreakpoint.value,
  margin: props.margin,
  maxRows: props.maxRows,
  responsive: props.responsive,
  rowHeight: props.rowHeight,
  useCssTransforms: props.useCssTransforms,
  width: width.value
}))

watch(() => props.colNum, value => {
  columnsNumber.value = value
})

watch(() => props.layout.length, () => {
  layoutUpdate()
  compact(props.layout, props.verticalCompact)
})

watch(() => props.margin, () => {
  updateHeight()
})
watch(() => props.layout, () => {
  updateHeight()
})
watch(() => props.responsive, value => {
  if (!value) {
    emit('update:layout', originalLayout.value)
    columnsNumber.value = props.colNum
  }
  onWindowResize()
})
watch(() => width.value, (_, oldValue) => {
  nextTick(() => {

    if (oldValue === 0) {
      nextTick(() => {
        emit('noc-layout-ready', props.layout)
      })
    }

    if (props.responsive) responsiveGridLayout()

    updateHeight()
  })
})
watch(() => props.useObserver, value => {
  if (!value) {
    observer.disconnect()
    return
  }

  createObserver()
})
// eslint-disable-next-line
// @ts-ignore
const observerCallback = entries => {
  const observerItems = {
    observe: <Id[]>[],
    unobserve: <Id[]>[]
  }

  // eslint-disable-next-line
  // @ts-ignore
  entries.forEach(({ target, isIntersecting }) => {

    if (isIntersecting) {
      // eslint-disable-next-line
      // @ts-ignore
      observerItems.observe.push(target[INTERSECTION_OBSERVER_ID])
      return
    }

    // eslint-disable-next-line
    // @ts-ignore
    observerItems.unobserve.push(target[INTERSECTION_OBSERVER_ID])
  })

  emit('noc-intersection-observe', observerItems.observe)
  emit('noc-intersection-unobserve', observerItems.unobserve)
}

// eslint-disable-next-line
const layoutItemOptional = (props: { [key: string]: any }): LayoutItemRequired => {
  const requiredKeys = Object.keys(layoutItemRequired)

  // eslint-disable-next-line
  // @ts-ignore
  return Object
    .keys(props)
    .reduce((acc, val) => {
      // eslint-disable-next-line
      // @ts-ignore
      if (layoutItemOptionalKeys.includes(val) || requiredKeys.includes(val)) {
        // eslint-disable-next-line
        // @ts-ignore
        acc[val] = props[val]
      }
      return acc
    }, {})
}

const layoutUpdate = (): void => {
  if (props.layout && originalLayout.value) {
    if (props.layout.length !== originalLayout.value.length) {
      // eslint-disable-next-line
      // @ts-ignore
      const diff = findDifference(props.layout, originalLayout.value)

      if (diff.length > 0) {
        if (props.layout.length > originalLayout.value.length) {
          // eslint-disable-next-line
          // @ts-ignore
          originalLayout.value = originalLayout.value.concat(diff)
        } else {
          // eslint-disable-next-line
          // @ts-ignore
          originalLayout.value = originalLayout.value.filter(obj => {
            return !diff.some(obj2 => {
              return obj.id === obj2.id
            })
          })
        }
      }

      lastLayoutLength.value = props.layout.length
      initResponsiveFeatures()
    }

    compact(props.layout, props.verticalCompact)

    updateHeight()

    emit('noc-layout-update', props.layout)
    calculateStylesTrigger.value = !calculateStylesTrigger.value
  }
}
const findDifference = (layout: Layout, originalLayout: Layout): Layout => {
  const uniqueResultOne = layout.filter(l => !originalLayout.some(ol => l.id === ol.id))
  const uniqueResultTwo = originalLayout.filter(ol => !layout.some(l => ol.id === l.id))

  return uniqueResultOne.concat(uniqueResultTwo)
}
const initResponsiveFeatures = (): void => {
  // eslint-disable-next-line
  // @ts-ignore
  layouts.value = Object.assign({}, props.responsiveLayouts)
}
const updateHeight = (): void => {
  const height = containerHeight()

  mergedStyle.value = { height }
}
const containerHeight = (): string | undefined => {
  if (!props.autoSize || !props.layout) return

  const [, marginX] = normalizeMargins(props.margin)

  return `${bottom(props.layout) * (props.rowHeight + marginX) + marginX}px`

}
const onWindowResize = (): void => {
  if (wrapper.value) {
    // eslint-disable-next-line
    // @ts-ignore
    width.value = wrapper.value.offsetWidth
  }
}
const responsiveGridLayout = (): void => {
  const newBreakpoint = getBreakpointFromWidth(props.breakpoints, width.value)
  const newCols = getColsFromBreakpoint(newBreakpoint, props.cols)

  if (lastBreakpoint.value && !layouts.value[lastBreakpoint.value]) {
    // eslint-disable-next-line
    // @ts-ignore
    layouts.value[lastBreakpoint.value] = cloneLayout(props.layout)
  }

  // eslint-disable-next-line
  // @ts-ignore
  const layout = findOrGenerateResponsiveLayout(
    originalLayout.value,
    layouts.value,
    props.breakpoints,
    newBreakpoint,
    lastBreakpoint.value,
    // eslint-disable-next-line
    // @ts-ignore
    newCols,
    props.verticalCompact
  )

  // eslint-disable-next-line
  // @ts-ignore
  layouts.value[newBreakpoint] = layout

  if (lastBreakpoint.value !== newBreakpoint) {
    emit('update:breakpoints', newBreakpoint)
  }

  lastBreakpoint.value = newBreakpoint

  emit('update:layout', layout)
  columnsNumber.value = getColsFromBreakpoint(newBreakpoint, props.cols)
}
const onCreated = () => {
  emit('noc-layout-create', props.layout)
}

const createObserver = () => {
  // eslint-disable-next-line
  // @ts-ignore
  observer = new IntersectionObserver(observerCallback, {
    root: null,
    rootMargin: '8px',
    threshold: 0.40,
    ...props.intersectionObserverConfig
  })
}

// lifecycles
onCreated()
onBeforeUnmount(() => {
  removeWindowEventListener('resize', onWindowResize)

  if (erd.value && wrapper.value) {
    erd.value.uninstall(wrapper.value)
  }
})
onBeforeMount(() => {
  emit('noc-layout-before-mount', props.layout)
})

onMounted(() => {
  emit('noc-layout-mount', props.layout)
  nextTick(() => {
    originalLayout.value = props.layout

    nextTick(() => {
      onWindowResize()
      initResponsiveFeatures()

      addWindowEventListener('resize', onWindowResize.bind(this))
      compact(props.layout, props.verticalCompact)

      emit('noc-layout-update', props.layout)
      updateHeight()

      if (wrapper.value) {
        erd.value.listenTo(wrapper.value, onWindowResize)
      }

      if (props.useObserver) {
        createObserver()
      }
    })
  })
})

function handleDragEvent ({ eventType, id, x, y, h, w, callback }: HandleDragEventArgs): void {
  const layoutItem = getLayoutItem(props.layout, id)
  const l = layoutItem ?? { ...layoutItemRequired }

  if (eventType === 'dragmove' || eventType === 'dragstart') {
    placeholder.value.id = id
    placeholder.value.x = l.x
    placeholder.value.y = l.y
    placeholder.value.w = w
    placeholder.value.h = h
    nextTick(() => {
      isDragging.value = true
    })
  } else {
    nextTick(() => {
      isDragging.value = false
    })
  }

  emit('update:layout', moveElement(props.layout, l, x, y, true, props.horizontalShift, props.preventCollision))

  compact(props.layout, props.verticalCompact)

  callback()

  updateHeight()

  if (eventType === 'dragend') {
    compact(props.layout, props.verticalCompact)
    emit('noc-layout-update', props.layout)
  }
}

function handleResizeEvent ({ eventType, id, x, y, h, w, callback }: HandleResizeEventArgs): void {
  const layoutItem = getLayoutItem(props.layout, id)
  const l = layoutItem ?? { ...layoutItemRequired }

  let hasCollisions

  if (props.preventCollision) {
    const collisions = getAllCollisions(props.layout, { ...l, h, w }).filter(
      layoutItem => layoutItem.id !== l.id
    )

    hasCollisions = collisions.length > 0

    if (hasCollisions) {
      let leastX = Infinity, leastY = Infinity

      collisions.forEach(layoutItem => {
        if (layoutItem.x > l.x) leastX = Math.min(leastX, layoutItem.x)

        if (layoutItem.y > l.y) leastY = Math.min(leastY, layoutItem.y)
      })

      if (Number.isFinite(leastX)) l.w = leastX - l.x

      if (Number.isFinite(leastY)) l.h = leastY - l.y
    }
  }

  if (!hasCollisions) {
    l.w = w
    l.h = h
  }

  if (eventType === 'resizestart' || eventType === 'resizemove') {
    placeholder.value.id = +id
    placeholder.value.x = x
    placeholder.value.y = y
    placeholder.value.w = l.w
    placeholder.value.h = l.h

    nextTick(() => {
      isDragging.value = true
    })

  } else {
    nextTick(() => {
      isDragging.value = false
    })
  }

  // if (props.responsive) responsiveGridLayout()

  compact(props.layout, props.verticalCompact)

  callback()

  updateHeight()

  if (eventType === 'resizeend') {
    emit('noc-layout-update', props.layout)
  }
}

provide(GRID_PROVIDER_INJECTION_KEY, {
  handleDragEvent,
  handleResizeEvent
})
</script>

<style>
  .vue-grid-layout {
    position: relative;
    transition: height .2s ease;
  }
</style>
