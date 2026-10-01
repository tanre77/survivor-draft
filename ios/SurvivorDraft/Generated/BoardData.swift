import Foundation

struct Contestant: Identifiable, Hashable {
    let id: String
    let first: String
    let last: String
    let age: Int
    let hometown: String
    let job: String
    let tribe: String
    let status: String
    let boot: String?
    let revealAt: String?
}

struct Manager: Identifiable, Hashable {
    let id: String
    let name: String
    let bg: String
    let fg: String
    let picks: [String]
}

struct Bonus: Hashable {
    let idols: Int
    let wins: Int
    let winsAt: String?
    let idolsAt: String?
}

enum BoardData {
    static let contestants: [Contestant] = [
        Contestant(id: "aaliyah", first: "Aaliyah", last: "Puglia", age: 24, hometown: "Providence, RI", job: "Chef", tribe: "toka", status: "out", boot: "1st voted out · Day 3", revealAt: nil),
        Contestant(id: "alexis", first: "Alexis", last: "Levine", age: 34, hometown: "Atlanta, GA", job: "Criminal defense attorney", tribe: "savu", status: "active", boot: nil, revealAt: nil),
        Contestant(id: "ana", first: "Ana", last: "Sani", age: 34, hometown: "Toronto, ON", job: "Voice actress", tribe: "savu", status: "out", boot: "2nd voted out · Day 5", revealAt: "2026-10-01T06:00:00.000Z"),
        Contestant(id: "brady", first: "Brady", last: "Booker", age: 27, hometown: "Knoxville, TN", job: "Pro wrestler", tribe: "toka", status: "active", boot: nil, revealAt: nil),
        Contestant(id: "carter", first: "Carter", last: "Krull", age: 24, hometown: "Sioux Falls, SD", job: "Livestock farmer", tribe: "savu", status: "active", boot: nil, revealAt: nil),
        Contestant(id: "cristian", first: "Cristian", last: "Chavez", age: 25, hometown: "Salt Lake City, UT", job: "Head of HR", tribe: "savu", status: "active", boot: nil, revealAt: nil),
        Contestant(id: "devin", first: "Devin", last: "Way", age: 33, hometown: "Los Angeles, CA", job: "Actor", tribe: "toka", status: "active", boot: nil, revealAt: nil),
        Contestant(id: "eric", first: "Eric", last: "Macksoud", age: 34, hometown: "Windsor Locks, CT", job: "Mental health counselor", tribe: "savu", status: "active", boot: nil, revealAt: nil),
        Contestant(id: "jelly", first: "Jelly", last: "Loblack", age: 29, hometown: "Bloomington, IN", job: "Sociology professor", tribe: "toka", status: "active", boot: nil, revealAt: nil),
        Contestant(id: "jenna", first: "Jenna", last: "Doore", age: 30, hometown: "Toledo, OH", job: "Wedding photographer", tribe: "toka", status: "active", boot: nil, revealAt: nil),
        Contestant(id: "kilby", first: "Kilby", last: "", age: 30, hometown: "London, ON", job: "Game designer", tribe: "toka", status: "active", boot: nil, revealAt: nil),
        Contestant(id: "kristin", first: "Kristin", last: "Flickinger", age: 49, hometown: "Santa Barbara, CA", job: "Crisis management", tribe: "savu", status: "active", boot: nil, revealAt: nil),
        Contestant(id: "lewis", first: "Lewis", last: "Kelly", age: 28, hometown: "Corozal, PR", job: "Farmer", tribe: "toka", status: "active", boot: nil, revealAt: nil),
        Contestant(id: "linnea", first: "Linnea", last: "Capobianco", age: 25, hometown: "Jersey City, NJ", job: "Entrepreneur", tribe: "savu", status: "active", boot: nil, revealAt: nil),
        Contestant(id: "maggie", first: "Maggie", last: "Nestor", age: 40, hometown: "Charles Town, WV", job: "Farmer", tribe: "toka", status: "active", boot: nil, revealAt: nil),
        Contestant(id: "mike", first: "Mike", last: "Pinsky", age: 32, hometown: "New York, NY", job: "Baseball executive", tribe: "toka", status: "active", boot: nil, revealAt: nil),
        Contestant(id: "ori", first: "Ori", last: "Jean-Charles", age: 27, hometown: "Spring Valley, NY", job: "Personal trainer", tribe: "savu", status: "active", boot: nil, revealAt: nil),
        Contestant(id: "patt", first: "Patt", last: "Cannaday", age: 33, hometown: "Washington, D.C.", job: "Federal prosecutor", tribe: "toka", status: "active", boot: nil, revealAt: nil),
        Contestant(id: "rob", first: "Rob", last: "Antonson", age: 40, hometown: "Cumberland, RI", job: "Airline gate agent", tribe: "savu", status: "active", boot: nil, revealAt: nil),
        Contestant(id: "sharonda", first: "Sharonda", last: "Cox", age: 34, hometown: "Richmond, KY", job: "OB/GYN resident", tribe: "savu", status: "active", boot: nil, revealAt: nil),
        Contestant(id: "thien-an", first: "Thien An", last: "Nguyen", age: 24, hometown: "Fort Worth, TX", job: "Medical student", tribe: "toka", status: "active", boot: nil, revealAt: nil)
    ]

    static let managers: [Manager] = [
        Manager(id: "rick", name: "Rick", bg: "#8fb56a", fg: "#1a140e", picks: ["mike", "brady", "devin"]),
        Manager(id: "robbie", name: "Robbie", bg: "#f4efe6", fg: "#1a140e", picks: ["jelly", "devin", "alexis"]),
        Manager(id: "kris", name: "Kris", bg: "#d11378", fg: "#fff6fb", picks: ["jenna", "sharonda", "thien-an"]),
        Manager(id: "elise", name: "Elise", bg: "#c9eef2", fg: "#1a140e", picks: ["jelly", "brady", "maggie"]),
        Manager(id: "jared", name: "Jared", bg: "#d5e15a", fg: "#1a140e", picks: ["thien-an", "lewis", "sharonda"]),
        Manager(id: "luke", name: "Luke", bg: "#6d46b8", fg: "#f7f2ff", picks: ["lewis", "brady", "maggie"]),
        Manager(id: "kirt", name: "Kirt", bg: "#2f6fed", fg: "#f3f7ff", picks: ["alexis", "maggie", "linnea"]),
        Manager(id: "lauren", name: "Lauren", bg: "#d2c2f7", fg: "#1a140e", picks: ["jenna", "sharonda", "kilby"]),
        Manager(id: "erin", name: "Erin", bg: "#f7c2da", fg: "#1a140e", picks: ["ori", "mike", "carter"]),
        Manager(id: "shelly", name: "Shelly", bg: "#6b46b0", fg: "#f7f2ff", picks: ["lewis", "rob", "devin"]),
        Manager(id: "josh", name: "Josh", bg: "#8d7362", fg: "#f8f3ec", picks: ["brady", "linnea", "patt"]),
        Manager(id: "jacob", name: "Jacob G", bg: "#2f8a3c", fg: "#f3fff4", picks: ["ori", "lewis", "thien-an"]),
        Manager(id: "grandma", name: "Grandma", bg: "#f4efe6", fg: "#1a140e", picks: ["jelly", "mike", "alexis"]),
        Manager(id: "robin", name: "Robin", bg: "#1c8a34", fg: "#f3fff5", picks: ["jenna", "linnea", "ana"]),
        Manager(id: "dom", name: "Dom", bg: "#1d4ed8", fg: "#f3f7ff", picks: ["jenna", "ori", "alexis"]),
        Manager(id: "haley", name: "Haley", bg: "#f0d429", fg: "#1a140e", picks: ["kilby", "rob", "eric"]),
        Manager(id: "kiana", name: "Kiana", bg: "#d32222", fg: "#fff5f5", picks: ["linnea", "jelly", "ana"]),
        Manager(id: "keegan", name: "Keegan", bg: "#f4efe6", fg: "#1a140e", picks: ["mike", "rob", "thien-an"]),
        Manager(id: "ryan", name: "Ryan", bg: "#8ceaf6", fg: "#1a140e", picks: ["carter", "kristin", "patt"]),
        Manager(id: "tivin", name: "Tivin", bg: "#c2410c", fg: "#fff6f1", picks: ["sharonda", "kristin", "devin"]),
        Manager(id: "tanner", name: "Tanner", bg: "#e4c48a", fg: "#1a140e", picks: ["rob", "maggie", "kilby"]),
        Manager(id: "jen", name: "Jen", bg: "#9333ea", fg: "#fbf7ff", picks: ["kilby", "kristin", "carter"]),
        Manager(id: "jenna-m", name: "Jenna", bg: "#e0ae2a", fg: "#1a140e", picks: ["ori", "kristin", "patt"])
    ]

    static let bonuses: [String: Bonus] = [
        "alexis": Bonus(idols: 0, wins: 1, winsAt: nil, idolsAt: nil),
        "ana": Bonus(idols: 0, wins: 1, winsAt: nil, idolsAt: nil),
        "carter": Bonus(idols: 0, wins: 1, winsAt: nil, idolsAt: nil),
        "cristian": Bonus(idols: 0, wins: 1, winsAt: nil, idolsAt: nil),
        "eric": Bonus(idols: 0, wins: 1, winsAt: nil, idolsAt: nil),
        "kristin": Bonus(idols: 0, wins: 1, winsAt: nil, idolsAt: nil),
        "linnea": Bonus(idols: 0, wins: 1, winsAt: nil, idolsAt: nil),
        "ori": Bonus(idols: 0, wins: 1, winsAt: nil, idolsAt: nil),
        "rob": Bonus(idols: 1, wins: 1, winsAt: nil, idolsAt: nil),
        "sharonda": Bonus(idols: 0, wins: 1, winsAt: nil, idolsAt: nil),
        "brady": Bonus(idols: 0, wins: 2, winsAt: "2026-10-01T06:00:00.000Z", idolsAt: nil),
        "devin": Bonus(idols: 0, wins: 2, winsAt: "2026-10-01T06:00:00.000Z", idolsAt: nil),
        "jelly": Bonus(idols: 0, wins: 2, winsAt: "2026-10-01T06:00:00.000Z", idolsAt: nil),
        "jenna": Bonus(idols: 0, wins: 2, winsAt: "2026-10-01T06:00:00.000Z", idolsAt: nil),
        "kilby": Bonus(idols: 0, wins: 2, winsAt: "2026-10-01T06:00:00.000Z", idolsAt: nil),
        "lewis": Bonus(idols: 0, wins: 2, winsAt: "2026-10-01T06:00:00.000Z", idolsAt: nil),
        "maggie": Bonus(idols: 0, wins: 2, winsAt: "2026-10-01T06:00:00.000Z", idolsAt: nil),
        "mike": Bonus(idols: 0, wins: 2, winsAt: "2026-10-01T06:00:00.000Z", idolsAt: nil),
        "patt": Bonus(idols: 0, wins: 2, winsAt: "2026-10-01T06:00:00.000Z", idolsAt: nil),
        "thien-an": Bonus(idols: 0, wins: 2, winsAt: "2026-10-01T06:00:00.000Z", idolsAt: nil)
    ]
}
