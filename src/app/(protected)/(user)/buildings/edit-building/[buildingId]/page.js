import React from 'react';

function EditBuildingById({ params }) {
  const { buildingId } = params;
  console.log('Editing building:', buildingId);
  return <div>EditBuildingById</div>;
}

export default EditBuildingById;
