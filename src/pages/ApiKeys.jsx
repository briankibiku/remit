import { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import { regenerateApiKey, regenerateWebhookSecret, getPartnerDetails, updateCallbackUrl, getCurrentPartner } from '../services/partners';
import { useAuth } from '../context/AuthContext';

const ApiKeys = () => {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('••••••••••••••••••••••••••••••••');
  const [clientId, setClientId] = useState('');
  const [partnerId, setPartnerId] = useState('');
  const [callbackUrl, setCallbackUrl] = useState('');
  const [loading, setLoading] = useState({ type: null, status: false });
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState({ field: null, status: false });
  
  // Modal states
  const [showConfirm, setShowConfirm] = useState({ show: false, action: null });
  const [showResult, setShowResult] = useState({ show: false, data: null, title: '', message: '' });

  useEffect(() => {
    const initData = async () => {
      const params = new URLSearchParams(window.location.search);
      const urlApiKey = params.get('apiKey');
      const urlClientId = params.get('clientId');
      const urlPartnerId = params.get('partnerId');

      if (urlPartnerId) {
        setPartnerId(urlPartnerId);
        setClientId(urlClientId || '');
        setApiKey(urlApiKey || '');
      } else {
        // Try to get from persisted profile first
        const persistedProfile = localStorage.getItem('partner_profile');
        console.log('Persisted Profile:', persistedProfile);
        if (persistedProfile) {
          const profile = JSON.parse(persistedProfile);
          if (profile?.partner?.id) {
            setPartnerId(profile.partner.id);
          }
        } else if (user?.sub) {
          // Fallback to fetching fresh profile
          // try {
          //   setFetching(true);
          //   const response = await getCurrentPartner();
          //   if (response?.user?.partner?.id) {
          //     setPartnerId(response.user.partner.id);
          //     fetchData(response.user.partner.id);
          //   }
          // } catch (err) {
          //   console.error('Error fetching partner context:', err);
          //   setError('Could not identify partner account.');
          // } finally {
          //   setFetching(false);
          // }
        }
      }
    };

    initData();
  }, [user]);


  const handleCopy = (text, field) => {
    if (!text || text.includes('•')) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied({ field, status: true });
      setTimeout(() => setCopied({ field: null, status: false }), 2000);
    });
  };

  const handleUpdateCallback = (e) => {
    e.preventDefault();
    if (!callbackUrl.trim()) return;
    setShowConfirm({ show: true, action: 'callback' });
  };

  const executeUpdateCallback = async () => {
    try {
      setLoading({ type: 'callback', status: true });
      setError('');
      setSuccess('');
      await updateCallbackUrl(callbackUrl);
      setSuccess('Callback URL updated successfully');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err || 'Failed to update callback URL');
    } finally {
      setLoading({ type: null, status: false });
    }
  };

  const onRegenerateClick = (action) => {
    if (!partnerId) {
      setError('Partner ID is missing. Cannot regenerate keys.');
      return;
    }
    setShowConfirm({ show: true, action });
  };

  const confirmAction = async () => {
    const action = showConfirm.action;
    setShowConfirm({ show: false, action: null });
    
    if (action === 'callback') {
      await executeUpdateCallback();
      return;
    }

    try {
      setLoading({ type: action, status: true });
      setError('');
      
      let data;
      if (action === 'apiKey') {
        data = await regenerateApiKey(partnerId);
        setApiKey(data.apiKey);
        if (data.clientId) setClientId(data.clientId);
        setShowResult({ 
          show: true, 
          data: data, // Pass entire object
          title: 'New API Credentials',
          message: data.message || 'API credentials regenerated successfully.'
        });
      } else {
        data = await regenerateWebhookSecret(partnerId);
        setWebhookSecret(data.webhookSecret);
        setShowResult({ 
          show: true, 
          data: data.webhookSecret, 
          title: 'New Webhook Secret',
          message: data.message || 'Webhook secret regenerated successfully.'
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || `Failed to regenerate ${action}`);
    } finally {
      setLoading({ type: null, status: false });
    }
  };

  return (
    <div className="flex min-h-screen bg-[#fcfdfe] selection:bg-indigo-100 selection:text-indigo-900">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-6xl mx-auto px-6 py-10 lg:px-12 pt-24 lg:pt-10">
          {/* Header Section */}
          <div className="mb-12 animate-fade-in group">
            <div className="flex items-center gap-3 mb-2">
              <span className="h-1 w-12 bg-indigo-600 rounded-full transition-all group-hover:w-20"></span>
              <span className="text-indigo-600 font-black text-xs uppercase tracking-widest">Developer Hub</span>
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter">
              API & Webhooks
            </h1>
            <p className="text-slate-500 font-medium mt-4 text-xl max-w-2xl leading-relaxed">
              Securely manage your integration credentials and event recovery endpoints.
            </p>
          </div>

          {(error || success || fetching) && (
            <div className={`mb-8 p-6 rounded-[2rem] flex items-center gap-4 animate-fade-in border ${
              fetching ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 
              success ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
              'bg-red-50 text-red-700 border-red-100'
            }`}>
              {fetching ? (
                <div className="w-6 h-6 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              ) : success ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              ) : (
                <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              <span className="font-bold text-lg">{fetching ? 'Loading credentials...' : error || success}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Key Cards */}
            <div className="lg:col-span-8 space-y-8">
              {/* API Key Card */}
              <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden group hover:border-indigo-300 transition-all duration-500 hover:shadow-xl hover:shadow-indigo-500/5">
                <div className="p-10 pb-6 flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-[1.5rem] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900">Live API Key</h2>
                      <p className="text-slate-400 font-bold text-sm uppercase tracking-wide">Production Environment</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => onRegenerateClick('apiKey')}
                    disabled={loading.status}
                    className="group/btn p-4 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all active:scale-90"
                    title="Regenerate API Key"
                  >
                    <svg className={`w-7 h-7 ${loading.type === 'apiKey' ? 'animate-spin' : 'group-hover/btn:rotate-180 transition-transform duration-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
                
                <div className="px-10 pb-10 space-y-6">
                  {/* Client Identifier Display */}
                  <div className="group/field">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-3 px-1">Client ID</label>
                    <div className="relative group/key">
                      <div className="w-full bg-slate-50 rounded-2xl p-5 pr-14 font-mono text-slate-900 text-lg break-all border-2 border-slate-100 shadow-inner group-hover/field:border-indigo-100 transition-colors">
                        {clientId || 'CLI-••••••••••••••••'}
                      </div>
                      {clientId && (
                        <button 
                          onClick={() => handleCopy(clientId, 'clientId_card')}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 text-slate-400 hover:text-indigo-600 transition-all active:scale-90"
                        >
                          {copied.field === 'clientId_card' ? (
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* API Key Display */}
                  <div className="group/field">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-3 px-1">API Key</label>
                    <div className="relative group/key">
                      <div className="w-full bg-slate-900 rounded-3xl p-7 pr-16 font-mono text-indigo-400 text-xl break-all border-4 border-slate-800 shadow-2xl">
                        {apiKey || '••••••••••••••••••••••••••••••••••••••••'}
                      </div>
                      {apiKey && (
                        <button 
                          onClick={() => handleCopy(apiKey, 'apiKey')}
                          className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 rounded-2xl transition-all active:scale-95 border border-white/5"
                        >
                          {copied.field === 'apiKey' ? (
                            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Webhook Secret Card */}
              <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden group hover:border-indigo-300 transition-all duration-500 hover:shadow-xl hover:shadow-indigo-500/5">
                <div className="p-10 pb-6 flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-[1.5rem] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900">Webhook Secret</h2>
                      <p className="text-slate-400 font-bold text-sm uppercase tracking-wide">Verification Secret</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => onRegenerateClick('webhook')}
                    disabled={loading.status}
                    className="group/btn p-4 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all active:scale-90"
                    title="Regenerate Webhook Secret"
                  >
                    <svg className={`w-7 h-7 ${loading.type === 'webhook' ? 'animate-spin' : 'group-hover/btn:rotate-180 transition-transform duration-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
                
                <div className="px-10 pb-10">
                  <div className="relative group/key">
                    <div className="w-full bg-slate-900 rounded-[2rem] p-8 pr-16 font-mono text-indigo-400 text-xl break-all border-4 border-slate-800 shadow-2xl">
                      {webhookSecret}
                    </div>
                    {webhookSecret && !webhookSecret.includes('•') && (
                      <button 
                        onClick={() => handleCopy(webhookSecret, 'webhook')}
                        className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 rounded-2xl transition-all active:scale-95 border border-white/5"
                      >
                        {copied.field === 'webhook' ? (
                          <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        ) : (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Register Callback Card */}
              <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden group hover:border-indigo-300 transition-all duration-500 hover:shadow-xl hover:shadow-indigo-500/5">
                <div className="p-10 pb-6 flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-[1.5rem] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.803a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.1-1.1" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900">Register Callback</h2>
                      <p className="text-slate-400 font-bold text-sm uppercase tracking-wide">Webhook Recovery URL</p>
                    </div>
                  </div>
                </div>
                
                <div className="px-10 pb-10">
                  <form onSubmit={handleUpdateCallback} className="space-y-6">
                    <div>
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-3 px-1">Callback URL</label>
                      <div className="flex gap-4">
                        <div className="flex-1 relative group/input">
                          <input
                            type="url"
                            value={callbackUrl}
                            onChange={(e) => setCallbackUrl(e.target.value)}
                            placeholder="https://your-server.com/webhooks"
                            className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] text-slate-900 font-bold placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all shadow-inner"
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={loading.type === 'callback'}
                          className="px-10 bg-slate-900 text-white rounded-[1.5rem] font-black hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 transition-all shadow-xl shadow-slate-200 active:scale-95 flex items-center justify-center gap-3 whitespace-nowrap"
                        >
                          {loading.type === 'callback' ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          Save Changes
                        </button>
                      </div>
                    </div>
                    <p className="px-2 text-slate-400 text-sm font-medium leading-relaxed italic">
                      Transactions and payment events will be POSTed to this URL as they occur.
                    </p>
                  </form>
                </div>
              </div>
            </div>

            {/* Right Column: Identifiers */}
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-indigo-500/20 transition-colors duration-700"></div>
                
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-indigo-400 mb-8 flex items-center gap-3">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                  Identifiers
                </h3>
                
                <div className="space-y-10">
                  <div className="group/item">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3 group-hover/item:text-indigo-400 transition-colors">Partner Identifier</label>
                    <div className="flex items-center justify-between gap-4">
                      <code className="text-xl font-bold text-white tracking-tight">{partnerId || 'PRT-••••'}</code>
                      <button onClick={() => handleCopy(partnerId, 'partnerId')} className="p-2 text-slate-500 hover:text-white transition-colors bg-white/5 rounded-xl">
                        {copied.field === 'partnerId' ? (
                          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="group/item">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3 group-hover/item:text-indigo-400 transition-colors">Client Identifier</label>
                    <div className="flex items-center justify-between gap-4">
                      <code className="text-xl font-bold text-white tracking-tight truncate max-w-[200px]">{clientId || 'CLI-••••'}</code>
                      <button onClick={() => handleCopy(clientId, 'clientId')} className="p-2 text-slate-500 hover:text-white transition-colors bg-white/5 rounded-xl">
                        {copied.field === 'clientId' ? (
                          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-white/10">
                  <div className="p-6 bg-white/5 rounded-[2.5rem] border border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <span className="font-bold text-sm">Pro Tip</span>
                    </div>
                    <p className="text-slate-400 text-[13px] leading-relaxed font-medium">
                      Store these IDs as environment variables in your server-side application.
                    </p>
                  </div>
                </div>
              </div>

              <div 
                onClick={() => window.open('https://rem.propel.co.ke/', '_blank')}
                className="bg-indigo-600 p-10 rounded-[3rem] text-white cursor-pointer hover:bg-indigo-700 transition-all group overflow-hidden relative"
              >
                <div className="relative z-10">
                  <h4 className="text-2xl font-black mb-2 flex items-center gap-3">
                    Integration Guide
                    <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </h4>
                  <p className="text-indigo-100 font-medium">Learn how to use your keys with our SDKs.</p>
                </div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      {showConfirm.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden animate-slide-up">
            <div className="p-12 text-center">
              <div className="w-24 h-24 bg-red-50 text-red-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
                <h3 className="text-3xl font-black text-slate-900 mb-4">
                  {showConfirm.action === 'callback' ? 'Update Callback?' : 'Critical Action'}
                </h3>
                <p className="text-slate-500 font-bold leading-relaxed mb-10 text-lg">
                  {showConfirm.action === 'callback' 
                    ? `Are you sure you want to update your callback URL to ${callbackUrl}? Webhook events will be sent here immediately.`
                    : `Regenerating your ${showConfirm.action === 'apiKey' ? 'API Key' : 'Webhook Secret'} will break active integrations until updated.`
                  }
                </p>
                <div className="space-y-4">
                  <button 
                    onClick={confirmAction}
                    className={`w-full py-5 rounded-[1.5rem] font-black transition-all shadow-xl active:scale-95 text-lg ${
                      showConfirm.action === 'callback'
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/20'
                        : 'bg-red-600 text-white hover:bg-red-700 shadow-red-500/20'
                    }`}
                  >
                    {showConfirm.action === 'callback' ? 'Confirm & Update' : 'Confirm & Regenerate'}
                  </button>
                <button 
                  onClick={() => setShowConfirm({ show: false, action: null })}
                  className="w-full py-5 bg-slate-100 text-slate-600 rounded-[1.5rem] font-black hover:bg-slate-200 transition-all active:scale-95 text-lg"
                >
                  Wait, Keep Original
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {showResult.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white w-full max-w-3xl rounded-[4rem] shadow-2xl overflow-hidden animate-slide-up">
            <div className="p-12">
              <div className="flex items-center gap-6 mb-10">
                <div className="w-20 h-20 bg-green-50 text-green-600 rounded-[2rem] flex items-center justify-center shadow-inner">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">{showResult.title}</h3>
                  <p className="text-green-600 font-black text-lg">{showResult.message}</p>
                </div>
              </div>

              <div className="bg-amber-50 border-2 border-amber-200 p-8 rounded-[2.5rem] mb-10 shadow-lg shadow-amber-500/5">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-amber-500 text-white rounded-xl shadow-lg ring-4 ring-amber-500/10">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-black text-amber-900 text-lg mb-1 italic uppercase tracking-tighter">Save this securely!</h4>
                    <p className="text-amber-800 font-bold leading-relaxed">
                      This is the only time you will see this value. Make sure to copy and store it safely in your production environment variables.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 mb-12">
                {typeof showResult.data === 'string' ? (
                  /* Single Field (Webhook Secret) */
                  <div className="relative group/key">
                    <div className="w-full bg-slate-900 rounded-[2.5rem] p-10 pr-24 font-mono text-indigo-400 text-2xl break-all shadow-2xl border-4 border-slate-800 ring-1 ring-white/5">
                      {showResult.data}
                    </div>
                    <button 
                      onClick={() => handleCopy(showResult.data, 'result')}
                      className="absolute right-8 top-1/2 -translate-y-1/2 p-5 bg-white text-slate-900 hover:scale-110 shadow-2xl rounded-3xl transition-all active:scale-90 border-2 border-indigo-100"
                    >
                      {copied.field === 'result' ? (
                        <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      ) : (
                        <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                      )}
                    </button>
                  </div>
                ) : (
                  /* Dual Fields (Client ID + API Key) */
                  <div className="space-y-8">
                    {/* Client ID */}
                    <div>
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-3 px-1">Client ID</label>
                      <div className="relative group/key">
                        <div className="w-full bg-slate-50 rounded-[2rem] p-6 pr-20 font-mono text-slate-900 text-xl break-all border-4 border-slate-100 shadow-inner">
                          {showResult.data?.clientId}
                        </div>
                        <button 
                          onClick={() => handleCopy(showResult.data?.clientId, 'result_client')}
                          className="absolute right-6 top-1/2 -translate-y-1/2 p-4 bg-white text-slate-900 hover:text-indigo-600 shadow-xl rounded-2xl transition-all active:scale-90 border border-slate-200"
                        >
                          {copied.field === 'result_client' ? (
                            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* API Key */}
                    <div>
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-3 px-1">API Key</label>
                      <div className="relative group/key">
                        <div className="w-full bg-slate-900 rounded-[2rem] p-8 pr-24 font-mono text-indigo-400 text-2xl break-all shadow-2xl border-4 border-slate-800">
                          {showResult.data?.apiKey}
                        </div>
                        <button 
                          onClick={() => handleCopy(showResult.data?.apiKey, 'result_key')}
                          className="absolute right-8 top-1/2 -translate-y-1/2 p-5 bg-white text-slate-900 shadow-2xl rounded-3xl transition-all active:scale-90"
                        >
                          {copied.field === 'result_key' ? (
                            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          ) : (
                            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={() => setShowResult({ show: false, data: null, title: '', message: '' })}
                className="w-full py-6 bg-slate-900 text-white rounded-[2.5rem] font-black text-xl hover:bg-indigo-600 transition-all shadow-2xl shadow-indigo-500/10 active:scale-95 flex items-center justify-center gap-3"
              >
                Done, I've safely secured it
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiKeys;