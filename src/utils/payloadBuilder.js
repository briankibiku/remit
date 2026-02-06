/**
 * Utility to build the transaction payload for the backend API.
 * This handles mapping UI states and user profile data to the specific 
 * schema required by the transactService.
 */
export const buildTransactionPayload = (data, user) => {
  const { type, amount, currency, walletId, selectedMethod, additionalData } = data;

  // Generate a unique idempotency key
  const idempotencyKey = typeof window !== 'undefined' && window.crypto?.randomUUID 
    ? window.crypto.randomUUID() 
    : `idx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  // Construct the baseline payload exactly as per requirements
  const payload = {
    type: type, // "deposit" or "withdraw"
    amount: amount, 
    currency: currency,
    walletId: walletId,
    idempotencyKey: idempotencyKey,
    partnerContext: {},
    redirectUrl: `https://transfi.com/`,
    paymentType: selectedMethod.paymentType || selectedMethod.paymentCode,
    paymentCode: selectedMethod.paymentCode,
    purposeCode: "expense_or_medical_reimbursement", 
    sourceUrl: `https://transfi.com/`,
    headlessMode: false,
    balanceCurrency: currency, 
    kycRequest: {},
    additionalDetails: {
      ...additionalData
    }
  };

  // Special handling for MPESA (KES) field mapping
  const isMpesa = selectedMethod.name?.toLowerCase().includes("mpesa") || 
                 selectedMethod.paymentCode?.toLowerCase().includes("mpesa") ||
                 selectedMethod.paymentCode === "MPESA";
  
  if (currency === "KES" && isMpesa) {
    if (additionalData.accountNumber && !additionalData.phoneNumber) {
      payload.additionalDetails.phoneNumber = additionalData.accountNumber;
    }
  }

  // Address injection for USD Withdrawals (must be inside additionalDetails)
  if (type === "withdraw" && currency === "USD") {
    payload.additionalDetails = {
      ...payload.additionalDetails,
      street: additionalData.street || user?.address?.street || "",
      city: additionalData.city || user?.address?.city || "",
      state: additionalData.state || user?.address?.state || "",
      postalCode: additionalData.postalCode || user?.address?.postalCode || "",
      country: additionalData.country || user?.country || "",
      beneficiaryName: additionalData.beneficiaryName || (user?.firstName ? `${user.firstName} ${user.lastName}` : ""),
      beneficiaryEmail: additionalData.beneficiaryEmail || user?.email || "",
      beneficiaryPhone: additionalData.beneficiaryPhone || user?.phoneNumber || ""
    };
  }

  return payload;
};
