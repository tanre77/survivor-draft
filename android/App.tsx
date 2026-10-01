import { useMemo, useState } from "react";
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { board } from "./src/data/board";
import { contestant, displayName, isBootPublic, scoreOf } from "./src/score";
import { startDiagnostics } from "./src/diagnostics";

startDiagnostics();

type Screen = { name: "home" } | { name: "board" } | { name: "team"; id: string } | { name: "privacy" };

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: "home" });
  const now = Date.now();
  const latest = useMemo(
    () => [...board.contestants].reverse().find((row) => isBootPublic(row, now)),
    [now],
  );

  if (screen.name === "privacy") {
    return (
      <SafeAreaView style={styles.screen}>
        <Text style={styles.title}>Privacy</Text>
        <Text style={styles.copy}>
          Survivor 51 Draft is a private family scoreboard. It does not take payment, create an account, or upload
          your seat. It does not ask for location, contacts, camera, or microphone. Crashlytics stays off until a
          Firebase config file is added.
        </Text>
        <Pressable accessibilityRole="button" onPress={() => setScreen({ name: "home" })}>
          <Text style={styles.link}>Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (screen.name === "team") {
    const manager = board.managers.find((row) => row.id === screen.id);
    return (
      <SafeAreaView style={styles.screen}>
        <Pressable accessibilityRole="button" onPress={() => setScreen({ name: "board" })}>
          <Text style={styles.link}>Board</Text>
        </Pressable>
        <Text style={styles.title}>{manager?.name}</Text>
        {manager?.picks.map((id) => {
          const player = contestant(id);
          if (!player) return null;
          const out = isBootPublic(player, now);
          return (
            <Text key={id} style={out ? styles.out : styles.copy}>
              {displayName(player)}
              {out && player.boot ? ` · ${player.boot}` : ""}
            </Text>
          );
        })}
      </SafeAreaView>
    );
  }

  if (screen.name === "board") {
    return (
      <SafeAreaView style={styles.screen}>
        <Pressable accessibilityRole="button" onPress={() => setScreen({ name: "home" })}>
          <Text style={styles.link}>Leagues</Text>
        </Pressable>
        <FlatList
          data={board.managers}
          keyExtractor={(item) => item.id}
          initialNumToRender={12}
          windowSize={7}
          renderItem={({ item }) => (
            <Pressable accessibilityRole="button" onPress={() => setScreen({ name: "team", id: item.id })}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.copy}>
                {item.picks
                  .map((id) => contestant(id))
                  .filter((row) => row != null)
                  .map((row) => displayName(row))
                  .join(" · ")}
              </Text>
            </Pressable>
          )}
        />
        {latest ? (
          <Text style={styles.boot}>
            {displayName(latest)}
            {latest.boot ? ` · ${latest.boot}` : ""}
          </Text>
        ) : null}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.title}>Leagues</Text>
      <Pressable accessibilityRole="button" onPress={() => setScreen({ name: "board" })}>
        <Text style={styles.name}>Survivor 51</Text>
        <Text style={styles.copy}>In progress</Text>
      </Pressable>
      <Text style={styles.copy}>
        The $10 buy-in is settled outside the app. Lowest score wins. A hidden boot is not on the score yet.
      </Text>
      <Text style={styles.copy}>Public boots right now: {board.contestants.filter((row) => scoreOf(row, false, now) != null).length}</Text>
      <Pressable accessibilityRole="button" onPress={() => setScreen({ name: "privacy" })}>
        <Text style={styles.link}>Privacy</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#100e0c", padding: 16 },
  title: { color: "#f4efe6", fontSize: 34, fontWeight: "700", marginBottom: 12 },
  name: { color: "#f4efe6", fontSize: 20, marginTop: 14 },
  copy: { color: "#b7aea2", fontSize: 15, marginTop: 4 },
  out: { color: "#e10600", fontSize: 18, marginTop: 10, fontWeight: "700" },
  link: { color: "#e2b340", fontSize: 16, marginVertical: 8 },
  boot: { color: "#fff", backgroundColor: "#e10600", padding: 10, fontWeight: "700" },
});
