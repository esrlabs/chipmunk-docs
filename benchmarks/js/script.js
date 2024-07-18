document.addEventListener('DOMContentLoaded', () => {
    // function to generate a random color
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

            // // Function to handle click events on the x-axis
            // function clickableScales(canvas, click) {
            //     const height = chart.scales.x.height;
            //     const top = chart.scales.x.top;
            //     const bottom = chart.scales.x.bottom;
            //     const left = chart.scales.x.left;
            //     const right = chart.scales.x.maxWidth / chart.scales.x.ticks.length;
            //     const width = right - left;
            //     // alert(`right = ${chart.scales.x.maxWidth}/${chart.scales.x.ticks.length} = ${right}`)

            //     let resetCoordinates = canvas.getBoundingClientRect()
            //     // alert (event.clientX);
            //     const x = click.clientX - resetCoordinates.left;
            //     const y = click.clientY - resetCoordinates.top;

            //     for (let i = 0; i < chart.scales.x.ticks.length; i++) {
            //         // alert (`x=${x}\ny=${y}\nleft=${left}\nright=${right}\ntop=${top}\nbottom=${bottom}\ni=${i}\nx >= left + (right * i) && x <= right + (right * i) && y >= top && y <= bottom`);
            //         // alert (`i=${i}\n${width}\n${x} >= ${left} + (${right * i}) && ${x} <= ${right} + (${right * i}) && ${y} >= ${top} && ${y} <= ${bottom}`);
            //         // alert(x >= left + (right * i) && x <= right + (right * i) && y >= top && y <= bottom);
            //         if ((width + x >= (left + right*i)) && (x <= (left + right + right * i)) && (y >= top && y <= bottom)) {
            //             // alert(chart.data.labels[i]);
            //             const url = `https://github.com/esrlabs/chipmunk/releases/tag/${chart.data.labels[i]}`;
            //             window.open(url, '_blank');
            //             break;
            //         }
            //     }
            // }

    // Function to handle click events on the x-axis
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
                    const url = `https://github.com/esrlabs/chipmunk/releases/tag/${chart.data.labels[i]}`;
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

    // Fetch benchmark data and render charts
    fetch('data/data.json')
        .then(response => response.json())
        .then(data => {
            const allFileNames = [...new Set(Object.values(data).flat().map(entry => entry.release))];

            const below500Data = {};
            const above500Data = {};
            Object.entries(data).forEach(([benchmark, entries]) => {
                const maxValue = Math.max(...entries.map(entry => entry.actual_value));
                if (maxValue < 500) {
                    below500Data[benchmark] = entries;
                } else {
                    above500Data[benchmark] = entries;
                }
            });

            const datasets = createDatasets(data);
            const below500Datasets = createDatasets(below500Data);
            const above500Datasets = createDatasets(above500Data);
            renderChart('chart_full', allFileNames, datasets);
            renderChart('chart_below500', allFileNames, below500Datasets);
            renderChart('chart_above500', allFileNames, above500Datasets);
        })
        .catch(error => console.error('Error fetching data:', error));
});