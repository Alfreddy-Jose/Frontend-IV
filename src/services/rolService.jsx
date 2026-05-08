import api from './api';

export const getAllRoles = async () => {
  const response = await api.get('/roles');
  return response.data;
};

export const getAllRolesPermisos = async () => {
  const response = await api.get('/roles_permisos');
  return response.data;
};

export const createRole = async (roleData) => {
  const response = await api.post('/roles', roleData);
  return response.data;
};

export const updateRole = async (roleId, roleData) => {
  const response = await api.put(`/rol/${roleId}`, roleData);
  return response.data;
};

export const deleteRole = async (roleId) => {
  const response = await api.delete(`/roles/${roleId}`);
  return response.data;
};