## rsox

> WIP: react utils

## Usage

- createStore 一个简单的状态管理工具, 用于全局状态管理

```tsx
import { createStore } from 'rsox'

// store.ts 文件
const [useCount] = createStore(initial)
// 渲染页
const [count, setCount] = useCount()
// 我们可以在任意组件或页面去修改数据,同步所有页面视图
setCount(count + 1)
// 我们也可以持久化数据,通过制定一个 cacheKey
const [useCount] = createStore(initial, {
  localStorageCacheKey: '__local_project_countKey',
})
```

- conRun 并发请求,不在意请求的顺序, 但结果保持数组顺序

```tsx
import { conRun } from 'rsox'
const getInitData = conRunt([
  () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('1000')
      }, 5000)
    })
  },
  () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('5000')
      }, 1000)
    })
  },
  () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('8000')
      }, 1000)
    })
  },
])
function App() {
  const result = getInitData()
}
```

- seqRun 串行请求, 保证请求的顺序, 后一个请求能拿到上一个请求的结果

```tsx
import { seqRun } from 'rsox'
const getInitData = seqRun([
  () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(1000)
      }, 5000)
    })
  },
  (preRes) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(preRes + 1000)
      }, 1000)
    })
  },
  (preRes) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(preRes + 1000)
      }, 1000)
    })
  },
])
function App() {
  const result = getInitData() // [1000, 2000, 3000]
}
```

- useDebounce 防抖

```tsx
import { useDebounce } from 'rsox'

function App() {
  const [inputValue, setInputValue] = useDebounce<string>({
    initialValue: '',
    callback: (newV) => {
      // do something
    },
    delay: 500,
  })
  return (
    <>
      <input
        type="text"
        onChange={e => setInputValue(e.target.value)}
        value={inputValue}
      />
    </>
  )
}
```

- infiniteScroll 无限滚动

```tsx
import { useInfiniteScroll } from 'rsox'
const infiniteScroll = useInfiniteVirtualScroll()
function App() {
  const { isLoading, data, isOver, reset } = infiniteScroll(itemRef, {
    callback: (page: number, setTotal) => {
      return getData(page, setTotal, count)
    },
    // maxSize: 10, /* virtual scroll dom size */
  })
  return (
    <>
      {isLoading
        ? 'loading...'
        : data.map((item, index) => {
          return <div key={index}>{item}</div>
        })}
      {isOver ? 'no more data' : 'loading more...'}
    </>
  )
}
```

- useAsyncEffect 异步 useEffect

  ```tsx
  function App() {
    useAsyncEffect(async () => {
      const res1 = await fetch('https://api.github.com/users/Simon-He95')
      const res2 = await fetch('https://api.github.com/users/Simon-He95')
      const data1 = await res1.json()
      const data2 = await res2.json()
      console.log(data1, data2)
    }, [])
  }
  ```

## :coffee:

[buy me a cup of coffee](https://github.com/Simon-He95/sponsor)

## License

[MIT](./license)

## Sponsors

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/Simon-He95/sponsor/sponsors.svg">
    <img src="https://cdn.jsdelivr.net/gh/Simon-He95/sponsor/sponsors.png"/>
  </a>
</p>
