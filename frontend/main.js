document.addEventListener("DOMContentLoaded", async () => {
    console.log("Dashboard loaded!");
    try {
        const map = await initMap();
        console.log("Map initialized successfully.");
    } catch (error) {
        console.error("Error initializing the map:", error);
    }
});

async function initMap() {
    const map = L.map('map').setView([50.0, 10.0], 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const [countryData, geojson] = await Promise.all([
        fetch('http://localhost:3000/api/mapdata').then(res => res.json()),
        fetch('https://raw.githubusercontent.com/leakyMirror/map-of-europe/master/GeoJSON/europe.geojson').then(res => res.json())
    ]);

    const filteredFeatures = geojson.features.filter(feature =>
        countryData.some(data => data.country === feature.properties.NAME)
    );
    const filteredGeoJSON = { type: "FeatureCollection", features: filteredFeatures };

    L.geoJSON(filteredGeoJSON, {
        style: f => ({
            fillColor: getColor(f.properties.NAME, countryData),
            weight: 1,
            opacity: 1,
            color: '',
            fillOpacity: 0.7,
        }),
        onEachFeature: (feature, layer) => {
            const countryStats = countryData.find(d => d.country === feature.properties.NAME);
            if (countryStats) {
                layer.bindPopup(createPopupContent(countryStats));
            }
        }
    }).addTo(map);

    addCountryMarkers(map, countryData);

    return map;
}

function getColor(countryName, countryData) {
    const data = countryData.find(d => d.country === countryName);
    if (!data) return '#D3D3D3'; // Grå for manglende data

    const forPercentage = data.total_for / data.total_posts;

    if (forPercentage > 0.75) return '#005a32';    // meget positivt (mørk grøn)
    if (forPercentage > 0.5)  return '#238b45';    // overvejende positivt
    if (forPercentage > 0.25) return '#74c476';    // overvejende negativt
    return '#c7e9c0';                              // meget negativt (lys grøn)
}

function createPopupContent(stats) {
    return `
        <b>${stats.country}</b><br>
        For: ${stats.total_for}<br>
        Against: ${stats.total_imod}<br>
        Total Posts: ${stats.total_posts}
    `;
}

function addCountryMarkers(map, countryData) {
    const countryMarkers = [
        { name: "Denmark", coords: [56.2639, 9.5018] },
        { name: "Germany", coords: [51.1657, 10.4515] },
        { name: "France", coords: [46.6034, 1.8883] },
        { name: "Malta", coords: [35.9375, 14.3754] }
    ];

    for (const c of countryMarkers) {
        const stats = countryData.find(d => d.country === c.name);
        if (stats) {
            L.circleMarker(c.coords, {
                radius: 5,
                fillColor: '#ff5959',
                color: '#f00',
                fillOpacity: 1
            })
                .addTo(map)
                .bindPopup(createPopupContent(stats));
        }
    }
}