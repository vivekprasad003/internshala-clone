/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  friends: string[]; // List of user IDs that are friends
  postsToday: string[]; // List of post IDs created today to enforce the daily limit
  bio?: string;
  joinedDate: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  mediaUrl?: string; // Data URL or object URL or placeholder image URL
  mediaType?: 'image' | 'video' | 'none';
  createdAt: string;
  likes: string[]; // Array of user IDs who liked this post
  comments: Comment[];
  sharesCount: number;
}