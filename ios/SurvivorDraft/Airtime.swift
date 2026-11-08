import Foundation

/// Mirrors `src/data/airtime.ts` and `revealAtFor` in `src/lib/wiki-board.ts`.
enum Airtime {
    static let eastern = TimeZone(identifier: "America/New_York")!

    struct Wall {
        var weekday: String
        var year: Int
        var month: Int
        var day: Int
        var hour: Int
        var minute: Int
    }

    struct EpisodeFinish {
        let at: Date
        let done: Bool
    }

    static func wall(_ date: Date, zone: TimeZone = eastern) -> Wall {
        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = zone
        calendar.locale = Locale(identifier: "en_US_POSIX")
        let parts = calendar.dateComponents([.year, .month, .day, .hour, .minute, .weekday], from: date)
        let names = ["", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        return Wall(
            weekday: names[parts.weekday ?? 1],
            year: parts.year ?? 0,
            month: parts.month ?? 0,
            day: parts.day ?? 0,
            hour: parts.hour ?? 0,
            minute: parts.minute ?? 0
        )
    }

    private static func utcCalendar() -> Calendar {
        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = TimeZone(secondsFromGMT: 0)!
        calendar.locale = Locale(identifier: "en_US_POSIX")
        return calendar
    }

    /// Guess the instant in UTC, then shift by how far Eastern disagrees. Same correction the web uses.
    static func atEastern(year: Int, month: Int, day: Int, hour: Int, minute: Int) -> Date {
        let calendar = utcCalendar()
        let guess = calendar.date(from: DateComponents(year: year, month: month, day: day, hour: hour, minute: minute, second: 0))!
        let shown = wall(guess)
        let shownUtc = calendar.date(from: DateComponents(
            year: shown.year,
            month: shown.month,
            day: shown.day,
            hour: shown.hour,
            minute: shown.minute,
            second: 0
        ))!
        return guess.addingTimeInterval(-shownUtc.timeIntervalSince(guess))
    }

    static func episodeFinish(_ now: Date) -> EpisodeFinish {
        let here = wall(now)
        let weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        let today = weekdays.firstIndex(of: here.weekday) ?? 0
        let sinceWed = (today - 3 + 7) % 7
        let calendar = utcCalendar()
        let todayAt16 = calendar.date(from: DateComponents(year: here.year, month: here.month, day: here.day, hour: 16))!
        let shifted = todayAt16.addingTimeInterval(TimeInterval(-sinceWed * 86_400))
        let lastDay = wall(shifted)
        let last = atEastern(year: lastDay.year, month: lastDay.month, day: lastDay.day, hour: 21, minute: 30)
        if now < last {
            return EpisodeFinish(at: last, done: false)
        }
        if now.timeIntervalSince(last) < 36 * 60 * 60 {
            return EpisodeFinish(at: last, done: true)
        }
        let nextAnchor = calendar.date(from: DateComponents(year: lastDay.year, month: lastDay.month, day: lastDay.day, hour: 16))!
        let nextShifted = nextAnchor.addingTimeInterval(7 * 86_400)
        let nextDay = wall(nextShifted)
        return EpisodeFinish(at: atEastern(year: nextDay.year, month: nextDay.month, day: nextDay.day, hour: 21, minute: 30), done: false)
    }

    static func episodeFinishLine(_ now: Date, locale: Locale = .current, timeZone: TimeZone = .current) -> String {
        let finish = episodeFinish(now)
        let formatter = DateFormatter()
        formatter.locale = locale
        formatter.timeZone = timeZone
        formatter.dateFormat = "EEEE, MMM d, h:mm a zzz"
        let when = formatter.string(from: finish.at)
        if finish.done {
            return "This week's episode finished \(when)."
        }
        return "This week's episode finishes \(when)."
    }

    /// Hold a new Wednesday boot from 8:00pm until 9:30pm Eastern. Any other time, it is already public.
    static func revealAt(for now: Date) -> Date {
        let shown = wall(now)
        let during = shown.weekday == "Wed" && (shown.hour > 20 || shown.hour == 20 || (shown.hour == 21 && shown.minute < 30))
        if during && shown.hour >= 20 {
            return atEastern(year: shown.year, month: shown.month, day: shown.day, hour: 21, minute: 30)
        }
        return now.addingTimeInterval(-1)
    }
}
