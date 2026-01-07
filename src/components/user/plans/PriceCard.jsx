import { GoDotFill } from 'react-icons/go';

const PriceCard = ({ card, onSelectPlan }) => {
  return (
    <div
      className="shadow-dashboard relative rounded-[10px] px-4 py-6 md:px-6 md:py-8"
      style={{
        borderTop: `6px solid ${card.bg}`,
        // borderTop: isHovered ? `6px solid ${card.bg}` : "0px solid transparent",
      }}
    >
      <h6 className="text-base font-semibold text-black md:text-xl">{card.title}</h6>
      <p className="text-[10px] text-[#414141] lg:text-xs">{card.subtitle}</p>
      <p className="text-primary mt-1 text-lg font-semibold lg:text-3xl">
        ${card.price}
        <span className="text-sm font-normal md:text-lg">/month</span>
      </p>
      <div className="mt-6">
        <p className="text-[11px] text-[#414141B2] md:text-xs">Features</p>
        <div className="mt-4">
          {card.featuresList.map((list, i) => (
            <div key={i} className="mb-3 flex items-center gap-2">
              <GoDotFill fontSize={8} />
              <p className="text-xs text-black md:text-sm">{list}</p>
            </div>
          ))}
          <div className="mt-6 mb-8">
            <p className="text-[11px] text-[#414141B2] md:text-xs">Description</p>
            <p className="mt-3 text-xs text-black md:text-sm">{card.description}</p>
          </div>
          <div>
            <button
              className="w-37.5 rounded-md px-4 py-2 text-base font-semibold text-white md:w-50"
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
