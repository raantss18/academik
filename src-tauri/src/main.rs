// L'application est entièrement dans `dist/` (web). Seule exception : la mise à jour intégrée de l'AppImage (3 commandes ci-dessous),
// qui télécharge DANS l'app, vérifie l'empreinte SHA-256 annoncée par le release.json signé, remplace l'AppImage puis redémarre.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use sha2::{Digest, Sha256};
use std::{fs, io::{Read, Write}, os::unix::fs::PermissionsExt, path::PathBuf, process::Command, time::Duration};
use tauri::{AppHandle, Emitter};

const PREFIX: &str = "https://github.com/raantss18/academik/releases/download/";

fn appimage() -> Result<PathBuf, String> {
    std::env::var("APPIMAGE").map(PathBuf::from).map_err(|_| "la mise à jour intégrée n'existe que depuis l'AppImage".to_string())
}

#[tauri::command]
fn update_can_install() -> bool {
    appimage().ok().and_then(|p| p.parent().map(|d| d.to_path_buf())).map(|d| fs::metadata(&d).map(|m| !m.permissions().readonly()).unwrap_or(false)).unwrap_or(false)
}

#[tauri::command]
async fn update_download(app: AppHandle, url: String, sha256: String) -> Result<String, String> {
    if !url.starts_with(PREFIX) || sha256.len() != 64 || !sha256.chars().all(|c| c.is_ascii_digit() || ('a'..='f').contains(&c)) {
        return Err("lien ou empreinte refusés".into());
    }
    let target = appimage()?;
    let dir = target.parent().ok_or("dossier introuvable")?.to_path_buf();
    tauri::async_runtime::spawn_blocking(move || -> Result<String, String> {
        let tmp = dir.join(".academik-update.part"); // même dossier que l'AppImage : le remplacement sera atomique
        let client = reqwest::blocking::Client::builder()
            .connect_timeout(Duration::from_secs(15))
            .redirect(reqwest::redirect::Policy::custom(|a| if a.url().scheme() == "https" && a.previous().len() < 6 { a.follow() } else { a.error("redirection refusée") }))
            .build().map_err(|e| e.to_string())?;
        let mut resp = client.get(&url).send().map_err(|e| format!("téléchargement échoué : {e}"))?;
        if !resp.status().is_success() { return Err(format!("serveur : {}", resp.status())); }
        let total = resp.content_length().unwrap_or(0);
        let mut file = fs::File::create(&tmp).map_err(|e| e.to_string())?;
        let (mut hasher, mut done, mut last, mut buf) = (Sha256::new(), 0u64, -1i64, vec![0u8; 65536]);
        loop {
            let n = resp.read(&mut buf).map_err(|e| { let _ = fs::remove_file(&tmp); format!("lecture interrompue : {e}") })?;
            if n == 0 { break; }
            file.write_all(&buf[..n]).map_err(|e| e.to_string())?;
            hasher.update(&buf[..n]);
            done += n as u64;
            let pct = if total > 0 { (done * 100 / total) as i64 } else { 0 };
            if pct != last { last = pct; let _ = app.emit("update-progress", pct); }
        }
        drop(file);
        let got: String = hasher.finalize().iter().map(|b| format!("{b:02x}")).collect();
        if got != sha256 { let _ = fs::remove_file(&tmp); return Err("empreinte incorrecte : fichier refusé".into()); }
        fs::set_permissions(&tmp, fs::Permissions::from_mode(0o755)).map_err(|e| e.to_string())?;
        Ok(tmp.to_string_lossy().into_owned())
    }).await.map_err(|e| e.to_string())?
}

#[tauri::command]
fn update_install(app: AppHandle, path: String) -> Result<(), String> {
    let target = appimage()?;
    let src = PathBuf::from(&path);
    if src.parent() != target.parent() || src.file_name().map(|n| n != ".academik-update.part").unwrap_or(true) || !src.exists() {
        return Err("fichier introuvable".into());
    }
    fs::rename(&src, &target).map_err(|e| format!("remplacement impossible : {e}"))?; // l'ancienne version en cours reste lisible
    Command::new(&target).env("APPIMAGELAUNCHER_DISABLE", "1").env_remove("APPDIR").env_remove("ARGV0").spawn().map_err(|e| format!("redémarrage impossible : {e}"))?;
    app.exit(0);
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![update_can_install, update_download, update_install])
        .run(tauri::generate_context!())
        .expect("erreur au lancement d'academik");
}
