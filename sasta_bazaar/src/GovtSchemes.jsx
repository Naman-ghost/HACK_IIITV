import React, { useEffect, useState } from "react";

const GovtSchemes = () => {
  const [schemes, setSchemes] = useState([]);
  const [filteredSchemes, setFilteredSchemes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState("All");

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        const res = await fetch("http://localhost:5000/schemes");
        const data = await res.json();
        setSchemes(data);
        setFilteredSchemes(data);
      } catch (err) {
        console.error("Failed to fetch schemes:", err);
      }
    };

    fetchSchemes();
  }, []);

  useEffect(() => {
    const filterSchemes = () => {
      const filtered = schemes.filter((scheme) => {
        const matchesSearch =
          scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          scheme.description.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory =
          selectedCategory === "All" || scheme.category === selectedCategory;

        const matchesType =
          selectedType === "All" || scheme.type === selectedType;

        return matchesSearch && matchesCategory && matchesType;
      });

      setFilteredSchemes(filtered);
    };

    filterSchemes();
  }, [searchTerm, selectedCategory, selectedType, schemes]);

  const getUniqueValues = (key) => {
    const values = schemes.map((s) => s[key]);
    return ["All", ...Array.from(new Set(values))];
  };

  return (
    <div className="min-h-screen bg-blue-950 py-10 px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-4 text-indigo-700">
          🏛️ Government Schemes for MSMEs
        </h1>
        <p className="text-gray-600 mb-6">
          Filter and explore government schemes tailored to support small
          businesses and supermarkets.
        </p>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-6 mb-8 justify-center items-start md:items-end">
          <div className="flex flex-col w-full md:w-1/3">
            <label className="mb-1 text-sm font-medium text-gray-700">
              🔍 Search Schemes
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or description..."
              className="border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <div className="flex flex-col w-full md:w-1/4">
            <label className="mb-1 text-sm font-medium text-gray-700">
              🏷️ Filter by Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 shadow-sm"
            >
              {getUniqueValues("category").map((cat) => (
                <option key={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col w-full md:w-1/4">
            <label className="mb-1 text-sm font-medium text-gray-700">
              📂 Filter by Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 shadow-sm"
            >
              {getUniqueValues("type").map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Scheme Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchemes.length === 0 ? (
            <p className="text-gray-500 col-span-full">
              No schemes match your filters.
            </p>
          ) : (
            filteredSchemes.map((scheme, index) => (
              <div
                key={index}
                className="bg-blue-100 border border-blue-300 rounded-xl p-5 shadow-md hover:shadow-xl transition duration-300"
              >
                <h2 className="text-xl font-semibold mb-1 text-indigo-800">
                  {scheme.name}
                </h2>
                <p className="text-gray-800 mb-3">{scheme.description}</p>
                <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                  <span className="bg-indigo-200 text-indigo-800 px-2 py-1 rounded">
                    {scheme.category}
                  </span>
                  <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                    {scheme.type}
                  </span>
                </div>
                <a
                  href={scheme.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 underline font-medium"
                >
                  Learn More →
                </a>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default GovtSchemes;
