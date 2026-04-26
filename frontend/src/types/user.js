export const UserRole = {
    ADMIN: 'ADMIN',
    CUSTOMER: 'CUSTOMER',
    SUPPORT_STAFF: 'SUPPORT_STAFF',
    SUPPLIER: 'SUPPLIER'
};

export const createUserDTO = (data) => ({
    id: data.id || null,
    username: data.username || '',
    email: data.email || '',
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    phone: data.phone || '',
    address: data.address || '',
    role: data.role || UserRole.CUSTOMER,
    isActive: data.isActive !== undefined ? data.isActive : true,
    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null
});

export const createRegisterRequest = (data) => ({
    username: data.username || '',
    email: data.email || '',
    password: data.password || '',
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    phone: data.phone || '',
    role: data.role || 'CUSTOMER'
});

export const createLoginRequest = (data) => ({
    email: data.email || '',
    password: data.password || ''
});

export const createChangePasswordRequest = (data) => ({
    oldPassword: data.oldPassword || '',
    newPassword: data.newPassword || ''
});

export const createUpdateUserRequest = (data) => ({
    firstName: data.firstName || null,
    lastName: data.lastName || null,
    phone: data.phone || null,
    address: data.address || null
});

export const createAuthResponse = (data) => ({
    token: data.token || '',
    user: data.user ? createUserDTO(data.user) : null
});

export const getUserDisplayName = (user) => {
    if (!user) return '';
    return `${user.firstName} ${user.lastName}`.trim() || user.email;
};

export const getUserInitials = (user) => {
    if (!user) return '?';
    const first = user.firstName?.charAt(0)?.toUpperCase() || '';
    const last = user.lastName?.charAt(0)?.toUpperCase() || '';
    return (first + last) || user.email?.charAt(0)?.toUpperCase() || '?';
};

export const getRoleBadgeColor = (role) => {
    switch (role) {
        case UserRole.ADMIN:
            return 'bg-deep-burgundy text-white';
        case UserRole.SUPPORT_STAFF:
            return 'bg-warm-rose text-white';
        case UserRole.SUPPLIER:
            return 'bg-soft-rose text-deep-burgundy';
        case UserRole.CUSTOMER:
        default:
            return 'bg-pale-rose text-deep-burgundy';
    }
};
