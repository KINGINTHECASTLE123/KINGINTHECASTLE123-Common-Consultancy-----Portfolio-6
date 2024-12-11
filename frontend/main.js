document.addEventListener("DOMContentLoaded", async () => {
    console.log("Dashboard loaded!");
    try {
        const map = await initMap();
        console.log("Map initialized successfully.");

        await initSupportChart();
        console.log("Support chart initialized successfully.");
    } catch (error) {
        console.error("Error initializing dashboard components:", error);
    }
});


// Interactive Map (Visualizations nr.3)
// Main JavaScript file
async function initMap() {
    const map = L.map("map").setView([50.0, 10.0], 4);

    // Add tile layer to the map
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    try {
        // Fetch country data and GeoJSON simultaneously
        const [countryData, geojson] = await Promise.all([
            fetchWithErrorHandling("http://localhost:3000/api/mapdata"),
            fetchWithErrorHandling("https://raw.githubusercontent.com/leakyMirror/map-of-europe/master/GeoJSON/europe.geojson"),
        ]);

        // Filter GeoJSON features based on available country data
        const filteredGeoJSON = {
            type: "FeatureCollection",
            features: geojson.features.filter((feature) =>
                countryData.some((data) => data.country === feature.properties.NAME)
            ),
        };

        // Add filtered GeoJSON data to the map
        L.geoJSON(filteredGeoJSON, {
            style: (feature) => ({
                fillColor: getColor(feature.properties.NAME, countryData),
                weight: 1,
                opacity: 1,
                color: "",
                fillOpacity: 0.7,
            }),
            onEachFeature: (feature, layer) => {
                const countryStats = countryData.find((d) => d.country === feature.properties.NAME);
                if (countryStats) {
                    layer.bindPopup(createPopupContent(countryStats));
                }
            },
        }).addTo(map);

        // Add specific country markers to the map
        addCountryMarkers(map, countryData);

        // Add legend to the map
        addLegend(map);
    } catch (error) {
        console.error("Error initializing map:", error);
    }

    return map;
}

// Utility function to handle fetch and errors
async function fetchWithErrorHandling(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }
    return response.json();
}

// Determine map color based on support percentage
function getColor(countryName, countryData) {
    const data = countryData.find((d) => d.country === countryName);
    if (!data) return "#D3D3D3"; // Default grey for no data

    const forPercentage = data.total_for / data.total_posts;

    if (forPercentage >= 0.75) return "#67000d"; // Strong red for high support
    if (forPercentage >= 0.5) return "#a50f15"; // Medium red
    if (forPercentage >= 0.25) return "#ef3b2c"; // Light red
    return "#fcbba1"; // Very light red for low support
}

// Create popup content for map
function createPopupContent(stats) {
    return `
        <b>${stats.country}</b><br>
        For: ${stats.total_for}<br>
        Against: ${stats.total_imod}<br>
        Total Posts: ${stats.total_posts}
    `;
}

// Add markers for specific countries
function addCountryMarkers(map, countryData) {
    const countryMarkers = [
        { name: "Denmark", coords: [56.2639, 9.5018] },
        { name: "Germany", coords: [51.1657, 10.4515] },
        { name: "France", coords: [46.6034, 1.8883] },
        { name: "Malta", coords: [35.9375, 14.3754] },
    ];

    countryMarkers.forEach((marker) => {
        const stats = countryData.find((d) => d.country === marker.name);
        if (stats) {
            L.circleMarker(marker.coords, {
                radius: 5,
                fillColor: "#ff5959",
                color: "#f00",
                fillOpacity: 1,
            })
                .addTo(map)
                .bindPopup(createPopupContent(stats));
        } else {
            console.warn(`No data found for ${marker.name}`);
        }
    });
}

// Add legend to the map
function addLegend(map) {
    const legend = L.control({ position: "bottomright" });

    legend.onAdd = function () {
        const div = L.DomUtil.create("div", "info legend");
        const grades = [0.25, 0.5, 0.75, 1];
        const colors = ["#fcbba1", "#ef3b2c", "#a50f15", "#67000d"];

        // Add a title to the legend
        div.innerHTML = `<h4>Support Percentage</h4>`;

        // Loop through grades and colors to generate labels
        for (let i = 0; i < grades.length; i++) {
            div.innerHTML += `
                <i style="background:${colors[i]}"></i>
                ${grades[i] * 100}% ${grades[i + 1] ? "&ndash; " + grades[i + 1] * 100 + "%" : "+"}<br>
            `;
        }

        return div;
    };

    legend.addTo(map);
}


// Interactive Chart nr. 2
async function initSupportChart() {
    try {
        const timeseriesData = await fetch("http://localhost:3000/api/timeseries")
            .then((res) => res.json());

        // Kombiner år og kvartal til labels som "2021 Q1"
        const labels = timeseriesData.map((d) => `${d.year} ${d.quarter}`);
        const supportData = timeseriesData.map((d) => d.avg_sentiment);

        const ctx = document.getElementById("chart2").getContext("2d");

        new Chart(ctx, {
            type: "line",
            data: {
                labels: labels,
                datasets: [
                    {
                        label: "Average support for Ukraine (by quarter)",
                        data: supportData,
                        borderColor: "#1f77b4",
                        backgroundColor: "transparent",
                        pointRadius: 4,
                        borderWidth: 2,
                    },
                ],
            },
            options: {
                responsive: true,
                interaction: {
                    mode: "index",
                    intersect: false,
                },
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: "Support level",
                        },
                        min: -0.5,
                        max: 0.5,
                    },
                    x: {
                        type: "category",
                        title: {
                            display: true,
                            text: "Year and Quarter",
                        },
                        ticks: {
                            autoSkip: false,
                        },
                    },
                },
                plugins: {
                    title: {
                        display: true,
                        text: [
                            "How does the support for Ukraine change over time?",
                            "Support is calculated as +1 for 'for Ukraine' and -1 for 'against Ukraine'."
                        ],
                    },
                    legend: {
                        display: false,
                    },
                },
            },
        });
    } catch (error) {
        console.error("Failed to fetch or render data:", error);
    }
}