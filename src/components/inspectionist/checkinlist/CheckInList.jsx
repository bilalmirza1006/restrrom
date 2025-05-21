import React from 'react';
import CheckInCard from './CheckInCard';

function CheckInList({ buildingId }) {
  return (
    <div>
      <h1 className="text-[#05004E] text-[20px] font-semibold">All Restrooms</h1>
      <div className="w-[720px] sm:w-full overflow-auto">
        <CheckInCard buildingId={buildingId} />
      </div>
    </div>
  );
}

export default CheckInList;
