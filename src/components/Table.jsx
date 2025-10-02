import React from "react";

const Table = ({ columns, data }) => {
  return (
    <table className="w-full border-collapse border border-gray-300">
      <thead>
        <tr>
          {columns.map((col, idx) =>
            !col.hide ? ( // if hide is true, then render column
              <th
                key={idx}
                className="border border-gray-300 px-4 py-2 bg-gray-100 text-left"
              >
                {col.header}
              </th>
            ) : null
          )}
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr key={idx} className="hover:bg-gray-50">
            {columns.map((col, cIdx) => {
              if (col.hide) return null; // render only if hide is true

              const value = row[col.accessor];
              const displayValue = col.valueFormatter
                ? col.valueFormatter(value, row , idx)
                : value;

              return (
                <td key={cIdx} className="border border-gray-300 px-4 py-2">
                  {displayValue}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;
