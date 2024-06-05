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
  const getItemPageMeta = (topItem: any) => {
    const [current, curPageData] = Array.from(pageCache.entries()).find(
      ([_, k]) => k.includes(topItem),
    )!
    return {
      curPageData,
      prePageData: pageCache.get(current - 1),
      nextPageData: pageCache.get(current + 1),
    }
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

          const topItem = data?.[data.length - showItem + 1] || res[0]
          const { curPageData, nextPageData } = getItemPageMeta(topItem)
          data = [...(data || ([] as any)), ...res]
          if (maxSize && (data || []).length > maxSize) {
            const findIndex = Math.max(
              curPageData.findIndex(item => item === topItem) - offset,
              0,
            )
            if (curPageData.length - findIndex > maxSize) {
              data = [...curPageData.slice(findIndex, findIndex + maxSize)]
            }
            else {
              data = [
                ...curPageData.slice(findIndex),
                ...(nextPageData || [])?.slice(
                  0,
                  maxSize - (curPageData.length - findIndex),
                ),
              ]
            }
            position
              = (data.findIndex((item: T) => item === topItem) || 0) * itemHeight
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
        setTimeout(() => {
          console.log({ el })
        }, 5000)

        return
        // throw new Error('ref is not defined')
      }

      const listener = () => {
        if (loadingStatus)
          return
        position = el.scrollTop
        const clientHeight = el.clientHeight
        itemHeight = el.children[0].clientHeight
        showItem = Math.floor(clientHeight / itemHeight)
        if (maxSize && maxSize < showItem + 2) {
          el.removeEventListener('scroll', listener)
          throw new Error('maxSize should more than showItem + 2')
        }
        const scrollTop = el.scrollTop
        if (maxSize && scrollTop === 0 && page >= 1) {
          if (page > 1)
            page--
          const topItem = data[0]
          const { curPageData, nextPageData, prePageData }
            = getItemPageMeta(topItem)

          const findIndex = curPageData.findIndex(item => item === topItem)
          // 不考虑maxSize < showItem的情况
          const left = Math.ceil((maxSize - showItem) / 2)
          let right = maxSize - showItem - left
          if (left < findIndex) {
            const distance = maxSize - (curPageData.length - (findIndex - left))
            if (distance > 0) {
              data = [
                ...curPageData.slice(findIndex - left),
                ...(nextPageData ? nextPageData.slice(0, distance) : []),
              ]
            }
            else {
              data = [
                ...curPageData.slice(
                  findIndex - left,
                  findIndex + showItem + right,
                ),
              ]
            }
          }
          else {
            // left > findIndex, 向 prePageData 借数据
            if (!prePageData) {
              right = right + left - findIndex
              const distance = maxSize - curPageData.length
              if (distance > 0) {
                data = [
                  ...curPageData.slice(0),
                  ...(nextPageData || [])?.slice(0, distance),
                ]
              }
              else {
                data = [...curPageData.slice(0, findIndex + showItem + right)]
              }
            }
            else {
              const distance
                = maxSize
                - curPageData.length
                - (prePageData.length - left + findIndex)
              if (distance > 0) {
                data = [
                  ...prePageData.slice(prePageData.length - left + findIndex),
                  ...curPageData.slice(0),
                  ...(nextPageData ? nextPageData.slice(0, distance) : []),
                ]
              }
              else {
                data = [
                  ...prePageData.slice(prePageData.length - left + findIndex),
                  ...curPageData.slice(0, findIndex + showItem + right),
                ]
              }
            }
          }
          position
            = data.findIndex((item: any) => item === topItem) * itemHeight

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
            const topItem = data[data.length - showItem]
            const { curPageData, nextPageData, prePageData }
              = getItemPageMeta(topItem)
            const findIndex = curPageData.findIndex(item => item === topItem)

            if (!maxSize)
              return

            // 不考虑maxSize < showItem的情况
            const left = Math.floor((maxSize - showItem) / 2)
            const right = maxSize - showItem - left
            if (findIndex + showItem + right < curPageData.length) {
              if (left > findIndex) {
                data = [
                  ...prePageData!.slice(
                    prePageData!.length - (left - findIndex),
                  ),
                  ...curPageData.slice(0, findIndex + showItem + right),
                ]
              }
              else {
                data = [
                  ...curPageData.slice(
                    findIndex - left,
                    findIndex + showItem + right,
                  ),
                ]
              }
            }
            else {
              // 向 nextPageData 借用
              if (left > findIndex) {
                data = [
                  ...prePageData!.slice(
                    prePageData!.length - (left - findIndex),
                  ),
                  ...curPageData,
                  ...(nextPageData
                    ? nextPageData.slice(
                      0,
                      maxSize
                      - curPageData.length
                      - (prePageData!.length - (left - findIndex)),
                    )
                    : []),
                ]
              }
              else {
                if (nextPageData) {
                  data = [
                    ...curPageData.slice(findIndex - left),
                    ...nextPageData.slice(
                      0,
                      maxSize - (curPageData.length - (findIndex - left)),
                    ),
                  ]
                }
                else {
                  if (findIndex - left > right) {
                    data = [...curPageData.slice(findIndex - left - right)]
                  }
                  else {
                    data = [
                      ...prePageData!.slice(
                        prePageData!.length - (right - (findIndex - left)),
                      ),
                      ...curPageData,
                    ]
                  }
                }
              }
            }
            position
              = data.findIndex((item: any) => item === topItem) * itemHeight
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
      if (!ref.current)
        return

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
