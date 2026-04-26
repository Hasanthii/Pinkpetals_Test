import api from './api.js';

export const checkMlHealth = async () => {
  try {
    const response = await api.get('/ml/health');
    return response.status === 200;
  } catch (error) {
    if (error.response && error.response.status === 503) {
      return false;
    }
    // Return false instead of throwing if it's not a success, so UI can show it gracefully.
    // Notice: 401/403 are handled by api.js interceptor automatically
    return false;
  }
};

export const getBrands = async () => {
  try {
    const response = await api.get('/ml/brands');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCategories = async () => {
  try {
    const response = await api.get('/ml/categories');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const predictRevenue = async (brand, subCategory, date, unitPrice, lagRevenue1 = 0, rollingRev7 = 0, isDiscounted = 0) => {
  try {
    const requestData = {
      brand,
      subCategory,
      date,
      unitPrice,
      lagRevenue1,
      rollingRev7,
      isDiscounted
    };
    const response = await api.post('/predict', requestData);
    return response.data;
  } catch (error) {
    throw error;
  }
};
