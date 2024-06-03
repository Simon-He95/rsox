import type { MutableRefObject } from 'react'
import { useEffect, useState } from 'react'
import { createStore } from './createStore'

export function useInfiniteVirtualScroll() {
  let page = 1
  const pageCache = new Map<number, any[]>()
  let data: any
  let total = Infinity
  let isReset = false
  const [useLoading] = createStore(false)
  const [useData, clear] = createStore(undefined, {
    getSnapshot: (initial) => {
      return initial
    },
  })
  let loadingStatus = false
  let position = 0
  let itemHeight!: number
  let showItem: number
  const getAllDataSize = () => {
    return Array.from(pageCache.values()).reduce(
      (acc, cur) => acc + cur.length,
      0,
    )
  }
  return function <T>(
    ref: MutableRefObject<any>,
    options: {
      callback: (page: number, setTotal?: (n: number) => void) => Promise<T[]>
      maxSize?: number
    },
  ) {
    const { callback, maxSize } = options
    const [_, updateData] = useData()
    const [isLoading, updateLoading] = useLoading()
    const [isOver, updateOver] = useState(false)
    const setTotal = (n: number) => {
      total = n
    }
    const offset = maxSize ? Math.floor(maxSize / 4) : 0
    const updateLoadingStatus = (status: boolean) => {
      loadingStatus = status
      updateLoading(status)
    }

    const fetch = () => {
      updateLoadingStatus(true)

      callback(page, setTotal)
        .then((res) => {
          if (!total) {
            throw new Error('You need to setTotal')
          }
          updateLoadingStatus(false)
          pageCache.set(page, res)
          if (getAllDataSize() >= total)
            updateOver(true)

          const curPageData = pageCache.get(page - 1)!
          const nextPageData = pageCache.get(page)!
          const topItem = data?.[data.length - showItem + 1]
          data = [...(data || ([] as any)), ...res]
          if (maxSize && (data || []).length > maxSize) {
            const findIndex = Math.max(
              curPageData.findIndex(item => item === topItem) - offset,
              0,
            )
            data = [
              ...curPageData.slice(findIndex, curPageData.length),
              ...nextPageData.slice(
                0,
                maxSize - (curPageData.length - findIndex),
              ),
            ]
            position
              = data.findIndex((item: T) => item === topItem) * itemHeight
          }

          updateData(data)
        })
        .catch((err) => {
          page--
          console.error(err)
        })
    }

    useEffect(() => {
      fetch()
      const el = ref.current
      if (!el) {
        throw new Error('ref is not defined')
      }

      const listener = () => {
        if (loadingStatus)
          return
        position = el.scrollTop
        const clientHeight = el.clientHeight
        itemHeight = el.children[0].clientHeight
        showItem = Math.floor(clientHeight / itemHeight)
        const scrollTop = el.scrollTop
        if (maxSize && scrollTop === 0 && page >= 1) {
          if (page > 1)
            page--
          const prePageData = pageCache.get(page - 1)
          const curPageData = pageCache.get(page)!
          const nextPageData = pageCache.get(page + 1)!
          const topItem = data[0]

          const findIndex
            = curPageData?.findIndex(item => item === data[0])
            + showItem
            + offset
          if (!prePageData) {
            // 第一页了
            if (findIndex > curPageData.length) {
              if (
                curPageData.length
                > maxSize - (findIndex - curPageData.length)
              ) {
                data = [
                  ...curPageData.slice(
                    curPageData.length
                    - (maxSize - (findIndex - curPageData.length)),
                  ),
                  ...nextPageData.slice(0, findIndex - curPageData.length),
                ]
              }
              else {
                data = [
                  ...curPageData,
                  ...nextPageData.slice(maxSize - curPageData.length),
                ]
              }
            }
            else {
              data = [...curPageData, ...pageCache.get(page + 1)!].slice(
                0,
                maxSize,
              )
            }
            position
              = data.findIndex((item: any) => item === topItem) * itemHeight
          }
          else {
            // 前后预留 maxSize / 4 的数据
            // 获取他当前容器能显示多少条数据
            if (findIndex > curPageData.length) {
              const nextPageData = pageCache.get(page + 1)
              if (!nextPageData) {
                data = [
                  ...prePageData.slice(
                    prePageData.length - (maxSize - findIndex),
                    prePageData.length,
                  ),
                  ...curPageData.slice(0, findIndex),
                ]
                updateOver(true)
              }
              else {
                if (findIndex > maxSize) {
                  data = [
                    ...curPageData.slice(0, curPageData.length),
                    ...nextPageData.slice(0, maxSize - curPageData.length),
                  ]
                }
                else {
                  data = [
                    ...prePageData.slice(
                      prePageData.length - (maxSize - findIndex),
                      prePageData.length,
                    ),
                    ...curPageData.slice(0, findIndex),
                    ...nextPageData.slice(0, findIndex - curPageData.length),
                  ]
                }
                // data = [...prePageData.slice(prePageData.length - (maxSize - findIndex), prePageData.length), ...curPageData.slice(0, findIndex), ...nextPageData.slice(0, findIndex - curPageData.length)]
              }
            }
            else {
              data = [
                ...prePageData.slice(
                  prePageData.length - (maxSize - findIndex),
                  prePageData.length,
                ),
                ...curPageData.slice(0, findIndex),
              ]
            }
            position
              = data.findIndex((item: any) => item === topItem) * itemHeight
          }

          updateData(data)
          return
        }

        if (isOver)
          return
        const overMax = getAllDataSize() >= total && page === pageCache.size
        if (
          !isOver
          && overMax
          && pageCache.size === page
          && data.slice(-1)[0] === pageCache.get(page)!.slice(-1)[0]
        ) {
          updateOver(true)
          return
        }
        else {
          updateOver(false)
        }

        const scrollHeight = el.scrollHeight
        if (scrollTop + clientHeight >= scrollHeight) {
          if (!overMax)
            page++

          if (pageCache.has(page)) {
            const curPageData = pageCache.get(page)!
            const nextPageData = pageCache.get(page + 1)!
            const topItem = data[data.length - showItem]
            let findIndex
              = curPageData.findIndex(item => item === topItem) - offset
            const prePageData = pageCache.get(page - 1)!

            if (maxSize) {
              if (!nextPageData) {
                if (maxSize > curPageData.length) {
                  data = [
                    ...prePageData.slice(
                      prePageData.length - (maxSize - curPageData.length),
                    ),
                    ...curPageData,
                  ]
                }
                else if (findIndex <= -1) {
                  if (maxSize - findIndex > curPageData.length) {
                    data = [
                      ...prePageData.slice(prePageData.length - findIndex),
                      ...curPageData,
                    ]
                  }
                  else {
                    data = [
                      ...prePageData.slice(prePageData.length - findIndex),
                      ...curPageData.slice(0, maxSize - findIndex),
                    ]
                  }
                }
                else {
                  data = [
                    ...prePageData.slice(maxSize - findIndex),
                    ...curPageData.slice(findIndex),
                  ]
                }
                data = [...pageCache.get(page - 1)!, ...curPageData]
                data = data.slice(data.length - maxSize, data.length)
                updateOver(true)
              }
              else {
                // 前后预留 maxSize / 4 的数据
                // 获取他当前容器能显示多少条数据
                if (findIndex <= -1) {
                  findIndex
                    = prePageData.findIndex(item => item === topItem) - offset
                  if (maxSize > findIndex + curPageData.length) {
                    data = [
                      ...prePageData.slice(
                        prePageData.length - findIndex,
                        prePageData.length,
                      ),
                      ...curPageData,
                      ...nextPageData.slice(
                        0,
                        maxSize - curPageData.length - findIndex,
                      ),
                    ]
                  }
                  else {
                    data = [
                      ...prePageData.slice(
                        prePageData.length - findIndex,
                        prePageData.length,
                      ),
                      ...curPageData.slice(0, maxSize - findIndex),
                    ]
                  }
                }
                else {
                  data = [
                    ...curPageData.slice(findIndex, curPageData.length),
                    ...nextPageData.slice(
                      0,
                      maxSize - (curPageData.length - findIndex),
                    ),
                  ]
                }

                position
                  = data.findIndex((item: any) => item === topItem) * itemHeight
              }
            }
            else {
              data = [...data, ...(nextPageData || [])]
            }
            updateData(data)
            return
          }
          fetch()
        }
      }

      el.addEventListener('scroll', listener)
      return () => {
        el.removeEventListener('scroll', listener)
        pageCache.clear()
        clear()
        data = null
        ref.current = null
      }
    }, [])
    useEffect(() => {
      if (isReset) {
        ref.current.scrollTop = 0
        isReset = false
      }
      else {
        ref.current.scrollTop = position
      }
    }, [_])

    return {
      isLoading,
      data,
      page,
      isOver,
      setTotal,
      reset: () => {
        data = null
        page = 1
        pageCache.clear()
        isReset = true
        fetch()
      },
    }
  }
}
