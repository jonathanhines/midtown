
var source = "https://spreadsheets.google.com/feeds/cells/1TXBlQVzJVVApWdJV-PvCMvLrg6OWW5LDZBpD76u7PbU/2/public/full?alt=json";

var displayColumns = [
    {key: "date", label: "Day"},
    {key: "time", label: "Time"},
    {key: "book", label: "Book Via SMS"},
];
var filtersID = "table-filters";
var timeFiltersID = "time-filter";
var dateFiltersID = "date-filter";
var tableID = "available-table";
var errorNoticeID = "available-error-notice";
var noneAvailableNoticeID = "none-available-notice";
var today = new Date();
var showDaysInFuture = 14;
var showUntilDate = new Date();
showUntilDate.setDate(today.getDate() + showDaysInFuture);
// today.setDate(today.getDate() + 4);
var thisDayOfWeek = today.getDay();
var displayDateOptions = { weekday: 'long', month: 'short', day: 'numeric' };
var displayDateLocale = "en-CA"
var bookLinkText = "SMS";
var bookLinkSMSBodyPrefix = "I'm interested in booking an appointment: ";
var noAppointmentsFoundMessage = "No appointments available at this time."
var noAppointmentsFoundMessageWithFilters = "No appointments available at this time for the filters you have selected."

var filterDate = "";
var filterTime = "";

var items = [];
var filterDates = [];
var filterTimes = [];

var canCache = storageAvailable('localStorage');
var cacheTimeMS = 1000 * 60 * 10; // 10 minutes in MS

window.addEventListener('load', function () {
    if(canCache) {
        // Get the cached available appointments
        var itemsRetrieved = localStorage.getItem('itemsRetrieved');

        if(itemsRetrieved) {
            storeUntilDate = new Date(parseInt(itemsRetrieved) + cacheTimeMS);

            if (storeUntilDate > today) {
                rawItems = localStorage.getItem('appointmentItems');
                if(rawItems) {
                    items = JSON.parse(rawItems);
                    buildFilters();
                    renderTable();
                    return;
                }
            } else {
                localStorage.removeItem('appointmentItems');
            }
        }
    }

    var xhr = new XMLHttpRequest();
    xhr.open("GET", source);
    xhr.onload = () => {
        if (xhr.status === 200) {
            var data = JSON.parse(xhr.responseText);
            loadTable(data.feed.entry);
        } else {
            let errorNoticeContainer = document.getElementById(errorNoticeID);
            errorNoticeContainer.textContent = "Error: Could not get available times. Try again later or contact Midtown Counselling directly.";
        }
    };
    xhr.send();
});

function loadTable(entries) {
    // Headings is a map of column headings
    const headings = [];
    items = [];
    let pRow = -1;
    let item = {};

    let itemInRange = false;
    let itemPastRange = false;

    // Loop over the spreadsheet cells
    for (entry of entries) {
        const cell = entry['gs$cell'];
        const row = parseInt(cell.row);
        const col = parseInt(cell.col);
        if(row === 1) {
            switch(cell["$t"]) {
                case "Date":
                    headings[col] = "date";
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
                if(item && itemInRange) {
                    items.push(item);
                }
                // We have a new row, add an entry and sae the last one.
                item = {
                    available: false
                }
                itemInRange = false;
                pRow = row;
            }
            const key = headings[col];
            if (key === "") {
                continue;
            }
            let value = cell["$t"];
            switch(key) {
                case "available":
                    if(value === "#N/A") {
                        value = false;
                    } else {
                        value = parseInt(value) === 1;
                    }
                    break;

                case "date":
                    itemDate = new Date(value);
                    itemPastRange = itemDate > showUntilDate;
                    itemInRange = itemDate > today && !itemPastRange;
                    break;
            }
            item[key] = value;
        }
        // Items are in order, if we go past don't bother processing it any further
        if(itemPastRange) {
            break;
        }
    }
    // If the end of the data is still in range add the last item.
    if(item && itemInRange) {
        items.push(item);
    }
    buildFilters();
    renderTable();

    if(canCache) {
        // Get the cached available appointments
        localStorage.setItem('itemsRetrieved', Date.now() + "");
        localStorage.setItem('appointmentItems', JSON.stringify(items));
    }
}

function buildFilters() {
    // Get a unique list of filters
    filterTimes = [];
    filterDates = [];
    filterTimeCounts = [];
    filterDateCounts = [];
    // We need to add filters in the order they are received as the order is important but we count how many there are in case we want to strip out empty filters
    items.forEach( (item, i) => {
        let timeIndex = filterTimes.indexOf(item["time"]);
        if( timeIndex === -1) {
            filterTimes.push(item["time"]);
            timeIndex = filterTimes.length - 1;
            filterTimeCounts[timeIndex] = 0;
        }
        let dateIndex = filterDates.indexOf(item["date"]);
        if( dateIndex === -1) {
            filterDates.push(item["date"]);
            dateIndex = filterDates.length - 1;
            filterDateCounts[dateIndex] = 0;
        }
        if (item["available"]) {
            filterTimeCounts[timeIndex]++;
            filterDateCounts[dateIndex]++;
        }
    });
    // Strip out empty filters
    // Walk backwards so that we can splice without changing index numbers of items not yet assessed
    for(let i = filterTimes.length - 1; i >=0; --i) {
        if(filterTimeCounts[i] <= 0) {
            filterTimes.splice(i,1);
        }
    }
    for(let i = filterDates.length - 1; i >= 0; --i) {
        if(filterDateCounts[i] <= 0) {
            filterDates.splice(i,1);
        }
    }

    let filters = document.getElementById(filtersID);
    addFilterSelect(filters, dateFiltersID, "Date", filterDates);
    addFilterSelect(filters, timeFiltersID, "Time", filterTimes);
}

function addFilterSelect(filters, id, labelText, filterOptions) {
    let label = document.createElement("label");
    filters.appendChild(label);
    let labelTextE = document.createTextNode(labelText + ": ");
    label.appendChild(labelTextE);
    let select = document.createElement("select");
    select.id = id;
    select.className = "custom-select";
    select.onchange = () => {
        filterItems();
    };
    label.appendChild(select);
    const allOption = document.createElement("option");
    allOption.value = -1;
    allOption.text = "All";
    select.appendChild(allOption);
    filterOptions.forEach((item,i) => {
        let option = document.createElement("option");
        option.value = i;
        option.text = item;
        select.appendChild(option);
    });
}

function filterItems() {
    let timeFilterValue = parseInt(document.getElementById(timeFiltersID).value);
    if(timeFilterValue >= 0) {
        filterTime = filterTimes[timeFilterValue];
    } else {
        filterTime = "";
    }

    let dateFilterValue = parseInt(document.getElementById(dateFiltersID).value);
    if(dateFilterValue >= 0) {
        filterDate = filterDates[dateFilterValue];
    } else {
        filterDate = "";
    }
    renderTable();
}

function renderTable() {
    let table = document.getElementById(tableID);
    table.innerHTML = "";
    generateTableHead(table);
    generateTable(table);
}

function generateTableHead(table) {
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

function generateTable(table) {
    let count = 0;
    items.forEach( (item, i) => {
        if (!item.available) {
            return;
        }
        if (filterTime !== "" && filterTime !== item["time"]) {
            return;
        }
        if (filterDate !== "" && filterDate !== item["date"]) {
            return;
        }
        count++;
        addTableRow(table, item);
    });
    let noneAvailableNoticeContainer = document.getElementById(noneAvailableNoticeID);
    if(count > 0) {
        noneAvailableNoticeContainer.textContent = "";
    } else {
        if(filterDate === "" && filterTime == "") {
            noneAvailableNoticeContainer.textContent = noAppointmentsFoundMessage;
        } else {
            noneAvailableNoticeContainer.textContent = noAppointmentsFoundMessageWithFilters;
        }
    }
}

function addTableRow(table, item) {
    let row = table.insertRow();
    for (let column of displayColumns) {
        let cell = row.insertCell();
        cell.className = "column-" + column.key;
        let value = item[column.key]
        switch(column.key) {
            case "book":
                let link = document.createElement("a");
                link.className = "sms-booking-link";
                link.href = "sms:" + smsContactNumber + "?body=" + encodeURI(bookLinkSMSBodyPrefix + item["time"] + " on " + item["date"]);
                link.title = "Book an appointment via sms for " + item["time"] + " on " + item["date"] + " (if your device supports sms)";
                // let linkText = document.createTextNode(bookLinkText);
                // link.appendChild(linkText);
                let img = document.createElement("img");
                img.src = "/assets/images/icons/sms.svg";
                link.appendChild(img);
                cell.appendChild(link);
                break;

            default:
                let text = document.createTextNode(value);
                cell.appendChild(text);
                break;
        }
    }
}

function storageAvailable(type) {
    var storage;
    try {
        storage = window[type];
        var x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch(e) {
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            (storage && storage.length !== 0);
    }
}