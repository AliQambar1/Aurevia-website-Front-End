// src/services/authService.js

// Use the `VITE_BACK_END_SERVER_URL` environment variable to set the base URL.
// Note the `/auth` path added to the server URL that forms the base URL for
// all the requests in this service.
const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}`;

const signUp = async (formData) => {
  try {
    // New code to extract only the fields expected by UserSchema in backend
    const { username, email, password } = formData;

    const res = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Changed to send only specific fields to avoid 400 Bad Request
      body: JSON.stringify({ username, email, password }),
    });

    const data = await res.json();

    if (data.err) {
      throw new Error(data.err);
    }

    if (data.token) {
      localStorage.setItem('token', data.token);
      console.log(data.token)
      return JSON.parse(atob(data.token.split('.')[1]))
    }

    throw new Error('Invalid response from server');
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

const signIn = async (formData) => {
  try {
    const res = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (data.err) {
      throw new Error(data.err);
    }

    if (data.token) {
      localStorage.setItem('token', data.token);
      return JSON.parse(atob(data.token.split('.')[1]))
    }

    throw new Error('Invalid response from server');
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

export {
  signUp, signIn
};

const USERS_BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}/users`;
const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` }

export const index = async () => {
   try {
    const res = await fetch(`${USERS_BASE_URL}/`, {
      method: 'GET',
      headers
    });

    const data = await res.json();

    if (data.err) {
      throw new Error(data.err);
    }

    console.log(data)
    return data
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}