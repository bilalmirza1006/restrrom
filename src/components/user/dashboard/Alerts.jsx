'use client';
import Modal from '@/components/global/Modal';
import { useState } from 'react';
import { GoAlertFill } from 'react-icons/go';

const alerts = [
  'Heating - 1 sensor has problem',
  'Heating - 1 sensor has problem',
  'Heating - 1 sensor has problem',
  'Heating - 1 sensor has problem',
  'Heating - 1 sensor has problem',
  'Heating - 2 sensors have problem',
  'Heating - 2 sensors have problem',
  'Heating - 2 sensors have problem',
  'Heating - 2 sensors have problem',
  'Heating - 2 sensors have problem',
  'Cooling - 1 sensor has problem',
];

const Alerts = () => {
  const [modal, setModal] = useState(false);

  const handleModalOpen = () => {
    setModal(true);
  };

  const handleModalClose = () => {
    setModal(false);
  };

  return (
    <div className="h-full rounded-2xl bg-white p-5 shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GoAlertFill className="text-2xl text-[#FF3B30]" />
          <h2 className="text-[19px] leading-7.5 font-semibold md:text-lg">Alerts</h2>
        </div>
        <button onClick={() => handleModalOpen()} className="text-primary cursor-pointer text-xs">
          See all
        </button>
      </div>

      {alerts.length === 0 ? (
        <h2 className="bg-[#00000010] p-3 text-[21px] text-[#00000090]">No Alert Found!</h2>
      ) : (
        <div className="scroll-0 flex h-86 flex-col gap-3 overflow-y-scroll">
          {alerts.map((alert, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-md border-l-4 border-[#F42F2F] bg-[#FFECEC] p-3.75 text-[#F42F2F]"
            >
              <p className="text-sm md:text-base">{alert}</p>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal title="All Alerts" onClose={handleModalClose}>
          <div>
            <div className="modal-content custom-scroll max-h-64 overflow-y-auto">
              {alerts.map((alert, i) => (
                <div
                  key={i}
                  className="mb-2 flex items-center gap-2 rounded-md border-l-4 border-[#F42F2F] bg-[#FFECEC] p-2.5 text-[#F42F2F]"
                >
                  <p>{alert}</p>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Alerts;
