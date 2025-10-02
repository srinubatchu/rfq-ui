import { useEffect } from "react";

export const useRFQSocket = ({
    originalDataRef,   // ref passed from parent
    processRFQs,
    onCloseSlider,
    onCloseModal,
    onSocketEvent,
    removeSocketEvent
}) => {
    useEffect(() => {
        const rfqCreatedHandler = (newRFQ) => {
            console.log("📡 rfqCreated event received:", newRFQ);
            if (newRFQ) {
                processRFQs([newRFQ, ...originalDataRef.current]);
            }
        };

        const updateRfQHandler = (updatedRFQ) => {
            console.log("📡 RFQ update event received:", updatedRFQ);
            if (!updatedRFQ) return;

            const exists = originalDataRef.current.some(rfq => rfq.rfqId === updatedRFQ.rfqId);

            if (exists) {
                processRFQs(
                    originalDataRef.current.map(rfq =>
                        rfq.rfqId === updatedRFQ.rfqId ? updatedRFQ : rfq
                    )
                );
            } else {
                processRFQs([updatedRFQ, ...originalDataRef.current]);
            }

            onCloseSlider();
            onCloseModal();
        };

        // Subscribe to events
        const events = ["rfqCreated", "bidPlaced", "proposalMade", "counterOffered", "proposalAccepted", "rfqAwarded"];
        events.forEach(event => {
            if (event === "rfqCreated") onSocketEvent(event, rfqCreatedHandler);
            else onSocketEvent(event, updateRfQHandler);
        });

        // Cleanup
        return () => {
            events.forEach(event => {
                if (event === "rfqCreated") removeSocketEvent(event, rfqCreatedHandler);
                else removeSocketEvent(event, updateRfQHandler);
            });
        };
    }, []);
};
