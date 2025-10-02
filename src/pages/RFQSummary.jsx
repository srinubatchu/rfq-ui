import React, { useEffect, useState, useMemo, useRef } from "react";
import { useHttp } from "../utils/axiosService.js";
import PageContainer from "../components/PageContainer.jsx";
import PageHeader from "../components/PageHeader.jsx";
import Counters from "../components/Counters.jsx";
import Table from "../components/Table.jsx";
import { formatDate } from "../utils/common.js";
import Button from "../components/Button.jsx";
import Slider from "../components/Slider.jsx";
import FormField from "../components/FormField.jsx";
import { useToast } from "../context/ToastContext.js";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal.jsx";
import { onSocketEvent, removeSocketEvent } from "../utils/socketManager.js";
import { getRFQStatus } from "../utils/rfqHelpers.js";
import { useRFQSocket } from "../hooks/useRFQSocket.js";
import { getRFQColumns } from "../config/rfqColumns.js";
const RFQSummary = () => {
  const { getCall, postCall } = useHttp();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const userEmail = useMemo(() => localStorage.getItem("email"), []);
  const userRole = useMemo(() => localStorage.getItem("role"), []);

  const [rfqsData, setRFQsData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const originalDataRef = useRef(originalData);

  const [counts, setCounts] = useState({});
  const [statusWiseData, setStatusWiseData] = useState({});
  const [activeCounter, setActiveCounter] = useState({ counter_name: "Active RFQs", key: "active" });

  const [isSliderOpenForPlaceBid, setIsSliderOpenForPlaceBid] = useState(false);
  const [isSliderOpenForViewBidSeller, setIsSliderOpenForViewBidSeller] = useState(false);
  const [sliderTitle, setSliderTitle] = useState("Place Bid");
  const [selectedRFQ, setSelectedRFQ] = useState(null);
  const [selectedRFQSellerQuotes, setSelectedRFQSellerQuotes] = useState({});
  const [selectedRFQSellerLogs, setSelectedRFQSellerLogs] = useState([]);
  const [formData, setFormData] = useState({});

  const [isModelOpenForAcceptProposeValue, setIsModelOpenForAcceptProposeValue,] = useState(false);
  const [isModelOpenForSendCounterValue, setIsModelOpenForSendCounterValue] = useState(false);

  useEffect(() => {
    originalDataRef.current = originalData;
  }, [originalData]);

  // --- Common processor ---
  const processRFQs = (rfqs) => {
    const counts = {};
    const grouped = {};
    const enriched = [];

    for (const rfq of rfqs) {

      const statusDetails = getRFQStatus(rfq, userRole, userEmail)

      const enrichedRfq = { ...rfq, ...statusDetails };
      enriched.push(enrichedRfq);

      const updatedStatus = statusDetails.status

      // count & group
      let key;
      if (updatedStatus === "Awarded") key = "awarded";
      else if (updatedStatus === "Expired") key = "expired";
      else if (updatedStatus === "Lost") key = "lost";
      else key = "active";

      counts[key] = (counts[key] || 0) + 1;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(enrichedRfq);
    }

    counts.total = enriched.length;
    grouped.total = enriched;
    setCounts(counts);
    setStatusWiseData(grouped);
    setRFQsData(grouped[activeCounter.key] || []);
    setOriginalData(enriched);
    originalDataRef.current = enriched;
  };

  const [tick, setTick] = useState(0);

useEffect(() => {
  const interval = setInterval(() => {
    setTick(t => t + 1); // force re-render every second
  }, 1000);

  return () => clearInterval(interval);
}, []);


  // --- Fetch ---
  const fetchRFQsData = async () => {
    try {
      const res = await getCall("/v1/rfqs");
      const rfqs = res?.data || [];
      processRFQs(rfqs);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRFQsData();
  }, []);

  

  const onCloseSlider = () => {
    setIsSliderOpenForPlaceBid(false);
    setIsSliderOpenForViewBidSeller(false);
    setFormData({});
  };

  const onCloseModal = () => {
    setIsModelOpenForAcceptProposeValue(false);
    setIsModelOpenForSendCounterValue(false);
    setFormData({});
  };

  const countersConfig = useMemo(() => {
    const baseCounters = [
      { counter_name: "Active RFQs", icon: "📄", key: "active" },
      { counter_name: "Awarded RFQs", icon: "🏆", key: "awarded" },
      { counter_name: "Expired RFQs", icon: "⏰", key: "expired" },
      { counter_name: "Total RFQs", icon: "📊", key: "total" },
    ];

    if (userRole === "seller") {
      baseCounters.splice(2, 0, { counter_name: "Lost RFQs", icon: "❌", key: "lost" });
      // Inserts before "Total RFQs"
    }

    return baseCounters;
  }, [userRole]);


  const handleCounterClick = (counter) => {
    if (counter.key === "total") return null;
    setActiveCounter(counter);
    setRFQsData(statusWiseData[counter.key] || []);
  };

  const onClickActionButton = async (row, buttonText) => {
    setSelectedRFQ(row);

    if (buttonText === "Place Bid") {
      setIsSliderOpenForPlaceBid(true);
      setSliderTitle(`Place Bid for ${row.rfqId}`);
      setFormData({ bidAmount: "" });
      return;
    }

    if (userRole === "seller") {
      const response = await getCall(`/v1/rfqs/seller-quotes/${row.rfqId}`);
      setSelectedRFQSellerQuotes(response.data.quotes?.[0] || {});
      setSelectedRFQSellerLogs(response.data.logs || []);
      setIsSliderOpenForViewBidSeller(true);
      setSliderTitle(`View Bid for ${row.rfqId}`);
      return;
    }

    navigate(`/bid-details/${row.rfqId}`);
  };

  const onSubmitBid = () => {
    if (
      !formData.bidAmount ||
      isNaN(formData.bidAmount) ||
      Number(formData.bidAmount) <= 0
    ) {
      showToast("Please enter a valid bid amount", "danger");
      return;
    }
    sellerQuotesActionCall({
      action: "Bid Placed",
      amount: formData.bidAmount,
      sellerEmail: userEmail,
    });
  };

  const sellerQuotesActionCall = async (params) => {
    const res = await postCall(`/v1/rfqs/bid/${selectedRFQ.rfqId}`, params);
    if (res?.status === "success") {
      onCloseSlider();
      // fetchRFQsData();
      onCloseModal();
    }
  };

  const onSubmitCounterValueBySeller = async () => {
    if (
      !formData.counterValue ||
      isNaN(formData.counterValue) ||
      Number(formData.counterValue) <= 0
    ) {
      showToast("Please enter a valid counter value", "danger");
      return;
    }
    sellerQuotesActionCall({
      action: "Countered",
      amount: formData.counterValue,
      sellerEmail: userEmail,
    });
  };

  const onSubmitAcceptProposedValue = async () => {
    sellerQuotesActionCall({
      action: "Accepted",
      amount: selectedRFQSellerQuotes.buyerProposedAmount,
      sellerEmail: userEmail,
    });
  };

  const onClickAcceptProposedValue = () =>setIsModelOpenForAcceptProposeValue(true);

  const onClickCounterValue = () => setIsModelOpenForSendCounterValue(true);

  const columns = useMemo(
    () =>
      getRFQColumns({
        activeCounter,
        userRole,
        userEmail,
        originalDataRef,
        processRFQs,
        onClickActionButton
      }),
    [activeCounter, tick]
  );

  const columnsForViewBidSeller = useMemo(
    () => [
      { header: "Action", accessor: "action" },
      {
        header: "Amount",
        accessor: "amount",
      },
      {
        header: "Action Time",
        accessor: "actionTimesamp",
        valueFormatter: (value) => formatDate(value, "date_time"),
      },
    ],
    []
  );

  

  useRFQSocket({
    originalDataRef,
    processRFQs,
    onCloseSlider,
    onCloseModal,
    onSocketEvent,
    removeSocketEvent
  });


  // --- Render ---
  return (
    <PageContainer>
      <PageHeader title="RFQ Summary">
        {userRole === "buyer" && (
          <Button
            variant="success"
            className="w-full mt-4"
            onClick={() => navigate("/create-rfq")}
            label="Create RFQ"
          />
        )}
      </PageHeader>

      <Counters
        items={countersConfig}
        counts={counts}
        onClickCounter={handleCounterClick}
        activeKey={activeCounter.key}
      />

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">
          {activeCounter.counter_name}
        </h3>
        <Table columns={columns} data={rfqsData} />
      </div>

      {/* Seller Place Bid Slider */}
      <Slider
        isSliderOpen={isSliderOpenForPlaceBid}
        title={sliderTitle}
        onClose={onCloseSlider}
        width="25%"
      >
        <FormField
          label="Your Bid Amount"
          name="bidAmount"
          type="text"
          placeholder="Enter your bid amount"
          required={true}
          formatPattern="integersOnly"
          value={formData?.bidAmount}
          onChange={(val) => setFormData({ ...formData, bidAmount: val })}
        />
        <Button
          variant="primary"
          className="w-full mt-4"
          onClick={onSubmitBid}
          label="Submit Bid"
        />
      </Slider>

      {/* Seller View Bid Slider */}
      <Slider
        isSliderOpen={isSliderOpenForViewBidSeller}
        title={sliderTitle}
        onClose={onCloseSlider}
        width="45%"
      >
        <Table
          columns={columnsForViewBidSeller}
          data={selectedRFQSellerLogs || []}
        />

        {selectedRFQSellerQuotes?.allowSellerCounter && (
          <div className="flex justify-end gap-4 mt-4">
            <Button
              label="Send Counter Value"
              type="button"
              variant="primary"
              onClick={onClickCounterValue}
            />
            <Button
              type="button"
              variant="success"
              label="Accept Proposed Value"
              onClick={onClickAcceptProposedValue}
            />
          </div>
        )}
      </Slider>

      {/* Accept Proposed Value Modal */}
      <Modal
        isOpen={isModelOpenForAcceptProposeValue}
        title={`Accept Proposed Value - ${selectedRFQ?.rfqId}`}
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
              label="Accept"
              type="button"
              variant="success"
              onClick={onSubmitAcceptProposedValue}
            />
          </div>
        }
      >
        <div className="flex flex-col gap-4 mt-2">
          <p className="text-gray-700">
            Are you sure you want to accept Proposed Value?
          </p>
          <div className="grid grid-cols-2 w-[60%]">
            <div className="font-medium text-gray-600">Proposed Value:</div>
            <div>{selectedRFQSellerQuotes?.buyerProposedAmount}</div>
          </div>
        </div>
      </Modal>

      {/* Counter Value Modal */}
      <Modal
        isOpen={isModelOpenForSendCounterValue}
        title={`Send Counter Value - ${selectedRFQ?.rfqId}`}
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
              label="Submit"
              type="button"
              variant="success"
              onClick={onSubmitCounterValueBySeller}
            />
          </div>
        }
      >
        <div className="flex flex-col gap-4 mt-2">
          <FormField
            name="counterValue"
            type="text"
            placeholder="Enter Amount"
            className="w-full max-w-[300px]"
            required={true}
            formatPattern="integersOnly"
            value={formData?.counterValue || ""}
            onChange={(val) =>
              setFormData((prev) => ({ ...prev, counterValue: val }))
            }
          />
          <p className="text-sm text-gray-500">
            Enter the amount you want to counter. Only integers are allowed.
          </p>
        </div>
      </Modal>
    </PageContainer>
  );
};

export default RFQSummary;
