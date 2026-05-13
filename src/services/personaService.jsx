import Api from "./api";

export const getAllPersonas = async () => {
  const response = await Api.get('/personas');
  return response.data;
}

export const createPersona = async (personaData) => {
  const response = await Api.post('/persona', personaData);
  return response.data;
}

export const getPersonaById = async (id) => {
  const response = await Api.get(`/persona/${id}`);
  return response.data;
}

export const deletePersona = async (personaId) => {
  const response = await Api.delete(`/persona/${personaId}`);
  return response.data;
}

export const updatePersona = async (personaId, personaData) => {
  const response = await Api.put(`/persona/${personaId}`, personaData);
  return response.data;
}


