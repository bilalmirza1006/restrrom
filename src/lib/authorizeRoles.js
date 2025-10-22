export const authorizeRoles = (currentUser, ...allowedRoles) => {
  if (!currentUser) throw new Error('Unauthorized: user not found');
  if (!allowedRoles.includes(currentUser.role)) {
    throw new Error('Access denied: insufficient privileges');
  }
};
