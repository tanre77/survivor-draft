import XCTest
@testable import SurvivorDraft

final class AirtimeTests: XCTestCase {
    private func date(_ iso: String) -> Date {
        let fractional = ISO8601DateFormatter()
        fractional.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        if let parsed = fractional.date(from: iso) ?? ISO8601DateFormatter().date(from: iso) {
            return parsed
        }
        XCTFail("could not parse \(iso)")
        return .distantPast
    }

    func testWednesdayEpisodeFinishesAtNineThirtyEastern() {
        let during = date("2026-10-29T01:00:00Z")
        let finish = Airtime.episodeFinish(during)
        XCTAssertFalse(finish.done)
        XCTAssertEqual(finish.at.timeIntervalSince1970, date("2026-10-29T01:30:00Z").timeIntervalSince1970, accuracy: 1)

        let after = Airtime.episodeFinish(date("2026-10-29T01:33:00Z"))
        XCTAssertTrue(after.done)
        XCTAssertEqual(after.at.timeIntervalSince1970, finish.at.timeIntervalSince1970, accuracy: 1)

        let tuesday = Airtime.episodeFinish(date("2026-10-27T16:00:00Z"))
        XCTAssertFalse(tuesday.done)
        XCTAssertEqual(tuesday.at.timeIntervalSince1970, date("2026-10-29T01:30:00Z").timeIntervalSince1970, accuracy: 1)

        let line = Airtime.episodeFinishLine(
            after.at,
            locale: Locale(identifier: "en_US"),
            timeZone: TimeZone(identifier: "America/New_York")!
        )
        XCTAssertTrue(line.contains("finished"))
    }

    func testWednesdayBootWaitsUntilNineThirtyEastern() {
        let during = date("2026-10-22T01:00:00Z")
        XCTAssertEqual(
            Airtime.revealAt(for: during).timeIntervalSince1970,
            date("2026-10-22T01:30:00Z").timeIntervalSince1970,
            accuracy: 1
        )
        let atEight = date("2026-10-22T00:00:00Z")
        XCTAssertEqual(
            Airtime.revealAt(for: atEight).timeIntervalSince1970,
            date("2026-10-22T01:30:00Z").timeIntervalSince1970,
            accuracy: 1
        )
        let beforeShow = date("2026-10-21T23:59:00Z")
        XCTAssertEqual(
            Airtime.revealAt(for: beforeShow).timeIntervalSince1970,
            beforeShow.addingTimeInterval(-1).timeIntervalSince1970,
            accuracy: 1
        )
        let morningAfter = date("2026-10-22T17:00:00Z")
        XCTAssertLessThan(Airtime.revealAt(for: morningAfter), morningAfter)
    }
}
