'use client';

import { useMemo } from 'react';
import {
  useGetCurrentSubscriptionQuery,
  useCancelSubscriptionMutation,
  useGetSubscriptionHistoryQuery,
} from '@/features/subscription/subscriptionApi';

const planPriceMap = {
  monthly: { label: 'Monthly', price: '$19.99/mo' },
  yearly: { label: 'Yearly', price: '$199.99/yr' },
  lifetime: { label: 'Lifetime', price: '$499.00' },
};

const CurrentSubscription = () => {
  const {
    data: currentData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetCurrentSubscriptionQuery();

  const subscription = currentData?.data || null;
  const userId = subscription?.user?._id || subscription?.user || null;

  const { data: historyData, isLoading: isHistoryLoading } = useGetSubscriptionHistoryQuery(
    userId,
    {
      skip: !userId,
    }
  );

  const [cancelSubscription, { isLoading: isCancelling }] = useCancelSubscriptionMutation();

  const details = useMemo(() => {
    if (!subscription) return null;

    // Format amount with currency (Stripe data from DB)
    const formattedPrice =
      subscription.priceAmount && subscription.priceCurrency
        ? new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: subscription.priceCurrency.toUpperCase(),
          }).format(subscription.priceAmount)
        : '-';

    return {
      plan: subscription.plan || '-', // direct from DB
      price: formattedPrice,
      status: subscription.subscriptionStatus,
      start: subscription.subscriptionStartDate
        ? new Date(subscription.subscriptionStartDate).toLocaleDateString()
        : '-',
      end: subscription.subscriptionEndDate
        ? new Date(subscription.subscriptionEndDate).toLocaleDateString()
        : '-',
      stripeSubscriptionId: subscription.stripeSubscriptionId,
    };
  }, [subscription]);

  if (isLoading) {
    return (
      <div className="w-full py-10 grid place-items-center">
        <p className="text-sm md:text-base text-gray-600">Loading current subscription...</p>
      </div>
    );
  }

  if (isError) {
    const message =
      (error && (error.data?.message || error.error)) || 'Failed to load subscription.';
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
        <p className="text-sm md:text-base">{message}</p>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded">
        <p className="text-sm md:text-base">You don’t have an active subscription yet.</p>
      </div>
    );
  }

  const onCancel = async () => {
    if (!details?.stripeSubscriptionId) return;
    try {
      await cancelSubscription({
        subscriptionId: details.stripeSubscriptionId,
        cancelAtPeriodEnd: true,
      }).unwrap();
      await refetch();
    } catch (e) {}
  };

  return (
    <div className="bg-white rounded-[10px] shadow-dashboard p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-base md:text-lg font-semibold text-[#414141]">
            Current Subscription
          </h4>
          <p className="text-xs md:text-sm text-primary">Your active plan details</p>
        </div>
        <span
          className={`px-3 py-1 rounded text-xs capitalize ${
            details?.status === 'active'
              ? 'bg-[#B2FFB0] text-gray-800'
              : details?.status === 'expired' || details?.status === 'canceled'
              ? 'bg-[#D3D3D3] text-gray-700'
              : 'bg-[#FF7A7F] text-white'
          }`}
        >
          {details?.status}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoRow label="Plan" value={details?.plan} />
        <InfoRow label="Price" value={details?.price} />
        <InfoRow label="Start Date" value={details?.start} />
        <InfoRow label="End Date" value={details?.end} />
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="text-xs text-gray-500">
          {isHistoryLoading ? (
            <span>Loading history...</span>
          ) : historyData?.data?.length ? (
            <span>
              Recent action: {historyData.data[0]?.action || '-'} on{' '}
              {historyData.data[0]?.createdAt
                ? new Date(historyData.data[0]?.createdAt).toLocaleString()
                : '-'}
            </span>
          ) : (
            <span>No history yet</span>
          )}
        </div>

        <button
          onClick={onCancel}
          disabled={isCancelling}
          className={`px-4 py-2 rounded-md text-white font-semibold ${
            isCancelling ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#FF7A7F] hover:opacity-95'
          }`}
        >
          {isCancelling ? 'Cancelling...' : 'Cancel Subscription'}
        </button>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="flex items-center justify-between bg-[#F8F8F8] rounded-md px-3 py-3">
    <span className="text-xs md:text-sm text-[#414141B2]">{label}</span>
    <span className="text-sm md:text-base font-medium">{value}</span>
  </div>
);

export default CurrentSubscription;
