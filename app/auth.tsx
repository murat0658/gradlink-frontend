import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Text } from "@/components/Themed";
import { useDispatch } from "react-redux";
import { setAuthenticated, setToken } from "./store";
import { apiService } from "./services/ApiService";
import { useRouter, Link, useLocalSearchParams } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Colors from "@/constants/Colors";

export default function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const router = useRouter();
  const { msg } = useLocalSearchParams();

  const handleLogin = async () => {
    if (email.trim() === "" || password.trim() === "") {
      setError("Please enter both email and password.");
      return;
    }
    setError("");
    try {
      const data = await apiService.login(email, password);
      if (!data.token) {
        setError("No token received. Please try again.");
        return;
      }
      // Set the token in the API service
      apiService.setToken(data.token);

      dispatch(setToken(data.token));
      dispatch(setAuthenticated(true));
      router.replace("/(tabs)");
    } catch (err: any) {
      setError(
        err.message || "Could not connect to server. Please try again later."
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
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
        {msg ? <Text style={styles.success}>{msg}</Text> : null}
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#aaa"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>Sign In</Text>
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
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
