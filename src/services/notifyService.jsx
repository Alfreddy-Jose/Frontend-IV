import Api from "./api";

export const getNotificacions = async () => {
  const response = await Api.get('/notificaciones');
  return response.data;
}

export const markAsRead = async () => {
  const response = await Api.post(`/notificaciones/marcar-leidas`);
  return response.data;
}
