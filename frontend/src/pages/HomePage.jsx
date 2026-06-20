import { Link } from "react-router-dom";
import {
  Printer,
  ScanLine,
  FileText,
  Monitor,
  Camera,
  Copy,
  ArrowRight,
  CheckCircle,
  Star,
  Wifi,
  Award,
  Clock,
  Users,
  Shield,
  BadgeCheck,
  Rss,
  HandCoins,
  Fingerprint,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { updatesAPI } from "../api";
import { useEffect, useState } from "react";
import UpdateCard from "../components/user/UpdateCard";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { formatDate } from "../utils/helpers";

const features = [
  {
    icon: Printer,
    title: "Document Printing",
    desc: "B&W and color printing with high quality laser printers",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: ScanLine,
    title: "Scanning Services",
    desc: "Scan to PDF, JPG up to 600 DPI resolution",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: FileText,
    title: "Form Filling",
    desc: "Expert help with government and official forms",
    color: "bg-orange-50 text-orange-600",
  },
  {
    icon: Monitor,
    title: "PC Rental",
    desc: "Comfortable, high-speed computers by the hour",
    color: "bg-brand-50 text-brand-600",
  },
  {
    icon: Camera,
    title: "Passport Photos",
    desc: "Professional ID photos in standard sizes",
    color: "bg-pink-50 text-pink-600",
  },
  {
    icon: Copy,
    title: "Photocopying",
    desc: "Fast copies of documents, IDs and certificates",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: HandCoins,
    title: "Money deposit/withdraw",
    desc: "Money withdraw/deposit by aadhar, mobile and account no.",
    color: "bg-rose-50 text-rose-600",
  },
  {
    icon: Camera,
    title: "Passport & License",
    desc: "Government Id's like Passport and license issues",
    color: "bg-teal-50 text-teal-600",
  },
  {
    icon: Fingerprint,
    title: "Aadhaar updating",
    desc: "Updating — name, address, DOB, and mobile number.",
    color: "bg-fuchsia-50 text-fuchsia-600",
  },
];

const steps = [
  {
    num: "01",
    title: "Register & Login",
    desc: "Create your free account in under a minute",
  },
  {
    num: "02",
    title: "Pick a Service",
    desc: "Browse our services and choose what you need",
  },
  {
    num: "03",
    title: "Submit & Track",
    desc: "Upload documents and track your request in real time",
  },
  {
    num: "04",
    title: "Collect & Pay",
    desc: "Come in, collect your order, and pay at counter",
  },
];

const testimonials = [
  {
    name: "Rahul Kumar",
    role: "Student",
    text: "Got my form filling done in minutes. Super helpful staff and easy to track online!",
    stars: 5,
  },
  {
    name: "Priya Singh",
    role: "Teacher",
    text: "Best printing quality in town. Booked my PC slot online and everything was ready.",
    stars: 5,
  },
  {
    name: "Amit Sharma",
    role: "Business Owner",
    text: "I use Shaurya eServices for all my document work. Affordable, fast, and always reliable.",
    stars: 5,
  },
];

// ── Owner stats shown in the About section ────────────────────────────────────
const ownerStats = [
  { icon: Clock, value: "10+", label: "Years Experience" },
  { icon: Users, value: "10,000+", label: "Customers Served" },
  { icon: Award, value: "#1", label: "Rated in Area" },
  { icon: Shield, value: "100%", label: "Satisfaction" },
];

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="animate-fade-in">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-surface-900 via-brand-900 to-surface-900 text-white py-24 px-4">
        {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-24 right-24 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-brand-400/5 rounded-full blur-2xl" />
        </div> */}
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse-slow" />
            Open Now · 8 AM – 8 PM Daily
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold font-display leading-tight mb-6">
            Your Smart
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-accent-220">
              Cyber Café
            </span>
          </h1>
          <p className="text-xl text-surface-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Printing, scanning, form filling, PC rental — all in one place. Book
            online, track your requests, and skip the queue.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/services"
              className="btn-primary self-center text-base px-8 py-3.5 shadow-brand"
            >
              Explore Services <ArrowRight size={18} />
            </Link>
            {!isAuthenticated && (
              <Link
                to="/register"
                className="btn-outline self-center text-base px-8 py-3.5 border-white/30 text-white hover:bg-white/10"
              >
                Create Free Account
              </Link>
            )}
            {isAuthenticated && (
              <Link
                to="/booking"
                className="btn-outline self-center text-base px-8 py-3.5 border-white/30 text-white hover:bg-white/10"
              >
                Book a PC Slot
              </Link>
            )}
          </div>
          <div className="flex flex-wrap gap-6 justify-center mt-12 text-sm text-surface-100">
            {[
              "10+ Years of Service",
              "10,000+ Happy Customers",
              "100 % Satisfaction",
              "Fast Turnaround",
            ].map((b) => (
              <div key={b} className="flex items-center gap-1.5">
                <CheckCircle size={14} className="text-green-400" />
                {b}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services Grid ─────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title">What We Offer</h2>
            <p className="section-subtitle">
              Professional digital services at affordable prices
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div
                key={title}
                className="flex items-start gap-4 p-5 rounded-2xl border border-surface-100 hover:border-brand-200 hover:shadow-card transition-all group"
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}
                >
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-surface-900 mb-1 group-hover:text-brand-600 transition-colors">
                    {title}
                  </h3>
                  <p className="text-sm text-surface-500 leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/services" className="btn-primary">
              View All Services & Pricing <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-surface-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">
              Simple, fast, and transparent process
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map(({ num, title, desc }) => (
              <div key={num} className="text-center">
                <div className="w-14 h-14 bg-brand-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 font-mono font-bold text-lg shadow-brand">
                  {num}
                </div>
                <h3 className="font-bold text-surface-900 mb-2">{title}</h3>
                <p className="text-sm text-surface-500 leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
          {!isAuthenticated && (
            <div className="text-center mt-12">
              <Link to="/register" className="btn-primary text-base px-8">
                Get Started Free <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title">What Customers Say</h2>
            <p className="section-subtitle">
              Join thousands of satisfied customers
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, text, stars }) => (
              <div key={name} className="card">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className="fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-surface-600 text-sm leading-relaxed mb-4">
                  "{text}"
                </p>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center">
                    <span className="text-brand-700 font-bold text-sm">
                      {name[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-surface-900 text-sm">
                      {name}
                    </p>
                    <p className="text-xs text-surface-400">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About the Owner ───────────────────────────────────────────────── */}
      {/* INSERT POINT: between Testimonials and CTA */}
      <section className="py-10 px-4 bg-surface-50 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          {/* Section label */}
          <div className="text-center mb-10">
            <span className="inline-block text-xs font-bold tracking-widest text-brand-600 uppercase mb-3">
              Meet the Owner
            </span>
            <h2 className="section-title">The Person Behind Shaurya eServices</h2>
            <p className="section-subtitle">
              Serving the community with dedication since 2014
            </p>
          </div>

          {/* Main card — image left, content right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden shadow-card border border-surface-200 bg-white">
            {/* ── Left: Image panel ────────────────────────────────────── */}
            <div className="relative bg-gradient-to-br from-brand-600 to-brand-800 flex items-end justify-center min-h-[360px] lg:min-h-0 overflow-hidden">
              {/* Background pattern */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                {/* Grid dots */}
                <svg
                  className="absolute inset-0 w-full h-full opacity-10"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <pattern
                      id="dots"
                      x="0"
                      y="0"
                      width="20"
                      height="20"
                      patternUnits="userSpaceOnUse"
                    >
                      <circle cx="2" cy="2" r="1.5" fill="white" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#dots)" />
                </svg>
              </div>

              {/* Owner photo — replace src with actual image URL */}
              <div className="relative z-10 flex flex-col items-center py-10 px-8 my-auto">
                <div className="relative">
                  {/* Glow ring */}
                  <div className="absolute inset-0 rounded-full bg-white/20 blur-xl scale-110" />
                  {/* Avatar circle — swap <img> in when you have a photo */}
                  <div className="relative w-48 h-48 lg:w-64 lg:h-64 rounded-full border-4 border-white/40 shadow-2xl overflow-hidden bg-brand-100">
                    {/* TO USE A REAL PHOTO — replace the div below with: */}
                    <img
                      src="/images/michael_dam.jpg"
                      alt="Michael Dam"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Verified badge */}
                  <div className="absolute bottom-2 right-2 lg:bottom-5 lg:right-5 w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
                    <BadgeCheck
                      size={40}
                      className="text-brand-100 fill-brand-600"
                    />
                  </div>
                </div>

                {/* Name + title overlaid on image panel */}
                <div className="mt-6 text-center text-white">
                  <h3 className="text-2xl font-extrabold font-display">
                    Michael Dam
                  </h3>
                  <p className="text-brand-200 text-sm font-medium mt-1">
                    Founder & Owner · Shaurya eServices
                  </p>
                  <p className="text-brand-200 text-sm font-medium mt-1">
                    10+ years of experience
                  </p>
                </div>
              </div>
            </div>

            {/* ── Right: Story + stats ──────────────────────────────────── */}
            <div className="flex flex-col justify-center p-8 lg:p-12">
              {/* Quote mark */}
              <div className="text-7xl leading-none text-brand-200 font-display font-extrabold mb-2 flip-y select-none">
                ''
              </div>

              <h3 className="text-2xl font-bold font-display text-surface-900 mb-4 -mt-4">
                Passionate about helping people access digital services.
              </h3>

              <p className="text-surface-500 leading-relaxed mb-4">
                I started Shaurya eServices in 2014 with a simple goal — to give everyone
                in our community access to fast, affordable, and reliable
                digital services. Back then, getting a document printed meant
                standing in long queues with no certainty of quality.
              </p>

              <p className="text-surface-500 leading-relaxed mb-8">
                Today, we serve hundreds of customers every week — students,
                professionals, and businesses — with a full range of services
                and a seamless online booking system that I built from the
                ground up. I'm proud that Shaurya eServices has become the most trusted
                name for digital services in our area.
              </p>

              {/* Stats grid */}
              {/* <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {ownerStats.map(({ icon: Icon, value, label }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center text-center p-3 bg-surface-50 rounded-2xl border border-surface-100"
                  >
                    <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center mb-2">
                      <Icon size={16} className="text-brand-600" />
                    </div>
                    <span className="text-xl font-extrabold font-display text-surface-900">
                      {value}
                    </span>
                    <span className="text-xs text-surface-400 leading-tight mt-0.5">
                      {label}
                    </span>
                  </div>
                ))}
              </div> */}

              {/* Signature + CTA */}
              <div className="flex items-center justify-between flex-wrap gap-4 pt-6 border-t border-surface-100">
                <div>
                  <p className="font-signature font-extrabold text-surface-800 text-xl italic">
                    Michael Dam
                  </p>
                  <p className="text-xs text-surface-400 mt-0.5">
                    Founder, Shaurya eServices
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-brand-700">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Wifi size={28} className="text-white" />
          </div>
          <h2 className="text-4xl font-extrabold text-white font-display mb-4">
            Ready to get started?
          </h2>
          <p className="text-brand-100 text-lg mb-8">
            Register for free and book services online — no waiting in line.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/register"
                  className="bg-white text-brand-600 self-center font-bold px-8 py-3.5 rounded-xl hover:bg-brand-50 transition-colors inline-flex items-center gap-2"
                >
                  Register Now <ArrowRight size={16} />
                </Link>
                <Link
                  to="/contact"
                  className="border-2 border-white/40 text-white self-center font-semibold px-8 py-3.5 rounded-xl hover:bg-white/10 transition-colors"
                >
                  Contact Us
                </Link>
              </>
            ) : (
              <Link
                to="/services"
                className="bg-white text-brand-600 font-bold px-8 py-3.5 rounded-xl hover:bg-brand-50 transition-colors inline-flex items-center gap-2"
              >
                Browse Services <ArrowRight size={16} />
              </Link>
            )}
          </div>
        </div>
      </section>
      
      {/* ── Latest Updates Section ── */}
      <LatestUpdatesSection />
    </div>
  );
}

// ── Latest Updates Section (self-contained, fetches its own data) ──────────────
function LatestUpdatesSection() {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    updatesAPI
      .getLatest()
      .then((res) => setUpdates(res?.data[0]?.data?.updates))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!loading && updates.length === 0) return null;

  return (
    <section className="py-20 px-4 bg-surface-50">
      <div className="max-w-6xl mx-auto">
        <div className=" text-center  mb-10">
          <div>
            <h2 className="section-title">
              Daily Updates
            </h2>
            <p className="section-subtitle">
              Latest notifications, job alerts & announcements
            </p>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner size="lg" className="py-20" />
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {updates.map((u) => (
              <UpdateCard key={u.id} update={u} />
            ))}
          </div>
        )}

        <div className="text-center mt-8 ">
          <Link to="/updates" className="btn-primary">
            View All Updates <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
