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
                label: 'none',
                data: chartData.totalInteractions,
                borderColor: "#4BAAC8",
                backgroundColor: "rgba(75, 170, 200, 0.3)",
                borderWidth: 2,
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
                    },
                },
                x: {
                    title: {
                        display: true,
                        text: 'Year and Quarter',
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
                        display: false,
                    },
                },
            },
        },
    });
    console.log('Total interactions chart finished rendering!');
}
renderTotalInteractionsChart();

// Interactive chart nr. 2
async function initSupportChart() {
    try {
        const timeseriesData = await fetch("http://localhost:3000/api/timeseries")
            .then((res) => res.json());

        const labels = timeseriesData.map((d) => `${d.year} Q${d.quarter}`);
        const supportData = timeseriesData.map((d) => d.avg_sentiment);

        const ctx = document.getElementById("chart2").getContext("2d");

        new Chart(ctx, {
            type: "line",
            data: {
                labels: labels,
                datasets: [
                    {
                        label: "Average support for Ukraine",
                        data: supportData,
                        borderColor: "#4BAAC8",
                        backgroundColor: "rgba(75, 170, 200, 0.3)",
                        borderWidth: 2,
                        pointRadius: 4,
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false,
                    },
                    title: {
                        display: true,
                        text: [
                            "How does the support for Ukraine change over time?",
                            "Support is calculated as +1 for 'for Ukraine' and -1 for 'against Ukraine'."
                        ],
                        color: 'black',
                        font: {
                            size: 30,
                            weight: 'bold',
                        },
                    },
                },
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: "Support level",
                            color: '#4BAAC8',
                            font: {
                                size: 30,
                                weight: 'bold',
                            },
                        },
                        min: -0.5,
                        max: 0.5,
                        ticks: {
                            color: 'black',
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.4)',
                        },
                    },
                    x: {
                        title: {
                            display: true,
                            text: "Year and Quarter",
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
                            display: false,
                        },
                    },
                },
            },
        });
    } catch (error) {
        console.error("Failed to fetch or render data:", error);
    }
}

// Sentiment bar chart nr. 4
async function sentimentPercentageData() {
    const response = await fetch('http://localhost:3000/api/sentiment/percentages');
    const data = await response.json();
    const country = data.country;
    const positive_percentage = data.positive_percentage;
    const negative_percentage = data.negative_percentage;
    return { country, positive_percentage, negative_percentage };
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
