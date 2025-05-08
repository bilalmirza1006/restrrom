import { MdCancel } from "react-icons/md";

const Modal = ({ title, onClose, children, width }) => {
  return (
    <div
      className={`modal bg-[#00000099] fixed top-0 left-0 inset-0 z-[99999] p-6 flex items-center justify-center`}
      onClick={onClose}
    >
      <div
        className={` ${
          title === "qr" ? "bg-red" : "bg-white"
        } rounded-[12px] shadow-lg p-4 md:p-6 overflow-y-scroll h-fit max-h-full scroll-0  ${
          width ? width : "w-[500px] sm:w-[600px] md:w-[800px]"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {title === "qr" ? (
          ""
        ) : (
          <div className="flex items-center justify-between">
            <h2 className="text-[#111111] font-semibold text-sm sm:text-base md:text-xl">
              {title}
            </h2>
            <div className="cursor-pointer" onClick={onClose}>
              <MdCancel className="text-[#FF3B30] text-3xl" />
            </div>
          </div>
        )}
        <div className="mt-4 md:mt-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
