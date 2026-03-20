// CoLAB OS v11 — Tauri entry point
// The entire app UI runs from the HTML/JS/CSS in the parent directory.
// This file is the minimal Rust shell required by Tauri.

#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"          // hides the console window on Windows release builds
)]

fn main() {
  tauri::Builder::default()
    .run(tauri::generate_context!())
    .expect("error while running CoLAB OS");
}
