/**
 * Format a number as Indian Rupees
 */
export function formatCurrency(amount) {
  return `₹ ${Number(amount || 0).toFixed(2)}`
}

/**
 * Format file size in human-readable form
 */
export function formatFileSize(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Format an ISO date string to readable date
 */
export function formatDate(isoString) {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

/**
 * Format an ISO date string to readable datetime
 */
export function formatDateTime(isoString) {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

/**
 * Get status badge class
 */
export function getStatusClass(status) {
  const map = {
    pending: 'badge-pending',
    processing: 'badge-processing',
    completed: 'badge-completed',
    rejected: 'badge-rejected',
    cancelled: 'badge-cancelled',
    confirmed: 'badge-completed',
    no_show: 'badge-rejected',
  }
  return map[status] || 'badge'
}

/**
 * Extract error message from axios error
 */
export function getErrorMessage(error) {
  return error?.response?.data?.message || error?.message || 'Something went wrong'
}

/**
 * Truncate a string to max length
 */
export function truncate(str, max = 60) {
  if (!str) return ''
  return str.length > max ? str.slice(0, max) + '…' : str
}
