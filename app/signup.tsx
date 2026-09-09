import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
  Pressable,
} from "react-native";
import { Text } from "@/components/Themed";
import { useDispatch } from "react-redux";
import { setAuthenticated } from "./store";
import { apiService } from "./services/ApiService";
import { useRouter, Link } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Colors from "@/constants/Colors";

const COUNTRY_CODES = [
  { code: "+1", name: "United States/Canada" },
  { code: "+44", name: "United Kingdom" },
  { code: "+90", name: "Turkey" },
  { code: "+49", name: "Germany" },
  { code: "+33", name: "France" },
  { code: "+61", name: "Australia" },
  { code: "+81", name: "Japan" },
  { code: "+86", name: "China" },
  { code: "+91", name: "India" },
];

function validatePhone(phone: string) {
  const digits = phone.replace(/[^0-9]/g, "");
  return digits.length >= 10;
}

export default function SignupScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [countryCode, setCountryCode] = useState(COUNTRY_CODES[0].code);
  const [phone, setPhone] = useState("");
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const router = useRouter();

  const filteredCountryCodes = COUNTRY_CODES.filter(
    (c) =>
      c.code.includes(countrySearch) ||
      c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const handleSignup = async () => {
    if (
      name.trim() === "" ||
      email.trim() === "" ||
      password.trim() === "" ||
      phone.trim() === "" ||
      !validatePhone(phone)
    ) {
      setError("Please fill in all fields with valid information.");
      return;
    }
    setError("");
    try {
      await apiService.register({
        name,
        email,
        password,
        phoneNumber: countryCode + phone,
      });
      // Registration succeeded, route to sign in
      setError("");
      router.replace({
        pathname: "/auth",
        params: { msg: "Registration successful! Please sign in." },
      });
      return;
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
          name="user-plus"
          size={48}
          color={Colors.success}
          style={{ marginBottom: 16 }}
        />
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Sign up to get started</Text>
        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor="#aaa"
          value={name}
          onChangeText={setName}
        />
        <View style={styles.phoneRow}>
          <TouchableOpacity
            style={styles.countryCodeButton}
            onPress={() => setCountryModalVisible(true)}
          >
            <Text style={styles.countryCodeText}>{countryCode}</Text>
            <FontAwesome
              name="chevron-down"
              size={14}
              color={Colors.success}
              style={{ marginLeft: 4 }}
            />
          </TouchableOpacity>
          <TextInput
            style={[styles.input, styles.inputPhone]}
            placeholder="Phone"
            placeholderTextColor="#aaa"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>
        <Modal
          visible={countryModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setCountryModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <TextInput
                style={styles.input}
                value={countrySearch}
                onChangeText={setCountrySearch}
                placeholder="Search country code"
                placeholderTextColor="#aaa"
                autoFocus
              />
              <FlatList
                data={filteredCountryCodes}
                keyExtractor={(item) => item.code}
                renderItem={({ item }) => (
                  <Pressable
                    style={styles.countryItem}
                    onPress={() => {
                      setCountryCode(item.code);
                      setCountryModalVisible(false);
                      setCountrySearch("");
                    }}
                  >
                    <Text style={styles.countryCodeText}>{item.code}</Text>
                    <Text style={styles.countryNameText}>{item.name}</Text>
                  </Pressable>
                )}
                style={{ maxHeight: 300 }}
              />
              <TouchableOpacity
                style={styles.closeModalButton}
                onPress={() => setCountryModalVisible(false)}
              >
                <Text style={styles.closeModalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
          onPress={handleSignup}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
        <View
          style={{
            marginTop: 18,
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#6b7280", fontSize: 15 }}>
            Already have an account?{" "}
          </Text>
          <Link
            href="./auth"
            style={{ color: "#4f46e5", fontWeight: "bold", fontSize: 15 }}
          >
            Sign in
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
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 12,
  },
  countryCodeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginRight: 6,
  },
  countryCodeText: {
    fontSize: 15,
    color: Colors.success,
    fontWeight: "bold",
  },
  countryNameText: {
    fontSize: 14,
    color: "#22223b",
    marginLeft: 8,
  },
  inputPhone: {
    flex: 1,
    marginBottom: 0,
  },
  closeModalButton: {
    backgroundColor: Colors.success,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
    marginTop: 12,
    alignItems: "center",
  },
  closeModalButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: 320,
    maxWidth: "90%",
    alignItems: "stretch",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  button: {
    backgroundColor: Colors.success,
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
});
