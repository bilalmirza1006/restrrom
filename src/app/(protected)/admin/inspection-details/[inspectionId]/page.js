'use client';
import withPageGuard from '@/components/auth/withPageGuard';
import HistoryCard from '@/components/inspectionist/history/HistoryCard';
import { useGetInspectionByIdQuery } from '@/features/inspection/inspectionApi';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

function Inspections() {
  const { inspectionId } = useParams();
  const {
    data: inspection,
    isLoading,
    isError,
  } = useGetInspectionByIdQuery(inspectionId, {
    skip: !inspectionId,
  });

  const [restroomData, setRestroomData] = useState([]);

  // 🔁 Runs when inspection data changes
  useEffect(() => {
    if (inspection?.data?.restroomInspections) {
      setRestroomData(inspection.data.restroomInspections);
      console.log('🔄 Inspection data updated:', inspection.data);
    }
  }, [inspection]);

  if (isLoading) return <p>Loading inspection details...</p>;
  if (isError) return <p>Error loading inspection details.</p>;

  return (
    <div className="rounded-md bg-white p-6">
      <h1 className="mb-4 text-2xl font-semibold">Inspection Details</h1>

      {/* Restroom inspection cards */}
      {restroomData.length > 0 ? (
        <HistoryCard restroom={inspection?.data} />
      ) : (
        <p>No restroom inspection data available.</p>
      )}
    </div>
  );
}

export default withPageGuard(Inspections, '/admin/inspection-details/[inspectionId]');
