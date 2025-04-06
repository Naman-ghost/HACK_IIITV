import React, { useEffect, useState } from "react";
import {
  FaBox,
  FaPlusCircle,
  FaMinusCircle,
  FaClipboardList,
} from "react-icons/fa";
import {
  MdDateRange,
  MdLocalShipping,
  MdInventory,
} from "react-icons/md";
import api from "./services/api";
import bgImage from "./images/im-01.jpg";

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [form, setForm] = useState({
    product_id: "",
    quantity: "",
    expiry_date: "",
    supplier_name: "",
    order_date: "",
    delivery_date: "",
  });
  const [loading, setLoading] = useState(false);
  const [csvFile, setCsvFile] = useState(null);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = () => {
    setLoading(true);
    api
      .get("/inventory")
      .then((res) => setInventory(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    setLoading(true);
    api
      .post("/inventory", form)
      .then(() => {
        setForm({
          product_id: "",
          quantity: "",
          expiry_date: "",
          supplier_name: "",
          order_date: "",
          delivery_date: "",
        });
        fetchInventory();
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleReduce = (inventory_id) => {
    const qty = prompt("Enter quantity to reduce:", 1);
    if (!qty || isNaN(qty) || qty <= 0) return;

    setLoading(true);
    api
      .post(`/inventory/reduce`, {
        inventory_id,
        quantity: parseInt(qty),
      })
      .then(fetchInventory)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleCsvChange = (e) => {
    setCsvFile(e.target.files[0]);
  };

  const handleCsvUpload = () => {
    if (!csvFile) return;
    const formData = new FormData();
    formData.append("file", csvFile);

    setLoading(true);
    api
      .post("/inventory/upload_csv", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then(() => {
        setCsvFile(null);
        fetchInventory();
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center p-6"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="backdrop-blur-sm bg-white/80 rounded-xl shadow-xl max-w-7xl mx-auto overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-amber-900 to-yellow-700 text-white text-center flex items-center space-x-2 rounded-t-xl">
          <FaClipboardList className="text-4xl" />
          <h1 className="text-4xl font-extrabold">📦 Inventory Management</h1>
        </div>

        <div className="p-6 space-y-6">
          {/* Add Inventory Form */}
          <div className="bg-[#fef9f4] shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-[#5c4033] mb-4 flex items-center space-x-2">
              <FaPlusCircle className="text-green-600" />
              <span>Add New Inventory</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: "Product ID", name: "product_id", icon: <FaBox /> },
                { label: "Quantity", name: "quantity", icon: <MdInventory /> },
                { label: "Expiry Date", name: "expiry_date", icon: <MdDateRange /> },
                { label: "Supplier", name: "supplier_name", icon: <MdLocalShipping /> },
                { label: "Order Date", name: "order_date", icon: <MdDateRange /> },
                { label: "Delivery Date", name: "delivery_date", icon: <MdLocalShipping /> },
              ].map(({ label, name, icon }) => (
                <div key={name} className="flex items-center space-x-2">
                  {icon}
                  <input
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    placeholder={label}
                    type={label.includes("Date") ? "date" : "text"}
                    className="border border-[#d6a679] rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-400 focus:outline-none transition w-full bg-[#fffaf5]"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={handleAdd}
              className="w-full mt-4 bg-gradient-to-r from-amber-800 to-yellow-600 text-white py-2 px-4 rounded-md shadow-md hover:from-yellow-700 hover:to-amber-700 transition duration-300 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>Adding...</span>
              ) : (
                <>
                  <FaPlusCircle />
                  <span>Add Inventory</span>
                </>
              )}
            </button>
          </div>

          {/* CSV Upload */}
          <div className="bg-[#fef9f4] shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-[#5c4033]">Upload Inventory via CSV</h2>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept=".csv"
                onChange={handleCsvChange}
                className="border border-[#d6a679] rounded px-3 py-2 bg-[#fffaf5]"
              />
              <button
                onClick={handleCsvUpload}
                className="bg-[#8b5e3c] text-white px-4 py-2 rounded hover:bg-[#734c2a] transition"
              >
                {loading ? "Uploading..." : "Upload CSV"}
              </button>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="overflow-x-auto bg-[#fffaf5] shadow-md rounded-lg">
            <table className="min-w-full table-fixed text-sm text-[#4b3a2f] border-collapse border border-[#d6a679]">
              <thead className="bg-[#8b5e3c] text-white uppercase text-xs">
                <tr>
                  {[
                    "Product",
                    "Category",
                    "Qty",
                    "Expiry",
                    "Supplier",
                    "Ordered",
                    "Delivered",
                    "Actions",
                  ].map((header) => (
                    <th
                      key={header}
                      className="py-3 px-4 text-center border-b border-[#d6a679]"
                    >
                      <span className="flex items-center justify-center space-x-1">
                        <FaBox className="text-[#e0c9b3]" />
                        <span>{header}</span>
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7d7c9]">
                {inventory.map((item) => (
                  <tr
                    key={item.batch_id}
                    className="hover:bg-[#f3ede8] transition duration-300"
                  >
                    <td className="py-3 px-4 text-center">{item.product_name}</td>
                    <td className="py-3 px-4 text-center">{item.category}</td>
                    <td className="py-3 px-4 text-center">{item.quantity}</td>
                    <td className="py-3 px-4 text-center">{item.expiry_date}</td>
                    <td className="py-3 px-4 text-center">{item.supplier_name}</td>
                    <td className="py-3 px-4 text-center">{item.order_date}</td>
                    <td className="py-3 px-4 text-center">{item.delivery_date}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleReduce(item.batch_id)}
                        className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition duration-300 flex items-center space-x-1"
                      >
                        <FaMinusCircle />
                        <span>Reduce Qty</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement;
