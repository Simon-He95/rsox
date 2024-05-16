import React from 'react'
import A from './components/A'
import B from './components/B'
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
    </>
  )
}
