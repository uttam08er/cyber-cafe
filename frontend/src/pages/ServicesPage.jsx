import { useState } from "react";
import { servicesAPI } from "../api";
import { useFetch } from "../hooks/useFetch";
import ServiceCard from "../components/user/ServiceCard";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { Search, Filter } from "lucide-react";

const CATEGORIES = [
  "all",
  "printing",
  "scanning",
  "assistance",
  "photo",
  "other",
];

export default function ServicesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const {
    data: services,
    loading,
    error,
  } = useFetch(() => servicesAPI.getAll(), []);

  const filtered = (services || []).filter((s) => {
    const matchCat = category === "all" || s.category === category;
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-surface-50 animate-fade-in">
      <div className="bg-gradient-to-r from-surface-900 to-brand-900 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold font-display mb-3">
            Our Services
          </h1>
          <p className="text-surface-300 text-lg">
            Professional digital services at the best prices in town
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400"
            />
            <input
              type="text"
              placeholder="Search services…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Filter size={15} className="text-surface-400 flex-shrink-0" />
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                  category === cat
                    ? "bg-brand-600 text-white shadow-brand"
                    : "bg-white text-surface-600 border border-surface-200 hover:border-brand-300"
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

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
                <p className="text-sm mt-1">
                  Try a different search or category
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-surface-500 mb-5">
                  {filtered.length} service{filtered.length !== 1 ? "s" : ""}{" "}
                  found
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {filtered.map((service) => (
                    <ServiceCard key={service.id} service={service} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}