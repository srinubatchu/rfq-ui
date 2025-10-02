export const processRFQsHelper = (rfqs, userEmail, userRole) => {
    const now = new Date();
    const counts = {};
    const grouped = {};
    const enrichedRFQs = rfqs.map(rfq => {
        let updatedStatus = rfq.status;

        if (!["Awarded", "Expired", "Lost"].includes(updatedStatus)) {
            const biddingEnd = new Date(rfq.rfqDate);
            biddingEnd.setHours(biddingEnd.getHours() + rfq.biddingWindowHours);

            const validityEnd = new Date(rfq.rfqDate);
            validityEnd.setHours(validityEnd.getHours() + rfq.rfqValidityHours);

            // Expired logic
            if (userRole === "seller" &&
                (!rfq.participatingSellers?.includes(userEmail)) &&
                now >= biddingEnd) updatedStatus = "Expired";

            if (userRole === "buyer" &&
                (!rfq.participatingSellers || rfq.participatingSellers.length === 0) &&
                now >= biddingEnd) updatedStatus = "Expired";

            if (!rfq.awardedSellerEmail && now >= validityEnd) updatedStatus = "Expired";

        }

        const enrichedRfq = { ...rfq, status: updatedStatus };

        // Count & group
        let key = "active";
        if (updatedStatus === "Awarded") key = "awarded";
        else if (updatedStatus === "Expired") key = "expired";
        else if (updatedStatus === "Lost") key = "lost";

        counts[key] = (counts[key] || 0) + 1;
        grouped[key] = grouped[key] || [];
        grouped[key].push(enrichedRfq);

        return enrichedRfq;
    });

    counts.total = enrichedRFQs.length;
    grouped.total = enrichedRFQs;

    return { enrichedRFQs, counts, grouped };
};

// Button text helper
export const getActionButtonText = (rfq, userEmail, userRole) => {
    if (userRole === "seller") {
        const hasBid = rfq?.participatingSellers?.includes(userEmail);
        const rfqEndTime = new Date(rfq.rfqDate);
        rfqEndTime.setHours(rfqEndTime.getHours() + rfq.biddingWindowHours);
        const isExpired = new Date() > rfqEndTime;

        if (hasBid) return "View Bid";
        if (isExpired) return "Not Participated";
        return "Place Bid";
    } else {
        return rfq?.participatingSellers?.length > 0 ? "View Details" : "No Bids Yet";
    }
};

/* Get RFQ Status */

export const getRFQStatus = (rfq, userRole, userEmail) => {
    let updatedStatus = rfq.status;
    let isBiddingWindowEnd = false
    let isValidityEnd = false

    if (!["Awarded", "Lost", "Expired"].includes(updatedStatus)) {
        const biddingEnd = new Date(rfq.rfqDate);
        biddingEnd.setHours(biddingEnd.getHours() + rfq.biddingWindowHours);

        const validityEnd = new Date(rfq.rfqDate);
        validityEnd.setHours(validityEnd.getHours() + rfq.rfqValidityHours);

        const now = new Date()
        // Seller perspective
        if (
            userRole === "seller" &&
            (!rfq.participatingSellers ||
                !rfq.participatingSellers.includes(userEmail)) &&
            now >= biddingEnd
        ) {
            updatedStatus = "Expired";
            isBiddingWindowEnd = true
        }

        // Buyer perspective
        if (
            userRole === "buyer" &&
            (!rfq.participatingSellers ||
                rfq.participatingSellers.length === 0) &&
            now >= biddingEnd
        ) {
            updatedStatus = "Expired";
        }

        if (now >= biddingEnd) {
            isBiddingWindowEnd = true
        }

        // Validity expired
        if (!rfq.awardedSellerEmail && now >= validityEnd) {
            updatedStatus = "Expired";
        }

        if (now >= validityEnd) {
            isValidityEnd = true
        }
    }

    return { status : updatedStatus, isBiddingWindowEnd, isValidityEnd }
}
