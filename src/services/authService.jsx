import axios from "axios";
import Api from "./api";

export const getCsrfToken = async () => {
  return await axios.get("https://laravel-iv.onrender.com/sanctum/csrf-cookie"); // Cambia la URL según tu configuración "https://laravelapi-1-2cah.onrender.com/sanctum/csrf-cookie";
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