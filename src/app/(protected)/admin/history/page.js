'use client'

import withPageGuard from '@/components/auth/withPageGuard';
import InspectionHistoryTable from '@/components/user/history/InspectionHistoryTable';
import React from 'react'

const InspectionsHistory = () => {
  return (
    <div>
      <InspectionHistoryTable/>
    </div>
  )
}

export default withPageGuard(InspectionsHistory, '/admin/history');
