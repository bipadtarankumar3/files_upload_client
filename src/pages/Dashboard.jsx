// client/src/pages/Dashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = ({ token, handleLogout }) => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <div className="bg-dark text-white p-3" style={{ width: '220px' }}>
        <h4 className="text-center">Admin Panel</h4>
        <nav className="nav flex-column">
          {/* Use Link instead of <a> */}
          <Link className="nav-link text-white" to="/dashboard/upload">📤 Upload File</Link>
          <Link className="nav-link text-white" to="/dashboard/list">📁 View Uploads</Link>
          <button className="btn btn-outline-light mt-3" onClick={handleLogout}>Logout</button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 p-4">
        <h2>Admin Dashboard</h2>
        {/* Render child routes here */}
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;
