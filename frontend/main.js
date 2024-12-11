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

// Category Interactions nr. 1
async function totalInteractionsData() {
    const response = await fetch('http://localhost:3000/api/total_interactions_over_year');
    const data = await response.json();
    const yearQuarter = data.year_quarter;
    const totalInteractions = data.total_interactions;
    return { yearQuarter, totalInteractions }
}

async function renderTotalInteractionsChart () {
    const chartData = await totalInteractionsData();
    const getChartElement = document.getElementById('chart1');
    new Chart (getChartElement, {
        type: "line",
        data: {
            labels: chartData.yearQuarter,
            datasets: [{
                label: 'none',
                data: chartData.totalInteractions,
                borderColor: "#1f77b4",
                backgroundColor: "transparent",
                borderWidth: 1,
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false,
                },
                title: {
                    display: true,
                    text: 'Total Interactions Over The Course Of War-time'
                }
            }
        }
    })
    console.log('Total interactions chart finished rendering!')
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

// Interactive Map nr. 3
async function initMap() {
    const map = L.map("map").setView([50.0, 10.0], 4);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    const [countryData, geojson] = await Promise.all([
        fetch("http://localhost:3000/api/mapdata").then((res) => res.json()),
        fetch("https://raw.githubusercontent.com/leakyMirror/map-of-europe/master/GeoJSON/europe.geojson").then((res) => res.json()),
    ]);

    const filteredFeatures = geojson.features.filter((feature) =>
        countryData.some((data) => data.country === feature.properties.NAME)
    );
    const filteredGeoJSON = { type: "FeatureCollection", features: filteredFeatures };

    L.geoJSON(filteredGeoJSON, {
        style: (f) => ({
            fillColor: getColor(f.properties.NAME, countryData),
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

    addCountryMarkers(map, countryData);

    return map;
}

// Determine map color based on support percentage
function getColor(countryName, countryData) {
    const data = countryData.find((d) => d.country === countryName);
    if (!data) return "#D3D3D3"; // Default grey for no data

    const forPercentage = data.total_for / data.total_posts;

    if (forPercentage > 0.75) return "#c7e9c0"; // Light green
    if (forPercentage > 0.5) return "#74c476"; // Medium green
    if (forPercentage > 0.25) return "#fcbba1"; // Light red
    return "#cb181d"; // Strong red
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

    countryMarkers.forEach((c) => {
        const stats = countryData.find((d) => d.country === c.name);
        if (stats) {
            L.circleMarker(c.coords, {
                radius: 5,
                fillColor: "#ff5959",
                color: "#f00",
                fillOpacity: 1,
            })
                .addTo(map)
                .bindPopup(createPopupContent(stats));
        }
    });
    renderTotalInteractionsChart();
}