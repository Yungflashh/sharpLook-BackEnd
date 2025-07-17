export const generateReferralCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase(); // Example: '4JD8GT'
};
