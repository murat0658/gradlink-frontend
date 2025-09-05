import { Stack } from "expo-router";

export default function GroupCodeLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Group Details", headerShown: false }}
      />
      <Stack.Screen
        name="[topicTitle]"
        options={{ title: "Topic", headerShown: false }}
      />
    </Stack>
  );
}
