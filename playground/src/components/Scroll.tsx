import { useLayoutEffect, useRef, useState } from 'react'
import { useInfiniteVirtualScroll } from '../../../src'

const list: any = []
for (let i = 0; i < 10; i++) {
  const temp = []
  for (let j = 0; j < 10; j++) {
    temp.push({
      id: i * 10 + j + 1,
      data: i * 10 + j + 1,
    })
  }
  list.push({
    items: temp,
    total: 90,
  })
}

function getData(i: number, setTotal: any, count: any): Promise<any> {
  return new Promise((resolve) => {
    console.log({ count })

    setTimeout(() => {
      i === 1 && setTotal(list[i].total)
      console.log({ i })
      resolve(list[i].items)
    }, 100)
  })
}

let count: any = 0
const infiniteScroll = useInfiniteVirtualScroll()
function Home() {
  const itemRef = useRef<any>()

  const [_, setCount] = useState(0)
  useLayoutEffect(() => {
    console.log({ itemRef })
  }, [itemRef])

  const { data, isOver, reset } = infiniteScroll(itemRef, {
    callback: (page: number, setTotal) => {
      return getData(page, setTotal, count)
    },
    // maxSize: 10,
  })
  function clickHandler() {
    // 希望infiniteScroll 暴露一个更新函数可以，重新再执行callback的时候能获取到 count 的最新值
    setCount(count + 1)
    count = count + 1
    reset()
  }
  console.log({ data })
  return (
    <>
      <div
        ref={itemRef}
        style={{
          width: '100%',
          background: '#90dfda',
          height: '200px',
          overflow: 'scroll',
        }}
      >
        {data?.map((item: any) => {
          return (
            <div style={{ height: '50px' }} key={item.id}>
              {item.data}
            </div>
          )
        })}
        {/* {isLoading ? 'loading...' : ''} */}

        {isOver ? 'no more data' : 'loading more...'}
      </div>
      <button onClick={() => clickHandler()}>
        click 改变请求条件
        {count}
      </button>
    </>
  )
}

export default Home
