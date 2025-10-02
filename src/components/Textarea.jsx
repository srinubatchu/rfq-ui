import React from "react";

const Textarea = ({ label, name, value, onChange, placeholder, required = false }) => {
    const handleChange = (e) => {
        let val = e.target.value;

        // Prevent first character from being a space
        if (val && val[0] === " ") {
            onChange("", ""); // send empty value and error
            return;
        }
        if (/\s{2,}/.test(val)) {
            onChange(val, ""); // keep value but show error
            return;
        }

        onChange(val, "");
    };

    return (
        <textarea
            name={name}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={required}
            rows={4} // default 4 rows
        />

    );
};

export default Textarea;
