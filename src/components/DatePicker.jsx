import React, { useState } from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DatePickerInput = ({
    value,          // controlled value from parent
    onChange,       // callback to parent
    placeholder = "Select date",
    showTimeSelect = false,
    dateFormat = "dd/MM/yyyy",
    minDate = null,
    maxDate = null,
}) => {
    const [selectedDate, setSelectedDate] = useState(value || null);

    const handleDateChange = (date) => {
        if (!date) return;

        const now = new Date();
        const pickedDate = new Date(date);

        // If picked date is today, set time to current time
        if (
            pickedDate.toDateString() === now.toDateString()
        ) {
            pickedDate.setHours(now.getHours());
            pickedDate.setMinutes(now.getMinutes());
        }
        else {
            pickedDate.setHours(0);
            pickedDate.setMinutes(0);

        }

        setSelectedDate(pickedDate);
        onChange && onChange(pickedDate);
    };


    return (
        <div className="w-full">
            <ReactDatePicker
                selected={selectedDate}
                onChange={handleDateChange}  // local handler
                placeholderText={placeholder}
                showTimeSelect={showTimeSelect}
                timeFormat="HH:mm"
                dateFormat={showTimeSelect ? "dd/MM/yyyy HH:mm" : dateFormat}
                minDate={minDate}
                maxDate={maxDate}
                className="w-full h-[42px] border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                wrapperClassName="w-full"
            />
        </div>
    );
};

export default DatePickerInput;
