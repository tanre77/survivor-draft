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

    /// Early boots are worth the most. The sole survivor is 1. A quit or medevac is 0.
    static func finishPoints(_ boot: String?, castSize: Int, advanced: Bool = false) -> Int? {
        guard let boot else { return nil }
        let text = boot.lowercased()
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

    /// A hidden boot scores nothing yet. Bonus points subtract only when the league opted in.
    static func score(_ contestant: Contestant, bonusOn: Bool, now: Date = Date()) -> Int? {
        guard isBootPublic(contestant, now: now),
              let points = finishPoints(contestant.boot, castSize: BoardData.contestants.count) else { return nil }
        if !bonusOn { return points }
        return points - idolCount(contestant, now: now) - winCount(contestant, now: now)
    }
}
