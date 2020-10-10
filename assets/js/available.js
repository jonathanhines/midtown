var source = "https://spreadsheets.google.com/feeds/cells/1-JUCauIx2D3oeR2bRU5VbDCqHsgH8A1yT6xEOIPxHoc/1/public/full?alt=json";
var displayColumns = [
    {key: "day", label: "Day"},
    {key: "time", label: "Time"},
];
var tableID = "available-table";

$(function() {
    $.getJSON( source, function( data ) {
        buildTable(data.feed.entry);
    });
});

function buildTable(entries) {
    // Headings is a map of column headings
    const headings = [];
    const items = [];
    let pRow = -1;
    // Loop over the spreadsheet cells
    for (entry of entries) {
        const cell = entry['gs$cell'];
        const row = parseInt(cell.row);
        const col = parseInt(cell.col);
        if(row === 1) {
            switch(cell["$t"]) {
                case "Day":
                    headings[col] = "day";
                    break;
                case "Time":
                    headings[col] = "time";
                    break;
                case "Available":
                    headings[col] = "available";
                    break;
                default:
                    headings[col] = "";
                    break;
            }
        } else if (row > 1) {
            if (pRow !== row) {
                // We have a new row, add an entry and sae the last one.
                items[row - 2] = {
                    available: false
                }
                pRow = row;
            }
            const key = headings[col];
            if (key === "") {
                continue;
            }
            let value = cell["$t"];
            switch(key) {
                case "available":
                    value = parseInt(value) === 1;
                    break;
            }
            items[row - 2][key] = value;
        }
    }
    let table = document.getElementById(tableID);
    let data = Object.keys(items[0]);
    generateTableHead(table, data);
    generateTable(table, items);
}

function generateTableHead(table, data) {
    let thead = table.createTHead();
    let row = thead.insertRow();
    for (let column of displayColumns) {
        let th = document.createElement("th");
        th.className = "column-" + column.key;
        let text = document.createTextNode(column.label);
        th.appendChild(text);
        row.appendChild(th);
    }
}

function generateTable(table, data) {
    data.forEach( (item, i) => {
        if (!item.available) {
            return;
        }
        let row = table.insertRow();
        for (let column of displayColumns) {
            let cell = row.insertCell();
            cell.className = "column-" + column.key;
            let value = item[column.key]
            let text = document.createTextNode(value);
            cell.appendChild(text);
        }
    });
}