import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PostService } from '@/services/post.service';

export default function CreatePostScreen() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmedContent = content.trim();

    if (!trimmedContent) {
      Alert.alert('แจ้งเตือน', 'กรุณาใส่เนื้อหาโพสต์');
      return;
    }

    try {
      setIsSubmitting(true);

      await PostService.createPost({
        content: trimmedContent,
      });

      Alert.alert('สำเร็จ', 'สร้างโพสต์เรียบร้อยแล้ว', [
        {
          text: 'ตรวจสอบ',
          onPress: () => router.back(),
        },
      ]);

      setContent('');
    } catch (err) {
      console.error('Error creating post:', err);
      Alert.alert(
        'ข้อผิดพลาด',
        err instanceof Error ? err.message : 'ไม่สามารถสร้างโพสต์ได้'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (content.trim()) {
      Alert.alert(
        'ยกเลิกการสร้างโพสต์',
        'คุณต้องการยกเลิกการสร้างโพสต์ใช่หรือไม่?',
        [
          {
            text: 'ไม่',
            style: 'cancel',
          },
          {
            text: 'ใช่',
            style: 'destructive',
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            disabled={isSubmitting}
          >
            <Ionicons name="close" size={28} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>สร้างโพสต์ใหม่</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>เนื้อหาโพสต์</Text>
            <TextInput
              style={styles.textInput}
              placeholder="คุณกำลังคิดอะไรอยู่?"
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={10}
              textAlignVertical="top"
              editable={!isSubmitting}
              maxLength={5000}
            />
            <Text style={styles.characterCount}>
              {content.length} / 5000 ตัวอักษร
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              (!content.trim() || isSubmitting) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!content.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="send" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>โพสต์</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  cancelButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  placeholder: {
    width: 36,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  textInput: {
    fontSize: 16,
    color: '#000',
    minHeight: 200,
    padding: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  characterCount: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'right',
    marginTop: 8,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
