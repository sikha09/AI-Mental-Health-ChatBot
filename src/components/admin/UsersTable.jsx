import React, { useEffect, useState, useCallback } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import UserDetailModal from './UserDetailModal';
import '../../styles/admin/UsersTable.css';

const BACKEND_URL = 'http://localhost:5001';

const UsersTable = () => {
  const { adminToken, handleAdminAuthError } = useAdminAuth();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1, limit: 15 });
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [toast, setToast] = useState(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = useCallback(
    (page = 1) => {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: 15 });
      if (debouncedSearch) params.append('search', debouncedSearch);

      fetch(`${BACKEND_URL}/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      })
        .then((res) => {
          if (handleAdminAuthError(res)) return;
          return res.json();
        })
        .then((data) => {
          if (!data) return; // Already handled by handleAdminAuthError
          if (data.success) {
            setUsers(data.users);
            setPagination(data.pagination);
          } else {
            showToast(data.message || 'Failed to fetch users', 'error');
          }
        })
        .catch(() => showToast('Could not connect to server', 'error'))
        .finally(() => setLoading(false));
    },
    [adminToken, debouncedSearch, handleAdminAuthError]
  );

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete user "${user.name}" (${user.email})?`)) return;
    setActionLoading(user.id + '-delete');
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/users/${user.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (handleAdminAuthError(res)) return;
      const data = await res.json();
      if (data.success) {
        showToast('User deleted');
        fetchUsers(pagination.page);
      } else {
        showToast(data.message, 'error');
      }
    } catch {
      showToast('Delete failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="users-section">
      {toast && <div className={`admin-toast admin-toast--${toast.type}`}>{toast.msg}</div>}

      <div className="users-header">
        <h2 className="users-heading">User Management</h2>
        <div className="users-search-wrap">
          <span className="search-icon">🔍</span>
          <input
            id="user-search"
            className="users-search"
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="users-meta">
        Showing {users.length} of {pagination.total} users
      </div>

      {loading ? (
        <div className="users-loading">Loading users…</div>
      ) : (
        <div className="table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Provider</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="no-users">No users found</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td className="col-id">{user.id}</td>
                    <td className="col-user">
                      <div className="user-avatar-mini">{user.name?.[0]?.toUpperCase() || '?'}</div>
                      <div>
                        <div className="user-name-cell">
                          {user.name}
                          {user.is_admin ? <span className="badge badge-admin">Admin</span> : null}
                        </div>
                        <div className="user-email-cell">{user.email}</div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-provider badge-${user.auth_provider}`}>
                        {user.auth_provider}
                      </span>
                    </td>
                    <td>
                      {user.is_verified
                        ? <span className="badge badge-verified">Verified</span>
                        : <span className="badge badge-unverified">Unverified</span>}
                    </td>
                    <td className="col-date">{formatDate(user.created_at)}</td>
                    <td className="col-actions">
                      <button
                        className="action-btn action-btn--view"
                        title="View details"
                        onClick={() => setSelectedUser(user)}
                      >👁️</button>
                      <button
                        className="action-btn action-btn--delete"
                        title="Delete"
                        disabled={actionLoading === user.id + '-delete'}
                        onClick={() => handleDelete(user)}
                      >🗑️</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            disabled={pagination.page === 1}
            onClick={() => fetchUsers(pagination.page - 1)}
          >← Prev</button>
          <span className="page-info">Page {pagination.page} of {pagination.totalPages}</span>
          <button
            className="page-btn"
            disabled={pagination.page === pagination.totalPages}
            onClick={() => fetchUsers(pagination.page + 1)}
          >Next →</button>
        </div>
      )}

      {selectedUser && (
        <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
};

export default UsersTable;