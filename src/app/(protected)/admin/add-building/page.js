'use client';
import withPageGuard from '@/components/auth/withPageGuard';
import AddBuilding from '@/components/user/addBuilding/AddBuilding';

const AddBuildingPage = () => {
  return <AddBuilding />;
};

// export default AddBuildingPage;
export default withPageGuard(AddBuildingPage, '/admin/add-building');
