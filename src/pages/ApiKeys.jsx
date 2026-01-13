import { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import { regenerate } from '../services/partners';

const ApiKeys = () => {
  const [apiKey, setApiKey] = useState('');
  const [clientId, setClientId] = useState('');
  const [partnerId, setPartnerId] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [newKeyName, setNewKeyName] = useState('');
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setApiKey(params.get('apiKey') || ''); 
    setClientId(params.get('clientId') || '');
    setPartnerId(params.get('partnerId') || '');
  }, []);
  
  const generateApiKey = async () => {
    if (!newKeyName.trim()) {
      setError('Please enter a partner ID to proceed');
      return;
    }
    
    try {
      setGenerating(true);
      setError('');
      const response = await regenerate(newKeyName);
      
      // Update local state with new credentials
      if (response && response.apiKey) {
        setApiKey(response.apiKey);
        setPartnerId(newKeyName);
        // Usually clientId would also be returned or updated
      }
      
      setNewKeyName('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to generate API key');
    } finally {
      setGenerating(false);
    }
  };
  
  const copyToClipboard = () => {
    const textToCopy = `API Key: ${apiKey}\nClient ID: ${clientId}\nPartner ID: ${partnerId}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  return (
    <div className="flex min-h-screen bg-secondary-50 selection:bg-primary-100 selection:text-primary-900">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-10 lg:px-12">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 animate-fade-in">
            <div>
              <h1 className="text-3xl font-extrabold text-secondary-900 tracking-tight flex items-center gap-3">
                API Credentials
                <span className="p-1 px-2.5 bg-primary-100 text-primary-600 rounded-lg text-xs font-black uppercase tracking-widest">v1.2</span>
              </h1>
              <p className="text-secondary-500 font-medium mt-1">Manage your integration access and security credentials.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-8">
            {/* Generate Section */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-secondary-100 animate-slide-up">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-secondary-900">Rotate Credentials</h2>
                  <p className="text-secondary-400 text-sm font-medium">Generating a new key will immediately revoke the current one.</p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl mb-6 flex items-center gap-3 animate-slide-up">
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-bold leading-tight">{error}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative group">
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="Enter Partner ID (e.g. PRT-8829)"
                    className="w-full px-6 py-4 bg-secondary-50 border border-secondary-100 rounded-2xl text-secondary-900 font-bold placeholder:text-secondary-300 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:bg-white transition-all shadow-sm"
                  />
                </div>
                <button
                  onClick={generateApiKey}
                  disabled={generating}
                  className="bg-primary-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-primary-700 disabled:bg-secondary-200 disabled:text-secondary-400 transition-all shadow-lg shadow-primary-500/20 active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  {generating ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                  {generating ? 'Processing...' : 'Generate New Key'}
                </button>
              </div>
            </div>
            
            {/* Display Keys Section */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-secondary-100 overflow-hidden animate-slide-up" style={{ animationDelay: '100ms' }}>
              <div className="p-8 border-b border-secondary-100 flex items-center justify-between bg-secondary-50/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-secondary-900">Current Credentials</h2>
                </div>
                
                <button
                  onClick={copyToClipboard}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                    copied 
                    ? 'bg-emerald-50 text-emerald-600 shadow-none' 
                    : 'bg-white text-secondary-700 border border-secondary-200 hover:bg-secondary-50 shadow-sm'
                  }`}
                >
                  {copied ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  )}
                  {copied ? 'Copied Details' : 'Copy All'}
                </button>
              </div>

              <div className="p-10 space-y-8">
                {/* ID Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="group cursor-default">
                    <label className="text-secondary-400 text-[10px] font-black uppercase tracking-widest block mb-2 px-1">Client Identifier</label>
                    <div className="p-4 bg-secondary-50 border border-secondary-100 rounded-2xl group-hover:border-primary-100 group-hover:bg-white transition-all">
                      <p className="font-mono text-secondary-900 font-bold tracking-tight">{clientId || 'Not Assigned'}</p>
                    </div>
                  </div>
                  <div className="group cursor-default">
                    <label className="text-secondary-400 text-[10px] font-black uppercase tracking-widest block mb-2 px-1">Partner Identifier</label>
                    <div className="p-4 bg-secondary-50 border border-secondary-100 rounded-2xl group-hover:border-primary-100 group-hover:bg-white transition-all">
                      <p className="font-mono text-secondary-900 font-bold tracking-tight">{partnerId || 'Not Assigned'}</p>
                    </div>
                  </div>
                </div>

                {/* API Key Box */}
                <div>
                  <label className="text-secondary-400 text-[10px] font-black uppercase tracking-widest block mb-2 px-1">Production API Key</label>
                  <div className="relative group">
                    <div className="p-6 bg-secondary-900 text-primary-400 rounded-3xl font-mono text-lg break-all shadow-inner border-2 border-primary-500/10 transition-all group-hover:border-primary-500/30">
                      {apiKey || '••••••••••••••••••••••••••••••••'}
                    </div>
                    {apiKey && (
                      <div className="absolute top-4 right-4 animate-fade-in">
                        <span className="p-1 px-2.5 bg-emerald-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">Active</span>
                      </div>
                    )}
                  </div>
                  <p className="mt-4 text-secondary-400 text-xs font-medium italic flex items-center gap-2 px-1">
                    <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Never share your API keys in public repositories or client-side code.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Documentation CTA */}
            <div className="bg-primary-600 rounded-[2.5rem] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-black tracking-tight mb-2">Ready to integrate?</h3>
                <p className="text-primary-100 font-medium">Explore our developer hub for SDKs and API references.</p>
              </div>
              <button onClick={() => window.open('https://rem.propel.co.ke/', '_blank')} className="px-8 py-4 bg-white text-primary-600 rounded-2xl font-black text-sm hover:shadow-2xl hover:scale-105 transition-all active:scale-95 whitespace-nowrap">
                Go to Documentation
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ApiKeys;