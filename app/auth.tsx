import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
} from "react-native";
import { Text } from "@/components/Themed";
import { useDispatch } from "react-redux";
import { setAuthenticated, setToken } from "./store";
import { apiService } from "./services/ApiService";
import { useRouter, Link, useLocalSearchParams } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Colors from "@/constants/Colors";
import { useKeyboardAwareForm } from "./hooks/useKeyboardAwareForm";

export default function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const { msg } = useLocalSearchParams();
  const { scrollRef, keyboardVisible, bottomPad, scrollFocusedIntoView } =
    useKeyboardAwareForm();

  const handleLogin = async () => {
    if (email.trim() === "" || password.trim() === "") {
      setError("Please enter both email and password.");
      return;
    }
    setError("");
    setSubmitting(true);
    Keyboard.dismiss();
    try {
      const data = await apiService.login(email, password);
      if (!data.token) {
        setError("No token received. Please try again.");
        return;
      }
      apiService.setToken(data.token);

      dispatch(setToken(data.token));
      dispatch(setAuthenticated(true));
      router.replace("/(tabs)");
    } catch (err: any) {
      setError(
        err.message || "Could not connect to server. Please try again later."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[
          styles.scrollContent,
          keyboardVisible && styles.scrollContentKeyboardOpen,
          { paddingBottom: bottomPad + 48 },
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <FontAwesome
            name="graduation-cap"
            size={48}
            color="#4f46e5"
            style={{ marginBottom: 16 }}
          />
          <Text style={styles.title}>Welcome to GradLink</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
          {msg ? <Text style={styles.success}>{String(msg)}</Text> : null}
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next"
            onFocus={scrollFocusedIntoView}
            testID="auth-email"
            accessibilityLabel="Email"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#aaa"
            value={password}
            onChangeText={setPassword}
            // Maestro / XCUITest often cannot type into iOS secure fields in Expo Go
            secureTextEntry={!(__DEV__ && Platform.OS === "ios")}
            returnKeyType="done"
            onFocus={scrollFocusedIntoView}
            onSubmitEditing={handleLogin}
            testID="auth-password"
            accessibilityLabel="Password"
            autoCorrect={false}
            textContentType="password"
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity
            style={[styles.button, submitting && styles.buttonDisabled]}
            onPress={handleLogin}
            activeOpacity={0.85}
            disabled={submitting}
            testID="auth-sign-in"
            accessibilityLabel="Sign In"
          >
            <Text style={styles.buttonText}>
              {submitting ? "Signing in…" : "Sign In"}
            </Text>
          </TouchableOpacity>
          <View
            style={{
              marginTop: 18,
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#6b7280", fontSize: 15 }}>
              Don't have an account?{" "}
            </Text>
            <Link
              href="./signup"
              style={{ color: "#4f46e5", fontWeight: "bold", fontSize: 15 }}
            >
              Sign up
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 32,
    paddingHorizontal: 16,
  },
  scrollContentKeyboardOpen: {
    justifyContent: "flex-start",
    paddingTop: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 32,
    width: 340,
    maxWidth: "90%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#22223b",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 18,
  },
  input: {
    width: "100%",
    fontSize: 16,
    color: "#22223b",
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  button: {
    backgroundColor: "#4f46e5",
    borderRadius: 8,
    paddingHorizontal: 28,
    paddingVertical: 12,
    marginTop: 8,
    alignItems: "center",
    width: "100%",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
  },
  error: {
    color: "#ef4444",
    fontSize: 14,
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  success: {
    color: Colors.success,
    fontSize: 15,
    marginBottom: 8,
    alignSelf: "flex-start",
    fontWeight: "bold",
  },
});
