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
      <div className="mt-4 md:mt-5 bg-[#F3F0FF] p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-4 rounded-lg">
        <div>
          <div className="flex items-center gap-2 text-primary">
            <FaMapMarkerAlt fontSize={22} />
            <p className="text-sm md:text-base font-[600]">Billing Address</p>
          </div>
          <p className="text-sm md:text-md font-semibold my-2 md:my-4">
            5678 Maple Avenue, Anytown, CA, 90210, USA
          </p>
          <PriceList title="Plan Selected:" value={plan.title} />
          <PriceList title="Monthly Fee:" value={`$${totalAmount.toFixed(2)}`} />
          <PriceList title="Tax:" value={`$${tax}`} />
          <div className="w-full h-[1px] bg-[#00000066] mb-3"></div>
          <PriceList title="Total Monthly Charge:" value={`$${totalPrice}`} />
        </div>

        <div></div>

        <div className="px-4 py-4 md:py-6 rounded-[10px] shadow-dashboard bg-white">
          <h6 className="text-base md:text-xl text-black font-[600]">{plan.title}</h6>
          <p className="text-[10px] lg:text-xs text-[#414141]">{plan.subtitle}</p>
          <p className="text-lg lg:text-3xl text-primary font-[600] mt-1">
            ${plan.price}
            <span className="font-normal text-sm md:text-lg">/month</span>
          </p>
          <div className="mt-6">
            <p className="text-[#414141B2] text-[11px] md:text-xs">Features</p>
            <div className="mt-4">
              {plan.featuresList.map((feature, i) => (
                <div key={i} className="flex items-center gap-2 mb-3">
                  <GoDotFill fontSize={8} />
                  <p className="text-black text-xs md:text-sm">{feature}</p>
                </div>
              ))}
              <div className="mt-6 mb-8">
                <p className="text-[#414141B2] text-[11px] md:text-xs">Description</p>
                <p className="text-black text-xs md:text-sm mt-3">{plan.description}</p>
              </div>
              <div>
                <button
                  className="w-[150px] md:w-[200px] py-2 px-4 rounded-md text-base text-white font-semibold"
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
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
          {errorMsg}
        </div>
      ) : null}
      <div className="flex justify-end mt-5">
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
  <div className="flex items-center justify-between gap-4 mb-3">
    <p className="text-sm md:text-base">{title}</p>
    <p className="text-sm md:text-base font-medium md:font-semibold">{value}</p>
  </div>
);
