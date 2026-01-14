import { useState } from 'react';
import ApiDocsSidebar from "../components/layout/ApiDocsSidebar";
import AuthModal from "../components/docs/AuthModal";

const Docs = () => {
  // Navigation State
  const [activeSection, setActiveSection] = useState('installation');

  // Auth State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [bearerToken, setBearerToken] = useState('');
  
  // API Explorer State
  const [apiResponses, setApiResponses] = useState({});
  const [loadingApi, setLoadingApi] = useState({});
  const [requestBodies, setRequestBodies] = useState({});

  // Helper to update request body for editable areas
  const handleBodyChange = (endpointId, newBody) => {
    setRequestBodies(prev => ({
      ...prev,
      [endpointId]: newBody
    }));
  };

  // Helper API Call Function
  const handleApiCall = async (endpoint) => {
    if (!bearerToken) return;
    
    setLoadingApi(prev => ({ ...prev, [endpoint.id]: true }));
    setApiResponses(prev => ({ ...prev, [endpoint.id]: null }));

    try {
      const baseUrl = 'https://rem.propel.co.ke/v1/propel-remittance'; 
      let url = `${baseUrl}${endpoint.path.replace('/api/v1', '')}`;
      
      const options = {
        method: endpoint.method,
        headers: {
          'Authorization': bearerToken,
          'Content-Type': 'application/json'
        }
      };

      if (endpoint.method !== 'GET') {
        const bodyContent = requestBodies[endpoint.id] || JSON.stringify(endpoint.initialBody, null, 2);
        try {
            JSON.parse(bodyContent);
            options.body = bodyContent;
        } catch (e) {
            throw new Error("Invalid JSON in request body");
        }
      }

      const response = await fetch(url, options);
      const data = await response.json();
      
      setApiResponses(prev => ({ 
          ...prev, 
          [endpoint.id]: {
              status: response.status,
              data: data
          }
      }));

    } catch (error) {
      setApiResponses(prev => ({ 
          ...prev, 
          [endpoint.id]: {
              status: 'Error',
              data: { message: error.message }
          }
      }));
    } finally {
      setLoadingApi(prev => ({ ...prev, [endpoint.id]: false }));
    }
  };

  // Render Content based on activeSection
  const renderContent = () => {
    switch (activeSection) {
      case 'installation':
        return (
          <div className="animate-fade-in max-w-4xl">
            <h1 className="text-4xl font-extrabold text-secondary-900 mb-6">Getting Started</h1>
            <p className="text-secondary-600 text-lg mb-8 leading-relaxed">
              Welcome to the Remit API documentation. Our API allows partners to legally and securely process money transfers and manage remittance users.
            </p>
            
            <div className="bg-white rounded-2xl border border-secondary-200 p-8 shadow-sm mb-8">
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">Prerequisites</h2>
              <ul className="space-y-3 text-secondary-600">
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>A registered partner account with Propel Remittance.</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Valid Client ID and API Key credentials.</span>
                </li>
              </ul>
            </div>
            
            <h2 className="text-2xl font-bold text-secondary-900 mb-4">Base URL</h2>
            <div className="bg-secondary-900 text-slate-300 p-4 rounded-xl font-mono text-sm mb-8">
              https://rem.propel.co.ke/v1/propel-remittance
            </div>
          </div>
        );

      case 'authentication':
        return (
          <div className="animate-fade-in max-w-4xl">
            <h1 className="text-4xl font-extrabold text-secondary-900 mb-6">Authentication</h1>
            <p className="text-secondary-600 text-lg mb-8 leading-relaxed">
              We use Bearer Token authentication. You must exchange your Client ID and API Key for an access token.
            </p>

            <div className="bg-primary-50 rounded-2xl border border-primary-100 p-8 mb-8">
              <h3 className="text-xl font-bold text-primary-900 mb-4">Test your credentials</h3>
              <p className="text-primary-700 mb-6">
                Click the button below to open the interactive authentication tool. On success, the token will be automatically applied to other API requests in this documentation.
              </p>
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all active:scale-95 shadow-lg shadow-primary-500/20 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                Open Auth Modal
              </button>
            </div>

            {bearerToken && (
               <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-6 flex items-center gap-4 animate-slide-up">
                 <div className="p-2 bg-emerald-100 rounded-full text-emerald-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                 </div>
                 <div>
                   <p className="font-bold text-emerald-900">Authenticated!</p>
                   <p className="text-emerald-700 text-sm">Your session has a valid token. You can now explore the API resources.</p>
                 </div>
               </div>
            )}
          </div>
        );

      case 'users':
        return (
          <div className="animate-fade-in max-w-4xl">
             <h1 className="text-4xl font-extrabold text-secondary-900 mb-2">Get Transfi Balance</h1>
             <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold uppercase tracking-wide mb-6">GET /api/v1/transfi/balance?currency=USD</span>
             
             <p className="text-secondary-600 text-lg mb-8">
               Retrieve transfi balance.
             </p>

             <ApiPlaygroundItem 
                endpoint={{
                  id: 'get-users',
                  method: 'GET',
                  path: '/api/v1/transfi/balance?currency=USD',
                  title: 'List Users',
                  description: 'Fetch all users.'
                }}
                bearerToken={bearerToken}
                onCall={handleApiCall}
                loading={loadingApi['get-users']}
                response={apiResponses['get-users']}
             />
          </div>
        );

      case 'money-transfer':
        return (
          <div className="animate-fade-in max-w-4xl">
             <h1 className="text-4xl font-extrabold text-secondary-900 mb-2">Money Transfer</h1>
             <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold uppercase tracking-wide mb-6">POST /api/v1/transactions</span>
             
             <p className="text-secondary-600 text-lg mb-8">
               Initiate a new remittance transaction.
             </p>

             <ApiPlaygroundItem 
                endpoint={{
                  id: 'post-transaction',
                  method: 'POST',
                  path: '/api/v1/transactions',
                  title: 'Send Money',
                  description: 'Create a transaction.',
                  initialBody: {
                    amount: 100,
                    currency: "KES",
                    beneficiaryId: "BEN-123456",
                    reason: "Family support"
                  }
                }}
                bearerToken={bearerToken}
                onCall={handleApiCall}
                loading={loadingApi['post-transaction']}
                response={apiResponses['post-transaction']}
                requestBody={requestBodies['post-transaction']}
                onBodyChange={handleBodyChange}
             />
          </div>
        );

      default:
        return <div>Select a section</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-secondary-50 selection:bg-primary-100 selection:text-primary-900">
      <ApiDocsSidebar activeSection={activeSection} onNavigate={setActiveSection} />

      <main className="flex-1 overflow-y-auto">
        <div className="px-8 py-12 lg:px-16">
          {renderContent()}
        </div>
      </main>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(data) => {
          if (data?.accessToken) setBearerToken(`Bearer ${data.accessToken}`);
        }}
      />
    </div>
  );
};

// Sub-component for the interactive part to keep the switch statement cleaner
const ApiPlaygroundItem = ({ endpoint, bearerToken, onCall, loading, response, requestBody, onBodyChange }) => {
  const baseUrl = 'https://rem.propel.co.ke/v1/propel-remittance';
  const fullUrl = `${baseUrl}${endpoint.path.replace('/api/v1', '')}`;

  return (
    <div className="bg-white rounded-2xl border border-secondary-200 overflow-hidden shadow-sm">
      <div className="px-6 py-4 bg-secondary-50/50 border-b border-secondary-100 flex justify-between items-center">
        <h3 className="font-bold text-secondary-900">Playground</h3>
        {!bearerToken && (
             <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded">Auth Required</span>
        )}
      </div>
      
      <div className="p-6">
        {/* URL Display */}
        <div className="flex items-center gap-3 mb-6 p-3 bg-secondary-50 border border-secondary-200 rounded-xl font-mono text-xs sm:text-sm overflow-x-auto custom-scrollbar">
          <span className={`font-black ${endpoint.method === 'POST' ? 'text-blue-600' : 'text-emerald-600'}`}>
            {endpoint.method}
          </span>
          <span className="text-secondary-600 whitespace-nowrap">
            {fullUrl}
          </span>
        </div>

        {endpoint.initialBody && (
            <div className="mb-6">
                <label className="block text-xs font-bold text-secondary-500 uppercase tracking-widest mb-2">Request Body (JSON)</label>
                <textarea
                    value={requestBody || JSON.stringify(endpoint.initialBody, null, 2)}
                    onChange={(e) => onBodyChange(endpoint.id, e.target.value)}
                    className="w-full bg-secondary-900 text-slate-300 p-4 rounded-xl text-xs font-mono min-h-[200px] focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all custom-scrollbar"
                    spellCheck="false"
                />
            </div>
        )}

        <button
            onClick={() => onCall(endpoint)}
            disabled={!bearerToken || loading}
            className="px-6 py-3 bg-secondary-900 text-white rounded-xl font-bold text-sm hover:bg-secondary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-lg shadow-secondary-900/10 mb-6"
        >
            {loading ? 'Sending Request...' : 'Send Request'}
        </button>

        {response && (
            <div className="animate-fade-in">
                <div className="flex items-center gap-2 mb-2">
                    <span className={`w-2 h-2 rounded-full ${response.status >= 200 && response.status < 300 ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                    <span className="text-xs font-bold text-secondary-500">Response Status: {response.status}</span>
                </div>
                <div className="bg-white border border-secondary-200 rounded-xl overflow-hidden bg-slate-50">
                    <pre className="p-4 text-xs font-mono text-secondary-700 custom-scrollbar max-h-80 overflow-y-auto">
                        {JSON.stringify(response.data, null, 2)}
                    </pre>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Docs;