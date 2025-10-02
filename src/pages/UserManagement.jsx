import React, { useEffect, useState, useRef, useMemo } from "react";
import FormField from "../components/FormField";
import Table from "../components/Table";
import Button from "../components/Button";
import { useHttp } from "../utils/axiosService";
import { useToast } from "../context/ToastContext";
import { titleCase } from "../utils/formatPatterns";
import PageContainer from "../components/PageContainer";
import PageHeader from "../components/PageHeader";

const UserManagement = () => {
  const { getCall, postCall } = useHttp();
  const { showToast } = useToast();

  const userRoles = useMemo(
    () => [
      { label: "User", value: "user" },
      { label: "Admin", value: "admin" },
      { label: "Buyer", value: "buyer" },
      { label: "Seller", value: "seller" },
    ],
    []
  );

  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    role: "user",
  });
  const [formErrors, setFormErrors] = useState({});
  const hasFetched = useRef(false);

  const formFields = [
    { label: "First Name", name: "firstName", type: "text", placeholder: "Enter first name", regexPatternName: "name", formatPattern: "titleCase" },
    { label: "Last Name", name: "lastName", type: "text", placeholder: "Enter last name", regexPatternName: "name", formatPattern: "titleCase" },
    { label: "Username", name: "username", type: "text", placeholder: "Enter username", regexPatternName: "name", formatPattern: "titleCase" },
    { label: "Email", name: "email", type: "email", placeholder: "Enter email address", regexPatternName: "email" },
    { label: "Role", name: "role", type: "select", options: userRoles },
  ];

  const fetchUsers = async () => {
    try {
      const res = await getCall("/v1/users");
      if (res?.status === "success") {
        setUsers(res.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!hasFetched.current) {
      fetchUsers();
      hasFetched.current = true;
    }
  }, []);

  const handleChange = (name, value, error = "") => {
    setNewUser((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleAddUser = async () => {
    const requiredFields = ["firstName", "email"];
    for (const field of requiredFields) {
      if (!newUser[field]) {
        showToast(`${field} is required`, "danger");
        return;
      }
      if (formErrors[field]) {
        showToast(`Please fix errors in ${field}`, "danger");
        return;
      }
    }

    try {
      const res = await postCall("/v1/users", newUser);
      if (res?.status === "success") {
        showToast(res.message || "User added successfully", "success");
        setNewUser({ firstName: "", lastName: "", username: "", email: "", role: "user" });
        setFormErrors({});
        fetchUsers();
      }
    } catch (err) {
      showToast("Failed to add user", "danger");
      console.error(err);
    }
  };

  // Table columns for reusable Table component
  const columns = [
    { header: "First Name", accessor: "firstName" },
    { header: "Last Name", accessor: "lastName" },
    { header: "Username", accessor: "username", valueFormatter: (val) => val || "-" },
    { header: "Email", accessor: "email" },
    { header: "Role", accessor: "role", valueFormatter: (val) => titleCase(val) },
    { header: "Status", accessor: "status" },
  ];

  return (
    <PageContainer>
      <PageHeader title={"User Management"} />
      {/* Add User Form */}
      <div className="mb-6 p-4 border rounded shadow bg-white">
        <h3 className="font-semibold mb-4">Add New User</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {formFields.map((field) => (
            <FormField
              key={field.name}
              label={field.label}
              name={field.name}
              type={field.type}
              value={newUser[field.name]}
              error={formErrors[field.name] || ""}
              onChange={(val, err) => handleChange(field.name, val, err)}
              placeholder={field.placeholder}
              options={field.options || []}
              {...field}
            />
          ))}
        </div>
        <Button className="mt-4" variant="primary" onClick={handleAddUser} label="Add User" />
      </div>

      {/* Users Table */}
      <div className="border rounded shadow overflow-x-auto bg-white">
        <Table columns={columns} data={users} />
      </div>
    </PageContainer>

  );
};

export default UserManagement;
