import { useState, useEffect } from "react";
import Sidebar from "../components/layout/Sidebar";
import { useAuth } from "../context/AuthContext";

const Wallet = () => {
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      // Faking API response
      setTimeout(() => {
        setWalletData({
          totalBalance: 4500750.0,
          pendingTransactions: 120500.0,
          availableWithdrawal: 4380250.0,
          currency: "USD",
        });
        setLoading(false);
      }, 700);
      setError("");
    } catch (err) {
      setError("Failed to securely connect to your wallet.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-secondary-50 selection:bg-primary-100 selection:text-primary-900">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-10 lg:px-12">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6 animate-fade-in">
            <div>
              <h1 className="text-3xl font-extrabold text-secondary-900 tracking-tight flex items-center gap-3">
                Digital Wallet
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
              </h1>
              <p className="text-secondary-500 font-medium mt-1">
                Manage your funds, transfers, and digital assets.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button className="px-5 py-3 bg-white border border-secondary-200 rounded-2xl text-secondary-700 font-bold hover:bg-secondary-50 transition-all active:scale-95 shadow-sm flex items-center gap-2">
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
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Statement
              </button>
              <button className="px-6 py-3 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition-all active:scale-95 shadow-lg shadow-primary-500/20 flex items-center gap-2">
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Add Funds
              </button>
            </div>
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-32 animate-fade-in">
              <div className="w-16 h-16 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
              <p className="mt-6 text-secondary-500 font-bold tracking-tight uppercase text-xs">
                Accessing encrypted vault...
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-8 rounded-[2.5rem] mb-12 flex items-start gap-5 animate-slide-up">
              <div className="p-3 bg-red-100 rounded-2xl">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-extrabold text-xl tracking-tight">
                  Access Denied
                </h3>
                <p className="mt-1 font-medium text-red-500/80">{error}</p>
                <button
                  onClick={fetchWalletData}
                  className="mt-4 text-sm font-black underline hover:translate-x-1 transition-transform inline-block uppercase tracking-wider"
                >
                  Request Re-authentication
                </button>
              </div>
            </div>
          )}

          {!loading && !error && walletData && (
            <div className="space-y-10 animate-fade-in">
              {/* Primary Balance Hero */}
              <div className="bg-secondary-900 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/20 rounded-full blur-[100px] -mr-48 -mt-48"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-[80px] -ml-32 -mb-32"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-10">
                  <div>
                    <span className="text-secondary-400 font-black uppercase tracking-[0.2em] text-xs">
                      Total Combined Portfolio
                    </span>
                    <h2 className="text-6xl font-black mt-4 tracking-tighter flex items-center gap-4">
                      <span className="text-primary-400 text-4xl">$</span>
                      {walletData.totalBalance.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </h2>
                    <div className="flex items-center gap-6 mt-10">
                      <div className="flex flex-col">
                        <span className="text-secondary-400 text-[10px] font-black uppercase tracking-widest">
                          Available
                        </span>
                        <span className="text-emerald-400 font-bold text-lg">
                          ${walletData.availableWithdrawal.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-px h-10 bg-secondary-700/50"></div>
                      <div className="flex flex-col">
                        <span className="text-secondary-400 text-[10px] font-black uppercase tracking-widest">
                          In Transit
                        </span>
                        <span className="text-amber-400 font-bold text-lg">
                          ${walletData.pendingTransactions.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center md:items-end gap-6">
                    <div className="w-20 h-20 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl flex items-center justify-center">
                      <svg
                        className="w-10 h-10 text-primary-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-black uppercase tracking-widest text-xs">
                        Secure Vault
                      </p>
                      <p className="text-secondary-400 text-[10px] font-medium mt-1">
                        256-bit AES Encryption
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-10 rounded-[2.5rem] border border-secondary-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                  <div className="w-14 h-14 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                    <svg
                      className="w-7 h-7"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-black text-secondary-900 tracking-tight">
                    Internal Transfer
                  </h3>
                  <p className="text-secondary-500 font-medium mt-2 leading-relaxed">
                    Move funds instantly between your accounts and sub-wallets
                    without any network fees.
                  </p>
                  <button className="mt-8 font-black text-primary-600 uppercase tracking-widest text-xs flex items-center gap-2 group/btn">
                    Start Transfer
                    <svg
                      className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </button>
                </div>

                <div className="bg-white p-10 rounded-[2.5rem] border border-secondary-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                    <svg
                      className="w-7 h-7"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-black text-secondary-900 tracking-tight">
                    Withdraw Funds
                  </h3>
                  <p className="text-secondary-500 font-medium mt-2 leading-relaxed">
                    Liquidate your available balance to your linked bank account
                    or external crypto address.
                  </p>
                  <button className="mt-8 font-black text-emerald-600 uppercase tracking-widest text-xs flex items-center gap-2 group/btn">
                    Withdrawal Hub
                    <svg
                      className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Wallet;
