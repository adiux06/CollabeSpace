import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User as UserIcon, Trash2, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuthStore } from '../../store/authStore';
import { fetchTaskComments, addComment, deleteComment } from '../../api/taskApi';
import { useSocket } from '../../contexts/SocketContext';

interface CommentListProps {
  taskId: string;
  workspaceId: string;
}

const CommentList: React.FC<CommentListProps> = ({ taskId }) => {
  const { user } = useAuthStore();
  const { socket } = useSocket();
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTyping, setIsTyping] = useState<string | null>(null);
  const typingTimeoutRef = useRef<any>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const loadComments = async () => {
      try {
        const data = await fetchTaskComments(taskId);
        setComments(data);
        setTimeout(scrollToBottom, 100);
      } catch (error) {
        console.error('Failed to fetch comments:', error);
      }
    };
    loadComments();
  }, [taskId]);

  useEffect(() => {
    if (!socket) return;

    const handleNewComment = (payload: any) => {
      if (payload.taskId === taskId) {
        setComments(prev => [...prev, payload.comment]);
        setTimeout(scrollToBottom, 100);
      }
    };

    const handleCommentDeleted = (payload: any) => {
      if (payload.taskId === taskId) {
        setComments(prev => prev.filter(c => c._id !== payload.commentId));
      }
    };

    const handleTyping = (payload: any) => {
      if (payload.taskId === taskId && payload.userId !== user?._id) {
        setIsTyping(payload.userName);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsTyping(null), 3000);
      }
    };

    socket.on('new-comment', handleNewComment);
    socket.on('comment-deleted', handleCommentDeleted);
    socket.on('user-typing', handleTyping);

    return () => {
      socket.off('new-comment', handleNewComment);
      socket.off('comment-deleted', handleCommentDeleted);
      socket.off('user-typing', handleTyping);
    };
  }, [socket, taskId, user?._id]);

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addComment(taskId, newComment.trim());
      // We don't manually add it here because the socket event will handle it for consistency
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTypingStart = () => {
    if (socket && user) {
      socket.emit('typing', { taskId, userId: user._id, userName: user.name });
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[500px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
          Comments
          <span className="ml-2 px-2 py-0.5 bg-gray-100 dark:bg-dark-bg text-gray-500 text-xs rounded-full">
            {comments.length}
          </span>
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4 mb-4">
        <AnimatePresence initial={false}>
          {comments.map((comment) => (
            <motion.div
              key={comment._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 group ${comment.userId._id === user?._id ? 'flex-row-reverse' : ''}`}
            >
              <div className="flex-shrink-0">
                {comment.userId.avatar ? (
                  <img src={comment.userId.avatar} alt="" className="w-8 h-8 rounded-full border border-gray-200" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
              <div className={`max-w-[80%] ${comment.userId._id === user?._id ? 'items-end' : ''} flex flex-col`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {comment.userId.name}
                  </span>
                  <span className="text-[10px] text-gray-400 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <div className={`px-4 py-2 rounded-2xl text-sm ${
                  comment.userId._id === user?._id 
                    ? 'bg-primary-600 text-white rounded-tr-none' 
                    : 'bg-gray-100 dark:bg-dark-bg text-gray-800 dark:text-gray-200 rounded-tl-none'
                }`}>
                  {comment.text}
                </div>
                {comment.userId._id === user?._id && (
                  <button 
                    onClick={() => deleteComment(comment._id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity mt-1 text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isTyping && (
          <div className="text-[10px] text-gray-400 italic px-11">
            {isTyping} is typing...
          </div>
        )}
        <div ref={commentsEndRef} />
      </div>

      <form onSubmit={handleSendComment} className="relative">
        <input
          value={newComment}
          onChange={(e) => {
            setNewComment(e.target.value);
            handleTypingStart();
          }}
          placeholder="Type your comment..."
          className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
        />
        <button
          type="submit"
          disabled={!newComment.trim() || isSubmitting}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default CommentList;
