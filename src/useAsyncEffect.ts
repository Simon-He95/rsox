import type { DependencyList, EffectCallback } from 'react'
import { useEffect } from 'react'

export function useAsyncEffect(
  effect: () => Promise<ReturnType<EffectCallback>>,
  deps: DependencyList = [],
) {
  useEffect(() => {
    let stop: ReturnType<EffectCallback>
    effect().then((v) => {
      stop = v
    })
    return () => stop && stop()
  }, deps)
}
