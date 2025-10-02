// src/pages/SetPassword.js
import React, { useState } from "react";
import FormField from "../components/FormField";
import { useHttp } from "../utils/axiosService";
import { useToast } from "../context/ToastContext";
import { useNavigate, useSearchParams } from "react-router-dom";

const SetPassword = () => {
  const { postCall } = useHttp();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [formValues, setFormValues] = useState({
    password: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState({
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false,
  });

  // Form fields configuration
  const formFields = [
    {
      label: "New Password",
      name: "password",
      type: "password",
      placeholder: "Enter new password",
      regexPatternName: "password",
      required: true,
    },
    {
      label: "Confirm Password",
      name: "confirmPassword",
      type: "password",
      placeholder: "Confirm password",
      regexPatternName: "password",
      required: true,
    },
  ];

  const handleChange = (name, value, error = "") => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: error }));
  };

  const togglePasswordVisibility = (fieldName) => {
    setShowPassword((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let hasError = false;
    for (const field of formFields) {
      if (field.required && !formValues[field.name]) {
        setFormErrors((prev) => ({
          ...prev,
          [field.name]: `${field.label} is required`,
        }));
        hasError = true;
      }
    }

    if (formValues.password !== formValues.confirmPassword) {
      setFormErrors((prev) => ({
        ...prev,
        confirmPassword: "Passwords do not match",
      }));
      hasError = true;
    }

    if (hasError) return;

    try {
      const res = await postCall("/v1/users/set-password", {
        token,
        password: formValues.password,
      });

      if (res.status === "success") {
        showToast(res.message || "Password set successfully!", "success");
        navigate("/login");
      }
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to set password", "danger");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6 border rounded shadow bg-white">
      <h2 className="text-2xl font-bold mb-4">Set Your Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {formFields.map((field) => (
          <FormField
            key={field.name}
            label={field.label}
            name={field.name}
            type={showPassword[field.name] ? "text" : "password"}
            value={formValues[field.name]}
            onChange={(val, err) => handleChange(field.name, val, err)}
            placeholder={field.placeholder}
            required={field.required}
            regexPatternName={field.regexPatternName}
            error={formErrors[field.name]}
            suffix={
              <span
                className="cursor-pointer select-none"
                onClick={() => togglePasswordVisibility(field.name)}
              >
                {showPassword[field.name] ? "🙈" : "👁"}
              </span>
            }
          />
        ))}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Set Password
        </button>
      </form>
    </div>
  );
};

export default SetPassword;
