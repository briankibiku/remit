import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPasswordService } from "../services/auth";
import Swal from "sweetalert2";

const ForgotPassword = () => {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const showError = (message) => {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: message,
      timer: 4000,
      toast: true,
      position: "top-end",
      showConfirmButton: false,
    });
  };

  const showSuccess = (message) => {
    Swal.fire({
      icon: "success",
      title: "Request Sent!",
      text: message,
      timer: 5000,
      toast: true,
      position: "top-end",
      showConfirmButton: false,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailOrPhone) return;

    try {
      setLoading(true);
      await forgotPasswordService(emailOrPhone);
      setSubmitted(true);
      showSuccess("Password reset instructions have been sent to your email/phone.");
    } catch (err) {
      showError(err || "Failed to initiate password reset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white sm:bg-secondary-50/50 px-4 py-12 selection:bg-primary-100 selection:text-primary-900">
      <div className="w-full max-w-[440px] animate-fade-in">
        {/* Brand/Logo */}
        <div className="flex flex-col items-center mb-10">
          <Link to="/" className="flex items-center gap-3 group mb-8">
            <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-200 shadow-lg shadow-primary-500/20">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
          </Link>
          <h1 className="text-2xl md:text-3xl font-extrabold text-secondary-900 tracking-tight">
            Reset Password
          </h1>
          <p className="text-sm md:text-base text-secondary-500 mt-2 font-medium text-center px-4">
            Enter your email or phone number and we'll send you a link to reset your password.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl sm:shadow-2xl sm:shadow-secondary-200/50 p-8 sm:p-10 border sm:border-secondary-100">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-secondary-500 uppercase tracking-widest ml-1">
                  Email or Phone
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-600">
                    <svg className="w-5 h-5 text-secondary-400 group-focus-within:text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    className="w-full pl-11 pr-4 py-4 bg-secondary-50 border border-secondary-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:bg-white transition-all font-medium text-secondary-900 placeholder:text-secondary-300"
                    placeholder="name@company.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !emailOrPhone}
                className="w-full bg-secondary-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-secondary-900/10 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Sending...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Send Reset Link
                    <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-secondary-900">Check your inbox</h3>
              <p className="text-secondary-500 font-medium pb-2">
                We've sent reset instructions to <span className="text-secondary-900 font-bold">{emailOrPhone}</span>.
              </p>
              <button 
                onClick={() => setSubmitted(false)}
                className="text-primary-600 font-bold hover:text-primary-700 transition-colors"
              >
                Didn't receive it? Try again
              </button>
            </div>
          )}
        </div>

        {/* Footer Link */}
        <p className="mt-10 text-center text-secondary-500 font-medium">
          Remember your password?{" "}
          <Link
            to="/login"
            className="text-primary-600 hover:text-primary-700 font-bold hover:underline underline-offset-4 transition-all"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
