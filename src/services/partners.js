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


export const createWalletService = async (currency) => {
  try {
    const response = await api.post("/transactions/wallet/create", {
      currency,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Wallet creation failed";
  }
};


export const getWalletService = async () => {
  try {
    const response = await api.get("/transactions/wallets");
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Wallet creation failed";
  }
};

// Get transfer balance 
export const getTransfiBalance = async (currency = 'KES') => {
  try {
    const response = await api.get(`/transfi/balance?currency=${currency}`, { skipAuth: true }); 
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

export const getTransactions = async (id) => {
  try {
    const response = await api.get(`/transactions/${id}/transactions`);
    
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to fetch transactions";
  }
};

export const getAllTransactions = async () => {
  try {
    const response = await api.get("/transactions/transactions");
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to fetch all transactions";
  }
};

export const transactService = async (payload) => {
  try {
    const response = await api.post("/transactions/transact", payload);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Deposit request failed";
  }
};

export const getPaymentMethods = async (currency = "KES", direction = "deposit") => {
  try {
    const response = await api.get(`/transfi/payment-methods?currency=${currency}&direction=${direction}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to fetch payment methods";
  }
};


 