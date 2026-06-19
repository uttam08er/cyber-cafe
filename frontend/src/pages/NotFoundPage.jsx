import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4">
      <div className="text-center animate-fade-in">
        <p className="text-8xl font-extrabold text-brand-600 font-display mb-4">404</p>
        <h1 className="text-3xl font-bold text-surface-900 font-display mb-3">Page Not Found</h1>
        <p className="text-surface-500 mb-8 max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => window.history.back()} className="btn-secondary">
            <ArrowLeft size={15} /> Go Back
          </button>
          <Link to="/" className="btn-primary">
            <Home size={15} /> Home
          </Link>
        </div>
      </div>
    </div>
  )
}
