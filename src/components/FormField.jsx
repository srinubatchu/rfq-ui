import Input from "./Input";
import Select from "./Select";
import Textarea from "./Textarea";
import DatePickerInput from "./DatePicker";

const FormField = ({
  type = "text",
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder,
  required = false,
  error = "",
  className="",
  ...rest 
}) => {
  let FieldComponent;

  if (type === "date") {
    FieldComponent = (
      <DatePickerInput
        selectedDate={value}
        onChange={onChange}
        placeholder={placeholder || "Select date"}
        showTimeSelect={rest.showTimeSelect || false}
        dateFormat={rest.dateFormat || "dd/MM/yyyy"}
        minDate={rest.minDate || null}
        maxDate={rest.maxDate || null}
        {...rest}
      />
    );
  } else if (type === "select") {
    FieldComponent = (
      <Select
        name={name}
        value={value}
        onChange={onChange}
        options={options}
        required={required}
        {...rest} // pass extra props
      />
    );
  } else if (type === "textarea") {
    FieldComponent = (
      <Textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        {...rest}
      />
    );
  } else {
    FieldComponent = (
      <Input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        {...rest}
      />
    );
  }

  return (
    <div className={`form-field mb-4 ${className}`}>
      {label && <label className="block mb-1 font-medium">{label}</label>}
      {FieldComponent}
      {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
    </div>
  );
};

export default FormField;
