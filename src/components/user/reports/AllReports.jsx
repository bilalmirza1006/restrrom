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
    selector: row => <p className="text-sm font-bold text-[#060606cc]">{row.date}</p>,
  },
  {
    name: 'Tempareture',
    selector: row => (
      <div className="flex items-center gap-1">
        <p className="text-sm font-bold text-[#060606cc]">{row.temperature}°F</p>
        <TemperatureIcon temperature={row.temperature} />
      </div>
    ),
  },
  {
    name: 'TVOC',
    selector: row => (
      <div className="flex items-center gap-1">
        <p className="text-sm font-bold text-[#060606cc]">{row.tvoc}°F</p>
        <TvocIcon temperature={row.tvoc} />
      </div>
    ),
  },
  {
    name: 'CO2',
    selector: row => (
      <div className="flex items-center gap-1">
        <p className="text-sm font-bold text-[#060606cc]">{row.co2}°F</p>
        <Co2Icon temperature={row.co2} />
      </div>
    ),
  },
  {
    name: 'Humidity',
    selector: row => (
      <div className="flex items-center gap-1">
        <p className="text-sm font-bold text-[#060606cc]">{row.humidity}%</p>
        <HumidityIcon temperature={row.humidity} />
      </div>
    ),
  },
  {
    name: 'CO',
    selector: row => (
      <div className="flex items-center gap-1">
        <p className="text-sm font-bold text-[#060606cc]">{row.co}%</p>
        <CoIcon temperature={row.co} />
      </div>
    ),
  },
  {
    name: 'CH4',
    selector: row => (
      <div className="flex items-center gap-1">
        <p className="text-sm font-bold text-[#060606cc]">{row.ch4}%</p>
        <Ch4Icon temperature={row.ch4} />
      </div>
    ),
  },
  {
    name: 'Performance',
    selector: row => (
      <div className="flex flex-col items-center">
        <p className="text-[10px] font-medium text-[#292d32cc] capitalize">{row.performance}</p>
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
        <div key={i} className="rounded-[20px] border-[2px] border-[#00000012] bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <img
                src={list.image}
                alt="image"
                className="h-[106px] w-[186px] rounded-xl object-cover"
              />
              <div>
                <h5 className="text-sm font-bold text-[#2e2e2e] md:text-base">{list.title}</h5>
                <div className="flex items-center gap-1 py-1">
                  <MapIcon />
                  <p className="text-[10px] font-semibold text-[#060606cc]">{list.location}</p>
                </div>
                <div className="flex items-center gap-1">
                  <SensorIcon />
                  <div className="font-bold text-[#292d32]">
                    <p className="text-sm md:text-base">Total No. of Sensors</p>
                    <p className="text-base md:text-xl">{list.totalSensors}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex h-full flex-col justify-between gap-8">
              <div className="flex items-center justify-end gap-2">
                <button className="flex h-[38px] cursor-default items-center gap-1 rounded-md border border-[#414141] px-6 py-2 text-xs font-bold">
                  <div className="bg-primary-lightBlue h-[10px] w-[10px] rounded-full"></div>
                  Active
                </button>
                {/* <Button text="Export" height="h-[35px]" /> */}
              </div>
              <div className="flex items-center gap-3 md:justify-end">
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
      <div className="h-[10px] w-[10px] rounded-sm" style={{ background: color }}></div>
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
