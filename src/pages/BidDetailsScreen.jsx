import React, { useEffect, useState, useMemo } from "react";
import { useHttp } from "../utils/axiosService";
import PageContainer from "../components/PageContainer";
import PageHeader from "../components/PageHeader.jsx";
import Table from "../components/Table";
import { formatDate, CountdownCell } from "../utils/common";
import Button from "../components/Button.jsx";
import Slider from "../components/Slider.jsx";
import FormField from "../components/FormField.jsx";
import Modal from "../components/Modal.jsx";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "../context/ToastContext.js";
import { onSocketEvent, removeSocketEvent } from "../utils/socketManager.js";


const BidDetails = () => {
    const { rfqId } = useParams();
    const { getCall, postCall } = useHttp();
    const navigate = useNavigate()
    const { showToast } = useToast();
    const [rfqData, setRFQData] = useState({})
    const [selectedRFQSellerQuotes, setSelectedRFQSellerQuotes] = useState([]);
    const [selectedSellerLogs, setSelectedSellerLogs] = useState([])
    const [isSliderOpenForViewHistory, setIsSliderOpenForViewHistory] = useState(false)
    const [sliderTitle, setSliderTitle] = useState("")
    const [selectedRow, setSelectedRow] = useState(null); // sto
    const [isModelOpenForPropose, setIsModelOpenForPropose] = useState(false)
    const [isModelOpenForAward, setIsModelOpenForAward] = useState(false)
    const [formData, setFormData] = useState({})
    const columnsForBidDetails = useMemo(
        () => [

            {
                header: "",
                accessor: "select",
                hide: !rfqData.allowBuyerPropose,
                valueFormatter: (value, row) => (
                    <input
                        type="checkbox"
                        checked={selectedRow?.sellerEmail === row?.sellerEmail || false}
                        onChange={() => handleRowSelect(row)}
                    />
                ),
            },
            {
                header: "Rank",
                accessor: "rank",
                valueFormatter: (value, row, index) => index + 1, // simple 1-based rank
            },
            { header: "Seller Name", accessor: "sellerName" },
            { header: "Latest Bid Amount", accessor: "sellerCounterAmount", valueFormatter: (val, row) => val || row?.latestBidAmount },
            { header: "Proposed Amount", accessor: "buyerProposedAmount" },
            {
                header: "Bid History",
                accessor: "bidHistory",
                valueFormatter: (value, row) => (
                    <Button label="📜 History" onClick={() => handleViewBidHistory(row)} title="View Bid History" />
                ),
            },
            { header: "Status", accessor: "status" }, // added status at the end
        ],
        [selectedRow, rfqData]
    );



    const columnsForViewBidHistory = useMemo(
        () => [
            { header: "Action", accessor: "action" },
            { header: "Amount", accessor: "amount" },
            { header: "Action Time", accessor: "actionTimesamp", valueFormatter: (value) => formatDate(value, "date_time") },
        ],
        []
    );


    useEffect(() => {
        fetchData()
    }, [])

    const updateRFQStatus = (rfq) => {
        if (!rfq || !rfq.rfqDate) return rfq;

        const biddingEnd = new Date(rfq.rfqDate);
        biddingEnd.setHours(biddingEnd.getHours() + (rfq.biddingWindowHours || 0));

        const validityEnd = new Date(rfq.rfqDate);
        validityEnd.setHours(validityEnd.getHours() + (rfq.rfqValidityHours || 0));

        const now = new Date();
        return {
            ...rfq,
            allowBuyerPropose: !(!rfq.allowBuyerPropose || now < biddingEnd || now >= validityEnd)
        };
    };

    useEffect(() => {

        const updateRfQHandler = (updatedRFQ) => {
            console.log("📡 RFQ update event received:", updatedRFQ);
            fetchData()
        };

        onSocketEvent("counterOffered", updateRfQHandler);
        onSocketEvent("proposalAccepted", updateRfQHandler);

        // Cleanup listeners on unmount
        return () => {
            removeSocketEvent("counterOffered", updateRfQHandler);
            removeSocketEvent("proposalAccepted", updateRfQHandler);
        };
    }, []);



    const fetchData = async () => {

        const res = await getCall(`/v1/rfqs/${rfqId}`);
        let rfq = res?.data?.[0] || {};

        rfq = updateRFQStatus(rfq); // update allowBuyerPropose based on timers
        setRFQData(rfq);
        const response = await getCall(`/v1/rfqs/seller-quotes/${rfqId}`, {
            params:
            {
                fetch: "quotes"
            }
        });
        const quotes = response.data.quotes || [];

        const sortedQuotes = quotes.sort((a, b) => {
            const aAmount = a.sellerCounterAmount ?? a.latestBidAmount ?? 0;
            const bAmount = b.sellerCounterAmount ?? b.latestBidAmount ?? 0;
            return aAmount - bAmount; // descending order
        });

        setSelectedRFQSellerQuotes(sortedQuotes);
    }

    const handleViewBidHistory = async (row) => {
        const response = await getCall(`/v1/rfqs/seller-quotes/${rfqId}`, {
            params:
            {
                fetch: "logs", sellerEmail: row.sellerEmail
            }
        });
        setSelectedSellerLogs(response.data.logs)
        setSliderTitle(`Bid History - ${row.sellerName}`)
        setIsSliderOpenForViewHistory(true)

    }

    const handleRowSelect = (row) => {
        // Toggle selection: deselect if already selected
        setSelectedRow((prev) => (prev?.sellerEmail === row.sellerEmail ? null : row));
    };


    const onCloseSlider = () => {
        setIsSliderOpenForViewHistory(false)
    }

    const onClickPropose = () => {
        setIsModelOpenForPropose(true)
    }

    const onClickAward = () => {
        setIsModelOpenForAward(true)
    }

    const onSubmitProposeValue = () => {
        if (!formData.proposedValue || isNaN(formData.proposedValue) || Number(formData.proposedValue) <= 0) {
            showToast("Please enter a valid bid amount", "danger");
            return;
        }

        sellerQuotesActionCall(
            {
                action: "Proposed",
                amount: formData.proposedValue,
                sellerEmail: selectedRow.sellerEmail
            }
        )
    }


    const onSubmitAwardRFQ = () => {
        sellerQuotesActionCall(
            {
                action: "Awarded",
                amount: selectedRow.sellerCounterAmount || selectedRow.latestBidAmount,
                sellerEmail: selectedRow.sellerEmail
            }
        )
    }


    const onCloseModal = () => {
        setIsModelOpenForAward(false)
        setIsModelOpenForPropose(false)
        setFormData({})
    }

    const sellerQuotesActionCall = async (params) => {
        const res = await postCall(`/v1/rfqs/bid/${rfqId}`, params);
        if (res?.status === "success") {
            onCloseModal();
            fetchData();
            setSelectedRow(null)
        }
    }

    const onTimerFinish = () => {
        fetchData()
    };

    return (
        <PageContainer>
            <PageHeader title={`Bid Details - ${rfqId}`} >
                <Button
                    label="← Back"
                    variant="outlinePrimary"
                    onClick={() => navigate("/rfq-summary")}
                    className="px-3 py-1 text-sm"
                />
            </PageHeader>

            {rfqData?.rfqDate && !rfqData?.awardedSellerEmail && (
                <div className="flex justify-end gap-6 mb-4">
                    {/* Bidding Window Timer */}
                    <div className="bg-gray-100 p-4 rounded-lg text-center w-[220px]">
                        <div className="font-medium text-gray-700">Bidding Window</div>
                        <div className="text-lg font-semibold text-blue-600">
                            <CountdownCell
                                endDate={new Date(rfqData.rfqDate).setHours(
                                    new Date(rfqData.rfqDate).getHours() + (rfqData.biddingWindowHours || 0)
                                )}
                                onFinish={onTimerFinish}
                            />
                        </div>
                    </div>

                    {/* RFQ Validity Timer */}
                    <div className="bg-gray-100 p-4 rounded-lg text-center w-[220px]">
                        <div className="font-medium text-gray-700">RFQ Validity</div>
                        <div className="text-lg font-semibold text-red-600">
                            <CountdownCell
                                endDate={new Date(rfqData.rfqDate).setHours(
                                    new Date(rfqData.rfqDate).getHours() + (rfqData.rfqValidityHours || 0)
                                )}
                                onFinish={onTimerFinish}
                            />
                        </div>
                    </div>
                </div>
            )}



            <Table columns={columnsForBidDetails} data={selectedRFQSellerQuotes || []} />
            {selectedRow && rfqData?.allowBuyerPropose && <div className="flex justify-end gap-4 mt-4">
                <Button label="Propose" type="button" variant="primary" onClick={onClickPropose} />
                <Button type="button" variant="success" label="Award" onClick={onClickAward} />
            </div>}

            <Slider
                isSliderOpen={isSliderOpenForViewHistory}
                title={sliderTitle}
                onClose={onCloseSlider}
                width="45%"
            >
                {/* Table showing history */}
                <Table columns={columnsForViewBidHistory} data={selectedSellerLogs || []} />
            </Slider>

            <Modal
                isOpen={isModelOpenForPropose}
                title={`Send Proposed Value - ${selectedRow?.sellerName}`}
                onClose={onCloseModal}
                footer={
                    <div className="flex justify-end gap-4 mt-6">
                        <Button
                            label="Cancel"
                            type="button"
                            variant="outlineDanger"
                            onClick={onCloseModal}
                        />
                        <Button
                            label="Send"
                            type="button"
                            variant="success"
                            onClick={onSubmitProposeValue}
                        />
                    </div>
                }
            >
                <div className="flex flex-col gap-4 mt-2">
                    <FormField
                        name="proposedValue"
                        type="text"
                        placeholder="Enter Amount"
                        className="w-full max-w-[300px]" // better than 70% for consistency
                        required={true}
                        formatPattern="integersOnly"
                        value={formData?.proposedValue || ""}
                        onChange={(val) =>
                            setFormData((prev) => ({ ...prev, proposedValue: val }))
                        }
                    />
                    <p className="text-sm text-gray-500">
                        Enter the amount you want to propose. Only integers are allowed.
                    </p>
                </div>
            </Modal>

            <Modal
                isOpen={isModelOpenForAward}
                title={`Award RFQ - ${selectedRow?.sellerName}`}
                onClose={onCloseModal}
                footer={
                    <div className="flex justify-end gap-4 mt-6">
                        <Button
                            label="Cancel"
                            type="button"
                            variant="outlineDanger"
                            onClick={onCloseModal}
                        />
                        <Button
                            label="Award"
                            type="button"
                            variant="success"
                            onClick={onSubmitAwardRFQ}
                        />
                    </div>
                }
            >
                <div className="flex flex-col gap-4 mt-2">
                    <p className="text-gray-700">
                        Are you sure you want to award this RFQ to <strong>{selectedRow?.sellerName}</strong>?
                    </p>

                    <div className="grid grid-cols-2 w-[45%]">
                        <div className="font-medium text-gray-600">Bid Amount:</div>
                        <div>{selectedRow?.sellerCounterAmount || selectedRow?.latestBidAmount}</div>

                        {/* Add more fields if needed */}
                    </div>
                </div>
            </Modal>



        </PageContainer>
    )
}

export default BidDetails