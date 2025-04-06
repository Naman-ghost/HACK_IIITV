import React, { useState, useEffect } from "react";

const Sales = () => {
  const [products, setProducts] = useState([]);
  const [invoiceItems, setInvoiceItems] = useState([
    {
      product_id: "",
      quantity: "",
      category: "",
      available_quantity: "",
      name: "",
    },
  ]);
  const [totalSales, setTotalSales] = useState(0);
  const [userId, setUserId] = useState(1); // For demo; replace with dynamic user handling
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:5000/products");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
    fetchProducts();
  }, []);

  const addInvoiceItem = () => {
    setInvoiceItems([
      ...invoiceItems,
      {
        product_id: "",
        quantity: "",
        category: "",
        available_quantity: "",
        name: "",
      },
    ]);
  };

  const updateInvoiceItem = (index, field, value) => {
    const updated = [...invoiceItems];
    updated[index][field] = value;

    if (field === "product_id") {
      const selected = products.find((p) => p.id === parseInt(value));
      if (selected) {
        updated[index].category = selected.category;
        updated[index].available_quantity = selected.inventory || 0;
        updated[index].name = selected.name;
      } else {
        updated[index].category = "";
        updated[index].available_quantity = "";
        updated[index].name = "";
      }
    }

    setInvoiceItems(updated);
  };

  const calculateTotal = () => {
    let total = 0;
    invoiceItems.forEach((item) => {
      if (item.quantity && !isNaN(item.quantity)) {
        total += parseFloat(item.quantity);
      }
    });
    setTotalSales(total);
  };

  const submitInvoice = async () => {
    const itemsToSubmit = invoiceItems
      .filter((item) => item.product_id && item.quantity)
      .map((item) => ({
        product_id: parseInt(item.product_id),
        quantity: parseInt(item.quantity),
      }));

    if (!itemsToSubmit.length) {
      setStatus("Please select products and quantities.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          items: itemsToSubmit,
        }),
      });

      const result = await res.json();
      if (res.ok) {
        setStatus("✅ Invoice created successfully!");
        setInvoiceItems([
          {
            product_id: "",
            quantity: "",
            category: "",
            available_quantity: "",
            name: "",
          },
        ]);
        setTotalSales(0);
      } else {
        setStatus(`❌ ${result.error}`);
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
      setStatus("❌ Error creating invoice.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 p-6">
      <div className="max-w-5xl mx-auto bg-white bg-opacity-95 backdrop-blur-md shadow-2xl rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-blue-800 mb-6">🧾 Sales Entry</h2>

        <div className="overflow-x-auto rounded-lg">
          <table className="w-full table-auto text-sm text-gray-700 border border-gray-200 rounded-lg overflow-hidden shadow">
            <thead>
              <tr className="bg-indigo-100 text-indigo-800">
                <th className="p-3 text-left">Product</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-center">Available Qty</th>
                <th className="p-3 text-center">Quantity Sold</th>
              </tr>
            </thead>
            <tbody>
              {invoiceItems.map((item, index) => (
                <tr key={index} className="border-t hover:bg-indigo-50">
                  <td className="p-3">
                    <select
                      value={item.product_id}
                      onChange={(e) =>
                        updateInvoiceItem(index, "product_id", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
                    >
                      <option value="">Select Product</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3">{item.category}</td>
                  <td className="p-3 text-center">{item.available_quantity}</td>
                  <td className="p-3 text-center">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        updateInvoiceItem(index, "quantity", e.target.value)
                      }
                      className="w-24 text-center border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-400 outline-none"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-wrap gap-4">
          <button
            onClick={addInvoiceItem}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-md transition"
          >
            ➕ Add Product
          </button>
          <button
            onClick={calculateTotal}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow-md transition"
          >
            ✅ Calculate Total
          </button>
          <button
            onClick={submitInvoice}
            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg shadow-md transition"
          >
            💾 Submit Invoice
          </button>
        </div>

        {/* Total Sales */}
        <div className="mt-6 text-2xl font-semibold text-right text-indigo-800">
          Total Sales:{" "}
          <span className="text-green-600 font-bold">{totalSales}</span>
        </div>

        {/* Status Message */}
        {status && (
          <div className="mt-4 text-md font-medium text-center text-red-600">
            {status}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sales;
