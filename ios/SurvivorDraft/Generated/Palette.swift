import SwiftUI

/// Generated from src/styles.css by native/generate.mjs. Do not edit.
struct Palette {
    let bg: Color
    let surface: Color
    let surface2: Color
    let fg: Color
    let muted: Color
    let line: Color
    let savu: Color
    let savuInk: Color
    let toka: Color
    let tokaInk: Color
    let dina: Color
    let dinaInk: Color
    let ember: Color
    let emberInk: Color
    let boot: Color
    let bootInk: Color

    static let dark = Palette(
        bg: Color(hex: "#100e0c"),
        surface: Color(hex: "#1b1714"),
        surface2: Color(hex: "#26211c"),
        fg: Color(hex: "#f4efe6"),
        muted: Color(hex: "#a89886"),
        line: Color(hex: "#3c342c"),
        savu: Color(hex: "#6e4aa8"),
        savuInk: Color(hex: "#f6efff"),
        toka: Color(hex: "#e2b340"),
        tokaInk: Color(hex: "#2a2108"),
        dina: Color(hex: "#d1006b"),
        dinaInk: Color(hex: "#fff5fa"),
        ember: Color(hex: "#e25b2a"),
        emberInk: Color(hex: "#fff6f1"),
        boot: Color(hex: "#e10600"),
        bootInk: Color(hex: "#fff5f5")
    )

    static let light = Palette(
        bg: Color(hex: "#f4efe6"),
        surface: Color(hex: "#fffaf4"),
        surface2: Color(hex: "#efe6d8"),
        fg: Color(hex: "#1a140e"),
        muted: Color(hex: "#6b5e52"),
        line: Color(hex: "#e0d4c4"),
        savu: Color(hex: "#5c3d8f"),
        savuInk: Color(hex: "#f6efff"),
        toka: Color(hex: "#8a6414"),
        tokaInk: Color(hex: "#2a2108"),
        dina: Color(hex: "#b0005c"),
        dinaInk: Color(hex: "#fff5fa"),
        ember: Color(hex: "#c2410c"),
        emberInk: Color(hex: "#fff6f1"),
        boot: Color(hex: "#b10500"),
        bootInk: Color(hex: "#fff5f5")
    )
}

extension Color {
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
