import api from './api';

// Login user
export const regenerate = async (partnerId) => {
  try {
    const response = await api.put('/patner/apikey/regenerate', { partnerId });
    const { apiKey } = response.data;

    // Return user data
    return { apiKey };
  } catch (error) {
    throw error.response?.data?.message || 'Login failed';
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
