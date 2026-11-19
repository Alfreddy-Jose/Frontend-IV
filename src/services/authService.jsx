import axios from "axios";
import Api from "./api";

export const getCsrfToken = async () => {
  return await axios.get(`/sanctum/csrf-cookie`, {
    withCredentials: true, // PERMITIENDO ENVIAR CREDENCIALES
  });
};

export const login = async (credentials) => {
  return await Api.post("/login", credentials);
};

export const getUserData = async () => {
  return await Api.get("/user");
};

export const logout = async () => {
  return await Api.post("/logout");
};