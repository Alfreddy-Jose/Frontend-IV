import Api from "./api";

const toggleEntrega = async (data) => {
  const response = await Api.post('/control_entregas/toggle', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
  return response.data;
}

const getAllEntregas = async (pnfId) => {
  const response = await Api.get('/control_entregas', {
    params: pnfId ? { pnf_id: pnfId } : {}
  });
  return response.data;
}


export { toggleEntrega, getAllEntregas };