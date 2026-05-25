import Api from "./api";

const getAllDocumentos = async () => {
  const response = await Api.get('/documentos');
  return response.data;
}

const createDocumento = async (data) => {
  const response = await Api.post('/documento', data);
  return response.data;
}

const deleteDocumento = async (id) => {
  const response = await Api.delete(`/documento/${id}`);
  return response.data;
}

export { getAllDocumentos, createDocumento, deleteDocumento };