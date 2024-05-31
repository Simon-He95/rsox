import { useSyncExternalStore } from 'react'

/**
 * 并发请求,不在意请求的顺序, 但结果保持数组顺序
 * @param promises (() => Promise<any>)[] | (() => Promise<any>)
 * @returns () => any[] | () => any
 */
export function conRunt(
  promises: (() => Promise<any>)[] | (() => Promise<any>),
) {
  let result: any
  let listener: any = null
  let isSingle = false
  if (!Array.isArray(promises)) {
    promises = [promises]
    isSingle = true
  }
  Promise.all(
    promises.map((promise) => {
      if (typeof promise !== 'function')
        throw new Error('promise must be a function')

      return promise()
    }),
  ).then((res) => {
    if (isSingle)
      result = res[0]
    else result = res
    listener()
  })
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
