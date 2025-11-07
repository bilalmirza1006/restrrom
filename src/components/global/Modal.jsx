import { MdCancel } from 'react-icons/md';

const Modal = ({ title, onClose, children, width }) => {
  return (
    <div
      className="fixed inset-0 z-[999] flex h-full w-full items-center justify-center bg-[#000000c0] py-4"
      onClick={onClose}
    >
      <div
        className={` ${
          title === 'qr' ? 'bg-red' : 'bg-white'
        } scroll-0 h-fit max-h-full overflow-y-scroll rounded-[12px] p-4 shadow-lg md:p-6 ${
          width ? width : 'w-[500px] sm:w-[600px] md:w-[800px]'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {title === 'qr' ? (
          ''
        ) : (
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#111111] sm:text-base md:text-xl">
              {title}
            </h2>
            <div className="cursor-pointer" onClick={onClose}>
              <MdCancel className="text-3xl text-[#FF3B30]" />
            </div>
          </div>
        )}
        <div className="mt-4 md:mt-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
