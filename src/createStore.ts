import { useSyncExternalStore } from 'react'
import type { Return } from './type'

export function createStore<T>(
  value: T,
  options: {
    localStorageCacheKey?: string
    sessionStorageCacheKey?: string
    getSnapshot?: (initial: T) => T
    getServerSnapshot?: (initial: T) => T
    dataTransform?: (v: T) => T
  } = {},
) {
  let initial!: T
  const listeners: (() => void)[] = []
  const transformData = () =>
    options.dataTransform ? options.dataTransform(initial) : initial
  const getSnapshot = options.getSnapshot
    ? () => options.getSnapshot!(transformData())
    : () => transformData()
  const getServerSnapshot = options.getServerSnapshot
    ? () => options.getServerSnapshot!(transformData())
    : () => transformData()
  if (options.localStorageCacheKey) {
    const cachedValue = localStorage.getItem(options.localStorageCacheKey)
    if (cachedValue !== null)
      initial = JSON.parse(cachedValue)
  }
  else if (options.sessionStorageCacheKey) {
    const cachedValue = sessionStorage.getItem(options.sessionStorageCacheKey)
    if (cachedValue !== null)
      initial = JSON.parse(cachedValue)
  }
  if (!initial)
    initial = value

  function update(newValue: T) {
    initial = options.dataTransform ? options.dataTransform(newValue) : newValue
    if (options.localStorageCacheKey) {
      localStorage.setItem(
        options.localStorageCacheKey,
        JSON.stringify(initial),
      )
    }
    else if (options.sessionStorageCacheKey) {
      sessionStorage.setItem(
        options.sessionStorageCacheKey,
        JSON.stringify(initial),
      )
    }

    emitChange()
  }
  function subscribe(listener: () => void) {
    listeners.push(listener)
    return () => {
      listeners.splice(listeners.indexOf(listener), 1)
    }
  }
  function emitChange() {
    for (const listener of listeners) listener()
  }
  function clear() {
    listeners.length = 0
  }
  function cacheClear(initial?: T) {
    if (options.sessionStorageCacheKey)
      sessionStorage.removeItem(options.sessionStorageCacheKey)
    else if (options.localStorageCacheKey)
      localStorage.removeItem(options.localStorageCacheKey)
    if (initial)
      update(initial)
  }

  return [
    () => [
      useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot),
      update,
      cacheClear,
    ],
    clear,
  ] as Return<T>
}
