import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('PulseFit crashed:', error, info)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="grid min-h-dvh place-items-center bg-bg p-6 text-center">
        <div className="glass max-w-md rounded-3xl p-8">
          <p className="text-5xl">🏋️</p>
          <h1 className="mt-4 text-2xl font-bold text-ink">We dropped the bar.</h1>
          <p className="mt-2 text-ink-2">
            Something went wrong on our side. Your progress is safe — give it another rep.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-brand mt-6 h-11 rounded-2xl px-6 font-semibold text-accent-ink"
          >
            Reload PulseFit
          </button>
        </div>
      </div>
    )
  }
}
