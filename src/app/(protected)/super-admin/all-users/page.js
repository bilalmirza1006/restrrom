'use client';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import Modal from '@/components/global/Modal';
import Button from '@/components/global/small/Button';
import AddUsers from '@/components/user/managers/AddUsers';
import EditUser from '@/components/user/managers/EditUser';
import DataTable from 'react-data-table-component';
import {
  useGetProfileQuery,
  useGetAllUsersByCreatorIdQuery,
  useDeleteUserByIdMutation,
} from '@/features/auth/authApi';
import toast from 'react-hot-toast';
import withPageGuard from '@/components/auth/withPageGuard';
import { createPortal } from 'react-dom';

function AllUsers() {
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
  const handleEdit = user => {
    setSelectedUser(user);
    setEditModel(true);
  };

  // Handle Delete
  const handleDelete = async user => {
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
  // import React, { useState, useRef, useEffect } from 'react';
  // import { createPortal } from 'react-dom';

  const ActionsCell = ({ row, handleEdit, handleDelete, isDeleting }) => {
    const [showMenu, setShowMenu] = useState(false);
    const buttonRef = useRef(null);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

    // Update menu position whenever it opens
    useEffect(() => {
      if (showMenu && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setMenuPosition({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
      }
    }, [showMenu]);

    return (
      <>
        <button
          ref={buttonRef}
          onClick={() => setShowMenu(prev => !prev)}
          className="rounded-full p-2 transition-colors hover:bg-gray-100"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>

        {showMenu &&
          createPortal(
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 z-[9998]" onClick={() => setShowMenu(false)} />
              {/* Menu */}
              <div
                className="fixed z-[9999] w-48 rounded-md border border-gray-200 bg-white shadow-lg"
                style={{ top: menuPosition.top, left: menuPosition.left }}
              >
                <div className="py-1">
                  <button
                    onClick={() => {
                      handleEdit(row);
                      setShowMenu(false);
                    }}
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      handleDelete(row);
                      setShowMenu(false);
                    }}
                    disabled={isDeleting}
                    className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 disabled:opacity-50"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </>,
            document.body
          )}
      </>
    );
  };

  // Table columns
  const columns = [
    {
      name: 'Full Name',
      selector: row => row.fullName,
      sortable: true,
      style: {
        minWidth: '150px', // ✅ correct way
      },
    },
    {
      name: 'Email',
      selector: row => row.email,
      sortable: true,
      style: {
        minWidth: '200px', // ✅ correct way
      },
    },
    {
      name: 'Role',
      selector: row => row.role || 'N/A',
      cell: row => <span className="capitalize">{row.role?.replace('-', ' ') || 'N/A'}</span>,
      style: {
        minWidth: '150px', // ✅ correct way
      },
    },
    {
      name: 'Actions',
      cell: row => (
        <ActionsCell
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          isDeleting={isDeleting}
          row={row}
        />
      ),
      ignoreRowClick: true,
      // allowOverflow: true,
      // button: true,
      style: {
        minWidth: '80px', // ✅ correct way
      },
    },
  ];

  // Custom styles for better appearance
  const customStyles = {
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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <Button onClick={() => setAddModel(true)} text="Add User" width="!w-[150px]" />
      </div>

      {/* DataTable */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
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

export default AllUsers;
// export default withPageGuard(AllUsers, '/admin/all-managers');

// export default AllUsers;
