import { Link } from "react-router-dom";

const Landing = () => {

  function getCurrentYear() {
    return new Date().getFullYear();
  }

  return (
    <div className="min-h-screen bg-white selection:bg-primary-100 selection:text-primary-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-xl z-50 border-b border-secondary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 duration-200">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <span className="text-2xl font-bold tracking-tight text-secondary-900">
                Remit
              </span>
            </Link>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-8">
              <Link
                to="/docs"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Docs
              </Link>
              <Link
                to="/login"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-44 pb-32 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-50 rounded-full blur-[120px] opacity-60"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-60"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-10 animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-primary-50 px-4 py-2 rounded-full border border-primary-100">
                <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
                <span className="text-primary-700 text-sm font-semibold tracking-wide uppercase">
                  New: Instant Transfers to 190+ Countries
                </span>
              </div>

              <h1 className="text-6xl sm:text-7xl font-extrabold text-secondary-900 leading-[1.1] tracking-tight">
                Send money <br />
                <span className="text-primary-600">worldwide</span> in seconds.
              </h1>

              <p className="text-xl text-secondary-600 leading-relaxed max-w-xl">
                Experience the fusion of speed and security. Move funds across
                borders with transparent rates and zero hidden fees.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-5">
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white px-10 py-4 rounded-full font-bold hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 group"
                >
                  <span>Get Started Free</span>
                  <svg
                    className="w-5 h-5 transition-transform group-hover:translate-x-1"
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
                </Link>

                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 bg-white border border-secondary-200 text-secondary-900 px-10 py-4 rounded-full font-bold hover:bg-secondary-50 transition-all hover:scale-105 active:scale-95"
                >
                  <svg
                    className="w-5 h-5 text-secondary-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span>Partner Login</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center gap-12 pt-6 border-t border-secondary-100">
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-secondary-900">
                    195+
                  </div>
                  <div className="text-sm font-medium text-secondary-500 uppercase tracking-wider">
                    Countries
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-secondary-900">
                    2M+
                  </div>
                  <div className="text-sm font-medium text-secondary-500 uppercase tracking-wider">
                    Happy Users
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-secondary-900">
                    $5B+
                  </div>
                  <div className="text-sm font-medium text-secondary-500 uppercase tracking-wider">
                    Processed
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Interactive Card */}
            <div
              className="lg:col-span-5 relative animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="relative z-10 bg-white rounded-3xl p-8 shadow-2xl border border-secondary-100 ring-1 ring-secondary-900/5 transition-transform hover:rotate-1 duration-500">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-secondary-500 uppercase tracking-wider">
                      You Send
                    </label>
                    <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-2xl border border-secondary-100 focus-within:ring-2 ring-primary-500/20 transition-all">
                      <div className="text-3xl font-bold text-secondary-900">
                        $1,000
                      </div>
                      <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-secondary-200">
                        <span className="font-bold">USD</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center -my-3 relative z-20">
                    <div className="bg-primary-600 rounded-full p-3 shadow-lg shadow-primary-500/40 text-white ring-4 ring-white transition-transform hover:scale-110 cursor-pointer">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                        />
                      </svg>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-secondary-500 uppercase tracking-wider">
                      They Receive
                    </label>
                    <div className="flex items-center justify-between p-4 bg-primary-50/50 rounded-2xl border border-primary-100/50">
                      <div className="text-3xl font-bold text-primary-700">
                        142,500
                      </div>
                      <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-primary-100">
                        <span className="font-bold">KES</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-secondary-50 border border-secondary-100 text-sm space-y-2 font-medium">
                    <div className="flex justify-between text-secondary-500">
                      <span>Exchange Rate</span>
                      <span className="text-secondary-900">
                        1 USD = 142.50 KES
                      </span>
                    </div>
                    <div className="flex justify-between text-secondary-500">
                      <span>Transfer Fee</span>
                      <span className="text-green-600 font-bold">$0.00</span>
                    </div>
                  </div>

                  <button className="w-full bg-secondary-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-lg active:scale-95">
                    <Link to="/login">Continue to Transfer</Link>
                  </button>
                </div>
              </div>

              {/* Decorative Blur */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-200 rounded-full blur-[80px] opacity-40 -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-secondary-50/50 border-y border-secondary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-4xl font-extrabold text-secondary-900 tracking-tight">
              Built for speed. <br />
              Secured for peace of mind.
            </h2>
            <p className="text-xl text-secondary-600 leading-relaxed">
              We've re-imagined international money transfers to be as simple as
              sending a text.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                title: "Lightning Fast",
                desc: "Deliver funds to your loved ones in a matter of seconds, not days.",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                ),
                color: "primary",
              },
              {
                title: "Bank-Level Security",
                desc: "Your data is encrypted with the same standards trusted by global financial institutions.",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                ),
                color: "green",
              },
              {
                title: "Total Transparency",
                desc: "What you see is what they get. No hidden charges or inflated exchange rates.",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                ),
                color: "blue",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group bg-white p-10 rounded-3xl shadow-sm border border-secondary-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
              >
                <div
                  className={`w-14 h-14 bg-${feature.color}-50 text-${feature.color}-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}
                >
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {feature.icon}
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-secondary-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-secondary-600 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto relative overflow-hidden bg-primary-600 rounded-[3rem] p-12 sm:p-20 text-center">
          {/* Abstract background for CTA */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-primary-500 rounded-full blur-[100px] opacity-40"></div>

          <div className="relative z-10 space-y-8">
            <h2 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
              Ready to transcend <br />
              boundaries?
            </h2>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto">
              Join 2 million users moving money with confidence. Create your
              free account in less than 2 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link
                to="/signup"
                className="bg-white text-primary-600 px-10 py-4 rounded-full font-bold hover:bg-primary-50 transition-all shadow-xl hover:scale-105 active:scale-95"
              >
                Create Account
              </Link>
              <Link
                to="/signup"
                className="bg-primary-700 text-white border border-primary-500 px-10 py-4 rounded-full font-bold hover:bg-primary-800 transition-all hover:scale-105 active:scale-95"
              >
                Become a Partner
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-secondary-100 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-12 gap-16 mb-20">
            <div className="md:col-span-4 space-y-6">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
                <span className="text-xl font-bold text-secondary-900 tracking-tight">
                  Remit
                </span>
              </Link>
              <p className="text-secondary-500 leading-relaxed">
                Empowering global communities with seamless, secure, and instant
                financial borders.
              </p>
              <div className="flex gap-4">
                {/* Social links placeholders */}
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 bg-secondary-50 rounded-full flex items-center justify-center hover:bg-primary-50 hover:text-primary-600 transition-colors cursor-pointer text-secondary-400"
                  >
                    <div className="w-5 h-5 bg-current rounded-sm opacity-20"></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-12">
              <div>
                <h4 className="font-bold text-secondary-900 mb-6 uppercase tracking-wider text-xs">
                  Product
                </h4>
                <ul className="space-y-4 text-secondary-500 font-medium">
                  <li>
                    <a
                      href="#"
                      className="hover:text-primary-600 transition-colors"
                    >
                      Personal
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-primary-600 transition-colors"
                    >
                      Business
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-primary-600 transition-colors"
                    >
                      Pricing
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-primary-600 transition-colors"
                    >
                      Mobile App
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-secondary-900 mb-6 uppercase tracking-wider text-xs">
                  Support
                </h4>
                <ul className="space-y-4 text-secondary-500 font-medium">
                  <li>
                    <a
                      href="#"
                      className="hover:text-primary-600 transition-colors"
                    >
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-primary-600 transition-colors"
                    >
                      Contact Us
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-primary-600 transition-colors"
                    >
                      Security
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-primary-600 transition-colors"
                    >
                      Status
                    </a>
                  </li>
                </ul>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <h4 className="font-bold text-secondary-900 mb-6 uppercase tracking-wider text-xs">
                  Legal
                </h4>
                <ul className="space-y-4 text-secondary-500 font-medium">
                  <li>
                    <a
                      href="#"
                      className="hover:text-primary-600 transition-colors"
                    >
                      Privacy
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-primary-600 transition-colors"
                    >
                      Terms
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-primary-600 transition-colors"
                    >
                      Cookie Policy
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-secondary-100 flex flex-col md:row items-center justify-between gap-6 text-sm font-medium text-secondary-400">
            <p>
              &copy; {getCurrentYear()} Remit. International money transfer
              redefined.
            </p>
            <div className="flex gap-8">
              <span>Made with ❤️ for the world.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
