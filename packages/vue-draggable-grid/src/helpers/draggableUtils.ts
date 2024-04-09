const isNum = (num: number) => !Number.isNaN(num)

function offsetXYFromParentOf(evt: any) {
  const offsetParent = evt.target.offsetParent || document.body
  const offsetParentRect = evt.offsetParent === document.body ? { left: 0, top: 0 } : offsetParent.getBoundingClientRect()
  const x = evt.clientX + offsetParent.scrollLeft - offsetParentRect.left
  const y = evt.clientY + offsetParent.scrollTop - offsetParentRect.top

  return { x, y }
}

export function createCoreData(lastX: number, lastY: number, x: number, y: number) {
  const isStart = !isNum(lastX)

  return isStart
    ? { deltaX: 0, deltaY: 0, lastX: x, lastY: y, x, y }
    : { deltaX: x - lastX, deltaY: y - lastY, lastX, lastY, x, y }
}

export const getControlPosition = (e: any) => offsetXYFromParentOf(e)
