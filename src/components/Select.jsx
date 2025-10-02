import React from "react";
import ReactSelect from "react-select";

const Select = ({ options = [], value, onChange, multiple = false, required = false }) => {
  const handleChange = (selected) => {
    if (multiple) {
      onChange(selected ? selected.map((opt) => opt.value) : []);
    } else {
      onChange(selected ? selected.value : "");
    }
  };

  const formattedOptions = options.map((opt) => ({
    value: opt.value ?? opt,
    label: opt.label ?? opt,
  }));

  const formattedValue = multiple
    ? formattedOptions.filter((opt) => value?.includes(opt.value))
    : formattedOptions.find((opt) => opt.value === value) || null;

  // 👇 custom styles to match input height (p-2 ~ 32px tall)
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      minHeight: "42px", // 👈 matches <input class="p-2">
      borderRadius: "0.25rem", // rounded
      borderColor: state.isFocused ? "#3B82F6" : "#d1d5db", // blue-500 on focus, gray-300 default
      boxShadow: state.isFocused
        ? "0 0 0 2px rgba(59,130,246,0.5)" // focus:ring-2 focus:ring-blue-500
        : "none",
      // "&:hover": { borderColor: "#3B82F6" },
      fontSize: "0.875rem", // text-sm
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: "0 0.5rem", // px-2
    }),
    indicatorsContainer: (provided) => ({
      ...provided,
      padding: "0 0.25rem",
    }),
  };


  return (
    <ReactSelect
      options={formattedOptions}
      value={formattedValue}
      onChange={handleChange}
      isMulti={multiple}
      required={required}
      styles={customStyles}
      placeholder="Select..."
    />
  );
};

export default Select;
