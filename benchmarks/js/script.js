document.addEventListener('DOMContentLoaded', () => {
    // Function to generate a random color
    const getRandomColor = () => {
        return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    };

    // Function to create datasets from benchmark data
    const createDatasets = (data) => {
        return Object.keys(data).map(benchmark => ({
            label: benchmark,
            data: data[benchmark].map(entry => entry.actual_value),
            fill: false,
            borderColor: getRandomColor(),
            tension: 0.1
        }));
    };

    // Function to handle clicking of labels on the x-axis
    const clickableScales = (chart, event) => {
        const { top, bottom, left, width: chartWidth } = chart.scales.x;
        const tickWidth = chartWidth / chart.scales.x.ticks.length;
        const { clientX, clientY } = event;
        const { left: canvasLeft, top: canvasTop } = chart.canvas.getBoundingClientRect();
        const x = clientX - canvasLeft;
        const y = clientY - canvasTop;

        if (y >= top && y <= bottom) {
            chart.scales.x.ticks.forEach((tick, i) => {
                const tickStart = left + i * tickWidth;
                const tickEnd = tickStart + tickWidth;
                if (x >= tickStart && x <= tickEnd) {
                    const label = chart.data.labels[i];
                    let url;

                    if (label.startsWith('PR_')) {
                        // Open pull request URL if the label starts with "PR_"
                        url = `https://github.com/esrlabs/chipmunk/pull/${label.split("_")[1]}`;
                    } else {
                        // Open release URL if the label does not start with "PR_"
                        url = `https://github.com/esrlabs/chipmunk/releases/tag/${label}`;
                    }

                    window.open(url, '_blank');
                }
            });
        }
    };


    // Function to render a chart
    const renderChart = (canvasId, labels, datasets) => {
        const ctx = document.getElementById(canvasId).getContext('2d');
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets
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

        document.getElementById(canvasId).addEventListener('click', (e) => {
            clickableScales(chart, e);
        });

        return chart;
    };

    // Function to fetch and combine data
    const fetchAndCombineData = (prId) => {
        const fetchMainData = fetch('data/data.json').then(response => response.json());
        const fetchPrData = prId ? fetch(`data/pull_request/Benchmark_PR_${prId}.json`).then(response => response.json()) : Promise.resolve({});

        return Promise.all([fetchMainData, fetchPrData])
            .then(([mainData, prData]) => {
                // Combine data
                const combinedData = { ...mainData };

                // Merge pull request data into combined data
                Object.entries(prData).forEach(([benchmark, entries]) => {
                    if (!combinedData[benchmark]) {
                        combinedData[benchmark] = [];
                    }
                    combinedData[benchmark] = combinedData[benchmark].concat(entries);
                });

                // Generate datasets
                const allFileNames = [...new Set(Object.values(combinedData).flat().map(entry => entry.release))];
                const below500Data = {};
                const above500Data = {};

                Object.entries(combinedData).forEach(([benchmark, entries]) => {
                    const maxValue = Math.max(...entries.map(entry => entry.actual_value));
                    if (maxValue < 500) {
                        below500Data[benchmark] = entries;
                    } else {
                        above500Data[benchmark] = entries;
                    }
                });

                const datasets = createDatasets(combinedData);
                const below500Datasets = createDatasets(below500Data);
                const above500Datasets = createDatasets(above500Data);

                // Render charts
                renderChart('chart_full', allFileNames, datasets);
                renderChart('chart_below500', allFileNames, below500Datasets);
                renderChart('chart_above500', allFileNames, above500Datasets);
            })
            .catch(error => console.error('Error fetching data:', error));
    };

    // Parse URL parameters
    const getQueryParams = () => {
        let params = {};
        window.location.search.substring(1).split("&").forEach(function(part) {
            let pair = part.split("=");
            params[pair[0]] = decodeURIComponent(pair[1]);
        });
        return params;
    };

    // Fetch benchmark data and render charts
    const params = getQueryParams();
    var prId = params['pr_id'] || null;

    fetchAndCombineData(prId);
});
