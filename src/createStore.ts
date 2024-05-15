import { useSyncExternalStore } from 'react'
import type { Return } from './type'

export function createStore<T>(
  value: T,
  options: {
    cacheKey?: string
    getSnapshot?: (initial: T) => T
    getServerSnapshot?: (initial: T) => T
    dataTransform?: (v: T) => T
  } = {},
) {
  let initial!: T
  const listeners: (() => void)[] = []
  const cacheKey = options.cacheKey
  const transformData = () =>
    options.dataTransform ? options.dataTransform(initial) : initial
  const getSnapshot = options.getSnapshot
    ? () => options.getSnapshot!(transformData())
    : () => transformData()
  const getServerSnapshot = options.getServerSnapshot
    ? () => options.getServerSnapshot!(transformData())
    : () => transformData()
  if (cacheKey) {
    const cachedValue = localStorage.getItem(cacheKey)
    if (cachedValue !== null)
      initial = JSON.parse(cachedValue)
  }
  if (!initial)
    initial = value

  function update(newValue: T) {
    initial = options.dataTransform ? options.dataTransform(newValue) : newValue
    if (cacheKey)
      localStorage.setItem(cacheKey, JSON.stringify(initial))

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
    cacheKey && localStorage.removeItem(cacheKey)
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
