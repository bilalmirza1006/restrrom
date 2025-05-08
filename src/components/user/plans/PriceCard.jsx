import { GoDotFill } from "react-icons/go";

const PriceCard = ({ card, onSelectPlan }) => {
  return (
    <div
      className="relative px-4 md:px-6 py-6 md:py-8 rounded-[10px] shadow-dashboard"
      style={{
        borderTop: `6px solid ${card.bg}`,
        // borderTop: isHovered ? `6px solid ${card.bg}` : "0px solid transparent",
      }}
    >
      <h6 className="text-base md:text-xl text-black font-[600] ">
        {card.title}
      </h6>
      <p className="text-[10px] lg:text-xs text-[#414141]">{card.subtitle}</p>
      <p className="text-lg lg:text-3xl text-primary font-[600] mt-1">
        ${card.price}
        <span className="font-normal text-sm md:text-lg">/month</span>
      </p>
      <div className="mt-6">
        <p className="text-[#414141B2] text-[11px] md:text-xs">Features</p>
        <div className="mt-4">
          {card.featuresList.map((list, i) => (
            <div key={i} className="flex items-center gap-2 mb-3">
              <GoDotFill fontSize={8} />
              <p className="text-black text-xs md:text-sm">{list}</p>
            </div>
          ))}
          <div className="mt-6 mb-8">
            <p className="text-[#414141B2] text-[11px] md:text-xs">
              Description
            </p>
            <p className="text-black text-xs md:text-sm mt-3">
              {card.description}
            </p>
          </div>
          <div>
            <button
              className="w-[150px] md:w-[200px] py-2 px-4 rounded-md text-base text-white font-semibold"
              onClick={() => onSelectPlan(card)}
              style={{ background: `${card.btnBg}` }}
            >
              Buy Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceCard;
