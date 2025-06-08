import { render, fireEvent } from '@testing-library/react'
import App from './App'
import { expect, test } from 'vitest'

test('increments counter', () => {
  const { getByRole } = render(<App />)
  const button = getByRole('button')
  fireEvent.click(button)
  expect(button.textContent).toContain('1')
})
