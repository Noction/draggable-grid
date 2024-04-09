const hasWindow = () => typeof window !== 'undefined'

export function addWindowEventListener(event: string, callback: () => void) {
  if (!hasWindow)
    return callback()

  window.addEventListener(event, callback)
}

export function removeWindowEventListener(event: string, callback: () => void) {
  if (!hasWindow)
    return

  window.removeEventListener(event, callback)
}
