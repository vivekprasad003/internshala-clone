/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { Users, Info, Award, UserPlus, Sparkles, Check, ChevronRight, Pencil, X } from 'lucide-react';
import { User } from '../types/types_p';
import { getPostingLimitInfo, DIRECTORY_USERS } from '../data/data_p';
import { useLanguage } from '../context/LanguageContext';

interface UserSelectorProps {
  currentUser: User;
  allUsers: User[];
  onSelectUser: (user: User) => void;
  onAddCustomUser: (name: string, username: string) => void;
  onUpdateUserProfile: (userId: string, updatedFields: Partial<User>) => void;
}

export default function UserSelector({
  currentUser,
  allUsers,
  onSelectUser,
  onAddCustomUser,
  onUpdateUserProfile
}: UserSelectorProps) {
  const { t } = useLanguage();
  const [isAdding, setIsAdding] = React.useState(false);
  const [newName, setNewName] = React.useState('');
  const [newUsername, setNewUsername] = React.useState('');

  // Editing state for the active profile
  const [isEditing, setIsEditing] = React.useState(false);
  const [editName, setEditName] = React.useState(currentUser.name);
  const [editUsername, setEditUsername] = React.useState(currentUser.username);
  const [editBio, setEditBio] = React.useState(currentUser.bio || '');

  // Modal active state
  const [showFriendsModal, setShowFriendsModal] = React.useState(false);

  // Derive the accepted friends from the same state used by FriendDirectory (currentUser.friends)
  const resolvedFriends = React.useMemo(() => {
    const combined: User[] = [...allUsers];
    DIRECTORY_USERS.forEach((dirUser) => {
      if (!combined.some((u) => u.id === dirUser.id)) {
        combined.push({
          id: dirUser.id,
          name: dirUser.name,
          username: dirUser.username,
          avatar: dirUser.avatar,
          bio: dirUser.bio,
          friends: [],
          postsToday: [],
          joinedDate: 'Community Citizen'
        });
      }
    });

    const acceptedIds = currentUser.friends;
    return combined.filter((u) => acceptedIds.includes(u.id));
  }, [allUsers, currentUser.friends]);
  const profileImgInputRef = React.useRef<HTMLInputElement>(null);

  // (moved earlier) resolvedFriends is derived from currentUser.friends for real-time sync
  

  // Reset/sync edit form when user switches
  React.useEffect(() => {
    setEditName(currentUser.name);
    setEditUsername(currentUser.username);
    setEditBio(currentUser.bio || '');
    setIsEditing(false);
  }, [currentUser]);

  // Prevent background scroll and close on Escape when modal open
  React.useEffect(() => {
    if (!showFriendsModal) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowFriendsModal(false);
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [showFriendsModal]);

  const limitInfo = getPostingLimitInfo(currentUser.friends.length);
  const postsCount = currentUser.postsToday.length;
  const isLimited = limitInfo.limit !== 'unlimited';
  const remaining = isLimited ? Math.max(0, (limitInfo.limit as number) - postsCount) : '∞';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newUsername.trim()) return;
    onAddCustomUser(newName.trim(), newUsername.trim().toLowerCase().replace(/\s+/g, '_'));
    setNewName('');
    setNewUsername('');
    setIsAdding(false);
  };

  const handleSaveProfile = () => {
    if (!editName.trim() || !editUsername.trim()) return;
    onUpdateUserProfile(currentUser.id, {
      name: editName.trim(),
      username: editUsername.trim().toLowerCase().replace(/\s+/g, '_'),
      bio: editBio.trim()
    });
    setIsEditing(false);
  };

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      onUpdateUserProfile(currentUser.id, { avatar: reader.result as string });
    };
    reader.onerror = () => {
      alert('Could not read image file.');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden flex flex-col h-full" id="user-selector-container">
      {/* Active Profile Status (A custom nested beautiful Bento block) */}
      <div className="bg-gradient-to-br from-indigo-950 to-slate-900 p-6 text-white relative rounded-[2rem] m-2 shadow-md">
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          {isEditing ? (
            <>
              <button
                onClick={handleSaveProfile}
                type="button"
                className="p-1 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all duration-200 shadow-sm cursor-pointer"
                title={t('common.save')}
              >
                <Check className="w-3 h-3" /> {t('common.save')}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                type="button"
                className="p-1.5 bg-white/10 hover:bg-white/20 text-indigo-200 rounded-xl transition-all duration-200 cursor-pointer"
                title={t('common.cancel')}
              >
                <X className="w-3 h-3" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              type="button"
              className="p-1.5 bg-white/10 hover:bg-white/20 text-indigo-200 hover:text-white rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-1 text-[10.5px] font-bold"
              title={t('publicSpace.profile')}
            >
              <Pencil className="w-3 h-3" /> {t('publicSpace.profile')}
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {/* Editable Uploadable Profile Photo */}
          <div className="relative group cursor-pointer select-none" title="Upload custom avatar image">
            <motion.img
              key={currentUser.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-indigo-400/80 shadow-md group-hover:border-white transition-all duration-300"
              referrerPolicy="no-referrer"
              onClick={() => profileImgInputRef.current?.click()}
            />
            <div 
              onClick={() => profileImgInputRef.current?.click()}
              className="absolute inset-0 bg-black/55 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-[8px] font-mono uppercase tracking-wider text-indigo-200"
            >
              <Pencil className="w-3.5 h-3.5 mb-0.5 text-white animate-pulse" />
              <span>{t('common.edit')}</span>
            </div>
            <input
              type="file"
              ref={profileImgInputRef}
              onChange={handleProfileImageUpload}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-bold tracking-tight">
                {isEditing ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="bg-white/10 hover:bg-white/15 focus:bg-white/25 border border-white/20 focus:border-indigo-400 rounded-lg px-2 py-0.5 text-xs text-white font-bold focus:outline-none w-28 sm:w-32 placeholder-indigo-300 font-sans"
                    placeholder={t('publicSpace.profile')}
                    maxLength={30}
                    autoFocus
                  />
                ) : (
                  currentUser.name
                )}
              </h2>
              {!isEditing && currentUser.friends.length > 10 && (
                <span className="bg-amber-400 text-slate-950 text-[9px] uppercase font-mono tracking-wider font-extrabold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <Award className="w-2.5 h-2.5" /> Elite
                </span>
              )}
            </div>
            <p className="text-indigo-300 text-xs">
              {isEditing ? (
                <span className="flex items-center gap-0.5 mt-1 bg-white/5 border border-white/10 rounded-lg px-1.5 py-0.5">
                  <span className="text-[10px] text-indigo-400 font-mono">@</span>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="bg-transparent text-[11px] text-indigo-100 font-mono focus:outline-none w-24 sm:w-28 placeholder-indigo-400"
                    placeholder="handle"
                    maxLength={20}
                  />
                </span>
              ) : (
                `@${currentUser.username}`
              )}
            </p>
          </div>
        </div>

        {/* Dynamic Bio Description Area & "Show My Friends" Interactive Button */}
        <div className="mt-3 flex flex-col gap-2">
          <p className="text-xs text-indigo-100 italic leading-relaxed">
            {isEditing ? (
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                className="w-full bg-white/10 hover:bg-white/15 focus:bg-white/25 border border-white/20 focus:border-indigo-400 rounded-xl p-2 text-xs text-indigo-50 focus:outline-none leading-relaxed mt-1 font-sans resize-none"
                placeholder={t('publicSpace.bio')}
                rows={2}
                maxLength={120}
              />
            ) : (
              currentUser.bio || '"No bio written yet..."'
            )}
          </p>

          {!isEditing && (
            <button
              onClick={() => setShowFriendsModal(true)}
              type="button"
              className="mt-1.5 w-full py-2 px-3 bg-white/10 hover:bg-white/20 text-indigo-150 hover:text-white rounded-xl text-[10px] font-bold flex items-center justify-center gap-1.5 border border-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer shadow-xs font-mono uppercase tracking-widest"
              id="view-my-friends-btn"
            >
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t('publicSpace.friends')} ({currentUser.friends.length})</span>
            </button>
          )}
        </div>

        {/* Dynamic Friend Posting Allowance Metrics Bento-inside-Bento */}
        <div className="mt-4 p-4 bg-white/10 rounded-2xl border border-white/5 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="flex items-center gap-1.5 font-medium text-indigo-200">
              <Users className="w-3.5 h-3.5" /> {t('publicSpace.friends')}
            </span>
            <span className="font-mono text-white font-bold bg-indigo-500/30 px-2 py-0.5 rounded-full">
              {currentUser.friends.length} {currentUser.friends.length === 1 ? (t('publicSpace.friends').slice(0, -1)) : t('publicSpace.friends')}
            </span>
          </div>

          <div className="h-px bg-white/5" />

          <div className="flex justify-between items-center text-xs">
            <span className="flex items-center gap-1.5 font-medium text-emerald-400">
              <Award className="w-3.5 h-3.5" /> {t('publicSpace.connectionLimit')}
            </span>
            <span className="font-semibold text-white">
              {limitInfo.label}
            </span>
          </div>

          {/* Progress Indicator */}
          <div>
            <div className="flex justify-between items-center text-[11px] mb-1.5">
              <span className="text-indigo-200">{t('publicSpace.postsToday')}</span>
              <span className="font-mono text-indigo-300 font-medium">
                {postsCount} / {isLimited ? (limitInfo.limit as number) : '∞'}
              </span>
            </div>
            
            <div className="h-2 bg-slate-850 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-teal-400 to-indigo-400"
                initial={{ width: 0 }}
                animate={{ 
                  width: !isLimited 
                    ? '100%' 
                    : limitInfo.limit === 0 
                      ? '0%' 
                      : `${Math.min(100, (postsCount / (limitInfo.limit as number)) * 100)}%` 
                }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>

          <p className="text-[10px] text-indigo-200 leading-relaxed font-mono bg-white/5 p-2 rounded-lg">
            {limitInfo.description}
          </p>
        </div>
      </div>

      {/* Account Switching Drawer */}
      <div className="p-5 flex-1 flex flex-col justify-between" id="user-switch-panel">
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
            {t('publicSpace.switchAccount')}
          </h3>
          <div className="space-y-2">
            {allUsers.map((u) => {
              const isActive = u.id === currentUser.id;
              const fCount = u.friends.length;
              return (
                <button
                  key={u.id}
                  onClick={() => onSelectUser(u)}
                  className={`w-full text-left p-2.5 rounded-2xl border transition-all flex items-center justify-between ${
                    isActive
                      ? 'bg-slate-50 border-slate-300 shadow-sm ring-1 ring-slate-200'
                      : 'border-slate-100 hover:bg-slate-50/70 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-9 h-9 rounded-full object-cover shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="flex items-center gap-1">
                        <span className={`text-xs font-bold ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>
                          {u.name}
                        </span>
                        {isActive && <span className="bg-slate-200 text-slate-800 text-[8px] px-1 py-0.5 rounded font-extrabold uppercase font-mono">{t('publicSpace.profile')}</span>}
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {fCount} {fCount === 1 ? (t('publicSpace.friends').slice(0, -1)) : t('publicSpace.friends')} &bull; {t('publicSpace.connectionLimit')}: {fCount === 0 ? '0' : fCount > 10 ? '∞' : fCount}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Account Creator */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          {!isAdding ? (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100/80 text-slate-700 font-semibold text-xs rounded-2xl transition flex items-center justify-center gap-1.5 border border-slate-200"
              id="add-profile-btn"
            >
              <UserPlus className="w-4 h-4 text-indigo-600" /> {t('publicSpace.addCustomUser')}
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9 px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-mono">
                    {t('publicSpace.profile')}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Sam"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white text-slate-850"
                  />
                </div>
                <div>
                  <label className="block text-[9 p x] font-bold text-slate-400 uppercase tracking-widest mb-1 font-mono">
                    {t('publicSpace.profile')}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="sam_s"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white text-slate-850"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="w-1/2 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 rounded-xl transition"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition shadow-sm"
                >
                  {t('common.save')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Connected Friends Modal Overlay */}
      {showFriendsModal && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setShowFriendsModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-white rounded-[2rem] shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-indigo-900 to-indigo-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-300" />
                <div>
                  <h3 className="text-sm font-bold">{t('publicSpace.friends')}</h3>
                  <p className="text-[10px] text-indigo-200 font-mono">{t('publicSpace.friendDirectory')}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowFriendsModal(false)}
                className="p-1.5 bg-white/10 hover:bg-white/20 text-indigo-100 hover:text-white rounded-xl transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>             {/* Content list */}
            <div className="p-6 max-h-[350px] overflow-y-auto space-y-3">
              {resolvedFriends.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 animate-pulse" />
                  </div>
                  <p className="text-xs font-bold text-slate-800">{t('publicSpace.noFriends')}</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                    {t('publicSpace.friendDirectory')}
                  </p>
                </div>
              ) : (
                resolvedFriends.map(friend => (
                  <div 
                    key={friend.id} 
                    className="p-3 bg-slate-50/70 border border-slate-150 rounded-2xl flex items-center justify-between hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <img 
                        src={friend.avatar} 
                        alt={friend.name} 
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <span className="block text-xs font-bold text-slate-900 leading-none">{friend.name}</span>
                        <span className="block text-[10px] text-indigo-500 font-mono mt-0.5">@{friend.username}</span>
                        {friend.bio && (
                          <p className="text-[10px] text-slate-500 mt-1 line-clamp-1 leading-normal max-w-[180px]">
                            {friend.bio}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-150 font-mono text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5 animate-fade-in">
                      <Check className="w-2.5 h-2.5" /> {t('publicSpace.addFriend')}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setShowFriendsModal(false)}
                className="py-2 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-xs cursor-pointer"
              >
                {t('common.close')}
              </button>
            </div>
          </motion.div>
        </div>
      , document.body)}
    </div>
  );
}