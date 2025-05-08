import { subscriptionHistoryData, tableStyles } from "@/data/data";
import DataTable from "react-data-table-component";
import { AiOutlineDownload } from "react-icons/ai";

const SubscriptionHistory = () => {
  return (
    <div>
      <DataTable
        columns={columns}
        data={subscriptionHistoryData}
        selectableRows
        selectableRowsHighlight
        customStyles={tableStyles}
        fixedHeader
        fixedHeaderScrollHeight="70vh"
      />
    </div>
  );
};

export default SubscriptionHistory;

const columns = [
  {
    name: "Date",
    selector: (row) => row.date,
  },
  {
    name: "Plan",
    selector: (row) => row.plan,
  },
  {
    name: "Amount",
    selector: (row) => <span>${row.amount}</span>,
  },
  {
    name: "Status",
    cell: (row) =>
      row.status === "active" ? (
        <div className="bg-[#B2FFB0] rounded-[6px] text-sm w-[90px] h-8 grid place-items-center capitalize">
          {row.status}
        </div>
      ) : row.status === "expired" ? (
        <div className="bg-[#D3D3D3] rounded-[6px] text-sm w-[90px] h-8 grid place-items-center  capitalize">
          {row.status}
        </div>
      ) : (
        <div className="bg-[#FF7A7F] rounded-[6px] text-sm w-[90px] h-8 grid place-items-center capitalize text-white">
          {row.status}
        </div>
      ),
  },
  {
    name: "Invoice",
    selector: () => (
      <div className="cursor-pointer">
        <AiOutlineDownload fontSize={22} fontWeight={700} />
      </div>
    ),
  },
];
