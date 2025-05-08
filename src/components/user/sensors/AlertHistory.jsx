import { alertHistoryData } from "@/data/data";
import DataTable from "react-data-table-component";

const AlertHistory = () => {
  return (
    <div className="shadow-md rounded-[15px] p-4 md:p-5 border border-gray-200">
      <h6 className="text-primary text-base font-semibold">Alert History</h6>
      <div className="mt-6">
        <DataTable
          data={alertHistoryData}
          columns={tableColumns}
          customStyles={tableStyles}
          fixedHeader
          fixedHeaderScrollHeight="40vh"
        />
      </div>
    </div>
  );
};

export default AlertHistory;

const tableColumns = [
  {
    name: "Date",
    selector: (row) => <span className="text-[#B4B4B4]">{row?.date}</span>,
    width: "15%",
  },
  {
    name: "Alert Name",
    selector: (row) => <span className="text-black">{row?.alertName}</span>,
    width: "25%",
  },
  {
    name: "Message",
    selector: (row) => <span className="text-primary">{row?.message}</span>,
    width: "65%",
  },
];

const tableStyles = {
  headCells: {
    style: {
      fontSize: "14px",
      fontWeight: 400,
      color: "#686868",
    },
  },
  rows: {
    style: {
      background: "#ECE8FF",
      borderRadius: "6px",
      padding: "14px 0",
      margin: "10px 0",
      borderBottomWidth: "0 !important",
    },
  },
  cells: {
    style: {
      color: "rgba(17, 17, 17, 1)",
      fontSize: "14px",
    },
  },
};
