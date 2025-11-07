// import { subscriptionHistoryData, tableStyles } from '@/data/data';
// import { useGetSubscriptionHistoryQuery } from '@/features/subscription/subscriptionApi';
// import DataTable from 'react-data-table-component';
// import { AiOutlineDownload } from 'react-icons/ai';
// import { useSelector } from 'react-redux';

// const SubscriptionHistory = () => {
//   const { user, isAuthenticated } = useSelector((state) => state.auth);
//   console.log('user', user.user);
//   const userId = user.user._id;
//   const { data: historyData, isLoading: isHistoryLoading } = useGetSubscriptionHistoryQuery(
//     userId,
//     {
//       skip: !userId,
//     }
//   );
//   console.log('historyData', historyData);

//   return (
//     <div>
//       <DataTable
//         columns={columns}
//         data={subscriptionHistoryData}
//         selectableRows
//         selectableRowsHighlight
//         customStyles={tableStyles}
//         fixedHeader
//         fixedHeaderScrollHeight="70vh"
//       />
//     </div>
//   );
// };

// export default SubscriptionHistory;

// const columns = [
//   {
//     name: 'Date',
//     selector: (row) => row.date,
//   },
//   {
//     name: 'Plan',
//     selector: (row) => row.plan,
//   },
//   {
//     name: 'Amount',
//     selector: (row) => <span>${row.amount}</span>,
//   },
//   {
//     name: 'Status',
//     cell: (row) =>
//       row.status === 'active' ? (
//         <div className="bg-[#B2FFB0] rounded-[6px] text-sm w-[90px] h-8 grid place-items-center capitalize">
//           {row.status}
//         </div>
//       ) : row.status === 'expired' ? (
//         <div className="bg-[#D3D3D3] rounded-[6px] text-sm w-[90px] h-8 grid place-items-center  capitalize">
//           {row.status}
//         </div>
//       ) : (
//         <div className="bg-[#FF7A7F] rounded-[6px] text-sm w-[90px] h-8 grid place-items-center capitalize text-white">
//           {row.status}
//         </div>
//       ),
//   },
//   {
//     name: 'Invoice',
//     selector: () => (
//       <div className="cursor-pointer">
//         <AiOutlineDownload fontSize={22} fontWeight={700} />
//       </div>
//     ),
//   },
// ];

import { subscriptionHistoryData, tableStyles } from '@/data/data';
import { useGetSubscriptionHistoryQuery } from '@/features/subscription/subscriptionApi';
import DataTable from 'react-data-table-component';
import { AiOutlineDownload } from 'react-icons/ai';
import { useSelector } from 'react-redux';

const SubscriptionHistory = () => {
  const { user } = useSelector(state => state.auth);
  const userId = user?.user?._id;

  const { data: historyData, isLoading: isHistoryLoading } = useGetSubscriptionHistoryQuery(
    userId,
    {
      skip: !userId,
    }
  );
  console.log('historyData', historyData);

  // Transform API response
  const formattedData =
    historyData?.data?.map(item => ({
      date: new Date(item.createdAt).toLocaleString(),
      plan: item.plan || 'N/A',
      amount: item.plan === 'yearly' ? 120 : item.plan === 'monthly' ? 10 : 0,
      status: item.action, // using action field
      invoice: item.metadata?.invoice_url || null,
    })) || [];

  return (
    <div>
      <DataTable
        columns={columns}
        data={formattedData} // ✅ use API data
        selectableRows
        selectableRowsHighlight
        customStyles={tableStyles}
        fixedHeader
        fixedHeaderScrollHeight="70vh"
        progressPending={isHistoryLoading} // show loader
      />
    </div>
  );
};

export default SubscriptionHistory;

const columns = [
  {
    name: 'Date',
    selector: row => row.date,
  },
  {
    name: 'Plan',
    selector: row => row.plan,
  },
  {
    name: 'Amount',
    selector: row => <span>${row.amount}</span>,
  },
  {
    name: 'Status',
    cell: row =>
      row.status === 'created' ? (
        <div className="grid h-8 w-[90px] place-items-center rounded-[6px] bg-[#B2FFB0] text-sm capitalize">
          {row.status}
        </div>
      ) : row.status === 'canceled' ? (
        <div className="grid h-8 w-[90px] place-items-center rounded-[6px] bg-[#FF7A7F] text-sm text-white capitalize">
          {row.status}
        </div>
      ) : (
        <div className="grid h-8 w-[90px] place-items-center rounded-[6px] bg-[#D3D3D3] text-sm capitalize">
          {row.status}
        </div>
      ),
  },
  // {
  //   name: 'Invoice',
  //   selector: (row) =>
  //     row.invoice ? (
  //       <a href={row.invoice} target="_blank" rel="noreferrer" className="cursor-pointer">
  //         <AiOutlineDownload fontSize={22} fontWeight={700} />
  //       </a>
  //     ) : (
  //       <span>-</span>
  //     ),
  // },
];
