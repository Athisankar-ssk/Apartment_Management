import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UserNavbar from "../components/UserNavbar";
import "./Billing.css";

function UserElectricityBilling() {
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState({ userId: "", userName: "" });

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      navigate("/user/login");
      return;
    }
    fetchUserProfile();
  }, [navigate]);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("userToken");
      const profileRes = await axios.get("http://localhost:5000/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const userId = profileRes.data.userId;
      const userName = profileRes.data.name;
      setUserInfo({ userId, userName });

      // Fetch electricity bills for this user
      const billsRes = await axios.get(`http://localhost:5000/api/billing/electricity/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBills(billsRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
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

  const calculateTotal = () => {
    return bills.reduce((sum, bill) => sum + bill.amount, 0).toFixed(2);
  };

  const calculateUnpaid = () => {
    return bills
      .filter(bill => bill.status === 'Unpaid' || bill.status === 'Overdue')
      .reduce((sum, bill) => sum + bill.amount, 0)
      .toFixed(2);
  };

  if (loading) {
    return (
      <>
        <UserNavbar />
        <div className="billing-container">
          <p className="loading">Loading your electricity bills...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <UserNavbar />
      <div className="billing-container">
        <header className="billing-header">
          <h1>My Electricity Bills</h1>
          <p>View and track your electricity consumption and bills</p>
        </header>

        <div className="billing-summary">
          <div className="summary-card">
            <h3>Total Bills</h3>
            <p className="summary-value">{bills.length}</p>
          </div>
          <div className="summary-card">
            <h3>Total Amount</h3>
            <p className="summary-value">₹{calculateTotal()}</p>
          </div>
          <div className="summary-card unpaid">
            <h3>Unpaid Amount</h3>
            <p className="summary-value">₹{calculateUnpaid()}</p>
          </div>
        </div>

        <div className="billing-content">
          <div className="bill-section">
            <div className="section-header">
              <h2>Electricity Bill History</h2>
            </div>

            <div className="bills-table-container">
              {bills.length === 0 ? (
                <p className="no-data">No electricity bills found</p>
              ) : (
                <table className="bills-table">
                  <thead>
                    <tr>
                      <th>Month/Year</th>
                      <th>Units Consumed</th>
                      <th>Rate per Unit</th>
                      <th>Total Amount</th>
                      <th>Due Date</th>
                      <th>Status</th>
                      <th>Paid Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bills.map((bill) => (
                      <tr key={bill._id}>
                        <td>{bill.month} {bill.year}</td>
                        <td>{bill.unitsConsumed} kWh</td>
                        <td>₹{bill.ratePerUnit}</td>
                        <td className="amount">₹{bill.amount}</td>
                        <td>{formatDate(bill.dueDate)}</td>
                        <td>
                          <span
                            className="status-badge"
                            style={{ backgroundColor: getStatusColor(bill.status) }}
                          >
                            {bill.status}
                          </span>
                        </td>
                        <td>{bill.paidDate ? formatDate(bill.paidDate) : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {bills.some(bill => bill.status === 'Unpaid' || bill.status === 'Overdue') && (
          <div className="payment-notice">
            <h3>⚠️ Payment Notice</h3>
            <p>You have unpaid electricity bills. Please contact the apartment office for payment details.</p>
          </div>
        )}
      </div>
    </>
  );
}

export default UserElectricityBilling;
