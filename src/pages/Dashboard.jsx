import { useState, useEffect } from "react";
import Sidebar from "../components/layout/Sidebar";
import { useAuth } from "../context/AuthContext";
import { getTransfiBalance } from '../services/partners';


const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalCollectionsAmount, setTotalCollectionsAmount] = useState(0);
  const [currency, setCurrency] = useState('USD');
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Faking API response for now as per current logic

      
      // setTimeout(() => {
      //   setDashboardData({
      //     totalBalance: 3000000,
      //     ledgerBalance: 1500000,
      //     accountBalance: 1500000,
      //   });
      //   setLoading(false);
      // }, 800);
      // setError("");

      const response = await getTransfiBalance(currency); 
      const {
        totalCollectionsAmount,
        totalPayoutAmount,
        totalSettledAmount,
        totalUnsettledAmount,
        totalAvailablePrefundingBalance,
        totalPayoutFee,
        totalPayoutInTransitBalance,
        date
      } = response; 
      setTotalCollectionsAmount(totalPayoutInTransitBalance);
      setDashboardData({
        transfiBalance: totalPayoutAmount,
        totalBalance: totalCollectionsAmount,
        ledgerBalance: totalAvailablePrefundingBalance,
        accountBalance: totalSettledAmount,
      }); 
      setLoading(false);

    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard data");
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
              <h1 className="text-3xl font-extrabold text-secondary-900 tracking-tight">
                Welcome back, {user?.name || user?.email?.split("@")[0]}! 👋
              </h1>
              <p className="text-secondary-500 font-medium mt-1">
                Here's what's happening with your accounts today.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button className="px-5 py-2.5 bg-white border border-secondary-200 rounded-xl text-secondary-700 font-bold hover:bg-secondary-50 transition-all active:scale-95 shadow-sm">
                Download Report
              </button>
              <button className="px-5 py-2.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all active:scale-95 shadow-lg shadow-primary-500/20">
                Send Money
              </button>
            </div>
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
              <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-secondary-500 font-medium">
                Preparing your insights...
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-3xl mb-8 flex items-start gap-4 animate-slide-up">
              <div className="p-2 bg-red-100 rounded-xl">
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
              <div className="flex-1">
                <h3 className="font-bold text-lg">Communication error</h3>
                <p className="mt-1 font-medium">{error}</p>
                <button
                  onClick={fetchDashboardData}
                  className="mt-3 text-sm font-bold underline hover:translate-x-1 transition-transform inline-block"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {!loading && !error && dashboardData && (
            <div className="space-y-10 animate-fade-in">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Account Balance */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-secondary-100 hover:shadow-xl hover:-translate-y-1 transition-all group">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl transition-colors group-hover:bg-emerald-100">
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
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <span className="text-secondary-500 font-bold uppercase tracking-wider text-xs">
                      Available Funds
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-3xl font-extrabold text-secondary-900 tracking-tight">
                      ${Number(dashboardData.transfiBalance).toLocaleString()}
                    </span>
                    <span className="text-emerald-500 text-sm font-bold mt-2 flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                          clipRule="evenodd"
                        />
                      </svg>
                      +12.5% this month
                    </span>
                  </div>
                </div>

                {/* Ledger Balance */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-secondary-100 hover:shadow-xl hover:-translate-y-1 transition-all group">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl transition-colors group-hover:bg-amber-100">
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
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <span className="text-secondary-500 font-bold uppercase tracking-wider text-xs">
                      Pending Clearing
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-3xl font-extrabold text-secondary-900 tracking-tight">
                      ${Number(dashboardData.ledgerBalance).toLocaleString()}
                    </span>
                    <span className="text-secondary-400 text-sm font-medium mt-2">
                      Est. clearing 24-48h
                    </span>
                  </div>
                </div>

                {/* Total Balance */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-secondary-100 hover:shadow-xl hover:-translate-y-1 transition-all group lg:col-span-1">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-primary-50 text-primary-600 rounded-2xl transition-colors group-hover:bg-primary-100">
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
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                    </div>
                    <span className="text-secondary-500 font-bold uppercase tracking-wider text-xs">
                      Total Assets
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-3xl font-extrabold text-secondary-900 tracking-tight">
                      ${Number(dashboardData.totalBalance).toLocaleString()}
                    </span>
                    <span className="text-primary-600 text-sm font-bold mt-2">
                      Master Account
                    </span>
                  </div>
                </div>
              </div>

              {/* Activity Section */}
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-secondary-100 overflow-hidden">
                <div className="p-8 border-b border-secondary-100 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-secondary-900">
                    Recent Transactions
                  </h2>
                  <button className="text-primary-600 font-bold hover:text-primary-700 text-sm transition-colors">
                    View All
                  </button>
                </div>
                <div className="p-8">
                  {/* Transaction List Placeholder */}
                  <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-secondary-50 rounded-2xl flex items-center justify-center text-secondary-500 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
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
                          <div>
                            <p className="font-bold text-secondary-900">
                              Transfer to Alice Johnson
                            </p>
                            <p className="text-secondary-400 text-sm font-medium">
                              Oct 24, 2023 · 2:30 PM
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-extrabold text-secondary-900">
                            -$450.00
                          </p>
                          <p className="text-emerald-500 text-xs font-bold uppercase tracking-widest mt-0.5">
                            Completed
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
