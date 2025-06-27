import React from "react";
import { StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Text, View } from "@/components/Themed";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useDispatch } from "react-redux";
import { joinGroup } from "./store";
import { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";

const plans: {
  name: string;
  price: string;
  features: string[];
  color: string;
  icon: React.ComponentProps<typeof FontAwesome>["name"];
}[] = [
  {
    name: "Basic",
    price: "$5/mo",
    features: ["1 Project", "Basic Support", "Community Access"],
    color: "#e0e7ff",
    icon: "user",
  },
  {
    name: "Pro",
    price: "$15/mo",
    features: ["10 Projects", "Priority Support", "Advanced Analytics"],
    color: "#bae6fd",
    icon: "star",
  },
  {
    name: "Premium",
    price: "$30/mo",
    features: ["Unlimited Projects", "24/7 Support", "Custom Integrations"],
    color: "#fcd34d",
    icon: "diamond",
  },
];

export default function TabTwoScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const params = useLocalSearchParams();
  const joinGroupCode = params.joinGroup as string | undefined;
  const fromGroup = params.fromGroup === "1";
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(!!joinGroupCode && fromGroup);

  const handlePlanSelect = (planName: string) => {
    setSelectedPlan(planName);
    // Simulate payment process
    setTimeout(() => {
      if (joinGroupCode) {
        dispatch(joinGroup(joinGroupCode));
      }
      setShowModal(false);
      router.back();
    }, 1000);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {(showModal || (!!joinGroupCode && fromGroup)) && (
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={["#a18fff", "#6dd5fa", "#f9fafb"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modalGradient}
          >
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setShowModal(false);
                  router.back();
                }}
              >
                <FontAwesome name="close" size={22} color="#4f46e5" />
              </TouchableOpacity>
              <Text style={styles.header}>Join Group: Choose a Plan</Text>
              <View style={styles.headerAccent} />
              <Text style={styles.headerSubtitle}>
                Select a plan to join this group. Payment required.
              </Text>
              <ScrollView
                contentContainerStyle={styles.plansContainer}
                style={{ maxHeight: 400 }}
              >
                {plans.map((plan) => {
                  const [pressed, setPressed] = useState(false);
                  return (
                    <TouchableOpacity
                      key={plan.name}
                      style={[
                        styles.card,
                        { backgroundColor: plan.color },
                        pressed && styles.cardPressed,
                      ]}
                      activeOpacity={0.92}
                      onPress={() => handlePlanSelect(plan.name)}
                      onPressIn={() => setPressed(true)}
                      onPressOut={() => setPressed(false)}
                    >
                      <View style={styles.iconCircle}>
                        <FontAwesome
                          name={plan.icon}
                          size={36}
                          color="#4f46e5"
                        />
                      </View>
                      <Text style={styles.planName}>{plan.name}</Text>
                      <Text style={styles.price}>{plan.price}</Text>
                      <TouchableOpacity
                        style={styles.button}
                        onPress={() => handlePlanSelect(plan.name)}
                      >
                        <Text style={styles.buttonText}>
                          Join with {plan.name}
                        </Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </LinearGradient>
        </View>
      )}
      {!showModal && (
        <>
          <View style={styles.headerArea}>
            <Text style={styles.header}>Choose Your Plan</Text>
            <View style={styles.headerAccent} />
            <Text style={styles.headerSubtitle}>
              Select the best plan for your needs and unlock more features.
            </Text>
          </View>
          <View style={styles.plansContainer}>
            {plans.map((plan) => (
              <View
                key={plan.name}
                style={[styles.card, { backgroundColor: plan.color }]}
              >
                <View style={styles.iconCircle}>
                  <FontAwesome name={plan.icon} size={36} color="#4f46e5" />
                </View>
                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={styles.price}>{plan.price}</Text>
                <View style={styles.featuresArea}>
                  <Text style={styles.featuresTitle}>Features</Text>
                  <View style={styles.featuresList}>
                    {plan.features.map((feature) => (
                      <View key={feature} style={styles.featureRow}>
                        <FontAwesome
                          name="check-circle"
                          size={18}
                          color="#22c55e"
                          style={{ marginRight: 8 }}
                        />
                        <Text style={styles.feature}>{feature}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                <TouchableOpacity style={styles.button}>
                  <Text style={styles.buttonText}>Subscribe</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#f9fafb",
  },
  headerArea: {
    marginBottom: 24,
    marginTop: 8,
    width: "100%",
    alignSelf: "flex-start",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#22223b",
    letterSpacing: 0.5,
    textAlign: "left",
    marginBottom: 2,
  },
  headerAccent: {
    width: 44,
    height: 4,
    backgroundColor: "#4f46e5",
    borderRadius: 2,
    marginBottom: 10,
    marginTop: 2,
  },
  headerSubtitle: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "left",
  },
  plansContainer: {
    width: "100%",
    flexDirection: "column",
    gap: 32,
    paddingBottom: 8,
    alignItems: "center",
  },
  card: {
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "#ede9fe",
    backgroundColor: "#fff",
    width: "100%",
    maxWidth: 340,
  },
  iconCircle: {
    backgroundColor: "#fff",
    borderRadius: 50,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  planName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#22223b",
  },
  price: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    color: "#4f46e5",
  },
  featuresArea: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#4f46e5",
    textAlign: "left",
  },
  featuresList: {
    width: "100%",
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  feature: {
    fontSize: 15,
    color: "#22223b",
  },
  button: {
    backgroundColor: "#4f46e5",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
    zIndex: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  modalGradient: {
    borderRadius: 32,
    padding: 2,
    width: "92%",
    maxWidth: 440,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 28,
    padding: 32,
    width: "100%",
    maxWidth: 420,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8,
    maxHeight: 600,
    justifyContent: "flex-start",
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 18,
    right: 18,
    zIndex: 2,
    backgroundColor: "#f3f4f6",
    borderRadius: 16,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#22223b",
    letterSpacing: 0.5,
    textAlign: "center",
    marginBottom: 2,
    marginTop: 8,
  },
  headerAccent: {
    width: 44,
    height: 4,
    backgroundColor: "#4f46e5",
    borderRadius: 2,
    marginBottom: 14,
    marginTop: 2,
    alignSelf: "center",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 18,
  },
  plansContainer: {
    width: "100%",
    flexDirection: "column",
    gap: 32,
    paddingBottom: 8,
    alignItems: "center",
  },
  cardPressed: {
    shadowOpacity: 0.22,
    shadowRadius: 18,
    borderColor: "#4f46e5",
    backgroundColor: "#f3f4f6",
  },
});
