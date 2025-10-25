import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../utils/apiClient';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import Button from '../common/Button';
import AdminNavbar from './AdminNavbar';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [myItems, setMyItems] = useState([]);
  const [userItems, setUserItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showActiveOnly, setShowActiveOnly] = useState(false);

  // Initialize dark mode state
  useEffect(() => {
    setIsDarkMode(
      localStorage.getItem("darkMode") === "true" ||
        (!localStorage.getItem("darkMode") &&
          window.matchMedia("(prefers-color-scheme: dark)").matches),
    );
  }, []);

  useEffect(() => {
    if (!isAdmin()) {
      setError('Access denied. Admin privileges required.');
      setLoading(false);
      return;
    }

    // Fetch real data from API
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch users
        const usersResponse = await apiClient.get('/api/users');
        if (usersResponse.success) {
          setUsers(usersResponse.data);
        } else {
          console.error('Failed to fetch users:', usersResponse.error);
        }
        
        // Fetch admin's own items
        const myItemsResponse = await apiClient.get(`/api/items?user_id=${user.id}`);
        if (myItemsResponse.success) {
          setMyItems(myItemsResponse.data);
        } else {
          console.error('Failed to fetch admin items:', myItemsResponse.error);
        }
        
        // Fetch all user items (excluding admin's own items)
        const userItemsResponse = await apiClient.get('/api/items?status=pending');
        if (userItemsResponse.success) {
          setUserItems(userItemsResponse.data.filter(item => item.user?.id !== user.id));
        } else {
          console.error('Failed to fetch user items:', userItemsResponse.error);
        }
        
        // Fetch active users
        const activeUsersResponse = await apiClient.get('/api/users/active');
        if (activeUsersResponse.success) {
          setActiveUsers(activeUsersResponse.data);
        } else {
          console.error('Failed to fetch active users:', activeUsersResponse.error);
        }
        
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAdmin, user?.id]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesActiveFilter = !showActiveOnly || user.status === 'online';
    return matchesSearch && matchesActiveFilter;
  });

  const filteredMyItems = myItems.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUserItems = userItems.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUserAction = async (userId, action) => {
    try {
      if (action === 'edit') {
        console.log(`Edit user ${userId}`);
        alert('User editing functionality would be implemented here');
      } else if (action === 'delete') {
        if (window.confirm('Are you sure you want to delete this user?')) {
          const response = await apiClient.delete(`/api/users/${userId}`);
          if (response.success) {
            // Refresh the users list
            const usersResponse = await apiClient.get('/api/users');
            if (usersResponse.success) {
              setUsers(usersResponse.data);
            }
          } else {
            alert('Failed to delete user: ' + response.error);
          }
        }
      }
    } catch (err) {
      console.error('User action error:', err);
      alert('An error occurred while processing user action');
    }
  };

  const handleItemAction = async (itemId, action) => {
    try {
      if (action === 'edit') {
        navigate(`/edit-item/${itemId}`);
      } else if (action === 'delete') {
        if (window.confirm('Are you sure you want to delete this item?')) {
          const response = await apiClient.delete(`/api/items/${itemId}`);
          if (response.success) {
            // Refresh the appropriate items list
            await refreshItems();
          } else {
            alert('Failed to delete item: ' + response.error);
          }
        }
      } else if (action === 'approve') {
        const response = await apiClient.put(`/api/items/${itemId}/status`, { status: 'active' });
        if (response.success) {
          await refreshItems();
        } else {
          alert('Failed to approve item: ' + response.error);
        }
      } else if (action === 'reject') {
        const response = await apiClient.put(`/api/items/${itemId}/status`, { status: 'rejected' });
        if (response.success) {
          await refreshItems();
        } else {
          alert('Failed to reject item: ' + response.error);
        }
      }
    } catch (err) {
      console.error('Item action error:', err);
      alert('An error occurred while processing item action');
    }
  };

  const refreshItems = async () => {
    try {
      // Refresh admin's items
      const myItemsResponse = await apiClient.get(`/api/items?user_id=${user.id}`);
      if (myItemsResponse.success) {
        setMyItems(myItemsResponse.data);
      }

      // Refresh user items
      const userItemsResponse = await apiClient.get('/api/items?status=pending');
      if (userItemsResponse.success) {
        setUserItems(userItemsResponse.data.filter(item => item.user?.id !== user.id));
      }
    } catch (err) {
      console.error('Error refreshing items:', err);
    }
  };

  const refreshUserStatus = async () => {
    try {
      // Refresh all users
      const usersResponse = await apiClient.get('/api/users');
      if (usersResponse.success) {
        setUsers(usersResponse.data);
      }

      // Refresh active users
      const activeUsersResponse = await apiClient.get('/api/users/active');
      if (activeUsersResponse.success) {
        setActiveUsers(activeUsersResponse.data);
      }
    } catch (err) {
      console.error('Error refreshing user status:', err);
    }
  };

  // Set up periodic refresh for user status (every 2 minutes)
  useEffect(() => {
    if (isAdmin() && activeTab === 'users') {
      const interval = setInterval(refreshUserStatus, 2 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [isAdmin, activeTab]);

  const handleCreateItem = () => {
    navigate('/create-item');
  };

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <LoadingSpinner />
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard-error">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <AdminNavbar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      
      <div className="admin-dashboard-content">
        <div className="dashboard-header">
          <div className="dashboard-header-content">
            <div className="dashboard-title-section">
              <h1 className="dashboard-title">Admin Dashboard</h1>
              <p className="dashboard-subtitle">Manage your marketplace with powerful tools</p>
            </div>
            <div className="dashboard-stats">
              <div className="stat-card">
                <div className="stat-icon">
                  <span className="material-symbols-outlined">people</span>
                </div>
                <div className="stat-content">
                  <h3 className="stat-number">{users.length}</h3>
                  <p className="stat-label">Total Users</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <span className="material-symbols-outlined">inventory_2</span>
                </div>
                <div className="stat-content">
                  <h3 className="stat-number">{myItems.length}</h3>
                  <p className="stat-label">My Items</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <span className="material-symbols-outlined">pending_actions</span>
                </div>
                <div className="stat-content">
                  <h3 className="stat-number">{userItems.length}</h3>
                  <p className="stat-label">Pending Approval</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-tabs">
          <button 
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <span className="material-symbols-outlined">dashboard</span>
            Overview
          </button>
          <button 
            className={`tab-button ${activeTab === 'my-items' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-items')}
          >
            <span className="material-symbols-outlined">inventory_2</span>
            My Items ({myItems.length})
          </button>
          <button 
            className={`tab-button ${activeTab === 'user-items' ? 'active' : ''}`}
            onClick={() => setActiveTab('user-items')}
          >
            <span className="material-symbols-outlined">public</span>
            Community Items ({userItems.length})
          </button>
          <button 
            className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <span className="material-symbols-outlined">people</span>
            Users ({users.length})
          </button>
        </div>

        <div className="dashboard-content">
          <div className="search-bar">
            <div className="search-wrapper">
              <span className="search-icon">
                <span className="material-symbols-outlined">search</span>
              </span>
              <input
                type="text"
                placeholder="Search across all data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="overview-header">
              <h2 className="overview-title">Dashboard Overview</h2>
              <p className="overview-subtitle">Quick access to your most important admin functions</p>
            </div>
            <div className="overview-grid">
              <div className="overview-card">
                <div className="overview-card-header">
                  <span className="material-symbols-outlined overview-card-icon">add_circle</span>
                  <h3>Quick Actions</h3>
                </div>
                <div className="overview-card-content">
                  <Button onClick={handleCreateItem} variant="primary" fullWidth>
                    <span className="material-symbols-outlined">add</span>
                    Create New Item
                  </Button>
                </div>
              </div>
              <div className="overview-card">
                <div className="overview-card-header">
                  <span className="material-symbols-outlined overview-card-icon">activity</span>
                  <h3>Recent Activity</h3>
                </div>
                <div className="overview-card-content">
                  <p>Recent items and user activity will appear here</p>
                </div>
              </div>
              <div className="overview-card">
                <div className="overview-card-header">
                  <span className="material-symbols-outlined overview-card-icon">trending_up</span>
                  <h3>Analytics</h3>
                </div>
                <div className="overview-card-content">
                  <p>View detailed analytics and insights</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'my-items' && (
          <div className="my-items-section">
            <div className="section-header">
              <div className="section-title">
                <h2>My Items</h2>
                <p>Manage your own marketplace listings</p>
              </div>
              <Button onClick={handleCreateItem} variant="primary">
                <span className="material-symbols-outlined">add</span>
                Create New Item
              </Button>
            </div>
            <div className="items-table">
              {filteredMyItems.length === 0 ? (
                <p>No items found. Create your first item!</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMyItems.map((item) => (
                      <tr key={item.id}>
                        <td>{item.title}</td>
                        <td>{item.category}</td>
                        <td>${item.price}</td>
                        <td>
                          <span className={`status-badge ${item.status}`}>
                            {item.status}
                          </span>
                        </td>
                        <td>{new Date(item.created_at).toLocaleDateString()}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              onClick={() => handleItemAction(item.id, 'edit')}
                              className="edit-btn"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleItemAction(item.id, 'delete')}
                              className="delete-btn"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === 'user-items' && (
          <div className="user-items-section">
            <div className="section-header">
              <div className="section-title">
                <h2>Community Items</h2>
                <p>Review and approve items submitted by users</p>
              </div>
            </div>
            <div className="items-table">
              {filteredUserItems.length === 0 ? (
                <p>No pending items to review.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Seller</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUserItems.map((item) => (
                      <tr key={item.id}>
                        <td>{item.title}</td>
                        <td>{item.category}</td>
                        <td>${item.price}</td>
                        <td>{item.user?.name || 'Unknown'}</td>
                        <td>{new Date(item.created_at).toLocaleDateString()}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              onClick={() => handleItemAction(item.id, 'approve')}
                              className="approve-btn"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleItemAction(item.id, 'reject')}
                              className="reject-btn"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-section">
            <div className="section-header">
              <div className="section-title">
                <h2>User Management</h2>
                <p>View and manage all registered users</p>
              </div>
              <div className="user-controls">
                <div className="active-users-toggle">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={showActiveOnly}
                      onChange={(e) => setShowActiveOnly(e.target.checked)}
                      className="toggle-input"
                    />
                    <span className="toggle-text">Show Active Only</span>
                  </label>
                  <div className="active-users-count">
                    <span className="online-indicator"></span>
                    {activeUsers.length} Active Users
                  </div>
                </div>
                <button onClick={refreshUserStatus} className="refresh-btn">
                  <span className="material-symbols-outlined">refresh</span>
                  Refresh
                </button>
              </div>
            </div>
            <div className="users-table">
              {filteredUsers.length === 0 ? (
                <p>No users found.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Last Activity</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <div className="user-status">
                            <span className={`status-indicator ${user.status}`}></span>
                            <span className="status-text">{user.status}</span>
                          </div>
                        </td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`role-badge ${user.role}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>
                          {user.lastActivity ? 
                            new Date(user.lastActivity).toLocaleDateString() + ' ' + 
                            new Date(user.lastActivity).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                            : 'Never'
                          }
                        </td>
                        <td>{new Date(user.created_at).toLocaleDateString()}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              onClick={() => handleUserAction(user.id, 'edit')}
                              className="edit-btn"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleUserAction(user.id, 'delete')}
                              className="delete-btn"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default AdminDashboard;