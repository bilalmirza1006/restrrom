import Button from '@/components/global/small/Button';
import PriceCard from './PriceCard';
import { planCardsData } from '@/data/data';

const PricePlans = ({ onSelectPlan }) => {
  return (
    <div>
      <div className="flex flex-col items-center justify-between xl:flex-row">
        <div className="my-2 md:my-5">
          <h4 className="text-base leading-[27px] font-[600] text-[#414141] lg:text-lg">
            My Subscription Plans
          </h4>
          <p className="text-primary text-sm leading-[27px] lg:text-base">Manage Your Plans</p>
        </div>
        {/* <Button text="Trials End in" className="w-full xl:w-fit p-5 " /> */}
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {planCardsData?.map((card, i) => (
          <PriceCard key={i} card={card} onSelectPlan={onSelectPlan} />
        ))}
      </div>
    </div>
  );
};

export default PricePlans;
