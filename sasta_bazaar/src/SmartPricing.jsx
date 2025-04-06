import React, { useState, useEffect } from "react";
import { FiBarChart2, FiChevronDown } from "react-icons/fi";

const SmartPricing = () => {
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [week, setWeek] = useState("");
  const [weeksInMonth, setWeeksInMonth] = useState([]);
  const [predictedDemand, setPredictedDemand] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch products from the backend
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:5000/products");
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (month && year) {
      const date = new Date(year, month - 1, 1);
      const daysInMonth = new Date(year, month, 0).getDate();
      const firstDay = date.getDay();
      const totalWeeks = Math.ceil((daysInMonth + firstDay) / 7);
      setWeeksInMonth(Array.from({ length: totalWeeks }, (_, i) => i + 1));
      setWeek("");
    }
  }, [month, year]);

  const handlePredict = async () => {
    if (!productId || !month || !week || !year) return;
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/predict_demand?product_id=${productId}&month=${month}&week=${week}`
      );
      const data = await response.json();
      setPredictedDemand(data.predicted_demand);
    } catch (error) {
      console.error("Prediction error:", error);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md mt-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <FiBarChart2 className="text-blue-500" /> Smart Pricing & Analytics
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="relative">
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 shadow-sm bg-white appearance-none"
          >
            <option value="">Select Product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
          <FiChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 shadow-sm bg-white appearance-none"
          >
            <option value="">Select Year</option>
            {[2025, 2026, 2027, 2028, 2029].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <FiChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 shadow-sm bg-white appearance-none"
          >
            <option value="">Select Month</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>
          <FiChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={week}
            onChange={(e) => setWeek(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 shadow-sm bg-white appearance-none"
          >
            <option value="">Select Week</option>
            {weeksInMonth.map((w) => (
              <option key={w} value={w}>
                Week {w}
              </option>
            ))}
          </select>
          <FiChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <button
        onClick={handlePredict}
        disabled={loading || !productId || !year || !month || !week}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition duration-200"
      >
        {loading ? "Predicting..." : "Predict Demand"}
      </button>

      {predictedDemand !== null && (
        <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-600 rounded-md">
          <h2 className="text-lg font-semibold text-blue-800">
            Predicted Demand: <span className="text-black">{predictedDemand}</span>
          </h2>
          <p className="text-gray-600 mt-1">
            For Product ID {productId} - Week {week}
          </p>
        </div>
      )}
    </div>
  );
};

export default SmartPricing;
