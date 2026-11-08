import Foundation

enum Scoring {
    static func released(_ at: String?, now: Date) -> Bool {
        guard let at else { return true }
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        guard let time = formatter.date(from: at) ?? ISO8601DateFormatter().date(from: at) else { return false }
        return now >= time
    }

    static func isBootPublic(_ contestant: Contestant, now: Date = Date()) -> Bool {
        contestant.status == "out" && released(contestant.revealAt, now: now)
    }

    static func displayName(_ contestant: Contestant) -> String {
        contestant.id == "kilby" ? "Danny Kilby" : "\(contestant.first) \(contestant.last)".trimmingCharacters(in: .whitespaces)
    }

    static func idolCount(_ contestant: Contestant, now: Date = Date()) -> Int {
        guard let row = BoardData.bonuses[contestant.id], row.idols > 0, released(row.idolsAt, now: now) else { return 0 }
        return row.idols
    }

    static func winCount(_ contestant: Contestant, now: Date = Date()) -> Int {
        guard let row = BoardData.bonuses[contestant.id], row.wins > 0, released(row.winsAt, now: now) else { return 0 }
        return row.wins
    }

    static func place(_ boot: String?) -> Int? {
        guard let boot, let match = boot.firstMatch(of: /\d+/) else { return nil }
        return Int(match.output)
    }

    /// Standard scoring is one point per place. Advanced scoring charges the first six boots as pre-jury, two points apart, then the jury one point apart.
    static func points(forPlace place: Int, castSize: Int, advanced: Bool) -> Int {
        if !advanced { return place }
        let preJury = min(6, max(0, castSize - 1))
        let juryCount = castSize - preJury
        if place <= juryCount { return place }
        return juryCount + (place - juryCount) * 2
    }

    /// Early boots are worth the most. The sole survivor is 1. A quit with a finish place uses that place. A quit or medevac with no place is 0.
    static func finishPoints(_ boot: String?, castSize: Int, advanced: Bool = false) -> Int? {
        guard let boot else { return nil }
        let text = boot.lowercased()
        if text.range(of: #"\d+(?:st|nd|rd|th) place"#, options: .regularExpression) != nil, let n = place(boot) {
            let finish = (n == 3 && (text.contains("finalist") || text.contains("final tribal"))) || text.contains("tie for second") || text.contains("tied for 2nd") ? 2 : n
            return max(0, points(forPlace: finish, castSize: castSize, advanced: advanced))
        }
        if text.contains("quit") || text.contains("medevac") || text.contains("medical") || text.contains("evacuat") {
            return 0
        }
        if text.contains("sole survivor") || text.range(of: #"\bwinner\b"#, options: .regularExpression) != nil {
            return 1
        }
        if text.contains("runner-up") || text.contains("runner up") {
            return points(forPlace: 2, castSize: castSize, advanced: advanced)
        }
        guard let n = place(boot) else { return nil }
        let finish: Int
        if (text.contains("place") || text.contains("finalist")), !text.contains("voted out"), !text.contains("eliminat") {
            finish = n
        } else {
            finish = castSize - n + 1
        }
        return max(0, points(forPlace: finish, castSize: castSize, advanced: advanced))
    }

    private static func capture(_ pattern: String, in text: String) -> String? {
        guard let regex = try? NSRegularExpression(pattern: pattern, options: [.caseInsensitive]) else { return nil }
        let range = NSRange(text.startIndex..., in: text)
        guard let match = regex.firstMatch(in: text, range: range),
              match.numberOfRanges > 1,
              let hit = Range(match.range(at: 1), in: text) else { return nil }
        return String(text[hit])
    }

    private static func bootDay(_ boot: String?) -> Int {
        guard let boot, let digits = capture(#"day\s+(\d+)"#, in: boot) else { return 0 }
        return Int(digits) ?? 0
    }

    private static func votedOutOrder(_ boot: String?) -> Int {
        guard let boot, let digits = capture(#"(\d+)(?:st|nd|rd|th)\s+voted out"#, in: boot) else { return 0 }
        return Int(digits) ?? 0
    }

    static func ordinal(_ place: Int) -> String {
        let mod = place % 100
        if (11...13).contains(mod) { return "\(place)th" }
        switch place % 10 {
        case 1: return "\(place)st"
        case 2: return "\(place)nd"
        case 3: return "\(place)rd"
        default: return "\(place)th"
        }
    }

    static func nameList(_ names: [String]) -> String {
        switch names.count {
        case 0: return ""
        case 1: return names[0]
        case 2: return "\(names[0]) and \(names[1])"
        default:
            let head = names.dropLast().joined(separator: ", ")
            return "\(head) and \(names[names.count - 1])"
        }
    }

    /// Survivor 51 stays in progress while anyone is still listed as active.
    static var seasonStillOpen: Bool {
        BoardData.contestants.contains { $0.status != "out" }
    }

    /// Mirrors `latestPublicBoots` in shared/score.mjs. The latest night wins, not the highest finish place.
    static func latestBoots(now: Date = Date()) -> [Contestant] {
        let gone = BoardData.contestants.filter { isBootPublic($0, now: now) && bootDay($0.boot) > 0 }
        let day = gone.map { bootDay($0.boot) }.max() ?? 0
        return gone
            .filter { bootDay($0.boot) == day }
            .sorted { votedOutOrder($0.boot) < votedOutOrder($1.boot) }
    }

    /// A hidden boot scores nothing yet. Bonus points subtract only when the league opted in.
    static func score(_ contestant: Contestant, bonusOn: Bool, now: Date = Date()) -> Int? {
        guard isBootPublic(contestant, now: now),
              let points = finishPoints(contestant.boot, castSize: BoardData.contestants.count) else { return nil }
        if !bonusOn { return points }
        return points - idolCount(contestant, now: now) - winCount(contestant, now: now)
    }
}
