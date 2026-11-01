import { CloudOff, DatabaseZap, RefreshCw, WifiOff } from 'lucide-react'
import EmptyState from './EmptyState'
import Button from './Button'

const titles = {
  DB_UNAVAILABLE: 'Database is taking a breather',
  DB_NOT_CONFIGURED: 'Database not connected',
  NETWORK: 'You seem to be offline',
  SERVER_DOWN: 'Server isn’t responding',
}
const icons = { DB_UNAVAILABLE: DatabaseZap, DB_NOT_CONFIGURED: DatabaseZap, NETWORK: WifiOff }

export default function ErrorState({ error, onRetry }) {
  return (
    <EmptyState
      icon={icons[error?.code] ?? CloudOff}
      title={titles[error?.code] ?? 'Something went wrong'}
      message={error?.message ?? 'Please try again in a moment.'}
      action={
        onRetry && (
          <Button variant="ghost" size="sm" onClick={onRetry}>
            <RefreshCw size={16} /> Try again
          </Button>
        )
      }
    />
  )
}
