import api from './api';

export const getAllUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

export const createUser = async (userData) => {
  const response = await api.post('/user/create', userData);
  return response.data;
};

export const getUserById = async (userId) => {
  const response = await api.get(`/user/${userId}`);
  return response.data;
};

export const updateUser = async (userId, userData) => {
  const response = await api.put(`/user/${userId}`, userData);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await api.delete(`/user/${userId}`);
  return response.data;
};

export const getRoles = async () => {
  const response = await api.get('/get_roles');
  return response.data;
}