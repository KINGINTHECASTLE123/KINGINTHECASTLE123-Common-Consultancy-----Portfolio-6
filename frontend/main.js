document.addEventListener("DOMContentLoaded", () => {
    console.log("Dashboard loaded!");

    // Initialize Chart.js placeholders
    const ctx1 = document.getElementById('chart1').getContext('2d');
    const ctx2 = document.getElementById('chart2').getContext('2d');

    // Placeholder data for charts
    const placeholderData = {
        labels: ['January', 'February', 'March', 'April', 'May'],
        datasets: [{
            label: 'Sample Data',
            data: [10, 20, 30, 40, 50],
            backgroundColor: ['rgba(255, 99, 132, 0.2)'],
            borderColor: ['rgba(255, 99, 132, 1)'],
            borderWidth: 1
        }]
    };

    // Initialize Chart.js charts
    new Chart(ctx1, {
        type: 'bar',
        data: placeholderData,
        options: {
            responsive: true,
        }
    });

    new Chart(ctx2, {
        type: 'line',
        data: placeholderData,
        options: {
            responsive: true,
        }
    });

    // Initialize Leaflet.js map
    const map = L.map('map').setView([54.5260, 15.2551], 4); // Centered in Europe

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Fetch and display country data on the map
    fetch('http://localhost:3000/api/classification/ukraine')
        .then(response => response.json())
        .then(data => {
            data.forEach(country => {
                let color;
                switch (country.position) {
                    case 'for':
                        color = 'green';
                        break;
                    case 'neutral':
                        color = 'yellow';
                        break;
                    case 'imod':
                        color = 'red';
                        break;
                    default:
                        color = 'gray';
                }
            });
        })
        .catch(error => console.error('Error fetching country data:', error));
});
