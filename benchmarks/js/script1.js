document.addEventListener('DOMContentLoaded', function () {
    // Load benchmark data from JSON
    fetch('data/data.json')
        .then(response => response.json())
        .then(data => {
            // Prepare data for the two categories
            const below500Data = {};
            const above500Data = {};

            const allFileNames = [];

            Object.keys(data).forEach(benchmark => {
                data[benchmark].forEach(entry => {
                    if (!allFileNames.includes(entry.release)) {
                        allFileNames.push(entry.release);
                    }
                });

                const values = data[benchmark].map(entry => entry.actual_value);
                const maxValue = Math.max(...values);
                if (maxValue < 500) {
                    below500Data[benchmark] = data[benchmark];
                } else {
                    above500Data[benchmark] = data[benchmark];
                }
            });

            function createDatasets(data) {
                return Object.keys(data).map(benchmark => ({
                    label: benchmark,
                    data: data[benchmark].map(entry => entry.actual_value),
                    fill: false,
                    borderColor: getRandomColor(),
                    tension: 0.1
                }));
            }

            // Create datasets for both categories
            const below500Datasets = createDatasets(below500Data);
            const above500Datasets = createDatasets(above500Data);

            // Render chart for benchmarks with max value below 500 ms
            const ctxBelow500 = document.getElementById('chartSegment1').getContext('2d');
            new Chart(ctxBelow500, {
                type: 'line',
                data: {
                    labels: allFileNames,
                    datasets: below500Datasets
                },
                options: {
                    responsive: true,
                    plugins: {
                        tooltip: {
                            mode: 'index',
                            intersect: false
                        },
                        legend: {
                            position: 'chartArea'
                        }
                    },
                    scales: {
                        y: {
                            title: {
                                display: true,
                                text: 'Actual Value (ms)'
                            }
                        }
                    }
                }
            });

            // Render chart for benchmarks with min value above 500 ms
            const ctxAbove500 = document.getElementById('chartSegment2').getContext('2d');
            new Chart(ctxAbove500, {
                type: 'line',
                data: {
                    labels: allFileNames,
                    datasets: above500Datasets
                },
                options: {
                    responsive: true,
                    plugins: {
                        tooltip: {
                            mode: 'index',
                            intersect: false
                        },
                        legend: {
                            position: 'chartArea'
                        }
                    },
                    scales: {
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
