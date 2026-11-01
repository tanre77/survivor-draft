import SwiftUI

enum ThemeChoice: String, CaseIterable, Identifiable {
    case system
    case dark
    case light

    var id: String { rawValue }

    var title: String {
        switch self {
        case .system: return "System"
        case .dark: return "Dark"
        case .light: return "Light"
        }
    }

    var colorScheme: ColorScheme? {
        switch self {
        case .system: return nil
        case .dark: return .dark
        case .light: return .light
        }
    }
}

@Observable
final class ThemeStore {
    static let key = "s51-theme"

    var choice: ThemeChoice {
        didSet { UserDefaults.standard.set(choice.rawValue, forKey: Self.key) }
    }

    init() {
        let raw = UserDefaults.standard.string(forKey: Self.key) ?? ""
        choice = ThemeChoice(rawValue: raw) ?? .system
    }
}

private struct PaletteKey: EnvironmentKey {
    static let defaultValue = Palette.dark
}

extension EnvironmentValues {
    var palette: Palette {
        get { self[PaletteKey.self] }
        set { self[PaletteKey.self] = newValue }
    }
}

extension Palette {
    /// Bright gold uses the dark ink. Light-theme gold is dark, so paper sits on it.
    func tokaLabelInk(scheme: ColorScheme) -> Color {
        scheme == .dark ? tokaInk : bg
    }
}
