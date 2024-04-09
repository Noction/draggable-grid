# vue-draggable-grid
[![NPM package](https://img.shields.io/npm/v/@noction/vue-draggable-grid.svg?style=flat-square)](https://www.npmjs.com/package/@noction/vue-draggable-grid)
[![NPM monthly downloads](https://img.shields.io/npm/dm/@noction/vue-draggable-grid.svg?style=flat)](https://npmjs.com/package/@noction/vue-draggable-grid)
[![codecov](https://codecov.io/gh/Noction/vue-draggable-grid/branch/main/graph/badge.svg?token=C5NGW1BC2N)](https://codecov.io/gh/Noction/vue-draggable-grid)
[![code style](https://antfu.me/badge-code-style.svg)](https://github.com/antfu/eslint-config)

Grid layout for vue 3 with draggable, resize, responsive events

Rewrote to TypeScript, Composition API and migrated to Vue3

### Usage
```js
import { createApp } from 'vue'
import VueDraggableGrid from '@noction/vue-draggable-grid'
import App from './App.vue'
import '@noction/vue-draggable-grid/styles'

const app = createApp(App)

app.use(VueDraggableGrid)

app.mount('#app')
```
```vue
<script setup lang="ts">
import { ref } from 'vue'

const layout = ref([
  { h: 2, id: 0, w: 2, x: 0, y: 0 },
  { h: 2, id: 1, w: 2, x: 2, y: 0 },
  { h: 2, id: 2, w: 2, x: 4, y: 0 },
  { h: 2, id: 3, w: 2, x: 0, y: 2 },
  { h: 2, id: 4, w: 2, x: 2, y: 2 },
  { h: 2, id: 5, w: 2, x: 4, y: 2 },
  { h: 2, id: 6, w: 2, x: 0, y: 4 },
  { h: 2, id: 7, w: 2, x: 2, y: 4 },
  { h: 2, id: 8, w: 2, x: 4, y: 4 },
  { h: 2, id: 9, w: 2, x: 0, y: 6 },
  { h: 2, id: 10, w: 2, x: 2, y: 6 },
  { h: 2, id: 11, w: 2, x: 4, y: 6 }
])
</script>

<template>
  <grid-layout
    v-model:layout="layout"
    :col-num="12"
    :row-height="30"
    @noc-resize="handleResize"
    @noc-move="handleMove"
    @noc-move-end="handleMoveEnd"
  >
    <template #item="{ item }">
      {{ item.id }}
    </template>
  </grid-layout>
</template>
```
or
```vue
<script setup>
import { ref } from 'vue'

const layout = ref([
  { h: 2, id: 0, w: 2, x: 0, y: 0 },
  { h: 2, id: 1, w: 2, x: 2, y: 0 },
  { h: 2, id: 2, w: 2, x: 4, y: 0 },
  { h: 2, id: 3, w: 2, x: 0, y: 2 },
  { h: 2, id: 4, w: 2, x: 2, y: 2 },
  { h: 2, id: 5, w: 2, x: 4, y: 2 },
  { h: 2, id: 6, w: 2, x: 0, y: 4 },
  { h: 2, id: 7, w: 2, x: 2, y: 4 },
  { h: 2, id: 8, w: 2, x: 4, y: 4 },
  { h: 2, id: 9, w: 2, x: 0, y: 6 },
  { h: 2, id: 10, w: 2, x: 2, y: 6 },
  { h: 2, id: 11, w: 2, x: 4, y: 6 }
])
</script>

<template>
  <grid-layout
    v-model:layout="layout"
    :col-num="12"
    :row-height="30"
  >
    <template #default="{ gridItemProps }">
      <grid-item
        v-for="item in layout"
        v-bind="gridItemProps"
        :id="item.id"
        :key="item.id"
        :x="item.x"
        :y="item.y"
        :w="item.w"
        :h="item.h"
        @noc-resize="handleResize"
        @noc-move="handleMove"
        @noc-move-end="handleMoveEnd"
      >
        {{ item.id }}
      </grid-item>
    </template>
  </grid-layout>
</template>
```

### Props

#### GridLayout Props

_Properties with no default values are **Required**_

| Name                           | Type                         | Default Value                                        | Description                                     |
|--------------------------------|------------------------------|------------------------------------------------------|-------------------------------------------------|
| colNum                         | `number`                     |                                                      | Number of columns in the grid.                  |
| layout                         | `Layout`                     |                                                      | Initial layout of the grid.                     |
| autoSize                       | `boolean`                    | `true`                                               | Automatically adjust the size of items.         |
| breakpoints                    | `Breakpoints`                | `{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }`    | Responsive breakpoints for grid.                |
| cols                           | `Breakpoints`                | `{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }`           | Number of columns at different breakpoints.     |
| horizontalShift                | `boolean`                    | `false`                                              | Allow horizontal shifting of items.             |
| intersectionObserverConfig     | `IntersectionObserverConfig` | `{ root: null, rootMargin: '8px', threshold: 0.40 }` | Configuration for the Intersection Observer.    |
| isDraggable                    | `boolean`                    | `true`                                               | Enable dragging of grid items.                  |
| isResizable                    | `boolean`                    | `true`                                               | Enable resizing of grid items.                  |
| margin                         | `number[]`                   | `[10, 10]`                                           | Margin around grid items.                       |
| maxRows                        | `number`                     | `Infinity`                                           | Maximum number of rows in the grid.             |
| preventCollision               | `boolean`                    | `false`                                              | Prevent items from colliding with each other.   |
| responsive                     | `boolean`                    | `false`                                              | Enable responsive layout.                       |
| responsiveLayouts              | `ResponsiveLayout`           | `{}`                                                 | Responsive layouts for different breakpoints.   |
| rowHeight                      | `number`                     | `150`                                                | Height of each row in the grid.                 |
| useCssTransforms               | `boolean`                    | `true`                                               | Use CSS transforms for positioning.             |
| useObserver                    | `boolean`                    | `false`                                              | Use Intersection Observer for item visibility.  |
| verticalCompact                | `boolean`                    | `true`                                               | Enable vertical compacting of items.            |

#### GridItem Props

_Properties with no default values are **Required**_

| Name                 | Type                                   | Default Value     | Description                                        |
|----------------------|----------------------------------------|-------------------|----------------------------------------------------|
| breakpointCols       | `Breakpoints`                          |                   | Number of columns at different breakpoints.        |
| colNum               | `number`                               |                   | Number of columns in the grid.                     |
| containerWidth       | `number`                               |                   | Width of the container.                            |
| h                    | `number`                               |                   | Height of the grid item.                           |
| id                   | `Id`                                   |                   | Unique identifier for the grid item.               |
| isDraggable          | `boolean`                              |                   | Enable dragging of the grid item.                  |
| isResizable          | `boolean`                              |                   | Enable resizing of the grid item.                  |
| lastBreakpoint       | `BreakpointsKeys`                      |                   | Last breakpoint at which the item was resized.     |
| margin               | `number[]`                             |                   | Margin around the grid item.                       |
| maxRows              | `number`                               |                   | Maximum number of rows the item can occupy.        |
| rowHeight            | `number`                               |                   | Height of each row the item occupies.              |
| useCssTransforms     | `boolean`                              |                   | Use CSS transforms for positioning.                |
| w                    | `number`                               |                   | Width of the grid item.                            |
| x                    | `number`                               |                   | X position of the grid item.                       |
| y                    | `number`                               |                   | Y position of the grid item.                       |
| dragAllowFrom        | `string \| null`                       | `null`            | Selector for allowing drag from specific elements. |
| dragIgnoreFrom       | `string`                               | `'a, button'`     | Selector for elements to ignore during drag.       |
| dragOption           | `object`                               | `{}`              | Options for configuring drag behavior.             |
| maxH                 | `number`                               | `Infinity`        | Maximum height of the grid item.                   |
| maxW                 | `number`                               | `Infinity`        | Maximum width of the grid item.                    |
| minH                 | `number`                               | `1`               | Minimum height of the grid item.                   |
| minW                 | `number`                               | `1`               | Minimum width of the grid item.                    |
| observer             | `IntersectionObserver \| undefined`    | `undefined`       | Intersection Observer for item visibility.         |
| isStatic             | `boolean`                              | `false`           | Make the grid item static (non-draggable).         |

### Custom Events

_Every custom event is prefixed with `noc` so it will not collide with default events_

_This does not include events that update a value written in a `v-model`_

#### GridLayout Events

| Name                       | Payload                                 | Description                                        |
|----------------------------|-----------------------------------------|----------------------------------------------------|
| noc-intersection-observe   | `id: Id[]`                              | Notify when items are observed for intersection.   |
| noc-intersection-unobserve | `id: Id[]`                              | Notify when items are unobserved for intersection. |
| noc-item-move              | `GridItemEvents['noc-move']`            | Notify when a grid item is being moved.            |
| noc-item-move-end          | `GridItemEvents['noc-move-end']`        | Notify when a grid item's move operation ends.     |
| noc-item-resize            | `GridItemEvents['noc-resize']`          | Notify when a grid item is being resized.          |
| noc-item-resize-end        | `GridItemEvents['noc-resize-end']`      | Notify when a grid item's resize operation ends.   |
| noc-layout-before-mount    | `layout: Layout`                        | Notify before the grid layout is mounted.          |
| noc-layout-create          | `layout: Layout`                        | Notify when a new layout is created.               |
| noc-layout-mount           | `layout: Layout`                        | Notify when the grid layout is mounted.            |
| noc-layout-ready           | `layout: Layout`                        | Notify when the grid layout is ready.              |
| noc-layout-update          | `layout: Layout`                        | Notify when the grid layout is updated.            |
| noc-resize-container       | `payload: ResizePayload`                | Notify when the container is resized.              |

#### GridLayout `v-model`

_`v-model`'s are not prefixed with `noc`_

| Name               | Payload                        | Description             |
|--------------------|--------------------------------|-------------------------|
| update:layout      | `layout: Layout`               | Updates the Layout      |
| update:breakpoints | `breakpoints: BreakpointsKeys` | Updates the Breakpoints |

#### GridItem Events

| Name                 | Payload                       | Description                                       |
|----------------------|-------------------------------|---------------------------------------------------|
| noc-resize-container | `payload: ResizePayload`      | Notify when the container is resized.             |
| noc-resize           | `payload: ResizePayload`      | Notify when a grid item is being resized.         |
| noc-resize-end       | `payload: ResizePayload`      | Notify when a grid item's resize operation ends.  |
| noc-move             | `payload: MovePayload`        | Notify when a grid item is being moved.           |
| noc-move-end         | `payload: MovePayload`        | Notify when a grid item's move operation ends.    |
