import React, { forwardRef } from "react";
import "./Input.css";

const Input = forwardRef(
  (
    {
      label,
      type = "text",
      error,
      helperText,
      className = "",
      required = false,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const inputClass = `input ${error ? "input--error" : ""} ${
      disabled ? "input--disabled" : ""
    } ${className}`.trim();

    return (
      <div className="input-wrapper">
        {label && (
          <label className="input-label">
            {label}
            {required && <span className="input-required">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={inputClass}
          type={type}
          disabled={disabled}
          {...props}
        />
        {error && <span className="input-error-text">{error}</span>}
        {helperText && !error && (
          <span className="input-helper-text">{helperText}</span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
