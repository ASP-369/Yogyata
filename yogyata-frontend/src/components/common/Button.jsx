import React from "react";
import "./Button.css";

const Button = ({
  children,
  variant = "primary",
  size = "medium",
  disabled = false,
  onClick,
  type = "button",
  className = "",
  ...props
}) => {
  const baseClass = "btn";
  const variantClass = `btn--${variant}`;
  const sizeClass = `btn--${size}`;
  const disabledClass = disabled ? "btn--disabled" : "";

  const buttonClass =
    `${baseClass} ${variantClass} ${sizeClass} ${disabledClass} ${className}`.trim();

  return (
    <button
      className={buttonClass}
      disabled={disabled}
      onClick={onClick}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
