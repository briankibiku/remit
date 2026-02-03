import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { verify } from "../services/auth";
import { useAuth } from "../context/AuthContext";

const Verify = () => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const navigate = useNavigate();
  const { login: setAuthUser } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const messageParam = params.get("message");

    if (messageParam) {
      setMessage(messageParam); 
      const contacts = extractPhoneAndEmail(messageParam);
      if (contacts) {
        setPhone(contacts.phone);
        setEmail(contacts.email);
      }
    }
  }, []);

  const extractPhoneAndEmail = (sentence) => {
    // Regex to find phone (usually starts with 0 or +) and email
    const regex = /(\d{10,13}) and (\S+@\S+\.\S+)/;
    const matches = sentence.match(regex);
    if (matches) {
      return {
        phone: matches[1],
        email: matches[2],
      };
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log(email);
      console.log(phone);
      console.log( otp);
      console.log('==============================================');
      const userData = await verify(email, otp);
      if (userData?.message === "Registration successful") {
        navigate(`/dashboard?message=${encodeURIComponent(userData.message)}`);
      } else {
        setError("Verification failed. Please check your code.");
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Invalid verification code"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-secondary-50 px-6 selection:bg-primary-100">
      {/* Abstract Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-50 rounded-full blur-[120px] opacity-60 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-60"></div>
      </div>

      <div className="w-full max-w-md relative animate-fade-in">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-secondary-900 tracking-tight">
            Verify Identity
          </h1>
          <p className="text-secondary-500 font-medium mt-2 leading-relaxed">
            We've sent a verification code to <br />
            <span className="text-secondary-900 font-bold">
              {email || "your email and phone number"}
            </span>
          </p>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-secondary-100 animate-slide-up ring-1 ring-secondary-900/5">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl mb-8 flex items-center gap-3 animate-slide-up">
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-bold tracking-tight">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-secondary-400 text-xs font-black uppercase tracking-widest mb-3 ml-1">
                Security Code
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-secondary-400 group-focus-within:text-primary-600 transition-colors">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  maxLength="6"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/[^0-9]/g, ""))
                  }
                  placeholder="Enter 6-digit code"
                  className="w-full pl-14 pr-6 py-4 bg-secondary-50 border border-secondary-100 rounded-2xl text-secondary-900 font-bold placeholder:text-secondary-300 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:bg-white transition-all text-center tracking-[0.5em] text-lg"
                  required
                />
              </div>
              <p className="mt-4 text-center text-sm text-secondary-400 font-medium">
                Didn't receive the code?{" "}
                <button
                  type="button"
                  className="text-primary-600 font-bold hover:text-primary-700 underline-offset-4 hover:underline transition-all"
                >
                  Resend
                </button>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 4}
              className="group relative w-full bg-primary-600 text-white py-4 rounded-2xl font-bold hover:bg-primary-700 disabled:bg-secondary-200 disabled:text-secondary-400 disabled:cursor-not-allowed transition-all duration-200 shadow-xl shadow-primary-500/20 active:scale-[0.98] overflow-hidden"
            >
              <div className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Security Code</span>
                    <svg
                      className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </>
                )}
              </div>
            </button>
          </form>
        </div>

        <div className="mt-12 text-center flex items-center justify-center gap-2 text-secondary-400 text-sm font-medium">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          Two-factor authentication secured by REMIT.
        </div>
      </div>
    </div>
  );
};

export default Verify;
