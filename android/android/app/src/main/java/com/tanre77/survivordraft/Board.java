package com.tanre77.survivordraft;

import android.content.Context;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

final class Board {
    private final List<Contestant> contestants;
    private final List<Seat> seats;

    private Board(List<Contestant> contestants, List<Seat> seats) {
        this.contestants = contestants;
        this.seats = seats;
    }

    static Board load(Context context) throws Exception {
        InputStream input = context.getAssets().open("board.json");
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        byte[] chunk = new byte[8192];
        int read;
        while ((read = input.read(chunk)) != -1) buffer.write(chunk, 0, read);
        input.close();
        JSONObject root = new JSONObject(new String(buffer.toByteArray(), StandardCharsets.UTF_8));
        JSONArray cast = root.getJSONArray("contestants");
        Map<String, Contestant> byId = new HashMap<>();
        List<Contestant> contestants = new ArrayList<>();
        long now = System.currentTimeMillis();
        for (int i = 0; i < cast.length(); i++) {
            JSONObject row = cast.getJSONObject(i);
            Contestant person = new Contestant(
                    row.getString("id"),
                    row.optString("first"),
                    row.optString("boot", ""),
                    "out".equals(row.optString("status")),
                    row.optString("revealAt", ""),
                    now
            );
            contestants.add(person);
            byId.put(person.id, person);
        }
        JSONArray managers = root.getJSONArray("managers");
        List<Seat> seats = new ArrayList<>();
        for (int i = 0; i < managers.length(); i++) {
            JSONObject row = managers.getJSONObject(i);
            JSONArray picks = row.getJSONArray("picks");
            int total = 0;
            StringBuilder names = new StringBuilder();
            for (int p = 0; p < picks.length(); p++) {
                Contestant person = byId.get(picks.getString(p));
                if (person == null) continue;
                if (names.length() > 0) names.append(", ");
                names.append(person.first);
                Integer points = person.points(contestants.size());
                if (points != null) total += points;
            }
            seats.add(new Seat(row.getString("name"), total, names.toString()));
        }
        return new Board(contestants, seats);
    }

    List<Seat> ranked() {
        List<Seat> copy = new ArrayList<>(seats);
        Collections.sort(copy, Comparator.comparingInt(seat -> seat.total));
        if (!copy.isEmpty()) copy.get(0).leading = true;
        return copy;
    }

    static final class Seat {
        final String name;
        final int total;
        final String picks;
        boolean leading;

        Seat(String name, int total, String picks) {
            this.name = name;
            this.total = total;
            this.picks = picks;
        }

        String line() {
            return total + "  " + name + "\n" + picks;
        }
    }

    private static final class Contestant {
        final String id;
        final String first;
        final String boot;
        final boolean out;
        final boolean revealed;

        Contestant(String id, String first, String boot, boolean out, String revealAt, long now) {
            this.id = id;
            this.first = first;
            this.boot = boot;
            this.out = out;
            this.revealed = revealAt.isEmpty() || parseTime(revealAt) <= now;
        }

        Integer points(int castSize) {
            if (!out || !revealed || boot.isEmpty()) return null;
            return finishPoints(boot, castSize);
        }
    }

    static Integer finishPoints(String boot, int castSize) {
        String text = boot.toLowerCase();
        Matcher placed = Pattern.compile("(\\d+)(?:st|nd|rd|th) place").matcher(text);
        if (placed.find()) {
            int n = Integer.parseInt(placed.group(1));
            if (n == 3 && (text.contains("finalist") || text.contains("final tribal"))) n = 2;
            return Math.max(0, n);
        }
        if (text.contains("quit") || text.contains("medevac") || text.contains("medical") || text.contains("evacuat")) return 0;
        if (text.contains("sole survivor") || text.matches(".*\\bwinner\\b.*")) return 1;
        if (text.contains("runner-up") || text.contains("runner up")) return 2;
        Matcher number = Pattern.compile("(\\d+)").matcher(text);
        if (!number.find()) return null;
        int n = Integer.parseInt(number.group(1));
        int place = (text.contains("place") || text.contains("finalist")) && !text.contains("voted out") && !text.contains("eliminat")
                ? n
                : castSize - n + 1;
        return Math.max(0, place);
    }

    private static long parseTime(String iso) {
        try {
            return java.time.Instant.parse(iso).toEpochMilli();
        } catch (Exception ignored) {
            return Long.MAX_VALUE;
        }
    }
}
