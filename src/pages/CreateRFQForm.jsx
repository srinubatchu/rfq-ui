import React, { useState } from "react";
import FormField from "../components/FormField";
import Button from "../components/Button";
import { useHttp } from "../utils/axiosService";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import PageContainer from "../components/PageContainer";
import { useEffect } from "react";


// Example options (replace with actual data from backend)
const categories = ["Electronics", "Furniture", "Clothing"];
const sellersList = [
  { label: "Seller 1", value: "seller1@rfq.in" },
  { label: "Seller 2", value: "seller2@rfq.in" },
  { label: "Seller 3", value: "seller3@rfq.in" },
  { label: "Seller 4", value: "seller4@rfq.in" },
  { label: "Seller 5", value: "seller5@rfq.in" },
  { label: "Seller 6", value: "seller6@rfq.in" },
  { label: "Seller 7", value: "seller7@rfq.in" },
];
const biddingDurations = [
  { label: "1 hr", value: 1 },
  { label: "2 hr", value: 2 },
  { label: "3 hr", value: 3 },
];
const rfqValidities = [
  { label: "8 hr", value: 8 },
  { label: "16 hr", value: 16 },
  { label: "24 hr", value: 24 },
];
const units = ["Kg", "Liters", "Pieces"];

const CreateRFQForm = () => {
  const { postCall } = useHttp();
  const navigate = useNavigate();


  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  const handleChange = (name, value, error = "") => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Simple validation
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (!formData[key]) newErrors[key] = "Required";
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const res = await postCall("/v1/rfqs", formData);
      if (res?.status == "success") {
        navigate("/rfq-summary");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Sections fields
  const rfqInfoFields = [
    { label: "Title", type: "input", name: "title", placeholder: "Title", required: true },
    { label: "Category", type: "select", name: "category", options: categories, placeholder: "Select Category", required: true },
    { label: "Bidding Window", type: "select", name: "biddingWindow", options: biddingDurations, placeholder: "Bidding Window", required: true },
    { label: "RFQ Validity", type: "select", name: "rfqValidity", options: rfqValidities, placeholder: "RFQ Validity", required: true },
    { label: "Sellers", type: "select", name: "sellersEmails", options: sellersList, placeholder: "Select Sellers", multiple: true, required: true , className:"md:col-span-4" },
  ];

  const productDetailsFields = [
    { label: "Product Name", name: "productName", placeholder: "Enter Product Name", required: true },
    { label: "Quantity", type: "number", name: "quantity", placeholder: "Enter Quantity", required: true },
    { label: "Unit", type: "select", name: "unit", options: units, placeholder: "Select Unit", required: true },
    { label: "Base Price", type: "number", name: "basePrice", placeholder: "Enter Base Price" },
    { label: "Delivery Date", type: "date", name: "deliveryDate", placeholder: "Select Delivery Date", required: true },
  ];

  const additionalDetailsFields = [
    { label: "Additional Details", type: "textarea", name: "additionalDetails", placeholder: "Any additional info" },
  ];

  useEffect(() => {
    const userRole = localStorage.getItem("role");
    if (userRole !== "buyer") {
      navigate("/rfq-summary"); // go to previous page
    }
  }, []);



  return (
    <PageContainer>
      <PageHeader title={"Create RFQ"} />
      <div className="bg-white shadow-lg rounded-xl p-6">

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* RFQ Information */}
          <div>
            <h3 className="text-lg font-semibold mb-2">RFQ Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {rfqInfoFields.map((field) => (
                <FormField
                  key={field.name}
                  {...field}
                  value={formData[field.name] || ""}
                  onChange={(val, err) => handleChange(field.name, val, err)}
                  error={errors[field.name]}
                />
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Product Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
              {productDetailsFields.map((field) => (
                <FormField
                  key={field.name}
                  {...field}
                  value={formData[field.name] || ""}
                  onChange={(val, err) => handleChange(field.name, val, err)}
                  error={errors[field.name]}
                />
              ))}
            </div>
          </div>

          {/* Additional Details */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Additional Details</h3>
            {additionalDetailsFields.map((field) => (
              <FormField
                key={field.name}
                {...field}
                value={formData[field.name] || ""}
                onChange={(val, err) => handleChange(field.name, val, err)}
                error={errors[field.name]}
              />
            ))}
          </div>

          <div className="flex justify-end gap-4 mt-4">
            <Button
              label="Cancel"
              type="button"
              variant="outlineDanger"
              onClick={() => navigate("/rfq-summary")}
            />
            <Button type="submit" variant="success" label="Submit RFQ" />
          </div>

        </form>
      </div>
    </PageContainer>
  );
};

export default CreateRFQForm;
