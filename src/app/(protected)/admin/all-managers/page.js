'use client';
import React, { useState, useMemo } from 'react';
import Modal from '@/components/global/Modal';
import Button from '@/components/global/small/Button';
import AddUsers from '@/components/user/managers/AddUsers';
import EditUser from '@/components/user/managers/EditUser'; // We'll create this
import DataTable from 'react-data-table-component';
import {
  useGetProfileQuery,
  useGetAllUsersByCreatorIdQuery,
  useDeleteUserByIdMutation,
} from '@/features/auth/authApi';
import toast from 'react-hot-toast';
import withPageGuard from '@/components/auth/withPageGuard';

function AllMangers() {
  const [addModel, setAddModel] = useState(false);
  const [editModel, setEditModel] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const { data: profileData } = useGetProfileQuery();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserByIdMutation();

  const {
    data: usersData,
    isLoading,
    error,
    refetch,
  } = useGetAllUsersByCreatorIdQuery(profileData?.data?._id, { skip: !profileData?.data?._id });

  // Handle Edit
  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditModel(true);
  };

  // Handle Delete
  const handleDelete = async (user) => {
    if (!window.confirm(`Are you sure you want to delete ${user.fullName}?`)) {
      return;
    }

    try {
      await deleteUser(user._id).unwrap();
      toast.success('User deleted successfully');
      refetch(); // Refresh the table
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to delete user');
    }
  };

  // Custom Actions Cell with 3-dot menu
  const ActionsCell = ({ row }) => {
    const [showMenu, setShowMenu] = useState(false);

    return (
      <div className="relative">
        {/* Three dots menu button */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {showMenu && (
          <>
            {/* Backdrop to close menu when clicking outside */}
            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border border-gray-200">
              <div className="py-1">
                <button
                  onClick={() => {
                    handleEdit(row);
                    setShowMenu(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit
                </button>
                <button
                  onClick={() => {
                    handleDelete(row);
                    setShowMenu(false);
                  }}
                  disabled={isDeleting}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 disabled:opacity-50"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  // Table columns
  const columns = [
    {
      name: 'Full Name',
      selector: (row) => row.fullName,
      sortable: true,
      minWidth: '150px',
    },
    {
      name: 'Email',
      selector: (row) => row.email,
      sortable: true,
      minWidth: '200px',
    },
    {
      name: 'Role',
      selector: (row) => row.role || 'N/A',
      cell: (row) => <span className="capitalize">{row.role?.replace('-', ' ') || 'N/A'}</span>,
      minWidth: '150px',
    },
    {
      name: 'Actions',
      cell: (row) => <ActionsCell row={row} />,
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: '80px',
    },
  ];

  // Custom styles for better appearance
  const customStyles = {
    rows: {
      style: {
        minHeight: '60px',
      },
    },
    headCells: {
      style: {
        backgroundColor: '#f8fafc',
        fontWeight: '600',
        fontSize: '14px',
      },
    },
  };

  return (
    <div>
      {/* Add User Modal */}
      {addModel && (
        <Modal title={'Add User'} isOpen={addModel} onClose={() => setAddModel(false)}>
          <AddUsers
            onClose={() => {
              setAddModel(false);
              refetch();
            }}
            data={profileData}
          />
        </Modal>
      )}

      {/* Edit User Modal */}
      {editModel && selectedUser && (
        <Modal title={'Edit User'} isOpen={editModel} onClose={() => setEditModel(false)}>
          <EditUser
            user={selectedUser}
            onClose={() => {
              setEditModel(false);
              setSelectedUser(null);
              refetch();
            }}
          />
        </Modal>
      )}

      {/* Header with Add Button */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <Button onClick={() => setAddModel(true)} text="Add User" width="!w-[150px]" />
      </div>

      {/* DataTable */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <DataTable
            title="All Users"
            columns={columns}
            data={usersData?.data || []}
            // pagination
            highlightOnHover
            striped
            customStyles={customStyles}
            responsive
            noDataComponent={
              <div className="py-8 text-center text-gray-500">
                No users found. Click Add User to create one.
              </div>
            }
          />
        )}
      </div>
    </div>
  );
}

// export default AllMangers;
export default withPageGuard(AllMangers, '/admin/all-managers');
