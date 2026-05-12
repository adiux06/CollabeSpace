import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Mail, Shield, User as UserIcon, Loader2, Plus, Users, Layout, Sparkles } from 'lucide-react';
import api from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import TeamDiscussion from './TeamDiscussion';

const Team = () => {
  const { user, activeWorkspace } = useAuthStore();
  const queryClient = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [activeTab, setActiveTab] = useState<'members' | 'discussion'>('members');

  const activeWorkspaceId = activeWorkspace?._id;
  const [onlineUsers, setOnlineUsers] = useState<{ userId: string, userName: string }[]>([]);

  // Handle presence
  useEffect(() => {
    if (!socket || !activeWorkspaceId || !user) return;

    socket.emit('join-workspace', { 
      workspaceId: activeWorkspaceId, 
      userId: user._id, 
      userName: user.name 
    });

    socket.on('presence-update', (users: any) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.emit('leave-workspace', activeWorkspaceId);
      socket.off('presence-update');
    };
  }, [socket, activeWorkspaceId, user]);

  // Fetch detailed workspace including populated members
  const { data: workspace, isLoading } = useQuery({
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

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const res = await api.patch(`/workspaces/${activeWorkspaceId}/members/${userId}`, { role });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', activeWorkspaceId] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to update role');
    }
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await api.delete(`/workspaces/${activeWorkspaceId}/members/${userId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', activeWorkspaceId] });
      alert('Member removed successfully');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to remove member');
    }
  });

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    inviteMutation.mutate({ email: inviteEmail, role: inviteRole });
  };

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Users className="w-6 h-6 mr-2 text-primary-500" />
            Team Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage and collaborate in <strong>{workspace.name}</strong>
          </p>
        </div>
        
        {/* Presence Indicators */}
        <div className="flex -space-x-2">
          {onlineUsers.map((u, i) => (
            <div 
              key={u.userId} 
              title={`${u.userName} (Online)`}
              className="relative"
            >
              <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/30 border-2 border-white dark:border-dark-bg flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold text-xs">
                {u.userName.charAt(0).toUpperCase()}
              </div>
              <div className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 border-2 border-white dark:border-dark-bg rounded-full"></div>
            </div>
          ))}
          {onlineUsers.length === 0 && (
            <span className="text-xs text-gray-400 italic flex items-center ml-2">No others online</span>
          )}
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 dark:bg-dark-bg p-1 rounded-xl border border-gray-200 dark:border-dark-border">
          <button
            onClick={() => setActiveTab('members')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'members'
                ? 'bg-white dark:bg-dark-card text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            Members
          </button>
          <button
            onClick={() => setActiveTab('discussion')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'discussion'
                ? 'bg-white dark:bg-dark-card text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            Discussion
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'members' ? (
          <motion.div
            key="members"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-8"
          >

      {/* Team Capabilities Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div 
          whileHover={{ y: -5 }}
          className="glass-panel p-6 rounded-2xl border border-primary-100/20 dark:border-primary-900/20"
        >
          <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 mb-4">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-base">Invite & Grow</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Invite your colleagues to join your workspace and start collaborating on projects together.
          </p>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="glass-panel p-6 rounded-2xl border border-blue-100/20 dark:border-blue-900/20"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-base">Role Control</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Admins can manage permissions, ensuring everyone has the right level of access to the workspace.
          </p>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="glass-panel p-6 rounded-2xl border border-purple-100/20 dark:border-purple-900/20"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4">
            <Layout className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-base">Task Ownership</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Assign tasks to specific team members to keep everyone accountable and track progress.
          </p>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="glass-panel p-6 rounded-2xl border border-amber-100/20 dark:border-amber-900/20"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-base">AI Assistant</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Get help from CollabSpace AI to break down tasks, prioritize work, and optimize your team's workflow.
          </p>
        </motion.div>
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
                
                <div className="flex items-center space-x-4">
                  {isAdmin && user?._id !== member.userId?._id ? (
                    <>
                      <select
                        value={member.role}
                        onChange={(e) => updateRoleMutation.mutate({ userId: member.userId._id, role: e.target.value })}
                        disabled={updateRoleMutation.isPending}
                        className="text-xs border-gray-300 dark:border-dark-border dark:bg-dark-bg dark:text-white rounded-md focus:ring-primary-500"
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                        <option value="viewer">Viewer</option>
                      </select>
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to remove ${member.userId?.name}?`)) {
                            removeMemberMutation.mutate(member.userId._id);
                          }
                        }}
                        disabled={removeMemberMutation.isPending}
                        className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium"
                      >
                        Remove
                      </button>
                    </>
                  ) : (
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize flex items-center ${
                      member.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                      member.role === 'member' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {member.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                      {member.role}
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
          </motion.div>
        ) : (
          <motion.div
            key="discussion"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <TeamDiscussion workspaceId={activeWorkspaceId as string} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Team;
