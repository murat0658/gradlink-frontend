import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
  View as RNView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Text, View } from "@/components/Themed";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useDispatch } from "react-redux";
import { joinGroup, joinGroupAsync } from "./store";
import { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/Colors";

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

  const handlePlanSelect = async (planName: string) => {
    setSelectedPlan(planName);
    // Simulate payment process
    setTimeout(async () => {
      if (joinGroupCode) {
        try {
          await dispatch(joinGroupAsync(joinGroupCode) as any);
          // Also update local state for immediate UI feedback
          dispatch(joinGroup(joinGroupCode));
        } catch (error: any) {
          console.error("Failed to join group:", error);
        }
      }
      setShowModal(false);
      router.back();
    }, 1000);
  };

  const PlanCard = ({ plan }: { plan: (typeof plans)[number] }) => {
    return (
      <Pressable onPress={() => handlePlanSelect(plan.name)}>
        {({ pressed }) => (
          <View
            style={[
              styles.card,
              { backgroundColor: plan.color },
              pressed && styles.cardPressed,
            ]}
          >
            <View style={styles.planTopRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.planName}>{plan.name}</Text>
              </View>
              <View style={styles.featuresCompact}>
                {plan.features.slice(0, 3).map((feature) => (
                  <View key={feature} style={styles.featureCompactRow}>
                    <FontAwesome
                      name="check-circle"
                      size={14}
                      color={Colors.success}
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.featureCompactText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.planBottomRow}>
              <Text style={styles.priceCentered}>{plan.price}</Text>
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={() => handlePlanSelect(plan.name)}
            >
              <Text style={styles.buttonText}>
                {joinGroupCode ? `Join with ${plan.name}` : "Subscribe"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
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
                <ScrollView
                  contentContainerStyle={styles.plansContainer}
                  style={{ flex: 1, width: "100%" }}
                >
                  {plans.map((plan) => (
                    <PlanCard key={plan.name} plan={plan} />
                  ))}
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
                <PlanCard key={plan.name} plan={plan} />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
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
  card: {
    borderRadius: 20,
    padding: 28,
    alignItems: "stretch",
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
  planTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  featuresCompact: {
    flex: 1,
  },
  featureCompactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  featureCompactText: {
    fontSize: 14,
    color: "#22223b",
    flexShrink: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(34, 34, 59, 0.12)",
    marginTop: 14,
    marginBottom: 14,
  },
  planBottomRow: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
  priceCentered: {
    fontSize: 20,
    fontWeight: "800",
    color: "#4f46e5",
    textAlign: "center",
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
    flex: 1,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(30,41,59,0.45)",
    zIndex: 10,
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  modalGradient: {
    flex: 1,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  modalContent: {
    flex: 1,
    backgroundColor: "#fff",
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
    position: "relative",
    paddingTop: 48,
  },
  closeButton: {
    position: "absolute",
    top: 24,
    right: 24,
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
  cardPressed: {
    shadowOpacity: 0.22,
    shadowRadius: 18,
    borderColor: "#4f46e5",
    backgroundColor: "#f3f4f6",
  },
});
