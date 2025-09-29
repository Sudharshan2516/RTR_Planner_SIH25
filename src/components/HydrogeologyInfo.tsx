// src/components/HydrogeologyInfo.tsx

import React from "react";

const HydrogeologyInfo = () => {
  return (
    <div style={{ 
      border: "1px solid #ccc", 
      padding: "16px", 
      borderRadius: "8px", 
      backgroundColor: "#f9f9f9",
      maxWidth: "600px",
      margin: "20px auto",
      fontFamily: "Arial, sans-serif"
    }}>
      <h2 style={{ color: "#333" }}>Hydrogeology Info</h2>
      <p style={{ color: "red", fontWeight: "bold" }}>Error</p>
      <pre style={{ 
        backgroundColor: "#eee", 
        padding: "12px", 
        borderRadius: "6px", 
        overflowX: "auto" 
      }}>
{`{
  "code": "rate-limited",
  "message": "You have hit the rate limit. Please upgrade to keep chatting.",
  "providerLimitHit": false,
  "isRetryable": true
}`}
      </pre>
    </div>
  );
};

export default HydrogeologyInfo;
