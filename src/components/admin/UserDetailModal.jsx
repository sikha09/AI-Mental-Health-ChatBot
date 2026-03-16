import React from 'react';
import '../../styles/admin/UserDetailModal.css';

const UserDetailModal = ({ user, onClose }) => {
  const formatDate = (d) =>
    d ? new Date(d).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A';

  const rows = [
    { label: 'ID', value: user.id },
    { label: 'Name', value: user.name },
    { label: 'Email', value: user.email },
    { label: 'Auth Provider', value: user.auth_provider },
    { label: 'Verified', value: user.is_verified ? 'Yes' : 'No' },
    { label: 'Admin', value: user.is_admin ? 'Yes' : 'No' },
    { label: 'Joined', value: formatDate(user.created_at) },
    { label: 'Last Updated', value: formatDate(user.updated_at) },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-avatar">
          {user.avatar_url
            ? <img src={user.avatar_url} alt={user.name} className="modal-avatar-img" />
            : <div className="modal-avatar-placeholder">{user.name?.[0]?.toUpperCase() || '?'}</div>
          }
        </div>

        <h2 className="modal-name">{user.name}</h2>
        <p className="modal-email">{user.email}</p>

        <table className="modal-table">
          <tbody>
            {rows.map(({ label, value }) => (
              <tr key={label}>
                <td className="modal-label">{label}</td>
                <td className="modal-value">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserDetailModal;
