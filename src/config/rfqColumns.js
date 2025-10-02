import React from "react";
import Button from "../components/Button.jsx";
import { formatDate, GetRemainingTime } from "../utils/common.js";

export const getRFQColumns = ({
    activeCounter,
    userRole,
    userEmail,
    originalDataRef,
    processRFQs,
    onClickActionButton
}) => [
        { header: "RFQ ID", accessor: "rfqId" },
        {
            header: "RFQ Date",
            accessor: "rfqDate",
            valueFormatter: (value) => formatDate(value, "date_time"),
        },
        { header: "Title", accessor: "title" },
        { header: "Category", accessor: "category" },
        { header: "Product", accessor: "productName" },
        { header: "Quantity", accessor: "quantity" },
        { header: "Units", accessor: "unit" },
        { header: "Base Price", accessor: "basePrice" },
        { header: "Additional Details", accessor: "additionalDetails" },
        { header: "Status", accessor: "status" },
        {
            header: "Bidding Window",
            accessor: "biddingWindowHours",
            hide: !["active", "total"].includes(activeCounter.key),
            valueFormatter: (value, row) => {
                if (!row.rfqDate || !value) return "-";

                if (row.status === "Expired" || row.isBiddingWindowEnd) return "00:00:00";


                const endDate = new Date(row.rfqDate);
                endDate.setHours(endDate.getHours() + value);



                if (Date.now() >= endDate?.getTime()) {
                    setTimeout(() => processRFQs(originalDataRef.current), 1000)
                    return "00:00:00";
                }

                return (
                    <div className="text-lg font-semibold text-blue-600">
                        <GetRemainingTime endDate={endDate} />
                    </div>
                );
            },
        },

        // 🔴 RFQ Validity
        {
            header: "RFQ Validity",
            accessor: "rfqValidityHours",
            hide: !["active", "total"].includes(activeCounter.key),
            valueFormatter: (value, row) => {
                if (!row.rfqDate || !value) return "-";

                if (row.status === "Expired" || row.isValidityEnd) return "00:00:00";

                const endDate = new Date(row.rfqDate);
                endDate.setHours(endDate.getHours() + value);


                if (Date.now() >= endDate?.getTime()) {
                    setTimeout(() => processRFQs(originalDataRef.current), 1000)
                    return "00:00:00";
                }


                return (
                    <div className="text-lg font-semibold text-red-600">
                        <GetRemainingTime endDate={endDate} />
                    </div>
                );
            },
        },
        {
            header: "Action",
            accessor: "action",
            valueFormatter: (value, row) => {
                let buttonText = "View Bid";

                if (userRole === "seller") {
                    const hasBid = row?.participatingSellers?.includes(userEmail);
                    const rfqEndTime = new Date(row.rfqDate);
                    rfqEndTime.setHours(rfqEndTime.getHours() + row.biddingWindowHours);
                    const isExpired = new Date() > rfqEndTime;

                    if (hasBid) buttonText = "View Bid";
                    else if (isExpired) buttonText = "Not Participated";
                    else buttonText = "Place Bid";
                } else {
                    const hasBid = row?.participatingSellers?.length > 0;
                    if (!hasBid) buttonText = "No Bids Yet";
                }

                const isDisabled = ["Not Participated", "No Bids Yet"].includes(
                    buttonText
                );
                const variant = isDisabled ? "outlineDanger" : "success";

                return (
                    <Button
                        type="submit"
                        className="px-2"
                        onClick={() => onClickActionButton(row, buttonText)}
                        label={buttonText}
                        disabled={isDisabled}
                        variant={variant}
                    />
                );
            },
        },
    ];
