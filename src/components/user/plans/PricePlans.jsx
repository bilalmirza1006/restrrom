import Button from "@/components/global/small/Button";
import PriceCard from "./PriceCard";
import { planCardsData } from "@/data/data";

const PricePlans = ({ onSelectPlan }) => {
  return (
    <div>
      <div className="flex flex-col xl:flex-row justify-between items-center">
        <div className="my-2 md:my-5">
          <h4 className="text-base lg:text-lg font-[600] text-[#414141] leading-[27px]">
            My Subscription Plans
          </h4>
          <p className="text-primary text-sm  lg:text-base leading-[27px]">
            Manage Your Plans
          </p>
        </div>
        {/* <Button text="Trials End in" className="w-full xl:w-fit p-5 " /> */}
      </div>
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {planCardsData.map((card, i) => (
          <PriceCard key={i} card={card} onSelectPlan={onSelectPlan} />
        ))}
      </div>
    </div>
  );
};

export default PricePlans;
