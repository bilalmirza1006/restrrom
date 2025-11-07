import React from 'react';
import CheckInCard from './CheckInCard';

function CheckInList({ buildingId }) {
  console.log('buildingIdbuildingIdbuildingIdbuildingIdbuildingId', buildingId);

  return (
    <div>
      <h1 className="text-[20px] font-semibold text-[#05004E]">All Restrooms</h1>
      <div className="w-[720px] overflow-auto sm:w-full">
        <CheckInCard buildingId={buildingId} />
      </div>
    </div>
  );
}

export default CheckInList;
