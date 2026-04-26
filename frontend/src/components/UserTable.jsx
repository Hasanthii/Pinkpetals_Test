import React from 'react';
import { Mail, Phone, Calendar, Edit2, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { getUserInitials, getUserDisplayName, getRoleBadgeColor } from '../types/user.js';

const UserTable = ({ users, onDeactivate, onActivate, onEdit, onDelete }) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="bg-gradient-to-r from-pale-rose/50 to-soft-blush/50">
                        <th className="px-6 py-4 text-left font-playfair text-sm font-semibold text-deep-burgundy tracking-wide">
                            User
                        </th>
                        <th className="px-6 py-4 text-left font-playfair text-sm font-semibold text-deep-burgundy tracking-wide">
                            Contact
                        </th>
                        <th className="px-6 py-4 text-left font-playfair text-sm font-semibold text-deep-burgundy tracking-wide">
                            Role
                        </th>
                        <th className="px-6 py-4 text-left font-playfair text-sm font-semibold text-deep-burgundy tracking-wide">
                            Status
                        </th>
                        <th className="px-6 py-4 text-left font-playfair text-sm font-semibold text-deep-burgundy tracking-wide">
                            Joined
                        </th>
                        <th className="px-6 py-4 text-right font-playfair text-sm font-semibold text-deep-burgundy tracking-wide">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-pale-rose/30">
                    {users.map((user) => (
                        <tr key={user.id} className="hover:bg-pale-rose/20 transition-colors duration-200">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-rose to-warm-rose flex items-center justify-center flex-shrink-0">
                                        <span className="text-sm font-bold text-white font-playfair">
                                            {getUserInitials(user)}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-jost font-medium text-deep-burgundy">
                                            {getUserDisplayName(user)}
                                        </p>
                                        <p className="font-jost text-xs text-warm-rose/60">
                                            ID: #{user.id}
                                        </p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="space-y-1">
                                    <p className="font-jost text-sm text-deep-burgundy flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-warm-rose/60" />
                                        {user.email}
                                    </p>
                                    {user.phone && (
                                        <p className="font-jost text-sm text-warm-rose/80 flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-warm-rose/60" />
                                            {user.phone}
                                        </p>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-jost font-medium ${getRoleBadgeColor(user.role)}`}>
                                    {user.role.replace('_', ' ')}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-jost font-medium ${
                                    user.isActive
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-700'
                                }`}>
                                    {user.isActive ? (
                                        <>
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            Active
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="w-3.5 h-3.5" />
                                            Inactive
                                        </>
                                    )}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2 font-jost text-sm text-warm-rose/80">
                                    <Calendar className="w-4 h-4 text-warm-rose/60" />
                                    {formatDate(user.createdAt)}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        onClick={() => onEdit(user)}
                                        className="p-2 rounded-lg text-primary-rose hover:bg-primary-rose/10 hover:text-primary-rose transition-colors duration-200"
                                        title="Edit User"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => onDelete(user.id)}
                                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                                        title="Delete User"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                    {user.isActive ? (
                                        <button
                                            onClick={() => onDeactivate(user.id)}
                                            className="p-2 rounded-lg text-amber-500 hover:bg-amber-50 hover:text-amber-600 transition-colors duration-200"
                                            title="Deactivate User"
                                        >
                                            <XCircle className="w-5 h-5" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => onActivate(user.id)}
                                            className="p-2 rounded-lg text-green-500 hover:bg-green-50 hover:text-green-600 transition-colors duration-200"
                                            title="Activate User"
                                        >
                                            <CheckCircle2 className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserTable;
