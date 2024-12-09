document.addEventListener("DOMContentLoaded", () => {
    console.log("Dashboard loaded!");

    // Initialize Leaflet.js map
    const map = L.map('map').setView([50.0, 10.0], 5); // Centered in Europe

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Fetch country data from the backend
    fetch('http://localhost:3000/api/mapdata')
        .then(response => response.json())
        .then(countryData => {
            // Fetch GeoJSON data
            fetch('https://raw.githubusercontent.com/leakyMirror/map-of-europe/master/GeoJSON/europe.geojson')
                .then(response => response.json())
                .then(geojson => {
                    // Filter GeoJSON features to include only countries in the dataset
                    const filteredFeatures = geojson.features.filter(feature =>
                        countryData.some(data => data.country === feature.properties.NAME)
                    );

                    // Create a new GeoJSON object with filtered features
                    const filteredGeoJSON = {
                        type: "FeatureCollection",
                        features: filteredFeatures,
                    };

                    // Add GeoJSON layer to the map
                    L.geoJSON(filteredGeoJSON, {
                        style: feature => ({
                            fillColor: getColor(feature.properties.NAME, countryData),
                            weight: 1,
                            opacity: 1,
                            color: '',
                            dashArray: '', // No dashed border
                            fillOpacity: 0.7,
                        }),
                        onEachFeature: (feature, layer) => {
                            const countryStats = countryData.find(data => data.country === feature.properties.NAME);
                            if (countryStats) {
                                const popupContent = `
                                    <b>${countryStats.country}</b><br>
                                    For: ${countryStats.total_for}<br>
                                    Against: ${countryStats.total_imod}<br>
                                    Total Posts: ${countryStats.total_posts}
                                `;
                                layer.bindPopup(popupContent);
                            }
                        }
                    }).addTo(map);
                })
                .catch(error => console.error("Error fetching GeoJSON data:", error));
        })
        .catch(error => console.error("Error fetching country data:", error));

    // Define color function based on "for" vs. "against" votes
    function getColor(countryName, countryData) {
        const data = countryData.find(item => item.country === countryName);
        if (!data) return '#D3D3D3'; // Default for missing countries

        const forPercentage = data.total_for / data.total_posts;
        if (forPercentage > 0.75) return '#08306b'; // Dark blue for high "for" percentage
        if (forPercentage > 0.5) return '#2171b5';
        if (forPercentage > 0.25) return '#6baed6';
        return '#c6dbef'; // Light blue for low "for" percentage
    }
});