"use client";

import React, { useState, useEffect, useRef, type FC } from "react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Heart, 
  MessageCircle, 
  Share2, 
  Image as ImageIcon, 
  Video, 
  SmilePlus, 
  Bell, 
  UserPlus, 
  UserCheck, 
  MoreHorizontal,
  Bookmark,
  PenSquare,
  User,
  Settings,
  LogOut,
  HelpCircle,
  Send,
  RefreshCw,
  Trash2
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import CachedImage from "@/components/ui/cached-image";
import { useLanguage } from "@/components/providers/language-provider";
import { socialTranslations, formatTranslation } from "@/app/locales/social";
import { formatDate } from "@/lib/utils/format-date";
import { getFromCache, saveToCache } from "@/lib/utils/cache";

// Local storage keys for posts and profiles
const POSTS_CACHE_KEY = 'social_posts';
const PROFILE_CACHE_KEY = 'social_profile';

// Simple replacement functions for the missing cache functions
function getCachedPosts(): any[] {
  return getFromCache<any[]>(POSTS_CACHE_KEY) || [];
}

function savePostsToCache(posts: any[]) {
  saveToCache(POSTS_CACHE_KEY, posts);
}

function savePostImageToCache(postId: string, imageIndex: number, dataUrl: string) {
  const posts = getCachedPosts();
  const updatedPosts = posts.map(post => {
    if (post.id === postId) {
      if (!post.imageCache) post.imageCache = {};
      post.imageCache[`${imageIndex}`] = dataUrl;
    }
    return post;
  });
  savePostsToCache(updatedPosts);
}

function getCachedProfileData(): any {
  return getFromCache<any>(PROFILE_CACHE_KEY) || DEFAULT_USER;
}

function saveProfileDataToCache(profileData: any) {
  saveToCache(PROFILE_CACHE_KEY, profileData);
}

// Add a new function for saving profile images to cache
function saveProfileImageToCache(profileId: string, dataUrl: string) {
  const profile = getCachedProfileData();
  profile.profileImageBase64 = dataUrl;
  saveProfileDataToCache(profile);
}

// Default user data structure
const DEFAULT_USER = {
  id: "user1",
  name: "Your Name",
  description: "Fitness enthusiast | Weight loss journey",
  profileImage: "https://i.pravatar.cc/150?img=10",
  stats: {
    posts: 124,
    friends: 845,
    groups: 15,
  },
};

// Post interface
interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
  likes: number;
}

interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  images: string[];
  timestamp: string;
  updatedAt?: string;
  likes: number;
  likedBy: string[];
  comments: Comment[];
  imageCache?: Record<string, string>;
}

// Friend suggestions
const MOCK_FRIENDS = [
  { id: "friend1", name: "Jessica Lee", avatar: "https://i.pravatar.cc/150?img=6", mutualFriends: 3 },
  { id: "friend2", name: "Thomas Smith", avatar: "https://i.pravatar.cc/150?img=7", mutualFriends: 5 },
  { id: "friend3", name: "Maria Garcia", avatar: "https://i.pravatar.cc/150?img=8", mutualFriends: 2 },
];

// Mock groups
const MOCK_GROUPS = [
  { id: "group1", name: "Weight Loss Support", members: 1240 },
  { id: "group2", name: "Healthy Recipes", members: 856 },
  { id: "group3", name: "Keto Diet Community", members: 2340 },
];

// Mock notifications
const MOCK_NOTIFICATIONS = [
  {
    id: "notif1",
    user: { name: "Mike Chen", avatar: "https://i.pravatar.cc/150?img=2" },
    action: "liked your post",
    time: "2 hours ago",
    read: false
  },
  {
    id: "notif2",
    user: { name: "Lisa Wong", avatar: "https://i.pravatar.cc/150?img=3" },
    action: "commented on your post",
    time: "5 hours ago",
    read: false
  },
  {
    id: "notif3",
    user: { name: "David Martinez", avatar: "https://i.pravatar.cc/150?img=4" },
    action: "sent you a friend request",
    time: "1 day ago",
    read: true
  },
];

// Post component
const Post = ({ post, userData, onUpdate }: { post: Post; userData: any; onUpdate: () => void }) => {
  const { locale } = useLanguage();
  const t = socialTranslations[locale as keyof typeof socialTranslations] || socialTranslations.en;

  const [liked, setLiked] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Track scroll position to close dropdown when scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (dropdownOpen) {
        setDropdownOpen(false);
      }
    };
    
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Clean up event listener
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [dropdownOpen]);

  // Check if user already liked this post
  useEffect(() => {
    if (post.likedBy?.includes(userData.id)) {
      setLiked(true);
    }
  }, [post, userData.id]);

  // เช็คว่าเป็นเจ้าของโพสต์หรือไม่
  const isOwnPost = post.userId === userData.id;

  const handleLike = async () => {
    try {
      const response = await fetch('/api/posts/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: post.id,
          userId: userData.id,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setLiked(data.liked);
          onUpdate(); // Refresh posts
        }
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleEditPost = async () => {
    if (editedContent.trim() === '') return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/posts/edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: post.id,
          content: editedContent,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setIsEditing(false);
          onUpdate(); // Refresh posts
          toast({
            title: "Post updated",
            description: "Your post has been updated successfully!"
          });
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to update post. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating post:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch('/api/posts/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: post.id
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          onUpdate(); // Refresh posts
          toast({
            title: "Post deleted",
            description: "Your post has been deleted successfully!"
          });
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to delete post. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/posts/comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: post.id,
          userId: userData.id,
          content: commentText,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCommentText('');
          onUpdate(); // Refresh posts
          setIsCommenting(true); // Keep comment section open to see the new comment
        }
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] mb-6 overflow-hidden"
      variants={item}
    >
      {/* Post header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={post.userAvatar} alt={post.userName} />
            <AvatarFallback>{post.userName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{post.userName}</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              {formatDate(post.timestamp, locale)}
              {post.updatedAt && (
                <span> · {t.edited} {formatDate(post.updatedAt, locale)}</span>
              )}
            </p>
          </div>
        </div>
        {isOwnPost && (
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {
                setIsEditing(true);
                setEditedContent(post.content);
                setDropdownOpen(false);
              }}>
                <PenSquare className="mr-2 h-4 w-4" />
                <span>{t.editPost}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {
                handleDeletePost();
                setDropdownOpen(false);
              }} className="text-red-500">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>{t.deletePost}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Post content */}
      <div className="px-4 pb-3">
        {isEditing ? (
          <div className="space-y-3">
            <Textarea 
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full min-h-[100px]"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  setEditedContent(post.content);
                }}
                disabled={isSubmitting}
              >
                {t.cancel}
              </Button>
              <Button
                size="sm"
                onClick={handleEditPost}
                disabled={isSubmitting || editedContent.trim() === ''}
              >
                {isSubmitting ? t.posting : t.post}
              </Button>
            </div>
          </div>
        ) : (
        <p>{post.content}</p>
        )}
      </div>

      {/* Post stats */}
      <div className="flex items-center justify-between border-t border-[hsl(var(--border))] px-4 py-2">
        <div className="flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))]">
          <Heart 
            className="h-4 w-4" 
            fill={liked ? "hsl(var(--primary))" : "none"}
            color={liked ? "hsl(var(--primary))" : "currentColor"}
          />
          <span>{formatTranslation(t.likes, { count: post.likes })}</span>
        </div>
        <div className="text-sm text-[hsl(var(--muted-foreground))]">
          {formatTranslation(t.comments, { count: post.comments.length })}
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-3 border-t border-[hsl(var(--border))]">
        <Button 
          variant="ghost" 
          className="flex gap-2 rounded-none py-2"
          onClick={handleLike}
        >
          <Heart 
            className={liked ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--muted-foreground))]"} 
            fill={liked ? "hsl(var(--primary))" : "none"} 
          />
          {t.like}
        </Button>
        <Button 
          variant="ghost" 
          className="flex gap-2 rounded-none py-2"
          onClick={() => setIsCommenting(!isCommenting)}
        >
          <MessageCircle className="h-5 w-5" />
          {t.comment}
        </Button>
        <Button variant="ghost" className="flex gap-2 rounded-none py-2">
          <Share2 className="h-5 w-5" />
          {t.share}
        </Button>
      </div>

      {/* Comments */}
      {(isCommenting || post.comments.length > 0) && (
        <div className="border-t border-[hsl(var(--border))] p-4">
          {post.comments.map((comment) => (
            <div key={comment.id} className="mb-3 flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.userAvatar} alt={comment.userName} />
                <AvatarFallback>{comment.userName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="rounded-lg bg-[hsl(var(--muted))] px-3 py-2">
                  <p className="text-sm font-medium">{comment.userName}</p>
                  <p className="text-sm">{comment.content}</p>
                </div>
                <div className="mt-1 flex gap-4 text-xs text-[hsl(var(--muted-foreground))]">
                  <button>{t.like}</button>
                  <button>{t.comment}</button>
                  <span>{formatDate(comment.timestamp, locale)}</span>
                </div>
              </div>
            </div>
          ))}
          
          {/* Add comment */}
          <div className="mt-3 flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={userData.profileImage} alt={userData.name} />
              <AvatarFallback>{userData.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder={t.writeAComment}
                className="w-full rounded-full bg-[hsl(var(--muted))] pr-10"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitComment();
                  }
                }}
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={handleSubmitComment}
                disabled={!commentText.trim() || isSubmitting}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Friend suggestion component
const FriendSuggestion = ({ friend }: { friend: any }) => {
  const { locale } = useLanguage();
  const t = socialTranslations[locale as keyof typeof socialTranslations] || socialTranslations.en;
  const [friendStatus, setFriendStatus] = useState<"none" | "requested" | "friends">("none");

  return (
    <motion.div 
      className="flex items-center justify-between mb-3 last:mb-0"
      variants={item}
    >
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={friend.avatar} alt={friend.name} />
          <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{friend.name}</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            {formatTranslation(t.mutualFriends, { count: friend.mutualFriends })}
          </p>
        </div>
      </div>
      <Button
        variant={friendStatus === "none" ? "default" : "outline"}
        size="sm"
        onClick={() => setFriendStatus(friendStatus === "none" ? "requested" : "none")}
      >
        {friendStatus === "none" ? t.addFriend : t.requested}
      </Button>
    </motion.div>
  );
};

// Create Post component
const CreatePost = ({ userData, onPostCreated }: { userData: any; onPostCreated: () => void }) => {
  const { locale } = useLanguage();
  const t = socialTranslations[locale as keyof typeof socialTranslations] || socialTranslations.en;
  const [postContent, setPostContent] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreatePost = async () => {
    if (!postContent.trim()) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userData.id,
          content: postContent,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPostContent('');
          setIsExpanded(false);
          onPostCreated(); // Refresh posts
          toast({
            title: t.post,
            description: t.postCreated
          });
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to create post. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4 mb-6"
      variants={item}
    >
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={userData.profileImage} alt={userData.name} />
          <AvatarFallback>{userData.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div 
          className="flex-1 rounded-full bg-[hsl(var(--muted))] px-4 py-2 cursor-text"
          onClick={() => setIsExpanded(true)}
        >
          <p className="text-[hsl(var(--muted-foreground))]">
            {t.whatsOnYourMind}
          </p>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-3">
          <Textarea
            placeholder={t.whatsOnYourMind}
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            className="mb-3 min-h-[100px]"
          />

          <div className="flex flex-wrap gap-2 mb-3">
            <Button variant="outline" size="sm" className="gap-1">
              <ImageIcon className="h-4 w-4" />
              <span>{t.photo}</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-1">
              <Video className="h-4 w-4" />
              <span>{t.video}</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-1">
              <SmilePlus className="h-4 w-4" />
              <span>{t.activity}</span>
            </Button>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsExpanded(false);
                setPostContent('');
              }}
              disabled={isSubmitting}
            >
              {t.cancel}
            </Button>
            <Button
              disabled={!postContent.trim() || isSubmitting}
              onClick={handleCreatePost}
            >
              {isSubmitting ? t.posting : t.post}
            </Button>
          </div>
        </div>
      )}

      {!isExpanded && (
        <div className="grid grid-cols-3 border-t border-[hsl(var(--border))] mt-3 pt-3">
          <Button
            variant="ghost"
            className="flex gap-2"
            onClick={() => setIsExpanded(true)}
          >
            <ImageIcon className="h-5 w-5 text-green-500" />
            {t.photo}
          </Button>
          <Button
            variant="ghost"
            className="flex gap-2"
            onClick={() => setIsExpanded(true)}
          >
            <Video className="h-5 w-5 text-blue-500" />
            {t.video}
          </Button>
          <Button
            variant="ghost"
            className="flex gap-2"
            onClick={() => setIsExpanded(true)}
          >
            <SmilePlus className="h-5 w-5 text-yellow-500" />
            {t.activity}
          </Button>
        </div>
      )}
    </motion.div>
  );
};

// Notification component for dropdown
const NotificationItem = ({ notification }: { notification: any }) => {
  return (
    <motion.div 
      className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md cursor-pointer"
      variants={item}
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={notification.user.avatar} alt={notification.user.name} />
        <AvatarFallback>{notification.user.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-tight">
          <span className="font-medium">{notification.user.name}</span>{' '}
          {notification.action}
        </p>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">{notification.time}</p>
      </div>
      {!notification.read && (
        <div className="h-2 w-2 rounded-full bg-[hsl(var(--primary))]"></div>
      )}
    </motion.div>
  );
};

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

export default function SocialClub() {
  const { locale } = useLanguage();
  const t = socialTranslations[locale as keyof typeof socialTranslations] || socialTranslations.en;
  
  const [activeTab, setActiveTab] = useState("feed");
  const router = useRouter();
  const [userData, setUserData] = useState(DEFAULT_USER);
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [postImages, setPostImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Count unread notifications
  const unreadCount = MOCK_NOTIFICATIONS.filter(n => !n.read).length;

  // Fetch user data
    const fetchUserData = async () => {
    if (isLoading) return;
    
    if (isLoading) return;
    
    // Use cached data first
    const cachedProfile = getCachedProfileData();
    if (cachedProfile) {
      setUserData(cachedProfile);
    }
    
    try {
      const response = await fetch("/api/update-profile");
      if (!response.ok) throw new Error("Failed to fetch user data");
        
        const data = await response.json();
        
        if (data.success && data.user) {
        setUserData(data.user);
        
        // Save user data to cache
        saveProfileDataToCache(data.user);
        
        // Save profile image to cache (if exists)
        if (data.user.profileImageBase64) {
          saveProfileImageToCache(data.user.id, data.user.profileImageBase64);
        }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
    }
  };

  // Fetch posts
  const fetchPosts = async (useCacheOnly = false) => {
    if (isLoading) return;
    
    if (isLoading) return;
    
    try {
      // Show posts from cache first
      const cachedPosts = getCachedPosts();
      if (cachedPosts && cachedPosts.length > 0) {
        setPosts(cachedPosts);
        setIsLoading(false);
      }
      
      // If only cache is needed, return
      if (useCacheOnly) return;
      
      // Fetch posts from API along with data for caching
      const response = await fetch(`/api/posts?cache=true`);
      if (!response.ok) throw new Error("Failed to fetch posts");
      
      const data = await response.json();
      
      if (data.success && data.posts) {
        setPosts(data.posts);
        
        // Save posts to cache
        savePostsToCache(data.posts);
        
        // Save post images to cache
        data.posts.forEach((post: Post) => {
          if (post.imageCache) {
            Object.entries(post.imageCache).forEach(([url, base64]) => {
              const postId = post.id;
              const imageIndex = parseInt(url);
              if (!isNaN(imageIndex)) {
                savePostImageToCache(postId, imageIndex, base64 as string);
              }
            });
          }
        });
        
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast({
        title: "Error",
        description: "Failed to load posts. Please try again later.",
        variant: "destructive",
      });
    }
  };
  
  // Load posts and user data when session changes
  useEffect(() => {
    // Fetch cached data first
    fetchPosts(true);
    fetchUserData();
    
    // Then fetch new data
    fetchPosts();
  }, []);

  // Function to handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const files = Array.from(e.target.files);
    
    // Check if user is trying to upload more than 4 images
    if (postImages.length + files.length > 4) {
      toast({
        title: "Too many images",
        description: "You can only upload up to 4 images per post.",
        variant: "destructive",
      });
      return;
    }
    
    // Process each file
    const newImages = [...postImages];
    const newImageUrls = [...imageUrls];
    
    files.forEach((file) => {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Only image files are allowed.",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Image files must be less than 5MB.",
          variant: "destructive",
        });
        return;
      }
      
      newImages.push(file);
      newImageUrls.push(URL.createObjectURL(file));
    });
    
    setPostImages(newImages);
    setImageUrls(newImageUrls);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Function to remove an image
  const removeImage = (index: number) => {
    // Remove from state
    const newImages = [...postImages];
    const newImageUrls = [...imageUrls];
    
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(newImageUrls[index]);
    
    newImages.splice(index, 1);
    newImageUrls.splice(index, 1);
    
    setPostImages(newImages);
    setImageUrls(newImageUrls);
  };

  // Function to handle post creation
  const handleCreatePost = async () => {
    if (!newPostContent.trim() && postImages.length === 0) {
      toast({
        title: "Empty post",
        description: "Please add some text or an image to your post.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 1. First, upload images (if any)
      const imageIds = [];
      
      for (const image of postImages) {
        const formData = new FormData();
        formData.append("file", image);
        
        const uploadResponse = await fetch("/api/posts/upload-image", {
          method: "POST",
          body: formData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error("Failed to upload image");
        }
        
        const imageData = await uploadResponse.json();
        
        if (imageData.success && imageData.imageId) {
          imageIds.push(imageData.imageId);
        }
      }
      
      // 2. Create the post with image IDs
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newPostContent,
          imageIds: imageIds.length > 0 ? imageIds : undefined,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to create post");
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Add the new post to the beginning of the posts array
        setPosts([data.post, ...posts]);
        setNewPostContent("");
        setPostImages([]);
        setImageUrls([]);
        
        // Update the cached posts
        savePostsToCache([data.post, ...posts]);
        
        toast({
          title: t.post,
          description: t.postCreated
        });
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to handle post liking
  const handleLikePost = async (postId: string) => {
    try {
      // Optimistic update
      const updatedPosts = posts.map((post) => {
        if (post.id === postId) {
          const userId = userData.id;
          const alreadyLiked = post.likedBy.includes(userId);
          
          return {
            ...post,
            likes: alreadyLiked ? post.likes - 1 : post.likes + 1,
            likedBy: alreadyLiked
              ? post.likedBy.filter((id) => id !== userId)
              : [...post.likedBy, userId],
          };
        }
        return post;
      });
      
      setPosts(updatedPosts);
      
      // Update the cached posts
      savePostsToCache(updatedPosts);
      
      // Send the like request to the server
      const response = await fetch("/api/posts/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to like post");
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || "Failed to like post");
      }
    } catch (error) {
      console.error("Error liking post:", error);
      // Revert the optimistic update if there was an error
      fetchPosts();
      toast({
        title: "Error",
        description: "Failed to like post. Please try again later.",
        variant: "destructive",
      });
    }
  };

  // Function to add a comment to a post
  const handleAddComment = async (postId: string, commentContent: string) => {
    if (!commentContent.trim()) {
      toast({
        title: "Empty comment",
        description: "Please add some text to your comment.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const response = await fetch("/api/posts/comment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          content: commentContent,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to add comment");
      }
      
      const data = await response.json();
      
      if (data.success && data.comment) {
        // Add the new comment to the post
        const updatedPosts = posts.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              comments: [...post.comments, data.comment],
            };
          }
          return post;
        });
        
        setPosts(updatedPosts);
        
        // Update the cached posts
        savePostsToCache(updatedPosts);
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again later.",
        variant: "destructive",
      });
    }
  };

  // Function to format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Function to navigate to user profile
  const goToProfile = (userId: string) => {
    // Check if it's the current user
    if (userData.id === userId) {
      router.push("/social/profile");
    } else {
      router.push(`/social/profile/${userId}`);
    }
  };

  const isPostLikedByUser = (post: Post) => {
    return post.likedBy.includes(userData.id);
  };

  const renderCommentForm = (postId: string) => {
    const [commentContent, setCommentContent] = useState("");
    
    const handleSubmitComment = (e: React.FormEvent) => {
      e.preventDefault();
      handleAddComment(postId, commentContent);
      setCommentContent("");
    };
    
    return (
      <form onSubmit={handleSubmitComment} className="mt-2 flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={userData.profileImage} alt="Profile" />
          <AvatarFallback>{userData.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <input
          type="text"
          value={commentContent}
          onChange={(e) => setCommentContent(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 rounded-full bg-muted px-4 py-2 text-sm"
        />
        <Button size="sm" type="submit" variant="ghost" className="h-8 w-8 p-0">
          <MessageCircle className="h-4 w-4" />
          <span className="sr-only">Submit comment</span>
        </Button>
      </form>
    );
  };

  // Fix the sign-out action in the profile section
  const handleSignOut = () => {
    router.push('/dashboard');
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">
      <RefreshCw className="w-10 h-10 animate-spin text-primary" />
    </div>;
  }

  return (
    <Container>
      <motion.div 
        className="py-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div 
          className="flex items-center justify-between mb-6"
          variants={item}
        >
          <h1 className="text-xl font-bold">{t.social}</h1>
          
          {/* Header right actions */}
          <div className="flex items-center gap-2">
            {/* Notifications dropdown */}
            <motion.div variants={item}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative" size="icon">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="flex items-center justify-between px-3 py-2">
                    <h3 className="font-medium">Notifications</h3>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                      Mark all as read
                    </Button>
                  </div>
                  <ScrollArea className="h-80">
                    <div className="px-1 py-2">
                      {MOCK_NOTIFICATIONS.map((notification, i) => (
                        <NotificationItem key={i} notification={notification} />
                      ))}
                    </div>
                  </ScrollArea>
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>

            {/* Settings dropdown */}
            <motion.div variants={item}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Help</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t.signOut}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>
          </div>
        </motion.div>

        <motion.div variants={item}>
          <Tabs defaultValue="feed" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="feed">{t.feed}</TabsTrigger>
              <TabsTrigger value="friends">{t.friends}</TabsTrigger>
              <TabsTrigger value="groups">{t.groups}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="feed" className="mt-0">
              <div className="flex flex-col lg:flex-row gap-6">
                <motion.div 
                  className="w-full lg:w-2/3"
                  variants={container}
                >
                  <CreatePost userData={userData} onPostCreated={fetchPosts} />
                  
                  {isLoading ? (
                    <motion.div 
                      className="w-full flex justify-center py-10"
                      variants={item}
                    >
                      <RefreshCw className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
                    </motion.div>
                  ) : posts.length > 0 ? (
                    <AnimatePresence>
                      {posts.map((post) => (
                        <Post 
                          key={post.id} 
                          post={post} 
                          userData={userData}
                          onUpdate={fetchPosts}
                        />
                      ))}
                    </AnimatePresence>
                  ) : (
                    <motion.div 
                      className="text-center py-10 text-gray-500"
                      variants={item}
                    >
                      No posts yet
                    </motion.div>
                  )}
                </motion.div>
                
                {/* Right sidebar */}
                <motion.div 
                  className="hidden lg:block lg:w-1/3"
                  variants={item}
                >
                  <div className="sticky top-6 space-y-6">
                    {/* Profile card */}
                    <motion.div 
                      className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] overflow-hidden"
                      variants={item}
                    >
                      <div className="relative h-24 bg-gradient-to-r from-blue-500 to-purple-500">
                        <div className="absolute -bottom-10 left-4">
                          <Avatar className="h-20 w-20 border-4 border-[hsl(var(--background))]">
                            <AvatarImage src={userData.profileImage} alt={userData.name} />
                            <AvatarFallback>{userData.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        </div>
                      </div>
                      <div className="pt-12 pb-4 px-4">
                        <h3 className="font-semibold text-lg">{userData.name}</h3>
                        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">
                          {userData.description}
                        </p>
                        <div className="flex justify-between text-sm">
                          <div>
                            <p className="font-semibold">{userData.stats?.friends || 0}</p>
                            <p className="text-[hsl(var(--muted-foreground))]">Friends</p>
                          </div>
                          <div>
                            <p className="font-semibold">{userData.stats?.groups || 0}</p>
                            <p className="text-[hsl(var(--muted-foreground))]">Groups</p>
                          </div>
                          <div>
                            <p className="font-semibold">{userData.stats?.posts || 0}</p>
                            <p className="text-[hsl(var(--muted-foreground))]">Posts</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                    
                    {/* Friend suggestions */}
                    <motion.div 
                      className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4"
                      variants={item}
                    >
                      <h3 className="text-lg font-medium mb-3">Friend Suggestions</h3>
                      <div className="space-y-3">
                        <AnimatePresence>
                          {MOCK_FRIENDS.map((friend) => (
                            <FriendSuggestion key={friend.id} friend={friend} />
                          ))}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                    
                    {/* Trending topics */}
                    <motion.div 
                      className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4"
                      variants={item}
                    >
                      <h3 className="text-lg font-medium mb-3">Trending Topics</h3>
                      <div className="space-y-2">
                        {MOCK_GROUPS.map((group) => (
                          <motion.div 
                            key={group.id}
                            variants={item}
                            className="flex items-center justify-between"
                          >
                            <div>
                              <p className="font-medium">#{group.name}</p>
                              <p className="text-sm text-[hsl(var(--muted-foreground))]">{group.members.toLocaleString()} members</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </TabsContent>
            
            <TabsContent value="friends" className="mt-0">
              <motion.div 
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
                variants={container}
              >
                {MOCK_FRIENDS.map((friend) => (
                  <motion.div 
                    key={friend.id}
                    variants={item}
                    className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4 flex flex-col items-center text-center"
                  >
                    <Avatar className="h-16 w-16 mb-3">
                      <AvatarImage src={friend.avatar} alt={friend.name} />
                      <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h3 className="font-medium">{friend.name}</h3>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] mb-3">{friend.mutualFriends} mutual friends</p>
                    <div className="flex gap-2 mt-auto">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => goToProfile(friend.id)}
                      >
                        {t.profile}
                      </Button>
                      <Button 
                        size="sm" 
                        className="w-full"
                      >
                        Message
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </TabsContent>
            
            <TabsContent value="groups" className="mt-0">
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                variants={container}
              >
                {posts.map((post) => (
                  <Post 
                    key={post.id} 
                    post={post} 
                    userData={userData} 
                    onUpdate={fetchPosts} 
                  />
                ))}
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </Container>
  );
} 