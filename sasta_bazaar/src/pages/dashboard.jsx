import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ChartCard = ({ title, children }) => (
  <div className="bg-white rounded-2xl shadow-lg p-6 transition duration-300 hover:shadow-2xl hover:scale-[1.01]">
    <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-xl inline-block">
      {title}
    </h2>
    {children}
  </div>
);

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    api.get("/analytics")
      .then((response) => setAnalytics(response.data))
      .catch((err) => console.error(err));
  }, []);

  if (!analytics) return <div className="text-center text-lg font-medium p-10 animate-pulse">Loading analytics...</div>;

  const barData = {
    labels: analytics.top_products?.map((p) => `${p.name} (${p.category})`) || [],
    datasets: [
      {
        label: "Top Selling Products",
        data: analytics.top_products?.map((p) => p.sales) || [],
        backgroundColor: "#3b82f6"
      }
    ]
  };

  const pieData = {
    labels: analytics.categories?.map((c) => c.name) || [],
    datasets: [
      {
        label: "Category Distribution",
        data: analytics.categories?.map((c) => c.count) || [],
        backgroundColor: ["#34d399", "#fbbf24", "#f87171", "#60a5fa", "#a78bfa"]
      }
    ]
  };

  const lineData = {
    labels: analytics.monthly_sales?.map((m) => m.month) || [],
    datasets: [
      {
        label: "Monthly Sales",
        data: analytics.monthly_sales?.map((m) => m.total) || [],
        borderColor: "#10b981",
        backgroundColor: "#d1fae5",
        tension: 0.3,
        fill: true
      }
    ]
  };

  const inventoryData = {
    labels: analytics.inventory?.map((p) => `${p.name} (${p.category})`) || [],
    datasets: [
      {
        label: "Inventory Available",
        data: analytics.inventory?.map((p) => p.inventory) || [],
        backgroundColor: "#facc15"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 py-10 px-4 md:px-10">
      <h1 className="text-4xl font-extrabold text-center mb-10 text-gray-800">
        📊 Business Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ChartCard title="🔥 Top Selling Products">
          <Bar data={barData} />
        </ChartCard>

        <ChartCard title="📂 Sales by Category">
          <Pie data={pieData} />
        </ChartCard>

        <div className="md:col-span-2">
          <ChartCard title="📈 Monthly Sales Trend">
            <Line data={lineData} />
          </ChartCard>
        </div>

        <div className="md:col-span-2">
          <ChartCard title="📦 Inventory Levels">
            <Bar data={inventoryData} />
          </ChartCard>
        </div>

        <div className="md:col-span-2">
          <ChartCard title="🤖 User Switching Patterns (Coming Soon)">
            <p className="text-gray-600 text-lg">
              Our smart AI model will soon detect switching behavior across product categories to predict customer preferences and churn risks.
            </p>
          </ChartCard>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
