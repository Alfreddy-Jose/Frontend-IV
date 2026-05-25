import Api from "./api";

const toggleEntrega = async (data) => {
  const response = await Api.post('/control_entregas/toggle', data);
  return response.data;
}

const getAllEntregas = async () => {
  const response = await Api.get('/control_entregas');
  return response.data;
}


export { toggleEntrega, getAllEntregas };