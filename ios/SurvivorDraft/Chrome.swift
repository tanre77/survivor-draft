import SwiftUI

struct CapsuleButtonStyle: ButtonStyle {
    var fill: Color
    var ink: Color

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.subheadline.weight(.semibold))
            .foregroundStyle(ink)
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .frame(minHeight: 44)
            .background(fill.opacity(configuration.isPressed ? 0.72 : 1), in: Capsule())
            .animation(.easeOut(duration: 0.12), value: configuration.isPressed)
    }
}

struct SegmentOption: Identifiable, Hashable {
    let id: String
    let title: String
}

struct CapsuleTag: View {
    var title: String
    var fill: Color
    var ink: Color
    var uppercase: Bool = false

    var body: some View {
        Group {
            if uppercase {
                Text(title)
                    .font(.caption.weight(.semibold))
                    .textCase(.uppercase)
                    .tracking(0.6)
            } else {
                Text(title)
                    .font(.caption.weight(.semibold))
            }
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 5)
        .foregroundStyle(ink)
        .background(fill, in: Capsule())
    }
}

struct CapsuleSegment: View {
    @Environment(\.palette) private var palette
    @Environment(\.colorScheme) private var colorScheme
    let options: [SegmentOption]
    @Binding var selection: String
    var label: String

    var body: some View {
        HStack(spacing: 4) {
            ForEach(options) { option in
                let on = selection == option.id
                Button {
                    selection = option.id
                } label: {
                    Text(option.title)
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(CapsuleButtonStyle(
                    fill: on ? palette.toka : Color.clear,
                    ink: on ? palette.tokaLabelInk(scheme: colorScheme) : palette.muted
                ))
                .accessibilityAddTraits(on ? .isSelected : [])
            }
        }
        .padding(4)
        .background(palette.surface2, in: Capsule())
        .accessibilityElement(children: .contain)
        .accessibilityLabel(label)
    }
}

struct BootBanner: View {
    @Environment(\.palette) private var palette
    let players: [Contestant]

    private var title: String {
        let names = Scoring.nameList(players.map(\.first))
        return players.count == 1 ? "\(names) is out" : "\(names) are out"
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(spacing: 8) {
                CapsuleTag(title: "Boot", fill: palette.bootInk.opacity(0.2), ink: palette.bootInk, uppercase: true)
                Text(title)
                    .font(.headline.weight(.semibold))
                    .foregroundStyle(palette.bootInk)
            }
            Text(players.map { $0.boot ?? "Voted out" }.joined(separator: " · "))
                .font(.caption.weight(.semibold))
                .foregroundStyle(palette.bootInk.opacity(0.92))
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(palette.boot, in: Capsule())
        .accessibilityElement(children: .combine)
    }
}

struct DraftListChrome: ViewModifier {
    @Environment(\.palette) private var palette

    func body(content: Content) -> some View {
        content
            .scrollContentBackground(.hidden)
            .background(palette.bg)
            .listRowSeparatorTint(palette.line)
            .toolbarBackground(palette.surface, for: .navigationBar)
            .toolbarBackground(.visible, for: .navigationBar)
    }
}

extension View {
    func draftList() -> some View {
        modifier(DraftListChrome())
    }

    func scorePill(_ text: String) -> some View {
        modifier(ScorePill(text: text))
    }
}

private struct ScorePill: ViewModifier {
    @Environment(\.palette) private var palette
    @Environment(\.colorScheme) private var colorScheme
    var text: String

    func body(content: Content) -> some View {
        content
            .font(.headline.monospacedDigit().weight(.semibold))
            .foregroundStyle(palette.tokaLabelInk(scheme: colorScheme))
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(palette.toka, in: Capsule())
            .accessibilityLabel("\(text) points")
    }
}
