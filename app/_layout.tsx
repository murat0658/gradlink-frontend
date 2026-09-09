import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import "react-native-reanimated";
import { Provider, useSelector } from "react-redux";
import { store } from "./store";
import Toast from "react-native-toast-message";
import { NotificationService } from "./services/NotificationService";
import { ApiProvider } from "./components/ApiProvider";
import { selectIsAuthenticated } from "./store/selectors";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  initialRouteName: "auth",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Component to handle authentication routing
function RootLayoutNav() {
  const segments = useSegments();
  const router = useRouter();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  useEffect(() => {
    // Wait for navigation to be ready
    const timer = setTimeout(() => {
      setIsNavigationReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isNavigationReady) return;
    
    // Get current route segment
    const currentSegment = segments[0];
    
    // Check if we're on auth or signup pages
    const inAuthGroup = currentSegment === "auth" || currentSegment === "signup";

    if (!isAuthenticated) {
      // If not authenticated and not already on auth pages, redirect to auth
      if (!inAuthGroup) {
        router.replace("/auth");
      }
    } else {
      // If authenticated and on auth pages, redirect to tabs
      if (inAuthGroup) {
        router.replace("/(tabs)");
      }
    }
  }, [isAuthenticated, segments, isNavigationReady, router]);

  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack>
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="subscriptions"
          options={{ presentation: "modal", title: "Subscription" }}
        />
        <Stack.Screen
          name="notifications"
          options={{ presentation: "modal", title: "Notifications" }}
        />
      </Stack>
      <Toast />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Initialize notifications and cleanup listeners on unmount (skip on web)
  useEffect(() => {
    if (Platform.OS === "web") return undefined;

    const cleanup = NotificationService.setupNotificationListeners();
    (async () => {
      try {
        await NotificationService.requestPermissions();
        if (__DEV__) console.log("Notifications initialized");
      } catch (error) {
        if (__DEV__) console.warn("Notification init error:", error);
      }
    })();
    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  // Ensure store is ready before rendering
  if (!store) {
    console.error("🔧 Store not available");
    return null;
  }

  return (
    <Provider store={store}>
      <ApiProvider>
        <RootLayoutNav />
      </ApiProvider>
    </Provider>
  );
}
