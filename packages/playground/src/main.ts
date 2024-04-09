import '@noction/vue-draggable-grid/styles'
import VueDraggableGrid from '@noction/vue-draggable-grid'
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

app.use(VueDraggableGrid)

app.mount('#app')
