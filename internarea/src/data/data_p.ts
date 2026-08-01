/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Post } from '../types/types_p';

// Let's create some standard public stock media links for the preloaded feed
export const PRELOADED_POSTS: Post[] = [
  {
    id: 'post_1',
    userId: 'user_jordan',
    userName: 'Jordan Miller',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150',
    content: 'Loving the morning sunshine in the city! ☀️ Had to capture this view on my way to work.',
    mediaUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800',
    mediaType: 'image',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    likes: ['user_taylor', 'user_bailey'],
    comments: [
      {
        id: 'comment_1_1',
        userId: 'user_taylor',
        userName: 'Taylor Chen',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150',
        content: 'Wow, the lighting is absolutely gorgeous!',
        createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString()
      },
      {
        id: 'comment_1_2',
        userId: 'user_bailey',
        userName: 'Bailey Quinn',
        userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150',
        content: 'Where is this cafe? I want to visit!',
        createdAt: new Date(Date.now() - 3600000 * 1).toISOString()
      }
    ],
    sharesCount: 3
  },
  {
    id: 'post_2',
    userId: 'user_morgan',
    userName: 'Morgan Reed',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150',
    content: 'Just finished editing this short travel clip from my trip to the Pacific Northwest. The misty pine trees are magical! 🌲⛰️',
    // Using a reliable sample video
    mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4',
    mediaType: 'video',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(), // 6 hours ago
    likes: ['user_jordan', 'user_reagan'],
    comments: [
      {
        id: 'comment_2_1',
        userId: 'user_alex',
        userName: 'Alex Mercer',
        userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150&h=150',
        content: 'Breathtaking! The video quality is amazing. Makes me want to go hiking.',
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
      }
    ],
    sharesCount: 7
  },
  {
    id: 'post_3',
    userId: 'user_reagan',
    userName: 'Reagan Vance',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150',
    content: 'Cooking up some fresh handmade pasta tonight! Recipe in the comments if anyone wants to try it. 🍝',
    mediaUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=800',
    mediaType: 'image',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(), // 12 hours ago
    likes: ['user_jordan', 'user_morgan', 'user_taylor'],
    comments: [
      {
        id: 'comment_3_1',
        userId: 'user_jordan',
        userName: 'Jordan Miller',
        userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150',
        content: 'Oh yes, please drop the recipe! Looks delicious.',
        createdAt: new Date(Date.now() - 3600000 * 11).toISOString()
      }
    ],
    sharesCount: 1
  }
];

// Presets representing different levels of friend connections to easily test limits
export const PRESET_USERS: User[] = [
  {
    id: 'user_alex',
    name: 'Alex Mercer',
    username: 'alex_mercer',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150&h=150',
    friends: [], // 0 friends -> Cannot post
    postsToday: [],
    bio: 'Fascinated by system design and digital art. Just joined the community! Looking for friends.',
    joinedDate: 'June 2026'
  },
  {
    id: 'user_bailey',
    name: 'Bailey Quinn',
    username: 'bailey_q',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150',
    friends: ['user_taylor'], // 1 friend -> 1 post/day
    postsToday: [],
    bio: 'Avid book reader, plant lover, and weekend baker. 🌿📖',
    joinedDate: 'May 2026'
  },
  {
    id: 'user_taylor',
    name: 'Taylor Chen',
    username: 'taylor_c',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150',
    friends: ['user_bailey', 'user_jordan'], // 2 friends -> 2 posts/day
    postsToday: [],
    bio: 'Photographer and architecture enthusiast. Based in SF.',
    joinedDate: 'March 2026'
  },
  {
    id: 'user_jordan',
    name: 'Jordan Miller',
    username: 'jordan_m',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150',
    friends: [
      'user_bailey',
      'user_taylor',
      'user_morgan',
      'user_reagan',
      'user_directory_1',
      'user_directory_2',
      'user_directory_3',
      'user_directory_4',
      'user_directory_5',
      'user_directory_6',
      'user_directory_7',
      'user_directory_8'
    ], // 12 friends (>10) -> Unlimited posts
    postsToday: [],
    bio: 'Community builder, coffee lover, and digital strategist.',
    joinedDate: 'January 2025'
  }
];

// Additional standard directory of users available for making friends and scaling posting limits
export interface DirectoryUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
}

export const DIRECTORY_USERS: DirectoryUser[] = [
  {
    id: 'user_morgan',
    name: 'Morgan Reed',
    username: 'morgan_reed',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150',
    bio: 'Videographer & wanderer of high places.'
  },
  {
    id: 'user_reagan',
    name: 'Reagan Vance',
    username: 'reagan_v',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150',
    bio: 'Home cook, foodie blogger, pasta master.'
  },
  {
    id: 'user_directory_1',
    name: 'Robin Brooks',
    username: 'robin_b',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150',
    bio: 'UI designer and vintage keyboard collector.'
  },
  {
    id: 'user_directory_2',
    name: 'Casey Paton',
    username: 'casey_p',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=150&h=150',
    bio: 'Cyclist, coffee geek, and software engineer.'
  },
  {
    id: 'user_directory_3',
    name: 'Avery Lane',
    username: 'avery_lane',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150&h=150',
    bio: 'Writer, storyteller, and vinyl record hoarder.'
  },
  {
    id: 'user_directory_4',
    name: 'Jamie Wood',
    username: 'jamie_w',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150&h=150',
    bio: 'Freelance illustrator who paints monsters.'
  },
  {
    id: 'user_directory_5',
    name: 'Skyler Webb',
    username: 'sky_webb',
    avatar: 'https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&q=80&w=150&h=150',
    bio: 'Nature therapist and sunset chaser. Let\'s hike!'
  },
  {
    id: 'user_directory_6',
    name: 'Drew Dalton',
    username: 'drew_d',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150&h=150',
    bio: 'Podcaster discussing ambient music science.'
  },
  {
    id: 'user_directory_7',
    name: 'Pat Harlow',
    username: 'pat_harlow',
    avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=150&h=150',
    bio: 'Dog foster parent and mechanical engineer.'
  },
  {
    id: 'user_directory_8',
    name: 'Sandy Finch',
    username: 'sandy_finch',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=150&h=150',
    bio: 'artist obsessed with blue and white patterns.'
  }
];

// Helper to determine active user limits
export function getPostingLimitInfo(friendsCount: number): {
  limit: number | 'unlimited';
  label: string;
  description: string;
} {
  if (friendsCount === 0) {
    return {
      limit: 0,
      label: '0 posts/day (Restricted)',
      description: 'You cannot post content. Add a friend to unlock posting!'
    };
  } else if (friendsCount === 1) {
    return {
      limit: 1,
      label: '1 post/day',
      description: 'You can post once per day. Add another friend to increase your daily limit.'
    };
  } else if (friendsCount === 2) {
    return {
      limit: 2,
      label: '2 posts/day',
      description: 'You can post twice per day. Add more friends to widen your reach!'
    };
  } else if (friendsCount > 10) {
    return {
      limit: 'unlimited',
      label: 'Unlimited posts/day (Elite)',
      description: 'Amazing! Since you have over 10 friends, you have unlocked unlimited daily posting!'
    };
  } else {
    // 3 to 10 friends. Let's make it N posts per day for N friends.
    return {
      limit: friendsCount,
      label: `${friendsCount} posts/day`,
      description: `You have ${friendsCount} friends. Add more connections to get up to 10, or exceed 10 for completely Unlimited posting!`
    };
  }
}