import SwiftUI

@main
struct SurvivorDraftApp: App {
    @State private var theme = ThemeStore()

    init() {
        CrashReporting.start()
    }

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(theme)
        }
    }
}

struct RootView: View {
    @Environment(\.colorScheme) private var colorScheme
    @Environment(ThemeStore.self) private var theme

    private var resolved: ColorScheme {
        switch theme.choice {
        case .dark: return .dark
        case .light: return .light
        case .system: return colorScheme
        }
    }

    private var palette: Palette {
        resolved == .dark ? .dark : .light
    }

    var body: some View {
        LeagueListView()
            .environment(\.palette, palette)
            .toolbarColorScheme(resolved, for: .navigationBar)
            .preferredColorScheme(theme.choice.colorScheme)
            .tint(palette.ember)
            .fontDesign(.rounded)
    }
}

private enum LeagueFilter: String {
    case open
    case done
}

struct LeagueListView: View {
    @Environment(\.palette) private var palette
    @State private var filter = LeagueFilter.open.rawValue

    private var showsLiveLeague: Bool {
        filter == LeagueFilter.open.rawValue ? Scoring.seasonStillOpen : !Scoring.seasonStillOpen
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                CapsuleSegment(
                    options: [
                        SegmentOption(id: LeagueFilter.open.rawValue, title: "In progress"),
                        SegmentOption(id: LeagueFilter.done.rawValue, title: "Finished"),
                    ],
                    selection: $filter,
                    label: "Leagues"
                )
                .padding(.horizontal, 16)
                .padding(.top, 4)
                .padding(.bottom, 10)

                List {
                    if showsLiveLeague {
                        Section {
                            NavigationLink {
                                BoardView()
                            } label: {
                                leagueRow
                            }
                            .listRowBackground(palette.surface)
                        } footer: {
                            disclaimer
                        }
                    } else {
                        Section {
                            Text(emptyCopy)
                                .font(.subheadline)
                                .foregroundStyle(palette.muted)
                                .listRowBackground(palette.surface)
                        } footer: {
                            disclaimer
                        }
                    }
                }
                .draftList()
            }
            .background(palette.bg)
            .navigationTitle("Leagues")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    NavigationLink("You") { YouView() }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    NavigationLink("Privacy") { PolicyView() }
                }
            }
        }
    }

    private var leagueRow: some View {
        HStack(spacing: 12) {
            Capsule()
                .fill(filter == LeagueFilter.open.rawValue ? palette.toka : palette.line)
                .frame(width: 4, height: 52)
            VStack(alignment: .leading, spacing: 6) {
                CapsuleTag(
                    title: filter == LeagueFilter.open.rawValue ? "In progress" : "Finished",
                    fill: filter == LeagueFilter.open.rawValue ? palette.toka.opacity(0.22) : palette.surface2,
                    ink: filter == LeagueFilter.open.rawValue ? palette.toka : palette.muted,
                    uppercase: true
                )
                Text("Survivor 51")
                    .font(.title3.weight(.bold))
                    .foregroundStyle(palette.fg)
                Text("\(BoardData.managers.count) seats · Fiji")
                    .font(.subheadline)
                    .foregroundStyle(palette.muted)
            }
            Spacer(minLength: 0)
        }
        .padding(.vertical, 6)
        .accessibilityElement(children: .combine)
    }

    private var emptyCopy: String {
        filter == LeagueFilter.open.rawValue
            ? "Nothing is in progress."
            : "Finished seasons and closed drafts show up here."
    }

    private var disclaimer: some View {
        Text("Seats stay on this device. The $25 buy-in is settled outside the app. This app does not take payment.")
            .font(.footnote)
            .foregroundStyle(palette.muted)
    }
}

struct BoardView: View {
    @Environment(\.palette) private var palette

    private var ranked: [Manager] {
        BoardData.managers.sorted { lhs, rhs in
            let left = seatTotal(lhs)
            let right = seatTotal(rhs)
            if left != right { return left < right }
            return lhs.name.localizedCaseInsensitiveCompare(rhs.name) == .orderedAscending
        }
    }

    private var latest: [Contestant] {
        Scoring.latestBoots()
    }

    var body: some View {
        List(ranked) { manager in
            NavigationLink {
                TeamView(manager: manager)
            } label: {
                standingRow(manager)
            }
            .listRowBackground(palette.surface)
        }
        .draftList()
        .navigationTitle("Survivor 51")
        .navigationBarTitleDisplayMode(.inline)
        .safeAreaInset(edge: .bottom) {
            if !latest.isEmpty {
                BootBanner(players: latest)
                    .padding(.horizontal, 16)
                    .padding(.bottom, 8)
            }
        }
    }

    private func standingRow(_ manager: Manager) -> some View {
        let total = seatTotal(manager)
        let place = ranked.filter { seatTotal($0) < total }.count + 1
        return HStack(spacing: 10) {
            Capsule()
                .fill(place == 1 ? palette.toka : palette.line)
                .frame(width: 4, height: 44)
            Text(Scoring.ordinal(place))
                .font(.caption.weight(.bold).monospacedDigit())
                .foregroundStyle(place == 1 ? palette.toka : palette.muted)
                .frame(width: 32, alignment: .leading)
            Circle()
                .fill(Color(hex: manager.bg))
                .frame(width: 32, height: 32)
                .overlay {
                    Text(String(manager.name.prefix(1)))
                        .font(.caption.weight(.bold))
                        .foregroundStyle(Color(hex: manager.fg))
                }
                .accessibilityHidden(true)
            VStack(alignment: .leading, spacing: 2) {
                Text(manager.name)
                    .foregroundStyle(palette.fg)
                picksLine(manager)
                    .font(.caption)
                    .lineLimit(2)
            }
            Spacer(minLength: 8)
            Text("\(total)")
                .scorePill("\(total)")
                .fixedSize(horizontal: true, vertical: false)
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(Scoring.ordinal(place)), \(manager.name), \(total) points")
    }

    private func picksLine(_ manager: Manager) -> Text {
        manager.picks.enumerated().reduce(Text("")) { line, item in
            let (index, id) = item
            let contestant = BoardData.contestants.first { $0.id == id }
            let name = contestant.map(Scoring.displayName) ?? id
            let knockedOut = contestant.map { Scoring.isBootPublic($0) } ?? false
            let piece = Text(name).foregroundStyle(knockedOut ? palette.boot : palette.muted)
            if index == 0 { return piece }
            return line + Text(" · ").foregroundStyle(palette.muted) + piece
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
    @Environment(\.palette) private var palette
    @Environment(\.colorScheme) private var colorScheme
    let manager: Manager

    private var total: Int {
        manager.picks.reduce(0) { sum, id in
            guard let contestant = BoardData.contestants.first(where: { $0.id == id }),
                  let points = Scoring.score(contestant, bonusOn: false) else { return sum }
            return sum + points
        }
    }

    var body: some View {
        List {
            Section {
                HStack {
                    Text("Roster")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(palette.muted)
                    Spacer()
                    Text("\(total)")
                        .scorePill("\(total)")
                }
                .listRowBackground(palette.surface)
            }
            Section {
                ForEach(manager.picks, id: \.self) { id in
                    if let contestant = BoardData.contestants.first(where: { $0.id == id }) {
                        playerRow(contestant)
                            .listRowBackground(palette.surface)
                    }
                }
            }
        }
        .draftList()
        .navigationTitle(manager.name)
        .navigationBarTitleDisplayMode(.inline)
    }

    private func playerRow(_ contestant: Contestant) -> some View {
        let out = Scoring.isBootPublic(contestant)
        let tribe = tribeStyle(contestant.tribe)
        return HStack(spacing: 10) {
            Capsule()
                .fill(out ? palette.boot : tribe.fill)
                .frame(width: 4, height: 36)
            VStack(alignment: .leading, spacing: 4) {
                Text(Scoring.displayName(contestant))
                    .foregroundStyle(out ? palette.boot : palette.fg)
                if out {
                    Text(contestant.boot ?? "Voted out")
                        .font(.caption)
                        .foregroundStyle(palette.muted)
                }
            }
            Spacer(minLength: 8)
            if out {
                CapsuleTag(title: "Out", fill: palette.boot, ink: palette.bootInk, uppercase: true)
                    .fixedSize()
                if let points = Scoring.score(contestant, bonusOn: false) {
                    Text("\(points)")
                        .scorePill("\(points)")
                        .fixedSize(horizontal: true, vertical: false)
                }
            } else {
                CapsuleTag(title: tribe.name, fill: tribe.fill, ink: tribe.ink)
                    .fixedSize()
            }
        }
        .accessibilityElement(children: .combine)
    }

    private func tribeStyle(_ tribe: String) -> (name: String, fill: Color, ink: Color) {
        switch tribe {
        case "savu":
            return ("Savu", palette.savu, palette.savuInk)
        case "dina":
            return ("Dina", palette.dina, palette.dinaInk)
        default:
            return ("Toka", palette.toka, palette.tokaLabelInk(scheme: colorScheme))
        }
    }
}

struct YouView: View {
    @Environment(\.palette) private var palette
    @Environment(ThemeStore.self) private var theme

    var body: some View {
        List {
            Section {
                CapsuleSegment(
                    options: ThemeChoice.allCases.map { SegmentOption(id: $0.rawValue, title: $0.title) },
                    selection: Binding(
                        get: { theme.choice.rawValue },
                        set: { theme.choice = ThemeChoice(rawValue: $0) ?? .system }
                    ),
                    label: "Appearance"
                )
                .listRowBackground(palette.surface)
                .listRowInsets(EdgeInsets(top: 10, leading: 12, bottom: 10, trailing: 12))
            } header: {
                Text("Appearance")
            } footer: {
                Text("The board follows this phone unless you pin Dark or Light.")
                    .foregroundStyle(palette.muted)
            }

            Section {
                TimelineView(.periodic(from: .now, by: 30)) { context in
                    Text(Airtime.episodeFinishLine(context.date))
                        .foregroundStyle(palette.fg)
                }
                .listRowBackground(palette.surface)
                Text("That time is yours, not Eastern. The show runs 8:00 to 9:30.")
                    .font(.subheadline)
                    .foregroundStyle(palette.muted)
                    .listRowBackground(palette.surface)
                Text("A boot from Wednesday's show stays off the board until 9:30pm Eastern.")
                    .font(.subheadline)
                    .foregroundStyle(palette.muted)
                    .listRowBackground(palette.surface)
            } header: {
                Text("Episode")
            }
        }
        .draftList()
        .navigationTitle("You")
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct PolicyView: View {
    @Environment(\.palette) private var palette
    @Environment(\.colorScheme) private var colorScheme

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 14) {
                Text("Survivor Fantasy Draft is a private family scoreboard. It does not take payment, create an account, or upload your seat.")
                Text("The app does not ask for your location, contacts, camera, or microphone. Crashlytics stays off until a Firebase config file is added to the build.")
                Text("Erase the app to delete the board saved on this device.")
                Link(destination: URL(string: "https://github.com/tanre77")!) {
                    Text("Support")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(CapsuleButtonStyle(
                    fill: palette.toka,
                    ink: palette.tokaLabelInk(scheme: colorScheme)
                ))
                .accessibilityLabel("Support")
            }
            .font(.body)
            .foregroundStyle(palette.fg)
            .padding(20)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .background(palette.bg)
        .toolbarBackground(palette.surface, for: .navigationBar)
        .toolbarBackground(.visible, for: .navigationBar)
        .navigationTitle("Privacy")
        .navigationBarTitleDisplayMode(.inline)
    }
}

#Preview("Leagues") {
    RootView()
        .environment(ThemeStore())
}
