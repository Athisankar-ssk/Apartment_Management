import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./AdminDashboard.css";

function CreateAccount() {
  const navigate = useNavigate();

  const [accountType, setAccountType] = useState("user"); // "user" or "security"
  const [form, setForm] = useState({ name: "", email: "", userId: "", apartmentNumber: "", password: "", mobile: "" });
  const [securityForm, setSecurityForm] = useState({ securityId: "", name: "", email: "", password: "", phoneNumber: "" });
  const [floor, setFloor] = useState("");
  const [room, setRoom] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [occupiedRooms, setOccupiedRooms] = useState(new Set());

  // Generate floors A-J (10 floors)
  const floors = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  
  // Generate rooms 01-10 (10 rooms per floor)
  const rooms = Array.from({ length: 10 }, (_, i) => String(i + 1).padStart(2, '0'));

  useEffect(() => {
    fetchOccupiedRooms();
  }, []);

  const fetchOccupiedRooms = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(
        "http://localhost:5000/api/admin/users",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Extract apartment numbers and create a Set of occupied room IDs
      const occupied = new Set();
      res.data.forEach(user => {
        if (user.apartmentNumber) {
          occupied.add(user.apartmentNumber);
        }
      });
      setOccupiedRooms(occupied);
    } catch (err) {
      console.error("Error fetching occupied rooms:", err);
    }
  };

  const isRoomOccupied = (selectedFloor, selectedRoom) => {
    if (!selectedFloor || !selectedRoom) return false;
    const apartmentId = `AUM-${selectedFloor}${selectedFloor.charCodeAt(0) - 64}${selectedRoom}`;
    return occupiedRooms.has(apartmentId);
  };

  const validateField = (name, value) => {
    switch(name) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "" : "Invalid email format";
      case 'name':
        return value.length >= 2 ? "" : "Name must be at least 2 characters";
      case 'userId':
        return value.length >= 3 ? "" : "User ID must be at least 3 characters";
      case 'securityId':
        return value.length >= 3 ? "" : "Security ID must be at least 3 characters";
      case 'password':
        return value.length >= 6 ? "" : "Password must be at least 6 characters";
      case 'mobile':
        return !value || /^[0-9]{10}$/.test(value) ? "" : "Mobile must be 10 digits";
      case 'phoneNumber':
        return /^[0-9]{10}$/.test(value) ? "" : "Phone number must be 10 digits";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors({ ...errors, [name]: error });
    }
  };

  const handleFloorChange = (e) => {
    const selectedFloor = e.target.value;
    setFloor(selectedFloor);
    // Update apartment number and userId if both floor and room are selected
    if (selectedFloor && room) {
      const apartmentNumber = `AUM-${selectedFloor}${selectedFloor.charCodeAt(0) - 64}${room}`;
      const userId = apartmentNumber; // Use apartment number as user ID
      setForm({ ...form, apartmentNumber, userId });
    }
  };

  const handleRoomChange = (e) => {
    const selectedRoom = e.target.value;
    setRoom(selectedRoom);
    // Update apartment number and userId if both floor and room are selected
    if (floor && selectedRoom) {
      const apartmentNumber = `AUM-${floor}${floor.charCodeAt(0) - 64}${selectedRoom}`;
      const userId = apartmentNumber; // Use apartment number as user ID
      setForm({ ...form, apartmentNumber, userId });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    const error = validateField(name, value);
    setErrors({ ...errors, [name]: error });
  };

  const handleSecurityChange = (e) => {
    const { name, value } = e.target;
    setSecurityForm({ ...securityForm, [name]: value });
    
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors({ ...errors, [name]: error });
    }
  };

  const handleAccountTypeChange = (e) => {
    const newType = e.target.value;
    setAccountType(newType);
    setMessage("");
    setErrors({});
    setTouched({});
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setMessage("");
    
    
    const newErrors = {};
    Object.keys(form).forEach(key => {
      const error = validateField(key, form[key]);
      if (error) newErrors[key] = error;
    });
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched(Object.keys(form).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.post(
        "http://localhost:5000/api/admin/create-user",
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message || "✓ User created successfully");
      setForm({ name: "", email: "", userId: "", apartmentNumber: "", password: "", mobile: "" });
      setFloor("");
      setRoom("");
      setErrors({});
      setTouched({});
      // Refresh occupied rooms list
      fetchOccupiedRooms();
    } catch (err) {
      const msg = err?.response?.data?.message || "Error creating user";
      setMessage("✗ " + msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSecurity = async (e) => {
    e.preventDefault();
    setMessage("");
    
    const newErrors = {};
    Object.keys(securityForm).forEach(key => {
      const error = validateField(key, securityForm[key]);
      if (error) newErrors[key] = error;
    });
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched(Object.keys(securityForm).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.post(
        "http://localhost:5000/api/security/create",
        securityForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message || "✓ Security account created successfully");
      setSecurityForm({ securityId: "", name: "", email: "", password: "", phoneNumber: "" });
      setErrors({});
      setTouched({});
    } catch (err) {
      const msg = err?.response?.data?.message || "Error creating security account";
      setMessage("✗ " + msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="admin-dashboard">
        <header className="admin-header">
          <h1>Create Account</h1>
          <p className="subtitle">Add a new user or security account to the apartment management system</p>
        </header>

        <section className="admin-grid">
          <div className="card create-card">
            <h3>Account Type</h3>
            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label className="label">Select Account Type *</label>
              <select 
                value={accountType}
                onChange={handleAccountTypeChange}
                className="form-input"
                required
              >
                <option value="user">User (Resident)</option>
                <option value="security">Security</option>
              </select>
            </div>

            {message && <div className={message.includes('✓') ? 'success-message' : 'error-message'}>{message}</div>}
            
            {accountType === "user" ? (
              <form onSubmit={handleCreateUser} className="create-user-form">
                <h3 style={{ marginBottom: '1rem' }}>User Information</h3>
                <div className="form-grid">
                <div className="form-group">
                  <label className="label">User Name *</label>
                  <input 
                    name="name" 
                    value={form.name} 
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`form-input ${touched.name && errors.name ? 'input-error' : ''}`}
                    required 
                  />
                  {touched.name && errors.name && <span className="field-error">{errors.name}</span>}
                </div>
                
                <div className="form-group">
                  <label className="label">User Email *</label>
                  <input 
                    name="email" 
                    type="email"
                    value={form.email} 
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`form-input ${touched.email && errors.email ? 'input-error' : ''}`}
                    required 
                  />
                  {touched.email && errors.email && <span className="field-error">{errors.email}</span>}
                </div>
                
                <div className="form-group">
                  <label className="label">User ID (Auto-generated)</label>
                  <input 
                    name="userId" 
                    value={form.userId} 
                    className="form-input"
                    readOnly
                    placeholder="Select floor and room to generate"
                    style={{ backgroundColor: '#f8fafc', cursor: 'not-allowed' }}
                  />
                </div>
                
                <div className="form-group">
                  <label className="label">Floor *</label>
                  <select 
                    value={floor}
                    onChange={handleFloorChange}
                    className="form-input"
                    required
                  >
                    <option value="">Select Floor</option>
                    {floors.map(f => (
                      <option key={f} value={f}>Floor {f}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="label">Room Number *</label>
                  <select 
                    value={room}
                    onChange={handleRoomChange}
                    className="form-input"
                    required
                    disabled={!floor}
                  >
                    <option value="">{!floor ? "Select floor first" : "Select Room"}</option>
                    {rooms.map(r => {
                      const occupied = isRoomOccupied(floor, r);
                      return (
                        <option 
                          key={r} 
                          value={r}
                          disabled={occupied}
                          style={occupied ? { color: '#ccc', fontStyle: 'italic' } : {}}
                        >
                          Room {r} {occupied ? '(Occupied)' : ''}
                        </option>
                      );
                    })}
                  </select>
                  {floor && occupiedRooms.size > 0 && (
                    <span style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
                      Grayed out rooms are already occupied
                    </span>
                  )}
                </div>
                
                <div className="form-group">
                  <label className="label">Apartment Number</label>
                  <input 
                    name="apartmentNumber" 
                    value={form.apartmentNumber} 
                    className="form-input" 
                    readOnly
                    placeholder="Auto-generated based on floor and room"
                    style={{ backgroundColor: '#f8fafc', cursor: 'not-allowed' }}
                  />
                </div>
                
                <div className="form-group">
                  <label className="label">Password *</label>
                  <input 
                    name="password" 
                    type="password" 
                    value={form.password} 
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`form-input ${touched.password && errors.password ? 'input-error' : ''}`}
                    required 
                  />
                  {touched.password && errors.password && <span className="field-error">{errors.password}</span>}
                </div>
                
                <div className="form-group">
                  <label className="label">Mobile Number</label>
                  <input 
                    name="mobile" 
                    value={form.mobile} 
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`form-input ${touched.mobile && errors.mobile ? 'input-error' : ''}`}
                    placeholder="10 digits"
                  />
                  {touched.mobile && errors.mobile && <span className="field-error">{errors.mobile}</span>}
                </div>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn outline" 
                  onClick={() => navigate('/admin/dashboard')}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  className="btn primary" 
                  type="submit" 
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
            ) : (
              <form onSubmit={handleCreateSecurity} className="create-user-form">
                <h3 style={{ marginBottom: '1rem' }}>Security Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="label">Security ID *</label>
                    <input 
                      name="securityId" 
                      value={securityForm.securityId} 
                      onChange={handleSecurityChange}
                      onBlur={handleBlur}
                      className={`form-input ${touched.securityId && errors.securityId ? 'input-error' : ''}`}
                      placeholder="e.g., SEC001"
                      required 
                    />
                    {touched.securityId && errors.securityId && <span className="field-error">{errors.securityId}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label className="label">Name *</label>
                    <input 
                      name="name" 
                      value={securityForm.name} 
                      onChange={handleSecurityChange}
                      onBlur={handleBlur}
                      className={`form-input ${touched.name && errors.name ? 'input-error' : ''}`}
                      required 
                    />
                    {touched.name && errors.name && <span className="field-error">{errors.name}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label className="label">Email ID *</label>
                    <input 
                      name="email" 
                      type="email"
                      value={securityForm.email} 
                      onChange={handleSecurityChange}
                      onBlur={handleBlur}
                      className={`form-input ${touched.email && errors.email ? 'input-error' : ''}`}
                      required 
                    />
                    {touched.email && errors.email && <span className="field-error">{errors.email}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label className="label">Password *</label>
                    <input 
                      name="password" 
                      type="password" 
                      value={securityForm.password} 
                      onChange={handleSecurityChange}
                      onBlur={handleBlur}
                      className={`form-input ${touched.password && errors.password ? 'input-error' : ''}`}
                      required 
                    />
                    {touched.password && errors.password && <span className="field-error">{errors.password}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label className="label">Phone Number *</label>
                    <input 
                      name="phoneNumber" 
                      value={securityForm.phoneNumber} 
                      onChange={handleSecurityChange}
                      onBlur={handleBlur}
                      className={`form-input ${touched.phoneNumber && errors.phoneNumber ? 'input-error' : ''}`}
                      placeholder="10 digits"
                      required 
                    />
                    {touched.phoneNumber && errors.phoneNumber && <span className="field-error">{errors.phoneNumber}</span>}
                  </div>
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn outline" 
                    onClick={() => navigate('/admin/dashboard')}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn primary" 
                    type="submit" 
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Security Account'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </div>
    </>
  );
}

export default CreateAccount;
