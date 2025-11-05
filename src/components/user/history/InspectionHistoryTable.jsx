"use client";

import React from "react";
import DataTable from "react-data-table-component";
import { useRouter } from "next/navigation";

// If you use shadcn/ui, you can import its Button, otherwise use a normal button
// import { Button } from "@/components/ui/button";
// OR replace with a Tailwind button if not using shadcn:
// const Button = ({ children, ...props }) => (
//   <button
//     {...props}
//     className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
//   >
//     {children}
//   </button>
// );

const InspectionHistoryTable = () => {
  const router = useRouter();

  // Example data
  const data = [
    { id: "B-001", status: "Active" },
    { id: "B-002", status: "Inactive" },
    { id: "B-003", status: "Under Inspection" },
  ];

  // Columns
  const columns = [
    {
      name: "Building ID",
      selector: (row) => row.id,
      sortable: true,
      wrap: true,
    },
    {
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <span
          className={`${
            row.status === "Active"
              ? "text-green-600"
              : row.status === "Inactive"
              ? "text-red-500"
              : "text-yellow-500"
          } font-medium`}
        >
          {row.status}
        </span>
      ),
    },
    {
      name: "Action",
      cell: (row) => (
        <button
          onClick={() => router.push(`/inspection/${row.id}`)}
          className="text-sm"
        >
          View
        </button>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  return (
    <div className="w-full bg-white rounded-xl shadow-md p-4">
      <h2 className="text-lg font-semibold mb-3">Inspection History</h2>

      {/* makes table scrollable on mobile */}
      <div className="overflow-x-auto">
        <DataTable
          columns={columns}
          data={data}
          pagination
          responsive
          highlightOnHover
          customStyles={{
            headCells: {
              style: {
                fontWeight: "bold",
                fontSize: "14px",
              },
            },
            cells: {
              style: {
                fontSize: "14px",
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default InspectionHistoryTable;
