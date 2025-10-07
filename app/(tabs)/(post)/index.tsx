import { useAuth } from "@/contexts/AuthContext";
import { PostService } from "@/services/post.service";
import { Comment, Daum } from "@/types/post";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function PostScreen() {
  const router = useRouter();
  const [posts, setPosts] = useState<Daum[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(
    new Set()
  );
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>(
    {}
  );
  const [submittingComment, setSubmittingComment] = useState<string | null>(
    null
  );
  const [deletingComment, setDeletingComment] = useState<string | null>(null);
  const [deletingPost, setDeletingPost] = useState<string | null>(null);
  const [likingPost, setLikingPost] = useState<string | null>(null);
  
  const { user } = useAuth();

  const fetchPosts = async () => {
    try {
      setError(null);
      const response = await PostService.getAllPosts();
      setPosts(response.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการโหลดข้อมูล"
      );
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Refresh posts when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  const toggleComments = (postId: string) => {
    setExpandedComments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handleCommentChange = (postId: string, text: string) => {
    setCommentInputs((prev) => ({
      ...prev,
      [postId]: text,
    }));
  };

  const handleSubmitComment = async (postId: string) => {
    const commentText = commentInputs[postId]?.trim();
    
    if (!commentText) {
      Alert.alert("แจ้งเตือน", "กรุณาใส่ความคิดเห็น");
      return;
    }

    try {
      setSubmittingComment(postId);
      
      await PostService.createComment({
        content: commentText,
        statusId: postId,
      });

      setCommentInputs((prev) => ({
        ...prev,
        [postId]: "",
      }));

      await fetchPosts();
      
      Alert.alert("สำเร็จ", "เพิ่มความคิดเห็นเรียบร้อยแล้ว");
    } catch (err) {
      console.error("Error submitting comment:", err);
      Alert.alert(
        "ข้อผิดพลาด",
        err instanceof Error ? err.message : "ไม่สามารถเพิ่มความคิดเห็นได้"
      );
    } finally {
      setSubmittingComment(null);
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    Alert.alert(
      "ยืนยันการลบ",
      "คุณต้องการลบความคิดเห็นนี้ใช่หรือไม่?",
      [
        {
          text: "ยกเลิก",
          style: "cancel",
        },
        {
          text: "ลบ",
          style: "destructive",
          onPress: async () => {
            try {
              setDeletingComment(commentId);
              
              await PostService.deleteComment(commentId, {
                statusId: postId,
                commentId: commentId,
              });

              await fetchPosts();
              
              Alert.alert("สำเร็จ", "ลบความคิดเห็นเรียบร้อยแล้ว");
            } catch (err) {
              console.error("Error deleting comment:", err);
              Alert.alert(
                "ข้อผิดพลาด",
                err instanceof Error ? err.message : "ไม่สามารถลบความคิดเห็นได้"
              );
            } finally {
              setDeletingComment(null);
            }
          },
        },
      ]
    );
  };

  const handleDeletePost = async (postId: string) => {
    Alert.alert(
      "ยืนยันการลบ",
      "คุณต้องการลบโพสต์นี้ใช่หรือไม่?",
      [
        {
          text: "ยกเลิก",
          style: "cancel",
        },
        {
          text: "ลบ",
          style: "destructive",
          onPress: async () => {
            try {
              setDeletingPost(postId);
              
              await PostService.deletePost(postId);

              await fetchPosts();
              
              Alert.alert("สำเร็จ", "ลบโพสต์เรียบร้อยแล้ว");
            } catch (err) {
              console.error("Error deleting post:", err);
              Alert.alert(
                "ข้อผิดพลาด",
                err instanceof Error ? err.message : "ไม่สามารถลบโพสต์ได้"
              );
            } finally {
              setDeletingPost(null);
            }
          },
        },
      ]
    );
  };

  const handleToggleLike = async (postId: string) => {
    const post = posts.find(p => p._id === postId);
    if (!post) return;

    const liked = isLikedByMe(post);

    try {
      setLikingPost(postId);
      
      if (liked) {
        await PostService.toggleUnlike({
          statusId: postId,
        });
      } else {
        await PostService.toggleLike({
          statusId: postId,
        });
      }

      await fetchPosts();
    } catch (err) {
      console.error("Error toggling like:", err);
      Alert.alert(
        "ข้อผิดพลาด",
        err instanceof Error ? err.message : "ไม่สามารถกดไลค์ได้"
      );
    } finally {
      setLikingPost(null);
    }
  };

  const handleCreatePost = () => {
    router.push("/(tabs)/(post)/create");
  };

  const isMyComment = (comment: Comment) => {
    return user && comment.createdBy._id === user._id;
  };

  const isMyPost = (post: Daum) => {
    return user && post.createdBy._id === user._id;
  };

  const isLikedByMe = (post: Daum) => {
    return user && post.like.some(like => like._id === user._id);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `${diffInMinutes} นาทีที่แล้ว`;
    } else if (diffInHours < 24) {
      return `${diffInHours} ชั่วโมงที่แล้ว`;
    } else if (diffInDays < 7) {
      return `${diffInDays} วันที่แล้ว`;
    } else {
      return date.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  };

  const renderPost = ({ item }: { item: Daum }) => {
    const isExpanded = expandedComments.has(item._id);
    const commentsToShow = isExpanded ? item.comment : item.comment.slice(0, 2);
    const isSubmitting = submittingComment === item._id;
    const isLiking = likingPost === item._id;
    const liked = isLikedByMe(item);
    const isMyPostItem = isMyPost(item);

    return (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          {item.createdBy.image ? (
            <Image
              source={{ uri: `https://cis.kku.ac.th${item.createdBy.image}` }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={24} color="#fff" />
            </View>
          )}

          <View style={styles.postHeaderInfo}>
            <Text style={styles.authorEmail}>{item.createdBy.email}</Text>
            <Text style={styles.postDate}>{formatDate(item.createdAt)}</Text>
          </View>
          {isMyPostItem && (
            <TouchableOpacity
              style={styles.deletePostButton}
              onPress={() => handleDeletePost(item._id)}
              disabled={deletingPost === item._id}
            >
              {deletingPost === item._id ? (
                <ActivityIndicator size="small" color="#FF3B30" />
              ) : (
                <Ionicons name="trash" size={20} color="#FF3B30" />
              )}
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.postContent}>{item.content}</Text>

        <View style={styles.postActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleToggleLike(item._id)}
            disabled={isLiking}
          >
            {isLiking ? (
              <ActivityIndicator size="small" color="#FF3B30" />
            ) : (
              <Ionicons
                name={liked ? "heart" : "heart-outline"}
                size={24}
                color={liked ? "#FF3B30" : "#8E8E93"}
              />
            )}
            <Text style={styles.actionText}>{item.like.length}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={24} color="#8E8E93" />
            <Text style={styles.actionText}>{item.comment.length}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.commentInputContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder="เขียนความคิดเห็น..."
            value={commentInputs[item._id] || ""}
            onChangeText={(text) => handleCommentChange(item._id, text)}
            multiline
            editable={!isSubmitting}
          />
          <TouchableOpacity
            style={[
              styles.commentSubmitButton,
              isSubmitting && styles.commentSubmitButtonDisabled,
            ]}
            onPress={() => handleSubmitComment(item._id)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <Ionicons name="send" size={20} color="#007AFF" />
            )}
          </TouchableOpacity>
        </View>

        {item.comment.length > 0 && (
          <View style={styles.commentsSection}>
            <Text style={styles.commentsTitle}>
              ความคิดเห็น ({item.comment.length})
            </Text>
            {commentsToShow.map((comment) => (
              <View key={comment._id} style={styles.commentItem}>
                <View style={styles.commentHeader}>
                  {comment.createdBy.image ? (
                    <Image
                      source={{
                        uri: `https://cis.kku.ac.th${comment.createdBy.image}`,
                      }}
                      style={styles.commentAvatar}
                    />
                  ) : (
                    <View style={styles.commentAvatarPlaceholder}>
                      <Ionicons name="person" size={16} color="#fff" />
                    </View>
                  )}
                  <View style={styles.commentInfo}>
                    <Text style={styles.commentAuthor}>
                      {comment.createdBy.email}
                    </Text>
                    <Text style={styles.commentDate}>
                      {formatDate(comment.createdAt)}
                    </Text>
                  </View>
                  {isMyComment(comment) && (
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteComment(item._id, comment._id)}
                      disabled={deletingComment === comment._id}
                    >
                      {deletingComment === comment._id ? (
                        <ActivityIndicator size="small" color="#FF3B30" />
                      ) : (
                        <Ionicons name="trash" size={16} color="#FF3B30" />
                      )}
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.commentContent}>{comment.content}</Text>
              </View>
            ))}
            {item.comment.length > 2 && (
              <TouchableOpacity onPress={() => toggleComments(item._id)}>
                <Text style={styles.viewMoreComments}>
                  {isExpanded
                    ? "ซ่อนความคิดเห็น"
                    : `ดูความคิดเห็นทั้งหมด (${item.comment.length})`}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>กำลังโหลดโพสต์...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#FF3B30" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchPosts}>
          <Text style={styles.retryButtonText}>ลองอีกครั้ง</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#8E8E93" />
            <Text style={styles.emptyText}>ยังไม่มีโพสต์</Text>
          </View>
        }
      />
      <TouchableOpacity style={styles.fab} onPress={handleCreatePost}>
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F2F2F7",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#8E8E93",
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: "#FF3B30",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#007AFF",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  listContainer: {
    padding: 16,
  },
  postCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  postHeaderInfo: {
    marginLeft: 12,
    flex: 1,
  },
  authorEmail: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  postDate: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: 2,
  },
  deletePostButton: {
    padding: 4,
  },
  postContent: {
    fontSize: 16,
    color: "#000",
    lineHeight: 24,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: "row",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 24,
  },
  actionText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#8E8E93",
    fontWeight: "600",
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 8,
    padding: 8,
  },
  commentInput: {
    flex: 1,
    fontSize: 14,
    color: "#000",
    maxHeight: 100,
    padding: 8,
  },
  commentSubmitButton: {
    marginLeft: 8,
    padding: 8,
  },
  commentSubmitButtonDisabled: {
    opacity: 0.5,
  },
  commentsSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
  },
  commentsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  commentItem: {
    marginBottom: 8,
    paddingLeft: 8,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  commentAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  commentAvatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  commentInfo: {
    marginLeft: 8,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  commentDate: {
    fontSize: 12,
    color: "#8E8E93",
  },
  commentContent: {
    fontSize: 14,
    color: "#3C3C43",
    marginLeft: 32,
    lineHeight: 20,
  },
  viewMoreComments: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
    marginTop: 4,
  },
  deleteButton: {
    marginLeft: 'auto',
    padding: 4,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: "#8E8E93",
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
