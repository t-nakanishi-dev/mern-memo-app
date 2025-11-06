// client/src/index.js

import React from "react";
import ReactDOM from "react-dom/client"; // React18 以降は createRoot を使用
import App from "./App"; // ルートコンポーネント
import "./index.css"; // Tailwind やグローバルCSSを適用

// React 18 用の root 作成
const root = ReactDOM.createRoot(document.getElementById("root"));

// ルートコンポーネントをレンダリング
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
