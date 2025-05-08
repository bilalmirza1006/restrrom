import { LogoIcon } from "@/assets/icon";

const Loader = () => {
  return (
    <div className="fixed inset-0 z-[998] w-screen h-screen bg-white text-black font-bold grid place-items-center">
      <div className="animate-ping">
        <LogoIcon />
      </div>
    </div>
  );
};

export default Loader;
