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
import React, { useState } from 'react';
import DataTable from 'react-data-table-component';
import { useGetBuildingSensorsReportQuery } from '@/features/reports/reportsApi';
import { useGetAllBuildingsQuery } from '@/features/building/buildingApi';
import { useGetAllRestroomsQuery } from '@/features/restroom/restroomApi';
import { useGetAllSensorsQuery } from '@/features/sensor/sensorApi';
import dayjs from 'dayjs';
import Dropdown from '@/components/global/small/Dropdown';
import Input from '@/components/global/small/Input';
import LazyDataTable from './LazyDataTable';
import { useSelector } from 'react-redux';

// Helper to format sensor type names
const formatSensorType = type => {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// --- Column Definitions for Each Sensor Type ---

const commonColumns = [
  {
    name: 'Date',
    selector: row => (
      <p className="text-sm font-bold text-[#060606cc]">
        {dayjs(row.timestamp).format('DD-MMM-YYYY hh:mm A')}
      </p>
    ),

    sortable: true,
    minWidth: '180px',
  },
  {
    name: 'Location',
    selector: row => (
      <div className="flex flex-col">
        {row.restroomId && (
          <span className="text-xs text-gray-500">Restroom: {row.restroomId}</span>
        )}
        {row.stallId && <span className="text-xs text-gray-500">Stall: {row.stallId}</span>}
      </div>
    ),
    minWidth: '150px',
  },
];

const sensorTypeColumns = {
  door_queue: [
    ...commonColumns,
    { name: 'Event', selector: row => <span className="capitalize">{row.event || '-'}</span> },
    { name: 'Count', selector: row => row.count ?? '-' },
    {
      name: 'Queue State',
      selector: row => <span className="capitalize">{row.queueState || '-'}</span>,
    },
    { name: 'Window Count', selector: row => row.windowCount ?? '-' },
  ],
  stall_status: [
    ...commonColumns,
    { name: 'State', selector: row => <span className="capitalize">{row.state || '-'}</span> },
    { name: 'Usage Count', selector: row => row.usageCount ?? '-' },
  ],
  occupancy: [
    ...commonColumns,
    { name: 'Status', selector: row => (row.occupied ? 'Occupied' : 'Vacant') },
    { name: 'Duration (s)', selector: row => row.occupancyDuration ?? '-' },
  ],
  air_quality: [
    ...commonColumns,
    {
      name: 'TVOC',
      selector: row => (
        <div className="flex items-center gap-1">
          <span>{row.tvoc ?? '-'}</span>
          {row.tvoc && <TvocIcon />}
        </div>
      ),
    },
    {
      name: 'CO2',
      selector: row => (
        <div className="flex items-center gap-1">
          <span>{row.eCO2 ?? '-'}</span>
          {row.eCO2 && <Co2Icon />}
        </div>
      ),
    },
    { name: 'PM2.5', selector: row => row.pm2_5 ?? '-' },
    { name: 'AQI', selector: row => row.aqi ?? '-' },
    { name: 'Smell', selector: row => <span className="capitalize">{row.smellLevel || '-'}</span> },
  ],
  toilet_paper: [
    ...commonColumns,
    { name: 'Level', selector: row => row.level ?? '-' },
    { name: 'Status', selector: row => <span className="capitalize">{row.status || '-'}</span> },
  ],
  soap_dispenser: [
    ...commonColumns,
    {
      name: 'Event',
      selector: row => <span className="capitalize">{row.dispenseEvent || '-'}</span>,
    },
    { name: 'Level', selector: row => row.level ?? '-' },
    { name: 'Status', selector: row => <span className="capitalize">{row.status || '-'}</span> },
  ],
  water_leakage: [
    ...commonColumns,
    { name: 'Status', selector: row => (row.waterDetected ? 'Leak Detected' : 'Normal') },
    { name: 'Water Level (mm)', selector: row => row.waterLevel_mm ?? '-' },
  ],
};

const Reports = () => {
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [selectedRestroom, setSelectedRestroom] = useState('');
  const [selectedSensor, setSelectedSensor] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { user, isAuthenticated } = useSelector(state => state.auth);
  console.log('useruseruseruser', user.user.interval);
  // const [interval, setInterval] = useState(user.user.interval);
  const interval = user?.user?.interval;
  // 1. Fetch Buildings
  const { data: buildingsData } = useGetAllBuildingsQuery();
  const buildingsList = buildingsData?.data || [];

  // 2. Fetch Restrooms (dependent on selectedBuilding)
  const { data: restroomsData } = useGetAllRestroomsQuery(selectedBuilding, {
    skip: !selectedBuilding,
  });
  const restroomsList = restroomsData?.data?.restRooms || [];

  // 3. Fetch Sensors (Pre-fetch all to filter client-side since API returns all)
  const { data: sensorsData } = useGetAllSensorsQuery();
  const allSensors = sensorsData?.data || [];

  // Filter sensors by selected restroom
  const filteredSensors = selectedRestroom
    ? allSensors.filter(s => s.restroomId === selectedRestroom)
    : [];

  const hasOtherFilters = Boolean(selectedBuilding || selectedRestroom || selectedSensor);

  const hasValidDateRange = Boolean(startDate && endDate);

  const shouldFetchReports = hasOtherFilters || hasValidDateRange;

  const isInvalidDateSelection = (startDate && !endDate) || (!startDate && endDate);

  const {
    data: reportData,
    isLoading,
    isFetching,
  } = useGetBuildingSensorsReportQuery(
    {
      buildingId: selectedBuilding,
      restroomId: selectedRestroom,
      sensorId: selectedSensor,
      startDate,
      endDate,
      interval: interval,
    },
    {
      skip: isInvalidDateSelection,
    }
  );

  console.log('Report API Data:', reportData);
  console.log('Selected selectedSensor:', selectedSensor);
  console.log('Selected filteredSensors:', filteredSensors);
  const reportsLists =
    reportData?.data?.map(building => {
      const sensorsObj = building.sensors || {};
      const totalRecords = Object.values(sensorsObj).reduce(
        (acc, curr) => acc + (Array.isArray(curr) ? curr.length : 0),
        0
      );

      // Determine if this is a restroom or building
      const isRestroom = !!building?.restroomDetails;

      return {
        title: isRestroom ? building.restroomDetails.name : building.name,
        label: isRestroom ? 'Restroom' : 'Building', // <-- new label field
        location: isRestroom ? building.restroomDetails.name : building.location || 'Location N/A',
        totalRecords,
        image: isRestroom
          ? building.restroomDetails.modelImage?.[0]?.url
          : building.buildingThumbnail?.url || '/images/default/header-bg.png',
        sensors: sensorsObj,
      };
    }) || [];

  const buildingOptions = [
    { option: 'All Buildings', value: '' },
    ...buildingsList.map(b => ({
      option: b.name,
      value: b._id,
    })),
  ];

  const restroomOptions = [
    { option: 'All Restrooms', value: '' },
    ...restroomsList.map(r => ({
      option: `${r.name} `,
      value: r._id,
    })),
  ];
  const sensorOptions = [
    { option: 'All Sensors', value: '' },
    ...filteredSensors.map(s => ({
      option: `${s.name} (${formatSensorType(s.sensorType || s.type || '')})`,
      value: s._id,
    })),
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 rounded-lg bg-white p-4 shadow-sm md:grid-cols-5">
        {/* ... filters ... */}
        {/* Building Filter */}
        <Dropdown
          label="Select Building"
          options={buildingOptions}
          initialValue={selectedBuilding}
          onSelect={value => {
            setSelectedBuilding(value);
            setSelectedRestroom('');
            setSelectedSensor('');
          }}
        />
        <Dropdown
          label="Select Restroom"
          options={selectedBuilding ? restroomOptions : []}
          initialValue={selectedRestroom}
          onSelect={value => {
            setSelectedRestroom(value);
            setSelectedSensor('');
          }}
          disabled={!selectedBuilding}
        />

        <Dropdown
          label="Select Sensor"
          options={selectedRestroom ? sensorOptions : []}
          initialValue={selectedSensor}
          onSelect={value => setSelectedSensor(value)}
          disabled={!selectedRestroom}
        />
        {/* Date Filters */}
        <Input
          label="Start Date"
          type="date"
          value={startDate}
          onChange={e => {
            setStartDate(e.target.value);
            setEndDate('');
          }}
        />
        <Input
          label="End Date"
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          disabled={!startDate}
        />
      </div>
      {(isLoading || isFetching) && (
        <div className="flex justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Loading reports...</span>
        </div>
      )}
      {!isLoading &&
        !isFetching &&
        reportsLists.map((list, i) => (
          <div key={i} className="rounded-[20px] border-2 border-[#00000012] bg-white p-4">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <img
                  src={list.image}
                  alt="image"
                  className="h-26.5 w-46.5 rounded-xl object-cover"
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
                      <p className="text-sm md:text-base">Total Records</p>
                      <p className="text-base md:text-xl">{list.totalRecords}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Render a Separate Table for Each Sensor Type */}
            <div className="flex flex-col gap-8">
              {Object.keys(list.sensors).map(sensorType => {
                const sensorData = list.sensors[sensorType];
                if (!Array.isArray(sensorData) || sensorData.length === 0) return null;

                // Use specific columns if defined, otherwise fallback to simple JSON dump or common columns
                const columns = sensorTypeColumns[sensorType] || [
                  ...commonColumns,
                  { name: 'Data', selector: row => JSON.stringify(row) },
                ];

                return (
                  <div key={sensorType} className="rounded-lg bg-gray-50 p-4 shadow-2xl">
                    <h3 className="mb-2 border-l-4 border-blue-500 px-2 text-lg font-bold text-[#414141]">
                      {formatSensorType(sensorType)}
                    </h3>
                    {/* <DataTable
                      columns={columns}
                      data={sensorData}
                      customStyles={tableStyles}
                      selectableRows={false}
                    /> */}
                    <LazyDataTable columns={columns} data={sensorData} />
                  </div>
                );
              })}
              {/* Show message if no sensors found */}
              {Object.keys(list.sensors).length === 0 && (
                <p className="text-center text-gray-500 italic">
                  No sensor data available for this selection.
                </p>
              )}
            </div>
          </div>
        ))}
    </div>
  );
};

export default Reports;

const tableStyles = {
  headCells: {
    style: {
      fontSize: '14px',
      fontWeight: 700,
      color: '#ffffff',
      background: 'rgba(3, 165, 224, 1)',
    },
  },
};
