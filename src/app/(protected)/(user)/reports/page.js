'use client';
import {
  Ch4Icon,
  Co2Icon,
  CoIcon,
  HumidityIcon,
  MapIcon,
  SensorIcon,
  TemperatureIcon,
  TvocIcon,
} from '@/assets/icon';
import { reportsLists } from '@/data/data';
import React from 'react';
import DataTable from 'react-data-table-component';

const columns = [
  {
    name: 'Date',
    selector: (row) => <p className="text-sm text-[#060606cc] font-bold">{row.date}</p>,
  },
  {
    name: 'Tempareture',
    selector: (row) => (
      <div className="flex items-center gap-1">
        <p className="text-sm text-[#060606cc] font-bold">{row.temperature}°F</p>
        <TemperatureIcon temperature={row.temperature} />
      </div>
    ),
  },
  {
    name: 'TVOC',
    selector: (row) => (
      <div className="flex items-center gap-1">
        <p className="text-sm text-[#060606cc] font-bold">{row.tvoc}°F</p>
        <TvocIcon temperature={row.tvoc} />
      </div>
    ),
  },
  {
    name: 'CO2',
    selector: (row) => (
      <div className="flex items-center gap-1">
        <p className="text-sm text-[#060606cc] font-bold">{row.co2}°F</p>
        <Co2Icon temperature={row.co2} />
      </div>
    ),
  },
  {
    name: 'Humidity',
    selector: (row) => (
      <div className="flex items-center gap-1">
        <p className="text-sm text-[#060606cc] font-bold">{row.humidity}%</p>
        <HumidityIcon temperature={row.humidity} />
      </div>
    ),
  },
  {
    name: 'CO',
    selector: (row) => (
      <div className="flex items-center gap-1">
        <p className="text-sm text-[#060606cc] font-bold">{row.co}%</p>
        <CoIcon temperature={row.co} />
      </div>
    ),
  },
  {
    name: 'CH4',
    selector: (row) => (
      <div className="flex items-center gap-1">
        <p className="text-sm text-[#060606cc] font-bold">{row.ch4}%</p>
        <Ch4Icon temperature={row.ch4} />
      </div>
    ),
  },
  {
    name: 'Performance',
    selector: (row) => (
      <div className="flex flex-col items-center">
        <p className="text-[10px] text-[#292d32cc] font-medium capitalize">{row.performance}</p>
        {row.performance === 'excellent' && <p className="text-lg">😊</p>}
        {row.performance === 'good' && <p className="text-lg">😊</p>}
        {row.performance === 'average' && <p className="text-lg">😐</p>}
        {row.performance === 'bad' && <p className="text-lg">😶</p>}
      </div>
    ),
    center: true,
  },
];

const Reports = () => {
  return (
    <div className="flex flex-col gap-4">
      {reportsLists.map((list, i) => (
        <div key={i} className="bg-white rounded-[20px] border-[2px] border-[#00000012] p-4">
          <div className="flex items-center flex-wrap justify-between gap-3">
            <div className="flex items-center flex-wrap gap-3">
              <img
                src={list.image}
                alt="image"
                className="w-[186px] h-[106px] object-cover rounded-xl"
              />
              <div>
                <h5 className="text-sm md:text-base font-bold text-[#2e2e2e]">{list.title}</h5>
                <div className="flex items-center gap-1 py-1">
                  <MapIcon />
                  <p className="text-[10px] font-semibold text-[#060606cc]">{list.location}</p>
                </div>
                <div className="flex items-center gap-1">
                  <SensorIcon />
                  <div className="text-[#292d32] font-bold">
                    <p className="text-sm md:text-base">Total No. of Sensors</p>
                    <p className="text-base md:text-xl">{list.totalSensors}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-between h-full gap-8">
              <div className="flex items-center justify-end gap-2">
                <button className="flex items-center gap-1 rounded-md border border-[#414141] h-[38px] px-6 py-2 text-xs font-bold cursor-default">
                  <div className="w-[10px] h-[10px] rounded-full bg-primary-lightBlue"></div>
                  Active
                </button>
                {/* <Button text="Export" height="h-[35px]" /> */}
              </div>
              <div className="flex items-center md:justify-end gap-3">
                <Ratings title="Good" color="rgba(122, 255, 60, 1)" />
                <Ratings title="Average" color="rgba(255, 199, 115, 1)" />
                <Ratings title="Bad" color="rgba(238, 14, 0, 1)" />
              </div>
            </div>
          </div>
          <div className="mt-4">
            <DataTable
              columns={columns}
              data={list.listData}
              customStyles={tableStyles}
              pagination
              selectableRows
              selectableRowsHighlight
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default Reports;

const Ratings = ({ color, title }) => {
  return (
    <div className="flex items-center gap-1">
      <div className="w-[10px] h-[10px] rounded-sm" style={{ background: color }}></div>
      <p className="text-xs font-bold text-[#414141cc]">{title}</p>
    </div>
  );
};

const tableStyles = {
  headCells: {
    style: {
      fontSize: '16px',
      fontWeight: 700,
      color: '#ffffff',
      background: 'rgba(3, 165, 224, 1)',
    },
  },
  // rows: {
  //   style: {
  //     background: "rgba(123, 192, 247, 0.15)",
  //     borderRadius: "6px",
  //     padding: "14px 0",
  //     margin: "10px 0",
  //     borderBottomWidth: "0 !important",
  //   },
  // },
  // cells: {
  //   style: {
  //     color: "rgba(17, 17, 17, 1)",
  //     fontSize: "14px",
  //   },
  // },
};

// export default Reports;
