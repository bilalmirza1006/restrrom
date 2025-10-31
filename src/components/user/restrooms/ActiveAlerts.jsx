'use client';
import Modal from '@/components/global/Modal';
import { useState } from 'react';
import { GoAlertFill } from 'react-icons/go';
import React from 'react';
import { ResponsiveContainer, RadialBarChart, RadialBar, Legend } from 'recharts';

function ActiveAlerts() {
  const alerts = [
    'Heating - 1 sensor has problem',
    'Heating - 1 sensor has problem',
    'Heating - 1 sensor has problem',
  ];

  const chartData = [
    {
      name: 'Flow Count',
      value: 56,
      fill: '#00B4D8',
    },
    {
      name: 'Queuing',
      value: 45,
      fill: '#FF5248',
    },

    {
      name: 'Stall Occupancy',
      value: 44,
      fill: '#A449EB',
    },
  ];

  const [modal, setModal] = useState(false);

  const handleModalOpen = () => {
    setModal(true);
  };

  const handleModalClose = () => {
    setModal(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-5 h-full">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <GoAlertFill className="text-2xl text-[#FF3B30]" />
          <h2 className="text-[19px] font-semibold md:text-lg leading-[30px]">Active Alerts</h2>
        </div>
        <button onClick={() => handleModalOpen()} className="text-primary text-xs cursor-pointer">
          See all
        </button>
      </div>
      <div className="relative">
        <div className="absolute top-[30%] w-fit left-[44%] flex items-center gap-2">
          <h1 className="text-[24px] font-bold">99%</h1>
        </div>
        <ResponsiveContainer className="mt-5" height={310}>
          <RadialBarChart
            cx="50%"
            cy="36%"
            innerRadius={65}
            outerRadius={118}
            barSize={12}
            data={chartData}
          >
            <RadialBar cornerRadius={20} background dataKey="value" />
            <Legend />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-col gap-3">
        <p className="text-sm text-[#11111199]">Alerts</p>
        {alerts.length === 0 ? (
          <h2 className="bg-[#00000010] text-[#00000090] p-3 text-[21px]">No Alert Found!</h2>
        ) : (
          <div className="flex flex-col gap-3 overflow-y-scroll scroll-0">
            {alerts.map((alert, i) => (
              <div
                key={i}
                className="bg-[#FFECEC] text-[#F42F2F] rounded-[6px] p-[15px] flex gap-2 items-center border-l-4 border-[#F42F2F]"
              >
                <p className="text-sm md:text-base">{alert}</p>
              </div>
            ))}
          </div>
        )}

        {modal && (
          <Modal title="All Alerts" onClose={handleModalClose}>
            <div>
              <div className="modal-content overflow-y-auto custom-scroll">
                {alerts.map((alert, i) => (
                  <div
                    key={i}
                    className="bg-[#FFECEC] text-[#F42F2F] rounded-[6px] p-[10px] flex gap-2 items-center mb-2 border-l-4 border-[#F42F2F]"
                  >
                    <p>{alert}</p>
                  </div>
                ))}
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}

export default ActiveAlerts;
