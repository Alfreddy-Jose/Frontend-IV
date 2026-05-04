import Api from "./api";

export const getAllPnfs = async () => {
  const response = await Api.get('/pnfs');
  return response.data;
}

export const createPnf = async (pnfData) => {
  const response = await Api.post('/pnf', pnfData);
  return response.data;
}

export const deletePnf = async (pnfId) => {
  const response = await Api.delete(`/pnf/${pnfId}`);
  return response.data;
}

export const updatePnf = async (pnfId, pnfData) => {
  const response = await Api.put(`/pnf/${pnfId}`, pnfData);
  return response.data;
}

export const getPnfById = async (pnfId) => {
  const response = await Api.get(`/pnf/${pnfId}`);
  return response.data;
}