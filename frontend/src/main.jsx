import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

// ─── Suppress Harmless Third-Party Telemetry 403 Pings (MediaPipe ODML Analytics) ───
if (typeof window !== "undefined") {
  if (window.fetch) {
    const originalFetch = window.fetch;
    window.fetch = function (resource, init) {
      const url = typeof resource === "string" ? resource : resource?.url;
      if (url && typeof url === "string" && url.includes("odml.pa.googleapis.com")) {
        return Promise.resolve(
          new Response(JSON.stringify({ status: "ok" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          })
        );
      }
      return originalFetch.apply(this, arguments);
    };
  }

  if (window.XMLHttpRequest) {
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url) {
      if (typeof url === "string" && url.includes("odml.pa.googleapis.com")) {
        this._isOdmlTelemetry = true;
      }
      return originalOpen.apply(this, arguments);
    };

    const originalSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function () {
      if (this._isOdmlTelemetry) {
        Object.defineProperty(this, "status", { value: 200, writable: false });
        Object.defineProperty(this, "readyState", { value: 4, writable: false });
        Object.defineProperty(this, "responseText", { value: "{}", writable: false });
        if (typeof this.onload === "function") this.onload();
        return;
      }
      return originalSend.apply(this, arguments);
    };
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);