import { useState, useEffect, useRef } from "react";
import Sidebar from "../components/layout/Sidebar";
import { useAuth } from "../context/AuthContext";
import { createWalletService, getWalletService, getTransactions, transactService, getPaymentMethods, getAllTransactions, getPaymentSession } from "../services/partners";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const Wallet = () => {
  const [wallets, setWallets] = useState([]);
  const [activeWallet, setActiveWallet] = useState(null);
  const [transactions, setTransactions] = useState([]); // Transactions for active wallet
  const [loading, setLoading] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const navigate = useNavigate();
  
  // Modal & Creation States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("KES");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  
  // Transaction States
  const [isTransactModalOpen, setIsTransactModalOpen] = useState(false);
  const [activeTransactWallet, setActiveTransactWallet] = useState(null);
  const [transactAmount, setTransactAmount] = useState("");
  const [transactionType, setTransactionType] = useState("deposit"); // "deposit" or "withdraw"
  const [transactStep, setTransactStep] = useState("methods"); // "methods" or "details"
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [fetchingMethods, setFetchingMethods] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [additionalData, setAdditionalData] = useState({});
  const [isPolling, setIsPolling] = useState(false);

  // Custom Dropdown State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const switcherRef = useRef(null);
  

  const { user } = useAuth();

  console.log(user);
  console.log(user?.email);
  console.log(user?.phone);
  console.log('========================================');

  const currencies = [
    { code: "KES", name: "Kenyan Shilling", flag: "🇰🇪" },
    { code: "USD", name: "United States Dollar", flag: "🇺🇸" },
    { code: "EUR", name: "Euro", flag: "🇪🇺" },
    { code: "AUD", name: "Australian Dollar", flag: "🇦🇺" },
    { code: "GBP", name: "British Pound", flag: "🇬🇧" },
    { code: "TZS", name: "Tanzanian Shilling", flag: "🇹🇿" },
    // { code: "NGN", name: "Nigerian Naira", flag: "🇳🇬" },
    // { code: "UGX", name: "Ugandan Shilling", flag: "🇺🇬" },
    // { code: "GHS", name: "Ghanaian Cedi", flag: "🇬🇭" },
    // { code: "RWF", name: "Rwandan Franc", flag: "🇷🇼" },
    // { code: "ZAR", name: "South African Rand", flag: "🇿🇦" },
    // { code: "CAD", name: "Canadian Dollar", flag: "🇨🇦" },
  ];

  const filteredCurrencies = currencies.filter(c => 
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatAmount = (value) => {
    if (!value) return "";
    // Remove all non-numeric characters except for the decimal point
    const numericValue = value.replace(/[^\d.]/g, "");
    const parts = numericValue.split(".");
    // Format the integer part with commas
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    // Limit to 2 decimal places
    if (parts[1]) parts[1] = parts[1].substring(0, 2);
    return parts.join(".");
  };

  const showError = (message) => {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: message,
      timer: 4000,
      timerProgressBar: true,
      showConfirmButton: false,
      showCloseButton: true,
      toast: true,
      position: "top-end",
      background: "#fff",
      color: "#ef4444",
      customClass: {
        popup: "rounded-3xl border border-red-100 shadow-2xl",
      }
    });
  };

  const showSuccess = (message) => {
    Swal.fire({
      icon: "success",
      title: "Success!",
      text: message,
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false,
      showCloseButton: true,
      toast: true,
      position: "top-end",
      background: "#fff",
      color: "#10b981",
      customClass: {
        popup: "rounded-3xl border border-emerald-100 shadow-2xl",
      }
    });
  };

  useEffect(() => {
    fetchWallets();
    
    // Close dropdown on outside click
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (switcherRef.current && !switcherRef.current.contains(event.target)) {
        setIsSwitcherOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchWalletTransactions = async (walletId) => {
    try {
      setLoadingTransactions(true);
      const txData = await getTransactions(walletId);
      setTransactions(Array.isArray(txData) ? txData : []);
      setLoadingTransactions(false);
    } catch (err) {
      console.error(`Failed to fetch transactions for wallet ${walletId}`, err);
      setTransactions([]);
      setLoadingTransactions(false);
    }
  };

  const handleCreateWallet = async () => {
    try {
      setIsCreating(true);
      setCreateError("");
      await createWalletService(selectedCurrency);
      await fetchWallets(); // Refresh list after creation
      setIsCreating(false);
      setIsModalOpen(false);
      showSuccess(`Successfully created ${selectedCurrency} wallet!`);
    } catch (err) {
      setCreateError("Failed to create wallet. Please try again.");
      setIsCreating(false);
      showError(err || "Wallet creation failed");
    }
  };

  const fetchWallets = async (autoSelectId = null) => {
    try {
      setLoading(true);
      const data = await getWalletService();
      const walletList = Array.isArray(data) ? data : [];
      setWallets(walletList);

      if (walletList.length > 0) {
        // Select either requested wallet, previously active wallet, or first one
        const toSelect = autoSelectId 
          ? walletList.find(w => w.id === autoSelectId) 
          : activeWallet 
            ? walletList.find(w => w.id === activeWallet.id) || walletList[0]
            : walletList[0];
            
        setActiveWallet(toSelect);
        await fetchWalletTransactions(toSelect.id);
      }
      
      setLoading(false);
    } catch (err) {
      showError("Fetching wallets failed. Please check your connection.");
      setLoading(false);
    }
  };

  const handleSwitchWallet = async (wallet) => {
    setActiveWallet(wallet);
    setIsSwitcherOpen(false);
    await fetchWalletTransactions(wallet.id);
  };

  const handleTransact = (wallet) => {
    navigate("/transact", { 
      state: { 
        wallet: wallet
      } 
    });
  };

  const EmptyState = () => (
    <div className="flex flex-col h-full animate-fade-in relative z-10">
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 lg:p-16">
        <div className="w-24 h-24 bg-secondary-100 rounded-[2rem] flex items-center justify-center mb-8 shadow-inner relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary-600/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
          <svg
            className="w-10 h-10 text-secondary-400 group-hover:text-primary-600 transition-colors z-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
        <h2 className="text-3xl font-black text-secondary-900 tracking-tight mb-4">
          No Wallets Found
        </h2>
        <p className="max-w-md text-secondary-500 font-medium leading-relaxed mb-10">
          It looks like you haven't created a digital wallet yet. Establish your first secure vault to start managing assets.
        </p>
        
        <button 
          onClick={() => { setIsModalOpen(true); setCreateError(""); setSearchTerm(""); }}
          className="px-8 py-4 bg-primary-600 text-white rounded-[1.5rem] font-bold hover:bg-primary-700 transition-all active:scale-95 shadow-xl shadow-primary-500/25 flex items-center gap-3"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create Your First Wallet
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-secondary-50 selection:bg-primary-100 selection:text-primary-900">
      <Sidebar />

      <main className="flex-1 overflow-y-auto relative">
        <div className="max-w-7xl mx-auto px-6 py-10 lg:px-12 min-h-[calc(100vh-80px)] flex flex-col">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6 animate-fade-in relative z-20">
            <div>
              <h1 className="text-3xl font-extrabold text-secondary-900 tracking-tight flex items-center gap-3">
                Digital Wallets
                {wallets.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                    {wallets.length > 1 && (
                      <span className="text-xs font-bold text-secondary-400 bg-secondary-100 px-3 py-1 rounded-full border border-secondary-200 uppercase tracking-tighter">
                        +{wallets.length - 1} other {wallets.length - 1 === 1 ? 'vault' : 'vaults'}
                      </span>
                    )}
                  </div>
                )}
              </h1>
              <p className="text-secondary-500 font-medium mt-1">
                Manage your funds and track activities across all currencies.
              </p>
            </div>

            <div className="flex items-center gap-4"> 
              {wallets.length > 1 && (
                <div className="relative" ref={switcherRef}>
                  <button 
                    onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
                    className="flex items-center gap-3 px-5 py-3 bg-white border-2 border-secondary-100 rounded-2xl font-bold text-secondary-900 hover:border-primary-500 transition-all shadow-sm group"
                  >
                    <span className="text-xl">
                      {currencies.find(c => c.code === activeWallet?.currency)?.flag || "💰"}
                    </span>
                    <span className="hidden sm:inline">{activeWallet?.currency} Wallet</span>
                    <svg className={`w-4 h-4 text-secondary-400 group-hover:text-primary-600 transition-transform duration-300 ${isSwitcherOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isSwitcherOpen && (
                    <div className="absolute top-full right-0 mt-3 w-64 bg-white border border-secondary-100 rounded-[2rem] shadow-2xl z-50 overflow-hidden animate-fade-in py-2">
                      <p className="px-5 py-2 text-[10px] font-black text-secondary-400 uppercase tracking-widest border-b border-secondary-50 mb-2">Switch Account</p>
                      <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                        {wallets.map((w) => (
                          <button
                            key={w.id}
                            onClick={() => handleSwitchWallet(w)}
                            className={`w-full flex items-center justify-between px-5 py-4 hover:bg-secondary-50 transition-colors ${activeWallet?.id === w.id ? 'bg-primary-50/50' : ''}`}
                          >
                            <div className="flex items-center gap-4">
                              <span className="text-2xl">{currencies.find(c => c.code === w.currency)?.flag || "💰"}</span>
                              <div className="text-left">
                                <p className="font-bold text-secondary-900 leading-none">{w.currency}</p>
                                <p className="text-[10px] text-secondary-400 font-medium mt-1">Bal: {Number(w.balance).toLocaleString()}</p>
                              </div>
                            </div>
                            {activeWallet?.id === w.id && (
                              <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button 
                onClick={() => { setIsModalOpen(true); setCreateError(""); setSearchTerm(""); }}
                className="px-6 py-3 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition-all active:scale-95 shadow-lg shadow-primary-500/20 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="hidden sm:inline">New Wallet</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center flex-1 py-10 animate-fade-in">
              <div className="w-16 h-16 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
              <p className="mt-6 text-secondary-500 font-bold tracking-tight uppercase text-xs">
                Syncing Wallets & Recent Activity...
              </p>
            </div>
          ) : wallets.length === 0 ? (
            <EmptyState />
          ) : (
          <div className="flex flex-col gap-10 animate-fade-in">
              {activeWallet && (
                <>
                  {/* Active Wallet Card - Vertical Stacking */}
                  <div className="w-full">
                    <div className="bg-secondary-900 rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-10 text-white relative overflow-hidden shadow-2xl group transition-all duration-500 hover:shadow-primary-600/10">
                      <div className="absolute top-0 right-0 w-80 h-80 sm:w-[500px] sm:h-[500px] bg-primary-600/30 rounded-full blur-[100px] sm:blur-[150px] -mr-40 -mt-40 transition-transform duration-700 group-hover:scale-110"></div>
                      <div className="absolute bottom-0 left-0 w-64 h-64 sm:w-[400px] sm:h-[400px] bg-emerald-600/10 rounded-full blur-[80px] sm:blur-[120px] -ml-32 -mb-32"></div>

                      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8 sm:gap-12">
                        <div className="max-w-xl">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-xl flex items-center justify-center text-2xl shadow-inner border border-white/10">
                              {currencies.find(c => c.code === activeWallet.currency)?.flag || "💰"}
                            </div>
                            <div>
                               <p className="text-secondary-400 font-black uppercase tracking-[0.25em] text-[10px]">
                                 Active Secure Vault
                               </p>
                               <div className="flex items-center gap-2 mt-0.5">
                                  <span className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse"></span>
                                  <span className="text-[9px] font-bold text-emerald-400/80 uppercase tracking-widest">System Online</span>
                               </div>
                            </div>
                          </div>

                          <span className="text-secondary-500 font-bold uppercase tracking-[0.2em] text-[10px] block mb-2">
                             Available Balance
                          </span>
                          <h2 className="text-3xl sm:text-5xl font-black tracking-tightest flex items-baseline gap-3 sm:gap-4">
                            <span className="text-primary-500 text-xl sm:text-3xl">{activeWallet.currency}</span>
                            {Number(activeWallet.balance).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                            })}
                          </h2>

                          <div className="flex items-center gap-6 sm:gap-10 mt-8 pt-8 border-t border-white/5">
                            <div className="flex flex-col">
                              <span className="text-secondary-500 text-[9px] font-black uppercase tracking-widest mb-1">
                                Market Value
                              </span>
                              <span className="text-emerald-400 font-bold text-base sm:text-xl">
                                {activeWallet.currency} {Number(activeWallet.balance).toLocaleString()}
                              </span>
                            </div>
                            <div className="w-px h-10 bg-white/10"></div>
                            <div className="flex flex-col">
                              <span className="text-secondary-500 text-[9px] font-black uppercase tracking-widest mb-1">
                                Status
                              </span>
                              <span className="text-amber-400 font-bold text-base sm:text-xl">
                                Verified
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-end gap-6 bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                          <div className="hidden sm:block text-right mb-2">
                            <p className="text-white font-black uppercase tracking-[0.2em] text-[10px]">
                              Vault ID
                            </p>
                            <p className="text-secondary-400 text-[9px] font-mono mt-0.5 uppercase">
                              {activeWallet.id.split('-')[0]}...{activeWallet.id.split('-').pop()}
                            </p>
                          </div>
                          
                          <button 
                            onClick={() => handleTransact(activeWallet)}
                            className="bg-primary-600 text-white px-8 py-3.5 rounded-xl font-black text-base hover:bg-primary-700 transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-primary-600/30 flex items-center gap-3 w-full justify-center group"
                          >
                            <span>Transact</span>
                            <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Transactions Table - Always Below */}
                  <div className="bg-white rounded-[2.5rem] sm:rounded-[3.5rem] p-8 sm:p-12 border border-secondary-100 shadow-sm flex flex-col min-h-[500px]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
                      <div>
                        <h3 className="font-black text-secondary-900 tracking-tight text-2xl">Recent Activity</h3>
                        <p className="text-secondary-500 font-medium mt-1">Transaction history for your {activeWallet.currency} vault</p>
                      </div>
                      <div className="flex items-center gap-3">
                         <button className="px-6 py-3 text-xs font-black text-primary-600 bg-primary-50 rounded-xl uppercase tracking-widest hover:bg-primary-100 transition-colors">
                           Export CSV
                         </button>
                         <button className="px-6 py-3 text-xs font-black text-white bg-secondary-900 rounded-xl uppercase tracking-widest hover:bg-black transition-colors">
                           View Statement
                         </button>
                      </div>
                    </div>
                    
                    <div className="flex-1 overflow-x-auto">
                      {loadingTransactions ? (
                        <div className="h-full min-h-[300px] flex flex-col items-center justify-center py-20">
                           <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
                           <p className="mt-6 text-secondary-400 font-bold uppercase tracking-widest text-[10px]">Syncing transactions...</p>
                        </div>
                      ) : (
                        <table className="w-full text-left min-w-[600px]">
                          <thead>
                            <tr className="border-b border-secondary-50">
                              <th className="pb-6 text-[11px] font-black text-secondary-400 uppercase tracking-widest">Transaction Info</th>
                              <th className="pb-6 text-center text-[11px] font-black text-secondary-400 uppercase tracking-widest">Date</th>
                              <th className="pb-6 text-right text-[11px] font-black text-secondary-400 uppercase tracking-widest">Amount</th>
                              <th className="pb-6 text-right text-[11px] font-black text-secondary-400 uppercase tracking-widest">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-secondary-50">
                            {transactions.length > 0 ? (
                              transactions.slice(0, 15).map((tx, idx) => (
                                <tr key={tx.id || idx} className="group hover:bg-secondary-50/50 transition-all duration-300">
                                  <td className="py-6">
                                    <div className="flex items-center gap-5">
                                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                                        tx.type === 'DEPOSIT' 
                                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                                          : 'bg-primary-50 text-primary-600 border border-primary-100'
                                      }`}>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={tx.type === 'DEPOSIT' ? "M19 14l-7 7m0 0l-7-7m7 7V3" : "M5 10l7-7m0 0l7 7m-7-7v18"} />
                                        </svg>
                                      </div>
                                      <div className="truncate">
                                        <p className="text-sm font-bold text-secondary-900 truncate group-hover:text-primary-600 transition-colors">
                                          {tx.description || tx.type || 'System Transaction'}
                                        </p>
                                        <p className="text-[10px] text-secondary-400 font-black uppercase tracking-widest mt-1">
                                          REF-{(tx.id || '000').split('-')[0]} • {tx.type}
                                        </p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-6 text-center">
                                    <div className="inline-flex flex-col items-center">
                                       <p className="text-[11px] font-black text-secondary-900">
                                         {new Date(tx.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                       </p>
                                       <p className="text-[10px] text-secondary-400 font-medium">
                                         {new Date(tx.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                       </p>
                                    </div>
                                  </td>
                                  <td className="py-6 text-right">
                                    <p className={`text-sm sm:text-base font-black ${tx.type === 'DEPOSIT' ? 'text-emerald-600' : 'text-secondary-900'}`}>
                                      {tx.type === 'DEPOSIT' ? '+' : '-'}{activeWallet.currency} {Number(tx.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </p>
                                  </td>
                                  <td className="py-6 text-right">
                                    <span className={`text-[9px] font-black px-4 py-2 rounded-xl uppercase tracking-widest border transition-all ${
                                      tx.status === 'SUCCESS' || tx.status === 'COMPLETED' 
                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                        : tx.status === 'FAILED' 
                                          ? 'bg-red-50 text-red-600 border-red-100' 
                                          : 'bg-amber-50 text-amber-600 border-amber-100'
                                    }`}>
                                      {tx.status || 'PENDING'}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="4" className="py-32 text-center text-secondary-400">
                                  <div className="flex flex-col items-center">
                                    <div className="w-20 h-20 bg-secondary-50 border-2 border-dashed border-secondary-200 rounded-[2rem] flex items-center justify-center mb-6">
                                       <svg className="w-10 h-10 text-secondary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                       </svg>
                                    </div>
                                    <p className="text-sm font-black uppercase tracking-widest">No Activity Yet</p>
                                    <p className="text-secondary-400 text-xs mt-2">New transactions for your {activeWallet.currency} wallet will appear here.</p>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Create Wallet Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-secondary-900/60 backdrop-blur-md animate-fade-in"
            onClick={() => !isCreating && setIsModalOpen(false)}
          ></div>
          
          <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-visible animate-slide-up">
            <div className="p-8 sm:p-12">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h2 className="text-3xl font-black text-secondary-900 tracking-tight">New Wallet</h2>
                  <p className="text-secondary-500 font-medium mt-1">Choose a global currency</p>
                </div>
                <button 
                  disabled={isCreating}
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-secondary-100 rounded-full transition-colors text-secondary-400"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {createError && (
                <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center gap-3 animate-shake">
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm font-bold">{createError}</p>
                </div>
              )}

              {/* Enhanced Currency Selection with Dropdown */}
              <div className="relative mb-12" ref={dropdownRef}>
                <label className="block text-secondary-400 font-black uppercase tracking-widest text-[10px] mb-3 ml-2">
                  Select Currency
                </label>
                
                <div 
                  onClick={() => !isCreating && setIsDropdownOpen(!isDropdownOpen)}
                  className={`flex items-center justify-between p-6 rounded-3xl border-2 transition-all cursor-pointer ${
                    isDropdownOpen ? "border-primary-600 bg-primary-50/20" : "border-secondary-100 bg-secondary-50/30 hover:border-secondary-200"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center font-bold text-lg">
                      {currencies.find(c => c.code === selectedCurrency)?.flag || "💰"}
                    </div>
                    <div>
                      <p className="font-bold text-secondary-900">{selectedCurrency}</p>
                      <p className="text-secondary-500 text-xs font-medium">
                        {currencies.find(c => c.code === selectedCurrency)?.name}
                      </p>
                    </div>
                  </div>
                  <svg className={`w-5 h-5 text-secondary-400 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-secondary-100 rounded-[2rem] shadow-2xl z-[110] overflow-hidden animate-fade-in max-h-[300px] flex flex-col">
                    <div className="p-4 border-b border-secondary-50">
                      <div className="relative">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input 
                          type="text" 
                          placeholder="Search currencies..."
                          className="w-full pl-10 pr-4 py-3 bg-secondary-50 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-600/20"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="overflow-y-auto py-2 custom-scrollbar">
                      {filteredCurrencies.length > 0 ? (
                        filteredCurrencies.map((c) => (
                          <div 
                            key={c.code}
                            onClick={() => {
                              setSelectedCurrency(c.code);
                              setIsDropdownOpen(false);
                            }}
                            className={`flex items-center justify-between px-6 py-4 hover:bg-secondary-50 cursor-pointer transition-colors ${
                              selectedCurrency === c.code ? "bg-primary-50/50" : ""
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <span className="text-xl">{c.flag}</span>
                              <div>
                                <p className="font-bold text-secondary-900 leading-none">{c.code}</p>
                                <p className="text-secondary-400 text-[10px] font-medium mt-1">{c.name}</p>
                              </div>
                            </div>
                            {selectedCurrency === c.code && (
                              <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-secondary-400">
                          <p className="font-medium">No currency found</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={handleCreateWallet}
                disabled={isCreating}
                className="w-full py-5 bg-secondary-900 text-white rounded-3xl font-black text-lg hover:bg-black transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl"
              >
                {isCreating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Establishing Vault...
                  </>
                ) : (
                  "Create Digital Wallet"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Unified Transaction Modal */}
      {isTransactModalOpen && activeTransactWallet && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-secondary-900/60 backdrop-blur-md animate-fade-in"
            onClick={() => !loading && setIsTransactModalOpen(false)}
          ></div>
          
          <div className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up">
            <div className="p-8 sm:p-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-black text-secondary-900 tracking-tight">
                      {transactStep === 'methods' ? 'Select Method' : transactionType === 'deposit' ? 'Add Funds' : 'Withdraw'}
                    </h2>
                    {transactStep === 'details' && selectedMethod && (
                      <span className="px-3 py-1 bg-primary-50 text-primary-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                        {selectedMethod.name}
                      </span>
                    )}
                  </div>
                  <p className="text-secondary-500 font-medium mt-1">
                    {transactStep === 'methods' 
                      ? `Available methods for your ${activeTransactWallet.currency} vault` 
                      : `Enter amount and details for your ${activeTransactWallet.currency} transaction`}
                  </p>
                </div>
                <button 
                  disabled={loading}
                  onClick={() => setIsTransactModalOpen(false)}
                  className="p-2 hover:bg-secondary-100 rounded-full transition-colors text-secondary-400 disabled:opacity-30"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Step 1: Methods Selection */}
              {transactStep === 'methods' && (
                <div className="space-y-6">
                  {/* Transaction Type Switcher */}
                  <div className="flex p-1 bg-secondary-50 rounded-2xl border border-secondary-100 mb-6">
                    <button
                      onClick={() => { setTransactionType("deposit"); fetchMethods(activeTransactWallet, "deposit"); }}
                      className={`flex-1 py-3 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                        transactionType === "deposit" ? "bg-white text-secondary-900 shadow-sm" : "text-secondary-400"
                      }`}
                    >
                      Deposit
                    </button>
                    <button
                      onClick={() => { setTransactionType("withdraw"); fetchMethods(activeTransactWallet, "withdraw"); }}
                      className={`flex-1 py-3 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                        transactionType === "withdraw" ? "bg-white text-secondary-900 shadow-sm" : "text-secondary-400"
                      }`}
                    >
                      Withdraw
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                    {fetchingMethods ? (
                      <div className="col-span-2 py-20 flex flex-col items-center justify-center">
                        <div className="w-10 h-10 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
                        <p className="mt-4 text-[10px] font-black text-secondary-400 uppercase tracking-[0.2em]">Syncing gateways...</p>
                      </div>
                    ) : paymentMethods.length > 0 ? (
                      paymentMethods.map((method) => (
                        <button
                          key={method.paymentCode}
                          onClick={() => handleMethodSelect(method)}
                          className="flex flex-col items-center p-6 bg-secondary-50 hover:bg-white border-2 border-transparent hover:border-primary-600 rounded-3xl transition-all group shadow-sm hover:shadow-xl relative overflow-hidden"
                        >
                          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center p-3 mb-4 shadow-inner ring-1 ring-secondary-100">
                             <img src={method.logoUrl} alt={method.name} className="w-full h-full object-contain" />
                          </div>
                          <span className="font-bold text-secondary-900 text-sm mb-1">{method.name}</span>
                          <span className="text-[8px] font-black text-secondary-400 uppercase tracking-widest">
                            {method.paymentType.replace('_', ' ')}
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="col-span-2 py-10 text-center">
                         <p className="text-secondary-400 font-bold">No methods available.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Details Entry */}
              {transactStep === 'details' && selectedMethod && (
                <div className="space-y-6 animate-fade-in">
                  <button 
                    onClick={() => setTransactStep('methods')}
                    className="flex items-center gap-2 text-primary-600 font-black text-[10px] uppercase tracking-widest hover:translate-x-[-4px] transition-transform mb-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                    Change Method
                  </button>

                  <div className="max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar space-y-6">
                    <div>
                      <label className="block text-secondary-400 font-black uppercase tracking-widest text-[10px] mb-3 ml-2">
                        Amount ({activeTransactWallet.currency})
                      </label>
                      <div className="relative">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-secondary-400">
                          {activeTransactWallet.currency === 'KES' ? 'K' : activeTransactWallet.currency === 'USD' ? '$' : '¤'}
                        </div>
                        <input 
                          type="text" 
                          placeholder="0.00"
                          className="w-full pl-16 pr-8 py-6 bg-secondary-50 border-2 border-transparent focus:border-primary-500 rounded-3xl text-3xl font-black text-secondary-900 focus:outline-none transition-all font-mono"
                          value={transactAmount}
                          onChange={(e) => setTransactAmount(formatAmount(e.target.value))}
                          autoFocus
                        />
                      </div>
                      <p className="mt-2 ml-2 text-[10px] text-secondary-400 font-bold">
                        Limit: {activeTransactWallet.currency} {Number(selectedMethod.minAmount).toLocaleString()} - {Number(selectedMethod.maxAmount).toLocaleString()}
                      </p>
                    </div>

                    {/* Dynamic Fields */}
                    {selectedMethod.additionalDetails && Object.entries(selectedMethod.additionalDetails).map(([key, schema]) => {
                      if (key === 'documents' || key === 'purpose') return null;
                      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                      
                      return (
                        <div key={key}>
                          <label className="block text-secondary-400 font-black uppercase tracking-widest text-[10px] mb-2 ml-2">
                            {label}
                          </label>
                          {schema.enum ? (
                            <select
                              value={additionalData[key] || ""}
                              onChange={(e) => handleAdditionalDataChange(key, e.target.value)}
                              className="w-full px-5 py-4 bg-secondary-50 border-2 border-transparent focus:border-primary-500 rounded-2xl text-sm font-bold text-secondary-900 focus:outline-none transition-all"
                            >
                              <option value="">Select {label}</option>
                              {schema.enum.map(opt => <option key={opt} value={opt}>{opt.replace(/_/g, ' ').toUpperCase()}</option>)}
                            </select>
                          ) : (
                            <input
                              type="text"
                              placeholder={`Enter ${label}`}
                              value={additionalData[key] || ""}
                              onChange={(e) => handleAdditionalDataChange(key, e.target.value)}
                              className="w-full px-5 py-4 bg-secondary-50 border-2 border-transparent focus:border-primary-500 rounded-2xl text-sm font-bold text-secondary-900 focus:outline-none transition-all"
                              maxLength={schema.max || schema.length}
                            />
                          )}
                        </div>
                      );
                    })}

                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3">
                      <svg className="w-5 h-5 text-emerald-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide leading-relaxed">
                        Secure 256-bit encrypted transaction. Funds will be settled directly to your vault upon gateway confirmation.
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={initiateTransaction}
                    disabled={loading || !transactAmount || Number(transactAmount.replace(/,/g, "")) < selectedMethod.minAmount}
                    className="w-full py-5 bg-secondary-900 text-white rounded-3xl font-black text-lg hover:bg-black transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>{isPolling ? "Verifying..." : "Processing..."}</span>
                      </>
                    ) : (
                      `Confirm ${transactionType === 'deposit' ? 'Deposit' : 'Withdrawal'}`
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default Wallet;


{/* <div className="w-full">
                    <div className="bg-secondary-900 rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-10 text-white relative overflow-hidden shadow-2xl group transition-all duration-500 hover:shadow-primary-600/10">
                      <div className="absolute top-0 right-0 w-80 h-80 sm:w-[500px] sm:h-[500px] bg-primary-600/30 rounded-full blur-[100px] sm:blur-[150px] -mr-40 -mt-40 transition-transform duration-700 group-hover:scale-110"></div>
                      <div className="absolute bottom-0 left-0 w-64 h-64 sm:w-[400px] sm:h-[400px] bg-emerald-600/10 rounded-full blur-[80px] sm:blur-[120px] -ml-32 -mb-32"></div>

                      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8 sm:gap-12">
                        <div className="max-w-xl">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-xl flex items-center justify-center text-2xl shadow-inner border border-white/10">
                              {currencies.find(c => c.code === activeWallet.currency)?.flag || "💰"}
                            </div>
                            <div>
                               <p className="text-secondary-400 font-black uppercase tracking-[0.25em] text-[10px]">
                                 Active Secure Vault
                               </p>
                               <div className="flex items-center gap-2 mt-0.5">
                                  <span className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse"></span>
                                  <span className="text-[9px] font-bold text-emerald-400/80 uppercase tracking-widest">System Online</span>
                               </div>
                            </div>
                          </div>

                          <span className="text-secondary-500 font-bold uppercase tracking-[0.2em] text-[10px] block mb-2">
                             Available Balance
                          </span>
                          <h2 className="text-3xl sm:text-5xl font-black tracking-tightest flex items-baseline gap-3 sm:gap-4">
                            <span className="text-primary-500 text-xl sm:text-3xl">{activeWallet.currency}</span>
                            {Number(activeWallet.balance).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                            })}
                          </h2>

                          <div className="flex items-center gap-6 sm:gap-10 mt-8 pt-8 border-t border-white/5">
                            <div className="flex flex-col">
                              <span className="text-secondary-500 text-[9px] font-black uppercase tracking-widest mb-1">
                                Market Value
                              </span>
                              <span className="text-emerald-400 font-bold text-base sm:text-xl">
                                {activeWallet.currency} {Number(activeWallet.balance).toLocaleString()}
                              </span>
                            </div>
                            <div className="w-px h-10 bg-white/10"></div>
                            <div className="flex flex-col">
                              <span className="text-secondary-500 text-[9px] font-black uppercase tracking-widest mb-1">
                                Status
                              </span>
                              <span className="text-amber-400 font-bold text-base sm:text-xl">
                                Verified
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-end gap-6 bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                          <div className="hidden sm:block text-right mb-2">
                            <p className="text-white font-black uppercase tracking-[0.2em] text-[10px]">
                              Vault ID
                            </p>
                            <p className="text-secondary-400 text-[9px] font-mono mt-0.5 uppercase">
                              {activeWallet.id.split('-')[0]}...{activeWallet.id.split('-').pop()}
                            </p>
                          </div>
                          
                          <button 
                            onClick={() => handleTransact(activeWallet)}
                            className="bg-primary-600 text-white px-8 py-3.5 rounded-xl font-black text-base hover:bg-primary-700 transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-primary-600/30 flex items-center gap-3 w-full justify-center group"
                          >
                            <span>Transact</span>
                            <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div> */}