
import React, { useState } from 'react';
import { X, ArrowRight, Heart, CornerDownRight, ArrowDownUp, Send } from 'lucide-react';
import { Note, Comment, User } from '../types';
import { getRelativeTime } from '../constants';

interface CommentsModalProps {
  note: Note;
  currentUser: User;
  users: User[];
  onClose: () => void;
  onSubmitComment: (text: string, parentId?: string) => void;
  onLikeComment: (commentId: string) => void;
  t: any;
  lang: 'en' | 'ar';
}

const CommentsModal: React.FC<CommentsModalProps> = ({ note, currentUser, users, onClose, onSubmitComment, onLikeComment, t, lang }) => {
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: string, username: string } | null>(null);
  // Requirement: Ensure comments are sorted by likes (most to least) by default
  const [sortBy, setSortBy] = useState<'LIKES' | 'NEWEST'>('LIKES');

  const handleSubmit = () => {
    if (!text.trim()) return;
    onSubmitComment(text, replyTo?.id);
    setText('');
    setReplyTo(null);
  };

  const handleReplyClick = (comment: Comment) => {
      const author = users.find(u => u.id === comment.userId);
      if (author) {
          setReplyTo({ id: comment.id, username: author.displayName });
      }
  };

  const CommentItem: React.FC<{ comment: Comment, depth?: number }> = ({ comment, depth = 0 }) => {
    const author = users.find(u => u.id === comment.userId);
    const isLiked = comment.isLikedByCurrentUser;
    // Replies generally stay chronological to make sense of the conversation flow
    const replies = note.comments.filter(c => c.parentId === comment.id).sort((a,b) => a.timestamp - b.timestamp);
    
    const isNew = (Date.now() - comment.timestamp) < 60000;

    return (
      <div className={`flex flex-col ${depth > 0 ? 'ml-8 relative' : ''}`}>
        {depth > 0 && (
            <div className="absolute -left-4 top-0 bottom-4 w-px bg-gray-200 dark:bg-zinc-800 rounded-full"></div>
        )}
        {depth > 0 && (
            <div className="absolute -left-4 top-4 w-3 h-px bg-gray-200 dark:bg-zinc-800 rounded-full"></div>
        )}
        
        <div className={`p-3 rounded-2xl mb-2 transition-colors ${isNew ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'bg-transparent hover:bg-gray-50 dark:hover:bg-zinc-900'}`}>
          <div className="flex justify-between items-start">
             <div className="flex items-center gap-3">
                 {/* Requirement: Profile picture of the comment author next to their name, styled small */}
                 {author ? (
                    <img 
                        src={author.avatarUrl} 
                        className="w-8 h-8 rounded-full object-cover border border-gray-100 dark:border-zinc-800 flex-shrink-0" 
                        alt={author.username} 
                    />
                 ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-zinc-800 flex-shrink-0" />
                 )}
                 
                 <div>
                    <p className="text-sm font-bold dark:text-white leading-none">{author?.displayName || 'Unknown'}</p>
                    <span className="text-[10px] text-gray-400 font-medium block mt-0.5">
                        {getRelativeTime(comment.timestamp, lang)}
                    </span>
                 </div>
             </div>

             <button 
                onClick={() => onLikeComment(comment.id)} 
                className="flex flex-col items-center gap-0.5 min-w-[24px] active:scale-90 transition-transform p-1"
             >
                <Heart size={14} fill={isLiked ? "currentColor" : "none"} className={isLiked ? 'text-red-500' : 'text-gray-400'} />
                {(comment.likes || 0) > 0 && <span className="text-[10px] font-bold text-gray-500">{comment.likes}</span>}
             </button>
          </div>
          
          {/* Content padding matches avatar width (w-8 is 2rem/32px) + gap (0.75rem/12px) approx */}
          <div className="pl-[44px]">
              <p className="text-[15px] dark:text-gray-200 leading-relaxed">{comment.text}</p>
              <button 
                onClick={() => handleReplyClick(comment)} 
                className="mt-1 text-xs font-bold text-gray-400 hover:text-black dark:hover:text-white transition-colors uppercase tracking-wide py-1"
              >
                  {t.reply}
              </button>
          </div>
        </div>
        
        {replies.map(reply => (
            <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
        ))}
      </div>
    );
  };

  // Sort root comments based on selection
  const rootComments = note.comments
    .filter(c => !c.parentId)
    .sort((a, b) => {
        if (sortBy === 'LIKES') {
            const diff = (b.likes || 0) - (a.likes || 0);
            // Secondary sort by newest if likes are equal
            if (diff !== 0) return diff;
        }
        return b.timestamp - a.timestamp;
    });

  const isAr = t.comments === 'تعليقات';

  return (
    <div className="absolute inset-0 bg-black/60 z-[60] flex items-end backdrop-blur-sm transition-opacity duration-300 animate-fade-in" onClick={onClose}>
        <div 
            className="bg-white dark:bg-black w-full rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.2)] max-h-[85vh] flex flex-col animate-slide-up"
            onClick={e => e.stopPropagation()}
        >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-zinc-800 shrink-0">
                <div className="flex items-center gap-4">
                    <h3 className="text-xl font-bold dark:text-white tracking-tight">{t.comments} <span className="text-gray-400 font-medium text-lg">({note.comments.length})</span></h3>
                    
                    {/* Requirement: Option to filter by newest/likes */}
                    {note.comments.length > 1 && (
                        <button 
                            onClick={() => setSortBy(prev => prev === 'LIKES' ? 'NEWEST' : 'LIKES')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-zinc-900 hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors active:scale-95"
                        >
                            <ArrowDownUp size={12} className="text-gray-500 dark:text-gray-400" />
                            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {sortBy === 'LIKES' 
                                    ? (isAr ? 'الأفضل' : 'Top') 
                                    : (isAr ? 'الأحدث' : 'Newest')}
                            </span>
                        </button>
                    )}
                </div>
                <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-zinc-900 rounded-full hover:rotate-90 transition-all duration-300 text-black dark:text-white"><X size={20} /></button>
            </div>
            
            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-1 no-scrollbar">
                {rootComments.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-400 gap-3">
                       <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-zinc-900 flex items-center justify-center"><span className="text-2xl">💬</span></div>
                       <p className="text-sm font-medium">{isAr ? 'كن أول من يعلق' : 'Be the first to comment'}</p>
                    </div>
                )}
                {rootComments.map(c => (
                    <CommentItem key={c.id} comment={c} />
                ))}
            </div>

            {/* Input Area */}
            <div className="shrink-0 p-4 pb-safe bg-white dark:bg-black border-t border-gray-100 dark:border-zinc-800">
                {replyTo && (
                    <div className="flex items-center justify-between bg-gray-100 dark:bg-zinc-900 px-4 py-2 rounded-t-2xl text-xs mb-[-10px] pb-4 relative z-0 mx-2">
                        <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                            <CornerDownRight size={12} className="text-brand-accent"/> {t.replyingTo} <span className="font-bold text-black dark:text-white">{replyTo.username}</span>
                        </span>
                        <button onClick={() => setReplyTo(null)} className="hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-full p-1"><X size={12} className="dark:text-white"/></button>
                    </div>
                )}
                <div className="relative z-10 flex items-end gap-2">
                    <textarea 
                        value={text}
                        onChange={e => setText(e.target.value)}
                        placeholder={replyTo ? `${t.reply}...` : t.addComment}
                        className="flex-1 bg-gray-100 dark:bg-zinc-900 dark:text-white px-5 py-3.5 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 transition-all resize-none max-h-32 min-h-[3rem]"
                        rows={1}
                    />
                    <button 
                        onClick={handleSubmit} 
                        disabled={!text.trim()} 
                        className="bg-black dark:bg-white text-white dark:text-black w-12 h-12 rounded-full flex items-center justify-center shadow-lg disabled:opacity-30 disabled:shadow-none active:scale-90 transition-all"
                    >
                        <Send size={20} className={text.trim() ? 'ml-1' : ''} />
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default CommentsModal;