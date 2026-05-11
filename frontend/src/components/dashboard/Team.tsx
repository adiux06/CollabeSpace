import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Mail, Shield, User as UserIcon, Loader2, Plus, Users } from 'lucide-react';
import api from '../../api/client';
import { useAuthStore } from '../../store/authStore';

const Team = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');

  // Fetch workspaces to get active workspace ID
  const { data: workspaces, isLoading: wsLoading } = useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const res = await api.get('/workspaces');
      return res.data;
    }
  });

  const activeWorkspaceId = workspaces?.[0]?._id;

  // Fetch detailed workspace including populated members
  const { data: workspace, isLoading: detailsLoading } = useQuery({
    queryKey: ['workspace', activeWorkspaceId],
    queryFn: async () => {
      const res = await api.get(`/workspaces/${activeWorkspaceId}`);
      return res.data;
    },
    enabled: !!activeWorkspaceId
  });

  const inviteMutation = useMutation({
    mutationFn: async (inviteData: { email: string; role: string }) => {
      const res = await api.post(`/workspaces/${activeWorkspaceId}/invite`, inviteData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', activeWorkspaceId] });
      setInviteEmail('');
      alert('User invited successfully!');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to invite user');
    }
  });

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    inviteMutation.mutate({ email: inviteEmail, role: inviteRole });
  };

  const isLoading = wsLoading || detailsLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="text-center p-8 text-gray-500">
        You do not have any active workspaces.
      </div>
    );
  }

  // Determine if current user is admin
  const currentUserMember = workspace.members.find((m: any) => m.userId?._id === user?._id);
  const isAdmin = currentUserMember?.role === 'admin';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <Users className="w-6 h-6 mr-2 text-primary-500" />
          Team Management
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage members for <strong>{workspace.name}</strong>
        </p>
      </div>

      {isAdmin && (
        <div className="glass-panel p-6 rounded-2xl">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Invite New Member</h2>
          <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-dark-border dark:bg-dark-bg dark:text-white rounded-lg py-2"
                  placeholder="colleague@example.com"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-dark-border dark:bg-dark-bg dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-lg"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={inviteMutation.isPending}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {inviteMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5 mr-2" />}
              Invite
            </button>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-dark-card shadow-sm rounded-2xl overflow-hidden border border-gray-200 dark:border-dark-border">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-border">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Workspace Members ({workspace.members.length})</h3>
        </div>
        <ul className="divide-y divide-gray-200 dark:divide-dark-border">
          {workspace.members.map((member: any) => (
            <li key={member._id} className="p-6 hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold">
                      {member.userId?.name?.charAt(0).toUpperCase() || <UserIcon className="w-5 h-5" />}
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {member.userId?.name || 'Unknown User'} {user?._id === member.userId?._id && <span className="text-gray-400 text-xs ml-1">(You)</span>}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {member.userId?.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize flex items-center ${
                    member.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                    member.role === 'member' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                  }`}>
                    {member.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                    {member.role}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

export default Team;
