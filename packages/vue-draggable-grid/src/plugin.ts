import type { App } from 'vue'
import GridItem from '@/components/GridItem.vue'
import GridLayout from '@/components/GridLayout.vue'

function install(app: App) {
  app.component('GridLayout', GridLayout)
  app.component('GridItem', GridItem)
}

export {
  GridItem,
  GridLayout,
}

export default {
  install,
}
