import api from './api';

// Regenerate API Key
export const regenerateApiKey = async (partnerId) => {
  try {
    const response = await api.post('/patner/apikey/regenerate', { partnerId });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to regenerate API key';
  }
};

// Regenerate Webhook Secret
export const regenerateWebhookSecret = async (partnerId) => {
  try {
    const response = await api.post('/patner/webhook/regenerate', { partnerId });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to regenerate webhook secret';
  }
};

// Update Callback URL
export const updateCallbackUrl = async (callbackUrl) => {
  try {
    const response = await api.post('/patner/callback-url', { callbackUrl });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to update callback URL';
  }
};


// Get transfer balance 
export const getTransfiBalance = async (currency = 'KES') => {
  try {
    const response = await api.get(`/transfi/balance?currency=${currency}`);
    const {
      balance: [
        {
          totalCollectionsAmount,
          totalPayoutAmount,
          totalSettledAmount,
          totalUnsettledAmount,
          totalAvailablePrefundingBalance,
          totalPayoutFee,
          totalPayoutInTransitBalance
        }
      ],
      date // This gets the date string separately
    } = response.data;

    console.log('Dashboard Data Partner:', totalCollectionsAmount);

    return {
      totalCollectionsAmount,
      totalPayoutAmount,
      totalSettledAmount,
      totalUnsettledAmount,
      totalAvailablePrefundingBalance,
      totalPayoutFee,
      totalPayoutInTransitBalance,
      date // You might want to return the date too!
    };
  } catch (error) {
    // Standard error handling
    const errorMessage = error.response?.data?.message || 'Failed to get transfer balance';
    throw errorMessage;
  }
};

// Get current partner profile
export const getCurrentPartner = async () => {
  try {
    const response = await api.get('/patner');
    if (response.data && response.data.user) {
      localStorage.setItem('partner_profile', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to get current partner details';
  }
};



// Get partner details
export const getPartnerDetails = async (id) => {
  try {
    const response = await api.get(`/patner/${id}`);
    console.log('Partner Profile Response:', response.data);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to get partner details';
    throw errorMessage;
  }
};

// Get partner wallets
export const getPartnerWallets = async () => {
  try {
    const response = await api.get('/patner/wallets');
    console.log('Partner Wallets Response:', response.data);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to get partner wallets';
    throw errorMessage;
  }
};
