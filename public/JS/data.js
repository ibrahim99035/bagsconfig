document.addEventListener('DOMContentLoaded', () => {
    fetch('/get-config')
        .then(response => response.json())
        .then(config => {
            renderConfigForm(config);
        })
        .catch(error => {
            console.error('Error fetching configuration:', error);
        });

    fetch('/get-all-data')
        .then(response => response.json())
        .then(data => {
            renderAllData(data);
        })
        .catch(error => {
            console.error('Error fetching all data:', error);
        });
});

function renderAllData(data) {
    const allDataTable = document.getElementById('all-data');
    console.log(data);
    allDataTable.innerHTML = data.map(row => `
        <tr>
            <td>${row.quantity}</td>
            <td>${row.colorCount}</td>
            <td><div style="width: 20px; height: 20px; background-color: ${row.mainColor};"></div> ${row.mainColor}</td>
            <td>${row.handAttachment}</td>
            <td>${row.printingMethod}</td>
            <td>${roundValue(row.area)}</td>
            <td>${roundValue(row.weight)}</td>
            <td>${roundValue(row.costPrice)}</td>
            <td>${roundValue(row.sellingPrice)}</td>
            <td>${roundValue(row.coloringAndPrintingCost)}</td>
            <td>${row.createdAt}</td>
        </tr>
    `).join('');
}

function roundValue(value) {
    return Math.round(value * 100) / 100;
}