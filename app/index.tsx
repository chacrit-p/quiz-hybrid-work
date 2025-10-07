import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/(tabs)/(post)");
    }
  }, [isAuthenticated, isLoading]);

  const handleSignIn = () => {
    router.push("/(auth)/signin");
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ยินดีต้อนรับ</Text>
      <Text style={styles.subtitle}>KKU Classroom</Text>

      <View style={styles.descriptionContainer}>
        <Text style={styles.description}>แพลตฟอร์มสำหรับการเรียนการสอน</Text>
        <Text style={styles.description}>• สร้างและแชร์โพสต์</Text>
        <Text style={styles.description}>• กดไลค์และแสดงความคิดเห็น</Text>
        <Text style={styles.description}>• จัดการห้องเรียนของคุณ</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSignIn}>
        <Text style={styles.buttonText}>เข้าสู่ระบบ</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1a1a1a",
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 24,
    color: "#666",
  },
  descriptionContainer: {
    backgroundColor: "#f9f9f9",
    padding: 20,
    borderRadius: 12,
    marginBottom: 32,
    width: "100%",
    maxWidth: 400,
  },
  description: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
    lineHeight: 24,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: "#007AFF",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
