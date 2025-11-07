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
    <div className="h-full rounded-2xl bg-white p-5 shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GoAlertFill className="text-2xl text-[#FF3B30]" />
          <h2 className="text-[19px] leading-[30px] font-semibold md:text-lg">Active Alerts</h2>
        </div>
        <button onClick={() => handleModalOpen()} className="text-primary cursor-pointer text-xs">
          See all
        </button>
      </div>
      <div className="relative">
        <div className="absolute top-[30%] left-[44%] flex w-fit items-center gap-2">
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
          <h2 className="bg-[#00000010] p-3 text-[21px] text-[#00000090]">No Alert Found!</h2>
        ) : (
          <div className="scroll-0 flex flex-col gap-3 overflow-y-scroll">
            {alerts.map((alert, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-[6px] border-l-4 border-[#F42F2F] bg-[#FFECEC] p-[15px] text-[#F42F2F]"
              >
                <p className="text-sm md:text-base">{alert}</p>
              </div>
            ))}
          </div>
        )}

        {modal && (
          <Modal title="All Alerts" onClose={handleModalClose}>
            <div>
              <div className="modal-content custom-scroll overflow-y-auto">
                {alerts.map((alert, i) => (
                  <div
                    key={i}
                    className="mb-2 flex items-center gap-2 rounded-[6px] border-l-4 border-[#F42F2F] bg-[#FFECEC] p-[10px] text-[#F42F2F]"
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
