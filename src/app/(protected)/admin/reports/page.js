'use client';
import React from 'react';
import AllReports from '@/components/user/reports/AllReports';
import withPageGuard from '@/components/auth/withPageGuard';

function UserReports() {
  return (
    <div>
      <AllReports />
    </div>
  );
}

// export default UserReports;
export default withPageGuard(UserReports, '/admin/reports');
