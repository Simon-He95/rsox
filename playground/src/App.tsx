import A from './components/A'
import B from './components/B'
import Scroll from './components/Scroll'
import { useCount } from './store'

export default function TestComp() {
  const [count] = useCount()
  return (
    <>
      App page:
      {' '}
      {count}
      ---- components: A and B
      <A></A>
      <B></B>
      <Scroll></Scroll>
      <div
        style={{
          height: '70px',
          background: '#b6cceb',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        l am footer
      </div>
    </>
  )
}
