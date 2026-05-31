let currentColumnTypes = {};

async function uploadFile() {
    const fileInput = document.getElementById("csvFile");
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a CSV file.");
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    showLoading("Uploading CSV...");

    try {
        const response = await fetch("/upload", {
            method: "POST",
            body: formData
        });

        const result = await response.json();

        if (result.error) {
            alert(result.error);
            return;
        }

        currentColumnTypes = result.data_types;

        populateColumnDropdowns(result.column_names);
        updateChartOptions();
        updateAnalysisOptions();
        displaySummary(result);

    } finally {
        hideLoading();
    }
}

async function cleanData() {
    const formData = new FormData();

    formData.append(
        "remove_duplicates",
        document.getElementById("removeDuplicates").checked
    );

    formData.append(
        "missing_strategy",
        document.getElementById("missingStrategy").value
    );

    const response = await fetch("/clean", {
        method: "POST",
        body: formData
    });

    const result = await response.json();

    if (result.error) {
        alert(result.error);
        return;
    }

    displayCleaningResult(result);
}
function populateColumnDropdowns(columns) {

    const xSelect = document.getElementById("xColumn");
    const ySelect = document.getElementById("yColumn");
    const analysisGroupSelect = document.getElementById("analysisGroupColumn");
    const analysisValueSelect = document.getElementById("analysisValueColumn");

    xSelect.innerHTML = "";
    ySelect.innerHTML = "";
    analysisGroupSelect.innerHTML = "";
    analysisValueSelect.innerHTML = "";

    columns.forEach(column => {

        const xOption = document.createElement("option");
        xOption.value = column;
        xOption.textContent = column;
        xSelect.appendChild(xOption);

        const yOption = document.createElement("option");
        yOption.value = column;
        yOption.textContent = column;
        ySelect.appendChild(yOption);

        const groupOption = document.createElement("option");
        groupOption.value = column;
        groupOption.textContent = column;
        analysisGroupSelect.appendChild(groupOption);

        if (isNumericColumn(column)) {
            const valueOption = document.createElement("option");
            valueOption.value = column;
            valueOption.textContent = column;
            analysisValueSelect.appendChild(valueOption);
        }

    });
}
async function generateChart() {
    const formData = new FormData();

    formData.append("chart_type", document.getElementById("chartType").value);
    formData.append("x_column", document.getElementById("xColumn").value);
    formData.append("y_column", document.getElementById("yColumn").value);
    formData.append("aggregation", document.getElementById("aggregation").value);

   if (!document.getElementById("xColumn").value) {
        alert("Please upload a CSV file first.");
        return;
    }
   
    const response = await fetch("/chart", {
        method: "POST",
        body: formData
    });

    const result = await response.json();

    if (result.error) {
        alert(result.error);
        return;
    }

   const chart = result.chart;

    console.log(chart);

    Plotly.react("chartOutput", chart.data, chart.layout);  
}
function updateChartOptions() {
    const chartType = document.getElementById("chartType").value;

    const xSelect = document.getElementById("xColumn");
    const ySelect = document.getElementById("yColumn");
    const aggregation = document.getElementById("aggregation");

    const allColumns = Object.keys(currentColumnTypes);
    const numericColumns = getNumericColumns();

    xSelect.innerHTML = "";
    ySelect.innerHTML = "";

    let xColumns = allColumns;
    let yColumns = numericColumns;

    if (chartType === "scatter") {
        xColumns = numericColumns;
        yColumns = numericColumns;
        ySelect.disabled = false;
        aggregation.disabled = true;
    } 
    else if (chartType === "histogram") {
        xColumns = numericColumns;
        yColumns = [];
        ySelect.disabled = true;
        aggregation.disabled = true;
    } 
    else {
        xColumns = allColumns;
        yColumns = numericColumns;
        ySelect.disabled = false;
        aggregation.disabled = false;
    }

    xColumns.forEach(column => {
        const option = document.createElement("option");
        option.value = column;
        option.textContent = column;
        xSelect.appendChild(option);
    });

    yColumns.forEach(column => {
        const option = document.createElement("option");
        option.value = column;
        option.textContent = column;
        ySelect.appendChild(option);
    });
}
function displayCleaningResult(result) {
    const report = result.cleaning_report;

    const output = `
Cleaning Report

Initial rows: ${report.initial_rows}
Initial duplicate rows: ${report.initial_duplicates}
Final rows: ${report.final_rows}

Actions performed:
${report.actions_performed.map(action => "✓ " + action).join("\n")}

Missing values before:
${Object.entries(report.initial_missing_values)
    .map(([column, value]) => `${column}: ${value}`)
    .join("\n")}

Missing values after:
${Object.entries(report.final_missing_values)
    .map(([column, value]) => `${column}: ${value}`)
    .join("\n")}
`;

    document.getElementById("cleaningOutput").textContent = output;
}
function displaySummary(result) {
    const totalMissing = Object.values(result.missing_values)
        .reduce((sum, value) => sum + value, 0);

    const missingRows = Object.entries(result.missing_values)
        .filter(([column, value]) => value > 0)
        .map(([column, value]) => `
            <tr>
                <td>${column}</td>
                <td>${value}</td>
            </tr>
        `)
        .join("");    

    const output = `
        <div class="summary-cards">
            <div class="summary-card">
                <h3>Rows</h3>
                <p>${result.rows}</p>
            </div>

            <div class="summary-card">
                <h3>Columns</h3>
                <p>${result.columns}</p>
            </div>

            <div class="summary-card">
                <h3>Missing Values</h3>
                <p>${totalMissing}</p>
            </div>

            <div class="summary-card">
                <h3>Duplicate Rows</h3>
                <p>${result.duplicate_rows}</p>
            </div>
        </div>

        <h3>Missing Values by Column</h3>

        <table>
            <thead>
                <tr>
                    <th>Column</th>
                    <th>Missing Values</th>
                </tr>
            </thead>
            <tbody>
                ${missingRows || "<tr><td colspan='2'>No missing values found</td></tr>"}
            </tbody>
        </table>

        <h3>Column Names</h3>
        <p>${result.column_names.join(", ")}</p>
    `;

    document.getElementById("summaryOutput").innerHTML = output;
}
function isNumericColumn(column) {
    const dtype = currentColumnTypes[column];
    return dtype.includes("int") || dtype.includes("float");
}

function getNumericColumns() {
    return Object.keys(currentColumnTypes).filter(column => isNumericColumn(column));
}

async function runAnalysis() {
    const formData = new FormData();

    formData.append(
        "group_column",
        document.getElementById("analysisGroupColumn").value
    );

    formData.append(
        "value_column",
        document.getElementById("analysisValueColumn").value
    );

    const analysisType = document.getElementById("analysisType").value;

    let endpoint = "";

    if (analysisType === "highest") {
        endpoint = "/analyze/highest";
    } else if (analysisType === "average") {
        endpoint = "/analyze/average";
    } else if (analysisType === "count") {
        endpoint = "/analyze/count";
    } else if (analysisType === "trend") {
    endpoint = "/analyze/trend";
    } else if (analysisType === "correlation") {
    endpoint = "/analyze/correlation";
    }

    if (analysisType === "trend") {

    formData.delete("group_column");

    formData.append(
        "date_column",
        document.getElementById("analysisGroupColumn").value
    );
    }

    if (analysisType === "count") {
    formData.delete("value_column");
    formData.append(
        "category_column",
        document.getElementById("analysisGroupColumn").value
    );
    }

    if (analysisType === "correlation") {
    formData.delete("group_column");
    formData.delete("value_column");

    formData.append(
        "column_a",
        document.getElementById("analysisGroupColumn").value
    );

    formData.append(
        "column_b",
        document.getElementById("analysisValueColumn").value
    );
    }

    if (!endpoint) {
    alert("Please select a valid analysis type.");
    return;
    }

    if (!document.getElementById("analysisGroupColumn").value) {
        alert("Please select a group column.");
        return;
    }

    if (
        ["highest", "average", "trend", "correlation"].includes(analysisType) &&
        !document.getElementById("analysisValueColumn").value
    ) {
        alert("Please select a value column.");
        return;
    }

    const response = await fetch(endpoint, {
        method: "POST",
        body: formData
    });

    const result = await response.json();

    if (result.error) {
    alert(result.error);
    return;
    }

    if (analysisType === "correlation") {
    displayCorrelationResult(result.analysis_result);
    return;
    }

    displayAnalysisResult(result.analysis_result);
}   

function displayAnalysisResult(rows) {
    if (!Array.isArray(rows)) {

        document.getElementById("analysisOutput").innerHTML = `
            <h3>Correlation Result</h3>
            <p>
                Correlation between
                <strong>${rows.column_a}</strong>
                and
                <strong>${rows.column_b}</strong>
                :
                <strong>${rows.correlation}</strong>
            </p>
        `;

        return;
    }

    if (!rows || rows.length === 0) {
        document.getElementById("analysisOutput").innerHTML =
            "<p>No analysis result found.</p>";
        return;
    }

    let table = "<table><thead><tr>";

    Object.keys(rows[0]).forEach(column => {
        table += `<th>${column}</th>`;
    });

    table += "</tr></thead><tbody>";

    rows.forEach(row => {
        table += "<tr>";

        Object.values(row).forEach(value => {
            table += `<td>${value}</td>`;
        });

        table += "</tr>";
    });

    table += "</tbody></table>";

    document.getElementById("analysisOutput").innerHTML = table;

    const analysisType = document.getElementById("analysisType").value;

    if (analysisType === "trend") {
        const xColumn = Object.keys(rows[0])[0];
        const yColumn = Object.keys(rows[0])[1];

        const chartData = [
            {
                type: "scatter",
                mode: "lines+markers",
                x: rows.map(row => row[xColumn]),
                y: rows.map(row => row[yColumn])
            }
        ];

        const chartLayout = {
            title: `${yColumn} over ${xColumn}`,
            xaxis: { title: xColumn },
            yaxis: { title: yColumn }
        };

        Plotly.newPlot("analysisChartOutput", chartData, chartLayout, {
             responsive: true
    }); 

    } else {
    document.getElementById("analysisChartOutput").innerHTML = "";
    }
}

function updateAnalysisOptions() {
    const analysisType = document.getElementById("analysisType").value;
    const valueColumn = document.getElementById("analysisValueColumn");

    if (analysisType === "count") {
        valueColumn.disabled = true;
    } else {
        valueColumn.disabled = false;
    }
}

function displayCorrelationResult(result) {

    document.getElementById("analysisOutput").innerHTML =
        `<h3>Correlation Result</h3>
         <p>
            Correlation between
            ${result.column_a}
            and
            ${result.column_b}
            :
            <strong>${result.correlation}</strong>
         </p>`;

    const rows = result.data;

    if (!rows || rows.length === 0) {
        return;
    }

    const chartData = [{
        x: rows.map(row => row[result.column_a]),
        y: rows.map(row => row[result.column_b]),
        mode: "markers",
        type: "scatter"
    }];

    const layout = {
        title: `${result.column_b} vs ${result.column_a}`,
        xaxis: {
            title: result.column_a
        },
        yaxis: {
            title: result.column_b
        }
    };

    Plotly.react(
        "analysisChartOutput",
        chartData,
        layout
    );
}
function downloadCleanedCSV() {
    window.location.href = "/download-cleaned";
}

function showLoading(message) {
    const loadingMessage = document.getElementById("loadingMessage");
    loadingMessage.textContent = message;
    loadingMessage.style.display = "block";
}

function hideLoading() {
    const loadingMessage = document.getElementById("loadingMessage");
    loadingMessage.textContent = "";
    loadingMessage.style.display = "none";
}