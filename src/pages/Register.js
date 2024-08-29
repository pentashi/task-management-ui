import React, { useState } from 'react';
import { register } from '../api/api'; // Adjust the import path as needed
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await register({ username, email, password });
      setSuccess('User registered successfully');
      setError('');
      // Redirect to the login page
      setTimeout(() => navigate('/login'), 2000); // Redirect after 2 seconds
    } catch (err) {
      setError('Registration failed. Please try again.');
      setSuccess('');
      console.error('Registration error:', err);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h1 className="text-center mb-4">Register</h1>
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
              />
            </div>
            <div className="form-group mb-3">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                required
              />
            </div>
            <div className="form-group mb-3">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block">Register</button>
          </form>
          {error && <p className="text-danger mt-3">{error}</p>}
          {success && <p className="text-success mt-3">{success}</p>}
          <p className="mt-3 text-center">
            Already registered? <a href="/login">Login here</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
