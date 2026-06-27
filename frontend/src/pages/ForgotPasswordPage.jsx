import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Wifi,
  Mail,
  ShieldCheck,
  KeyRound,
  ArrowLeft,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { getErrorMessage } from "../utils/helpers";

const STEPS = [
  { id: 1, label: "Enter Email", icon: Mail },
  { id: 2, label: "Verify OTP", icon: ShieldCheck },
  { id: 3, label: "New Password", icon: KeyRound },
];

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((step, idx) => {
        const done = current > step.id;
        const active = current === step.id;
        const Icon = step.icon;
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                  done
                    ? "bg-green-500 border-green-500"
                    : active
                      ? "bg-brand-600 border-brand-600"
                      : "bg-white border-surface-300"
                }`}
              >
                {done ? (
                  <CheckCircle size={17} className="text-white" />
                ) : (
                  <Icon
                    size={15}
                    className={active ? "text-white" : "text-surface-400"}
                  />
                )}
              </div>
              <p
                className={`text-xs mt-1.5 font-medium whitespace-nowrap ${
                  active
                    ? "text-brand-600"
                    : done
                      ? "text-green-600"
                      : "text-surface-400"
                }`}
              >
                {step.label}
              </p>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`w-12 h-0.5 mx-1 mb-5 transition-all ${done ? "bg-green-400" : "bg-surface-200"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function StepEmail({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/api/auth/forgot-password", { email });
      toast.success("OTP sent! Check your inbox.");
      onSuccess(email);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center mb-2">
        <h2 className="text-xl font-bold text-surface-500 font-display">
          Forgot your password?
        </h2>
        <p className="text-surface-400 text-sm mt-1.5">
          Enter your registered email. 
        </p>
      </div>

      <div>
        <label className="label">Email Address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoFocus
          className="input"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full justify-center py-3"
      >
        {loading ? (
          <>
            <LoadingSpinner size="sm" /> Sending OTP…
          </>
        ) : (
          "Send OTP"
        )}
      </button>
    </form>
  );
}

function StepOTP({ email, onSuccess, onBack }) {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleDigit = (idx, val) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[idx] = digit;
    setDigits(next);
    if (digit && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
    e.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otp = digits.join("");
    if (otp.length < 6) {
      toast.error("Enter the full 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/api/auth/verify-otp", { email, otp });
      toast.success("OTP verified!");
      onSuccess(res.data.data.reset_token);
    } catch (err) {
      toast.error(getErrorMessage(err));
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post("/api/auth/forgot-password", { email });
      toast.success("New OTP sent!");
      setCountdown(60);
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setResending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-2">
        <h2 className="text-xl font-bold text-surface-500 font-display">
          Check your inbox
        </h2>
        <p className="text-surface-400 text-sm mt-1.5">
          We sent a 6-digit OTP to
        </p>
        <p className="font-semibold text-surface-400 text-sm">{email}</p>
      </div>

      <div>
        <label className="label text-center block">Enter OTP</label>
        <div className="flex gap-2.5 justify-center" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleDigit(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              autoFocus={i === 0}
              className={`w-11 h-12 text-center text-xl font-bold border-2 rounded-xl outline-none transition-all
                ${d ? "border-brand-500 bg-brand-50 text-brand-700" : "border-surface-300 bg-white text-surface-900"}
                focus:border-brand-500 focus:bg-brand-50`}
            />
          ))}
        </div>
        <p className="text-xs text-surface-400 text-center mt-2">
          You can also paste the OTP directly
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full justify-center py-3"
      >
        {loading ? (
          <>
            <LoadingSpinner size="sm" /> Verifying…
          </>
        ) : (
          "Verify OTP"
        )}
      </button>

      <div className="text-center">
        {countdown > 0 ? (
          <p className="text-sm text-surface-400">
            Resend OTP in{" "}
            <span className="font-semibold text-surface-700">{countdown}s</span>
          </p>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors disabled:opacity-50"
          >
            {resending ? (
              <>
                <LoadingSpinner size="sm" /> Sending…
              </>
            ) : (
              <>
                <RefreshCw size={13} /> Resend OTP
              </>
            )}
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-xs text-surface-400 hover:text-surface-600 mx-auto transition-colors"
      >
        <ArrowLeft size={12} /> Wrong email? Go back
      </button>
    </form>
  );
}

function StepNewPassword({ resetToken, onSuccess }) {
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [show, setShow] = useState({ password: false, confirm: false });
  const [loading, setLoad] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const strength = (() => {
    const p = form.password;
    if (!p) return null;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[a-z]/.test(p)) score++;
    if (/\d/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  })();

  const strengthLabel = [
    "",
    "Very Weak",
    "Weak",
    "Fair",
    "Strong",
    "Very Strong",
  ][strength || 0];
  const strengthColor = [
    "",
    "bg-red-500",
    "bg-orange-400",
    "bg-amber-400",
    "bg-green-400",
    "bg-green-600",
  ][strength || 0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setLoad(true);
    try {
      await api.post("/api/auth/reset-password", {
        reset_token: resetToken,
        new_password: form.password,
      });
      onSuccess();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoad(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center mb-2">
        <h2 className="text-xl font-bold text-surface-500 font-display">
          Set new password
        </h2>
        <p className="text-surface-400 text-sm mt-1.5">
          Choose a strong password you haven't used before.
        </p>
      </div>

      <div>
        <label className="label">New Password</label>
        <div className="relative">
          <input
            type={show.password ? "text" : "password"}
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Min 8 chars, uppercase & number"
            required
            autoFocus
            className="input pr-10"
          />
          <button
            type="button"
            onClick={() => setShow((s) => ({ ...s, password: !s.password }))}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
          >
            {show.password ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {form.password && (
          <div className="mt-2">
            <div className="flex gap-1 mb-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : "bg-surface-200"}`}
                />
              ))}
            </div>
            <p
              className={`text-xs font-medium ${strengthColor.replace("bg-", "text-")}`}
            >
              {strengthLabel}
            </p>
          </div>
        )}
      </div>

      <div>
        <label className="label">Confirm Password</label>
        <div className="relative">
          <input
            type={show.confirm ? "text" : "password"}
            name="confirm"
            value={form.confirm}
            onChange={handleChange}
            placeholder="Re-enter your new password"
            required
            className={`input pr-10 ${
              form.confirm && form.password !== form.confirm
                ? "border-red-400 focus:ring-red-400"
                : form.confirm && form.password === form.confirm
                  ? "border-green-400 focus:ring-green-400"
                  : ""
            }`}
          />
          <button
            type="button"
            onClick={() => setShow((s) => ({ ...s, confirm: !s.confirm }))}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
          >
            {show.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {form.confirm && form.password !== form.confirm && (
          <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || (form.confirm && form.password !== form.confirm)}
        className="btn-primary w-full justify-center py-3"
      >
        {loading ? (
          <>
            <LoadingSpinner size="sm" /> Resetting…
          </>
        ) : (
          "Reset Password"
        )}
      </button>
    </form>
  );
}

function StepSuccess() {
  const navigate = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => navigate("/login"), 4000);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="text-center py-4">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle size={34} className="text-green-500" />
      </div>
      <h2 className="text-xl font-bold text-surface-900 font-display mb-2">
        Password Reset!
      </h2>
      <p className="text-surface-500 text-sm mb-6">
        Your password has been updated successfully. Redirecting to login in a
        moment…
      </p>
      <Link to="/login" className="btn-primary justify-center w-full py-3">
        Go to Login
      </Link>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-900 via-brand-900 to-surface-800 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-slide-up">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {step < 4 && <StepIndicator current={step} />}

          {step === 1 && (
            <StepEmail
              onSuccess={(e) => {
                setEmail(e);
                setStep(2);
              }}
            />
          )}
          {step === 2 && (
            <StepOTP
              email={email}
              onSuccess={(token) => {
                setResetToken(token);
                setStep(3);
              }}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <StepNewPassword
              resetToken={resetToken}
              onSuccess={() => setStep(4)}
            />
          )}
          {step === 4 && <StepSuccess />}

          {step < 4 && (
            <div className="mt-6 pt-5 border-t border-surface-100 text-center">
              <Link
                to="/login"
                className="text-sm text-surface-500 hover:text-brand-600 transition-colors"
              >
                ← Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
