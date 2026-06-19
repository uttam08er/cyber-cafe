import { getStatusClass } from '../../utils/helpers'

export default function StatusBadge({ status }) {
  const labels = {
    pending: 'Pending',
    processing: 'Processing',
    completed: 'Completed',
    rejected: 'Rejected',
    cancelled: 'Cancelled',
    confirmed: 'Confirmed',
    no_show: 'No Show',
    paid: 'Paid',
    unpaid: 'Unpaid',
  }
  return (
    <span className={getStatusClass(status)}>
      {labels[status] || status}
    </span>
  )
}
