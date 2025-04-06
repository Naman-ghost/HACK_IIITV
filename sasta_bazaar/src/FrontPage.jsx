import React from "react";
import { useNavigate } from "react-router-dom";
import bgImage from "./images/GettyImages-1217476205-11cc214dcdcb47dd93434868ea14839e.jpg";

const FrontPage = () => {
  const navigate = useNavigate();

  const features = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Sales Tracking", path: "/sales" },
    { name: "Inventory Management", path: "/inventory" },
    { name: "Smart Pricing & Analytics", path: "/smart-pricing" },
    // { name: "Expense Tracker", path: "/expenses" },
    { name: "Govt Schemes", path: "/schemes" },
  ];

  return (
    <div
      className="min-h-screen bg-cover bg-center flex flex-col items-center justify-between px-4 py-12"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundAttachment: "fixed",
      }}
    >
      <div className="backdrop-blur-sm bg-white/70 p-4 rounded-2xl w-full max-w-7xl">
        <header className="text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Smart Retail Assistant
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Empower your supermarket with AI-driven insights and tools designed to enhance efficiency, reduce costs, and grow your business.
          </p>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-12 w-full">
          {features.map((feature) => (
            <div
              key={feature.name}
              onClick={() => navigate(feature.path)}
              className="cursor-pointer p-6 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-transparent hover:border-blue-100 hover:scale-[1.02]"
            >
              <h2 className="text-xl font-semibold text-blue-700 mb-2">
                {feature.name}
              </h2>
              <p className="text-gray-500 text-sm">
                Access tools and insights for {feature.name.toLowerCase()}.
              </p>
            </div>
          ))}
        </section>

        <footer className="mt-16 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} Smart Retail Assistant · Built by{" "}
          <span className="font-medium text-gray-600">GHOST_RIDERS</span>
        </footer>
      </div>
    </div>
  );
};

export default FrontPage;
