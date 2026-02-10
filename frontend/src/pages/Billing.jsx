import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./Billing.css";

function Billing() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("maintenance");
  const [maintenanceBills, setMaintenanceBills] = useState([]);
  const [electricityBills, setElectricityBills] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [billType, setBillType] = useState("");
  
  // Form states for creating bills
  const [formData, setFormData] = useState({
    userId: "",
    month: "",
    year: new Date().getFullYear(),
    amount: "",
    unitsConsumed: "",
    ratePerUnit: "",
    dueDate: ""
  });

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
      return;
    }
    fetchBills();
    fetchUsers();
  }, [navigate]);

  const fetchBills = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const [maintenanceRes, electricityRes] = await Promise.all([
        axios.get("http://localhost:5000/api/billing/maintenance", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get("http://localhost:5000/api/billing/electricity", {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setMaintenanceBills(maintenanceRes.data);
      setElectricityBills(electricityRes.data);
    } catch (err) {
      console.error("Error fetching bills:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get("http://localhost:5000/api/user/all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateBill = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("adminToken");
      const endpoint = billType === "maintenance" 
        ? "http://localhost:5000/api/billing/maintenance" 
        : "http://localhost:5000/api/billing/electricity";
      
      const payload = billType === "maintenance"
        ? {
            userId: formData.userId,
            month: formData.month,
            year: parseInt(formData.year),
            amount: parseFloat(formData.amount),
            dueDate: formData.dueDate
          }
        : {
            userId: formData.userId,
            month: formData.month,
            year: parseInt(formData.year),
            unitsConsumed: parseFloat(formData.unitsConsumed),
            ratePerUnit: parseFloat(formData.ratePerUnit),
            dueDate: formData.dueDate
          };

      await axios.post(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Bill created successfully!");
      setShowCreateModal(false);
      resetForm();
      fetchBills();
    } catch (err) {
      console.error("Error creating bill:", err);
      alert("Failed to create bill: " + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdateStatus = async (billId, type, newStatus) => {
    try {
      const token = localStorage.getItem("adminToken");
      const endpoint = type === "maintenance"
        ? `http://localhost:5000/api/billing/maintenance/${billId}`
        : `http://localhost:5000/api/billing/electricity/${billId}`;

      const updateData = { status: newStatus };
      if (newStatus === "Paid") {
        updateData.paidDate = new Date();
      }

      await axios.put(endpoint, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Bill status updated successfully!");
      fetchBills();
    } catch (err) {
      console.error("Error updating bill:", err);
      alert("Failed to update bill status");
    }
  };

  const handleDeleteBill = async (billId, type) => {
    if (!window.confirm("Are you sure you want to delete this bill?")) {
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      const endpoint = type === "maintenance"
        ? `http://localhost:5000/api/billing/maintenance/${billId}`
        : `http://localhost:5000/api/billing/electricity/${billId}`;

      await axios.delete(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Bill deleted successfully!");
      fetchBills();
    } catch (err) {
      console.error("Error deleting bill:", err);
      alert("Failed to delete bill");
    }
  };

  const resetForm = () => {
    setFormData({
      userId: "",
      month: "",
      year: new Date().getFullYear(),
      amount: "",
      unitsConsumed: "",
      ratePerUnit: "",
      dueDate: ""
    });
  };

  const openCreateModal = (type) => {
    setBillType(type);
    setShowCreateModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return '#4caf50';
      case 'Unpaid': return '#ff9800';
      case 'Overdue': return '#f44336';
      default: return '#757575';
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="billing-container">
          <p className="loading">Loading bills...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="billing-container">
        <header className="billing-header">
          <h1>Billing Management</h1>
          <p>Manage monthly maintenance and electricity bills for all residents</p>
        </header>

        <div className="billing-tabs">
          <button
            className={`tab-btn ${activeTab === "maintenance" ? "active" : ""}`}
            onClick={() => setActiveTab("maintenance")}
          >
            Monthly Maintenance Bills
          </button>
          <button
            className={`tab-btn ${activeTab === "electricity" ? "active" : ""}`}
            onClick={() => setActiveTab("electricity")}
          >
            Electricity Bills
          </button>
        </div>

        <div className="billing-content">
          {activeTab === "maintenance" ? (
            <div className="bill-section">
              <div className="section-header">
                <h2>Monthly Maintenance Bills</h2>
                <button
                  className="btn-primary"
                  onClick={() => openCreateModal("maintenance")}
                >
                  + Create Maintenance Bill
                </button>
              </div>

              <div className="bills-table-container">
                {maintenanceBills.length === 0 ? (
                  <p className="no-data">No maintenance bills found</p>
                ) : (
                  <table className="bills-table">
                    <thead>
                      <tr>
                        <th>User ID</th>
                        <th>Name</th>
                        <th>Apt No.</th>
                        <th>Month/Year</th>
                        <th>Amount</th>
                        <th>Due Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {maintenanceBills.map((bill) => (
                        <tr key={bill._id}>
                          <td>{bill.userId}</td>
                          <td>{bill.userName}</td>
                          <td>{bill.apartmentNumber}</td>
                          <td>{bill.month} {bill.year}</td>
                          <td>₹{bill.amount}</td>
                          <td>{formatDate(bill.dueDate)}</td>
                          <td>
                            <span
                              className="status-badge"
                              style={{ backgroundColor: getStatusColor(bill.status) }}
                            >
                              {bill.status}
                            </span>
                          </td>
                          <td className="action-buttons">
                            {bill.status !== "Paid" && (
                              <button
                                className="btn-small btn-success"
                                onClick={() => handleUpdateStatus(bill._id, "maintenance", "Paid")}
                              >
                                Mark Paid
                              </button>
                            )}
                            <button
                              className="btn-small btn-danger"
                              onClick={() => handleDeleteBill(bill._id, "maintenance")}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          ) : (
            <div className="bill-section">
              <div className="section-header">
                <h2>Electricity Bills</h2>
                <button
                  className="btn-primary"
                  onClick={() => openCreateModal("electricity")}
                >
                  + Create Electricity Bill
                </button>
              </div>

              <div className="bills-table-container">
                {electricityBills.length === 0 ? (
                  <p className="no-data">No electricity bills found</p>
                ) : (
                  <table className="bills-table">
                    <thead>
                      <tr>
                        <th>User ID</th>
                        <th>Name</th>
                        <th>Apt No.</th>
                        <th>Month/Year</th>
                        <th>Units</th>
                        <th>Rate/Unit</th>
                        <th>Amount</th>
                        <th>Due Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {electricityBills.map((bill) => (
                        <tr key={bill._id}>
                          <td>{bill.userId}</td>
                          <td>{bill.userName}</td>
                          <td>{bill.apartmentNumber}</td>
                          <td>{bill.month} {bill.year}</td>
                          <td>{bill.unitsConsumed}</td>
                          <td>₹{bill.ratePerUnit}</td>
                          <td>₹{bill.amount}</td>
                          <td>{formatDate(bill.dueDate)}</td>
                          <td>
                            <span
                              className="status-badge"
                              style={{ backgroundColor: getStatusColor(bill.status) }}
                            >
                              {bill.status}
                            </span>
                          </td>
                          <td className="action-buttons">
                            {bill.status !== "Paid" && (
                              <button
                                className="btn-small btn-success"
                                onClick={() => handleUpdateStatus(bill._id, "electricity", "Paid")}
                              >
                                Mark Paid
                              </button>
                            )}
                            <button
                              className="btn-small btn-danger"
                              onClick={() => handleDeleteBill(bill._id, "electricity")}
                            >
                              Delete
                            </button>
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

        {/* Create Bill Modal */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Create {billType === "maintenance" ? "Maintenance" : "Electricity"} Bill</h2>
                <button className="close-btn" onClick={() => setShowCreateModal(false)}>×</button>
              </div>
              <form onSubmit={handleCreateBill}>
                <div className="form-group">
                  <label>Select User *</label>
                  <select
                    name="userId"
                    value={formData.userId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">-- Select User --</option>
                    {users.map(user => (
                      <option key={user.userId} value={user.userId}>
                        {user.userId} - {user.name} (Apt {user.apartmentNumber})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Month *</label>
                    <select
                      name="month"
                      value={formData.month}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">-- Select Month --</option>
                      {["January", "February", "March", "April", "May", "June", 
                        "July", "August", "September", "October", "November", "December"].map(month => (
                        <option key={month} value={month}>{month}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Year *</label>
                    <input
                      type="number"
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                      min="2000"
                      max="2100"
                      required
                    />
                  </div>
                </div>

                {billType === "maintenance" ? (
                  <div className="form-group">
                    <label>Amount (₹) *</label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                ) : (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Units Consumed *</label>
                        <input
                          type="number"
                          name="unitsConsumed"
                          value={formData.unitsConsumed}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Rate per Unit (₹) *</label>
                        <input
                          type="number"
                          name="ratePerUnit"
                          value={formData.ratePerUnit}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Total Amount: ₹{(formData.unitsConsumed * formData.ratePerUnit).toFixed(2) || 0}</label>
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label>Due Date *</label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Create Bill
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Billing;
