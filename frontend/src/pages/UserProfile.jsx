import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UserNavbar from "../components/UserNavbar";
import "./UserProfile.css";

function UserProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      navigate("/user/login");
    } else {
      fetchProfile();
    }
  }, [navigate]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("userToken");
      console.log("Fetching profile with token:", token ? "Token exists" : "No token");
      
      if (!token) {
        setErrorMessage("You are not logged in. Redirecting to login...");
        setTimeout(() => navigate("/user/login"), 2000);
        return;
      }
      
      const res = await axios.get(
        "http://localhost:5000/api/user/profile",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(res.data);
      setPhotoPreview(res.data.profilePicture || null);
      setFormData({
        name: res.data.name || "",
        mobile: res.data.mobile || "",
        dateOfBirth: res.data.dateOfBirth ? new Date(res.data.dateOfBirth).toISOString().split('T')[0] : "",
        gender: res.data.gender || "",
        alternateMobile: res.data.alternateMobile || "",
        emergencyContactName: res.data.emergencyContactName || "",
        emergencyContactNumber: res.data.emergencyContactNumber || "",
        emergencyContactRelation: res.data.emergencyContactRelation || "",
        occupation: res.data.occupation || "",
        numberOfFamilyMembers: res.data.numberOfFamilyMembers || "",
        vehicleDetails: res.data.vehicleDetails || "",
        address: res.data.address || ""
      });
      setLoading(false);
    } catch (err) {
      console.error("Error fetching profile:", err);
      console.error("Error response:", err.response?.data);
      const errorMsg = err.response?.data?.message || "Failed to fetch profile";
      setErrorMessage(errorMsg);
      
      // If token is invalid, redirect to login
      if (err.response?.status === 401) {
        setTimeout(() => {
          localStorage.clear();
          navigate("/user/login");
        }, 2000);
      }
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setPhotoPreview(user.profilePicture || null);
    setPhotoFile(null);
    // Reset form data to original user data
    setFormData({
      name: user.name || "",
      mobile: user.mobile || "",
      dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : "",
      gender: user.gender || "",
      alternateMobile: user.alternateMobile || "",
      emergencyContactName: user.emergencyContactName || "",
      emergencyContactNumber: user.emergencyContactNumber || "",
      emergencyContactRelation: user.emergencyContactRelation || "",
      occupation: user.occupation || "",
      numberOfFamilyMembers: user.numberOfFamilyMembers || "",
      vehicleDetails: user.vehicleDetails || "",
      address: user.address || ""
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Please select an image file');
        setTimeout(() => setErrorMessage(""), 3000);
        return;
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setErrorMessage('Image size must be less than 2MB');
        setTimeout(() => setErrorMessage(""), 3000);
        return;
      }
      
      setPhotoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("userToken");
      console.log("Updating profile with token:", token ? "Token exists" : "No token");
      console.log("Token value:", token);
      
      if (!token) {
        setErrorMessage("You are not logged in. Please log in again.");
        setTimeout(() => navigate("/user/login"), 2000);
        return;
      }
      
      const dataToSend = { ...formData };
      
      // If a new photo was selected, include it
      if (photoFile) {
        dataToSend.profilePicture = photoPreview;
      } else if (photoPreview === null && user.profilePicture) {
        // User removed the photo
        dataToSend.profilePicture = '';
      }
      
      const res = await axios.put(
        "http://localhost:5000/api/user/profile",
        dataToSend,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(res.data.user);
      setPhotoPreview(res.data.user.profilePicture || null);
      setPhotoFile(null);
      setSuccessMessage("Profile updated successfully");
      setEditing(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      console.error("Error response:", err.response?.data);
      const errorMsg = err.response?.data?.message || "Failed to update profile";
      setErrorMessage(errorMsg);
      
      // If token is invalid, redirect to login
      if (err.response?.status === 401) {
        setTimeout(() => {
          localStorage.clear();
          navigate("/user/login");
        }, 2000);
      } else {
        setTimeout(() => setErrorMessage(""), 5000);
      }
    }
  };

  if (loading) {
    return (
      <>
        <UserNavbar />
        <div className="user-profile">
          <div className="loading">Loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <UserNavbar />
      <div className="user-profile">
        <div className="profile-container">
          <div className="profile-header">
            <div className="profile-avatar">
              {photoPreview ? (
                <img src={photoPreview} alt="Profile" className="profile-avatar-img" />
              ) : (
                user.name?.charAt(0).toUpperCase()
              )}
            </div>
            <div className="profile-info">
              <h1>{user.name}</h1>
              <p className="user-id">User ID: {user.userId}</p>
              <p className="apartment">Apartment: {user.apartmentNumber || "Not assigned"}</p>
            </div>
          </div>

          {successMessage && <div className="success-message">{successMessage}</div>}
          {errorMessage && <div className="error-message">{errorMessage}</div>}

          <div className="profile-content">
            <div className="section-header">
              <h2>Personal Information</h2>
              {!editing ? (
                <button className="edit-btn" onClick={handleEdit}>
                  Edit Profile
                </button>
              ) : (
                <div className="action-buttons">
                  <button className="save-btn" onClick={handleSubmit}>
                    Save Changes
                  </button>
                  <button className="cancel-btn" onClick={handleCancel}>
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="profile-form">
              {editing && (
                <div className="photo-upload-section">
                  <label className="photo-upload-label">Profile Photo</label>
                  <div className="photo-upload-container">
                    <div className="photo-preview">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="preview-img" />
                      ) : (
                        <div className="preview-placeholder">
                          <span>No Photo</span>
                        </div>
                      )}
                    </div>
                    <div className="photo-upload-actions">
                      <input
                        type="file"
                        id="photo-upload"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="photo-upload" className="upload-btn">
                        {photoPreview ? 'Change Photo' : 'Upload Photo'}
                      </label>
                      {photoPreview && (
                        <button
                          type="button"
                          className="remove-photo-btn"
                          onClick={handleRemovePhoto}
                        >
                          Remove Photo
                        </button>
                      )}
                      <p className="photo-hint">JPG, PNG or GIF (Max 2MB)</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!editing}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="disabled-field"
                  />
                </div>

                <div className="form-group">
                  <label>Mobile Number</label>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    disabled={!editing}
                  />
                </div>

                <div className="form-group">
                  <label>Alternate Mobile</label>
                  <input
                    type="tel"
                    name="alternateMobile"
                    value={formData.alternateMobile}
                    onChange={handleInputChange}
                    disabled={!editing}
                  />
                </div>

                <div className="form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    disabled={!editing}
                  />
                </div>

                <div className="form-group">
                  <label>Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    disabled={!editing}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Occupation</label>
                  <input
                    type="text"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleInputChange}
                    disabled={!editing}
                  />
                </div>

                <div className="form-group">
                  <label>Number of Family Members</label>
                  <input
                    type="number"
                    name="numberOfFamilyMembers"
                    value={formData.numberOfFamilyMembers}
                    onChange={handleInputChange}
                    disabled={!editing}
                    min="1"
                  />
                </div>
              </div>

              <div className="form-group full-width">
                <label>Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={!editing}
                  rows="3"
                />
              </div>

              <div className="form-group full-width">
                <label>Vehicle Details</label>
                <textarea
                  name="vehicleDetails"
                  value={formData.vehicleDetails}
                  onChange={handleInputChange}
                  disabled={!editing}
                  rows="2"
                  placeholder="e.g., Car - MH12AB1234, Bike - MH12CD5678"
                />
              </div>

              <div className="section-divider"></div>

              <h3>Emergency Contact</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Contact Name</label>
                  <input
                    type="text"
                    name="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={handleInputChange}
                    disabled={!editing}
                  />
                </div>

                <div className="form-group">
                  <label>Contact Number</label>
                  <input
                    type="tel"
                    name="emergencyContactNumber"
                    value={formData.emergencyContactNumber}
                    onChange={handleInputChange}
                    disabled={!editing}
                  />
                </div>

                <div className="form-group">
                  <label>Relation</label>
                  <input
                    type="text"
                    name="emergencyContactRelation"
                    value={formData.emergencyContactRelation}
                    onChange={handleInputChange}
                    disabled={!editing}
                    placeholder="e.g., Spouse, Parent, Sibling"
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default UserProfile;
