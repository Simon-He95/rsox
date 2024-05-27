## rsox

> WIP: react utils

## Usage

```
import { createStore } from 'rsox';

// store.ts 文件
const [useCount] = createStore(initial)
// 渲染页
const [count,setCount] = useCount()
// 我们可以在任意组件或页面去修改数据,同步所有页面视图
setCount(count+1)
// 我们也可以持久化数据,通过制定一个 cacheKey
const [useCount] = createStore(initial,{ localStorageCacheKey:'__local_project_countKey' })

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
