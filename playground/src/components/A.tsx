import { useCount } from '../store'

function Home() {
  const [count, setCount] = useCount()

  return (
    <>
      <h1>
        A:
        {count}
      </h1>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </>
  )
}

export default Home
