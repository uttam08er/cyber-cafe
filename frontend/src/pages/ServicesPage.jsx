import { useState } from 'react'
import { servicesAPI } from '../api'
import { useFetch } from '../hooks/useFetch'
import ServiceCard from '../components/user/ServiceCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { Search, Filter } from 'lucide-react'

const CATEGORIES = ['all', 'printing', 'scanning', 'assistance', 'photo', 'other']

export default function ServicesPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')

  const { data: services, loading, error } = useFetch(() => servicesAPI.getAll(), [])

  const filtered = (services || []).filter(s => {
    const matchCat = category === 'all' || s.category === category
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                        s.description?.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="min-h-screen bg-surface-50 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-surface-900 to-brand-900 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold font-display mb-3">Our Services</h1>
          <p className="text-surface-300 text-lg">Professional digital services at the best prices in town</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              placeholder="Search services…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Filter size={15} className="text-surface-400 flex-shrink-0" />
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                  category === cat
                    ? 'bg-brand-600 text-white shadow-brand'
                    : 'bg-white text-surface-600 border border-surface-200 hover:border-brand-300'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading && <LoadingSpinner size="lg" className="py-20" />}
        {error && (
          <div className="text-center py-20 text-red-500">
            <p>{error}</p>
          </div>
        )}
        {!loading && !error && (
          <>
            {filtered.length === 0 ? (
              <div className="text-center py-20 text-surface-400">
                <p className="text-lg font-medium">No services found</p>
                <p className="text-sm mt-1">Try a different search or category</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-surface-500 mb-5">{filtered.length} service{filtered.length !== 1 ? 's' : ''} found</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {filtered.map(service => (
                    <ServiceCard key={service.id} service={service} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}


// import { useState } from 'react'
// import { requestsAPI } from '../api'
// import { useFetch } from '../hooks/useFetch'
// import RequestCard from '../components/user/RequestCard'
// import LoadingSpinner from '../components/common/LoadingSpinner'
// import { Link } from 'react-router-dom'
// import { getErrorMessage } from '../utils/helpers'
// import toast from 'react-hot-toast'
// import { FileText, Plus } from 'lucide-react'

// const STATUS_TABS = ['all', 'pending', 'processing', 'completed', 'cancelled']

// export default function MyRequests() {
//   const [status, setStatus] = useState('all')
//   const [page, setPage] = useState(1)

//   const params = { page, ...(status !== 'all' ? { status } : {}) }
//   const { data, loading, error, refetch } = useFetch(
//     () => requestsAPI.getMy(params),
//     [status, page]
//   )

//   const requests = data?.requests || []
//   const pagination = data?.pagination

//   const handleCancel = async (id) => {
//     if (!confirm('Cancel this request?')) return
//     try {
//       await requestsAPI.cancel(id)
//       toast.success('Request cancelled')
//       refetch()
//     } catch (err) {
//       toast.error(getErrorMessage(err))
//     }
//   }

//   return (
//     <div className="animate-fade-in space-y-5">
//       <div className="flex items-center justify-between">
//         <h2 className="font-bold text-surface-900 text-xl font-display">My Requests</h2>
//         <Link to="/services" className="btn-primary text-sm py-2 px-4">
//           <Plus size={14} /> New Request
//         </Link>
//       </div>

//       {/* Status filter tabs */}
//       <div className="flex gap-2 overflow-x-auto pb-1">
//         {STATUS_TABS.map(s => (
//           <button
//             key={s}
//             onClick={() => { setStatus(s); setPage(1) }}
//             className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
//               status === s
//                 ? 'bg-brand-600 text-white'
//                 : 'bg-white border border-surface-200 text-surface-600 hover:border-brand-300'
//             }`}
//           >
//             {s.charAt(0).toUpperCase() + s.slice(1)}
//           </button>
//         ))}
//       </div>

//       {loading && <LoadingSpinner size="lg" className="py-16" />}
//       {error && <p className="text-red-500 text-sm">{error}</p>}

//       {!loading && !error && (
//         <>
//           {requests.length === 0 ? (
//             <div className="card text-center py-16 text-surface-400">
//               <FileText size={40} className="mx-auto mb-3 opacity-40" />
//               <p className="font-medium">No requests found</p>
//               <Link to="/services" className="text-brand-600 text-sm font-semibold hover:underline mt-2 inline-block">
//                 Browse services →
//               </Link>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               {requests.map(r => (
//                 <RequestCard key={r.id} request={r} onCancel={handleCancel} onRefresh={refetch} />
//               ))}
//             </div>
//           )}

//           {/* Pagination */}
//           {pagination && pagination.pages > 1 && (
//             <div className="flex justify-center gap-2 mt-4">
//               <button
//                 disabled={!pagination.has_prev}
//                 onClick={() => setPage(p => p - 1)}
//                 className="btn-secondary text-sm py-1.5 px-4 disabled:opacity-40"
//               >
//                 ← Prev
//               </button>
//               <span className="px-4 py-1.5 text-sm text-surface-500 font-medium">
//                 {pagination.current_page} / {pagination.pages}
//               </span>
//               <button
//                 disabled={!pagination.has_next}
//                 onClick={() => setPage(p => p + 1)}
//                 className="btn-secondary text-sm py-1.5 px-4 disabled:opacity-40"
//               >
//                 Next →
//               </button>
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   )
// }
