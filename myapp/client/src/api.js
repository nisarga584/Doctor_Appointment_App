import axios from "axios";

const API_URL = `${process.env.REACT_APP_API_URL}/api`;

export const registerUser = (data) => axios.post(`${API_URL}/register`, data);

export const loginUser = (data) => axios.post(`${API_URL}/login`, data);

export const getDoctors = (token) =>
  axios.get(`${API_URL}/doctors`, {
    headers: { Authorization: `Bearer ${token}` },
  });

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