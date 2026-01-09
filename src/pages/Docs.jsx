

import { useState, useEffect } from 'react';
import DocsSidebar from "../components/layout/DocsSidebar";
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getTransfiBalance } from '../services/partners';

const Docs = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalCollectionsAmount, setTotalCollectionsAmount] = useState(0);
  const [currency, setCurrency] = useState('USD');
  const [error, setError] = useState('');
  const { user } = useAuth();
  
  useEffect(() => {
    fetchDashboardData();
  }, []);

  
   
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
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
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      <DocsSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">
              Welcome, Partner! 👋
            </h1>

            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="mt-4 text-gray-600">Loading dashboard...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start gap-3">
                <svg
                  className="w-5 h-5 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="flex-1">
                  <p>{error}</p>
                  <button
                    onClick={fetchDashboardData}
                    className="mt-2 text-sm underline hover:no-underline"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {!loading && !error && dashboardData && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <svg
                        className="w-6 h-6 text-green-500"
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
                    <div>
                      <h3 className="text-gray-500 text-sm font-semibold mb-1">
                        Transfi Balance{" "}
                      </h3>
                      <p className="text-3xl font-bold text-gray-800">
                        {Number(dashboardData.transfiBalance).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <svg
                        className="w-6 h-6 text-purple-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-gray-500 text-sm font-semibold mb-1">
                        Ledger Balance{" "}
                      </h3>
                      <p className="text-3xl font-bold text-gray-800">
                        {Number(dashboardData.ledgerBalance).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <svg
                        className="w-6 h-6 text-blue-500"
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
                    <div>
                      <h3 className="text-gray-500 text-sm font-semibold mb-1">
                        Total Payout Amount
                      </h3>
                      <p className="text-3xl font-bold text-gray-800">
                        {Number(dashboardData.totalBalance).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <svg
                        className="w-6 h-6 text-blue-500"
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
                    <div>
                      <h3 className="text-gray-500 text-sm font-semibold mb-1">
                        Total Balance
                      </h3>
                      <p className="text-3xl font-bold text-gray-800">
                        {Number(dashboardData.totalBalance).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                Recent Activity
              </h2>
              <p className="text-gray-600">
                This is where you would display recent user activity, charts, or
                other relevant information.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Docs;