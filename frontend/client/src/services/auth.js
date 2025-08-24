export const isAdmin = (user) => user?.role === 'admin';
export const isEmployee = (user) => user?.role === 'user';
