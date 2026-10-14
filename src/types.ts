export interface UserProfile {
  uid: string;
  displayName: string;
  username: string;
  displayNameLower?: string;
  phoneNumber?: string;
  photoURL?: string;
  bio?: string;
  score67: number;
  followersCount: number;
  followingCount: number;
  createdAt?: string;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorHandle: string;
  authorPhoto?: string;
  caption: string;
  videoUrl?: string;
  soundTitle: string;
  memeTag?: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  viewsCount: number;
  createdAt: string;
  // Local/UI helper fields
  canvasAnimationType?: 'spinning_numbers' | 'glitch_matrix' | 'drill_beat' | 'meme_battle' | 'six_seven_dance' | 'custom_camera';
  customVideoUrl?: string;
  userLiked?: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  text: string;
  createdAt: string;
  likesCount?: number;
}

export interface ActivityNotification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'badge';
  actorName: string;
  actorPhoto?: string;
  message: string;
  targetId?: string;
  timeAgo: string;
  points67: number;
}
