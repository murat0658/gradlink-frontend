import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Tabs } from "expo-router";
import {
  Pressable,
  Text,
  View,
  StyleSheet,
  View as RNView,
} from "react-native";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import Colors, {
  spacing,
  borderRadius,
  typography,
  shadows,
} from "@/constants/Colors";
import { useDispatch, useSelector } from "react-redux";
import { setAuthenticated, setToken } from "../store/slices";
import { selectToken, selectUnreadNotifications } from "../store/selectors";
import { API_BASE_URL } from "../config/api";
import { useRouter } from "expo-router";

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
  showBadge?: boolean;
  badgeCount?: number;
}) {
  return (
    <RNView style={{ position: "relative" }}>
      <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />
      {props.showBadge && props.badgeCount && props.badgeCount > 0 && (
        <RNView style={tabBarIconStyles.badge}>
          <Text style={tabBarIconStyles.badgeText}>
            {props.badgeCount > 99 ? "99+" : props.badgeCount.toString()}
          </Text>
        </RNView>
      )}
    </RNView>
  );
}

const tabBarIconStyles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: -5,
    right: -8,
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  badgeText: {
    color: "#fff",
    ...typography.xs,
    fontWeight: "bold",
  },
});

type HeaderTitleProps = {
  title: string;
  icon: React.ComponentProps<typeof FontAwesome>["name"];
  color?: string;
};

function HeaderTitle({ title, icon, color = Colors.tint }: HeaderTitleProps) {
  return (
    <RNView style={[headerTitleStyles.bg, { backgroundColor: color }]}>
      <FontAwesome
        name={icon}
        size={20}
        color="#fff"
        style={{ marginRight: spacing.sm }}
      />
      <Text style={headerTitleStyles.title}>{title}</Text>
    </RNView>
  );
}

const headerTitleStyles = StyleSheet.create({
  bg: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginVertical: spacing.xs,
    alignSelf: "center",
    backgroundColor: Colors.tint,
  },
  title: {
    ...typography.lg,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 0.5,
  },
});

const headerNotificationBadgeStyles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: -5,
    right: -8,
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  badgeText: {
    color: "#fff",
    ...typography.xs,
    fontWeight: "bold",
  },
});

export default function TabLayout() {
  const router = useRouter();
  const token = useSelector(selectToken);
  const unreadNotifications = useSelector(selectUnreadNotifications);
  const dispatch = useDispatch();

  const LogoutButton = () => {
    const handleLogout = async () => {
      try {
        await fetch(`${API_BASE_URL}/logout`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
      } catch (err) {
        // Optionally handle error
      }
      dispatch(setToken(null));
      dispatch(setAuthenticated(false));
      router.replace("/auth");
    };
    return (
      <Pressable onPress={handleLogout} style={{ marginRight: spacing.md }}>
        {({ pressed }) => (
          <FontAwesome
            name="sign-out"
            size={24}
            color={Colors.tint}
            style={{ opacity: pressed ? 0.5 : 1 }}
          />
        )}
      </Pressable>
    );
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.tint,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarStyle: {
          backgroundColor: Colors.card,
          borderTopColor: Colors.border,
          ...shadows.sm,
        },
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
            <HeaderTitle title="Timeline" icon="clock-o" color={Colors.tint} />
          ),
          headerRight: () => (
            <RNView style={{ flexDirection: "row", alignItems: "center" }}>
              <Link href="/notifications" asChild>
                <Pressable style={{ marginRight: spacing.md }}>
                  {({ pressed }) => (
                    <RNView style={{ position: "relative" }}>
                      <FontAwesome
                        name="bell"
                        size={25}
                        color={Colors.text}
                        style={{ opacity: pressed ? 0.5 : 1 }}
                      />
                      {unreadNotifications.length > 0 && (
                        <RNView style={headerNotificationBadgeStyles.badge}>
                          <Text style={headerNotificationBadgeStyles.badgeText}>
                            {unreadNotifications.length > 99
                              ? "99+"
                              : unreadNotifications.length.toString()}
                          </Text>
                        </RNView>
                      )}
                    </RNView>
                  )}
                </Pressable>
              </Link>
              <Link href="/modal" asChild>
                <Pressable>
                  {({ pressed }) => (
                    <FontAwesome
                      name="info-circle"
                      size={25}
                      color={Colors.text}
                      style={{
                        marginRight: spacing.md,
                        opacity: pressed ? 0.5 : 1,
                      }}
                    />
                  )}
                </Pressable>
              </Link>
            </RNView>
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
            <HeaderTitle
              title="Groups"
              icon="university"
              color={Colors.error}
            />
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
            <HeaderTitle
              title="Profile"
              icon="user-circle"
              color={Colors.tint}
            />
          ),
          headerRight: () => <LogoutButton />,
        }}
      />
    </Tabs>
  );
}
