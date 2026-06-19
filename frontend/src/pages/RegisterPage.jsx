import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/helpers";
import { Eye, EyeOff, Wifi, UserPlus, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/common/LoadingSpinner";

const perks = [
  "Track all your requests online",
  "Book PC slots in advance",
  "Upload documents securely",
  "Get status notifications",
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm_password) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const { confirm_password, ...data } = form;
      const user = await register(data);
      toast.success(
        `Welcome to Shaurya eServices, ${user.full_name.split(" ")[0]}!`,
      );
      navigate("/dashboard");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-900 via-brand-900 to-surface-800 flex items-center justify-center px-4 py-4">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-10 animate-slide-up">
        {/* Left panel */}
        <div className="hidden lg:flex flex-col justify-center">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-10">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-brand">
              <Wifi size={20} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-4 text-white font-display">
                Shaurya
              </span>
              <span className="text-xs leading-none text-brand-600 ">
                eServices
              </span>
            </div>
          </Link>
          <h1 className="text-4xl font-extrabold text-white font-display leading-tight mb-4">
            Your digital services,
            <br />
            <span className="text-brand-300">simplified.</span>
          </h1>
          <p className="text-surface-200 mb-8">
            Create a free account and manage all your cyber café needs from one
            dashboard.
          </p>
          <ul className="space-y-3">
            {perks.map((p) => (
              <li
                key={p}
                className="flex items-center gap-3 text-surface-200 text-sm"
              >
                <CheckCircle
                  size={16}
                  className="text-green-400 flex-shrink-0"
                />
                {p}
              </li>
            ))}
          </ul>
        </div>

        {/* Form */}
        <div>
          <div className="text-center mb-6 lg:hidden">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center">
                <Wifi size={18} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-4 text-white font-display">
                  Shaurya
                </span>
                <span className="text-xs leading-none text-brand-600 text-start">
                  eServices
                </span>
              </div>
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-brand-600 font-display">
                Create account
              </h2>
              <p className="text-surface-500 text-sm mt-1">
                Free forever. No credit card required.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  placeholder="Rahul Kumar"
                  required
                  className="input"
                />
              </div>

              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  className="input"
                />
              </div>

              <div>
                <label className="label">
                  Phone Number{" "}
                  <span className="text-surface-400 font-normal">
                    (optional)
                  </span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91 99999 99999"
                  className="input"
                />
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min 8 chars, 1 uppercase, 1 number"
                    required
                    className="input pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="label">Confirm Password</label>
                <input
                  type="password"
                  name="confirm_password"
                  value={form.confirm_password}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  required
                  className="input"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-3 text-base mt-2"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" /> Creating account…
                  </>
                ) : (
                  <>
                    <UserPlus size={16} /> Create Account
                  </>
                )}
              </button>
            </form>

            <div className="pt-5 border-t border-surface-100 text-center">
              <p className="text-sm text-surface-500">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-brand-600 font-semibold hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
