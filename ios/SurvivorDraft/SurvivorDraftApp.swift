import SwiftUI

@main
struct SurvivorDraftApp: App {
    init() {
        CrashReporting.start()
    }

    var body: some Scene {
        WindowGroup {
            LeagueListView()
        }
    }
}

struct LeagueListView: View {
    var body: some View {
        NavigationStack {
            List {
                Section("In progress") {
                    NavigationLink("Survivor 51") {
                        BoardView()
                    }
                }
                Section {
                    Text("Seats stay on this device. The $25 buy-in is settled outside the app. This app does not take payment.")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                }
            }
            .navigationTitle("Leagues")
            .toolbar {
                NavigationLink("Privacy") { PolicyView() }
            }
        }
    }
}

struct BoardView: View {
    private var revealed: [Contestant] {
        BoardData.contestants.filter { Scoring.isBootPublic($0) }
    }

    private var ranked: [Manager] {
        BoardData.managers.sorted { seatTotal($0) < seatTotal($1) }
    }

    var body: some View {
        List(ranked) { manager in
            NavigationLink {
                TeamView(manager: manager)
            } label: {
                HStack {
                    Circle()
                        .fill(Color(hex: manager.bg))
                        .frame(width: 28, height: 28)
                        .accessibilityHidden(true)
                    VStack(alignment: .leading) {
                        Text(manager.name)
                        picksLine(manager)
                            .font(.caption)
                            .lineLimit(1)
                    }
                    Spacer()
                    Text("\(seatTotal(manager))")
                        .font(.title3.monospacedDigit().weight(.semibold))
                        .foregroundStyle(Color(red: 0.89, green: 0.70, blue: 0.25))
                }
            }
        }
        .navigationTitle("Survivor 51")
        .safeAreaInset(edge: .bottom) {
            if let latest = revealed.last {
                Text("\(Scoring.displayName(latest)) · \(latest.boot ?? "out")")
                    .font(.footnote.weight(.semibold))
                    .frame(maxWidth: .infinity)
                    .padding(10)
                    .background(Color(red: 0.88, green: 0.02, blue: 0))
                    .foregroundStyle(.white)
            }
        }
    }

    private func picksLine(_ manager: Manager) -> Text {
        manager.picks.enumerated().reduce(Text("")) { line, item in
            let (index, id) = item
            let contestant = BoardData.contestants.first { $0.id == id }
            let name = contestant.map(Scoring.displayName) ?? id
            let knockedOut = contestant.map { Scoring.isBootPublic($0) } ?? false
            let piece = Text(name).foregroundStyle(knockedOut ? Color.boot : Color.secondary)
            if index == 0 { return piece }
            return line + Text(" · ").foregroundStyle(.secondary) + piece
        }
    }

    private func seatTotal(_ manager: Manager) -> Int {
        manager.picks.reduce(0) { sum, id in
            guard let contestant = BoardData.contestants.first(where: { $0.id == id }),
                  let points = Scoring.score(contestant, bonusOn: false) else { return sum }
            return sum + points
        }
    }
}

struct TeamView: View {
    let manager: Manager

    var body: some View {
        List(manager.picks, id: \.self) { id in
            if let contestant = BoardData.contestants.first(where: { $0.id == id }) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(Scoring.displayName(contestant))
                        .foregroundStyle(Scoring.isBootPublic(contestant) ? Color.boot : Color.primary)
                    if Scoring.isBootPublic(contestant) {
                        Text(contestant.boot ?? "Voted out")
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(Color.boot)
                        if let points = Scoring.score(contestant, bonusOn: false) {
                            Text("\(points) points")
                                .font(.caption.monospacedDigit())
                                .foregroundStyle(.secondary)
                        }
                    } else {
                        Text(tribeLabel(contestant.tribe))
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
                .accessibilityElement(children: .combine)
            }
        }
        .navigationTitle(manager.name)
    }

    private func tribeLabel(_ tribe: String) -> String {
        switch tribe {
        case "savu": return "Savu"
        case "dina": return "Dina"
        default: return "Toka"
        }
    }
}

struct PolicyView: View {
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 12) {
                Text("Privacy")
                    .font(.largeTitle.bold())
                Text("Survivor Fantasy Draft is a private family scoreboard. It does not take payment, create an account, or upload your seat.")
                Text("The app does not ask for your location, contacts, camera, or microphone. Crashlytics stays off until a Firebase config file is added to the build.")
                Text("Erase the app to delete the board saved on this device.")
                Link("Support", destination: URL(string: "https://github.com/tanre77")!)
            }
            .padding(20)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .navigationTitle("Privacy")
    }
}

extension Color {
    static let boot = Color(red: 0.88, green: 0.02, blue: 0)

    init(hex: String) {
        let cleaned = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var value: UInt64 = 0
        Scanner(string: cleaned).scanHexInt64(&value)
        let red = Double((value >> 16) & 0xFF) / 255
        let green = Double((value >> 8) & 0xFF) / 255
        let blue = Double(value & 0xFF) / 255
        self.init(red: red, green: green, blue: blue)
    }
}
