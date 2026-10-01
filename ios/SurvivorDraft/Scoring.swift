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

    /// A hidden boot scores nothing yet. Bonus points subtract only when the league opted in.
    static func score(_ contestant: Contestant, bonusOn: Bool, now: Date = Date()) -> Int? {
        guard isBootPublic(contestant, now: now), let place = place(contestant.boot) else { return nil }
        if !bonusOn { return place }
        return place - idolCount(contestant, now: now) - winCount(contestant, now: now)
    }
}
