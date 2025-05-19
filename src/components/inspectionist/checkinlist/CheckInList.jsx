import React from "react";
import CheckInCard from "./CheckInCard";

function CheckInList({ buildingId }) {
  return (
    <div>
      <h1 className="text-[#05004E] text-[20px] font-semibold">All Restrooms</h1>
      <CheckInCard buildingId={buildingId} />
    </div>
  );
}

export default CheckInList;
