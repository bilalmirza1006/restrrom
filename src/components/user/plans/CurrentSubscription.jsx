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
      <div className="grid w-full place-items-center py-10">
        <p className="text-sm text-gray-600 md:text-base">Loading current subscription...</p>
      </div>
    );
  }

  if (isError) {
    const message =
      (error && (error.data?.message || error.error)) || 'Failed to load subscription.';
    return (
      <div className="rounded border border-red-200 bg-red-50 p-4 text-red-700">
        <p className="text-sm md:text-base">{message}</p>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="rounded border border-yellow-200 bg-yellow-50 p-4 text-yellow-700">
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
    <div className="shadow-dashboard rounded-[10px] bg-white p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-base font-semibold text-[#414141] md:text-lg">
            Current Subscription
          </h4>
          <p className="text-primary text-xs md:text-sm">Your active plan details</p>
        </div>
        <span
          className={`rounded px-3 py-1 text-xs capitalize ${
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

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
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
          className={`rounded-md px-4 py-2 font-semibold text-white ${
            isCancelling ? 'cursor-not-allowed bg-gray-400' : 'bg-[#FF7A7F] hover:opacity-95'
          }`}
        >
          {isCancelling ? 'Cancelling...' : 'Cancel Subscription'}
        </button>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="flex items-center justify-between rounded-md bg-[#F8F8F8] px-3 py-3">
    <span className="text-xs text-[#414141B2] md:text-sm">{label}</span>
    <span className="text-sm font-medium md:text-base">{value}</span>
  </div>
);

export default CurrentSubscription;
