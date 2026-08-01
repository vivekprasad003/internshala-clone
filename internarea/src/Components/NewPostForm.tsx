/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileImage, Play, X, UploadCloud, CheckCircle, AlertTriangle, Image as IconImage, Video as IconVideo, Flame } from 'lucide-react';
import { User, Post } from '../types/types_p';
import { getPostingLimitInfo } from '../data/data_p';
import { useLanguage } from '../context/LanguageContext';

interface NewPostFormProps {
  currentUser: User;
  onAddPost: (content: string, mediaUrl?: string, mediaType?: 'image' | 'video' | 'none') => void;
  onAddRandomPost: () => void;
}

// Preset scenic mock stock media to make it extremely easy to test high-fidelity visual uploads in one click!
const STOCK_PRESETS = [
  { label: '🏔️ Lake & Mountains', url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=800', type: 'image' as const },
  { label: '⛺ Forest Campsite', url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=800', type: 'image' as const },
  { label: '🍕 Gourmet Pizza', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800', type: 'image' as const },
  { label: '🌲 Forest Stream (Video)', url: 'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4', type: 'video' as const },
  { label: '🌊 Ocean Wave (Video)', url: 'https://assets.mixkit.co/videos/preview/mixkit-top-view-of-a-gentle-ocean-wave-51636-large.mp4', type: 'video' as const },
];

export default function NewPostForm({ currentUser, onAddPost, onAddRandomPost }: NewPostFormProps) {
  const { t } = useLanguage();
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'none'>('none');
  const [isDragging, setIsDragging] = useState(false);
  const [fileAccept, setFileAccept] = useState('image/*,video/*');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const limitInfo = getPostingLimitInfo(currentUser.friends.length);
  const postsCount = currentUser.postsToday.length;
  const isLimited = limitInfo.limit !== 'unlimited';
  const isBlocked = isLimited && (limitInfo.limit as number) === 0;
  const isLimitReached = isLimited && postsCount >= (limitInfo.limit as number);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Parse type
    const fileType = file.type;
    let detectedType: 'image' | 'video' | 'none' = 'none';
    if (fileType.startsWith('image/')) {
      detectedType = 'image';
    } else if (fileType.startsWith('video/')) {
      detectedType = 'video';
    } else {
      alert('Highly polished formats only! Please upload an image or video file.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaUrl(reader.result as string);
      setMediaType(detectedType);
    };
    reader.onerror = () => {
      alert('Could not read file. Please try again with a valid local file.');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const fileType = file.type;
    let detectedType: 'image' | 'video' | 'none' = 'none';
    if (fileType.startsWith('image/')) {
      detectedType = 'image';
    } else if (fileType.startsWith('video/')) {
      detectedType = 'video';
    } else {
      alert('Please upload an image or a video file.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaUrl(reader.result as string);
      setMediaType(detectedType);
    };
    reader.onerror = () => {
      alert('Error reading dropped file.');
    };
    reader.readAsDataURL(file);
  };

  const removeMedia = () => {
    setMediaUrl(null);
    setMediaType('none');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isBlocked || isLimitReached) return;
    if (!content.trim() && !mediaUrl) return;

    onAddPost(content.trim(), mediaUrl || undefined, mediaType);
    
    // Reset state
    setContent('');
    setMediaUrl(null);
    setMediaType('none');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const selectStockPreset = (preset: typeof STOCK_PRESETS[number]) => {
    removeMedia();
    setMediaUrl(preset.url);
    setMediaType(preset.type);
  };

  const triggerImageUpload = () => {
    setFileAccept('image/*');
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 50);
  };

  const triggerVideoUpload = () => {
    setFileAccept('video/*');
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 50);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm mb-6" id="new-post-form">
      {/* Hidden constant file input so it never unmounts */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={fileAccept}
        className="hidden"
      />

      <div className="flex items-center gap-2 mb-4">
        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
          <Flame className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">{t('publicSpace.createPost')}</h3>
          <p className="text-[11px] text-slate-400 font-mono">
            {isLimited 
              ? `Completed ${postsCount} out of your ${limitInfo.limit} allowed daily posts` 
              : t('publicSpace.postsToday')}
          </p>
        </div>
      </div>

      {/* BLOCK STATE WARNINGS */}
      {isBlocked && (
        <div className="mb-4 p-4 bg-amber-50/50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-900" id="post-blocked-0-friends">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <span className="font-bold">{t('systemInfo.blocked')}:</span> {t('publicSpace.noFriends')}
          </div>
        </div>
      )}

      {isLimitReached && !isBlocked && (
        <div className="mb-4 p-4 bg-red-50/50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-900" id="post-limit-reached">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <span className="font-bold">{t('publicSpace.connectionLimit')}:</span> {t('publicSpace.removeFriend')}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-start gap-3">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-10 h-10 rounded-full object-cover border-2 border-indigo-150 shadow-md hover:scale-105 transition-all duration-300 shrink-0 transform"
            referrerPolicy="no-referrer"
          />
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isBlocked || isLimitReached}
              placeholder={
                isBlocked
                  ? t('publicSpace.noFriends')
                  : isLimitReached
                    ? t('publicSpace.connectionLimit')
                    : t('publicSpace.shareThoughts')
              }
              className="w-full min-h-[90px] text-sm text-slate-800 border bg-slate-50/30 border-slate-100 hover:bg-slate-50 hover:border-slate-300 focus:bg-white focus:border-indigo-400 rounded-2xl p-3.5 focus:outline-none focus:ring-4 focus:ring-indigo-150/50 shadow-inner transition-all resize-y font-sans leading-relaxed"
              maxLength={1000}
            />
          </div>
        </div>

        {/* Media Upload Area */}
        <AnimatePresence>
          {!mediaUrl && !isBlocked && !isLimitReached && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-50/40'
                    : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50/35'
                }`}
                id="file-dropzone"
              >
                <UploadCloud className="w-7 h-7 text-slate-400 mb-2" />
                <p className="text-xs font-semibold text-slate-700">{t('publicSpace.createPost')}</p>
                <p className="text-[10px] text-slate-400 mt-1 font-mono">{t('publicSpace.addCustomUser')}</p>
              </div>

              {/* Preset Stock Mounts to speed up testing in browser */}
              <div className="mt-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{t('publicSpace.randomPost')}:</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {STOCK_PRESETS.map((stock) => (
                    <button
                      type="button"
                      key={stock.label}
                      onClick={() => selectStockPreset(stock)}
                      className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-705 px-3 py-1 rounded-full transition font-semibold"
                    >
                      {stock.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Media Preview display */}
          {mediaUrl && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 p-2 group"
              id="uploaded-media-preview"
            >
              <button
                type="button"
                onClick={removeMedia}
                className="absolute top-4 right-4 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full p-1.5 transition overflow-hidden z-10"
              >
                <X className="w-4 h-4" />
              </button>

              {mediaType === 'image' ? (
                <img
                  src={mediaUrl}
                  alt="Post Attachment"
                  className="w-full max-h-72 object-cover rounded-xl"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="relative rounded-xl overflow-hidden">
                  <video
                    src={mediaUrl}
                    controls
                    className="w-full max-h-72 object-cover"
                  />
                  <div className="absolute left-3 bottom-3 bg-black/60 px-2 py-0.5 rounded text-[10px] text-white flex items-center gap-1 font-mono">
                    <Play className="w-3 h-3 fill-current" /> {t('publicSpace.post')}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={triggerImageUpload}
              disabled={isBlocked || isLimitReached}
              className="flex items-center gap-1.5 py-2 px-3 bg-slate-50/80 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-xl text-xs font-semibold select-none disabled:opacity-50 border border-slate-200/60 hover:border-emerald-250 transition-all duration-200 cursor-pointer shadow-xs"
            >
              <IconImage className="w-4 h-4 text-emerald-500" /> {t('publicSpace.post')}
            </button>
            <button
              type="button"
              onClick={triggerVideoUpload}
              disabled={isBlocked || isLimitReached}
              className="flex items-center gap-1.5 py-2 px-3 bg-slate-50/80 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 rounded-xl text-xs font-semibold select-none disabled:opacity-50 border border-slate-200/60 hover:border-indigo-250 transition-all duration-200 cursor-pointer shadow-xs"
            >
              <IconVideo className="w-4 h-4 text-indigo-500" /> {t('publicSpace.profile')}
            </button>
          </div>

          <div className="flex gap-2">
            {/* Quick random mock post generator for ease of scaling the board and demonstrating the full feed */}
            <button
              type="button"
              onClick={onAddRandomPost}
              className="py-2 px-3.5 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100/80 border border-slate-250 border-dashed transition-all duration-200 shadow-xs"
              title={t('publicSpace.randomPost')}
            >
              💡 {t('publicSpace.randomPost')}
            </button>
            <button
              type="submit"
              disabled={isBlocked || isLimitReached || (!content.trim() && !mediaUrl)}
              className={`py-2 px-5 font-bold text-xs rounded-xl transition duration-250 flex items-center gap-2 hover:scale-[1.02] transform shadow-md ${
                isBlocked || isLimitReached || (!content.trim() && !mediaUrl)
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-250 shadow-none hover:scale-100'
                  : 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 shadow-indigo-200/60'
              }`}
              id="submit-post-button"
            >
              {t('publicSpace.post')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}