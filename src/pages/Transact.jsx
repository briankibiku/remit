import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import { useAuth } from "../context/AuthContext";
import { transactService } from "../services/partners";
import Swal from "sweetalert2";

const Transact = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { paymentMethods, wallet } = location.state || { paymentMethods: [], wallet: null };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [amount, setAmount] = useState("");
  const [transactionType, setTransactionType] = useState("deposit");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!wallet) {
      navigate("/wallet");
    }
  }, [wallet, navigate]);

  const formatAmount = (value) => {
    if (!value) return "";
    const numericValue = value.replace(/[^\d.]/g, "");
    const parts = numericValue.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    if (parts[1]) parts[1] = parts[1].substring(0, 2);
    return parts.join(".");
  };

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
      title: "Success!",
      text: message,
      timer: 3000,
      toast: true,
      position: "top-end",
      showConfirmButton: false,
    });
  };

  const handleMethodClick = (method) => {
    setSelectedMethod(method);
    setIsModalOpen(true);
  };

  const initiateTransaction = async () => {
    const cleanAmount = amount.replace(/,/g, "");
    if (!selectedMethod || !cleanAmount || isNaN(cleanAmount) || Number(cleanAmount) <= 0) return;

    try {
      setLoading(true);
      
      const payload = {
        type: transactionType,
        walletId: wallet.id,
        idempotencyKey: crypto.randomUUID(),
        paymentCode: selectedMethod.paymentCode,
        paymentType: selectedMethod.paymentType,
        currency: wallet.currency,
        amount: Number(cleanAmount).toFixed(0),
        additionalDetails: {
          phone: "700000000",
          phoneCode: "+254"
        },
        purposeCode: "expense_or_medical_reimbursement",
        redirectUrl: "https://propel.ke",
        sourceUrl: "https://transfi.com",
        headlessMode: false, 
      };

      await transactService(payload);
      setIsModalOpen(false);
      showSuccess(`${transactionType.charAt(0).toUpperCase() + transactionType.slice(1)} request initiated successfully!`);
      navigate("/wallet");
    } catch (err) {
      showError(err || `${transactionType} failed`);
    } finally {
      setLoading(false);
    }
  };

  if (!wallet) return null;

  return (
    <div className="flex min-h-screen bg-secondary-50 selection:bg-primary-100 selection:text-primary-900">
      <Sidebar />

      <main className="flex-1 overflow-y-auto relative">
        <div className="max-w-7xl mx-auto px-6 py-10 lg:px-12 min-h-[calc(100vh-80px)] flex flex-col">
          <div className="mb-8 md:mb-12 animate-fade-in">
            <button 
              onClick={() => navigate("/wallet")}
              className="flex items-center gap-2 text-secondary-500 font-bold hover:text-primary-600 transition-colors mb-4 md:mb-6 group text-sm md:text-base"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Wallets
            </button>
            <h1 className="text-2xl md:text-4xl font-black text-secondary-900 tracking-tight">Select Payment Method</h1>
            <p className="text-sm md:text-base text-secondary-500 font-medium mt-2">
              Choose how you want to transact for your <span className="text-primary-600 font-bold">{wallet.currency} wallet</span>.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {paymentMethods.map((method) => (
              <button
                key={method.paymentCode}
                onClick={() => handleMethodClick(method)}
                className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border-2 border-transparent hover:border-primary-600 transition-all flex flex-col items-center text-center gap-4 md:gap-6 shadow-sm hover:shadow-2xl hover:-translate-y-2 active:scale-95 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-primary-50 rounded-full -mr-12 -mt-12 md:-mr-16 md:-mt-16 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="w-16 h-16 md:w-24 md:h-24 bg-secondary-50 rounded-2xl md:rounded-3xl flex items-center justify-center p-3 md:p-4 group-hover:bg-white transition-colors relative z-10 shadow-inner">
                  <img src={method.logoUrl} alt={method.name} className="w-full h-full object-contain" />
                </div>
                
                <div className="relative z-10">
                  <h3 className="text-xl md:text-2xl font-black text-secondary-900 mb-1 md:mb-2">{method.name}</h3>
                  <div className="px-3 py-1 md:px-4 md:py-1.5 bg-secondary-50 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest text-secondary-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors inline-block">
                    {method.paymentType.replace('_', ' ')}
                  </div>
                  <div className="mt-3 md:mt-4 flex flex-col gap-0.5 md:gap-1">
                    <p className="text-[10px] md:text-xs text-secondary-400 font-medium uppercase tracking-widest">Limits</p>
                    <p className="text-sm md:text-base font-bold text-secondary-900">
                      {wallet.currency} {Number(method.minAmount).toLocaleString()} - {Number(method.maxAmount).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-2 md:mt-4 w-full py-3 md:py-4 bg-secondary-900 text-white rounded-xl md:rounded-2xl font-bold md:opacity-0 md:group-hover:opacity-100 transition-all md:translate-y-4 md:group-hover:translate-y-0 text-sm">
                  Select Method
                </div>
              </button>
            ))}
          </div>

          {paymentMethods.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center py-20 animate-fade-in">
              <div className="w-20 h-20 bg-secondary-100 rounded-3xl flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-secondary-900 mb-2">No Payment Methods Found</h2>
              <p className="text-secondary-500 font-medium">We couldn't find any available payment methods for this currency.</p>
              <button 
                onClick={() => navigate("/wallet")}
                className="mt-8 px-8 py-3 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition-all"
              >
                Go Back
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Transaction Modal */}
      {isModalOpen && selectedMethod && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-secondary-900/60 backdrop-blur-md animate-fade-in"
            onClick={() => setIsModalOpen(false)}
          ></div>
          
          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up">
            <div className="p-8 sm:p-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-secondary-50 rounded-xl flex items-center justify-center p-1.5 shadow-sm">
                      <img src={selectedMethod.logoUrl} alt={selectedMethod.name} className="w-full h-full object-contain" />
                    </div>
                    <h2 className="text-2xl font-black text-secondary-900 tracking-tight">
                      {selectedMethod.name}
                    </h2>
                  </div>
                  <p className="text-secondary-500 font-medium">
                    Configure your {transactionType} details
                  </p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
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
                    Transaction Type
                  </label>
                  <div className="grid grid-cols-2 gap-4 p-1.5 bg-secondary-100 rounded-[1.5rem]">
                    <button
                      onClick={() => setTransactionType("deposit")}
                      className={`py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                        transactionType === "deposit" 
                          ? "bg-white text-secondary-900 shadow-sm" 
                          : "text-secondary-400 hover:text-secondary-600"
                      }`}
                    >
                      Deposit
                    </button>
                    <button
                      onClick={() => setTransactionType("withdraw")}
                      className={`py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                        transactionType === "withdraw" 
                          ? "bg-white text-secondary-900 shadow-sm" 
                          : "text-secondary-400 hover:text-secondary-600"
                      }`}
                    >
                      Withdraw
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-secondary-400 font-black uppercase tracking-widest text-[10px] mb-3 ml-2">
                    Amount ({wallet.currency})
                  </label>
                  <div className="relative">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-secondary-400">
                      {wallet.currency === 'KES' ? 'K' : wallet.currency === 'USD' ? '$' : '¤'}
                    </div>
                    <input 
                      type="text" 
                      placeholder="0.00"
                      className="w-full pl-16 pr-8 py-6 bg-secondary-50 border-2 border-transparent focus:border-primary-500 rounded-3xl text-3xl font-black text-secondary-900 focus:outline-none transition-all font-mono"
                      value={amount}
                      onChange={(e) => setAmount(formatAmount(e.target.value))}
                      autoFocus
                    />
                  </div>
                  <div className="mt-2 ml-2 flex justify-between items-center">
                    <p className="text-[10px] text-secondary-400 font-bold uppercase tracking-wider">
                      Min: {Number(selectedMethod.minAmount).toLocaleString()} | Max: {Number(selectedMethod.maxAmount).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border ${transactionType === 'deposit' ? 'bg-emerald-50/50 border-emerald-100 text-emerald-700' : 'bg-primary-50/50 border-primary-100 text-primary-700'}`}>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-[10px] font-bold leading-tight uppercase tracking-wider">
                      {transactionType === 'deposit' 
                        ? `Funds will be credited to your ${wallet.currency} vault via ${selectedMethod.name} upon verification.`
                        : `Funds will be transferred from your ${wallet.currency} vault to your ${selectedMethod.name} account.`}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={initiateTransaction}
                  disabled={!amount || isNaN(Number(amount.replace(/,/g, ""))) || Number(amount.replace(/,/g, "")) < selectedMethod.minAmount || Number(amount.replace(/,/g, "")) > selectedMethod.maxAmount}
                  className={`w-full py-5 text-white rounded-3xl font-black text-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl ${
                    transactionType === 'deposit' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' : 'bg-primary-600 hover:bg-primary-700 shadow-primary-500/20'
                  }`}
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    `Proceed to ${transactionType.charAt(0).toUpperCase() + transactionType.slice(1)}`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transact;
