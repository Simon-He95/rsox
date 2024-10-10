import { useCallback, useState } from 'react'

export function useForceUpdate() {
  const [updated, forceUpdate] = useState(0)

  return [useCallback(() => forceUpdate(v => ++v), []), updated] as const
}
