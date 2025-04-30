// client/src/pages/NotFoundPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="text-center mt-5">
    <h2>404 - Page Not Found</h2>
    <p>Oops! The page you're looking for does not exist.</p>
    <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
  </div>
);

export default NotFoundPage;
