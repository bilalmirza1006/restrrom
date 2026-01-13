// hooks/useAlertManagement.js
import { useState } from 'react';
import toast from 'react-hot-toast';

export const useAlertManagement = ({ createAlert, updateAlert, deleteAlert, refetch }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (formData, modalType, selectedAlert, onSuccess) => {
    setIsLoading(true);

    try {
      if (modalType === 'add') {
        await createAlert(formData).unwrap();
        toast.success('Alert created');
      } else {
        await updateAlert({ id: selectedAlert._id, ...formData }).unwrap();
        toast.success('Alert updated');
      }

      refetch();
      onSuccess?.();
    } catch (err) {
      toast.error(err?.data?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async id => {
    if (!confirm('Delete this alert?')) return;

    try {
      await deleteAlert(id).unwrap();
      toast.success('Alert deleted');
      refetch();
    } catch {
      toast.error('Failed to delete alert');
    }
  };

  return {
    handleSave,
    handleDelete,
    isLoading,
  };
};
