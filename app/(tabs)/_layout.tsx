import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Tabs } from "expo-router";
import { Pressable, Text, View, StyleSheet } from "react-native";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import Colors from "../../constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

type HeaderTitleProps = {
  title: string;
  icon: React.ComponentProps<typeof FontAwesome>["name"];
  color?: string;
};

function HeaderTitle({ title, icon, color = "#4f46e5" }: HeaderTitleProps) {
  return (
    <View style={[headerTitleStyles.bg, { backgroundColor: color }]}>
      <FontAwesome
        name={icon}
        size={20}
        color="#fff"
        style={{ marginRight: 8 }}
      />
      <Text style={headerTitleStyles.title}>{title}</Text>
    </View>
  );
}

const headerTitleStyles = StyleSheet.create({
  bg: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginVertical: 4,
    alignSelf: "center",
    backgroundColor: "#4f46e5",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 0.5,
  },
});

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Timeline",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="clock-o" color={color} />
          ),
          headerTitle: () => (
            <HeaderTitle title="Timeline" icon="clock-o" color="#4f46e5" />
          ),
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome
                    name="info-circle"
                    size={25}
                    color={Colors[colorScheme ?? "light"].text}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="two/index"
        options={{
          title: "Subscription",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="credit-card" color={color} />
          ),
          headerTitle: () => (
            <HeaderTitle
              title="Subscription"
              icon="credit-card"
              color="#22c55e"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: "Groups",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="university" color={color} />
          ),
          headerTitle: () => (
            <HeaderTitle title="Groups" icon="university" color="#a51c30" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="user-circle" color={color} />
          ),
          headerTitle: () => (
            <HeaderTitle title="Profile" icon="user-circle" color="#4f46e5" />
          ),
        }}
      />
    </Tabs>
  );
}
