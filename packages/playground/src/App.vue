<template>
  <div class="app-wrap">
    <nav>
      <a href="#/">Home</a>
      <a href="#/responsive">Responsive</a>
    </nav>

    <div class="page-wrapper">
      <component :is="currentView" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Home from './pages/Home.vue';
import Responsive from './pages/Responsive.vue';
import NotFound from './pages/NotFound.vue';
import { ref, computed } from 'vue'

const routes = {
  '/': Home,
  '/responsive': Responsive
}

const currentPath = ref(window.location.hash)

window.addEventListener('hashchange', () => {
  currentPath.value = window.location.hash
})

const currentView = computed(() => {
  // @ts-expect-error will be replaced with vue-router
  return routes[currentPath.value.slice(1) || '/'] || NotFound
})
</script>

<style>
.vue-grid-item {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: aliceblue;
  border: 1px solid hsl(208deg, 100%, 90%);
}

.app-wrap {
  display: flex;
  flex-direction: column;

  nav {
    position: sticky;
    top: 0;
    z-index: 10;
    width: 100%;
    padding: .5rem;
    background-color: #fff;

    a {
      display: inline-block;
      padding: .5rem;
      text-decoration: none;
      background-color: transparent;
      border-radius: .5rem;
      transition: background-color .2s;

      &:hover { background-color: aliceblue }
      &:visited { color: inherit }
    }
  }

  .page-wrapper { max-height: 100% }
}
</style>
