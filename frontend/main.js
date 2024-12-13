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

// Interactive chart nr. 1
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
renderTotalInteractionsChart();

// Interactive chart nr. 2
async function initSupportChart() {
    try {
        const timeseriesData = await fetch("http://localhost:3000/api/timeseries")
            .then((res) => res.json());

        // Kombiner år og kvartal til labels som "2021 Q1"
        const labels = timeseriesData.map((d) => `${d.year} Q${d.quarter}`);
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
                        pointStyle: "circle", // Gør punkterne cirkulære
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

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    try {
        // Fetch data concurrently
        const [countryData, geojson, walesGeoJSON] = await Promise.all([
            fetchData("http://localhost:3000/api/mapdata"),
            fetchData("https://raw.githubusercontent.com/leakyMirror/map-of-europe/master/GeoJSON/europe.geojson"),
            fetchData("https://raw.githubusercontent.com/martinjc/UK-GeoJSON/master/json/electoral/wal/eer.json"),
        ]);

        // Add layers to the map
        addGeoJSONLayer(map, filterGeoJSON(geojson, countryData), countryData);
        addWalesGeoJSONLayer(map, walesGeoJSON, countryData);

        // Add markers and legend
        addCountryMarkers(map, countryData);
        addLegend(map);
    } catch (error) {
        console.error("Error initializing map:", error);
    }

    return map;
}

// Fetch data with error handling
async function fetchData(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    return response.json();
}

// Filter GeoJSON features to match country data
function filterGeoJSON(geojson, countryData) {
    return {
        type: "FeatureCollection",
        features: geojson.features.filter(feature =>
            countryData.some(data => data.country === feature.properties.NAME)
        ),
    };
}

// Add generic GeoJSON layer to the map
function addGeoJSONLayer(map, geojson, countryData) {
    L.geoJSON(geojson, {
        style: feature => getGeoJSONStyle(feature.properties.NAME, countryData),
        onEachFeature: (feature, layer) => bindPopup(layer, feature.properties.NAME, countryData),
    }).addTo(map);
}

// Add Wales-specific GeoJSON layer
function addWalesGeoJSONLayer(map, walesGeoJSON, countryData) {
    L.geoJSON(walesGeoJSON, {
        style: () => getGeoJSONStyle("Wales", countryData),
        onEachFeature: (feature, layer) => bindPopup(layer, "Wales", countryData),
    }).addTo(map);
}

// Get GeoJSON layer style
function getGeoJSONStyle(countryName, countryData) {
    const stats = countryData.find(data => data.country === countryName);
    return {
        fillColor: stats ? getColor(stats) : "#D3D3D3",
        weight: 1,
        opacity: 1,
        color: "grey",
        fillOpacity: 0.7,
    };
}

// Bind popup to a layer
function bindPopup(layer, countryName, countryData) {
    const stats = countryData.find(data => data.country === countryName);
    layer.bindPopup(stats ? createPopupContent(stats) : `<b>${countryName}</b><br>No data available`);
}

// Determine map color based on sentiment
function getColor(stats) {
    const forPercentage = stats.total_for / stats.total_posts;
    if (forPercentage >= 0.75) return "#67000d";
    if (forPercentage >= 0.5) return "#a50f15";
    if (forPercentage >= 0.25) return "#ef3b2c";
    return "#fcbba1";
}

// Create popup content
function createPopupContent(stats) {
    return `
        <b>${stats.country}</b><br>
        For: ${stats.total_for}<br>
        Against: ${stats.total_imod}<br>
        Total Posts: ${stats.total_posts}
    `;
}

// Add country markers to the map
function addCountryMarkers(map, countryData) {
    const markers = [
        { name: "Denmark", coords: [56.2639, 9.5018] },
        { name: "Germany", coords: [51.1657, 10.4515] },
        { name: "France", coords: [46.6034, 1.8883] },
        { name: "Malta", coords: [35.9375, 14.3754] },
        { name: "Wales", coords: [52.1307, -3.7837] },
        { name: "Switzerland", coords: [46.8182, 8.2275] },
    ];

    markers.forEach(({ name, coords }) => {
        const stats = countryData.find(data => data.country === name);
        if (stats) {
            L.circleMarker(coords, {
                radius: 5,
                fillColor: "#ff5959",
                color: "#f00",
                fillOpacity: 1,
            })
                .addTo(map)
                .bindPopup(createPopupContent(stats));
        }
    });
}

// Add legend to the map
function addLegend(map) {
    const legend = L.control({ position: "bottomleft" });

    legend.onAdd = () => {
        const div = L.DomUtil.create("div", "info legend");
        div.innerHTML = `
            <h4>Support Intensity</h4>
            <div style="background: linear-gradient(to right, #fcbba1, #ef3b2c, #a50f15, #67000d); height: 10px; width: 100%; margin-top: 5px;"></div>
            <div style="display: flex; justify-content: space-between;">
                <span>Low</span><span>High</span>
            </div>
        `;
        return div;
    };
    legend.addTo(map);
}

// Sentiment bar chart nr. 4
async function sentimentPercentageData() {
    const response = await fetch('http://localhost:3000/api/sentiment/percentages');
    const data = await response.json();
    const country = data.country;
    const positive_percentage = data.positive_percentage;
    const negative_percentage = data.negative_percentage;
    return { country, positive_percentage, negative_percentage }
}

async function renderSentimentPercentageChart() {
    const chartData = await sentimentPercentageData();
    const getChartElement = document.getElementById('sentiment_chart');
    new Chart(getChartElement, {
        type: "bar",
        data: {
            labels: chartData.country,
            datasets: [{
                label: 'none',
                data: chartData.positive_percentage,
                backgroundColor: '#4BAAC8',
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
                    text: 'Percentage of Interactions In Favor of Supporting Ukraine',
                    color: 'black',
                    font: {
                        size: 30,
                        weight: 'bold',
                    }
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Percentage',
                        color: '#4BAAC8',
                        font: {
                            size: 30,
                            weight: 'bold',
                        },
                    },
                    ticks: {
                        color: 'black',
                        padding: 10,
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.4)',
                        zIndex: -1, // Render gridlines behind bars
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Country',
                        color: '#4BAAC8',
                        font: {
                            size: 30,
                            weight: 'bold',
                        },
                    },
                    ticks: {
                        color: 'black',
                    },
                    grid: {
                        display: false, // No vertical gridlines
                    }
                }
            }
        }
    });
    console.log('Sentiment chart rendered!');
}
renderSentimentPercentageChart();