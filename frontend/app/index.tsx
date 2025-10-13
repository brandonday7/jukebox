import { Button, Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Button
        onPress={async () => {
          const res = await fetch("http://localhost:3000/vibes");
          console.log(await res.json());
        }}
        title="Fetch..."
      ></Button>
    </View>
  );
}
