package app.academik.learn;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import androidx.core.content.FileProvider;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.MessageDigest;

/**
 * Mise à jour de l'application sans quitter l'app : téléchargement (progression), vérification de l'empreinte SHA-256 annoncée par
 * le release.json SIGNÉ, puis installateur système. Android exige la même clé de signature que l'app installée.
 */
@CapacitorPlugin(name = "AcademikUpdater")
public class UpdaterPlugin extends Plugin {
    private static final String PREFIX = "https://github.com/raantss18/academik/releases/download/";

    private File dir() {
        File d = new File(getContext().getCacheDir(), "updates");
        d.mkdirs();
        return d;
    }

    private static String hex(byte[] b) {
        StringBuilder s = new StringBuilder();
        for (byte x : b) s.append(String.format("%02x", x));
        return s.toString();
    }

    @PluginMethod
    public void download(final PluginCall call) {
        final String url = call.getString("url");
        final String sha = call.getString("sha256");
        if (url == null || !url.startsWith(PREFIX) || sha == null || !sha.matches("[0-9a-f]{64}")) {
            call.reject("lien ou empreinte refusés");
            return;
        }
        new Thread(() -> {
            File out = new File(dir(), "academik-update.apk");
            try {
                File[] old = dir().listFiles();
                if (old != null) for (File f : old) f.delete();
                HttpURLConnection c = null;
                String cur = url;
                for (int i = 0; i < 6; i++) { // GitHub redirige vers son stockage : on suit, en HTTPS seulement
                    c = (HttpURLConnection) new URL(cur).openConnection();
                    c.setInstanceFollowRedirects(false);
                    c.setConnectTimeout(15000);
                    c.setReadTimeout(30000);
                    int code = c.getResponseCode();
                    if (code >= 300 && code < 400) {
                        String loc = c.getHeaderField("Location");
                        c.disconnect();
                        if (loc == null || !loc.startsWith("https://")) throw new IOException("redirection refusée");
                        cur = loc;
                        continue;
                    }
                    break;
                }
                if (c == null || c.getResponseCode() != 200) throw new IOException("serveur : " + (c == null ? "?" : c.getResponseCode()));
                long total = c.getContentLengthLong();
                MessageDigest md = MessageDigest.getInstance("SHA-256");
                try (InputStream in = c.getInputStream(); OutputStream os = new FileOutputStream(out)) {
                    byte[] buf = new byte[65536];
                    long done = 0;
                    int n, last = -1;
                    while ((n = in.read(buf)) > 0) {
                        os.write(buf, 0, n);
                        md.update(buf, 0, n);
                        done += n;
                        int pct = total > 0 ? (int) (done * 100 / total) : 0;
                        if (pct != last) {
                            last = pct;
                            JSObject p = new JSObject();
                            p.put("pct", pct);
                            notifyListeners("progress", p);
                        }
                    }
                }
                if (!hex(md.digest()).equals(sha)) {
                    out.delete();
                    call.reject("empreinte incorrecte : fichier refusé");
                    return;
                }
                JSObject r = new JSObject();
                r.put("path", out.getAbsolutePath());
                call.resolve(r);
            } catch (Exception e) {
                out.delete();
                call.reject("téléchargement échoué : " + e.getMessage());
            }
        }).start();
    }

    @PluginMethod
    public void canInstall(PluginCall call) {
        JSObject r = new JSObject();
        r.put("allowed", Build.VERSION.SDK_INT < Build.VERSION_CODES.O || getContext().getPackageManager().canRequestPackageInstalls());
        call.resolve(r);
    }

    @PluginMethod
    public void openInstallSettings(PluginCall call) {
        Context ctx = getContext();
        Intent i = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:" + ctx.getPackageName()));
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        ctx.startActivity(i);
        call.resolve();
    }

    @PluginMethod
    public void install(PluginCall call) {
        try {
            Context ctx = getContext();
            File f = new File(call.getString("path", ""));
            if (!f.getCanonicalPath().startsWith(dir().getCanonicalPath()) || !f.exists()) { // seulement le fichier téléchargé par ce plugin
                call.reject("fichier introuvable");
                return;
            }
            Uri uri = FileProvider.getUriForFile(ctx, ctx.getPackageName() + ".fileprovider", f);
            Intent i = new Intent(Intent.ACTION_VIEW);
            i.setDataAndType(uri, "application/vnd.android.package-archive");
            i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
            ctx.startActivity(i);
            call.resolve();
        } catch (Exception e) {
            call.reject("installation impossible : " + e.getMessage());
        }
    }
}
