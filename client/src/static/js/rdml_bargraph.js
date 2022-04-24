"use strict";

const API_URL = process.env.API_URL
const API_LINK = process.env.API_LINK

const submitButton = document.getElementById('btn-submit')
submitButton.addEventListener('click', loadInputFile)

const exampleButton = document.getElementById('btn-example')
exampleButton.addEventListener('click', showExample)

const compButton = document.getElementById('btn-apply-comp')
compButton.addEventListener('click', compResTable)

const saveDataButton = document.getElementById('btn-data-save')
saveDataButton.addEventListener('click', saveDataTable)

const saveMeanButton = document.getElementById('btn-mean-save')
saveMeanButton.addEventListener('click', saveMeanTable)

const inputFile = document.getElementById('inputFile')
const resultInfo = document.getElementById('result-info')
const resultError = document.getElementById('result-error')

const inputTableView = document.getElementById('import-table-view')
const tableDataPoints = document.getElementById('table-data-points')
const tableCombinedData = document.getElementById('table-combined-data')


const reshapeTableView = document.getElementById('reshape-table-view')
const exportTableView = document.getElementById('export-table-view')

const saveJsonButton = document.getElementById('btn-save-Json')
saveJsonButton.addEventListener('click', saveJsonFile)
const saveTabButton = document.getElementById('btn-save-Tsv')
saveTabButton.addEventListener('click', saveTabFile)
const createRdmlButton = document.getElementById('btn-save-RDML')
createRdmlButton.addEventListener('click', createServerRdml)
const loadJFile = document.getElementById('inputJsonFile')
loadJFile.addEventListener('change', loadJsonFile, false);


// Global data
window.inputFile = "";
window.inputFileName = "";
window.inputSeparator = "\t";
window.inputReplaceComma = true;
window.inputTabStr = "";
window.inputTabFix = [];

window.modifySettings = {};
window.resultTab = [];

window.setArr = {};

document.addEventListener("DOMContentLoaded", function() {
    var selEl = document.getElementById('selMachineSettings');
    window.setArr = getSettingsArr();
    for (var i = 0 ; i < window.setArr.length ; i++) {
        var option = document.createElement("option");
        option.text = window.setArr[i]["settingsID"];
        option.value = i;
        selEl.add(option);
    }
});

function showElement(element) {
    element.classList.remove('d-none')
}

function hideElement(element) {
    element.classList.add('d-none')
}

function getSaveHtmlData(key) {
    var el = document.getElementById(key)
    if (el) {
        return el.value
    } else {
        return ""
    }
}

function errorTxt(mess) {
    showElement(resultError)
    resultError.innerHTML = '<i class="fas fa-fire"></i>\n<span id="error-message">' + mess + '</span>'
}

function showExample() {
    window.inputFileName = "example"
    window.inputFile = getSampleStr();
    updateSepCount(window.inputFile);
}

window.loadInputFile = loadInputFile;
function loadInputFile(){
    var file = inputFile.files[0];
    if (file) { // && file.type.match("text/*")) {
        var reader = new FileReader();
        window.inputFileName = file.name.replace(/\.[^\.]+$/, '');
        reader.onload = function(event) {
            var txt = event.target.result;
            txt = txt.replace(/\r\n/g, "\n");
            txt = txt.replace(/\r/g, "\n");
            txt = txt.replace(/\n+/g, "\n");
            txt = txt.replace(/\n$/g, "");
            window.inputFile = txt;
            updateSepCount(window.inputFile);
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
    importTable();
}

window.updateSepManual = updateSepManual;
function updateSepManual(el) {
    if (el.value == "\\t") {
        window.inputSeparator = "\t";
    } else {
        window.inputSeparator = el.value;
    }
    importTable();
}

window.updateCommaManual = updateCommaManual;
function updateCommaManual() {
    window.inputReplaceComma = document.getElementById("modCommaDot").checked;
    importTable();
}

window.importTable = importTable;
function importTable() {
    processTable(window.inputFile, window.inputSeparator);
}

window.readHtmlRawData = readHtmlRawData;
function readHtmlRawData() {
    var dataIn = getSaveHtmlData("table-data-points")
    processTable(dataIn, "\t");
}

window.processTable = processTable;
function processTable(txtInput, inputSep) {
    var rawTab = txtInput.split("\n");
    window.inputTabFix = [];
    for (var i = 0 ; i < rawTab.length ; i++) {
        var rawLine = rawTab[i].split(inputSep)
        if (rawLine.length < 3) {
            continue;
        }
        var a_0 = rawLine[0].replace(/\t/, " ");
        var a_1 = rawLine[1].replace(/\t/, " ");
        for (var k = 2 ; k < rawLine.length ; k++ ){
            var rawVals = rawLine[k];
            if (rawLine[k] == "") {
                continue;
            }
            rawVals = rawVals.replace(/[^0-9\.,;]/g, "");
            rawVals = rawVals.replace(/^;/, "");
            rawVals = rawVals.replace(/;$/, "");
            if (window.inputReplaceComma) {
                rawVals = rawVals.replace(/,/, ".")
            } else {
                rawVals = rawVals.replace(/,/, "")
            }
            var rawList = []
            if (inputSep != ";") {
                rawList = rawVals.split(";");
            } else {
                rawList = [rawVals]
            }
            for (var l = 0 ; l < rawList.length ; l++ ){
                window.inputTabFix.push([a_0, a_1, rawList[l]]);
            }
        }
    }
    window.inputTabStr = "";
    for (var row = 0 ; row < window.inputTabFix.length ; row++) {
        for (var col = 0 ; col < window.inputTabFix[row].length ; col++) {
            window.inputTabStr += window.inputTabFix[row][col] + "\t";
        }
        window.inputTabStr = window.inputTabStr.replace(/\t$/, "\n");
    }
    tableDataPoints.innerHTML = window.inputTabStr;
    inputTableView.innerHTML = drawHtmlTable(window.inputTabFix, false);
    selectDataCombiMeth();
}

window.drawHtmlTable = drawHtmlTable;
function drawHtmlTable(tab, useColor) {
    var retVal = "<table class=\"tablePreview\">\n"
    retVal += "<tr>\n<th style=\"background-color: grey;\"></th>\n";
    var maxXCount = 0;
    var maxLength = tab.length;
    var cutOff = "";
    if (maxLength > 500) {
        maxLength = 500;
        cutOff = "Table was cut at 500 rows."
    }

    for (var i = 0 ; i < tab.length ; i++) {
        if (maxXCount < tab[i].length) {
            maxXCount = tab[i].length;
        }
    }
    for (var i = 0 ; i < maxXCount ; i++) {
         retVal += "<th style=\"background-color: grey;\">" + (i + 1) + "</th>\n"
    }
    retVal += "</tr>\n"
    for (var i = 0 ; i < maxLength ; i++) {
        retVal += "<tr>\n<td style=\"background-color: grey;\">" + (i + 1) + "</td>\n"
        var complete = true;
        if (useColor == true) {
            for (var k = 0 ; k < 6 ; k++) {
                if (tab[i][k] == "") {
                    complete = false;
                }
            }
        }
        for (var k = 0 ; k < tab[i].length ; k++) {
            if ((useColor == true) && (i != 0) && (complete == true)) {
                retVal += "<td style=\"background-color:#00e600;\">" + tab[i][k] + "</td>\n"
            } else {
                retVal += "<td>" + tab[i][k] + "</td>\n"
            }
        }
        retVal += "</tr>\n"
    }
    retVal += "</table>\n" + cutOff
    return retVal;
}

function getUniqueCol(tab, col){
    var collId = {};
    for (var row = 0 ; row < tab.length ; row++) {
        if ((tab[row].length > col) && (tab[row][col].length > 0)) {
            collId[tab[row][col]] = 1;
        }
    }
    var array_keys = new Array();
    for (var key in collId) {
       array_keys.push(key);
    }
    array_keys.sort();
    return array_keys;
}

window.selectDataCombiMeth = selectDataCombiMeth;
function selectDataCombiMeth(){
    var selMethod = document.getElementById('selDataCombiMeth').value;
    var selA = getUniqueCol(window.inputTabFix, 0)
    if (selA.length == 0) {
        alert("Data must have labels")
    }
    var selB = getUniqueCol(window.inputTabFix, 1)


    if (selMethod == "mean_sem") {
        //alert(getUniqueCol(window.inputTabFix, 0))
        //alert(getUniqueCol(window.inputTabFix, 1))
    }

    // tableCombinedData
}


































window.saveDataTable = saveDataTable;
function saveDataTable() {
    saveTabFile("Raw_Data.tsv", window.inputTabStr)
    return;
};

window.saveMeanTable = saveMeanTable;
function saveMeanTable() {
    saveTabFile("Mean_Data.tsv", window.inputTabStr)
    return;
};

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

window.saveTabFile = saveTabFile;
function saveTabFile(fileName, content) {
    if (content == "") {
        return;
    }
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style.display = "none";
    var blob = new Blob([content], {type: "text/tab-separated-values"});
    var browser = detectBrowser();
    if (browser != "edge") {
	    var url = window.URL.createObjectURL(blob);
	    a.href = url;
	    a.download = fileName;
	    a.click();
	    window.URL.revokeObjectURL(url);
    } else {
        window.navigator.msSaveBlob(blob, fileName);
    }
    return;
};



























// TODO client-side validation
function createServerRdml() {
    if (window.resultTab == []) {
        alert("Not sufficient data to create an RDML file.")
        return;
    }
    var content = "";
    for (var i = 0 ; i < window.resultTab.length ; i++) {
        for (var k = 0 ; k < window.resultTab[i].length ; k++) {
            content += window.resultTab[i][k] + "\t"
        }
        content = content.replace(/\t$/g, "\n");
    }

    const formData = new FormData()
    formData.append('createFromTableShaper', 'createFromTableShaper')
    formData.append('experimentID', getSaveHtmlData('inExperimentID'))
    formData.append('runID', getSaveHtmlData('inRunID'))
    formData.append('pcrFormat_columns', getSaveHtmlData('inRunPcrFormat_columns'))
    formData.append('pcrFormat_columnLabel', getSaveHtmlData('inRunPcrFormat_columnLabel'))
    formData.append('pcrFormat_rows', getSaveHtmlData('inRunPcrFormat_rows'))
    formData.append('pcrFormat_rowLabel', getSaveHtmlData('inRunPcrFormat_rowLabel'))
    formData.append('tableDataFormat', getSaveHtmlData('modReformatAmpMelt'))
    formData.append('tableData', content)

    var section = document.getElementById('download-section')
    section.innerHTML = ""

    hideElement(resultError)
    showElement(resultInfo)

    axios
        .post(`${API_URL}/data`, formData)
        .then(res => {
	        if (res.status === 200) {
                var uuid = res.data.data.uuid
                hideElement(resultInfo)

                if (res.data.data.hasOwnProperty("error")) {
                    showElement(resultError)
                    var err = '<i class="fas fa-fire"></i>\n<span id="error-message">'
                    err += res.data.data.error + '</span>'
                    resultError.innerHTML = err
                } else {
                    var ret = '<br /><p>Go to RDML-edit:<br />'
                    ret += '<a href="' + `${API_LINK}` + "edit.html?UUID=" + uuid + '" target="_blank" id="download-link">'
                    ret += `${API_LINK}` + "edit.html?UUID=" + uuid + '</a> (valid for 3 days)\n</p>\n'
                    section.innerHTML = ret

                    var elem = document.getElementById('download-link')
                    elem.click()

                    hideElement(resultError)
                }
            }
        })
        .catch(err => {
            let errorMessage = err
            if (err.response) {
                errorMessage = err.response.data.errors
               .map(error => error.title)
               .join('; ')
            }
            hideElement(resultInfo)
            showElement(resultError)
            var err = '<i class="fas fa-fire"></i>\n<span id="error-message">'
            err += errorMessage + '</span>'
            resultError.innerHTML = err
        })
}

window.selectMachineSettings = selectMachineSettings;
function selectMachineSettings(){
    var sel = document.getElementById('selMachineSettings').value;
    if (sel >= 0) {
        loadModification(window.setArr[sel]);
        updateModification();
    }
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
        window.navigator.msSaveBlob(blob, "TableShaper_settings.json");
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
    updateKeyEl(newSett,"reformatAmpMelt","modReformatAmpMelt");
    updateKeyEl(newSett,"reformatTableShape","modReformatTableShape");
    updateKeyEl(newSett,"fluorDelColStart","modDelColStart");
    updateKeyEl(newSett,"fluorDelRowStart","modDelRowStart");
    updateKeyEl(newSett,"fluorDelOtherRow","modDelOtherRow");
    updateKeyEl(newSett,"fluorDelColEnd","modDelColEnd");
    updateKeyEl(newSett,"fluorDelRowEnd","modDelRowEnd");
    updateKeyElCheck(newSett,"fluorCommaDot","modCommaDot");

    updateKeyEl(newSett,"exFluorCol","modExFluorCol");
    updateKeyEl(newSett,"exCycRow","modExCycRow");
    updateKeyEl(newSett,"exCycRowRegEx","modExCycRowRegEx");
    updateKeyEl(newSett,"exCycCol","modExCycCol");
    updateKeyEl(newSett,"exCycColRegEx","modExCycColRegEx");
    updateKeyEl(newSett,"exWellCol","modExWellCol");
    updateKeyEl(newSett,"exWellRegEx","modExWellRegEx");
    updateKeyEl(newSett,"exSamCol", "modExSamCol");
    updateKeyEl(newSett,"exSamRegEx", "modExSamRegEx");
    updateKeyEl(newSett,"exSamTypeCol", "modExSamTypeCol");
    updateKeyEl(newSett,"exSamTypeRegEx", "modExSamTypeRegEx");
    updateKeyEl(newSett,"exTarCol", "modExTarCol");
    updateKeyEl(newSett,"exTarRegEx", "modExTarRegEx");
    updateKeyEl(newSett,"exTarTypeCol", "modExTarTypeCol");
    updateKeyEl(newSett,"exTarTypeRegEx", "modExTarTypeRegEx");
    updateKeyEl(newSett,"exDyeCol", "modExDyeCol");
    updateKeyEl(newSett,"exDyeRegEx", "modExDyeRegEx");
    updateKeyEl(newSett,"exTrueCol", "modExTrueCol");
    updateKeyEl(newSett,"exTrueRegEx", "modExTrueRegEx");
}

window.updateModification = updateModification;
function updateModification() {
    window.modifySettings["settingsID"] = document.getElementById('modSetName').value;
    window.modifySettings["reformatAmpMelt"] = document.getElementById('modReformatAmpMelt').value;
    window.modifySettings["reformatTableShape"] = document.getElementById('modReformatTableShape').value;
    window.modifySettings["fluorDelColStart"] = parseInt(document.getElementById('modDelColStart').value);
    window.modifySettings["fluorDelRowStart"] = parseInt(document.getElementById('modDelRowStart').value);
    window.modifySettings["fluorDelOtherRow"] = parseInt(document.getElementById('modDelOtherRow').value);
    window.modifySettings["fluorDelColEnd"] = parseInt(document.getElementById('modDelColEnd').value);
    window.modifySettings["fluorDelRowEnd"] = parseInt(document.getElementById('modDelRowEnd').value);
    window.modifySettings["fluorCommaDot"] = document.getElementById("modCommaDot").checked;

    window.modifySettings["exFluorCol"] = parseInt(document.getElementById('modExFluorCol').value);
    window.modifySettings["exCycRow"] = parseInt(document.getElementById('modExCycRow').value);
    window.modifySettings["exCycRowRegEx"] = document.getElementById('modExCycRowRegEx').value;
    window.modifySettings["exCycCol"] = parseInt(document.getElementById('modExCycCol').value);
    window.modifySettings["exCycColRegEx"] = document.getElementById('modExCycColRegEx').value;
    window.modifySettings["exWellCol"] = parseInt(document.getElementById('modExWellCol').value);
    window.modifySettings["exWellRegEx"] = document.getElementById('modExWellRegEx').value;
    window.modifySettings["exSamCol"] = parseInt(document.getElementById('modExSamCol').value);
    window.modifySettings["exSamRegEx"] = document.getElementById('modExSamRegEx').value;
    window.modifySettings["exSamTypeCol"] = parseInt(document.getElementById('modExSamTypeCol').value);
    window.modifySettings["exSamTypeRegEx"] = document.getElementById('modExSamTypeRegEx').value;
    window.modifySettings["exTarCol"] = parseInt(document.getElementById('modExTarCol').value);
    window.modifySettings["exTarRegEx"] = document.getElementById('modExTarRegEx').value;
    window.modifySettings["exTarTypeCol"] = parseInt(document.getElementById('modExTarTypeCol').value);
    window.modifySettings["exTarTypeRegEx"] = document.getElementById('modExTarTypeRegEx').value;
    window.modifySettings["exDyeCol"] = parseInt(document.getElementById('modExDyeCol').value);
    window.modifySettings["exDyeRegEx"] = document.getElementById('modExDyeRegEx').value;
    window.modifySettings["exTrueCol"] = parseInt(document.getElementById('modExTrueCol').value);
    window.modifySettings["exTrueRegEx"] = document.getElementById('modExTrueRegEx').value;

    // Show the table or the list form elements
    var clElem = document.getElementsByClassName('table-list-only');
    var liElem = document.getElementsByClassName('table-table-only');
    if (window.modifySettings["reformatTableShape"] == "create") {
        for (var i = 0; i < clElem.length; i++) {
            clElem[i].style.display = "inline";
        }
        for (var i = 0; i < liElem.length; i++) {
            liElem[i].style.display = "none";
        }
    } else {
        for (var i = 0; i < clElem.length; i++) {
            clElem[i].style.display = "none";
        }
        for (var i = 0; i < liElem.length; i++) {
            liElem[i].style.display = "inline";
        }
    }

    var preTab = window.inputFile.split("\n");
    var tab = [];
    for (var i = 0 ; i < preTab.length ; i++) {
        tab.push(preTab[i].split(window.inputSeparator));
    }

    // Flip the table if required
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

    // Leave rows at the start or end out
    var minRowNr = 0;
    if (window.modifySettings["fluorDelRowStart"] > 0) {
         minRowNr = window.modifySettings["fluorDelRowStart"];
    }
    var maxRowNr = tab.length;
    if ((window.modifySettings["fluorDelRowEnd"] > 1) && (window.modifySettings["fluorDelRowEnd"] < tab.length)) {
         maxRowNr = window.modifySettings["fluorDelRowEnd"];
    }

    // Draw the reshaped table
    reshapeTableView.innerHTML = drawHtmlTable(tab, false)

    // Finally extract the information
    var ftab = [["Well", "Sample", "Sample Type", "Target", "Target Type", "Dye"]];

    var trueColRe = new RegExp(window.modifySettings["exTrueRegEx"]);
    var trueCol = window.modifySettings["exTrueCol"] - 1;

    if (window.modifySettings["reformatTableShape"] != "create") {
        // This is the regular table transformation
        // Insert columns and extract the fluorescence data
        var jumpStep = 1;
        if (window.modifySettings["fluorDelOtherRow"] > 0) {
            jumpStep = window.modifySettings["fluorDelOtherRow"] + 1 ;
        }
        // Fill the array used to exclude lines
        var exclFromTable = {}
        if (trueCol >= 0) {
            for (var r = minRowNr ; r < maxRowNr ; r += jumpStep) {
                if (trueColRe.test(tab[r][trueCol])) {
                    exclFromTable[r] = true;
                } else {
                    exclFromTable[r] = false;
                }
            }
        } else {
            exclFromTable[r] = false;
        }

        var realRowNr = 0;
        for (var r = minRowNr ; r < maxRowNr ; r += jumpStep) {
            if (exclFromTable[r]) {
                continue;
            }
            realRowNr++;
            ftab[realRowNr] = ["", "", "unkn", "", "toi", "unkn_dye"];
            var minColNr = 0;
            if (window.modifySettings["fluorDelColStart"] > 0) {
                 minColNr = window.modifySettings["fluorDelColStart"];
            }
            var maxColNr = tab[r].length;
            if ((window.modifySettings["fluorDelColEnd"] > 1) &&
                (window.modifySettings["fluorDelColEnd"] < tab[r].length)) {
                 maxColNr = window.modifySettings["fluorDelColEnd"];
            }
            var realColNr = 5;
            for (var c = minColNr ; c < maxColNr ; c++) {
                realColNr++;
                if (window.modifySettings["fluorCommaDot"] == true) {
                    if (tab[r][c].match(/,/) != null) {
                        var resVal = tab[r][c].replace(/\./g, "");;
                        ftab[realRowNr][realColNr] = resVal.replace(/,/g, ".");;
                    } else {
                        ftab[realRowNr][realColNr] = tab[r][c];
                    }
                } else {
                    ftab[realRowNr][realColNr] = tab[r][c];
                }
            }
        }
        // Insert extracted data
        // Cycle information from row
        if (window.modifySettings["exCycRow"] > 0) {
            var cycRowRe = new RegExp(window.modifySettings["exCycRowRegEx"]);
            var fRow = window.modifySettings["exCycRow"] - 1;
            var minColNr = 0;
            if (window.modifySettings["fluorDelColStart"] > 0) {
                 minColNr = window.modifySettings["fluorDelColStart"];
            }
            var maxColNr = tab[fRow].length;
            if ((window.modifySettings["fluorDelColEnd"] > 1) &&
                (window.modifySettings["fluorDelColEnd"] < tab[fRow].length)) {
                 maxColNr = window.modifySettings["fluorDelColEnd"];
            }
            var realColNr = 5;
            for (var c = minColNr ; c < maxColNr ; c++) {
                realColNr++;
                var fluorVal = "";
                if (cycRowRe.test(tab[fRow][c])) {
                    var match = cycRowRe.exec(tab[fRow][c]);
                    fluorVal = match[1];
                    if (window.modifySettings["fluorCommaDot"] == true) {
                        if (match[1].match(/,/) != null) {
                            var resVal = fluorVal.replace(/\./g, "");;
                            fluorVal = resVal.replace(/,/g, ".");
                        }
                    }
                    if (window.modifySettings["reformatAmpMelt"] == "amp") {
                        fluorVal = Math.ceil(parseFloat(fluorVal));
                    }
                }
                ftab[0][realColNr] = fluorVal;
            }
        }
        // Well information
        if (window.modifySettings["exWellCol"] > 0) {
            var wellColRe = new RegExp(window.modifySettings["exWellRegEx"]);
            var wellCol = window.modifySettings["exWellCol"] - 1;
            realRowNr = 0;
            for (var r = minRowNr ; r < maxRowNr ; r += jumpStep) {
                if (exclFromTable[r]) {
                    continue;
                }
                realRowNr++;
                if (wellColRe.test(tab[r][wellCol])) {
                    var match = wellColRe.exec(tab[r][wellCol]);
                    ftab[realRowNr][0] = match[1];
                } else {
                    ftab[realRowNr][0] = "";
                }
            }
        }
        // Sample information
        if (window.modifySettings["exSamCol"] > 0) {
            var samColRe = new RegExp(window.modifySettings["exSamRegEx"]);
            var samCol = window.modifySettings["exSamCol"] - 1;
            realRowNr = 0;
            for (var r = minRowNr ; r < maxRowNr ; r += jumpStep) {
                if (exclFromTable[r]) {
                    continue;
                }
                realRowNr++;
                if (samColRe.test(tab[r][samCol])) {
                    var match = samColRe.exec(tab[r][samCol]);
                    ftab[realRowNr][1] = match[1];
                } else {
                    ftab[realRowNr][1] = "";
                }
            }
        }
        // Sample Type information
        if (window.modifySettings["exSamTypeCol"] > 0) {
            var samTypeColRe = new RegExp(window.modifySettings["exSamTypeRegEx"]);
            var samTypeCol = window.modifySettings["exSamTypeCol"] - 1;
            realRowNr = 0;
            for (var r = minRowNr ; r < maxRowNr ; r += jumpStep) {
                if (exclFromTable[r]) {
                    continue;
                }
                realRowNr++;
                if (samTypeColRe.test(tab[r][samTypeCol])) {
                    var match = samTypeColRe.exec(tab[r][samTypeCol]);
                    ftab[realRowNr][2] = match[1];
                } else {
                    ftab[realRowNr][2] = "";
                }
            }
        }

        // Target information
        if (window.modifySettings["exTarCol"] > 0) {
            var tarColRe = new RegExp(window.modifySettings["exTarRegEx"]);
            var tarCol = window.modifySettings["exTarCol"] - 1;
            realRowNr = 0;
            for (var r = minRowNr ; r < maxRowNr ; r += jumpStep) {
                if (exclFromTable[r]) {
                    continue;
                }
                realRowNr++;
                if (tarColRe.test(tab[r][tarCol])) {
                    var match = tarColRe.exec(tab[r][tarCol]);
                    ftab[realRowNr][3] = match[1];
                } else {
                    ftab[realRowNr][3] = "";
                }
            }
        }
        // Target Type information
        if (window.modifySettings["exTarTypeCol"] > 0) {
            var tarTypeColRe = new RegExp(window.modifySettings["exTarTypeRegEx"]);
            var tarTypeCol = window.modifySettings["exTarTypeCol"] - 1;
            realRowNr = 0;
            for (var r = minRowNr ; r < maxRowNr ; r += jumpStep) {
                if (exclFromTable[r]) {
                    continue;
                }
                realRowNr++;
                if (tarTypeColRe.test(tab[r][tarTypeCol])) {
                    var match = tarTypeColRe.exec(tab[r][tarTypeCol]);
                    ftab[realRowNr][4] = match[1];
                } else {
                    ftab[realRowNr][4] = "";
                }
            }
        }
        // Dye information
        if (window.modifySettings["exDyeCol"] > 0) {
            var dyeColRe = new RegExp(window.modifySettings["exDyeRegEx"]);
            var dyeCol = window.modifySettings["exDyeCol"] - 1;
            realRowNr = 0;
            for (var r = minRowNr ; r < maxRowNr ; r += jumpStep) {
                if (exclFromTable[r]) {
                    continue;
                }
                realRowNr++;
                if (dyeColRe.test(tab[r][dyeCol])) {
                    var match = dyeColRe.exec(tab[r][dyeCol]);
                    ftab[realRowNr][5] = match[1];
                } else {
                    ftab[realRowNr][5] = "";
                }
            }
        }
    } else {
        // This is a one row is one fluorescence data (the create) version
        var cycCount = 0;
        var wellCount = 0;
        var cycLookUp = {};
        var wellLookUp = {};
        var cycColRe = new RegExp(window.modifySettings["exCycColRegEx"]);
        var cycCol = window.modifySettings["exCycCol"] - 1;
        var wellColRe = new RegExp(window.modifySettings["exWellRegEx"]);
        var wellCol = window.modifySettings["exWellCol"] - 1;
        var fluorCol = window.modifySettings["exFluorCol"] - 1;
        var samColRe = new RegExp(window.modifySettings["exSamRegEx"]);
        var samTypeColRe = new RegExp(window.modifySettings["exSamTypeRegEx"]);
        var samTypeCol = window.modifySettings["exSamTypeCol"] - 1;
        var tarColRe = new RegExp(window.modifySettings["exTarRegEx"]);
        var tarTypeColRe = new RegExp(window.modifySettings["exTarTypeRegEx"]);
        var dyeColRe = new RegExp(window.modifySettings["exDyeRegEx"]);
        for (var r = minRowNr ; r < maxRowNr ; r++) {
            if (trueColRe.test(tab[r][trueCol])) {
                continue;
            }
            var matchCyc = cycColRe.exec(tab[r][cycCol]);
            var cycVal = matchCyc[1];
            var matchWell = wellColRe.exec(tab[r][wellCol]);
            var wellVal = matchWell[1];
            if (cycLookUp.hasOwnProperty(cycVal) != true) {
                cycLookUp[cycVal] = cycCount + 6;
                var cycWriteVal = cycVal;
                if (window.modifySettings["reformatAmpMelt"] == "amp") {
                    cycWriteVal = Math.ceil(parseFloat(cycWriteVal));
                }
                ftab[0][cycLookUp[cycVal]] = cycWriteVal;
                cycCount++;
            }
            if (wellLookUp.hasOwnProperty(wellVal) != true) {
                wellLookUp[wellVal] = wellCount + 1;
                ftab[wellLookUp[wellVal]] = [wellVal, "", "unkn", "", "toi", "unkn_dye"];
                wellCount++;
            }
            // Sample information
            if (window.modifySettings["exSamCol"] > 0) {
                var samCol = window.modifySettings["exSamCol"] - 1;
                var match = samColRe.exec(tab[r][samCol]);
                ftab[wellLookUp[wellVal]][1] = match[1];
            }
            // Sample Type information
            if (window.modifySettings["exSamTypeCol"] > 0) {
                var samTypeCol = window.modifySettings["exSamTypeCol"] - 1;
                var match = samTypeColRe.exec(tab[r][samTypeCol]);
                ftab[wellLookUp[wellVal]][2] = match[1];
            }

            // Target information
            if (window.modifySettings["exTarCol"] > 0) {
                var tarCol = window.modifySettings["exTarCol"] - 1;
                var match = tarColRe.exec(tab[r][tarCol]);
                ftab[wellLookUp[wellVal]][3] = match[1];
            }
            // Target Type information
            if (window.modifySettings["exTarTypeCol"] > 0) {
                var tarTypeCol = window.modifySettings["exTarTypeCol"] - 1;
                var match = tarTypeColRe.exec(tab[r][tarTypeCol]);
                ftab[wellLookUp[wellVal]][4] = match[1];
            }
            // Dye information
            if (window.modifySettings["exDyeCol"] > 0) {
                var dyeCol = window.modifySettings["exDyeCol"] - 1;
                var match = dyeColRe.exec(tab[r][dyeCol]);
                ftab[wellLookUp[wellVal]][5] = match[1];
            }
            // Fluorescence values
            var fluorVal = tab[r][fluorCol];
            if (window.modifySettings["fluorCommaDot"] == true) {
                if (tab[r][fluorCol].match(/,/) != null) {
                    var resVal = tab[r][fluorCol].replace(/\./g, "");
                    fluorVal = resVal.replace(/,/g, ".");;
                }
            }
            ftab[wellLookUp[wellVal]][cycLookUp[cycVal]] = fluorVal;
        }
    }

    // Remove empty rows
    var wordChar = /\w/;
    for (var r = ftab.length - 1 ; r > 0 ; r--) {
        var rowCount = false;
        // It has to have fluorescence data
        for (var c = 6 ; c < ftab[r].length ; c++) {
            if (wordChar.test(ftab[r][c])) {
                rowCount = true;
            }
        }
        if (rowCount == false) {
            ftab.splice(r,1);
        }
    }

    // Remove empty colums
    var maxCol = 0;
    for (var r = 0 ; r < ftab.length ; r++) {
        if (maxCol < ftab[r].length) {
            maxCol = ftab[r].length;
        }
    }
    for (var c = maxCol - 1 ; c >= 0 ; c--) {
        var colCount = false;
        for (var r = 0 ; r < ftab.length ; r++) {
            if ((c < ftab[r].length) && (wordChar.test(ftab[r][c]))) {
                colCount = true;
            }
        }
        if (colCount == false) {
            for (var r = 0 ; r < ftab.length ; r++) {
                if (c < ftab[r].length) {
                    ftab[r].splice(c,1);
                }
            }
        }
    }

    window.resultTab = ftab;
    updateExport();
}

window.selCompSelection = selCompSelection;
function selCompSelection() {
    var modSel = document.getElementById('inCompSelection').value;
    if ((modSel != "2") && (modSel != "4")) {
        document.getElementById('idCompText').style.display = "inline";
        document.getElementById('idCompSamType').style.display = "none";
        document.getElementById('idCompTarType').style.display = "none";
    } else {
        document.getElementById('idCompText').style.display = "none";
        if (modSel == "2") {
            document.getElementById('idCompSamType').style.display = "inline";
            document.getElementById('idCompTarType').style.display = "none";
        }
        if (modSel == "4") {
            document.getElementById('idCompSamType').style.display = "none";
            document.getElementById('idCompTarType').style.display = "inline";
        }
    }
}

window.compResTable = compResTable;
function compResTable() {
    var modSel = document.getElementById('inCompSelection').value;
    var startAll = document.getElementById('inCompStart').value;
    var endAll = document.getElementById('inCompEnd').value;
    var letterNumberRe = /([A-Za-z])([0-9]+)/;
    var onlyNumberRe = /([0-9]+)/;
    var startLetter = null;
    var startNumber = null;
    var endLetter = null;
    var endNumber = null;
    if (letterNumberRe.test(startAll)) {
        var match = letterNumberRe.exec(startAll);
        startLetter = match[1];
        startNumber = parseInt(match[2]);
    } else if (onlyNumberRe.test(startAll)) {
        var match = onlyNumberRe.exec(startAll);
        startNumber = parseInt(match[1]);
    }
    if (letterNumberRe.test(endAll)) {
        var match = letterNumberRe.exec(endAll);
        endLetter = match[1];
        endNumber = parseInt(match[2]);
    } else if (onlyNumberRe.test(endAll)) {
        var match = onlyNumberRe.exec(endAll);
        endNumber = parseInt(match[1]);
    } else {
        // Only the one element at start
        if ((startNumber != null) || (startLetter != null)) {
        endLetter = startLetter;
        endNumber = startNumber;
        }
    }

    for (var r = 1 ; r < window.resultTab.length ; r++) {
        var repText = document.getElementById('inCompText').value;
        if (modSel == "2") {
            repText = document.getElementById('inCompSamType').value;
        }
        if (modSel == "4") {
            repText = document.getElementById('inCompTarType').value;
        }
        var well = window.resultTab[r][0];
        var wellLetter = null;
        var wellNumber = null;
        if (letterNumberRe.test(well)) {
            var match = letterNumberRe.exec(well);
            wellLetter = match[1];
            wellNumber = parseInt(match[2]);
        } else if (onlyNumberRe.test(well)) {
            var match = onlyNumberRe.exec(well);
            wellNumber = parseInt(match[1]);
        }
        if (((startLetter == null) && (startNumber == null) && (endLetter == null) && (endNumber == null)) ||
            ((wellLetter == null) && (wellNumber >= startNumber) && (wellNumber <= endNumber)) ||
            ((wellLetter.charCodeAt(0) >= startLetter.charCodeAt(0)) &&
             (wellLetter.charCodeAt(0) <= endLetter.charCodeAt(0)) &&
             (wellNumber >= startNumber) &&
             (wellNumber <= endNumber))) {
            if ((repText == "") && (modSel == "1")) {
                repText = "Sample " + r;
            }
            if ((repText == "") && (modSel == "3")) {
                repText = "Target " + r;
            }
            window.resultTab[r][modSel] = repText;
        }
    }

    updateExport();
}

window.updateExport = updateExport;
function updateExport() {
    exportTableView.innerHTML = drawHtmlTable(window.resultTab, true)

}

// Select Rotor
window.selPlate_Rotor = selPlate_Rotor;
function selPlate_Rotor(){
    var col = document.getElementById('inRunPcrFormat_columns');
    col.value = "1"
    var colLab = document.getElementById('inRunPcrFormat_columnLabel');
    colLab.value = "123"
    var row = document.getElementById('inRunPcrFormat_rows');
    row.value = "Enter maximal number of rotor positions here."
    var rowLab = document.getElementById('inRunPcrFormat_rowLabel');
    rowLab.value = "123"
    return;
}

// Select 96 Well Plate
window.selPlate_96_Well = selPlate_96_Well;
function selPlate_96_Well(){
    var col = document.getElementById('inRunPcrFormat_columns');
    col.value = "12"
    var colLab = document.getElementById('inRunPcrFormat_columnLabel');
    colLab.value = "123"
    var row = document.getElementById('inRunPcrFormat_rows');
    row.value = "8"
    var rowLab = document.getElementById('inRunPcrFormat_rowLabel');
    rowLab.value = "ABC"
    return;
}

// Select 384 Well Plate
window.selPlate_384_Well = selPlate_384_Well;
function selPlate_384_Well(){
    var col = document.getElementById('inRunPcrFormat_columns');
    col.value = "24"
    var colLab = document.getElementById('inRunPcrFormat_columnLabel');
    colLab.value = "123"
    var row = document.getElementById('inRunPcrFormat_rows');
    row.value = "16"
    var rowLab = document.getElementById('inRunPcrFormat_rowLabel');
    rowLab.value = "ABC"
    return;
}

$('#mainTab a').on('click', function(e) {
    e.preventDefault()
    $(this).tab('show')
})

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

function getSettingsArr() {
    var ret = [{
               "settingsID":"RDML Import Format",
               "reformatAmpMelt":"melt",
               "reformatTableShape":"keep",
               "fluorDelColStart":6,
               "fluorDelRowStart":1,
               "fluorDelOtherRow":0,
               "fluorDelColEnd":null,
               "fluorDelRowEnd":null,
               "fluorCommaDot":true,
               "exFluorCol":4,
               "exCycRow":1,
               "exCycRowRegEx":"(.*)",
               "exCycCol":1,
               "exCycColRegEx":"([0-9]+)",
               "exWellCol":1,
               "exWellRegEx":"(.*)",
               "exSamCol":2,
               "exSamRegEx":"(.*)",
               "exSamTypeCol":3,
               "exSamTypeRegEx":"(.*)",
               "exTarCol":4,
               "exTarRegEx":"(.*)",
               "exTarTypeCol":5,
               "exTarTypeRegEx":"(.*)",
               "exDyeCol":6,
               "exDyeRegEx":"(.*)",
               "exTrueCol":-1,
               "exTrueRegEx":"2"
               },{
               "settingsID":"Applied Biosystems SDS v2.4",
               "reformatAmpMelt":"amp",
               "reformatTableShape":"keep",
               "fluorDelColStart":3,
               "fluorDelRowStart":2,
               "fluorDelOtherRow":0,
               "fluorDelColEnd":null,
               "fluorDelRowEnd":null,
               "fluorCommaDot":true,
               "exFluorCol":4,
               "exCycRow":2,
               "exCycRowRegEx":"([0-9]+)",
               "exCycCol":1,
               "exCycColRegEx":"([0-9]+)",
               "exWellCol":1,
               "exWellRegEx":"([0-9]+)",
               "exSamCol":2,
               "exSamRegEx":"(.*) .+",
               "exSamTypeCol":null,
               "exSamTypeRegEx":"(.*)",
               "exTarCol":null,
               "exTarRegEx":"(.*)",
               "exTarTypeCol":null,
               "exTarTypeRegEx":"(.*)",
               "exDyeCol":2,
               "exDyeRegEx":".+ (.*)",
               "exTrueCol":-1,
               "exTrueRegEx":"2"
               },{
               "settingsID":"Applied Biosystems v9.24",
               "reformatAmpMelt":"amp",
               "reformatTableShape":"keep",
               "fluorDelColStart":2,
               "fluorDelRowStart":1,
               "fluorDelOtherRow":0,
               "fluorDelColEnd":null,
               "fluorDelRowEnd":null,
               "fluorCommaDot":true,
               "exFluorCol":4,
               "exCycRow":1,
               "exCycRowRegEx":"([0-9]+)",
               "exCycCol":1,
               "exCycColRegEx":"([0-9]+)",
               "exWellCol":1,
               "exWellRegEx":"([0-9]+)",
               "exSamCol":2,
               "exSamRegEx":"(.*)",
               "exSamTypeCol":null,
               "exSamTypeRegEx":"(.*)",
               "exTarCol":null,
               "exTarRegEx":"(.*)",
               "exTarTypeCol":null,
               "exTarTypeRegEx":"(.*)",
               "exDyeCol":null,
               "exDyeRegEx":"(.*)",
               "exTrueCol":-1,
               "exTrueRegEx":"2"
               },{
               "settingsID":"BioRad CFX v3.1",
               "reformatAmpMelt":"amp",
               "reformatTableShape":"flip",
               "fluorDelColStart":1,
               "fluorDelRowStart":2,
               "fluorDelOtherRow":0,
               "fluorDelColEnd":null,
               "fluorDelRowEnd":null,
               "fluorCommaDot":true,
               "exFluorCol":4,
               "exCycRow":2,
               "exCycRowRegEx":"([0-9]+)",
               "exCycCol":1,
               "exCycColRegEx":"([0-9]+)",
               "exWellCol":1,
               "exWellRegEx":"(^[A-Za-z]+[0-9]+)",
               "exSamCol":null,"exSamRegEx":"(.*)",
               "exSamTypeCol":null,
               "exSamTypeRegEx":"(.*)",
               "exTarCol":null,
               "exTarRegEx":"(.*)",
               "exTarTypeCol":null,
               "exTarTypeRegEx":"(.*)",
               "exDyeCol":null,
               "exDyeRegEx":"(.*)",
               "exTrueCol":-1,
               "exTrueRegEx":"2"
               },{
               "settingsID":"BioRad iCycler v9.35",
               "reformatAmpMelt":"amp",
               "reformatTableShape":"flip",
               "fluorDelColStart":2,
               "fluorDelRowStart":1,
               "fluorDelOtherRow":0,
               "fluorDelColEnd":null,
               "fluorDelRowEnd":null,
               "fluorCommaDot":true,
               "exFluorCol":4,
               "exCycRow":1,
               "exCycRowRegEx":"(.+)",
               "exCycCol":1,
               "exCycColRegEx":"([0-9]+)",
               "exWellCol":2,
               "exWellRegEx":"(^[A-Za-z]+[0-9]+).*",
               "exSamCol":null,
               "exSamRegEx":"^[A-Za-z]+[0-9]+ (.*)",
               "exSamTypeCol":null,
               "exSamTypeRegEx":"(.*)",
               "exTarCol":2,
               "exTarRegEx":"^[A-Za-z]+[0-9]+ (.*)",
               "exTarTypeCol":null,
               "exTarTypeRegEx":"(.*)",
               "exDyeCol":null,
               "exDyeRegEx":"(.*)",
               "exTrueCol":-1,
               "exTrueRegEx":"2"
               },{
               "settingsID":"Eppendorf Realplex",
               "reformatAmpMelt":"amp",
               "reformatTableShape":"keep",
               "fluorDelColStart":6,
               "fluorDelRowStart":4,
               "fluorDelOtherRow":0,
               "fluorDelColEnd":null,
               "fluorDelRowEnd":49,
               "fluorCommaDot":true,
               "exFluorCol":4,
               "exCycRow":4,
               "exCycRowRegEx":"([0-9]+)",
               "exCycCol":1,
               "exCycColRegEx":"([0-9]+)",
               "exWellCol":1,
               "exWellRegEx":"(^[A-Za-z]+[0-9]+)",
               "exSamCol":3,
               "exSamRegEx":"(.*)",
               "exSamTypeCol":null,
               "exSamTypeRegEx":"(.*)",
               "exTarCol":5,
               "exTarRegEx":"(.*)",
               "exTarTypeCol":null,
               "exTarTypeRegEx":"(.*)",
               "exDyeCol":6,
               "exDyeRegEx":"(.*)",
               "exTrueCol":-1,
               "exTrueRegEx":"2"
               },{
               "settingsID":"Illumina Eco v3.0",
               "reformatAmpMelt":"amp",
               "reformatTableShape":"keep",
               "fluorDelColStart":3,
               "fluorDelRowStart":9,
               "fluorDelOtherRow":0,
               "fluorDelColEnd":null,
               "fluorDelRowEnd":null,
               "fluorCommaDot":true,
               "exFluorCol":4,
               "exCycRow":9,
               "exCycRowRegEx":"([0-9]+)",
               "exCycCol":1,
               "exCycColRegEx":"([0-9]+)",
               "exWellCol":1,
               "exWellRegEx":"(^[A-Za-z]+[0-9]+)",
               "exSamCol":null,
               "exSamRegEx":"(.*)",
               "exSamTypeCol":null,
               "exSamTypeRegEx":"(.*)",
               "exTarCol":null,
               "exTarRegEx":"(.*)",
               "exTarTypeCol":null,
               "exTarTypeRegEx":"(.*)",
               "exDyeCol":3,
               "exDyeRegEx":"(.*)",
               "exTrueCol":-1,
               "exTrueRegEx":"2"
               },{
               "settingsID":"Mic v2.7",
               "reformatAmpMelt":"amp",
               "reformatTableShape":"flip",
               "fluorDelColStart":1,
               "fluorDelRowStart":1,
               "fluorDelOtherRow":0,
               "fluorDelColEnd":null,
               "fluorDelRowEnd":null,
               "fluorCommaDot":true,
               "exFluorCol":4,
               "exCycRow":1,
               "exCycRowRegEx":"([0-9]+)",
               "exCycCol":1,
               "exCycColRegEx":"([0-9]+)",
               "exWellCol":1,
               "exWellRegEx":"(^[0-9]+)",
               "exSamCol":null,
               "exSamRegEx":"(.*)",
               "exSamTypeCol":null,
               "exSamTypeRegEx":"(.*)",
               "exTarCol":null,
               "exTarRegEx":"(.*)",
               "exTarTypeCol":null,
               "exTarTypeRegEx":"(.*)",
               "exDyeCol":null,
               "exDyeRegEx":"(.*)",
               "exTrueCol":-1,
               "exTrueRegEx":"2"
               },{
               "settingsID":"MJ research",
               "reformatAmpMelt":"amp",
               "reformatTableShape":"flip",
               "fluorDelColStart":1,
               "fluorDelRowStart":3,
               "fluorDelOtherRow":0,
               "fluorDelColEnd":41,
               "fluorDelRowEnd":null,
               "fluorCommaDot":false,
               "exFluorCol":4,
               "exCycRow":2,
               "exCycRowRegEx":"([0-9]+)",
               "exCycCol":1,
               "exCycColRegEx":"([0-9]+)",
               "exWellCol":1,
               "exWellRegEx":"(^[A-Za-z]+[0-9]+)",
               "exSamCol":null,
               "exSamRegEx":"(.*)",
               "exSamTypeCol":null,
               "exSamTypeRegEx":"(.*)",
               "exTarCol":null,
               "exTarRegEx":"(.*)",
               "exTarTypeCol":null,
               "exTarTypeRegEx":"(.*)",
               "exDyeCol":null,
               "exDyeRegEx":"(.*)",
               "exTrueCol":-1,
               "exTrueRegEx":"2"
               },{
               "settingsID":"QuantStudio 12K Flex",
               "reformatAmpMelt":"amp",
               "reformatTableShape":"create",
               "fluorDelColStart":1,
               "fluorDelRowStart":18,
               "fluorDelOtherRow":0,
               "fluorDelColEnd":null,
               "fluorDelRowEnd":null,
               "fluorCommaDot":true,
               "exFluorCol":4,
               "exCycRow":1,
               "exCycRowRegEx":"([0-9]+)",
               "exCycCol":3,
               "exCycColRegEx":"([0-9]+)",
               "exWellCol":2,
               "exWellRegEx":"(^[A-Za-z]+[0-9]+[A-Za-z]+[0-9]+)",
               "exSamCol":null,
               "exSamRegEx":"(.*)",
               "exSamTypeCol":null,
               "exSamTypeRegEx":"(.*)",
               "exTarCol":null,"exTarRegEx":"(.*)",
               "exTarTypeCol":null,
               "exTarTypeRegEx":"(.*)",
               "exDyeCol":null,
               "exDyeRegEx":"(.*)",
               "exTrueCol":-1,
               "exTrueRegEx":"2"
               },{
               "settingsID":"Roche LC96",
               "reformatAmpMelt":"amp",
               "reformatTableShape":"keep",
               "fluorDelColStart":1,
               "fluorDelRowStart":1,
               "fluorDelOtherRow":0,
               "fluorDelColEnd":null,
               "fluorDelRowEnd":null,
               "fluorCommaDot":true,
               "exFluorCol":4,
               "exCycRow":1,
               "exCycRowRegEx":"([0-9]+)",
               "exCycCol":1,
               "exCycColRegEx":"([0-9]+)",
               "exWellCol":1,
               "exWellRegEx":"(^[A-Za-z]+[0-9]+)",
               "exSamCol":null,"exSamRegEx":"(.*)",
               "exSamTypeCol":null,
               "exSamTypeRegEx":"(.*)",
               "exTarCol":null,
               "exTarRegEx":"(.*)",
               "exTarTypeCol":null,
               "exTarTypeRegEx":"(.*)",
               "exDyeCol":1,
               "exDyeRegEx":"^[A-Za-z]+[0-9]+ (.*)",
               "exTrueCol":-1,
               "exTrueRegEx":"2"
               },{
               "settingsID":"Roche LC96 (flip)",
               "reformatAmpMelt":"amp",
               "reformatTableShape":"flip",
               "fluorDelColStart":1,
               "fluorDelRowStart":1,
               "fluorDelOtherRow":0,
               "fluorDelColEnd":null,
               "fluorDelRowEnd":null,
               "fluorCommaDot":true,
               "exFluorCol":4,
               "exCycRow":1,
               "exCycRowRegEx":"([0-9]+)",
               "exCycCol":1,
               "exCycColRegEx":"([0-9]+)",
               "exWellCol":1,
               "exWellRegEx":"(^[A-Za-z]+[0-9]+) .*",
               "exSamCol":null,
               "exSamRegEx":"(.*)",
               "exSamTypeCol":null,
               "exSamTypeRegEx":"(.*)",
               "exTarCol":null,
               "exTarRegEx":"(.*)",
               "exTarTypeCol":null,
               "exTarTypeRegEx":"(.*)",
               "exDyeCol":1,
               "exDyeRegEx":"^[A-Za-z]+[0-9]+ (.*)",
               "exTrueCol":-1,
               "exTrueRegEx":"2"
               },{
               "settingsID":"Roche LightCycler480",
               "reformatAmpMelt":"amp",
               "reformatTableShape":"keep",
               "fluorDelColStart":2,
               "fluorDelRowStart":1,
               "fluorDelOtherRow":0,
               "fluorDelColEnd":null,
               "fluorDelRowEnd":null,
               "fluorCommaDot":true,
               "exFluorCol":4,
               "exCycRow":1,
               "exCycRowRegEx":"([0-9]+)",
               "exCycCol":1,
               "exCycColRegEx":"([0-9]+)",
               "exWellCol":1,
               "exWellRegEx":"(^[A-Za-z]+[0-9]+)",
               "exSamCol":2,
               "exSamRegEx":"(.*)",
               "exSamTypeCol":null,
               "exSamTypeRegEx":"(.*)",
               "exTarCol":null,
               "exTarRegEx":"(.*)",
               "exTarTypeCol":null,
               "exTarTypeRegEx":"(.*)",
               "exDyeCol":null,
               "exDyeRegEx":"(.*)",
               "exTrueCol":-1,
               "exTrueRegEx":"2"
               },{
               "settingsID":"Roche LightCycler480 (flip)",
               "reformatAmpMelt":"amp",
               "reformatTableShape":"flip",
               "fluorDelColStart":1,
               "fluorDelRowStart":2,
               "fluorDelOtherRow":1,
               "fluorDelColEnd":null,
               "fluorDelRowEnd":null,
               "fluorCommaDot":true,
               "exFluorCol":4,
               "exCycRow":1,
               "exCycRowRegEx":"([0-9]+)",
               "exCycCol":1,
               "exCycColRegEx":"([0-9]+)",
               "exWellCol":1,
               "exWellRegEx":"(^[A-Za-z]+[0-9]+):.*",
               "exSamCol":1,
               "exSamRegEx":"^[A-Za-z]+[0-9]+: (.*)",
               "exSamTypeCol":null,
               "exSamTypeRegEx":"(.*)",
               "exTarCol":null,"exTarRegEx":"(.*)",
               "exTarTypeCol":null,
               "exTarTypeRegEx":"(.*)",
               "exDyeCol":null,
               "exDyeRegEx":"(.*)",
               "exTrueCol":-1,
               "exTrueRegEx":"2"
               },{
               "settingsID":"Roche LightCycler480 (create)",
               "reformatAmpMelt":"amp",
               "reformatTableShape":"create",
               "fluorDelColStart":1,
               "fluorDelRowStart":2,
               "fluorDelOtherRow":0,
               "fluorDelColEnd":null,
               "fluorDelRowEnd":null,
               "fluorCommaDot":true,
               "exFluorCol":8,
               "exCycRow":1,
               "exCycRowRegEx":"([0-9]+)",
               "exCycCol":5,
               "exCycColRegEx":"([0-9]+)",
               "exWellCol":1,
               "exWellRegEx":"(^[A-Za-z]+[0-9]+)",
               "exSamCol":2,
               "exSamRegEx":"(.*)",
               "exSamTypeCol":null,
               "exSamTypeRegEx":"(.*)",
               "exTarCol":null,
               "exTarRegEx":"(.*)",
               "exTarTypeCol":null,
               "exTarTypeRegEx":"(.*)",
               "exDyeCol":null,
               "exDyeRegEx":"(.*)",
               "exTrueCol":-1,
               "exTrueRegEx":"2"
               },{
               "settingsID":"Rotorgene",
               "reformatAmpMelt":"amp",
               "reformatTableShape":"keep",
               "fluorDelColStart":6,
               "fluorDelRowStart":4,
               "fluorDelOtherRow":0,
               "fluorDelColEnd":46,
               "fluorDelRowEnd":68,
               "fluorCommaDot":true,
               "exFluorCol":4,
               "exCycRow":4,
               "exCycRowRegEx":"([0-9]+)",
               "exCycCol":1,
               "exCycColRegEx":"([0-9]+)",
               "exWellCol":1,
               "exWellRegEx":"(^[A-Za-z]+[0-9]+)",
               "exSamCol":3,
               "exSamRegEx":"(.*)",
               "exSamTypeCol":2,
               "exSamTypeRegEx":"(.*)",
               "exTarCol":5,
               "exTarRegEx":"(.*)",
               "exTarTypeCol":null,
               "exTarTypeRegEx":"(.*)",
               "exDyeCol":6,
               "exDyeRegEx":"(.*)",
               "exTrueCol":-1,
               "exTrueRegEx":"2"
               },{
               "settingsID":"Stratagene Mx3000P",
               "reformatAmpMelt":"amp",
               "reformatTableShape":"flip",
               "fluorDelColStart":4,
               "fluorDelRowStart":2,
               "fluorDelOtherRow":0,
               "fluorDelColEnd":44,
               "fluorDelRowEnd":null,
               "fluorCommaDot":true,
               "exFluorCol":4,
               "exCycRow":2,
               "exCycRowRegEx":"([0-9]+)",
               "exCycCol":1,
               "exCycColRegEx":"([0-9]+)",
               "exWellCol":3,
               "exWellRegEx":"(^[A-Za-z]+[0-9]+),.*",
               "exSamCol":3,
               "exSamRegEx":"[^,]*, ([^,]*,[^,]*),.*",
               "exSamTypeCol":null,
               "exSamTypeRegEx":"(.*)",
               "exTarCol":null,
               "exTarRegEx":"(.*)",
               "exTarTypeCol":null,
               "exTarTypeRegEx":"(.*)",
               "exDyeCol":3,
               "exDyeRegEx":"[^,]*,[^,]*,[^,]*, (.*)",
               "exTrueCol":-1,
               "exTrueRegEx":"2"
               },{
               "settingsID":"ThermoFisher StepOnePlus",
               "reformatAmpMelt":"amp",
               "reformatTableShape":"create",
               "fluorDelColStart":1,
               "fluorDelRowStart":8,
               "fluorDelOtherRow":0,
               "fluorDelColEnd":null,
               "fluorDelRowEnd":null,
               "fluorCommaDot":true,
               "exFluorCol":3,
               "exCycRow":1,
               "exCycRowRegEx":"([0-9]+)",
               "exCycCol":2,
               "exCycColRegEx":"([0-9]+)",
               "exWellCol":1,
               "exWellRegEx":"(^[A-Za-z]+[0-9]+)",
               "exSamCol":null,
               "exSamRegEx":"(.*)",
               "exSamTypeCol":null,
               "exSamTypeRegEx":"(.*)",
               "exTarCol":null,
               "exTarRegEx":"(.*)",
               "exTarTypeCol":null,
               "exTarTypeRegEx":"(.*)",
               "exDyeCol":null,
               "exDyeRegEx":"(.*)",
               "exTrueCol":-1,
               "exTrueRegEx":"2"
               },{
               "settingsID":"Roche LCS480 Amplification v1.5.0.39",
               "reformatAmpMelt":"amp",
               "reformatTableShape":"create",
               "fluorDelColStart":1,
               "fluorDelRowStart":2,
               "fluorDelOtherRow":0,
               "fluorDelColEnd":null,
               "fluorDelRowEnd":null,
               "fluorCommaDot":true,
               "exFluorCol":8,
               "exCycRow":1,
               "exCycRowRegEx":"([0-9]+)",
               "exCycCol":5,
               "exCycColRegEx":"([0-9\\.]+)",
               "exWellCol":1,
               "exWellRegEx":"(^[A-Za-z]+[0-9]+)",
               "exSamCol":2,
               "exSamRegEx":"(.*)",
               "exSamTypeCol":null,
               "exSamTypeRegEx":"(.*)",
               "exTarCol":null,
               "exTarRegEx":"(.*)",
               "exTarTypeCol":null,
               "exTarTypeRegEx":"(.*)",
               "exDyeCol":null,
               "exDyeRegEx":"(.*)",
               "exTrueCol":3,
               "exTrueRegEx":"3"
               },{
               "settingsID":"Roche LCS480 Meltcurve v1.5.0.39",
               "reformatAmpMelt":"melt",
               "reformatTableShape":"create",
               "fluorDelColStart":1,
               "fluorDelRowStart":2,
               "fluorDelOtherRow":0,
               "fluorDelColEnd":null,
               "fluorDelRowEnd":null,
               "fluorCommaDot":true,
               "exFluorCol":8,
               "exCycRow":1,
               "exCycRowRegEx":"([0-9]+)",
               "exCycCol":7,
               "exCycColRegEx":"([0-9\\.]+)",
               "exWellCol":1,
               "exWellRegEx":"(^[A-Za-z]+[0-9]+)",
               "exSamCol":2,
               "exSamRegEx":"(.*)",
               "exSamTypeCol":null,
               "exSamTypeRegEx":"(.*)",
               "exTarCol":null,
               "exTarRegEx":"(.*)",
               "exTarTypeCol":null,
               "exTarTypeRegEx":"(.*)",
               "exDyeCol":null,
               "exDyeRegEx":"(.*)",
               "exTrueCol":3,
               "exTrueRegEx":"2"
               }
              ];
    return ret;
}

function getSampleStr() {
    var ret = "Adult;ANF;198,7415\n" +
    "Adult;ANF;152,6856\n" +
    "Adult;ANF;195,3044\n" +
    "Adult;ANF;203,2052\n" +
    "Adult;ANF;194,1544\n" +
    "Adult;ANF;211,2212\n" +
    "Adult;ANF;179,8997\n" +
    "Adult;ANF;180,8556\n" +
    "Adult;ANF;215,4877\n" +
    "Embryo;ANF;11,7147\n" +
    "Embryo;ANF;16,6563\n" +
    "Embryo;ANF;21,5775\n" +
    "Embryo;ANF;17,6099\n" +
    "Embryo;ANF;23,6825\n" +
    "Adult;SCX;2,582\n" +
    "Adult;SCX;2,3426\n" +
    "Adult;SCX;2,398\n" +
    "Adult;SCX;1,4048\n" +
    "Adult;SCX;1,8926\n" +
    "Adult;SCX;1,5056\n" +
    "Adult;SCX;1,6677\n" +
    "Adult;SCX;1\n" +
    "Adult;SCX;1,1834\n" +
    "Embryo;SCX;1,5366\n" +
    "Embryo;SCX;1,791\n" +
    "Embryo;SCX;1,1842\n" +
    "Embryo;SCX;2,1703\n" +
    "Embryo;SCX;1,5164\n" +
    "Adult;cTNI;6840,218\n" +
    "Adult;cTNI;8198,7996\n" +
    "Adult;cTNI;7272,4112\n" +
    "Adult;cTNI;7036,1812\n" +
    "Adult;cTNI;6509,8818\n" +
    "Adult;cTNI;7314,1898\n" +
    "Adult;cTNI;7562,7343\n" +
    "Adult;cTNI;7700,1271\n" +
    "Adult;cTNI;8808,8913\n" +
    "Embryo;cTNI;1,8982\n" +
    "Embryo;cTNI;2,7523\n" +
    "Embryo;cTNI;1,5568\n" +
    "Embryo;cTNI;1,1124\n" +
    "Embryo;cTNI;9,8329\n"
    return ret;
}

