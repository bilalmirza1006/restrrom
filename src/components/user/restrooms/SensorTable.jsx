import React from 'react';
import DataTable from 'react-data-table-component';
import { tableStyles } from '@/data/data';
import Link from 'next/link';
import { HiOutlineEye } from 'react-icons/hi2';

const sensors = [
  {
    name: 's1',
    id: '6891ada378bf2c8a69875dd7',
    parameters: ['temperature', 'humidity', 'co2'],
    uniqueId: 'SENSOR-1',
    isConnected: true,
    status: 'Activated',
  },
  {
    name: 's2',
    id: '6891adb478bf2c8a69875ddd',
    parameters: ['temperature', 'humidity', 'co', 'ch'],
    uniqueId: 'SENSOR-2',
    isConnected: true,
    status: 'Deactivated',
  },
  {
    name: 's3',
    id: '6891add678bf2c8a69875de3',
    parameters: ['temperature', 'tvoc'],
    uniqueId: 'SENSOR-3',
    isConnected: true,
    status: 'Activated',
  },
  {
    name: 's4',
    id: '6891adeb78bf2c8a69875de9',
    parameters: ['co', 'tvoc'],
    uniqueId: 'SENSOR-4',
    isConnected: true,
    status: 'Deactivated',
  },
  {
    name: 's5',
    id: '6891ae2d78bf2c8a69875def',
    parameters: ['co2', 'tvoc', 'ch'],
    uniqueId: 'SENSOR-5',
    isConnected: false,
    status: 'Activated',
  },
];

const tableColumns = [
  {
    name: 'Sensor Name',
    selector: (row) => row?.name,
  },
  {
    name: 'Parameters',
    selector: (row) => (
      <div>
        {row.parameters.map((item) => (
          <>{item},</>
        ))}
      </div>
    ),
  },
  {
    name: 'Unique Id',
    selector: (row) => row?.uniqueId,
  },
  {
    name: 'Is Connected',
    selector: (row) =>
      row?.isConnected === true ? <span>Connected</span> : <span>Disconnected</span>,
  },
  {
    name: 'Status',
    cell: (row) => (
      <div className={`${row.status === 'Activated' ? 'text-[#50D450]' : 'text-[#FF0000]'}`}>
        {row.status}
      </div>
    ),
  },
];

function SensorTable() {
  return (
    <div>
      <DataTable
        data={sensors}
        columns={tableColumns}
        customStyles={tableStyles}
        pagination
        fixedHeader
        fixedHeaderScrollHeight="60vh"
        selectableRows
      />
    </div>
  );
}

export default SensorTable;
