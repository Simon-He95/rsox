import type { Dispatch, SetStateAction } from 'react'
import { useCallback, useEffect, useState } from 'react'

/**
 * 防抖
 * @param options
 * @param options.initialValue 初始值
 * @param options.callback 回调函数
 * @param options.delay 延迟时间
 * @returns [T, Dispatch<SetStateAction<T>>]
 */
export function useThrottle<T>(options: {
  initialValue: T
  callback: (newV: T) => any
  delay: number
}): [T, Dispatch<SetStateAction<T>>] {
  const { initialValue: value, callback, delay } = options
  const [debouncedValue, setDebouncedValue] = useState(value)

  const debouncedCallback = useCallback(
    throttle((newV) => {
      callback(newV)
    }, delay),
    [delay],
  )
  useEffect(() => {
    debouncedCallback(debouncedValue)
  }, [debouncedValue])

  return [debouncedValue, setDebouncedValue]
}

export function throttle(fn: (...args: any[]) => void, time: number = 200) {
  let lastTime = 0
  return (...args: any[]) => {
    const now = Date.now()
    if (now - lastTime > time) {
      fn.call(undefined, ...args)
      lastTime = now
    }
  }
}
