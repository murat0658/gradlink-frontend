import { Stack } from "expo-router";

export default function GroupsLayout() {
  return (
    <Stack>
      <Stack.Screen name="groups" options={{ title: "Groups" }} />
      <Stack.Screen name="[code]" options={{ title: "Group Info" }} />
    </Stack>
  );
}
