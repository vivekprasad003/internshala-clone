/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, UserPlus, UserMinus, Check, Sparkles, Award, ShieldAlert, HeartHandshake } from 'lucide-react';
import { User } from "../types/types_p";
import { DIRECTORY_USERS } from '../data/data_p';
import { useLanguage } from '../context/LanguageContext';

interface FriendDirectoryProps {
  currentUser: User;
  onAddFriend: (friendId: string) => void;
  onRemoveFriend: (friendId: string) => void;
}

export default function FriendDirectory({ currentUser, onAddFriend, onRemoveFriend }: FriendDirectoryProps) {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');

  // We exclude the active user themselves from the directory rosters
  const eligibleRoster = DIRECTORY_USERS.filter(u => u.id !== currentUser.id);

  const filteredRoster = eligibleRoster.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm flex flex-col h-full" id="friend-directory-container">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{t('publicSpace.friendDirectory')}</h3>
            <p className="text-[11px] text-slate-400 font-mono">{t('publicSpace.friends')}</p>
          </div>
        </div>
        
        <span className="text-xs bg-slate-50 border border-slate-200 px-3 py-1 rounded-full font-mono font-bold text-indigo-600 flex items-center gap-1 shrink-0">
          🤝 {currentUser.friends.length} {t('publicSpace.friends')}
        </span>
      </div>

      {/* Limits tier progress visual guidance - Sleek Bento Segment */}
      <div className="mb-5 p-4 bg-gradient-to-tr from-slate-50 to-indigo-50/50 border border-slate-150 rounded-2xl text-xs space-y-2">
        <span className="font-bold text-indigo-950 flex items-center gap-1.5 font-mono uppercase tracking-wider text-[10px]">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" /> {t('publicSpace.connectionLimit')}
        </span>
        <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-[9px] font-bold text-slate-700">
          <div className={`p-1.5 rounded-xl border ${currentUser.friends.length === 0 ? 'bg-amber-100/80 border-amber-300 text-amber-955 shadow-xs' : 'bg-white border-slate-200'}`}>
            0 {t('publicSpace.friends')}<br/><span className="text-stone-500 font-extrabold text-[8px] uppercase">🚫 {t('systemInfo.blocked')}</span>
          </div>
          <div className={`p-1.5 rounded-xl border ${currentUser.friends.length === 1 ? 'bg-indigo-100/80 border-indigo-350 text-indigo-955 shadow-xs' : 'bg-white border-slate-200'}`}>
            1 {t('publicSpace.friends').slice(0, -1)}<br/><span className="text-indigo-600 font-extrabold text-[8px] uppercase">1 post/d</span>
          </div>
          <div className={`p-1.5 rounded-xl border ${currentUser.friends.length === 2 ? 'bg-indigo-100/80 border-indigo-355 text-indigo-955 shadow-xs' : 'bg-white border-slate-200'}`}>
            2 {t('publicSpace.friends')}<br/><span className="text-indigo-600 font-extrabold text-[8px] uppercase">2 posts/d</span>
          </div>
          <div className={`p-1.5 rounded-xl border ${currentUser.friends.length > 10 ? 'bg-amber-150/80 border-amber-300 text-amber-955 shadow-xs' : 'bg-white border-slate-200'}`}>
            {'>'}10 {t('publicSpace.friends')}<br/><span className="text-emerald-600 font-extrabold text-[8px] uppercase">♾️ Free</span>
          </div>
        </div>
      </div>

      {/* Directory Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('common.search')}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 py-2 text-xs focus:outline-none focus:bg-white text-slate-800 focus:ring-1 focus:ring-indigo-550 transition-colors"
          id="member-search-input"
        />
      </div>

      {/* Connections scroll list */}
      <div className="flex-1 overflow-y-auto max-h-[380px] space-y-2 pr-1" id="members-list">
        {filteredRoster.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            {t('common.noResults')}
          </div>
        ) : (
          filteredRoster.map((item) => {
            const isFriend = currentUser.friends.includes(item.id);
            return (
              <div
                key={item.id}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                  isFriend
                    ? 'bg-emerald-50/30 border-emerald-250 shadow-xs ring-1 ring-emerald-100'
                    : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-xs'
                }`}
                id={`directory-item-${item.id}`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-100"
                    referrerPolicy="no-referrer"
                  />
                  <div className="max-w-[130px] sm:max-w-xs">
                    <span className="block text-xs font-bold text-slate-900 truncate">{item.name}</span>
                    <span className="block text-[10px] text-slate-400 font-mono">@{item.username}</span>
                    <p className="text-[10px] text-slate-500 mt-0.5 truncate leading-relaxed">
                      {item.bio}
                    </p>
                  </div>
                </div>

                <div className="ml-2 shrink-0">
                  {isFriend ? (
                    <button
                      onClick={() => onRemoveFriend(item.id)}
                      className="group py-1.5 px-3 bg-emerald-50 hover:bg-rose-50 border border-emerald-200 hover:border-rose-200 text-emerald-700 hover:text-rose-700 font-bold text-xs rounded-xl transition flex items-center gap-1 select-none"
                      title={t('publicSpace.removeFriend')}
                    >
                      {/* Check toggles to minus when hover */}
                      <Check className="w-3.5 h-3.5 group-hover:hidden" />
                      <UserMinus className="w-3.5 h-3.5 hidden group-hover:block text-rose-500" />
                      <span className="group-hover:hidden select-none">{t('publicSpace.addFriend')}</span>
                      <span className="hidden group-hover:inline select-none">{t('publicSpace.removeFriend')}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onAddFriend(item.id)}
                      className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1 select-none"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>{t('publicSpace.addFriend')}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}