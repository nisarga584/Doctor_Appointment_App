import axios from "axios";
const BASE_URL =
  process.env.REACT_APP_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : " https://doctor-appointment-app-z2q8.onrender.com");
const API_URL = `${BASE_URL}/api`;

//AUTH
export const registerUser = (data) =>
  axios.post(`${API_URL}/register`, data);
export const loginUser = (data) =>
  axios.post(`${API_URL}/login`, data);

//DOCTORS
export const getDoctors = () =>
  axios.get(`${API_URL}/doctors`);

//APPOINTMENTS
export const bookAppointment = (data, token) =>
  axios.post(`${API_URL}/appointments`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
export const getAppointments = (token) =>
  axios.get(`${API_URL}/appointments`, {
    headers: { Authorization: `Bearer ${token}` },
  });
export const cancelAppointment = (id, token) =>
  axios.delete(`${API_URL}/appointments/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });