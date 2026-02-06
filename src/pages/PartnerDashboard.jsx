import { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import { useAuth } from '../context/AuthContext';
import { getTransfiBalance, getCurrentPartner, getPartnerWallets } from '../services/partners';

const PartnerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [partnerProfile, setPartnerProfile] = useState(null);
  const [partnerWallets, setPartnerWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState('USD');
  const [error, setError] = useState('');
  const { user } = useAuth();
  
  useEffect(() => {
    const initDashboard = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchDashboardData(),
          fetchPartnerProfile(),
          // fetchWallets()
        ]);
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initDashboard();
  }, [user, currency]);

  const fetchPartnerProfile = async () => {
    try {
      const response = await getCurrentPartner();
      if (response && response.user) {
        setPartnerProfile(response.user);
      }
    } catch (err) {
      console.error('Error fetching partner profile:', err);
    }
  };

  const fetchWallets = async () => {
    try {
      const wallets = await getPartnerWallets();
      console.log('Partner Wallets:', wallets);
      setPartnerWallets(wallets);
    } catch (err) {
      console.error('Error fetching partner wallets:', err);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const response = await getTransfiBalance(currency); 
      console.log('Dashboard Data:', response);
      setDashboardData({
        transfiBalance: response.totalPayoutAmount,
        totalBalance: response.totalCollectionsAmount,
        ledgerBalance: response.totalAvailablePrefundingBalance,
        accountBalance: response.totalSettledAmount,
        payoutInTransit: response.totalPayoutInTransitBalance
      }); 
    } catch (err) {
      setError(err || 'Failed to load dashboard data');
    }
  };
  
  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto pb-12">
        <div className="p-6 lg:p-10 pt-24 lg:pt-10 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
            <div className="animate-fade-in">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                Welcome back, {partnerProfile?.firstName || partnerProfile?.companyName || 'Partner'}! 👋
              </h1>
              <p className="text-slate-500 font-medium mt-2 text-lg">
                Here's what's happening with your remittance account today.
              </p>
            </div>
            
            {partnerProfile && (
              <div className="flex items-center gap-4 p-4 bg-white rounded-3xl border border-slate-200 shadow-sm animate-fade-in">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center font-bold text-xl">
                  {partnerProfile.companyName?.charAt(0) || 'P'}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">{partnerProfile.companyName}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{partnerProfile.role?.replace('_', ' ')}</p>
                </div>
              </div>
            )}
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
              <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="mt-6 text-slate-500 font-bold text-lg">Synchronizing dashboard...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-2 border-red-100 p-8 rounded-[2.5rem] flex flex-col items-center text-center animate-fade-in">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Oops! Something went wrong</h3>
              <p className="text-slate-500 font-medium mb-8 max-w-md">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all active:scale-95"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="space-y-10 animate-slide-up">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group">
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mb-2">Available Balance</h3>
                  <p className="text-3xl font-black text-slate-900 tracking-tight">
                    {currency} {Number(dashboardData?.transfiBalance || 0).toLocaleString()}
                  </p>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group">
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mb-2">Ledger Balance</h3>
                  <p className="text-3xl font-black text-slate-900 tracking-tight">
                    {currency} {Number(dashboardData?.ledgerBalance || 0).toLocaleString()}
                  </p>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group">
                  <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <h3 className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mb-2">Total Collections</h3>
                  <p className="text-3xl font-black text-slate-900 tracking-tight">
                    {currency} {Number(dashboardData?.totalBalance || 0).toLocaleString()}
                  </p>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group">
                  <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </div>
                  <h3 className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mb-2">In Transit</h3>
                  <p className="text-3xl font-black text-slate-900 tracking-tight">
                    {currency} {Number(dashboardData?.payoutInTransit || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Bottom Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-10 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Recent Activity</h2>
                    <button className="text-indigo-600 font-bold text-sm hover:underline">View All</button>
                  </div>
                  <div className="p-20 text-center">
                    <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-slate-400 font-bold text-lg">No recent activity to show</p>
                    <p className="text-slate-400 text-sm mt-1">Transaction history will appear here once you start processing.</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400 mb-8 flex items-center gap-2">
                       <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                       Business Context
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Company Registered</p>
                        <p className="text-xl font-bold">{partnerProfile?.companyName || 'Not Verified'}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Business ID</p>
                        <p className="text-xl font-bold">{partnerProfile?.businessIdNumber || 'Pending'}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Primary Email</p>
                        <p className="text-lg font-bold truncate">{partnerProfile?.email}</p>
                      </div>
                    </div>
                    <div className="mt-10 pt-8 border-t border-white/10">
                       <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest ${partnerProfile?.verified ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                         <span className={`w-2 h-2 rounded-full ${partnerProfile?.verified ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                         {partnerProfile?.verified ? 'Account Verified' : 'Verification Pending'}
                       </div>
                    </div>
                  </div>

                  <div className="bg-indigo-600 rounded-[3rem] p-10 text-white shadow-xl shadow-indigo-200">
                    <h4 className="text-xl font-black mb-4 flex items-center gap-3">
                      Need help?
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </h4>
                    <p className="text-indigo-100 font-medium text-sm leading-relaxed mb-6">
                      Our developer support team is available 24/7 to assist with your integration.
                    </p>
                    <button className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-sm hover:bg-indigo-50 transition-all active:scale-95">
                      Contact Support
                    </button>
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

export default PartnerDashboard;