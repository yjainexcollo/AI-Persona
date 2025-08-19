import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Avatar, Drawer } from '@mui/material';
import AdminSidebar from '../components/sidebar/AdminSidebar';
import CommonNavbar from '../components/CommonNavbar';
import { fetchWithAuth } from '../utils/session';
import { getWorkspaceDetails } from '../services/workspaceService';
import { getAvatarUrl } from '../services/avatarService';

interface WorkspaceDashboardProps {
  workspaceId: string;
  workspaceName: string;
  user: { name: string; role: string; avatarUrl: string };
  stats: { members: string; users: string };
  onUsePersona: () => void;
  onSignOut: () => void;
}

const WorkspaceDashboard: React.FC<WorkspaceDashboardProps> = ({
  workspaceId,
  workspaceName,
  user,
  stats,
  onUsePersona,
  onSignOut,
}) => {
  const [dynamicStats, setDynamicStats] = useState(stats);
  const [loadingStats, setLoadingStats] = useState(false);
  const [dynamicWorkspaceName, setDynamicWorkspaceName] = useState(workspaceName);
  const [dynamicUser, setDynamicUser] = useState(user);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Clear test data on component mount
  useEffect(() => {
    
    const storedWorkspaceName = localStorage.getItem('workspaceName');
    if (storedWorkspaceName && storedWorkspaceName.includes('Test Workspace')) {
      localStorage.removeItem('workspaceName');
      console.log('Cleared test workspace name from localStorage on mount');
    }
    
    const storedUserData = localStorage.getItem('user');
    if (storedUserData) {
      try {
        const userData = JSON.parse(storedUserData);
        if (userData.name && userData.name.includes('Test User')) {
          localStorage.removeItem('user');
          console.log('Cleared test user data from localStorage on mount');
        }
      } catch (error) {
        console.warn('Error parsing user data from localStorage:', error);
      }
    }
    
    // Set workspace name to original prop value
    setDynamicWorkspaceName(workspaceName);
    console.log('Set workspace name to original prop value:', workspaceName);
  }, [workspaceName]);

  const updateWorkspaceName = () => {
    // Clear any test data first
    const storedWorkspaceName = localStorage.getItem('workspaceName');
    if (storedWorkspaceName && storedWorkspaceName.includes('Test Workspace')) {
      localStorage.removeItem('workspaceName');
      console.log('Cleared test workspace name from localStorage');
    }
    
    // Always use the original workspace name from props, not localStorage
    console.log('Current workspace name from props:', workspaceName);
    console.log('Original workspace name from props:', workspaceName);
    setDynamicWorkspaceName(workspaceName);
  };

  const updateUserData = () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('Current user data from localStorage:', userData);
      const currentUser = {
        name: userData.name || user.name || 'Demo User',
        role: userData.role || user.role || 'Member',
        avatarUrl: userData.avatar || user.avatarUrl || ''
      };
      console.log('Setting dynamic user to:', currentUser);
      setDynamicUser(currentUser);
    } catch (error) {
      console.warn('Error parsing user data from localStorage:', error);
      // Keep the fallback user data
    }
  };

  const fetchUserData = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const res = await fetchWithAuth(`${backendUrl}/api/users/me`);

      if (res.ok) {
        const data = await res.json();
        console.log('User data from API:', data);
        if (data.status === 'success' && data.data && data.data.user) {
          const apiUser = data.data.user;
          const currentUser = {
            name: apiUser.name || user.name || 'Demo User',
            role: apiUser.role || user.role || 'Member',
            avatarUrl: apiUser.avatarUrl || user.avatarUrl || ''
          };
          console.log('Setting dynamic user from API to:', currentUser);
          setDynamicUser(currentUser);
          
          // Update localStorage with fresh data
          const updatedUserData = {
            ...JSON.parse(localStorage.getItem('user') || '{}'),
            name: apiUser.name,
            role: apiUser.role,
            avatarUrl: apiUser.avatarUrl
          };
          localStorage.setItem('user', JSON.stringify(updatedUserData));
        } else if (data.data && data.data.user) {
          // Fallback: if status is missing but data exists
          const apiUser = data.data.user;
          const currentUser = {
            name: apiUser.name || user.name || 'Demo User',
            role: apiUser.role || user.role || 'Member',
            avatarUrl: apiUser.avatarUrl || user.avatarUrl || ''
          };
          console.log('Setting dynamic user from API (fallback) to:', currentUser);
          setDynamicUser(currentUser);
          
          // Update localStorage with fresh data
          const updatedUserData = {
            ...JSON.parse(localStorage.getItem('user') || '{}'),
            name: apiUser.name,
            role: apiUser.role,
            avatarUrl: apiUser.avatarUrl
          };
          localStorage.setItem('user', JSON.stringify(updatedUserData));
        } else {
          console.log('No user data found in API response:', data);
        }
      } else {
        console.warn('Failed to fetch user data from API:', res.status);
      }
    } catch (error) {
      console.warn('Error fetching user data from API:', error);
    }
  };

  const fetchWorkspaceData = async () => {
    try {
      const workspace = await getWorkspaceDetails();
      console.log('Workspace data from API:', workspace);
      console.log('Workspace ID from API:', workspace.id);
      console.log('Workspace name from API:', workspace.name);
      
      // Clear any test data from localStorage and use the real workspace name
      const storedWorkspaceName = localStorage.getItem('workspaceName');
      if (storedWorkspaceName && storedWorkspaceName.includes('Test Workspace')) {
        localStorage.removeItem('workspaceName');
        console.log('Cleared test workspace name from localStorage');
      }
      
      // Clear any test user data from localStorage
      const storedUserData = localStorage.getItem('user');
      if (storedUserData) {
        try {
          const userData = JSON.parse(storedUserData);
          if (userData.name && userData.name.includes('Test User')) {
            localStorage.removeItem('user');
            console.log('Cleared test user data from localStorage');
          }
        } catch (error) {
          console.warn('Error parsing user data from localStorage:', error);
        }
      }
      
      // Update workspace name to use the real name from API
      setDynamicWorkspaceName(workspace.name);
      localStorage.setItem('workspaceName', workspace.name);
      localStorage.setItem('workspaceId', workspace.id);
    } catch (error) {
      console.error('Error fetching workspace data from API:', error);
    }
  };

  useEffect(() => {
    const fetchWorkspaceStats = async () => {
      setLoadingStats(true);
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
        console.log('WorkspaceId:', workspaceId);
        console.log('Backend URL:', backendUrl);
        
        // Stats endpoint doesn't exist in backend, use default values
        console.log('Stats endpoint not available, using default values');
        setDynamicStats({
          members: '0',
          users: '0'
        });
      } catch (error) {
        console.warn('Error fetching workspace stats:', error);
        // Set default stats for any error
        setDynamicStats({
          members: '0',
          users: '0'
        });
      } finally {
        setLoadingStats(false);
      }
    };

    // Listen for storage changes to update workspace name and user data immediately
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'workspaceName' && e.newValue) {
        setDynamicWorkspaceName(e.newValue);
      }
      if (e.key === 'user' && e.newValue) {
        try {
          const userData = JSON.parse(e.newValue);
          const currentUser = {
            name: userData.name || user.name || 'Demo User',
            role: userData.role || user.role || 'Member',
            avatarUrl: userData.avatar || user.avatarUrl || ''
          };
          setDynamicUser(currentUser);
        } catch (error) {
          console.warn('Error parsing user data from storage event:', error);
        }
      }
    };
    
    if (workspaceId && workspaceId !== 'demo-workspace') {
      fetchWorkspaceStats();
      updateWorkspaceName();
      updateUserData();
      fetchUserData(); // Fetch user data on mount
      fetchWorkspaceData(); // Fetch workspace data on mount
      
      // Set up real-time data syncing every 5 seconds
      const statsInterval = setInterval(fetchWorkspaceStats, 5000);
      const nameInterval = setInterval(updateWorkspaceName, 5000);
      const userInterval = setInterval(updateUserData, 5000);
      const userDataInterval = setInterval(fetchUserData, 5000); // Fetch user data every 5 seconds
      
      // Add storage event listener for immediate updates
      window.addEventListener('storage', handleStorageChange);
      
      return () => {
        clearInterval(statsInterval);
        clearInterval(nameInterval);
        clearInterval(userInterval);
        clearInterval(userDataInterval); // Clear user data interval on unmount
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, [workspaceId, workspaceName, user]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8f9fa' }}>
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <AdminSidebar userRole={dynamicUser.role} currentTab="workspace" onSignOut={onSignOut} />
      </Box>
      <Drawer open={sidebarOpen} onClose={() => setSidebarOpen(false)} PaperProps={{ sx: { width: 240 } }}>
        <AdminSidebar userRole={dynamicUser.role} currentTab="workspace" onSignOut={onSignOut} isDrawer />
      </Drawer>
      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', ml: { xs: 0, md: '220px' } }}>
        {/* Top Bar with CommonNavbar */}
        <CommonNavbar user={dynamicUser} onSignOut={onSignOut} onToggleSidebar={() => setSidebarOpen(true)} />
        {/* Welcome Section */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pt: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Typography variant="h3" sx={{ fontWeight: 800, color: '#111', textAlign: 'center' }}>
              {`Welcome to ${dynamicWorkspaceName}`}
            </Typography>
          </Box>
          <Typography sx={{ color: '#6b7280', fontWeight: 500, fontSize: 18, mb: 4, textAlign: 'center' }}>
            Bring your team in and start deploying AI personas.
          </Typography>
          <Avatar src={getAvatarUrl(dynamicUser.avatarUrl)} alt={dynamicUser.name} sx={{ width: 80, height: 80, mb: 1.5 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 20, color: '#222' }}>{dynamicUser.name}</Typography>
          </Box>
          <Typography sx={{ color: '#6b7280', fontWeight: 500, fontSize: 16, mb: 3 }}>{dynamicUser.role}</Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 5 }}>
            <Button variant="outlined" sx={{ color: '#222', fontWeight: 700, px: 4, textTransform: 'none', borderRadius: 2, bgcolor: '#f3f6f4', borderColor: '#e0e0e0' }} onClick={onUsePersona}>
              Use Persona
            </Button>
          </Box>
          {/* Quick Stats */}
          <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
            <Paper sx={{ p: 3, minWidth: 180, borderRadius: 3, bgcolor: '#f3f6f4', position: 'relative' }}>
              <Typography sx={{ color: '#6b7280', fontWeight: 500, fontSize: 15, mb: 1 }}>Members</Typography>
              <Typography sx={{ fontWeight: 800, fontSize: 24, color: '#111' }}>
                {loadingStats ? '...' : dynamicStats.members}
              </Typography>
              <Typography sx={{ color: '#9ca3af', fontWeight: 400, fontSize: 12, mt: 0.5 }}>MEMBER users only</Typography>
            </Paper>
            <Paper sx={{ p: 3, minWidth: 180, borderRadius: 3, bgcolor: '#f3f6f4', position: 'relative' }}>
              <Typography sx={{ color: '#6b7280', fontWeight: 500, fontSize: 15, mb: 1 }}>Total Users</Typography>
              <Typography sx={{ fontWeight: 800, fontSize: 24, color: '#111' }}>
                {loadingStats ? '...' : dynamicStats.users}
              </Typography>
              <Typography sx={{ color: '#9ca3af', fontWeight: 400, fontSize: 12, mt: 0.5 }}>All users</Typography>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default WorkspaceDashboard; 