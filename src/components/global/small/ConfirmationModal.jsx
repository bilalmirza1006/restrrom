import Button from './Button';

const ConfirmationModal = ({
  title = 'Do you want to store your data in a local database?',
  confirmText = 'Change',
  cancelText = 'Cancel',
  onCancel,
  onConfirm,
}) => {
  return (
    <div>
      <h6 className="text-sm font-medium text-gray-400 md:text-base">{title}</h6>

      <div className="mt-12 flex justify-end">
        <div className="flex items-center gap-4">
          <Button
            bg="text-[#A449EB] border-[#A449EB] border-[1px] bg-transparent hover:bg-[#A449EB] hover:text-white"
            text={cancelText}
            width="w-[120px]"
            onClick={onCancel}
          />
          <Button
            cn={'whitespace-nowrap'}
            text={confirmText}
            width="w-[120px]"
            onClick={onConfirm}
          />
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
