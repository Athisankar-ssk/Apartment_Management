import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Overview from "./pages/Overview";
import Services from "./pages/Services";
import About from "./pages/About";
import Contact from "./pages/Contact";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import UserManagement from "./pages/UserManagement";
import CreateAccount from "./pages/CreateAccount";
import ComplaintDetails from "./pages/ComplaintDetails";
import UserLogin from "./pages/UserLogin";
import UserDashboard from "./pages/UserDashboard";
import UserProfile from "./pages/UserProfile";
import Complaints from "./pages/Complaints";
import ElectricityComplaint from "./pages/ElectricityComplaint";
import WaterComplaint from "./pages/WaterComplaint";
import CleaningComplaint from "./pages/CleaningComplaint";
import LiftComplaint from "./pages/LiftComplaint";
import OtherComplaint from "./pages/OtherComplaint";
import ElectricityBill from "./pages/ElectricityBill";
import ComplaintStatus from "./pages/ComplaintStatus";
import LetterCourier from "./pages/LetterCourier";
import PlaygroundBooking from "./pages/PlaygroundBooking";
import PartyHallBooking from "./pages/PartyHallBooking";
import SwimmingPoolBooking from "./pages/SwimmingPoolBooking";
import MeetingHallBooking from "./pages/MeetingHallBooking";
import AdminBookingDetails from "./pages/AdminBookingDetails";
import Billing from "./pages/Billing";
import UserElectricityBilling from "./pages/UserElectricityBilling";
import UserMaintenanceBilling from "./pages/UserMaintenanceBilling";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/services" element={<Services />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/user/login" element={<UserLogin />} />
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="/user/profile" element={<UserProfile />} />
        <Route path="/user/grievance/electricity" element={<ElectricityComplaint />} />
        <Route path="/user/grievance/water" element={<WaterComplaint />} />
        <Route path="/user/grievance/cleaning" element={<CleaningComplaint />} />
        <Route path="/user/grievance/lift" element={<LiftComplaint />} />
        <Route path="/user/grievance/other" element={<OtherComplaint />} />
        <Route path="/user/services/electricity-bill" element={<UserElectricityBilling />} />
        <Route path="/user/services/complaint-status" element={<ComplaintStatus />} />
        <Route path="/user/services/letter-courier" element={<LetterCourier />} />
        <Route path="/user/booking/playground" element={<PlaygroundBooking />} />
        <Route path="/user/booking/partyhall" element={<PartyHallBooking />} />
        <Route path="/user/booking/swimming-pool" element={<SwimmingPoolBooking />} />
        <Route path="/user/booking/meeting-hall" element={<MeetingHallBooking />} />
        <Route path="/user/billing/electricity" element={<UserElectricityBilling />} />
        <Route path="/user/services/maintenance-bills" element={<UserMaintenanceBilling />} />
        <Route path="/complaints" element={<Complaints />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/user-management" element={<UserManagement />} />
        <Route path="/admin/create-account" element={<CreateAccount />} />
        <Route path="/admin/complaint/:id" element={<ComplaintDetails />} />
        <Route path="/admin/booking-details" element={<AdminBookingDetails />} />
        <Route path="/admin/billing" element={<Billing />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
