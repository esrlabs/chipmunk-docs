document.addEventListener('DOMContentLoaded', function () {
    // Load benchmark data from JSON
    fetch('data/data.json')
        .then(response => response.json())
        .then(data => {
            // Extract all unique file names
            const allFileNames = [];
            Object.keys(data).forEach(benchmark => {
                data[benchmark].forEach(entry => {
                    if (!allFileNames.includes(entry.release)) {
                        allFileNames.push(entry.release);
                    }
                });
            });

            // Prepare labels and datasets for Chart.js
            const datasets = Object.keys(data).map(benchmark => ({
                label: benchmark,
                data: data[benchmark].map(entry => entry.actual_value),
                fill: false,
                borderColor: getRandomColor(),
                tension: 0.1
            }));

            // Render chart using Chart.js
            const ctx = document.getElementById('benchmarkChart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: allFileNames,
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    plugins: {
                        tooltip: {
                            mode: 'index',
                            intersect: false
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Release'
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Actual Value (ms)'
                            }
                        }
                    }
                }
            });
        })
        .catch(error => console.error('Error fetching data:', error));

    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
});
