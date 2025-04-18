"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowLeft, 
  Edit, 
  Settings, 
  Users, 
  MessageCircle, 
  Image as ImageIcon, 
  Calendar, 
  Award,
  ChevronLeft,
  Share2,
  Heart,
  Send
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/components/providers/language-provider";
import { profileTranslations, formatTranslation } from "@/app/locales/social/profile";
import { formatDate } from "@/lib/utils/format-date";

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
  timestamp: string;
  likes: number;
  likedBy?: string[];
  comments: Comment[];
}

// Mock achievements
const MOCK_ACHIEVEMENTS = [
  {
    id: "achv1",
    title: "Early Bird",
    description: "Logged 10 breakfast meals",
    icon: <Award className="text-yellow-500" />,
  },
  {
    id: "achv2",
    title: "Fitness Fanatic",
    description: "Tracked 20 workouts",
    icon: <Award className="text-blue-500" />,
  },
  {
    id: "achv3",
    title: "Social Butterfly",
    description: "Made 5 friends in Social Club",
    icon: <Award className="text-purple-500" />,
  },
];

// Post component
const PostItem = ({ post, userData, onUpdate }: { post: Post; userData: any; onUpdate: () => void }) => {
  const { locale } = useLanguage();
  const t = profileTranslations[locale as keyof typeof profileTranslations] || profileTranslations.en;
  
  const [liked, setLiked] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check if user already liked this post
  useEffect(() => {
    if (post.likedBy?.includes(userData.id)) {
      setLiked(true);
    }
  }, [post, userData.id]);
  
  // Handle like functionality
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
  
  // Handle comment functionality
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
        }
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="mb-6 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))]">
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
            </p>
          </div>
        </div>
      </div>

      {/* Post content */}
      <div className="px-4 pb-3">
        <p>{post.content}</p>
      </div>

      {/* Post stats */}
      <div className="flex items-center justify-between border-t border-[hsl(var(--border))] px-4 py-2">
        <div className="flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))]">
          <Heart 
            className="h-4 w-4" 
            fill={liked ? "hsl(var(--primary))" : "none"}
            color={liked ? "hsl(var(--primary))" : "currentColor"}
          />
          <span>{post.likes} likes</span>
        </div>
        <div className="text-sm text-[hsl(var(--muted-foreground))]">
          {post.comments.length} comments
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
          Like
        </Button>
        <Button 
          variant="ghost" 
          className="flex gap-2 rounded-none py-2"
          onClick={() => setIsCommenting(!isCommenting)}
        >
          <MessageCircle className="h-5 w-5" />
          Comment
        </Button>
        <Button variant="ghost" className="flex gap-2 rounded-none py-2">
          <Share2 className="h-5 w-5" />
          Share
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
                  <button>Like</button>
                  <button>Reply</button>
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
                placeholder="Write a comment..."
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
    </div>
  );
};

export default function Profile() {
  const router = useRouter();
  const { locale } = useLanguage();
  const t = profileTranslations[locale as keyof typeof profileTranslations] || profileTranslations.en;
  
  const [userData, setUserData] = useState(DEFAULT_USER);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [expandedBio, setExpandedBio] = useState(false);
  
  // Load user data from API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch user data with cache busting
        const userResponse = await fetch(`/api/update-profile?_=${Date.now()}`);
        
        if (!userResponse.ok) {
          throw new Error("Failed to fetch user data");
        }
        
        const data = await userResponse.json();
        
        if (data.success && data.user) {
          // ตรวจสอบว่าเป็น base64 image หรือไม่
          let profileImage = data.user.profileImage || DEFAULT_USER.profileImage;
          
          // ถ้าอยู่ในฝั่ง client และมีการเก็บรูปใน localStorage ให้ใช้รูปจาก localStorage แทน
          if (typeof window !== 'undefined' && data.user.isBase64Image) {
            const localProfileImage = localStorage.getItem('profileImage');
            if (localProfileImage) {
              profileImage = localProfileImage;
            }
          }
          
          // เพิ่ม cache busting สำหรับรูปปกติที่ไม่ใช่ base64
          if (!profileImage.startsWith('data:')) {
            profileImage = profileImage.includes('?') 
              ? profileImage 
              : `${profileImage}?v=${Date.now()}`;
          }
            
          setUserData({
            ...data.user,
            profileImage: profileImage
          });
        } else {
          setUserData(DEFAULT_USER);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive"
        });
        setUserData(DEFAULT_USER);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Fetch user posts
  const fetchUserPosts = async () => {
    try {
      setIsLoadingPosts(true);
      
      // Add user ID to the query to get only this user's posts
      const response = await fetch(`/api/posts?userId=${userData.id}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      
      const data = await response.json();
      
      if (data.success) {
        setUserPosts(data.posts);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast({
        title: "Error",
        description: "Could not load posts. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPosts(false);
    }
  };
  
  // Fetch posts when user data is loaded and when active tab is "posts"
  useEffect(() => {
    if (!isLoading && userData.id && activeTab === "posts") {
      fetchUserPosts();
    }
  }, [isLoading, userData.id, activeTab]);

  if (isLoading) {
    return (
      <Container>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mb-4 h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-[hsl(var(--primary))]"></div>
            <p>Loading profile...</p>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="py-6">
        {/* Back button */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-4"
          onClick={() => router.push("/social")}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back
        </Button>
        
        {/* Profile header */}
        <div className="relative mb-6">
          {/* Cover photo */}
          <div className="h-40 rounded-t-lg bg-gradient-to-r from-blue-500 to-purple-500"></div>
          
          {/* Profile photo and actions */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between px-4 -mt-12 sm:-mt-16">
            <div className="flex flex-col sm:flex-row sm:items-end">
              <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-background">
                <AvatarImage src={userData.profileImage} alt={userData.name} />
                <AvatarFallback className="text-4xl">{userData.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="mt-2 sm:ml-4 sm:mb-2">
                <h1 className="text-2xl font-bold">{userData.name}</h1>
                <p className="text-sm text-muted-foreground">{userData.description}</p>
              </div>
            </div>
            
            <div className="mt-4 sm:mt-0 flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push("/social/profile/edit")}
              >
                <Edit className="mr-2 h-4 w-4" />
                {t.editProfile}
              </Button>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6 text-center">
          <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-3">
            <div className="text-2xl font-bold">{userData.stats.posts}</div>
            <div className="text-sm text-muted-foreground">{t.posts}</div>
          </div>
          <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-3">
            <div className="text-2xl font-bold">{userData.stats.friends}</div>
            <div className="text-sm text-muted-foreground">{t.friends}</div>
          </div>
          <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-3">
            <div className="text-2xl font-bold">{userData.stats.groups}</div>
            <div className="text-sm text-muted-foreground">{t.groups}</div>
          </div>
        </div>
        
        {/* Tabs */}
        <Tabs defaultValue="posts" onValueChange={setActiveTab}>
          <TabsList className="w-full mb-6">
            <TabsTrigger value="posts" className="flex-1">{t.posts}</TabsTrigger>
            <TabsTrigger value="about" className="flex-1">{t.about}</TabsTrigger>
            <TabsTrigger value="friends" className="flex-1">{t.friends}</TabsTrigger>
            <TabsTrigger value="photos" className="flex-1">Photos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts">
            <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4 mb-6">
              <h2 className="font-semibold mb-4">{t.myPosts}</h2>
              
              {isLoadingPosts ? (
                <div className="flex justify-center p-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-[hsl(var(--primary))]"></div>
                </div>
              ) : userPosts.length > 0 ? (
                userPosts.map((post) => (
                  <PostItem 
                    key={post.id} 
                    post={post} 
                    userData={userData}
                    onUpdate={fetchUserPosts}
                  />
                ))
              ) : (
                <div className="text-center p-8">
                  <p className="text-[hsl(var(--muted-foreground))]">{t.noPostsYet}</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="about">
            <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4 mb-6">
              <h2 className="font-semibold mb-4">{t.bio}</h2>
              <p className={`text-sm ${!expandedBio && 'line-clamp-3'}`}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl.
              </p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-2 h-auto p-0 text-xs text-[hsl(var(--primary))]"
                onClick={() => setExpandedBio(!expandedBio)}
              >
                {expandedBio ? t.seeLess : t.seeMore}
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4">
                <h2 className="font-semibold mb-4">{t.location}</h2>
                <div className="flex items-center text-sm">
                  <ImageIcon className="mr-2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                  <span>New York, USA</span>
                </div>
              </div>
              
              <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4">
                <h2 className="font-semibold mb-4">{t.joinedOn}</h2>
                <div className="flex items-center text-sm">
                  <Calendar className="mr-2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                  <span>January 2023</span>
                </div>
              </div>
            </div>
            
            <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4 mb-6">
              <h2 className="font-semibold mb-4">{t.interests}</h2>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Fitness</Badge>
                <Badge variant="secondary">Nutrition</Badge>
                <Badge variant="secondary">Weight Loss</Badge>
                <Badge variant="secondary">Healthy Cooking</Badge>
                <Badge variant="secondary">Running</Badge>
                <Badge variant="secondary">Yoga</Badge>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="friends">
            <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">{t.friends}</h2>
                <Button variant="ghost" size="sm" className="h-auto text-xs text-[hsl(var(--primary))]">
                  {t.viewAll}
                </Button>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="text-center">
                    <Avatar className="h-16 w-16 mx-auto mb-2">
                      <AvatarImage src={`https://i.pravatar.cc/150?img=${i + 20}`} alt={`Friend ${i + 1}`} />
                      <AvatarFallback>F{i + 1}</AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-medium truncate">Friend {i + 1}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      {formatTranslation(t.mutualFriends, { count: Math.floor(Math.random() * 10) + 1 })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="photos">
            <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Photos</h2>
                <Button variant="ghost" size="sm" className="h-auto text-xs text-[hsl(var(--primary))]">
                  {t.viewAll}
                </Button>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-md overflow-hidden bg-[hsl(var(--muted))]">
                    <img 
                      src={`https://source.unsplash.com/random/300x300?fitness&sig=${i}`} 
                      alt={`Photo ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Recent Activity */}
        <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">{t.recentActivity}</h2>
            <Button variant="ghost" size="sm" className="h-auto text-xs text-[hsl(var(--primary))]">
              {t.viewAll}
            </Button>
          </div>
          
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-white">
                  <Award className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm">
                    <span className="font-medium">Achievement unlocked:</span> Completed a 7-day streak!
                  </p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">2 days ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
} 