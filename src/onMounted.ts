import { useEffect } from 'react'
import { isDev, isFunction } from './utils'
import useLatest from './useLatest'

export function onMounted(fn: () => void) {
  if (isDev) {
    if (!isFunction(fn)) {
      console.error(
        `onMounted expected parameter is a function, got ${typeof fn}`,
      )
    }
  }

  const fnRef = useLatest(fn)

  useEffect(() => {
    return fnRef.current()
  }, [])
}

export default onMounted
