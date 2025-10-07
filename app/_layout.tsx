
import { Stack } from "expo-router";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthMiddleware } from "@/components/AuthMiddleware";

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthMiddleware>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </AuthMiddleware>
    </AuthProvider>
  );
}
