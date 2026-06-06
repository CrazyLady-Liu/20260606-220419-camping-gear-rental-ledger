import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import EquipmentList from "@/pages/EquipmentList";
import EquipmentDetail from "@/pages/EquipmentDetail";
import RentalList from "@/pages/RentalList";
import AccessoryList from "@/pages/AccessoryList";
import MaintenanceList from "@/pages/MaintenanceList";
import InventoryList from "@/pages/InventoryList";
import Reports from "@/pages/Reports";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/equipment" element={<EquipmentList />} />
          <Route path="/equipment/:id" element={<EquipmentDetail />} />
          <Route path="/rentals" element={<RentalList />} />
          <Route path="/accessories" element={<AccessoryList />} />
          <Route path="/maintenance" element={<MaintenanceList />} />
          <Route path="/inventory" element={<InventoryList />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </Layout>
    </Router>
  );
}
