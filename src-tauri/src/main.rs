// L'application est entièrement dans `dist/` (web) : aucune commande native, aucun accès réseau ni fichier.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("erreur au lancement d'academik");
}
