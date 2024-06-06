import { useEffect } from 'react'
import { isDev, isFunction } from './utils'
import useLatest from './useLatest'

export function onUnmounted(fn: () => void) {
  if (isDev) {
    if (!isFunction(fn)) {
      console.error(
        `unMounted expected parameter is a function, got ${typeof fn}`,
      )
    }
  }

  const fnRef = useLatest(fn)

  useEffect(
    () => () => {
      fnRef.current()
    },
    [],
  )
}

export default onUnmounted
