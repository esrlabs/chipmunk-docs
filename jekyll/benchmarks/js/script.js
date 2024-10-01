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

    // Function to create a graph container dynamically
    const createGraphContainer = (benchmarkName) => {
        const container = document.createElement('div');
        container.className = 'graph_container';

        const descriptionDiv = document.createElement('div');
        descriptionDiv.className = 'description';
        descriptionDiv.textContent = `Performance test comparison for ${benchmarkName}`;

        const chartContainerDiv = document.createElement('div');
        chartContainerDiv.className = 'chart-container';
        const canvas = document.createElement('canvas');
        canvas.id = `chart_${benchmarkName.replace(/\s+/g, '_')}`;

        chartContainerDiv.appendChild(canvas);
        container.appendChild(descriptionDiv);
        container.appendChild(chartContainerDiv);

        return container;
    };

    // Function to handle clickable x-axis labels
    const clickableScales = (chart, event, prId) => {
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

                    if (label.startsWith('PR_') && prId) {
                        // Open pull request URL if the label starts with "PR_" and pr_id exists
                        url = `https://github.com/esrlabs/chipmunk/pull/${prId}`;
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
    const renderChart = (canvasId, labels, datasets, prId) => {
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
            clickableScales(chart, e, prId);
        });

        return chart;
    };

    // Function to fetch and combine data
    const fetchAndCombineData = (prId) => {
        // Fetch the main data
        const fetchMainData = fetch('data/data.json').then(response => response.json());

        // Fetch the PR data if prId is provided
        const fetchPrData = prId ? fetch(`data/pull_request/Benchmark_PR_${prId}.json`).then(response => response.json()) : Promise.resolve({});

        // Combine the main data with PR data
        return Promise.all([fetchMainData, fetchPrData]).then(([mainData, prData]) => {
            // Merge the PR data into the main data
            Object.entries(prData).forEach(([benchmark, entries]) => {
                if (!mainData[benchmark]) {
                    mainData[benchmark] = [];
                }
                mainData[benchmark] = mainData[benchmark].concat(entries);
            });

            return mainData;
        });
    };

    // Function to fetch and render all benchmarks as individual charts
    const fetchAndRenderBenchmarks = (prId) => {
        fetchAndCombineData(prId)
            .then((combinedData) => {
                const allFileNames = [...new Set(Object.values(combinedData).flat().map(entry => entry.release))];

                Object.keys(combinedData).forEach(benchmarkName => {
                    const entries = combinedData[benchmarkName];
                    const container = createGraphContainer(benchmarkName);

                    document.getElementById('dynamic_graphs_container').appendChild(container);

                    const datasets = createDatasets({ [benchmarkName]: entries });
                    renderChart(`chart_${benchmarkName.replace(/\s+/g, '_')}`, allFileNames, datasets, prId);
                });
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
    const prId = params['pr_id'] || null;

    fetchAndRenderBenchmarks(prId);
});
