import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const OAuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Parse token from query string
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const workspaceName = params.get('workspaceName');
    const workspaceId = params.get('workspaceId');
    
    if (token) {
      localStorage.setItem('token', token);
      if (workspaceName) localStorage.setItem('workspaceName', workspaceName);
      if (workspaceId) localStorage.setItem('workspaceId', workspaceId);
      // Optionally, fetch user info here if needed
      navigate('/', { replace: true });
    } else {
      // No token found, redirect to login
      navigate('/login', { replace: true, state: { message: 'OAuth failed or was cancelled.' } });
    }
  }, [location, navigate]);

  return <div>Processing login...</div>;
};

export default OAuthCallbackPage; 