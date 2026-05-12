import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, Loader2, User as UserIcon, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { useSocket } from '../../contexts/SocketContext';
import { formatDistanceToNow } from 'date-fns';

const TeamDiscussion = ({ workspaceId }: { workspaceId: string }) => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', workspaceId],
    queryFn: async () => {
      const res = await api.get(`/messages/${workspaceId}`);
      return res.data;
    },
    enabled: !!workspaceId
  });

  const messageMutation = useMutation({
    mutationFn: async (text: string) => {
      const res = await api.post(`/messages/${workspaceId}`, { text });
      return res.data;
    },
    onSuccess: (newMessage) => {
      // Optimistically update query data if needed, or just wait for socket
      setMessageText('');
    }
  });

  // Handle real-time messages
  useEffect(() => {
    if (!socket) return;

    socket.on('new-message', (message: any) => {
      if (message.workspaceId === workspaceId) {
        queryClient.setQueryData(['messages', workspaceId], (old: any) => [...(old || []), message]);
      }
    });

    return () => {
      socket.off('new-message');
    };
  }, [socket, workspaceId, queryClient]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || messageMutation.isPending) return;
    messageMutation.mutate(messageText);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] glass-panel rounded-2xl overflow-hidden border border-gray-200 dark:border-dark-border">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-border bg-gray-50/50 dark:bg-dark-bg/50 backdrop-blur-sm flex items-center justify-between">
        <div className="flex items-center">
          <MessageSquare className="w-5 h-5 mr-2 text-primary-500" />
          <h3 className="font-bold text-gray-900 dark:text-white">Workspace Discussion</h3>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Real-time updates active
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-white/30 dark:bg-dark-card/30">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
            <MessageSquare className="w-12 h-12 mb-4 text-gray-400" />
            <p className="text-gray-500 dark:text-gray-400">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg: any) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg._id}
              className={`flex ${msg.sender?._id === user?._id ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[80%] ${msg.sender?._id === user?._id ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className="flex-shrink-0 mt-1">
                  <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold text-xs border border-primary-200 dark:border-primary-800">
                    {msg.sender?.name?.charAt(0).toUpperCase() || <UserIcon className="w-4 h-4" />}
                  </div>
                </div>
                <div className={`mx-2 ${msg.sender?._id === user?._id ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className={`px-4 py-2 rounded-2xl text-sm shadow-sm ${
                    msg.sender?._id === user?._id 
                      ? 'bg-primary-600 text-white rounded-tr-none' 
                      : 'bg-white dark:bg-dark-bg text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-dark-border rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 px-1">
                    {msg.sender?.name} • {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-gray-50/50 dark:bg-dark-bg/50 border-t border-gray-200 dark:border-dark-border">
        <form onSubmit={handleSendMessage} className="relative">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type a message..."
            className="w-full pl-4 pr-12 py-3 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm dark:text-white"
          />
          <button
            type="submit"
            disabled={!messageText.trim() || messageMutation.isPending}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 shadow-lg shadow-primary-500/20"
          >
            {messageMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TeamDiscussion;
