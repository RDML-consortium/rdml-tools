"use strict";

const API_URL = "dddd" //process.env.API_URL
const API_LINK = " fffff" //process.env.API_LINK

const submitButton = document.getElementById('btn-submit')
submitButton.addEventListener('click', loadInputFile)

const exampleButton = document.getElementById('btn-example')
exampleButton.addEventListener('click', showExample)

const inputFile = document.getElementById('inputFile')
const inputTableView = document.getElementById('import-table-view')
const reshapeTableView = document.getElementById('reshape-table-view')
const exportTableView = document.getElementById('export-table-view')

const saveJsonButton = document.getElementById('btn-save-Json')
saveJsonButton.addEventListener('click', saveJsonFile)
const saveTabButton = document.getElementById('btn-save-Tsv')
saveTabButton.addEventListener('click', saveTabFile)
const loadJFile = document.getElementById('inputJsonFile')
loadJFile.addEventListener('change', loadJsonFile, false);


// Global data
window.inputFile = ""
window.inputSeparator = "\t"
window.modifySettings = {}
window.resultTab = []

window.loadInputFile = loadInputFile
function loadInputFile(){
    var file = inputFile.files[0];
    if (file) { // && file.type.match("text/*")) {
        var reader = new FileReader();
        reader.onload = function(event) {
            var txt = event.target.result;
            txt = txt.replace(/\r\n/g, "\n");
            txt = txt.replace(/\r/g, "\n");
            txt = txt.replace(/\n+/g, "\n");
            txt = txt.replace(/\n$/g, "");
            window.inputFile = txt;
            updateSepCount(window.inputFile)
        }
        reader.readAsText(file);
    } else {
        alert("Error opening file");
    }
}

window.updateSepCount = updateSepCount
function updateSepCount(txt) {
    var tab = 0;
    var semi = 0;
    var colon = 0;
    var comma = 0;
    for ( var i = 0 ; i < txt.length ; i++ ) {
        if (txt.charAt(i) == "\t") {
            tab++;
        }
        if (txt.charAt(i) == ";") {
            semi++;
        }
        if (txt.charAt(i) == ":") {
            colon++;
        }
        if (txt.charAt(i) == ",") {
            comma++;
        }
    }

    document.getElementById('sep-opt-tab').innerHTML = "Tab (\\t - Found: " + tab + ")"
    document.getElementById('sep-opt-comma').innerHTML = "Comma (, - Found: " + comma + ")"
    document.getElementById('sep-opt-semicolon').innerHTML = "Semicolon (; - Found: " + semi + ")"
    document.getElementById('sep-opt-colon').innerHTML = "Colon (: - Found: " + colon + ")"

    var max = 0;
    if (tab > max) {
        max = tab
        window.inputSeparator = "\t"
    }
    if (comma > max) {
        max = comma
        window.inputSeparator = ","
    }
    if (semi > max) {
        max = semi
        window.inputSeparator = ";"
    }
    if (colon > max) {
        max = colon
        window.inputSeparator = ":"
    }

    document.getElementById('sep-radio-tab').checked = false;
    document.getElementById('sep-radio-comma').checked = false;
    document.getElementById('sep-radio-semicolon').checked = false;
    document.getElementById('sep-radio-colon').checked = false;

    if (window.inputSeparator == "\t") {
        document.getElementById('sep-radio-tab').checked = true;
    }
    if (window.inputSeparator == ",") {
        document.getElementById('sep-radio-comma').checked = true;
    }
    if (window.inputSeparator == ";") {
        document.getElementById('sep-radio-semicolon').checked = true;
    }
    if (window.inputSeparator == ":") {
        document.getElementById('sep-radio-colon').checked = true;
    }
    drawImportTable();
    updateModification();
}

window.updateSepManual = updateSepManual;
function updateSepManual(el) {
    if (el.value == "\\t") {
        window.inputSeparator = "\t";
    } else {
        window.inputSeparator = el.value;
    }
   drawImportTable();
   updateModification();
}

window.drawImportTable = drawImportTable;
function drawImportTable() {
    var preTab = window.inputFile.split("\n");
    var tab = [];
    for (var i = 0 ; i < preTab.length ; i++) {
        tab.push(preTab[i].split(window.inputSeparator));
    }
    inputTableView.innerHTML = drawHtmlTable(tab)
}

window.drawHtmlTable = drawHtmlTable;
function drawHtmlTable(tab) {
    var retVal = "<table class=\"tablePreview\">\n"
    retVal += "<tr>\n<th style=\"background-color: grey;\"></th>\n";
    var maxXCount = 0;
    for (var i = 0 ; i < tab.length ; i++) {
        if (maxXCount < tab[i].length) {
            maxXCount = tab[i].length;
        }
    }
    for (var i = 0 ; i < maxXCount ; i++) {
         retVal += "<th style=\"background-color: grey;\">" + (i + 1) + "</th>\n"
    }
    retVal += "</tr>\n"
    for (var i = 0 ; i < tab.length ; i++) {
        retVal += "<tr>\n<td style=\"background-color: grey;\">" + (i + 1) + "</td>\n"
        for (var k = 0 ; k < tab[i].length ; k++) {
            retVal += "<td>" + tab[i][k] + "</td>\n"
        }
        retVal += "</tr>\n"
    }
    return retVal;
}

window.detectBrowser = detectBrowser;
function detectBrowser() {
    var browser = window.navigator.userAgent.toLowerCase();
    if (browser.indexOf("edge") != -1) {
        return "edge";
    }
    if (browser.indexOf("firefox") != -1) {
        return "firefox";
    }
    if (browser.indexOf("chrome") != -1) {
        return "chrome";
    }
    if (browser.indexOf("safari") != -1) {
        return "safari";
    }
    alert("Unknown Browser: Functionality may be impaired!\n\n" + browser);
    return browser;
}

window.saveJsonFile = saveJsonFile;
function saveJsonFile() {
    if (window.data == "") {
        return;
    }
    var content = JSON.stringify(window.modifySettings);
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style.display = "none";
    var blob = new Blob([content], {type: "application/json"});
    var browser = detectBrowser();
    if (browser != "edge") {
	    var url = window.URL.createObjectURL(blob);
	    a.href = url;
	    a.download = "TableShaper_settings.json";
	    a.click();
	    window.URL.revokeObjectURL(url);
    } else {
        window.navigator.msSaveBlob(blob, fileName);
    }
    return;
};

window.saveTabFile = saveTabFile;
function saveTabFile() {
    if (window.resultTab == []) {
        return;
    }
    var content = "";
    for (var i = 0 ; i < window.resultTab.length ; i++) {
        for (var k = 0 ; k < window.resultTab[i].length ; k++) {
            content += window.resultTab[i][k] + "\t"
        }
        content = content.replace(/\t$/g, "\n");
    }
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style.display = "none";
    var blob = new Blob([content], {type: "text/tab-separated-values"});
    var browser = detectBrowser();
    if (browser != "edge") {
	    var url = window.URL.createObjectURL(blob);
	    a.href = url;
	    a.download = "silica_primers.tsv";
	    a.click();
	    window.URL.revokeObjectURL(url);
    } else {
        window.navigator.msSaveBlob(blob, fileName);
    }
    return;
};

window.loadJsonFile = loadJsonFile;
function loadJsonFile(f){
    var file = f.target.files[0];
    if (file) { // && file.type.match("text/*")) {
        var reader = new FileReader();
        reader.onload = function(event) {
            var newSett = JSON.parse(event.target.result);
            loadModification(newSett);
            updateModification();
        }
        reader.readAsText(file);
    } else {
        alert("Error opening file");
    }
}

window.updateKeyEl = updateKeyEl;
function updateKeyEl(newSett,keyName,elName) {
    if (newSett.hasOwnProperty(keyName)) {
        document.getElementById(elName).value = newSett[keyName];
        window.modifySettings[keyName] = newSett[keyName];
    }
}

window.updateKeyElCheck = updateKeyElCheck;
function updateKeyElCheck(newSett,keyName,elName) {
    if (newSett.hasOwnProperty(keyName)) {
        document.getElementById(elName).checked = newSett[keyName];
        window.modifySettings[keyName] = newSett[keyName];
    }
}

window.loadModification = loadModification;
function loadModification(newSett) {
    updateKeyEl(newSett,"settingsID","modSetName");
    updateKeyEl(newSett,"reformatTableShape","modReformatTableShape");
    updateKeyEl(newSett,"reformatCutStart","modReformatCutStart");
    updateKeyEl(newSett,"reformatNewColum","modReformatNewColum");
    updateKeyEl(newSett,"fluorDelColStart","modDelColStart");
    updateKeyEl(newSett,"fluorDelRowStart","modDelRowStart");
    updateKeyEl(newSett,"fluorDelOtherCol","modDelOtherCol");
    updateKeyEl(newSett,"fluorDelColEnd","modDelColEnd");
    updateKeyEl(newSett,"fluorDelRowEnd","modDelRowEnd");
    updateKeyElCheck(newSett,"fluorCommaDot","modCommaDot");

    updateKeyEl(newSett,"exCycRow","modExCycRow");
    updateKeyEl(newSett,"exCycRegEx","modExCycRegEx");
    updateKeyEl(newSett,"exWellCol","modExWellCol");
    updateKeyEl(newSett,"exWellRegEx","modExWellRegEx");
}

window.updateModification = updateModification;
function updateModification() {
    window.modifySettings["settingsID"] = document.getElementById('modSetName').value;
    window.modifySettings["reformatTableShape"] = document.getElementById('modReformatTableShape').value;
    window.modifySettings["reformatCutStart"] = parseInt(document.getElementById('modReformatCutStart').value);
    window.modifySettings["reformatNewColum"] = parseInt(document.getElementById('modReformatNewColum').value);
    window.modifySettings["fluorDelColStart"] = parseInt(document.getElementById('modDelColStart').value);
    window.modifySettings["fluorDelRowStart"] = parseInt(document.getElementById('modDelRowStart').value);
    window.modifySettings["fluorDelOtherCol"] = parseInt(document.getElementById('modDelOtherCol').value);
    window.modifySettings["fluorDelColEnd"] = parseInt(document.getElementById('modDelColEnd').value);
    window.modifySettings["fluorDelRowEnd"] = parseInt(document.getElementById('modDelRowEnd').value);
    window.modifySettings["fluorCommaDot"] = document.getElementById("modCommaDot").checked;

    window.modifySettings["exCycRow"] = parseInt(document.getElementById('modExCycRow').value);
    window.modifySettings["exCycRegEx"] = document.getElementById('modExCycRegEx').value;
    window.modifySettings["exWellCol"] = parseInt(document.getElementById('modExWellCol').value);
    window.modifySettings["exWellRegEx"] = document.getElementById('modExWellRegEx').value;

    var clElem = document.getElementsByClassName('table-list-only');
    if (window.modifySettings["reformatTableShape"] == "create") {
        for (var i = 0; i < clElem.length; i++) {
            clElem[i].style.display = "inline";
        }
    } else {
        for (var i = 0; i < clElem.length; i++) {
            clElem[i].style.display = "none";
        }
    }

    var preTab = window.inputFile.split("\n");
    var tab = [];
    for (var i = 0 ; i < preTab.length ; i++) {
        tab.push(preTab[i].split(window.inputSeparator));
    }

    // Shape the table
    if (window.modifySettings["reformatTableShape"] == "flip") {
        var maxXCount = 0;
        for (var i = 0 ; i < tab.length ; i++) {
            if (maxXCount < tab[i].length) {
                maxXCount = tab[i].length;
            }
        }
        var ntab = [];
        for (var c = 0 ; c < maxXCount ; c++) {
            ntab[c] = [];
            for (var r = 0 ; r < tab.length ; r++) {
                if (c < tab[r].length ) {
                    ntab[c][r] = tab[r][c];
                }
            }
        }
        tab = ntab;
    }

    reshapeTableView.innerHTML = drawHtmlTable(tab)
    var minRowNr = 0;
    if (window.modifySettings["fluorDelRowStart"] > 0) {
         minRowNr = window.modifySettings["fluorDelRowStart"];
    }
    var maxRowNr = tab.length;
    if ((window.modifySettings["fluorDelRowEnd"] > 1) && (window.modifySettings["fluorDelRowEnd"] < tab.length)) {
         maxRowNr = window.modifySettings["fluorDelRowEnd"];
    }

    // Insert columns and extract the fluorescence data
    var ftab = [["Well", "Sample", "Sample Type", "Target", "Target Type", "Dye"]];
    for (var r = minRowNr ; r < maxRowNr ; r++) {
        ftab[(r - minRowNr + 1)] = ["", "", "", "", "", ""];
        var minColNr = 0;
        if (window.modifySettings["fluorDelColStart"] > 0) {
             minColNr = window.modifySettings["fluorDelColStart"];
        }
        var maxColNr = tab[r].length;
        if ((window.modifySettings["fluorDelColEnd"] > 1) && (window.modifySettings["fluorDelColEnd"] < tab[r].length)) {
             maxColNr = window.modifySettings["fluorDelColEnd"];
        }
        var jumpStep = 1;
        if (window.modifySettings["fluorDelOtherCol"] > 0) {
             jumpStep = window.modifySettings["fluorDelOtherCol"] + 1 ;
        }
        var realColNr = 5;
        for (var c = minColNr ; c < maxColNr ; c += jumpStep) {
            realColNr++;
            if (window.modifySettings["fluorCommaDot"] == true) {
                ftab[(r - minRowNr + 1)][realColNr] = tab[r][c].replace(/,/g, ".");;
            } else {
                ftab[(r - minRowNr + 1)][realColNr] = tab[r][c];
            }
        }
    }

    // Insert extracted data
    // Cycle information
    var cycRowRe = new RegExp(window.modifySettings["exCycRegEx"]);
    var fRow = window.modifySettings["exCycRow"] - 1;
    var minColNr = 0;
    if (window.modifySettings["fluorDelColStart"] > 0) {
         minColNr = window.modifySettings["fluorDelColStart"];
    }
    var maxColNr = tab[fRow].length;
    if ((window.modifySettings["fluorDelColEnd"] > 1) && (window.modifySettings["fluorDelColEnd"] < tab[fRow].length)) {
         maxColNr = window.modifySettings["fluorDelColEnd"];
    }
    var jumpStep = 1;
    if (window.modifySettings["fluorDelOtherCol"] > 0) {
         jumpStep = window.modifySettings["fluorDelOtherCol"] + 1 ;
    }
    var realColNr = 5;
    for (var c = minColNr ; c < maxColNr ; c += jumpStep) {
        realColNr++;
        var match = cycRowRe.exec(tab[fRow][c]);
        ftab[0][realColNr] = match[1];
    }
    // Well information
    // Insert columns and extract the fluorescence data
    var wellColRe = new RegExp(window.modifySettings["exWellRegEx"]);
    var wellCol = window.modifySettings["exWellCol"] - 1;
    for (var r = minRowNr ; r < maxRowNr ; r++) {
        var match = wellColRe.exec(tab[r][wellCol]);
        ftab[(r - minRowNr + 1)][0] = match[1];
    }




    window.resultTab = ftab;
    updateExport();
}

window.updateExport = updateExport;
function updateExport() {
    exportTableView.innerHTML = drawHtmlTable(window.resultTab)

}





$('#mainTab a').on('click', function(e) {
    e.preventDefault()
    $(this).tab('show')
})

function showExample() {
}

function showUpload() {
}

function errorMessage(err) {
    deleteContent();
    var html = '<div id="traceView-error" class="alert alert-danger" role="alert">';
    html += '  <i class="fas fa-fire"></i>';
    html += '  <span id="error-message">' + err;
    html += '  </span>';
    html += '</div>';
    var trTrc = document.getElementById('traceView-Traces');
    trTrc.innerHTML = html;
}
