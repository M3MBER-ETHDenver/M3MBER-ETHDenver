import React from "react";

export default function Container(props) {
    return <div style={{ width: "90%", maxWidth: "1500px", margin: "auto", padding: "120px" }}>
        {props.children}
    </div>
}