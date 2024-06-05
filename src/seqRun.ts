import { useSyncExternalStore } from 'react'

/**
 * 串行请求, 保证请求的顺序, 后一个请求能拿到上一个请求的结果
 * @param promises
 * @returns () => any[]
 */
export function seqRun(promises: ((pre?: any) => Promise<any>)[]) {
  let result: any
  let listener: any = null
  let temp: any

  const run = async () => {
    for (const promise of promises) {
      if (typeof promise !== 'function')
        throw new Error('promise must be a function')

      temp = await promise(temp)
      if (!result)
        result = []
      result.push(temp)
    }
  }
  run().then(listener)

  return () =>
    useSyncExternalStore(
      (cb) => {
        listener = cb
        return () => {
          listener = null
        }
      },
      () => result,
      () => result,
    )
}
