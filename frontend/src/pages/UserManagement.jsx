import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./UserManagement.css";

function UserManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [viewingUser, setViewingUser] = useState(null);
  const [searchMobile, setSearchMobile] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
    } else {
      fetchUsers();
    }
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(
        "http://localhost:5000/api/admin/users",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(res.data);
      setFilteredUsers(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching users:", err);
      setErrorMessage("Failed to fetch users");
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingId(user._id);
    setEditFormData({
      name: user.name,
      email: user.email,
      userId: user.userId,
      apartmentNumber: user.apartmentNumber,
      mobile: user.mobile
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdate = async (userId) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.put(
        `http://localhost:5000/api/admin/users/${userId}`,
        editFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMessage("User updated successfully");
      setEditingId(null);
      setEditFormData({});
      fetchUsers();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error updating user:", err);
      setErrorMessage(err.response?.data?.message || "Failed to update user");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const token = localStorage.getItem("adminToken");
        await axios.delete(
          `http://localhost:5000/api/admin/users/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccessMessage("User deleted successfully");
        fetchUsers();
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (err) {
        console.error("Error deleting user:", err);
        setErrorMessage(err.response?.data?.message || "Failed to delete user");
        setTimeout(() => setErrorMessage(""), 3000);
      }
    }
  };

  const handleBackClick = () => {
    navigate("/admin/dashboard");
  };

  const handleSearchMobile = (e) => {
    const value = e.target.value;
    setSearchMobile(value);
    if (value.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.mobile && user.mobile.includes(value)
      );
      setFilteredUsers(filtered);
    }
  };

  const handleViewFullDetails = async (user) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(
        `http://localhost:5000/api/admin/users/${user._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setViewingUser(res.data);
    } catch (err) {
      console.error("Error fetching user details:", err);
      setErrorMessage("Failed to fetch user details");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const handleCloseFullDetails = () => {
    setViewingUser(null);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="user-management">
          <div className="loading">Loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="user-management">
        <div className="user-management-header">
          <button className="back-btn" onClick={handleBackClick}>
            ← Back to Dashboard
          </button>
          <h1>User Management</h1>
          <p className="user-count">Total Users: {users.length}</p>
        </div>

        {successMessage && <div className="success-message">{successMessage}</div>}
        {errorMessage && <div className="error-message">{errorMessage}</div>}

        <div className="search-container">
          <input
            type="text"
            placeholder="Search by mobile number..."
            value={searchMobile}
            onChange={handleSearchMobile}
            className="search-input"
          />
          {searchMobile && (
            <button className="clear-search" onClick={() => { setSearchMobile(""); setFilteredUsers(users); }}>Clear</button>
          )}
        </div>

        <div className="users-container">
          {filteredUsers.length === 0 ? (
            <p className="no-users">{searchMobile ? "No users found with that mobile number" : "No users found"}</p>
          ) : (
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>User ID</th>
                  <th>Apartment</th>
                  <th>Mobile</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user._id} className={editingId === user._id ? "editing" : ""}>
                    {editingId === user._id ? (
                      <>
                        <td>
                          <input
                            type="text"
                            name="name"
                            value={editFormData.name}
                            onChange={handleInputChange}
                            placeholder="Name"
                          />
                        </td>
                        <td>
                          <input
                            type="email"
                            name="email"
                            value={editFormData.email}
                            onChange={handleInputChange}
                            placeholder="Email"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            name="userId"
                            value={editFormData.userId}
                            onChange={handleInputChange}
                            placeholder="User ID"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            name="apartmentNumber"
                            value={editFormData.apartmentNumber}
                            onChange={handleInputChange}
                            placeholder="Apartment"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            name="mobile"
                            value={editFormData.mobile}
                            onChange={handleInputChange}
                            placeholder="Mobile"
                          />
                        </td>
                        <td className="action-buttons">
                          <button
                            className="save-btn"
                            onClick={() => handleUpdate(user._id)}
                          >
                            Save
                          </button>
                          <button
                            className="cancel-btn"
                            onClick={handleCancel}
                          >
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.userId}</td>
                        <td>{user.apartmentNumber || "-"}</td>
                        <td>{user.mobile || "-"}</td>
                        <td className="action-buttons">
                          <button
                            className="view-btn"
                            onClick={() => handleViewFullDetails(user)}
                          >
                            View Full Details
                          </button>
                          <button
                            className="edit-btn"
                            onClick={() => handleEdit(user)}
                          >
                            Edit
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(user._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {viewingUser && (
          <div className="modal-overlay" onClick={handleCloseFullDetails}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Full User Details</h2>
                <button className="close-modal" onClick={handleCloseFullDetails}>×</button>
              </div>
              <div className="modal-body">
                <div className="form-section">
                  <h3>Basic Information</h3>
                  <div className="form-row">
                    <div className="detail-group">
                      <label>Name</label>
                      <p>{viewingUser.name || '-'}</p>
                    </div>
                    <div className="detail-group">
                      <label>Email</label>
                      <p>{viewingUser.email || '-'}</p>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="detail-group">
                      <label>User ID</label>
                      <p>{viewingUser.userId || '-'}</p>
                    </div>
                    <div className="detail-group">
                      <label>Apartment Number</label>
                      <p>{viewingUser.apartmentNumber || '-'}</p>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="detail-group">
                      <label>Mobile</label>
                      <p>{viewingUser.mobile || '-'}</p>
                    </div>
                    <div className="detail-group">
                      <label>Alternate Mobile</label>
                      <p>{viewingUser.alternateMobile || '-'}</p>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Personal Information</h3>
                  <div className="form-row">
                    <div className="detail-group">
                      <label>Date of Birth</label>
                      <p>{viewingUser.dateOfBirth ? new Date(viewingUser.dateOfBirth).toLocaleDateString() : '-'}</p>
                    </div>
                    <div className="detail-group">
                      <label>Gender</label>
                      <p>{viewingUser.gender || '-'}</p>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="detail-group">
                      <label>Occupation</label>
                      <p>{viewingUser.occupation || '-'}</p>
                    </div>
                    <div className="detail-group">
                      <label>Number of Family Members</label>
                      <p>{viewingUser.numberOfFamilyMembers || '-'}</p>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Emergency Contact</h3>
                  <div className="form-row">
                    <div className="detail-group">
                      <label>Contact Name</label>
                      <p>{viewingUser.emergencyContactName || '-'}</p>
                    </div>
                    <div className="detail-group">
                      <label>Contact Number</label>
                      <p>{viewingUser.emergencyContactNumber || '-'}</p>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="detail-group">
                      <label>Relation</label>
                      <p>{viewingUser.emergencyContactRelation || '-'}</p>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Other Details</h3>
                  <div className="detail-group full-width">
                    <label>Vehicle Details</label>
                    <p>{viewingUser.vehicleDetails || '-'}</p>
                  </div>
                  <div className="detail-group full-width">
                    <label>Address</label>
                    <p className="address-text">{viewingUser.address || '-'}</p>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="close-btn" onClick={handleCloseFullDetails}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default UserManagement;
