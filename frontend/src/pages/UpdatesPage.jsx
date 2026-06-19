import { useState, useEffect } from "react";
import { updatesAPI } from "../api";
import { getErrorMessage } from "../utils/helpers";
import LoadingSpinner from "../components/common/LoadingSpinner";
import UpdateCard from "../components/user/UpdateCard";
import {
  Search,
  Filter,
  AlertTriangle,
  Bell,
} from "lucide-react";

// ── Category config ───────────────────────────────────────────────────────────
const CATEGORIES = [
  "All",
  "Govt Forms",
  "Jobs",
  "Admit Cards",
  "Results",
  "Services",
  "Impt Notice",
];


export default function UpdatesPage() {
  const [updates, setUpdates] = useState([]);
  const [importantOnes, setImportant] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [error, setError] = useState(null);

  // Fetch updates
  useEffect(() => {
    const fetchUpdates = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = { page, per_page: 12 };
        if (search) params.search = search;
        if (category !== "All") params.category = category;

        const res = await updatesAPI.getAll(params);
        setUpdates(res?.data[0]?.data?.updates);
        setPagination(res?.data[0]?.data?.pagination);

        // Fetch important notices for marquee (only on page 1 with no filter)
        if (page === 1 && !search && category === "All") {
          const impRes = await updatesAPI.getAll({
            important: true,
            per_page: 5,
          });
          setImportant(impRes?.data[0]?.data.updates);
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchUpdates();
  }, [search, category, page]);

  // Reset page on filter change
  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setPage(1);
  };
  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-surface-50 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-surface-900 to-brand-900 text-white py-14 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold font-display mb-2">
            Daily Updates
          </h1>
          <p className="text-surface-300 text-lg">
            Latest notifications, job alerts, results & announcements
          </p>
        </div>
      </div>

      {/* Scrolling marquee for important notices */}
      {importantOnes.length > 0 && (
        <div className=" max-w-6xl mx-auto mt-8 ">
          <div className="flex items-center gap-3 bg-brand-700 text-white py-2 px-4 mx-4 overflow-hidden rounded-full">
            <span className="flex-shrink-0 flex items-center gap-1.5 font-bold text-sm text-white px-2.5 py-1 rounded-full">
              <AlertTriangle size={12} /> IMPORTANT
            </span>
            <div className="overflow-hidden flex-1">
              <div className="whitespace-nowrap text-sm font-medium animate-[marquee_25s_linear_infinite]">
                {importantOnes.map((u, i) => (
                  <span key={u.id}>
                    {u.title}
                    {i < importantOnes.length - 1 && (
                      <span className="mx-6 opacity-60">•</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400"
            />
            <input
              type="text"
              placeholder="Search updates…"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          <Filter
            size={14}
            className="text-surface-400 self-center flex-shrink-0"
          />
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                category === cat
                  ? "bg-brand-600 text-white shadow-brand"
                  : "bg-white border border-surface-200 text-surface-600 hover:border-brand-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="card border border-red-200 bg-red-50 text-red-700 text-sm py-4 text-center mb-6">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && <LoadingSpinner size="lg" className="py-20" />}

        {/* Grid */}
        {!loading && !error && (
          <>
            {updates.length === 0 ? (
              <div className="card text-center py-20 text-surface-400">
                <Bell size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">No updates found</p>
                <p className="text-sm mt-1">
                  Try a different search or category
                </p>
              </div>
            ) : (
              <>
                <p className="text-xs text-surface-400 mb-4">
                  {pagination?.total ?? updates.length} update
                  {pagination?.total !== 1 ? "s" : ""} found
                </p>
                <div className="grid grid-cols-1 gap-5">
                  {updates.map((u) => (
                    <UpdateCard key={u.id} update={u} />
                  ))}
                </div>
              </>
            )}

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  disabled={!pagination.has_prev}
                  onClick={() => setPage((p) => p - 1)}
                  className="btn-secondary text-sm py-1.5 px-4 disabled:opacity-40"
                >
                  ← Prev
                </button>
                <span className="px-4 py-1.5 text-sm text-surface-500 font-medium">
                  {pagination.current_page} / {pagination.pages}
                </span>
                <button
                  disabled={!pagination.has_next}
                  onClick={() => setPage((p) => p + 1)}
                  className="btn-secondary text-sm py-1.5 px-4 disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Marquee keyframe injected via style tag */}
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}
