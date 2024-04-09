<script setup lang="ts">
import { ref } from 'vue'

const layoutLocal = ref([
  { x: 0, y: 0, w: 2, h: 2, id: '0' },
  { x: 2, y: 0, w: 2, h: 4, id: '1' },
  { x: 4, y: 0, w: 2, h: 5, id: '2' },
  { x: 6, y: 0, w: 2, h: 3, id: '3' },
  { x: 8, y: 0, w: 2, h: 3, id: '4' },
  { x: 10, y: 0, w: 2, h: 3, id: '5' },
  { x: 0, y: 5, w: 2, h: 5, id: '6' },
  { x: 2, y: 5, w: 2, h: 5, id: '7' },
  { x: 4, y: 5, w: 2, h: 5, id: '8' },
  { x: 6, y: 4, w: 2, h: 4, id: '9' },
  { x: 8, y: 4, w: 2, h: 4, id: '10' },
  { x: 10, y: 4, w: 2, h: 4, id: '11' },
  { x: 0, y: 10, w: 2, h: 5, id: '12' },
  { x: 2, y: 10, w: 2, h: 5, id: '13' },
  { x: 4, y: 8, w: 2, h: 4, id: '14' },
  { x: 6, y: 8, w: 2, h: 4, id: '15' },
  { x: 8, y: 10, w: 2, h: 5, id: '16' },
  { x: 10, y: 4, w: 2, h: 2, id: '17' },
  { x: 0, y: 9, w: 2, h: 3, id: '18' },
  { x: 2, y: 6, w: 2, h: 2, id: '19' },
])

const draggable = ref(true)
const resizable = ref(true)
</script>

<template>
  <div class="layout-json">
    Displayed as <code>[x, y, w, h]</code>:
    <div class="columns">
      <div v-for="item in layoutLocal" :key="item.id">
        <b>{{ item.id }}</b>: [{{ item.x }}, {{ item.y }}, {{ item.w }}, {{ item.h }}]
      </div>
    </div>
  </div>
  <hr>
  <input v-model="draggable" type="checkbox"> Draggable
  <input v-model="resizable" type="checkbox"> Resizable
  <br>

  <div style="width: 100%; height: 100%">
    <GridLayout
      v-model:layout="layoutLocal"
      :col-num="12"
      :row-height="30"
      :is-draggable="draggable"
      :is-resizable="resizable"
      responsive
    >
      <template #gridItemContent="{ item }">
        {{ item.id }}
      </template>
    </GridLayout>
  </div>
</template>

<style>
.layout-json {
    padding: 10px;
    margin-top: 10px;
    background: #ddd;
    border: 1px solid black;

    .columns { columns: 120px }
}
</style>
