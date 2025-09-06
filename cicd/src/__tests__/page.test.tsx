import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Home from '../app/page'

describe('Home Page', () => {
  beforeEach(() => {
    render(<Home />)
  })

  it('renders hello world heading with emoji', () => {
    const heading = screen.getByRole('heading', { 
      name: /hello world! 🌍/i 
    })
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveClass('text-6xl', 'font-bold', 'text-blue-600', 'mb-8')
  })

  it('displays the CI/CD project description', () => {
    const description = screen.getByText(
      /This is my first CI\/CD project with GitHub Actions!/i
    )
    expect(description).toBeInTheDocument()
    expect(description).toHaveClass('text-xl', 'text-gray-600', 'mb-8')
  })

  it('shows deployment success indicator with checkmark', () => {
    const successDiv = screen.getByText(/✅ Successfully deployed with automation!/i)
    expect(successDiv).toBeInTheDocument()
    expect(successDiv.parentElement).toHaveClass(
      'bg-green-100', 
      'border', 
      'border-green-400', 
      'text-green-700', 
      'px-4', 
      'py-3', 
      'rounded'
    )
  })

  it('has the correct main container classes', () => {
    const main = screen.getByRole('main')
    expect(main).toHaveClass(
      'flex', 
      'min-h-screen', 
      'flex-col', 
      'items-center', 
      'justify-center', 
      'p-24'
    )
  })
})
