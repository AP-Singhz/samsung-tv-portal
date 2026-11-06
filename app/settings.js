// Edit this file to change the home screen, then run ./deploy.sh
window.SETTINGS = {
  title: "Aaron's Samsung TV Portal",

  // Weather location. Leave both blank to auto-detect from the TV's internet connection.
  latitude: "",
  longitude: "",
  units: "celsius", // or "fahrenheit"

  // "id" opens an app, "input" switches the TV to that source.
  // "logo" picks a built-in brand mark (youtube, netflix, spotify, prime, disney, appletv, tubi, tv);
  // without one, the name is shown as text.
  apps: [
    { name: "IPTV", logo: "tv", input: { type: "HDMI", number: 1 } },
    { name: "YouTube", logo: "youtube", id: "xvvl3S1TT1.TizenTubeStandalone" },
    { name: "Netflix", logo: "netflix", id: "3201907018807" },
    { name: "Prime Video", logo: "prime", id: "3201910019365" },
    { name: "Disney+", logo: "disney", id: "3201901017640" },
    { name: "Apple TV", logo: "appletv", id: "3201807016597" },
    { name: "Spotify", logo: "spotify", id: "3201606009684" },
    { name: "Tubi", logo: "tubi", id: "3201504001965" }
  ]
};
