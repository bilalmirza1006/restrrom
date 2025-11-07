// 'use client';

// import React from 'react';
// import DataTable from 'react-data-table-component';
// import { useRouter } from 'next/navigation';
// import {
//   useGetAllAssignBuildingStatusQuery,
//   useUnAssignBuildingToInspectorMutation,
// } from '@/features/inspection/inspectionApi';
// import toast from 'react-hot-toast';

// // Helper function to format date
// const formatDate = (dateString) => {
//   if (!dateString) return '-';
//   const date = new Date(dateString);
//   return date.toLocaleString('en-US', {
//     year: 'numeric',
//     month: 'short',
//     day: '2-digit',
//     hour: '2-digit',
//     minute: '2-digit',
//   });
// };

// const InspectionHistoryTable = () => {
//   const router = useRouter();
//   const { data: status, isLoading, isError, isFetching } = useGetAllAssignBuildingStatusQuery();
//   const [unAssignBuilding] = useUnAssignBuildingToInspectorMutation();

//   if (isLoading || isFetching) return <p>Loading...</p>;
//   if (isError) return <p>Error loading inspection data.</p>;

//   const buildings = status?.data || [];

//   const handleUnassignClick = async ({ inspectorId, buildingId }) => {
//     console.log('inspectorId', inspectorId);
//     console.log('buildingId', buildingId);

//     if (!buildingId) {
//       toast.error('Building ID is missing');
//       return;
//     }

//     // setIsLoading(true);
//     try {
//       await unAssignBuilding({ inspectorId: inspectorId, buildingId }).unwrap();
//       toast.success('Building unassigned successfully!');
//     } catch (error) {
//       toast.error(error?.data?.message || 'Failed to unassign building');
//     } finally {
//       // setIsLoading(false);
//     }
//   };

//   const columns = [
//     {
//       name: 'Building Name',
//       selector: (row) => row?.buildingId?.name || '-',
//       sortable: true,
//       wrap: true,
//     },
//     {
//       name: 'Building Type',
//       selector: (row) => row?.buildingId?.type || '-',
//       sortable: true,
//     },
//     {
//       name: 'Owner Email',
//       selector: (row) => row?.ownerId?.email || '-',
//       sortable: true,
//     },
//     {
//       name: 'Inspector Email',
//       selector: (row) => row?.inspectorId?.email || '-',
//       sortable: true,
//     },
//     {
//       name: 'Status',
//       cell: (row) => (
//         <span className={`${row.isCompleted ? 'text-green-600' : 'text-yellow-600'} font-medium`}>
//           {row.isCompleted ? 'Completed' : 'Pending'}
//         </span>
//       ),
//       sortable: true,
//     },
//     {
//       name: 'Created At',
//       selector: (row) => formatDate(row.createdAt),
//       sortable: true,
//       wrap: true,
//     },
//     {
//       name: 'Updated At',
//       selector: (row) => formatDate(row.updatedAt),
//       sortable: true,
//       wrap: true,
//     },
//     {
//       name: 'Action',
//       cell: (row) => (
//         <>
//           {row.isCompleted ? (
//             <button
//               onClick={() => router.push(`/admin/inspection-details/${row.inspectionId}`)}
//               className="px-2 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md"
//             >
//               View
//             </button>
//           ) : (
//             <button
//               onClick={() =>
//                 handleUnassignClick({
//                   inspectorId: row?.inspectorId?._id,
//                   buildingId: row?.buildingId?._id,
//                 })
//               }
//               className="px-2 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded-md"
//             >
//               Unassign
//             </button>
//           )}
//         </>
//       ),
//       ignoreRowClick: true,
//       allowOverflow: true,
//       button: true,
//     },
//   ];

//   return (
//     <div className="w-full bg-white rounded-xl shadow-md p-4">
//       <h2 className="text-lg font-semibold mb-3">Inspection History</h2>

//       <div className="overflow-x-auto">
//         <DataTable
//           columns={columns}
//           data={buildings}
//           pagination
//           responsive
//           highlightOnHover
//           customStyles={{
//             headCells: {
//               style: {
//                 fontWeight: 'bold',
//                 fontSize: '14px',
//               },
//             },
//             cells: {
//               style: {
//                 fontSize: '14px',
//               },
//             },
//           }}
//         />
//       </div>
//     </div>
//   );
// };

// export default InspectionHistoryTable;
'use client';

import React, { useState } from 'react';
import DataTable from 'react-data-table-component';
import { useRouter } from 'next/navigation';
import {
  useGetAllAssignBuildingStatusQuery,
  useUnAssignBuildingToInspectorMutation,
} from '@/features/inspection/inspectionApi';
import toast from 'react-hot-toast';
import Button from '@/components/global/small/Button';

// Helper function to format date
const formatDate = dateString => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const InspectionHistoryTable = () => {
  const router = useRouter();
  const { data: status, isLoading, isError, refetch } = useGetAllAssignBuildingStatusQuery();
  const [unAssignBuilding] = useUnAssignBuildingToInspectorMutation();

  // Track which row is being unassigned
  const [loadingRowId, setLoadingRowId] = useState(null);

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error loading inspection data.</p>;

  const buildings = status?.data || [];

  const handleUnassignClick = async ({ inspectorId, buildingId }) => {
    if (!buildingId) {
      toast.error('Building ID is missing');
      return;
    }

    setLoadingRowId(buildingId);
    try {
      await unAssignBuilding({ inspectorId, buildingId }).unwrap();
      toast.success('Building unassigned successfully!');
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to unassign building');
    } finally {
      setLoadingRowId(null);
    }
  };

  const columns = [
    {
      name: 'Building Name',
      selector: row => row?.buildingId?.name || '-',
      sortable: true,
      wrap: true,
    },
    {
      name: 'Building Type',
      selector: row => row?.buildingId?.type || '-',
      sortable: true,
    },
    {
      name: 'Owner Email',
      selector: row => row?.ownerId?.email || '-',
      sortable: true,
    },
    {
      name: 'Inspector Email',
      selector: row => row?.inspectorId?.email || '-',
      sortable: true,
    },
    {
      name: 'Status',
      cell: row => (
        <span className={`${row.isCompleted ? 'text-green-600' : 'text-yellow-600'} font-medium`}>
          {row.isCompleted ? 'Completed' : 'Pending'}
        </span>
      ),
      sortable: true,
    },
    {
      name: 'Created At',
      selector: row => formatDate(row.createdAt),
      sortable: true,
      wrap: true,
    },
    {
      name: 'Updated At',
      selector: row => formatDate(row.updatedAt),
      sortable: true,
      wrap: true,
    },
    {
      name: 'Action',
      cell: row => (
        <>
          {row.isCompleted ? (
            <Button
              onClick={() => router.push(`/admin/inspection-details/${row.inspectionId}`)}
              className={'!h-auto w-full !px-2 !py-2 text-sm'}
              text="View"
            />
          ) : (
            <Button
              onClick={() =>
                handleUnassignClick({
                  inspectorId: row?.inspectorId?._id,
                  buildingId: row?.buildingId?._id,
                })
              }
              disabled={loadingRowId === row?.buildingId?._id}
              className={'!h-auto w-full !px-2 !py-2 text-sm'}
              // className={`px-2 py-1 text-sm rounded-md text-white ${
              //   loadingRowId === row?.buildingId?._id
              //     ? 'bg-gray-400 cursor-not-allowed'
              //     : 'bg-red-500 hover:bg-red-600'
              // }`}
              text={loadingRowId === row?.buildingId?._id ? 'UnAssigning' : 'Unassign'}
            />
          )}
        </>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  return (
    <div className="w-full rounded-xl bg-white p-4 shadow-md">
      <h2 className="mb-3 text-lg font-semibold">Inspection History</h2>

      <div className="overflow-x-auto">
        <DataTable
          columns={columns}
          data={buildings}
          pagination
          responsive
          highlightOnHover
          customStyles={{
            headCells: {
              style: {
                fontWeight: 'bold',
                fontSize: '14px',
              },
            },
            cells: {
              style: {
                fontSize: '14px',
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default InspectionHistoryTable;
