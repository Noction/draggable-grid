import { inject } from 'vue'
import { GRID_PROVIDER_INJECTION_KEY } from '@/constants'

export default function useGridProvider() {
  const result = inject(GRID_PROVIDER_INJECTION_KEY)

  if (result === undefined)
    throw new Error('You can\'t use useGridProvider outside of a GridProvider')

  return result
}
