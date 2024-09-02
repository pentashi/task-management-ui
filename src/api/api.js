import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// User registration
export const register = (userData) => {
  return api.post('/auth/register', userData);
};

// User login
export const login = (credentials) => {
  return api.post('/auth/login', credentials);
};

// Fetch tasks
export const fetchTasks = (token) => {
  return api.get('/tasks', {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Create task
export const createTask = (taskData, token) => {
  return api.post('/tasks', taskData, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Update task
export const updateTask = (id, taskData, token) => {
  return api.put(`/tasks/${id}`, taskData, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Delete task
export const deleteTask = (id, token) => {
  return api.delete(`/tasks/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
