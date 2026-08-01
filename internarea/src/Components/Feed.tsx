/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, MessageCircle, Share2, CornerUpRight, Send, AlertCircle, Copy, Check, Users } from 'lucide-react';
import { Post, Comment, User } from '../types/types_p';
import { useLanguage } from '../context/LanguageContext';

interface FeedProps {
  posts: Post[];
  currentUser: User;
  onLikePost: (postId: string) => void;
  onCommentPost: (postId: string, commentContent: string) => void;
  onSharePost: (postId: string) => void;
}

export default function Feed({ posts, currentUser, onLikePost, onCommentPost, onSharePost }: FeedProps) {
  const { t } = useLanguage();
  // State to track if component has mounted to prevent hydration mismatches on local date strings
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Comment handling state
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});

  // Share overlay state
  const [sharingPost, setSharingPost] = useState<Post | null>(null);
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);
  const [simulatedRecipient, setSimulatedRecipient] = useState<string>('');
  const [shareSuccess, setShareSuccess] = useState(false);

  // Animate double taps on visual content
  const [doubleTapHeart, setDoubleTapHeart] = useState<{ [postId: string]: boolean }>({});
  const lastTap = React.useRef<{ [postId: string]: number }>({});

  const handleDoubleTap = (postId: string) => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    if (now - (lastTap.current[postId] || 0) < DOUBLE_PRESS_DELAY) {
      // Trigger like
      if (!posts.find(p => p.id === postId)?.likes.includes(currentUser.id)) {
        onLikePost(postId);
      }
      // Animate heart
      setDoubleTapHeart(prev => ({ ...prev, [postId]: true }));
      setTimeout(() => {
        setDoubleTapHeart(prev => ({ ...prev, [postId]: false }));
      }, 700);
    }
    lastTap.current[postId] = now;
  };

  const handleCommentSubmit = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const content = commentInputs[postId]?.trim();
    if (!content) return;
    
    onCommentPost(postId, content);
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  const executeShareCopy = (post: Post) => {
    const fakeUrl = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(fakeUrl).then(() => {
      setCopiedPostId(post.id);
      setTimeout(() => setCopiedPostId(null), 2000);
    }).catch(() => {
      // Fallback
    });
    onSharePost(post.id);
  };

  const executeDirectShareSim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simulatedRecipient || !sharingPost) return;
    onSharePost(sharingPost.id);
    setShareSuccess(true);
    setTimeout(() => {
      setShareSuccess(false);
      setSharingPost(null);
      setSimulatedRecipient('');
    }, 1800);
  };

  return (
    <div className="space-y-6" id="public-space-feed">
      {posts.length === 0 ? (
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-12 text-center" id="empty-feed-placeholder">
          <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h4 className="text-sm font-bold text-slate-600">{t('publicSpace.noPosts')}</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
            {t('publicSpace.friends')}
          </p>
        </div>
      ) : (
        posts.map((post) => {
          const isLiked = post.likes.includes(currentUser.id);
          const showComments = activeCommentId === post.id;
          
          return (
            <motion.div
              key={post.id}
              layout="position"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden hover:border-indigo-300 hover:shadow-md transition-all duration-300 flex flex-col"
              id={`post-card-${post.id}`}
            >
              {/* Card Header Profile */}
              <div className="p-6 flex items-center justify-between border-b border-slate-100/85">
                <div className="flex items-center gap-3">
                  <img
                    src={post.userAvatar}
                    alt={post.userName}
                    className="w-10 h-10 rounded-full object-cover shadow-xs border border-indigo-100"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{post.userName}</h4>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {isMounted ? (
                        <>
                          {new Date(post.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}{' '}
                          &bull; {new Date(post.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </>
                      ) : null}
                    </p>
                  </div>
                </div>
                {post.userId === currentUser.id && (
                  <span className="bg-indigo-55 text-indigo-600 font-mono text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border border-indigo-100">
                    {t('publicSpace.profile')}
                  </span>
                )}
              </div>

              {/* Text Description */}
              <p className="px-6 pt-5 pb-4 text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>

              {/* Media Exhibit (Double-tap to like supported!) - Nested rounded Bento element */}
              {post.mediaUrl && (
                <div 
                  className="mx-6 mb-5 relative overflow-hidden bg-slate-950 border border-slate-150 rounded-2xl max-h-[420px] flex items-center justify-center cursor-pointer select-none"
                  onClick={() => handleDoubleTap(post.id)}
                  id={`media-tap-box-${post.id}`}
                >
                  {post.mediaType === 'image' ? (
                    <img
                      src={post.mediaUrl}
                      alt="Shared attachment"
                      className="w-full h-full object-contain max-h-[420px]"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full relative">
                      <video
                        src={post.mediaUrl}
                        controls
                        className="w-full max-h-[420px] object-cover"
                      />
                    </div>
                  )}

                  {/* Absolute visual heart pop animation for double clicks */}
                  <AnimatePresence>
                    {doubleTapHeart[post.id] && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.3 }}
                        animate={{ opacity: 1, scale: 1.2 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 15 }}
                        className="absolute inset-0 flex items-center justify-center bg-black/10 text-white z-10 pointer-events-none"
                      >
                        <Heart className="w-20 h-20 fill-rose-500 text-rose-500 stroke-[1.5]" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Interaction Panel */}
              <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100/80 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  {/* LIKE */}
                  <div className="flex items-center gap-1.5 align-middle select-none">
                    <button
                      onClick={() => onLikePost(post.id)}
                      className={`p-1.5 rounded-xl transition-colors flex items-center justify-center ${
                        isLiked 
                          ? 'text-rose-550 bg-rose-50 border border-rose-100' 
                          : 'text-slate-500 hover:text-rose-500 hover:bg-slate-50'
                      }`}
                      aria-label={t('publicSpace.likes')}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>
                    <span className="text-xs font-mono font-bold text-slate-700">
                      {post.likes.length}
                    </span>
                  </div>

                  {/* COMMENT TOGGLE */}
                  <div className="flex items-center gap-1.5 align-middle select-none">
                    <button
                      onClick={() => setActiveCommentId(showComments ? null : post.id)}
                      className={`p-1.5 rounded-xl transition-colors flex items-center justify-center ${
                        showComments 
                          ? 'text-indigo-550 bg-indigo-50 border border-indigo-100' 
                          : 'text-slate-500 hover:text-indigo-500 hover:bg-slate-50'
                      }`}
                      aria-label={t('publicSpace.comments')}
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-mono font-bold text-slate-700">
                      {post.comments.length}
                    </span>
                  </div>
                </div>

                {/* SHARE TRIGGER */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSharingPost(post)}
                    className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/60 px-3 py-1.5 border border-transparent hover:border-indigo-100 rounded-xl transition"
                    id={`share-btn-${post.id}`}
                  >
                    <Share2 className="w-4 h-4 text-indigo-500" />
                    <span>{t('publicSpace.shares')}</span>
                  </button>
                  <span className="text-xs font-mono text-slate-400">
                    ({post.sharesCount})
                  </span>
                </div>
              </div>

              {/* COMMENTS COLLAPSED PANEL */}
              <AnimatePresence>
                {showComments && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-slate-50/40 border-t border-slate-100"
                    id={`comments-drawer-${post.id}`}
                  >
                    <div className="p-6 space-y-4">
                      {/* Comments List */}
                      {post.comments.length > 0 && (
                        <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                          {post.comments.map((comment) => (
                            <div key={comment.id} className="flex gap-3 text-xs items-start bg-white p-3 rounded-2xl border border-slate-100 shadow-xs">
                              <img
                                src={comment.userAvatar}
                                alt={comment.userName}
                                className="w-7 h-7 rounded-full object-cover mt-0.5 border border-indigo-50"
                                referrerPolicy="no-referrer"
                              />
                              <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-bold text-slate-900">{comment.userName}</span>
                                  <span className="text-[9px] text-slate-400 font-mono">
                                    {isMounted
                                      ? new Date(comment.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })
                                      : null}
                                  </span>
                                </div>
                                <p className="text-slate-700 leading-relaxed text-[12px]">
                                  {comment.content}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add comment Form */}
                      <form onSubmit={(e) => handleCommentSubmit(post.id, e)} className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={commentInputs[post.id] || ''}
                          onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                          placeholder={t('publicSpace.comments')}
                          className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/30 text-slate-800 focus:bg-white"
                        />
                        <button
                          type="submit"
                          disabled={!commentInputs[post.id]?.trim()}
                          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-205 text-white rounded-xl px-4 py-2.5 flex items-center justify-center transition"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })
      )}

      {/* SHARE modal dialog overlay */}
      <AnimatePresence>
        {sharingPost && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="share-modal-overlay">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-100 shadow-xl"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Share2 className="w-4 h-4 text-indigo-500" /> {t('publicSpace.shares')}
                </h3>
                <button
                  onClick={() => setSharingPost(null)}
                  className="text-slate-400 hover:text-slate-700 py-1"
                >
                  {t('common.close')}
                </button>
              </div>

              {shareSuccess ? (
                <div className="py-6 text-center text-teal-600 text-xs font-semibold flex flex-col items-center justify-center gap-2">
                  <Check className="w-10 h-10 text-teal-500 bg-teal-50 rounded-full p-2" />
                  {t('publicSpace.shares')}!
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {t('publicSpace.shares')} <strong className="text-slate-800">{sharingPost.userName}</strong>
                  </p>

                  {/* Copy link option */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider font-mono">{t('publicSpace.likes')}</span>
                      <span className="text-xs text-slate-600 font-mono truncate max-w-[200px] block">
                        http://publicspace.io/posts/{sharingPost.id}
                      </span>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => executeShareCopy(sharingPost)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 border ${
                        copiedPostId === sharingPost.id
                          ? 'bg-teal-50 border-teal-200 text-teal-700'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {copiedPostId === sharingPost.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedPostId === sharingPost.id ? t('common.save') : t('common.save')}
                    </button>
                  </div>

                  {/* Share to friend simulator form */}
                  <form onSubmit={executeDirectShareSim} className="space-y-3">
                    <label className="block text-xs font-bold text-slate-700">
                      {t('publicSpace.friends')}
                    </label>
                    <div className="flex gap-2">
                      <select
                        required
                        value={simulatedRecipient}
                        onChange={(e) => setSimulatedRecipient(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:bg-white text-slate-700"
                      >
                        <option value="">{t('publicSpace.friendDirectory')}</option>
                        {currentUser.friends.length === 0 ? (
                          <option disabled value="">⚠️ {t('publicSpace.noFriends')}</option>
                        ) : (
                          currentUser.friends.map(fid => (
                            <option key={fid} value={fid}>{t('publicSpace.friends')} (ID: {fid})</option>
                          ))
                        )}
                      </select>
                      
                      <button
                        type="submit"
                        disabled={!simulatedRecipient}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white rounded-lg px-4 text-xs font-bold transition flex items-center gap-1"
                      >
                        <CornerUpRight className="w-3.5 h-3.5" /> {t('publicSpace.addFriend')}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}