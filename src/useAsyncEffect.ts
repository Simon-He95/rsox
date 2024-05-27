import type { DependencyList, EffectCallback } from 'react'
import { useEffect } from 'react'

export function useAsyncEffect(
  effect: () => ReturnType<EffectCallback> | void,
  deps: DependencyList = [],
) {
  useEffect(() => {
    const stop = effect()
    return () => stop && stop()
  }, deps)
}
