import React from "react";

export default function Container({ children }) {
    return <div style={{ width: "100%", maxWidth: "1500px", margin: "auto", padding: "120px" }}>
        {children}
    </div>
}