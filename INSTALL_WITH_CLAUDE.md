# Installing with Claude

This project was built and installed with an AI coding assistant driving the terminal. You can do the same: paste the prompt below into Claude (Claude Code, GitHub Copilot in VS Code, or claude.ai with a connected terminal) and it will walk through the whole setup with you.

It also gives Claude enough context to **drive your TV's remote**, so it can help you clean up Samsung bloat, set autostart, and troubleshoot — things the Tizen tools can't do on their own.

---

## Step 0 — What you need before starting

- A Samsung TV (Tizen 4.0+, roughly 2018 or newer) on the same Wi‑Fi/LAN as your computer.
- macOS or Linux. (Windows: use WSL.)
- About 20 minutes. Tizen Studio is a ~1 GB download.

Find your TV's IP: **Settings → General → Network → Network Status → IP Settings**.

---

## Step 1 — Paste this prompt into Claude

> I want to install the open-source **Samsung TV Portal** home screen (https://github.com/AP-Singhz/samsung-tv-portal) on my Samsung Tizen TV. My TV's IP address is `___.___.___.___` and my computer's IP is `___.___.___.___`.
>
> Please work through this with me step by step, running commands in the terminal yourself where possible and telling me exactly what to press on the TV remote when something has to happen on the TV. Pause and ask me to confirm before any step that deletes anything.
>
> 1. **Tizen Studio.** Check whether `~/tizen-studio/tools/sdb` exists. If not, help me install Tizen Studio (CLI is fine) with the *TV Extensions* package, and create a Samsung certificate profile named `TVHome` using Certificate Manager. I may need to sign in with a Samsung account for the distributor certificate.
> 2. **Developer Mode on the TV.** Tell me how to enable it (open Apps, type 1 2 3 4 5 on the remote, switch it on, enter my computer's IP as the host, reboot the TV).
> 3. **Clone and configure.** Clone the repo, copy `.env.example` to `.env`, and set `TV_IP`. Ask me which streaming apps I use and which HDMI inputs I want as tiles, then edit `app/settings.js` to match. If an app isn't in the README's ID table, pair with the TV and run `sdb shell 0 vd_applist` to find its ID.
> 4. **Deploy.** Run `./deploy.sh`. If `sdb connect` fails, try `sdb kill-server` first and check the host IP on the TV matches my computer's.
> 5. **Verify.** Confirm the app launched on the TV and that the weather shows the right city. If it doesn't, set `latitude`/`longitude` in settings and redeploy.
> 6. **Make it the default screen.** Guide me (or use `remote.py` after pairing) to set *Settings → General → Smart Features → Autorun Smart Hub = Off* and *Autorun Last App = On*.
> 7. **Optional speed-up.** Offer to help me remove unused Samsung apps and disable Bixby / TV Plus / Ambient autorun. You can't uninstall store apps over `sdb` — that must be done through the TV's Apps → Settings screen — but you can drive the remote with `./remote.py` while I read the screen back to you. Confirm each app name with me before pressing Delete.
>
> Keep explanations short. When you need me to do something on the TV, tell me exactly which buttons to press.

---

## Step 2 — Answer Claude's questions

Claude will ask you things like which apps you use and what's highlighted on the TV screen. Just describe what you see. It can't see the TV, so when it drives the remote it relies on you to confirm before anything destructive.

---

## What Claude can and can't do

| Can | Can't |
|---|---|
| Install Tizen Studio and certificates | Accept the Samsung account login for you |
| Build, install and launch the app | Enable Developer Mode (needs the physical remote once) |
| Press remote buttons via `remote.py` | See the TV screen — you narrate it |
| Read the installed app list from the TV | Uninstall Samsung store apps over the network |
| Reboot the TV | Factory reset the TV |

---

## Useful commands for Claude to know

```bash
# Tizen tools (default install location)
~/tizen-studio/tools/sdb connect <TV_IP>:26101
~/tizen-studio/tools/sdb devices
~/tizen-studio/tools/sdb shell 0 vd_applist        # installed apps with IDs and sizes
~/tizen-studio/tools/sdb shell 0 applist           # system apps
~/tizen-studio/tools/sdb kill-server               # fix stale connections

# TV's local REST API (no auth needed)
curl http://<TV_IP>:8001/api/v2/                   # model, firmware, dev-mode status
curl -X POST http://<TV_IP>:8001/api/v2/applications/<APP_ID>   # launch an app

# Remote control (after pairing)
./remote.py KEY_HOME
./remote.py KEY_DOWN KEY_ENTER pause=1.5
./remote.py hold:KEY_POWER                          # reboot
```

Common key names: `KEY_UP KEY_DOWN KEY_LEFT KEY_RIGHT KEY_ENTER KEY_RETURN KEY_HOME KEY_MENU KEY_POWER KEY_VOLUP KEY_VOLDOWN KEY_MUTE KEY_SOURCE KEY_0`–`KEY_9`.

---

## If something goes wrong

- **"The package is not exist" / permission errors when uninstalling** — expected. Samsung blocks removing store apps over sdb; do it from the TV's Apps → Settings screen.
- **Nothing happens when `remote.py` presses Enter in the Apps settings grid** — on some firmware the gear icon opens the regular Apps page rather than the management view. Highlight an app and press **Down** instead; the first option is usually *Delete*.
- **Deploy worked but the TV still shows the old version** — the TV caches the app. Exit it (Back), then run `./deploy.sh` again.
