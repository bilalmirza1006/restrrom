'use client';
import withPageGuard from '@/components/auth/withPageGuard';
import EditBuilding from '@/components/user/editBuilding/EditBuilding';

const EditBuildingPage = () => {
  return <EditBuilding />;
};

// export default EditBuildingPage;
export default withPageGuard(EditBuildingPage, '/admin/buildings/edit-building/[buildingId]');
