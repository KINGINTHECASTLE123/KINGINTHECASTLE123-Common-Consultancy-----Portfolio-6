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

// Sentiment bar chart nr. 1
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
                label: '%',
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
                        zIndex: -1,
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Country',
                        color: '#F65B09',
                        font: {
                            size: 30,
                            weight: 'bold',
                        },
                    },
                    ticks: {
                        color: '#F65B09',
                    },
                    grid: {
                        display: false,
                    }
                }
            }
        }
    });
    console.log('Sentiment chart rendered!');
}
renderSentimentPercentageChart();

// Interactive chart nr. 2
async function initSupportChart() {
    try {
        const supportOverYearquartersData = await fetch("http://localhost:3000/api/support_over_yearquarters")
            .then((res) => res.json());

        // Kombiner år og kvartal til labels som "2021 Q1"
        const labels = supportOverYearquartersData.map((d) => `${d.year} Q${d.quarter}`);
        const supportData = supportOverYearquartersData.map((d) => d.avg_sentiment);

        const ctx = document.getElementById("chart2").getContext("2d");

        new Chart(ctx, {
            type: "line",
            data: {
                labels: labels,
                datasets: [
                    {
                        label: "Average support for Ukraine (by quarter)",
                        data: supportData,
                        borderColor: "#09A4F6",
                        backgroundColor: "transparent",
                        pointRadius: 4,
                        pointStyle: "circle",
                        borderWidth: 4,
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
                            text: "Support Level",
                            color: "#09A4F6",
                            font: {
                                size: 30,
                                weight: 'bold'
                            }
                        },
                        min: -40,
                        max: 100,
                        ticks: {
                            color: "#09A4F6",
                            font: {
                                size: 20,
                            }
                        }
                    },
                    x: {
                        type: "category",
                        title: {
                            display: true,
                            text: "Year and Quarter",
                            color: "#F65B09",
                            font: {
                                size: 20,
                                weight: 'bold',
                            }
                        },
                        ticks: {
                            autoSkip: false,
                            color: '#F65B09',
                            font: {
                                size: 15,
                            }
                        },
                    },
                },
                plugins: {
                    title: {
                        display: true,
                        text: [
                            "How does support for Ukraine change over time?",
                            "Values above 0 indicate support, values below 0 indicate against."
                        ],
                        color: 'black',
                        font: {
                            size: 25,
                            weight: 'bold',
                        }
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

// Interactive chart nr. 3
async function totalInteractionsData() {
    const response = await fetch('http://localhost:3000/api/total_interactions_over_year');
    const data = await response.json();
    const yearQuarter = data.year_quarter;
    const totalInteractions = data.total_interactions;
    return { yearQuarter, totalInteractions };
}

async function renderTotalInteractionsChart() {
    const chartData = await totalInteractionsData();
    const getChartElement = document.getElementById('chart1');
    new Chart(getChartElement, {
        type: "line",
        data: {
            labels: chartData.yearQuarter,
            datasets: [{
                label: 'Interactions',
                data: chartData.totalInteractions,
                borderColor: "#09A4F6",
                backgroundColor: "transparent",
                borderWidth: 4,
                pointRadius: 4,
                pointStyle: "circle",
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
                    text: 'Total Interactions Over The Course Of War-time',
                    color: 'black',
                    font: {
                        size: 30,
                        weight: 'bold',
                    },
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Interactions',
                        color: '#09A4F6',
                        font: {
                            size: 30,
                            weight: 'bold',
                        },
                    },
                    ticks: {
                        color: '#09A4F6',
                        padding: 10,
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.4)',
                    },
                },
                x: {
                    title: {
                        display: true,
                        text: 'Year and Quarter',
                        color: '#F65B09',
                        font: {
                            size: 30,
                            weight: 'bold',
                        },
                    },
                    ticks: {
                        color: '#F65B09',
                    },
                    grid: {
                        display: false,
                    },
                },
            },
        },
    });
    console.log('Total interactions chart finished rendering!');
}
renderTotalInteractionsChart();

// Interactive Map nr. 4
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
    // Convert string to numbers
    const total_forNumber = Number(stats.total_for);
    const total_imodNumber = Number(stats.total_imod);
    const totalVotes = total_forNumber + total_imodNumber;

    // Calculate percentage
    stats.forPercentage = totalVotes > 0 ? (total_forNumber / totalVotes) * 100 : 0;

    // Determine color based on percentage
    const forPercentage = total_forNumber / totalVotes;
    if (forPercentage >= 0.80) return "#67000d";
    if (forPercentage >= 0.70) return "#a50f15";
    if (forPercentage >= 0.60) return "#ef3b2c";
    if (forPercentage >= 0.50) return "#fcbba1";
    return "#fcbba1";
}

// Create popup content
function createPopupContent(stats) {
    return `
        <b>${stats.country}</b><br>
        For: ${stats.total_for}<br>
        Against: ${stats.total_imod}<br>
        Sentiment: ${stats.forPercentage.toFixed(1)}% 
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