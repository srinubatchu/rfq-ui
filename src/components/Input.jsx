import React, { useState } from "react";
import { regexPatterns } from "../utils/regexPatterns";
import * as formatPatterns from "../utils/formatPatterns.js";

const Input = ({
  label,
  name,
  value,
  onChange,
  regexPatternName = "",
  formatPattern = "",
  placeholder = "",
  type = "text",
  required = false,
  prefix = null,   // 👈 prefix element
  suffix = null,   // 👈 suffix element
}) => {
  const handleChange = (e) => {
    let val = e.target.value;
    let errMsg = "";

    // Prevent first character from being a space
    if (val && val[0] === " ") {
      onChange("", "");
      return;
    }

    // Replace multiple spaces with one
    val = val.replace(/\s{2,}/g, " ");

    // Apply formatter if defined
    if (formatPattern && formatPatterns[formatPattern]) {
      val = formatPatterns[formatPattern](val);
    }

    // Regex validation
    if (regexPatternName && regexPatterns[regexPatternName]) {
      const { regex, error: regexError } = regexPatterns[regexPatternName];
      if (!regex.test(val)) {
        errMsg = regexError;
        onChange(val, errMsg);
        return;
      }
    }

    onChange(val, ""); // no error
  };

  return (
    <div className="relative w-full">
      {prefix && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
          {prefix}
        </span>
      )}

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        className={`w-full h-[42px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${prefix ? "pl-10" : "p-2"
          } ${suffix ? "pr-10" : "p-2"}`}
        required={required}
      />

      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer">
          {suffix}
        </span>
      )}
    </div>
  );
};

export default Input;
