document.addEventListener("DOMContentLoaded", () => {
    console.log("Dashboard loaded!");

    // Placeholder for Chart.js integration
    const ctx1 = document.getElementById('chart1').getContext('2d');
    const ctx2 = document.getElementById('chart2').getContext('2d');

    // Placeholder data
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

    // Placeholder charts (to replace later)
    const chart1 = new Chart(ctx1, {
        type: 'bar',
        data: placeholderData,
        options: {
            responsive: true,
        }
    });

    const chart2 = new Chart(ctx2, {
        type: 'line',
        data: placeholderData,
        options: {
            responsive: true,
        }
    });
});