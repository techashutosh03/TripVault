import React from "react";

const Skeleton = ({ type = "line", count = 1, width, height, style, className = "" }) => {
  const elements = Array.from({ length: count });

  const getStyle = () => {
    const baseStyle = { ...style };
    if (width) baseStyle.width = width;
    if (height) baseStyle.height = height;
    return baseStyle;
  };

  if (type === "card") {
    return (
      <>
        {elements.map((_, index) => (
          <div key={index} className="skeleton-card glass-card" style={getStyle()}>
            <div className="skeleton-card-image skeleton-pulse" />
            <div className="skeleton-card-body">
              <div className="skeleton-line skeleton-pulse" style={{ width: "70%", height: "20px", marginBottom: "1rem" }} />
              <div className="skeleton-line skeleton-pulse" style={{ width: "40%", height: "14px", marginBottom: "0.5rem" }} />
              <div className="skeleton-line skeleton-pulse" style={{ width: "90%", height: "14px", marginBottom: "1.5rem" }} />
              <div style={{ display: "flex", gap: "1rem" }}>
                <div className="skeleton-line skeleton-pulse" style={{ flex: 1, height: "35px", borderRadius: "8px" }} />
                <div className="skeleton-line skeleton-pulse" style={{ width: "40px", height: "35px", borderRadius: "8px" }} />
              </div>
            </div>
          </div>
        ))}
      </>
    );
  }

  return (
    <>
      {elements.map((_, index) => (
        <div
          key={index}
          className={`skeleton-${type} skeleton-pulse ${className}`}
          style={getStyle()}
        />
      ))}
    </>
  );
};

export default Skeleton;
