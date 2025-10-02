import React, { useState, useEffect , useRef } from "react";
import moment from "moment";

export const formatDate = (dateStr , formatType = "date") => {
  return moment(dateStr).format(formatType == "date_time" ? "DD-MM-YYYY HH:mm" : "DD-MM-YYYY"  );
}

export const formatSeconds = (seconds) => {
  const h = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${h}:${m}:${s}`;
};

export const useCountdown = (endDate, onFinish) => {
  const [secondsLeft, setSecondsLeft] = useState(
    Math.max(Math.floor((new Date(endDate) - new Date()) / 1000), 0)
  );

  const finishedRef = useRef(false);

  useEffect(() => {
    if (secondsLeft === 0 && onFinish && !finishedRef.current) {
      finishedRef.current = true;
      // defer to after render
      setTimeout(() => onFinish(), 0);
    }

    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          if (onFinish && !finishedRef.current) {
            finishedRef.current = true;
            setTimeout(() => onFinish(), 0); // call after render
          }
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [endDate, onFinish]);

  return formatSeconds(secondsLeft);
};


export const CountdownCell = ({ endDate, onFinish }) => {
  const timeLeft = useCountdown(endDate, onFinish);
  return <span>{timeLeft}</span>;
};

export const GetRemainingTime = ({ endDate }) => {


  const remaining = endDate?.getTime() - Date.now();

  if (remaining <= 0) return "00:00:00";

  const hours = String(Math.floor(remaining / 3600000)).padStart(2, "0");
  const minutes = String(Math.floor((remaining % 3600000) / 60000)).padStart(2, "0");
  const seconds = String(Math.floor((remaining % 60000) / 1000)).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
};
