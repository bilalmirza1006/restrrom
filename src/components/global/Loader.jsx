import { LogoIcon } from '@/assets/icon';

const Loader = () => {
  return (
    <div className="fixed inset-0 z-[998] grid h-screen w-screen place-items-center bg-white font-bold text-black">
      <div className="animate-ping">
        <LogoIcon />
      </div>
    </div>
  );
};

export default Loader;
