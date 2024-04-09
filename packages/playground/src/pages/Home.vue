<template>
  <grid-layout
    v-model:layout="layout"
    :col-num="colNum"
    :row-height="rowHeight"
    :margin="[10]"
    :use-css-transforms="false"
  >
    <template #gridItemContent="slotProps">
      <div>
        {{ slotProps.item.id }}
      </div>
    </template>
  </grid-layout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const colNum = ref(6)
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

const rowHeight = computed(() =>  (window.innerWidth - 56) / 4 )
</script>

