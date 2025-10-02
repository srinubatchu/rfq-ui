import React from "react";

const Counters = ({ items = [], counts = {}, onClickCounter }) => {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-${items.length} gap-4 mb-6`}>
      {items.map((item, idx) => (
        <div
          key={idx}
          className="bg-white shadow rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50"
          onClick={() => onClickCounter(item)}
        >
          {/* Icon */}
          {item.icon && (
            <div className="mb-2 text-2xl text-blue-500">
              {item.icon}
            </div>
          )}

          {/* Count */}
          <span className="text-lg font-semibold">{counts?.[item.key] ?? 0}</span>

          {/* Label */}
          <span className="text-gray-600 text-sm">{item.counter_name}</span>
        </div>
      ))}
    </div>
  );
};

export default Counters;
