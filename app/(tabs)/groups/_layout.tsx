import { Stack } from "expo-router";

export default function GroupsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Groups", headerShown: false }}
      />
      <Stack.Screen
        name="[code]"
        options={{ title: "Group Info", headerShown: false }}
      />
    </Stack>
  );
}
