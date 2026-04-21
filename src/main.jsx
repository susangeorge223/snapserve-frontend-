// FORCE FIX (temporary)
const ORIGINAL_FETCH = window.fetch;

window.fetch = (...args) => {
  let url = args[0];

  if (typeof url === "string" && url.includes("localhost:3000")) {
    url = url.replace(
      "http://localhost:3000",
      "https://42f85134-3055-4189-b940-f786760756ac-00-liarccwn856i5.sisko.replit.dev"
    );
  }

  return ORIGINAL_FETCH(url, ...args.slice(1));
};
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./socket";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);