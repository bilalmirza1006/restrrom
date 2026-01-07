/* eslint-disable react/prop-types */
import Button from '@/components/global/small/Button';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { GoDotFill } from 'react-icons/go';
import { useState, useCallback } from 'react';
import { useCreateCheckoutSessionMutation } from '@/features/subscription/subscriptionApi';

const Review = ({ plan }) => {
  const [createSession, { isLoading: isCreating }] = useCreateCheckoutSessionMutation();
  const [errorMsg, setErrorMsg] = useState('');
  console.log('plan', plan);
  const totalAmount = parseFloat(plan?.price.replace('$', ''));
  const taxAmount = totalAmount * 0.3;
  const tax = (Math.floor(taxAmount * 100) / 100).toFixed(2);
  const totalPrice = (totalAmount + parseFloat(tax)).toFixed(2);

  const resolvePlanKey = useCallback(() => {
    if (!plan?.type) return null;
    return plan.type.toLowerCase(); // 'monthly', 'yearly', or 'lifetime'
  }, [plan]);

  const onConfirmSubscribe = useCallback(async () => {
    setErrorMsg('');
    try {
      const key = resolvePlanKey();
      if (!key) {
        setErrorMsg('Unable to detect plan type. Please pick a valid plan.');
        return;
      }
      const res = await createSession({ plan: key }).unwrap();
      if (res?.redirect_url) {
        window.location.href = res.redirect_url;
        return;
      }
      if (res?.sessionId) {
        try {
          const { loadStripe } = await import('@stripe/stripe-js');
          const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
          if (!publishableKey) {
            setErrorMsg('Missing Stripe publishable key. Please configure env.');
            return;
          }
          const stripe = await loadStripe(publishableKey);
          if (!stripe) {
            setErrorMsg('Failed to initialize Stripe. Please try again.');
            return;
          }
          const { error } = await stripe.redirectToCheckout({ sessionId: res.sessionId });
          if (error) setErrorMsg(error.message || 'Checkout redirect failed.');
          return;
        } catch (e) {
          setErrorMsg('Stripe.js not available. Please install @stripe/stripe-js.');
          return;
        }
      }
      setErrorMsg('Unexpected response from server. Please try again.');
    } catch (e) {
      const m = e?.data?.message || e?.message || 'Failed to create checkout session.';
      setErrorMsg(m);
    }
  }, [createSession, resolvePlanKey]);

  return (
    <div>
      <div className="mt-4 grid grid-cols-1 gap-4 rounded-lg bg-[#F3F0FF] p-4 md:mt-5 md:p-6 lg:grid-cols-3">
        <div>
          <div className="text-primary flex items-center gap-2">
            <FaMapMarkerAlt fontSize={22} />
            <p className="text-sm font-semibold md:text-base">Billing Address</p>
          </div>
          <p className="md:text-md my-2 text-sm font-semibold md:my-4">
            5678 Maple Avenue, Anytown, CA, 90210, USA
          </p>
          <PriceList title="Plan Selected:" value={plan.title} />
          <PriceList title="Monthly Fee:" value={`$${totalAmount.toFixed(2)}`} />
          <PriceList title="Tax:" value={`$${tax}`} />
          <div className="mb-3 h-px w-full bg-[#00000066]"></div>
          <PriceList title="Total Monthly Charge:" value={`$${totalPrice}`} />
        </div>

        <div></div>

        <div className="shadow-dashboard rounded-[10px] bg-white px-4 py-4 md:py-6">
          <h6 className="text-base font-semibold text-black md:text-xl">{plan.title}</h6>
          <p className="text-[10px] text-[#414141] lg:text-xs">{plan.subtitle}</p>
          <p className="text-primary mt-1 text-lg font-semibold lg:text-3xl">
            ${plan.price}
            <span className="text-sm font-normal md:text-lg">/month</span>
          </p>
          <div className="mt-6">
            <p className="text-[11px] text-[#414141B2] md:text-xs">Features</p>
            <div className="mt-4">
              {plan.featuresList.map((feature, i) => (
                <div key={i} className="mb-3 flex items-center gap-2">
                  <GoDotFill fontSize={8} />
                  <p className="text-xs text-black md:text-sm">{feature}</p>
                </div>
              ))}
              <div className="mt-6 mb-8">
                <p className="text-[11px] text-[#414141B2] md:text-xs">Description</p>
                <p className="mt-3 text-xs text-black md:text-sm">{plan.description}</p>
              </div>
              <div>
                <button
                  className="w-37.5 rounded-md px-4 py-2 text-base font-semibold text-white md:w-50"
                  style={{ background: `${plan.btnBg}` }}
                >
                  Buy Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {errorMsg ? (
        <div className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMsg}
        </div>
      ) : null}
      <div className="mt-5 flex justify-end">
        <Button
          text={isCreating ? 'Processing...' : 'Confirm & Subscribe'}
          width="w-[160px] md:w-[268px]"
          onClick={onConfirmSubscribe}
          disabled={isCreating}
        />
      </div>
    </div>
  );
};

export default Review;

const PriceList = ({ title, value }) => (
  <div className="mb-3 flex items-center justify-between gap-4">
    <p className="text-sm md:text-base">{title}</p>
    <p className="text-sm font-medium md:text-base md:font-semibold">{value}</p>
  </div>
);
