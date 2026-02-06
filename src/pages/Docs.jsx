import { useState, useEffect } from 'react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

   const handleNavigate = (sectionId) => {
    setActiveSection(sectionId);
    // Scroll to section logic here
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Close mobile menu when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

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

      case 'auth-partner':
        return (
          <div className="animate-fade-in max-w-4xl">
             <h1 className="text-4xl font-extrabold text-secondary-900 mb-2">Authenticate Partner</h1>
             <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold uppercase tracking-wide mb-6">POST /v1/propel-remittance/patner/authenticate-partner</span>
             
             <p className="text-secondary-600 text-lg mb-8">
               Authenticate a partner using their Partner ID to receive access and refresh tokens.
             </p>

             <div className="mb-8">
               <h3 className="text-xl font-bold text-secondary-900 mb-4">Required Body</h3>
               <div className="bg-secondary-900 text-slate-300 p-6 rounded-2xl font-mono text-xs overflow-x-auto custom-scrollbar">
                 <pre>{JSON.stringify({
  "partnerId": "d51b8af8-47f7-4fda-98c8-0f20bddc91ab"
}, null, 2)}</pre>
               </div>
             </div>

             <div className="mb-8">
               <h3 className="text-xl font-bold text-secondary-900 mb-4">Expected Response</h3>
               <div className="bg-secondary-900 text-slate-300 p-6 rounded-2xl font-mono text-xs overflow-x-auto custom-scrollbar">
                 <pre>{JSON.stringify({
  "accessToken": "string",
  "refreshToken": "string",
  "expiresIn": 0
}, null, 2)}</pre>
               </div>
             </div>

             <ApiPlaygroundItem 
                endpoint={{
                  id: 'auth-partner-call',
                  method: 'POST',
                  path: '/patner/authenticate-partner',
                  title: 'Authenticate Partner',
                  description: 'Exchange Partner ID for tokens.',
                  initialBody: {
                    partnerId: "d51b8af8-47f7-4fda-98c8-0f20bddc91ab"
                  }
                }}
                bearerToken={bearerToken}
                onCall={handleApiCall}
                loading={loadingApi['auth-partner-call']}
                response={apiResponses['auth-partner-call']}
                requestBody={requestBodies['auth-partner-call']}
                onBodyChange={handleBodyChange}
             />
          </div>
        );

      case 'partner':
        return (
          <div className="animate-fade-in max-w-4xl">
             <h1 className="text-4xl font-extrabold text-secondary-900 mb-2">Partner Info</h1>
             <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold uppercase tracking-wide mb-6">GET /v1/propel-remittance/patner</span>
             
             <p className="text-secondary-600 text-lg mb-8">
               Retrieve current authenticated partner details.
             </p>

             <div className="mb-8">
               <h3 className="text-xl font-bold text-secondary-900 mb-4">Expected Response</h3>
               <div className="bg-secondary-900 text-slate-300 p-6 rounded-2xl font-mono text-xs overflow-x-auto custom-scrollbar">
                 <pre>{JSON.stringify({
  "message": "user found",
  "user": {
    "id": "8c09aeee-8185-48e5-8c3f-48d98dc07faa",
    "firstName": null,
    "lastName": null,
    "companyName": "Acme Insurance Ltd",
    "country": "KE",
    "idNumber": null,
    "businessIdNumber": "P049530492K",
    "gender": null,
    "dateOfBirth": "2002-01-20T00:00:00.000Z",
    "phone": "0745616166",
    "email": "simonnjuguna406@gmail.com",
    "address": {
      "street": "123 Main Street",
      "city": "Nairobi",
      "state": "Nairobi County",
      "postalCode": "00100"
    },
    "password": "$2b$10$az0lA8vuAycxS6gJcz.Zve4TWoperj9CCBLHfD9isyZAQK.S5WLnq",
    "verified": true,
    "canTransact": true,
    "identityLevelAchieved": "Level 0",
    "clientTransactionNumber": "UX-260130070755491",
    "googleId": null,
    "profileImage": null,
    "authProvider": "local",
    "role": "api_partner",
    "createdAt": "2026-01-30T07:07:54.097Z",
    "updatedAt": "2026-01-30T07:07:56.171Z",
    "partner": {
      "id": "d72aef9e-04b3-4859-811a-66802538c55e",
      "domain": null,
      "companyName": "Acme Insurance Ltd",
      "certificateOfIncorporationNumber": null,
      "licenseNumber": null,
      "country": null,
      "address": null,
      "partnerType": "api",
      "active": true,
      "callbackUrl": null,
      "webhookSecret": "$2b$10$Xn5HQy6bdr6igk6K1mHfOem.zPVge3ZnUEE0H9ywvdXlgkVsC6Gee",
      "requires2FA": false,
      "createdAt": "2026-01-30T07:07:54.221Z",
      "updatedAt": "2026-01-30T07:07:54.221Z"
    }
  }
}, null, 2)}</pre>
               </div>
             </div>

             <ApiPlaygroundItem 
                endpoint={{
                  id: 'get-partner',
                  method: 'GET',
                  path: '/patner',
                  title: 'Get Partner Info',
                  description: 'Fetch details of the authenticated partner.'
                }}
                bearerToken={bearerToken}
                onCall={handleApiCall}
                loading={loadingApi['get-partner']}
                response={apiResponses['get-partner']}
             />
          </div>
        );

      case 'regenerate-key':
        return (
          <div className="animate-fade-in max-w-4xl">
             <h1 className="text-4xl font-extrabold text-secondary-900 mb-2">Regenerate API Key</h1>
             <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold uppercase tracking-wide mb-6">POST /v1/propel-remittance/patner/apikey/regenerate</span>
             
             <p className="text-secondary-600 text-lg mb-8">
               Regenerate your API credentials. <strong>Warning:</strong> The old API key will be immediately invalidated.
             </p>

             <div className="mb-8">
               <h3 className="text-xl font-bold text-secondary-900 mb-4">Expected Response</h3>
               <div className="bg-secondary-900 text-slate-300 p-6 rounded-2xl font-mono text-xs overflow-x-auto custom-scrollbar">
                 <pre>{JSON.stringify({
  "message": "API key regenerated successfully. Copy it now; you will not see it again!",
  "clientId": "cc8c5fb6-5017-49bc-bc8b-fed539c51891",
  "apiKey": "77b8a9baab6e5ccd5040120d9e34598a1c6a2917c3a456fc7d633708b9db60c4"
}, null, 2)}</pre>
               </div>
             </div>

             <ApiPlaygroundItem 
                endpoint={{
                  id: 'regenerate-api-key',
                  method: 'POST',
                  path: '/patner/apikey/regenerate',
                  title: 'Regenerate API Key',
                  description: 'Generate fresh API credentials.'
                }}
                bearerToken={bearerToken}
                onCall={handleApiCall}
                loading={loadingApi['regenerate-api-key']}
                response={apiResponses['regenerate-api-key']}
             />
          </div>
        );

      case 'transact':
        return (
          <div className="animate-fade-in max-w-4xl">
             <h1 className="text-4xl font-extrabold text-secondary-900 mb-2">Transact</h1>
             <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold uppercase tracking-wide mb-6">POST /v1/propel-remittance/patner/transact</span>
             
             <p className="text-secondary-600 text-lg mb-8">
               Initiate a transaction, such as a deposit or withdrawal.
             </p>

             <div className="mb-8">
               <h3 className="text-xl font-bold text-secondary-900 mb-4">Request Body</h3>
               <div className="bg-secondary-900 text-slate-300 p-6 rounded-2xl font-mono text-xs overflow-x-auto custom-scrollbar">
                 <pre>{JSON.stringify({
  "type": "deposit",
  "amount": "100.00",
  "currency": "USD",
  "walletId": "KES",
  "idempotencyKey": "550e8400-e29b-41d4-a716-446655440000",
  "partnerContext": {},
  "redirectUrl": "https://example.com/success",
  "paymentType": "key_123",
  "paymentCode": "mpesa",
  "purposeCode": "string",
  "sourceUrl": "string",
  "headlessMode": false,
  "balanceCurrency": "KES",
  "additionalDetails": {},
  "kycRequest": {}
}, null, 2)}</pre>
               </div>
             </div>

             <div className="mb-8">
               <h3 className="text-xl font-bold text-secondary-900 mb-4">Expected Response</h3>
               <div className="bg-secondary-900 text-slate-300 p-6 rounded-2xl font-mono text-xs overflow-x-auto custom-scrollbar">
                 <pre>{JSON.stringify({
  "txId": "tx_123abc",
  "status": "PENDING",
  "amount": "100.00",
  "currency": "USD",
  "paymentUrl": "https://payment.url",
  "redirectUrl": "https://redirect.url"
}, null, 2)}</pre>
               </div>
             </div>

             <ApiPlaygroundItem 
                endpoint={{
                  id: 'transact-call',
                  method: 'POST',
                  path: '/patner/transact',
                  title: 'Transact',
                  description: 'Initiate a partner transaction.',
                  initialBody: {
                    "type": "deposit",
                    "amount": "100.00",
                    "currency": "USD",
                    "walletId": "KES",
                    "idempotencyKey": "550e8400-e29b-41d4-a716-446655440000",
                    "partnerContext": {},
                    "redirectUrl": "https://example.com/success",
                    "paymentType": "key_123",
                    "paymentCode": "mpesa",
                    "purposeCode": "string",
                    "sourceUrl": "string",
                    "headlessMode": false,
                    "balanceCurrency": "KES",
                    "additionalDetails": {},
                    "kycRequest": {}
                  }
                }}
                bearerToken={bearerToken}
                onCall={handleApiCall}
                loading={loadingApi['transact-call']}
                response={apiResponses['transact-call']}
                requestBody={requestBodies['transact-call']}
                onBodyChange={handleBodyChange}
             />
          </div>
        );

      case 'create-wallet':
        return (
          <div className="animate-fade-in max-w-4xl">
             <h1 className="text-4xl font-extrabold text-secondary-900 mb-2">Create Wallet</h1>
             <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold uppercase tracking-wide mb-6">POST /v1/propel-remittance/patner/wallet/create</span>
             
             <p className="text-secondary-600 text-lg mb-8">
               Create a new currency wallet for the partner.
             </p>

             <div className="mb-8">
               <h3 className="text-xl font-bold text-secondary-900 mb-4">Request Body</h3>
               <div className="bg-secondary-900 text-slate-300 p-6 rounded-2xl font-mono text-xs overflow-x-auto custom-scrollbar">
                 <pre>{JSON.stringify({
  "currency": "KES"
}, null, 2)}</pre>
               </div>
             </div>

             <div className="mb-8">
               <h3 className="text-xl font-bold text-secondary-900 mb-4">Expected Response</h3>
               <div className="bg-secondary-900 text-slate-300 p-6 rounded-2xl font-mono text-xs overflow-x-auto custom-scrollbar">
                 <pre>{JSON.stringify({
  "currency": "UGX",
  "balance": "0.00",
  "active": true,
  "user": {
    "id": "8c09aeee-8185-48e5-8c3f-48d98dc07faa",
    "firstName": null,
    "lastName": null,
    "companyName": "Acme Insurance Ltd",
    "country": "KE",
    "idNumber": null,
    "businessIdNumber": "P049530492K",
    "gender": null,
    "dateOfBirth": "2002-01-20T00:00:00.000Z",
    "phone": "0745616166",
    "email": "simonnjuguna406@gmail.com",
    "address": {
      "street": "123 Main Street",
      "city": "Nairobi",
      "state": "Nairobi County",
      "postalCode": "00100"
    },
    "password": "$2b$10$az0lA8vuAycxS6gJcz.Zve4TWoperj9CCBLHfD9isyZAQK.S5WLnq",
    "verified": true,
    "canTransact": true,
    "identityLevelAchieved": "Level 0",
    "clientTransactionNumber": "UX-260130070755491",
    "googleId": null,
    "profileImage": null,
    "authProvider": "local",
    "role": "api_partner",
    "createdAt": "2026-01-30T07:07:54.097Z",
    "updatedAt": "2026-01-30T07:07:56.171Z"
  },
  "id": "71c8c939-773c-4590-bcae-dd3e38815f3e",
  "createdAt": "2026-02-06T05:53:03.905Z",
  "updatedAt": "2026-02-06T05:53:03.905Z"
}, null, 2)}</pre>
               </div>

             </div>

             <ApiPlaygroundItem 
                endpoint={{
                  id: 'create-wallet-call',
                  method: 'POST',
                  path: '/patner/wallet/create',
                  title: 'Create Wallet',
                  description: 'Create a new currency wallet.',
                  initialBody: {
                    "currency": "KES"
                  }
                }}
                bearerToken={bearerToken}
                onCall={handleApiCall}
                loading={loadingApi['create-wallet-call']}
                response={apiResponses['create-wallet-call']}
                requestBody={requestBodies['create-wallet-call']}
                onBodyChange={handleBodyChange}
             />
          </div>
        );

      case 'list-wallets':
        return (
          <div className="animate-fade-in max-w-4xl">
             <h1 className="text-4xl font-extrabold text-secondary-900 mb-2">List Wallets</h1>
             <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold uppercase tracking-wide mb-6">GET /v1/propel-remittance/patner/wallets</span>
             
             <p className="text-secondary-600 text-lg mb-8">
               Retrieve a list of all currency wallets associated with your partner account.
             </p>

             <div className="mb-8">
               <h3 className="text-xl font-bold text-secondary-900 mb-4">Expected Response</h3>
               <div className="bg-secondary-900 text-slate-300 p-6 rounded-2xl font-mono text-xs overflow-x-auto custom-scrollbar">
                 <pre>{JSON.stringify([
  {
    "id": "a7f570c6-264d-4baf-a589-ec81f9fe6713",
    "currency": "KES",
    "balance": "0.00",
    "active": true,
    "createdAt": "2026-01-30T07:19:56.925Z",
    "updatedAt": "2026-01-30T07:19:56.925Z"
  },
  {
    "id": "71c8c939-773c-4590-bcae-dd3e38815f3e",
    "currency": "UGX",
    "balance": "0.00",
    "active": true,
    "createdAt": "2026-02-06T05:53:03.905Z",
    "updatedAt": "2026-02-06T05:53:03.905Z"
  }
], null, 2)}</pre>
               </div>

             </div>

             <ApiPlaygroundItem 
                endpoint={{
                  id: 'list-wallets-call',
                  method: 'GET',
                  path: '/patner/wallets',
                  title: 'List Wallets',
                  description: 'Fetch all partner wallets.'
                }}
                bearerToken={bearerToken}
                onCall={handleApiCall}
                loading={loadingApi['list-wallets-call']}
                response={apiResponses['list-wallets-call']}
             />
          </div>
        );

      case 'regenerate-webhook':
        return (
          <div className="animate-fade-in max-w-4xl">
             <h1 className="text-4xl font-extrabold text-secondary-900 mb-2">Regenerate Webhook Secret</h1>
             <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold uppercase tracking-wide mb-6">POST /v1/propel-remittance/patner/webhook/regenerate</span>
             
             <p className="text-secondary-600 text-lg mb-8">
               Regenerate your webhook signing secret. This secret is used to verify the integrity of payloads sent to your callback URL.
             </p>

             <div className="mb-8">
               <h3 className="text-xl font-bold text-secondary-900 mb-4">Expected Response</h3>
               <div className="bg-secondary-900 text-slate-300 p-6 rounded-2xl font-mono text-xs overflow-x-auto custom-scrollbar">
                 <pre>{JSON.stringify({
  "success": true,
  "message": "Webhook secret regenerated successfully. Copy it now; you will not see it again!",
  "webhookSecret": "9fed42d11f3028189ed38012298462036d9da7146e297563fa7ee25dbc6b7d35"
}, null, 2)}</pre>
               </div>
             </div>

             <ApiPlaygroundItem 
                endpoint={{
                  id: 'regenerate-webhook-call',
                  method: 'POST',
                  path: '/patner/webhook/regenerate',
                  title: 'Regenerate Webhook Secret',
                  description: 'Generate a new signing secret.'
                }}
                bearerToken={bearerToken}
                onCall={handleApiCall}
                loading={loadingApi['regenerate-webhook-call']}
                response={apiResponses['regenerate-webhook-call']}
             />
          </div>
        );

      case 'users':
        return (
          <div className="animate-fade-in max-w-4xl">
             <h1 className="text-4xl font-extrabold text-secondary-900 mb-2">Get Transfi Balance</h1>
             <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold uppercase tracking-wide mb-6">GET /v1/propel-remittance/transfi/balance?currency=USD</span>
             
             <p className="text-secondary-600 text-lg mb-8 leading-relaxed">
               Retrieve detailed Transfi account balance, including collections, payouts, settled amounts, and available prefunding balances.
             </p>

             <div className="mb-8">
               <h3 className="text-xl font-bold text-secondary-900 mb-4">Expected Response</h3>
               <div className="bg-secondary-900 text-slate-300 p-6 rounded-2xl font-mono text-xs overflow-x-auto custom-scrollbar">
                 <pre>{JSON.stringify({
  "balance": [
    {
      "currency": "USD",
      "_id": "USD",
      "totalCollectionsAmount": 17642.71,
      "totalPayoutAmount": 1587070,
      "totalSettledAmount": 0,
      "totalUnsettledAmount": 17642.71,
      "totalAvailablePrefundingBalance": 412930,
      "totalPayoutFee": 0,
      "totalPayoutInTransitBalance": 0
    }
  ],
  "date": "2026-02-06"
}, null, 2)}</pre>
               </div>
             </div>

             <ApiPlaygroundItem 
                endpoint={{
                  id: 'get-transfi-balance',
                  method: 'GET',
                  path: '/api/v1/transfi/balance?currency=USD',
                  title: 'Get Transfi Balance',
                  description: 'Fetch current account balances and settlement status.'
                }}
                bearerToken={bearerToken}
                onCall={handleApiCall}
                loading={loadingApi['get-transfi-balance']}
                response={apiResponses['get-transfi-balance']}
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
      {/* <ApiDocsSidebar activeSection={activeSection} onNavigate={setActiveSection} /> */}
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-white border-b flex items-center px-4">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 rounded-md hover:bg-gray-100"
        >
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
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* <span className="ml-3 font-bold">API Docs</span> */}
        <span  className="text-xl font-black tracking-tight flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                    Remit<span className="text-primary-500">.</span>API
                  </span>
      </div>

      <ApiDocsSidebar 
        activeSection={activeSection}
        onNavigate={handleNavigate}
        isMobileOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

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