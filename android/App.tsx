import { useMemo, useState } from "react";
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text } from "react-native";
import { board } from "./src/data/board";
import { contestant, displayName, isBootPublic, latestBoots, scoreOf } from "./src/score";
import { startDiagnostics } from "./src/diagnostics";

startDiagnostics();

type Screen = { name: "home" } | { name: "board" } | { name: "team"; id: string } | { name: "privacy" };

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: "home" });
  const now = Date.now();
  const latest = useMemo(() => latestBoots(now), [now]);
  const ranked = useMemo(() => {
    return board.managers
      .map((manager) => ({
        manager,
        total: manager.picks.reduce((sum, id) => {
          const row = contestant(id);
          const points = row ? scoreOf(row, false, now) : null;
          return points == null ? sum : sum + points;
        }, 0),
      }))
      .sort((a, b) => a.total - b.total || a.manager.name.localeCompare(b.manager.name));
  }, [now]);

  if (screen.name === "privacy") {
    return (
      <SafeAreaView style={styles.screen}>
        <Text style={styles.title}>Privacy</Text>
        <Text style={styles.copy}>
          Survivor Fantasy Draft is a private family scoreboard. It does not take payment, create an account, or upload
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
          const points = scoreOf(player, false, now);
          return (
            <Text key={id} style={out ? styles.out : styles.copy}>
              {displayName(player)}
              {out && player.boot ? ` · ${player.boot}` : ""}
              {points != null ? ` · ${points}` : ""}
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
          data={ranked}
          keyExtractor={(item) => item.manager.id}
          initialNumToRender={12}
          windowSize={7}
          renderItem={({ item }) => (
            <Pressable accessibilityRole="button" onPress={() => setScreen({ name: "team", id: item.manager.id })}>
              <Text style={styles.name}>{item.manager.name}</Text>
              <Text style={styles.copy}>
                {item.total} ·{" "}
                {item.manager.picks.map((id, index) => {
                  const row = contestant(id);
                  if (!row) return null;
                  const out = isBootPublic(row, now);
                  return (
                    <Text key={id} style={out ? styles.outName : undefined}>
                      {index > 0 ? " · " : ""}
                      {displayName(row)}
                    </Text>
                  );
                })}
              </Text>
            </Pressable>
          )}
        />
        {latest.map((row) => (
          <Text key={row.id} style={styles.boot}>
            {displayName(row)}
            {row.boot ? ` · ${row.boot}` : ""}
          </Text>
        ))}
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
        The $25 buy-in is settled outside the app. Lowest score wins. A hidden boot is not on the score yet.
      </Text>
      <Text style={styles.copy}>Public boots right now: {board.contestants.filter((row) => scoreOf(row, false, now) != null).length}</Text>
      <Pressable accessibilityRole="button" onPress={() => setScreen({ name: "privacy" })}>
        <Text style={styles.link}>Privacy</Text>
      </Pressable>
    </SafeAreaView>
  );
}

/** Dark tokens from src/styles.css. Keep these hexes in lockstep with that file. */
const palette = {
  bg: "#100e0c",
  surface: "#1b1714",
  fg: "#f4efe6",
  muted: "#a89886",
  savu: "#6e4aa8",
  toka: "#e2b340",
  ember: "#e25b2a",
  boot: "#e10600",
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.bg, padding: 16 },
  title: { color: palette.fg, fontSize: 34, fontWeight: "700", marginBottom: 12 },
  name: { color: palette.fg, fontSize: 20, marginTop: 14 },
  copy: { color: palette.muted, fontSize: 15, marginTop: 4 },
  out: { color: palette.boot, fontSize: 18, marginTop: 10, fontWeight: "700" },
  outName: { color: palette.boot, fontWeight: "700" },
  link: { color: palette.toka, fontSize: 16, marginVertical: 8 },
  boot: { color: palette.fg, backgroundColor: palette.boot, padding: 10, fontWeight: "700" },
});
