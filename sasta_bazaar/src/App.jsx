// frontend/src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import FrontPage from "./FrontPage";
import Dashboard from "./pages/dashboard";
import SalesTracking from "./SalesTracking";
import InventoryManagement from "./InventoryManagement";
import SmartPricing from "./SmartPricing";
import ExpenseTracker from "./ExpenseTracker";
import GovtSchemes from "./GovtSchemes";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<FrontPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/sales" element={<SalesTracking />} />
      <Route path="/inventory" element={<InventoryManagement />} />
      <Route path="/smart-pricing" element={<SmartPricing />} />
      <Route path="/expenses" element={<ExpenseTracker />} />
      <Route path="/schemes" element={<GovtSchemes />} />
    </Routes>
  );
};

export default App;
