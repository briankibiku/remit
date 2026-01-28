import { useState, useEffect, useRef } from "react";
import Sidebar from "../components/layout/Sidebar";
import { useAuth } from "../context/AuthContext";
import { createWalletService, getWalletService, getTransactions, transactService, getPaymentMethods, getAllTransactions } from "../services/partners";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const Wallet = () => {
  const [wallets, setWallets] = useState([]);
  const [transactions, setTransactions] = useState({}); // { [walletId]: [...] }
  const [loading, setLoading] = useState(true);
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

  // Custom Dropdown State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  const { user } = useAuth();

  const currencies = [
    { code: "KES", name: "Kenyan Shilling", flag: "🇰🇪" },
    { code: "USD", name: "United States Dollar", flag: "🇺🇸" },
    { code: "EUR", name: "Euro", flag: "🇪🇺" },
    { code: "GBP", name: "British Pound", flag: "🇬🇧" },
    { code: "NGN", name: "Nigerian Naira", flag: "🇳🇬" },
    { code: "UGX", name: "Ugandan Shilling", flag: "🇺🇬" },
    { code: "GHS", name: "Ghanaian Cedi", flag: "🇬🇭" },
    { code: "TZS", name: "Tanzanian Shilling", flag: "🇹🇿" },
    { code: "RWF", name: "Rwandan Franc", flag: "🇷🇼" },
    { code: "ZAR", name: "South African Rand", flag: "🇿🇦" },
    { code: "CAD", name: "Canadian Dollar", flag: "🇨🇦" },
    { code: "AUD", name: "Australian Dollar", flag: "🇦🇺" },
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
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const fetchWallets = async () => {
    try {
      setLoading(true);
      const data = await getWalletService();
      const walletList = Array.isArray(data) ? data : [];
      setWallets(walletList);

      // Fetch transactions for all wallets in parallel (much faster)
      const txPromises = walletList.map(async (wallet) => {
        try {
          const txData = await getTransactions(wallet.id);
          return { id: wallet.id, data: Array.isArray(txData) ? txData : [] };
        } catch (err) {
          console.error(`Failed to fetch transactions for wallet ${wallet.id}`, err);
          return { id: wallet.id, data: [] };
        }
      });

      const results = await Promise.all(txPromises);
      const txMap = {};
      results.forEach(res => {
        txMap[res.id] = res.data;
      });
      
      setTransactions(txMap);
      setLoading(false);
    } catch (err) {
      showError("Fetching wallets failed. Please check your connection.");
      setLoading(false);
    }
  };

  const openTransactModal = (wallet, type) => {
    setActiveTransactWallet(wallet);
    setTransactAmount("");
    setTransactionType(type);
    setIsTransactModalOpen(true);
  };

  const initiateTransaction = async () => {
    const cleanAmount = transactAmount.replace(/,/g, "");
    if (!activeTransactWallet || !cleanAmount || isNaN(cleanAmount)) return;

    try {
      setLoading(true);
      
      const payload2 = {
        "type": transactionType,
        "walletId":activeTransactWallet.id,
        "idempotencyKey": crypto.randomUUID(),
        "paymentCode": "sepa_bank",
        "amount": Number(cleanAmount).toFixed(0),
        "purposeCode": "expense_or_medical_reimbursement",
        "sourceUrl": "https://transfi.com",
        "currency": "EUR",
        "paymentType": "bank_transfer",
        "additionalDetails": {
            "iban": "DE89370400440532013000",
            "bic": "4734892994",
            "street": "Nairobi",
            "city": "Nairobi",
            "postalCode": "4394992"
        }
      }; 
      const response = await transactService(payload2);
      setIsTransactModalOpen(false);
      console.log(`${transactionType} Response:`, response);
      
      showSuccess(`${transactionType.charAt(0).toUpperCase() + transactionType.slice(1)} request initiated successfully!`);
      await fetchWallets();
      
      setLoading(false);
      setActiveTransactWallet(null);
      setTransactAmount("");
    } catch (err) {
      showError(err || `${transactionType} failed`);
      setLoading(false);
    }
  };

  const handleTransact = async (wallet) => {
    try {
      setLoading(true);
      const data = await getPaymentMethods(wallet.currency, "deposit");
      navigate("/transact", { 
        state: { 
          paymentMethods: data.paymentMethods,
          wallet: wallet
        } 
      });
    } catch (err) {
      showError(err || "Failed to initiate transaction");
    } finally {
      setLoading(false);
    }
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
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                )}
              </h1>
              <p className="text-secondary-500 font-medium mt-1">
                Manage your funds and track activities across all currencies.
              </p>
            </div>

            <div className="flex items-center gap-3"> 
              {wallets.length > 0 && (
                  <button 
                    onClick={() => { setIsModalOpen(true); setCreateError(""); setSearchTerm(""); }}
                    className="px-6 py-3 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition-all active:scale-95 shadow-lg shadow-primary-500/20 flex items-center gap-2"
                  >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Wallet
                  </button>
              )}
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
          <div className="flex flex-row flex-nowrap gap-4 sm:gap-8 overflow-x-auto pb-8 snap-x snap-mandatory no-scrollbar scroll-smooth">
              {wallets.map((wallet) => (
                <div key={wallet.id} className="min-w-[calc(100%-40px)] sm:min-w-[450px] md:min-w-[600px] snap-center">
                  {/* Wallets component  */}
                  <div className="bg-secondary-900 rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 mb-6 sm:mb-10 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-primary-600/20 rounded-full blur-[80px] sm:blur-[100px] -mr-32 -mt-32 sm:-mr-48 sm:-mt-48"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-64 sm:h-64 bg-emerald-600/10 rounded-full blur-[60px] sm:blur-[80px] -ml-24 -mb-24 sm:-ml-32 sm:-mb-32"></div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8 sm:gap-10">
                        <div>
                          <span className="text-secondary-400 font-black uppercase tracking-[0.2em] text-[10px] sm:text-xs">
                            Total Combined Portfolio
                          </span>
                          <h2 className="text-4xl sm:text-6xl font-black mt-2 sm:mt-4 tracking-tighter flex items-center gap-3 sm:gap-4">
                            <span className="text-primary-400 text-2xl sm:text-4xl">{wallet.currency}</span>
                            {Number(wallet.balance).toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                  })}
                          </h2>
                          <div className="flex items-center gap-4 sm:gap-6 mt-6 sm:mt-10">
                            <div className="flex flex-col">
                              <span className="text-secondary-400 text-[10px] font-black uppercase tracking-widest">
                                Available
                              </span>
                              <span className="text-emerald-400 font-bold text-base sm:text-lg">
                                {wallet.currency}{Number(wallet.balance).toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                  })}
                              </span>
                            </div>
                            <div className="w-px h-8 sm:h-10 bg-secondary-700/50"></div>
                            <div className="flex flex-col">
                              <span className="text-secondary-400 text-[10px] font-black uppercase tracking-widest">
                                In Transit
                              </span>
                              <span className="text-amber-400 font-bold text-base sm:text-lg">
                              {wallet.currency}{Number(wallet.balance).toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                  })}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-end gap-6">
                          <div className="flex flex-col items-start md:items-end order-2 md:order-1 text-left md:text-right">
                            <p className="text-white font-black uppercase tracking-widest text-[10px] sm:text-xs">
                              Secure Vault
                            </p>
                            <p className="text-secondary-400 text-[10px] font-medium mt-1">
                              256-bit AES Encryption
                            </p>
                          </div>
                          
                          <button 
                            onClick={() => handleTransact(wallet)}
                            className="bg-primary-600 text-white p-3 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl font-bold hover:bg-primary-700 transition-all active:scale-95 shadow-lg shadow-primary-500/20 flex items-center gap-2 order-1 md:order-2"
                          >
                            <span className="hidden sm:inline">Transact</span>
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </button>
                        </div>
                    </div>
                  </div>

                  {/* Transactions Table */}
                  <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 border border-secondary-100 shadow-sm flex flex-col min-h-[300px] sm:min-h-[400px]">
                    <div className="flex items-center justify-between mb-6 sm:mb-8">
                      <h3 className="font-bold text-secondary-900 tracking-tight text-sm sm:text-base">Recent Activity</h3>
                      <button className="text-[10px] sm:text-xs font-black text-primary-600 uppercase tracking-widest hover:text-primary-700 transition-colors">
                        View All
                      </button>
                    </div>
                    
                    <div className="flex-1 overflow-x-auto">
                      <table className="w-full text-left min-w-[400px] sm:min-w-0">
                        <thead>
                          <tr className="border-b border-secondary-50">
                            <th className="pb-4 text-[10px] font-black text-secondary-400 uppercase tracking-widest w-1/2">Transaction Info</th>
                            <th className="pb-4 text-[10px] font-black text-secondary-400 uppercase tracking-widest text-right">Amount</th>
                            <th className="pb-4 text-[10px] font-black text-secondary-400 uppercase tracking-widest text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary-50">
                          {transactions[wallet.id]?.length > 0 ? (
                            transactions[wallet.id].slice(0, 10).map((tx, idx) => (
                              <tr key={tx.id || idx} className="group hover:bg-secondary-50/50 transition-colors">
                                <td className="py-4">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${tx.type === 'DEPOSIT' ? 'bg-emerald-50 text-emerald-600' : 'bg-primary-50 text-primary-600'}`}>
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tx.type === 'DEPOSIT' ? "M19 14l-7 7m0 0l-7-7m7 7V3" : "M5 10l7-7m0 0l7 7m-7-7v18"} />
                                      </svg>
                                    </div>
                                    <div className="truncate">
                                      <p className="text-xs font-bold text-secondary-900 truncate">{tx.description || tx.type || 'Transaction'}</p>
                                      <p className="text-[10px] text-secondary-400 font-medium">{new Date(tx.createdAt).toLocaleDateString()}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 text-right">
                                  <p className={`text-xs font-black ${tx.type === 'DEPOSIT' ? 'text-emerald-600' : 'text-secondary-900'}`}>
                                    {tx.type === 'DEPOSIT' ? '+' : '-'}{wallet.currency} {Number(tx.amount || 0).toLocaleString()}
                                  </p>
                                </td>
                                <td className="py-4 text-right">
                                  <span className={`text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-tighter ${
                                    tx.status === 'SUCCESS' || tx.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 
                                    tx.status === 'FAILED' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                                  }`}>
                                    {tx.status || 'PENDING'}
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="3" className="py-20 text-center">
                                <div className="flex flex-col items-center">
                                  <svg className="w-8 h-8 text-secondary-200 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  <p className="text-xs font-medium text-secondary-400">No transactions recorded yet.</p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ))}
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
      {/* Generic Transaction Modal */}
      {isTransactModalOpen && activeTransactWallet && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-secondary-900/60 backdrop-blur-md animate-fade-in"
            onClick={() => setIsTransactModalOpen(false)}
          ></div>
          
          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up">
            <div className="p-8 sm:p-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className={`text-2xl font-black tracking-tight ${transactionType === 'deposit' ? 'text-emerald-600' : 'text-primary-600'}`}>
                    {transactionType === 'deposit' ? 'Fund Wallet' : 'Withdraw Funds'}
                  </h2>
                  <p className="text-secondary-500 font-medium mt-1">
                    Enter amount for {activeTransactWallet.currency}
                  </p>
                </div>
                <button 
                  onClick={() => setIsTransactModalOpen(false)}
                  className="p-2 hover:bg-secondary-100 rounded-full transition-colors text-secondary-400"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-secondary-400 font-black uppercase tracking-widest text-[10px] mb-3 ml-2">
                    Amount ({activeTransactWallet.currency})
                  </label>
                  <div className="relative">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-secondary-400">
                      {activeTransactWallet.currency === 'USD' ? '$' : activeTransactWallet.currency === 'KES' ? 'K' : '¤'}
                    </div>
                    <input 
                      type="text" 
                      placeholder="0.00"
                      className={`w-full pl-16 pr-8 py-6 bg-secondary-50 border-2 rounded-3xl text-3xl font-black text-secondary-900 focus:outline-none transition-all font-mono ${
                        transactionType === 'deposit' ? 'focus:border-emerald-500 focus:ring-emerald-500/10' : 'focus:border-primary-500 focus:ring-primary-500/10'
                      }`}
                      value={transactAmount}
                      onChange={(e) => setTransactAmount(formatAmount(e.target.value))}
                      autoFocus
                    />
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border ${transactionType === 'deposit' ? 'bg-emerald-50/50 border-emerald-100 text-emerald-700' : 'bg-primary-50/50 border-primary-100 text-primary-700'}`}>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-[10px] font-bold leading-tight uppercase tracking-wider">
                      {transactionType === 'deposit' 
                        ? `Funds will be credited to your ${activeTransactWallet.currency} vault upon verification.`
                        : `Funds will be transferred from your ${activeTransactWallet.currency} vault to your receiving account.`}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={initiateTransaction}
                  disabled={!transactAmount || isNaN(Number(transactAmount.replace(/,/g, ""))) || Number(transactAmount.replace(/,/g, "")) <= 0}
                  className={`w-full py-5 text-white rounded-3xl font-black text-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl ${
                    transactionType === 'deposit' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' : 'bg-primary-600 hover:bg-primary-700 shadow-primary-500/20'
                  }`}
                >
                  Proceed to {transactionType === 'deposit' ? 'Deposit' : 'Withdraw'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default Wallet;
