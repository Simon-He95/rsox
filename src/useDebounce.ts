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
export function useDebounce<T>(options: {
  initialValue: T
  callback: (newV: T) => any
  delay: number
}): [T, Dispatch<SetStateAction<T>>] {
  const { initialValue: value, callback, delay } = options
  const [debouncedValue, setDebouncedValue] = useState(value)

  const debouncedCallback = useCallback(
    debounce((newV) => {
      callback(newV)
    }, delay),
    [delay],
  )
  useEffect(() => {
    debouncedCallback(debouncedValue)
  }, [debouncedValue])
  return [debouncedValue, setDebouncedValue]
}

export function debounce(fn: (...args: any[]) => void, time: number = 200) {
  let timer: any = null
  return (...args: any[]) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn.call(undefined, ...args)
    }, time)
  }
}
