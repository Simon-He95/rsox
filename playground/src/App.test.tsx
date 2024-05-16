import { describe, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { App, WrappedApp } from './App'

describe('app', () => {
  it('renders hello world', () => {
    // ARRANGE
    render(<WrappedApp />)
    // ACT
    // EXPECT
    expect(
      screen.getByRole('heading', {
        level: 1,
      }),
    ).toHaveTextContent('Hello World')
  })
  it('renders not found if invalid path', () => {
    render(
      <MemoryRouter initialEntries={['/this-route-does-not-exist']}>
        <App />
      </MemoryRouter>,
    )
    expect(
      screen.getByRole('heading', {
        level: 1,
      }),
    ).toHaveTextContent('Not Found')
  })
})
