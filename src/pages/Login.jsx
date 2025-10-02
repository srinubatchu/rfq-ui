import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FormField from "../components/FormField";
import Button from "../components/Button";
import PageContainer from "../components/PageContainer";
import PageHeader from "../components/PageHeader.jsx";
import { useHttp } from "../utils/axiosService";

const Login = () => {
  const { postCall } = useHttp();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [formErrors, setFormErrors] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState({
    password: false,
    email: true,
  });


  const formFields = [
    {
      label: "Email",
      name: "email",
      type: "email",
      placeholder: "Enter your email",
      required: true,
      // regexPatternName: "email",
    },
    {
      label: "Password",
      name: "password",
      type: "password",
      placeholder: "Enter your password",
      required: true,
      suffix: (

        <span
          className="cursor-pointer select-none"
          onClick={() => togglePasswordVisibility("password")}
        >
          {showPassword["password"] ? "🙈" : "👁"}
        </span>
      )
    },
  ];


  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      navigate("/create-rfq");
    }
  }, [])

  const handleChange = (name, value, error = "") => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let hasError = false;
    const newErrors = { ...formErrors };

    // Validate required fields
    formFields.forEach((field) => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
        hasError = true;
      }
    });

    setFormErrors(newErrors);

    if (hasError) return;

    try {
      const res = await postCall("/v1/auth/login", formData);

      if (res.status === "success") {
        localStorage.setItem("authToken", res.token);
        localStorage.setItem("email", res.user.email);
        localStorage.setItem("role", res.user.role);
        localStorage.setItem("username", res.user.username);
        localStorage.setItem("firstName", res.user.firstName);
        localStorage.setItem("lastName", res.user.lastName);
        navigate("/rfq-summary");
      }

    } catch (err) {
      console.error(err);
    }
  };

  const togglePasswordVisibility = (fieldName) => {
    setShowPassword((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  return (
    <PageContainer>
      <div className="flex items-center justify-center flex-1">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
          <PageHeader title="Login" />

          <form onSubmit={handleSubmit} className="space-y-4">
            {formFields.map((field) => (
              <FormField
                key={field.name}
                {...field}
                type={showPassword[field.name] ? "text" : "password"}
                value={formData[field.name]}
                onChange={(val, err) => handleChange(field.name, val, err)}
                error={formErrors[field.name]}
              />
            ))}

            <Button type="submit" className="w-full" label="Login" />
          </form>
        </div>
      </div>
    </PageContainer>
  );
};

export default Login;
