import { subscriptionHistoryData, tableStyles } from '@/data/data';
import {
  useGetAllHistoryQuery,
  useGetSubscriptionHistoryQuery,
} from '@/features/subscription/subscriptionApi';
import { useMemo } from 'react';
import DataTable from 'react-data-table-component';
import { AiOutlineDownload } from 'react-icons/ai';
import { useSelector } from 'react-redux';

const SubscriptionHistory = () => {
  const { user } = useSelector(state => state.auth);
  const userId = user?.user?._id;

  const { data: historyData, isLoading: isHistoryLoading } = useGetSubscriptionHistoryQuery(
    userId,
    {
      skip: user?.role !== 'admin' || !userId,
    }
  );

  const { data: allHistoryData, isLoading: isAllHistoryLoading } = useGetAllHistoryQuery(
    undefined,
    {
      skip: user?.role !== 'super_admin',
    }
  );
  console.log('allHistoryData', allHistoryData);
  const isLoading = isHistoryLoading || isAllHistoryLoading;
  const history = useMemo(() => {
    if (user?.role === 'admin') {
      return historyData || [];
    }
    if (user?.role === 'admin') {
      return allData?.data || [];
    }
    if (user?.role === 'super_admin') {
      return allHistoryData || [];
    }
    return [];
  }, [user, historyData, allHistoryData]);
  // console.log('buildingsbuildingsbuildings', buildings);

  // Transform API response
  const formattedData =
    history?.data?.map(item => ({
      date: new Date(item.createdAt).toLocaleString(),
      email: item.user.email || 'N/A',
      plan: item.plan || 'N/A',
      amount: item.plan === 'yearly' ? 120 : item.plan === 'monthly' ? 10 : 0,
      status: item.action, // using action field
      invoice: item.metadata?.invoice_url || null,
    })) || [];
  console.log('formattedDataformattedData', formattedData);

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
        progressPending={isLoading} // show loader
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
    name: 'email',
    selector: row => row?.email,
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
        <div className="grid h-8 w-22.5 place-items-center rounded-md bg-[#B2FFB0] text-sm capitalize">
          {row.status}
        </div>
      ) : row.status === 'canceled' ? (
        <div className="grid h-8 w-22.5 place-items-center rounded-md bg-[#FF7A7F] text-sm text-white capitalize">
          {row.status}
        </div>
      ) : (
        <div className="grid h-8 w-22.5 place-items-center rounded-md bg-[#D3D3D3] text-sm capitalize">
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
