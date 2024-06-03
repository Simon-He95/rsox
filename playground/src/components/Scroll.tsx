import { useRef, useState } from 'react'
import { useInfiniteVirtualScroll } from '../../../src'

const list: any = []
for (let i = 0; i < 10; i++) {
  const temp = []
  for (let j = 0; j < 10; j++) {
    temp.push(i * 10 + j + 1)
  }
  list.push(temp)
}

function getData(i: number, setTotal: any, count: any): Promise<any> {
  return new Promise((resolve) => {
    console.log({ count })
    setTimeout(() => {
      setTotal(30)
      resolve(list[i])
    }, 1000)
  })
}

let count: any = 0
const infiniteScroll = useInfiniteVirtualScroll()
function Home() {
  const itemRef = useRef<any>(null)
  const [_, setCount] = useState(0)
  const { isLoading, data, isOver, reset } = infiniteScroll(itemRef, {
    callback: (page: number, setTotal) => {
      return getData(page, setTotal, count)
    },
    maxSize: 15,
  })
  function clickHandler() {
    // 希望infiniteScroll 暴露一个更新函数可以，重新再执行callback的时候能获取到 count 的最新值
    setCount(count + 1)
    count = count + 1
    reset()
  }
  return (
    <>
      <div
        ref={itemRef}
        style={{
          width: '100%',
          background: '#90dfda',
          height: '400px',
          overflow: 'scroll',
        }}
      >
        {data?.map((item: any) => {
          return (
            <div style={{ height: '50px' }} key={item}>
              {item}
            </div>
          )
        })}
        {isLoading ? 'loading...' : ''}

        {isOver ? '全部加载完了' : ''}
      </div>
      <button onClick={() => clickHandler()}>
        click 改变请求条件
        {count}
      </button>
    </>
  )
}

export default Home
