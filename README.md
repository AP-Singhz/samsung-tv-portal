# Samsung TV Portal

A fast, minimal home screen for Samsung Tizen TVs. Replaces the cluttered Smart Hub with a clean launcher: a clock, the weather, a calendar, and the apps you actually use — nothing else.

Built with plain HTML/CSS/JS and zero dependencies so it stays snappy on older TVs (tested on a 2020 Q70T running Tizen 5.5).

![Screenshot](docs/screenshot.jpg)

## Features

- **App grid** — one row of tiles for your streaming apps, with inline brand logos (YouTube, Netflix, Prime Video, Disney+, Apple TV, Spotify, Tubi) and support for HDMI inputs (e.g. an IPTV box).
- **Clock, date and month calendar** — always visible, today highlighted.
- **Weather** — current temperature, conditions, and high/low, via [Open‑Meteo](https://open-meteo.com) (no API key). Location auto-detects or can be pinned.
- **Settings shortcut** — gear in the top-right opens the TV's Settings app.
- **Remote-friendly** — D-pad navigation, Enter to launch, Back to exit.
- **Fast** — no framework, no images to download, transform-only animations, network calls deferred until after first paint.

## Requirements

- A Samsung TV running Tizen 4.0 or newer, on the same network as your computer.
- [Tizen Studio](https://developer.tizen.org/development/tizen-studio/download) with the **TV Extensions** package installed, and a **Samsung certificate profile** created in Certificate Manager.
- macOS or Linux (the scripts are Bash). Windows works with WSL or by running the Tizen commands manually.
- Python 3 (only for the optional `remote.py` helper).

## Setup

### 1. Enable Developer Mode on the TV

1. Open **Apps** on the TV.
2. Using the remote's number buttons, enter **1 2 3 4 5**. A Developer Mode dialog appears.
3. Switch it **On** and enter your computer's IP address as the *Host PC IP*.
4. Restart the TV (hold the power button on the remote until the Samsung logo appears).

### 2. Clone and configure

```bash
git clone https://github.com/AP-Singhz/samsung-tv-portal.git
cd samsung-tv-portal
cp .env.example .env
```

Edit `.env` and set `TV_IP` to your TV's IP address (Settings → General → Network → Network Status → IP Settings).

### 3. Customise the home screen

Edit [`app/settings.js`](app/settings.js):

```js
window.SETTINGS = {
  title: "Aaron's Samsung TV Portal",   // shown in the top-left
  latitude: "", longitude: "",         // leave blank to auto-detect
  units: "celsius",                     // or "fahrenheit"
  apps: [
    { name: "IPTV",    logo: "tv",      input: { type: "HDMI", number: 1 } },
    { name: "YouTube", logo: "youtube", id: "111299001912" },
    { name: "Netflix", logo: "netflix", id: "3201907018807" },
    // ...
  ]
};
```

- `id` is the Samsung app ID. Find yours with `./remote.py` paired, then `sdb shell 0 vd_applist` — or see the common IDs below.
- `input` switches the TV to an HDMI source instead of launching an app.
- `logo` picks a built-in mark; omit it and the app name is drawn as text.

| App | ID |
|---|---|
| Netflix | `3201907018807` |
| YouTube | `111299001912` |
| Prime Video | `3201910019365` |
| Disney+ | `3201901017640` |
| Apple TV | `3201807016597` |
| Spotify | `3201606009684` |
| Tubi | `3201504001965` |
| Crave | `3201506003488` |
| Plex | `3201512006963` |

### 4. Deploy

```bash
./deploy.sh
```

This packages the app, installs it on the TV, and launches it. Re-run after any edit.

### 5. Make it your default screen (optional)

On the TV: **Settings → General → Smart Features**, set **Autorun Smart Hub → Off** and **Autorun Last App → On**. Leave the portal open when you turn the TV off and it'll be there when you turn it back on.

## Remote control helper

`remote.py` sends key presses to the TV over its WebSocket API — handy for scripting or for driving the TV from a terminal.

```bash
pip3 install websocket-client
./remote.py KEY_HOME                  # single key
./remote.py KEY_DOWN KEY_ENTER pause=1.5   # sequence, with delay in seconds
./remote.py hold:KEY_POWER            # long-press (reboots the TV)
```

The first run shows an **Allow** prompt on the TV; accept it and the token is cached in `.tv_token`.

## Project layout

```
app/
  index.html     markup
  style.css      all styling (1920×1080 fixed layout)
  app.js         rendering, navigation, launching, weather
  settings.js    ← the only file you need to edit
  config.xml     Tizen manifest and privileges
  fonts/         Inter, bundled so nothing is fetched at startup
deploy.sh        build + install + launch
remote.py        send remote-control keys to the TV
```

## Troubleshooting

- **`failed to connect`** — Developer Mode is off, the host IP on the TV doesn't match your computer, or the TV is asleep. Run `~/tizen-studio/tools/sdb kill-server` and try again.
- **An app won't launch** — its ID is wrong for your region/model. Check with `sdb shell 0 vd_applist`.
- **Weather shows "unavailable"** — the TV has no internet, or `latitude`/`longitude` are set but malformed.
- **Still slow?** — the TV, not the app. Uninstall unused Samsung apps, turn off Autorun Smart Hub / TV Plus / Bixby, run Device Care, and reboot. See [INSTALL_WITH_CLAUDE.md](INSTALL_WITH_CLAUDE.md) for a guided walkthrough.

## License

MIT. Inter font is licensed under the SIL OFL (see `app/fonts/LICENSE.txt`).
