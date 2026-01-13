// ✅ Change this if your backend runs on a different port
const API_URL = "http://localhost:5000";

const statusEl = document.getElementById("status");
const categoryEl = document.getElementById("category");
const refreshBtn = document.getElementById("refresh");

// --- Map init (Ankara / your coords) ---
const map = L.map("map").setView([39.9228, 32.8597], 12);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

let markersLayer = L.layerGroup().addTo(map);

function getBboxString() {
  const b = map.getBounds();
  const minLon = b.getWest().toFixed(6);
  const minLat = b.getSouth().toFixed(6);
  const maxLon = b.getEast().toFixed(6);
  const maxLat = b.getNorth().toFixed(6);
  return `${minLon},${minLat},${maxLon},${maxLat}`;
}

async function loadEvents() {
  try {
    statusEl.textContent = "loading events...";

    const qs = new URLSearchParams();
    const category = categoryEl.value;
    if (category) qs.set("category", category);

    // bbox filter: when map changes, it will fetch new events
    qs.set("bbox", getBboxString());

    const url = `${API_URL}/events?${qs.toString()}`;
    const res = await fetch(url);

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API error ${res.status}: ${text}`);
    }

    const events = await res.json();

    // clear old markers
    markersLayer.clearLayers();

    let count = 0;
    for (const ev of events) {
      const coords = ev?.geom?.coordinates;
      if (!coords || coords.length !== 2) continue;

      const [lon, lat] = coords;

      const marker = L.marker([lat, lon]);
      marker.bindPopup(`
        <b>${ev.title}</b><br/>
        <span>${ev.category || ""}</span><br/>
        <span style="opacity:.8">${ev.description || "-"}</span><br/>
        <small style="opacity:.7">${ev.start_time ? new Date(ev.start_time).toLocaleString() : ""}</small>
      `);

      marker.addTo(markersLayer);
      count++;
    }

    statusEl.textContent = `loaded: ${count} events (bbox + category filter active)`;
  } catch (err) {
    console.error(err);
    statusEl.textContent = `Error: ${err.message}`;
  }
}

// events
refreshBtn.addEventListener("click", loadEvents);
categoryEl.addEventListener("change", loadEvents);

// fetch again when map moved (bbox changes)
map.on("moveend", () => {
  loadEvents();
});

// initial load
loadEvents();
