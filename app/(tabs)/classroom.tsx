import { ClassroomService } from "@/services/classroom.service";
import { Daum } from "@/types/classroom";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function ClassroomScreen() {
  const [students, setStudents] = useState<Daum[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = async () => {
    try {
      setError(null);
      const response = await ClassroomService.getStudentsByYear("2565");
      setStudents(response.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการโหลดข้อมูล"
      );
      console.error("Error fetching students:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStudents();
  };

  const renderStudent = ({ item }: { item: Daum }) => (
    <View style={styles.studentCard}>
      <View style={styles.studentHeader}>
        {item.image ? (
          <Image
            source={{ uri: "https://cis.kku.ac.th/" + item.image }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {item.firstname.charAt(0)}
              {item.lastname.charAt(0)}
            </Text>
          </View>
        )}
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>
            {item.firstname} {item.lastname}
          </Text>
          <Text style={styles.studentEmail}>{item.email}</Text>
        </View>
      </View>

      <View style={styles.studentDetails}>
        <DetailRow label="รหัสนักศึกษา" value={item.education.studentId} />
        <DetailRow label="สาขา" value={item.education.major} />
        <DetailRow
          label="ปีที่เข้าศึกษา"
          value={item.education.enrollmentYear}
        />
        {item.education.school && (
          <DetailRow label="โรงเรียน" value={item.education.school.name} />
        )}
        {item.education.school?.province && (
          <DetailRow label="จังหวัด" value={item.education.school.province} />
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>กำลังโหลดข้อมูล...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ห้องเรียน ปี 2565</Text>
        <Text style={styles.headerSubtitle}>
          นักศึกษาทั้งหมด {students.length} คน
        </Text>
      </View>

      <FlatList
        data={students}
        renderItem={renderStudent}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>ไม่พบข้อมูลนักศึกษา</Text>
          </View>
        }
      />
    </View>
  );
}

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}:</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
  },
  studentCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  studentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  studentInfo: {
    marginLeft: 12,
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  studentEmail: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  studentDetails: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    width: 120,
  },
  detailValue: {
    fontSize: 14,
    color: "#333",
    flex: 1,
    fontWeight: "500",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 16,
    color: "#ff3b30",
    textAlign: "center",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
});
