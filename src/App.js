import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Register from './pages/Register'; // Import your Register component
import Login from './pages/Login';
import TaskList from './pages/TaskList'; // We'll create this component next

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Register />} /> {/* Default route to Registration */}
        <Route path="/login" element={<Login />} />
        <Route path="/tasks" element={<TaskList />} />
        {/* Redirect from any unknown route to Registration */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
