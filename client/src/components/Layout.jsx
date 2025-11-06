// client/src/components/Layout.jsx
import React from "react";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      <div className="container mx-auto px-4 py-8">{children}</div>
    </div>
  );
};

export default Layout;
