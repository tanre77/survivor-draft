import XCTest
@testable import SurvivorDraft

final class ScoringTests: XCTestCase {
    private let before = ISO8601DateFormatter().date(from: "2026-09-30T22:00:00Z")!
    private let after = ISO8601DateFormatter().date(from: "2026-10-01T06:00:01Z")!

    func testAnaStaysHiddenUntilPacificAirtime() {
        let ana = BoardData.contestants.first { $0.id == "ana" }!
        XCTAssertFalse(Scoring.isBootPublic(ana, now: before))
        XCTAssertTrue(Scoring.isBootPublic(ana, now: after))
        XCTAssertNil(Scoring.score(ana, bonusOn: false, now: before))
        XCTAssertEqual(Scoring.score(ana, bonusOn: false, now: after), 20)
    }

    func testBonusSubtractsOnlyWhenOptedIn() {
        let rob = BoardData.contestants.first { $0.id == "rob" }!
        let booted = Contestant(id: rob.id, first: rob.first, last: rob.last, age: rob.age, hometown: rob.hometown, job: rob.job, tribe: rob.tribe, status: "out", boot: "10th voted out", revealAt: nil)
        XCTAssertEqual(Scoring.score(booted, bonusOn: false, now: after), 12)
        XCTAssertEqual(Scoring.score(booted, bonusOn: true, now: after), 10)
    }

    func testQuitWithAPlaceUsesThatPlace() {
        XCTAssertEqual(Scoring.finishPoints("19th place · Quit · Day 6", castSize: 21), 19)
        XCTAssertEqual(Scoring.finishPoints("Medevac · Day 4", castSize: 21), 0)
    }

    func testBoardIsComplete() {
        XCTAssertEqual(BoardData.contestants.count, 21)
        XCTAssertEqual(BoardData.managers.count, 23)
        XCTAssertTrue(BoardData.managers.allSatisfy { $0.picks.count == 3 })
        XCTAssertTrue(Scoring.seasonStillOpen)
    }

    func testLatestNightOutranksAHigherFinish() {
        let day10 = ISO8601DateFormatter().date(from: "2026-10-22T06:00:01Z")!
        XCTAssertEqual(Scoring.latestBoots(now: day10).map(\.id), ["alexis", "linnea"])
    }

    func testOriStaysHiddenUntilNineThirtyEastern() {
        let ori = BoardData.contestants.first { $0.id == "ori" }!
        XCTAssertEqual(ori.status, "out")
        XCTAssertEqual(ori.boot, "7th voted out · Day 12")
        XCTAssertEqual(ori.revealAt, "2026-10-29T01:30:00.000Z")
        let before = ISO8601DateFormatter().date(from: "2026-10-29T01:29:59Z")!
        let after = ISO8601DateFormatter().date(from: "2026-10-29T01:30:00Z")!
        XCTAssertFalse(Scoring.isBootPublic(ori, now: before))
        XCTAssertTrue(Scoring.isBootPublic(ori, now: after))
        XCTAssertNil(Scoring.score(ori, bonusOn: false, now: before))
        XCTAssertEqual(Scoring.score(ori, bonusOn: false, now: after), 15)
        XCTAssertEqual(Scoring.latestBoots(now: after).map(\.id), ["ori"])
    }
}
