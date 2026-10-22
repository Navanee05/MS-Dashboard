import React from "react";

const BADGE_STYLES = {
  Premier:    { background: "#FAEEDA", color: "#633806", border: "0.5px solid #EF9F27" },
  Essentials: { background: "#E6F1FB", color: "#0C447C", border: "0.5px solid #378ADD" },
  Active:     { background: "#EAF3DE", color: "#27500A", border: "0.5px solid #639922" },
  Inactive:   { background: "#FCEBEB", color: "#791F1F", border: "0.5px solid #E24B4A" },
  Direct:     { background: "#F1EFE8", color: "#444441", border: "0.5px solid #B4B2A9" },
  WhatsApp:   { background: "#E1F5EE", color: "#085041", border: "0.5px solid #1D9E75" },
  Email:      { background: "#E6F1FB", color: "#0C447C", border: "0.5px solid #85B7EB" },
  Partner:    { background: "#EEEDFE", color: "#3C3489", border: "0.5px solid #7F77DD" },
};

export default function Badge({ label }) {
  const style = BADGE_STYLES[label] ?? {
    background: "#F1EFE8",
    color: "#444441",
    border: "0.5px solid #B4B2A9",
  };
  return (
    <span
      style={{
        ...style,
        fontSize: 11,
        padding: "2px 9px",
        borderRadius: 20,
        fontWeight: 500,
        display: "inline-block",
      }}
    >
      {label}
    </span>
  );
}
