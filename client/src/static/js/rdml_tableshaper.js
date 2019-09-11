"use strict";

const API_URL = process.env.API_URL
const API_LINK = process.env.API_LINK

const submitButton = document.getElementById('btn-submit')
submitButton.addEventListener('click', loadInputFile)

const exampleButton = document.getElementById('btn-example')
exampleButton.addEventListener('click', showExample)

const compButton = document.getElementById('btn-apply-comp')
compButton.addEventListener('click', compResTable)

const inputFile = document.getElementById('inputFile')
const resultInfo = document.getElementById('result-info')
const resultError = document.getElementById('result-error')

const inputTableView = document.getElementById('import-table-view')
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
window.inputSeparator = "\t";
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

// TODO client-side validation
function createServerRdml() {
    if (window.resultTab == []) {
        alert("Not sufficient data to create an RDML file.")
        return;
    }
    var content = "";
    var missingData = false
    for (var i = 0 ; i < window.resultTab.length ; i++) {
        for (var k = 0 ; k < window.resultTab[i].length ; k++) {
            content += window.resultTab[i][k] + "\t"
            if ((k < 6) && (window.resultTab[i][k] == "")) {
                missingData = true
            }
        }
        content = content.replace(/\t$/g, "\n");
    }
    if (missingData == true) {
        alert("The columns 1 to 6 must be filled.")
        return;
    }

    const formData = new FormData()
    formData.append('createFromTableShaper', 'createFromTableShaper')
    formData.append('experimentID', getSaveHtmlData('inExperimentID'))
    formData.append('runID', getSaveHtmlData('inRunID'))
    formData.append('pcrFormat_columns', getSaveHtmlData('inRunPcrFormat_columns'))
    formData.append('pcrFormat_columnLabel', getSaveHtmlData('inRunPcrFormat_columnLabel'))
    formData.append('pcrFormat_rows', getSaveHtmlData('inRunPcrFormat_rows'))
    formData.append('pcrFormat_rowLabel', getSaveHtmlData('inRunPcrFormat_rowLabel'))
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

window.selectMachineSettings = selectMachineSettings;
function selectMachineSettings(){
    var sel = document.getElementById('selMachineSettings').value;
    if (sel >= 0) {
        loadModification(window.setArr[sel]);
        updateModification();
    }
}

window.loadInputFile = loadInputFile;
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
            updateSepCount(window.inputFile);
        }
        reader.readAsText(file);
    } else {
        alert("Error opening file");
    }
}

function showExample() {
    window.inputFile = getSampleStr();
    updateSepCount(window.inputFile);
    var opt = document.getElementById("selMachineSettings");
    for (var i = 0 ; i < opt.options.length ; i++) {
        if (opt.options[i].text == "BioRad iCycler v9.35") {
            opt.value = i - 1;
        }
    }
    loadModification(window.setArr[opt.value]);
    updateModification();
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
        for (var k = 0 ; k < tab[i].length ; k++) {
            retVal += "<td>" + tab[i][k] + "</td>\n"
        }
        retVal += "</tr>\n"
    }
    retVal += "</table>\n" + cutOff
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
        window.navigator.msSaveBlob(blob, "TableShaper_settings.json");
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
	    a.download = "shaped_qPCR_data.tsv";
	    a.click();
	    window.URL.revokeObjectURL(url);
    } else {
        window.navigator.msSaveBlob(blob, "shaped_qPCR_data.tsv");
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
}

window.updateModification = updateModification;
function updateModification() {
    window.modifySettings["settingsID"] = document.getElementById('modSetName').value;
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

    var minRowNr = 0;
    if (window.modifySettings["fluorDelRowStart"] > 0) {
         minRowNr = window.modifySettings["fluorDelRowStart"];
    }
    var maxRowNr = tab.length;
    if ((window.modifySettings["fluorDelRowEnd"] > 1) && (window.modifySettings["fluorDelRowEnd"] < tab.length)) {
         maxRowNr = window.modifySettings["fluorDelRowEnd"];
    }
    reshapeTableView.innerHTML = drawHtmlTable(tab)
    var ftab = [["Well", "Sample", "Sample Type", "Target", "Target Type", "Dye"]];
    if (window.modifySettings["reformatTableShape"] != "create") {
        // Insert columns and extract the fluorescence data
        var jumpStep = 1;
        if (window.modifySettings["fluorDelOtherRow"] > 0) {
             jumpStep = window.modifySettings["fluorDelOtherRow"] + 1 ;
        }
        var realRowNr = 0;
        for (var r = minRowNr ; r < maxRowNr ; r += jumpStep) {
            realRowNr++;
            ftab[realRowNr] = ["", "", "", "", "", ""];
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
                if (cycRowRe.test(tab[fRow][c])) {
                    var match = cycRowRe.exec(tab[fRow][c]);
                    if (window.modifySettings["fluorCommaDot"] == true) {
                        if (match[1].match(/,/) != null) {
                            var resVal = match[1].replace(/\./g, "");;
                            ftab[0][realColNr] = Math.ceil(parseFloat(resVal.replace(/,/g, ".")));
                        } else {
                            ftab[0][realColNr] = Math.ceil(parseFloat(match[1]));
                        }
                    } else {
                        ftab[0][realColNr] = Math.ceil(parseFloat(match[1]));
                    }
                } else {
                    ftab[0][realColNr] = "";
                }
            }
        }
        // Well information
        if (window.modifySettings["exWellCol"] > 0) {
            var wellColRe = new RegExp(window.modifySettings["exWellRegEx"]);
            var wellCol = window.modifySettings["exWellCol"] - 1;
            realRowNr = 0;
            for (var r = minRowNr ; r < maxRowNr ; r += jumpStep) {
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
            var matchCyc = cycColRe.exec(tab[r][cycCol]);
            var cycVal = matchCyc[1];
            var matchWell = wellColRe.exec(tab[r][wellCol]);
            var wellVal = matchWell[1];
            if (cycLookUp.hasOwnProperty(cycVal) != true) {
                cycLookUp[cycVal] = cycCount + 6;
                ftab[0][cycLookUp[cycVal]] = cycVal;
                cycCount++;
            }
            if (wellLookUp.hasOwnProperty(wellVal) != true) {
                wellLookUp[wellVal] = wellCount + 1;
                ftab[wellLookUp[wellVal]] = [wellVal, "", "", "", "", ""];
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
            if (window.modifySettings["fluorCommaDot"] == true) {
                if (tab[r][fluorCol].match(/,/) != null) {
                    var resVal = tab[r][fluorCol].replace(/\./g, "");
                    ftab[wellLookUp[wellVal]][cycLookUp[cycVal]] = resVal.replace(/,/g, ".");;
                } else {
                    ftab[wellLookUp[wellVal]][cycLookUp[cycVal]] = tab[r][fluorCol];
                }
            } else {
                ftab[wellLookUp[wellVal]][cycLookUp[cycVal]] = tab[r][fluorCol];
            }
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
    exportTableView.innerHTML = drawHtmlTable(window.resultTab)

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
               "settingsID":"Applied Biosystems SDS v2.4",
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
               "exDyeRegEx":".+ (.*)"
               },{
               "settingsID":"Applied Biosystems v9.24",
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
               "exDyeRegEx":"(.*)"
               },{
               "settingsID":"BioRad CFX v3.1",
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
               "exDyeRegEx":"(.*)"
               },{
               "settingsID":"BioRad iCycler v9.35",
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
               "exDyeRegEx":"(.*)"
               },{
               "settingsID":"Eppendorf Realplex",
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
               "exDyeRegEx":"(.*)"
               },{
               "settingsID":"Illumina Eco v3.0",
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
               "exDyeRegEx":"(.*)"
               },{
               "settingsID":"Mic v2.7",
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
               "exDyeRegEx":"(.*)"
               },{
               "settingsID":"MJ research",
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
               "exDyeRegEx":"(.*)"
               },{
               "settingsID":"QuantStudio 12K Flex",
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
               "exDyeRegEx":"(.*)"
               },{
               "settingsID":"Roche LC96",
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
               "exDyeRegEx":"^[A-Za-z]+[0-9]+ (.*)"
               },{
               "settingsID":"Roche LC96 (flip)",
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
               "exDyeRegEx":"^[A-Za-z]+[0-9]+ (.*)"
               },{
               "settingsID":"Roche LightCycler480",
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
               "exDyeRegEx":"(.*)"
               },{
               "settingsID":"Roche LightCycler480 (flip)",
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
               "exDyeRegEx":"(.*)"
               },{
               "settingsID":"Roche LightCycler480 (create)",
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
               "exDyeRegEx":"(.*)"
               },{
               "settingsID":"Rotorgene",
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
               "exDyeRegEx":"(.*)"
               },{
               "settingsID":"Stratagene Mx3000P",
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
               "exDyeRegEx":"[^,]*,[^,]*,[^,]*, (.*)"
               },{
               "settingsID":"ThermoFisher StepOnePlus",
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
               "exDyeRegEx":"(.*)"
               }
              ];
    return ret;
}

function getSampleStr() {
    var ret = "Well/\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\n" +
    "Cycle\tA1 ANF\tA2 EGFP\tA3 GAPDH\tA4 ANF\tA5 EGFP\tA6 GAPDH\tA7 ANF\tA8 EGFP\tA9 GAPDH\tA10 ANF\tA11 EGFP\tA12 GAPDH\tB1 ANF\tB2 EGFP\tB3 GAPDH\tB4 ANF\tB5 EGFP\tB6 GAPDH\tB7 ANF\tB8 EGFP\tB9 GAPDH\tB10 ANF\tB11 EGFP\tB12 GAPDH\tC1 ANF\tC2 EGFP\tC3 GAPDH\tC4 ANF\tC5 EGFP\tC6 GAPDH\tC7 ANF\tC8 EGFP\tC9 GAPDH\tC10 ANF\tC11 EGFP\tC12 GAPDH\tD1 ANF\tD2 EGFP\tD3 GAPDH\tD4 ANF\tD5 EGFP\tD6 GAPDH\tD7 ANF\tD8 EGFP\tD9 GAPDH\tD10 ANF\tD11 EGFP\tD12 GAPDH\tE1 ANF\tE2 EGFP\tE3 GAPDH\tE4 ANF\tE5 EGFP\tE6 GAPDH\tE7 ANF\tE8 EGFP\tE9 GAPDH\tE10 ANF\tE11 EGFP\tE12 GAPDH\tF1 ANF\tF2 EGFP\tF3 GAPDH\tF4 ANF\tF5 EGFP\tF6 GAPDH\tF7 ANF\tF8 EGFP\tF9 GAPDH\tF10 ANF\tF11 EGFP\tF12 GAPDH\tG1 ANF\tG2 EGFP\tG3 GAPDH\tG4 ANF\tG5 EGFP\tG6 GAPDH\tG7 ANF\tG8 EGFP\tG9 GAPDH\tG10 ANF\tG11 EGFP\tG12 GAPDH\tH1 RT-\tH2 RT-\tH3 RT-\tH4 RT-\tH5 RT-\tH6 RT-\tH7 RT-\tH8 RT-\tH9 RT-\tH10 RT-\tH11 RT-\tH12 RT-\n" +
    "0,64\t167,61\t185,18\t179,11\t168,29\t170,41\t182,71\t180,27\t182,56\t188,52\t181,42\t173,75\t175,02\t178,91\t190,44\t219,93\t189,05\t185,81\t195,63\t191,53\t190,21\t207,57\t192,55\t185,87\t178,78\t184,63\t187,39\t189,13\t187,82\t185,73\t193,18\t187,75\t191,94\t191,98\t189,38\t187,82\t173,09\t178,09\t185,53\t191,4\t187,24\t179,21\t194,45\t183,45\t187,34\t214,67\t187,32\t184,97\t170,32\t178,59\t180,7\t188,81\t184,37\t187,75\t191,9\t183,55\t191,3\t191,6\t174,57\t181,66\t174,75\t182,87\t182,61\t185,62\t182,31\t193,26\t191,4\t192,28\t187,81\t198,09\t184,9\t179,63\t181,25\t171,38\t192,18\t189,64\t188,07\t180,29\t196,82\t191,06\t194,35\t197,41\t192,15\t185,85\t182,79\t168,43\t183,63\t183,03\t179,38\t181,39\t180,31\t187,73\t187,68\t188,8\t188,7\t185,15\t170,7\n" +
    "1,58\t171,84\t194,59\t182,69\t172,34\t172,87\t189,05\t187,25\t189,62\t193,72\t189,46\t181,22\t183,81\t180,77\t186,65\t213,01\t182,02\t179,71\t190,9\t185,34\t185,56\t202,7\t185,09\t179,87\t182,07\t185,99\t180,71\t182,91\t183,56\t179\t186,7\t184,54\t184,39\t190,45\t184,37\t182,31\t173,51\t180,77\t183,05\t187,28\t186,01\t175,36\t188,17\t179,76\t183,04\t210,06\t182,94\t180,36\t170,57\t181,21\t178,1\t183,84\t182,04\t185,33\t186,33\t179,04\t185,67\t186,1\t170,79\t179,46\t174,2\t184,84\t176,47\t182,3\t177,9\t188\t186,63\t186,8\t183,52\t192,42\t180,16\t172,51\t182,62\t173,52\t186,18\t185,8\t181,94\t178,64\t193,68\t187,11\t188,42\t191,61\t188\t178,41\t185,93\t180,03\t188,45\t186,09\t180,58\t182,1\t183,16\t189,58\t187,83\t188,62\t190,72\t188,06\t180,56\n" +
    "2,64\t175,77\t201,04\t185,65\t174,51\t175,53\t191,26\t187,51\t191,16\t194,3\t190,37\t183,37\t189,99\t180,73\t185,28\t211,02\t181,35\t178,8\t191,62\t185,89\t184,92\t202,53\t185,23\t178,65\t182,17\t186,99\t179,7\t180,86\t183,38\t177,73\t185,61\t184,95\t184,14\t189,75\t183,01\t183,62\t173,91\t180,17\t180,93\t186,53\t184,1\t173,37\t187,86\t179,19\t183,09\t209,44\t182,34\t180,45\t171,16\t181,37\t177,03\t183,44\t181,59\t184,8\t185,04\t179,16\t184,74\t184,15\t170,53\t178,9\t173,84\t185,51\t175,41\t180,78\t176,9\t187,52\t185,21\t188,09\t183,73\t190,6\t179,79\t170,36\t183,84\t175,18\t185,82\t184,96\t180,49\t182,32\t193,56\t185,54\t187,89\t190,48\t186,55\t178,41\t185,76\t183,25\t189,12\t187,16\t180,89\t180,8\t183,28\t190,31\t187,31\t187,94\t191,76\t190,16\t183,9\n" +
    "3,64\t177,96\t204,63\t188,22\t176,94\t176,37\t192,77\t189,45\t191,97\t194,77\t191,32\t183,84\t191,15\t181,27\t185,09\t210,81\t180,72\t177,19\t190,81\t186,37\t184,87\t202,19\t184,05\t177,25\t182,18\t186,3\t179,87\t182,54\t183,82\t178,95\t188,17\t186,23\t185,88\t190,17\t182,92\t187,7\t175\t180,92\t181,03\t185,66\t183,94\t174,05\t186,82\t178,77\t182,82\t211,19\t182,99\t180,26\t171,73\t181,33\t177,23\t183,06\t181,83\t185,22\t185,07\t179,81\t184,25\t186,02\t171,58\t180,21\t173,59\t186,38\t176,27\t180,3\t176,25\t186,93\t185,33\t186,89\t182,86\t190,85\t178,7\t170,31\t183,63\t175,74\t185,02\t185,59\t179,31\t180,08\t193,29\t188,75\t188,08\t190,37\t187,33\t178,36\t188,18\t184,1\t189,71\t187,19\t180,81\t180,67\t184,28\t190,42\t186,75\t188,62\t191,67\t189,68\t185,92\n" +
    "4,64\t178,6\t207,18\t189,62\t177,48\t176,31\t192,87\t189,56\t190,59\t193,66\t190,92\t184,88\t191,01\t180,92\t185,44\t211,43\t180,97\t178,12\t190,51\t185,03\t185,34\t201,86\t183,7\t177,32\t181,91\t186,82\t179,9\t184,75\t183,74\t177,41\t186,78\t185,65\t184,34\t188,58\t181,79\t189,53\t175,09\t180,27\t180,23\t185,11\t183,65\t173,28\t186,71\t178,69\t182,82\t210,44\t182,88\t180,75\t173,99\t181,24\t177,79\t183,35\t180,5\t186,76\t184,95\t179,59\t183,67\t185,05\t171,09\t180,43\t172,4\t198,12\t176,03\t180,23\t175,62\t187,88\t185,19\t187,41\t181,96\t192,11\t178,14\t169,99\t184,16\t175,37\t184,65\t184,99\t179,82\t180,35\t192,51\t187,52\t187,94\t190,02\t187,01\t179,21\t187,69\t184,22\t190,47\t186,89\t180,85\t181,36\t183,93\t190,69\t187,13\t189,73\t193,69\t190,21\t185,97\n" +
    "5,64\t178,61\t207,7\t189,19\t177,33\t176,33\t193,37\t188,24\t190,49\t194,48\t190,58\t184,99\t192,57\t180,87\t184,74\t211,39\t180,8\t176,96\t189,8\t184,38\t186,07\t200,81\t182,86\t177,54\t182,12\t185,68\t180,18\t186,24\t185,42\t181,29\t186,72\t185,36\t184,58\t189,41\t182,85\t190,07\t174,83\t180,46\t180,16\t186,36\t183,05\t173,9\t186,24\t179,29\t183,04\t210,63\t184,99\t180,84\t173,79\t181\t178,38\t182,83\t180,52\t185,55\t185,19\t179,9\t184,04\t184,79\t170,92\t183,22\t172,45\t198,87\t176,09\t179,8\t175,83\t186,86\t184,72\t187,51\t182,49\t192,83\t178,19\t170,38\t184,28\t175,04\t186,21\t185,55\t178,36\t179,64\t192,15\t185,88\t187,88\t191\t187,5\t178,7\t186,7\t185,55\t189,7\t187,85\t181,74\t181,43\t183,14\t190,07\t187,88\t189,5\t192,72\t189,84\t186,51\n" +
    "6,58\t178,32\t208,3\t189,09\t176,85\t175,4\t192,46\t187,66\t190,87\t194,87\t190,78\t185,43\t192,16\t180,05\t186,13\t212,41\t180,83\t176,34\t189,93\t184,03\t185,44\t199,2\t183,21\t176,83\t181,17\t186,44\t179,92\t185,32\t184,54\t179,11\t186,84\t184,37\t183,37\t189,01\t182,79\t189,47\t175,28\t180,4\t179,26\t186,52\t183,17\t174,57\t186,8\t179,48\t182,17\t211,58\t184,71\t180,42\t173,57\t180,32\t177,52\t186,67\t180,68\t185,01\t184,02\t178,6\t182,9\t189,47\t170,89\t183,25\t172,89\t199,96\t175,62\t179,69\t175,2\t185,61\t184,85\t186,28\t180,81\t190,81\t178,08\t169,96\t183,52\t174,63\t185,34\t184,98\t180,15\t179,6\t190,12\t185,68\t187,52\t189,59\t186,21\t177,73\t187,41\t185,39\t189,71\t188,5\t180,82\t181,47\t183,76\t190,99\t186,85\t189,22\t192,53\t190,61\t187,28\n" +
    "7,64\t178,45\t207,5\t190,72\t176,57\t175,33\t191,84\t187,39\t190,67\t193,59\t190,82\t183,29\t191,97\t180,24\t185,51\t215,24\t180,4\t177,01\t190,41\t184,4\t185,7\t198,75\t182,55\t176,9\t181,38\t189,67\t179,73\t186,91\t184,46\t178,82\t187,4\t185,32\t183,09\t189,87\t183,95\t189,95\t175,04\t180,09\t181,41\t185,88\t181,93\t173,4\t190,79\t178,86\t183,05\t213,49\t185,6\t181,46\t173,76\t180,73\t178,6\t188,21\t180,79\t185,63\t183,45\t179,35\t184,09\t186,64\t171,48\t183,44\t172,85\t201,99\t175,78\t180,17\t176,08\t185,91\t184,7\t186,64\t181,47\t191,36\t177,5\t170,2\t183,14\t175,33\t186,17\t185,3\t178,64\t180,1\t191,34\t186,21\t186,69\t190,03\t186,92\t177,41\t186,86\t185,39\t190,39\t187,87\t181,55\t181,43\t183,69\t192,01\t185,8\t189,85\t192,87\t190,15\t187,03\n" +
    "8,64\t178,6\t208,9\t190,81\t175,77\t174,83\t191,06\t189,03\t189,73\t193,55\t190,99\t183,21\t192,78\t180,04\t185,42\t216,24\t181,82\t177,02\t190,64\t183,29\t184,84\t198,53\t182,56\t176,38\t181,51\t186,62\t179,86\t186,42\t185,01\t178,62\t186,92\t183,8\t182,61\t188,83\t184,64\t190,03\t174,64\t179,9\t181,46\t185,19\t183,32\t173,09\t190,09\t178,01\t182,57\t213,16\t183,67\t181,14\t173,29\t180,11\t177,95\t188,84\t180,45\t185,62\t183,26\t178,37\t183,26\t185,22\t171,56\t183,46\t172,41\t206,12\t175,95\t178,62\t175,38\t185,27\t187,54\t186,74\t181,99\t190,98\t177,95\t169,65\t183,59\t174,98\t185,18\t186,07\t178,69\t180,01\t192,88\t185,8\t187,79\t189,6\t187,06\t177,99\t187,04\t184,92\t190,02\t188,18\t181,47\t180,43\t183,46\t191,37\t186,16\t188,02\t192,29\t190,93\t186,34\n" +
    "9,64\t178,27\t208,81\t190,6\t174,96\t174,41\t190,45\t188,12\t190,35\t193,69\t190,39\t184,96\t192,58\t179,84\t185,32\t215,67\t180,47\t175,7\t189,08\t183,24\t185,15\t198,8\t182,95\t175,69\t180,5\t186,19\t179,9\t186,43\t184,68\t177,27\t186,84\t183,74\t182,51\t188,52\t185,13\t190,03\t175,05\t179,91\t180,9\t184,56\t187,4\t172,44\t190,18\t179,15\t182,26\t212,84\t182,51\t180,81\t173,57\t180,24\t178,55\t187,41\t180,19\t185,8\t183,81\t179,08\t183,2\t184,76\t171,82\t182,85\t172,09\t205,03\t175,81\t183,31\t175,07\t185,33\t184,54\t186,68\t181,35\t190,74\t177,46\t169,53\t183,64\t175,59\t185,34\t185,57\t178,07\t179,73\t192,18\t184,39\t185,44\t189,56\t186,97\t179,13\t187,81\t184,96\t189,72\t188,37\t181,68\t180,26\t183,49\t191\t185,98\t189,98\t191,64\t191,26\t187,31\n" +
    "10,58\t177,77\t208,65\t190,88\t175,26\t174,27\t190,32\t187,71\t190,3\t193,42\t190,6\t184\t192,92\t179,32\t185,05\t214,56\t183,01\t175,34\t188,86\t183,07\t184,25\t197,88\t182,01\t175,97\t180,43\t185,52\t179,65\t185,88\t184,36\t176,89\t185,75\t183,95\t182,11\t187,76\t185,45\t189,53\t174,67\t179,27\t180,99\t184,81\t183,93\t173,12\t191,45\t178,11\t182,25\t212,52\t181,52\t182,14\t174,09\t179,97\t176,95\t185,46\t179,9\t184,52\t183,75\t177,93\t182,71\t184,14\t170,81\t182,88\t172,29\t206,21\t175,26\t181,61\t175,37\t183,88\t184,54\t186,22\t180,59\t191,85\t177,67\t168,69\t182,51\t175,67\t185,06\t185,61\t178,63\t179,56\t191,68\t184,81\t186,25\t190,06\t187,35\t177,69\t187,12\t185,04\t190,26\t188,4\t181,57\t180,99\t183,4\t190,81\t185,38\t188,69\t191,67\t190,73\t185,98\n" +
    "11,64\t177,59\t208,99\t191,1\t176,44\t174,61\t190,54\t187,38\t189,73\t193,49\t190,53\t183,25\t194,13\t179,06\t185,33\t214,14\t184,65\t176,63\t189,06\t183,42\t185,28\t197,63\t181,06\t174,94\t180,61\t185,32\t181,11\t185,6\t184,56\t177,39\t186,03\t182,87\t181,64\t187,29\t185,87\t189,38\t174,77\t180,97\t181,65\t185,31\t186,88\t173,77\t192,25\t178\t182,89\t211,92\t181,98\t181,58\t173,98\t179,74\t178,66\t188,99\t179,78\t186,38\t183,42\t178,35\t183,5\t184,37\t172,44\t185,3\t172,78\t206,59\t175,07\t183,12\t174,37\t183,46\t184,74\t186,57\t181,68\t191,51\t177,9\t170,17\t182,87\t175,58\t185,69\t185,93\t177,34\t178,34\t191,64\t186,8\t186,08\t190,2\t188,18\t178,94\t188,05\t185,37\t188,74\t188,76\t181,84\t179,86\t182,6\t191,91\t185,68\t188,81\t192,96\t190,32\t186,33\n" +
    "12,64\t178,27\t209,06\t191,33\t176,21\t174,48\t190,57\t187,28\t188,77\t193,6\t189,89\t183,64\t194,78\t179,84\t185,53\t216,45\t186,6\t176,4\t189,6\t183,04\t184,68\t197,19\t181,79\t175,49\t181,79\t185,53\t180,79\t186,71\t185,58\t177,77\t187,06\t183,03\t182,18\t189,57\t184,65\t188,91\t175,61\t181,2\t182,54\t185,77\t186,99\t175,31\t192,49\t178,86\t181,91\t213,74\t181,48\t181,74\t174,8\t179,28\t178,27\t189,14\t179,75\t185,77\t183,61\t180,22\t182,29\t184,28\t170,86\t184,42\t172,72\t207,4\t175,81\t183,99\t174,66\t183,99\t184,26\t185,62\t181,62\t192,16\t177,49\t169,39\t184,34\t175,17\t185,81\t186,44\t177,66\t179,67\t190,63\t186,08\t186,35\t190,52\t186,1\t178,01\t187,84\t184,25\t189,58\t189,36\t181,26\t179,37\t182,89\t194,25\t185,79\t189,71\t192,71\t191,47\t188,03\n" +
    "13,58\t177,05\t209,56\t191,95\t175,1\t174,29\t191,35\t186,46\t188,42\t193,65\t190,09\t183,69\t193,23\t180,33\t185,32\t217,49\t188,3\t176,42\t190,6\t181,34\t183,86\t201,79\t181,48\t174,92\t181,8\t186,15\t181,44\t187,24\t186,36\t178,71\t187,17\t183\t180,79\t187,4\t185,52\t187,36\t176,33\t183,9\t186,36\t186,37\t189,68\t177,58\t190,13\t177,34\t183,25\t214,98\t185,18\t181,03\t175,18\t179,15\t178,5\t189,59\t179,48\t185,72\t184,92\t177,94\t182,67\t185,27\t171,95\t183,54\t174,73\t207,57\t174,38\t181,87\t175,36\t184,18\t185,34\t184,77\t180,81\t192,69\t177,02\t169,37\t184,83\t175,11\t183,9\t186,45\t177,07\t179,42\t192,66\t185,16\t185,95\t191,85\t186,01\t177,76\t188,54\t184,53\t188,89\t188,4\t180,66\t179,36\t182,53\t191,84\t184,66\t187,7\t192,75\t191,35\t186,91\n" +
    "14,64\t178,27\t212,7\t193,98\t176,34\t177\t193,88\t186,06\t189,22\t195,68\t189,76\t182,62\t194,98\t182,67\t187,08\t221,31\t190,34\t178,14\t194,04\t182,38\t184,79\t199,95\t181,09\t174,77\t184,37\t188,77\t184,07\t189,61\t187,31\t181,67\t190,31\t183,69\t181,43\t189,06\t185,77\t187,57\t177,2\t190,39\t192,28\t190,47\t192,65\t184,71\t192,31\t178,1\t182,59\t217,32\t187,29\t180,81\t176,74\t179,45\t178,72\t186,04\t180,25\t187,15\t187,26\t178,74\t183,13\t186,98\t171,55\t183,01\t177,69\t209,49\t175,48\t184,68\t174,21\t184,06\t187,34\t185,77\t181,21\t193,93\t178,32\t169,01\t185,88\t175,35\t184,97\t188,03\t177,23\t180,06\t193,47\t186,07\t185,19\t193,1\t185,74\t178,19\t190,12\t184,74\t188,29\t189,35\t181,46\t180,08\t182,92\t192,38\t184,54\t188,52\t191,78\t191,3\t186,16\n" +
    "15,64\t179,9\t215,96\t197,68\t177,86\t178,71\t197,49\t187,55\t189,02\t198,27\t189,83\t181,93\t197,85\t185,73\t189,52\t228,01\t194,84\t181,34\t199,31\t182,15\t184,55\t201,26\t180,41\t175,01\t187,22\t193,9\t188,77\t194,25\t192,05\t185,4\t194,36\t183,49\t180,64\t188,77\t183,61\t189,02\t177,54\t201,17\t202,52\t196,62\t199,61\t197\t201,46\t178,25\t182,24\t219,97\t188,48\t181,7\t180,12\t179,15\t179,44\t187,98\t180,55\t188,61\t190,35\t178,89\t182,45\t190,21\t172,07\t183,43\t178,57\t211,43\t176\t185,98\t175,25\t184,79\t187,51\t185,29\t181,25\t197,91\t177,39\t170,06\t189,97\t175,81\t184,24\t191,04\t176,88\t179,82\t196,89\t186,23\t186,24\t197,19\t186,39\t177,91\t194,17\t184,31\t189,16\t189,39\t181,23\t179,83\t181,15\t190,97\t185,23\t188,24\t190,96\t191,93\t187,62\n" +
    "16,64\t182,49\t221,71\t204,52\t180,9\t183,93\t204,86\t187,39\t188,65\t203,68\t190,58\t182,75\t202,83\t192,1\t194,31\t241,45\t202,97\t185,52\t208,64\t181,95\t184,93\t207,45\t180,97\t174,7\t193\t202,91\t196,92\t200,66\t198,27\t193,12\t202,8\t183\t181,58\t190,68\t182,21\t188,97\t179,87\t215,11\t223,47\t205,39\t215,98\t217,59\t216,21\t177,53\t182,15\t227,26\t187,72\t182,55\t184,75\t179,53\t181,02\t193,87\t181,02\t189,99\t198,07\t179,09\t183,45\t196,44\t171,64\t183,67\t185,56\t211,48\t175,97\t188,21\t174,32\t184,69\t192,39\t189,54\t181,67\t204,53\t177,08\t170\t196,03\t175,41\t184,83\t195,59\t177,01\t180,65\t204,89\t185,58\t185,19\t203,78\t186,35\t176,87\t200,07\t184,57\t188,79\t189,67\t181,61\t179,73\t183,91\t192,85\t185,18\t187,55\t191,95\t192,71\t186,01\n" +
    "17,58\t187,25\t233,36\t216,56\t186,37\t194,25\t217,88\t187,35\t188,55\t213,89\t189,62\t182,86\t209,71\t203,29\t202,89\t263,34\t215,85\t193,42\t225,8\t181,58\t185,1\t216,86\t180,14\t175,24\t199,43\t212,6\t212,32\t214,54\t211,65\t208,36\t217,24\t182,65\t180,21\t194,49\t181,36\t187,63\t182,96\t242,76\t258,63\t224,59\t246,9\t254,18\t239,58\t176,67\t186\t239,39\t187,44\t181,5\t194,21\t181,39\t183,87\t210,03\t182,48\t194,21\t210,43\t178,81\t185,64\t207,94\t171,12\t184,25\t195,29\t212,05\t176,12\t193,89\t174,42\t184,05\t199,23\t186,81\t181,93\t218,21\t177,12\t169,84\t207,22\t176,2\t184,11\t203,99\t177,48\t179,83\t214,31\t185,71\t185,79\t216,69\t186,67\t177,7\t209,69\t184,53\t188,99\t189,28\t182,05\t179,16\t183,57\t191,45\t183,57\t192,72\t191,45\t192,34\t185,98\n" +
    "18,64\t195,63\t254,95\t237,86\t198,27\t212,19\t241,63\t187,74\t189,9\t232,32\t190,65\t183,21\t225,68\t226,1\t218,6\t297,5\t240,32\t209,58\t258,32\t182,2\t186,98\t235,51\t181,43\t176,22\t214,1\t234,49\t242,94\t237,58\t238,32\t237,03\t244,6\t184,05\t181,06\t201,29\t181,58\t189,49\t191,06\t286,78\t316,18\t256,46\t289,77\t315,6\t264,08\t178,73\t185,66\t266,26\t188,18\t182,52\t211,62\t184,08\t190,37\t232,53\t186,4\t200,84\t235,57\t180,66\t186,23\t227,94\t172,84\t183,65\t213,26\t212,67\t178,69\t204,98\t177,29\t186,76\t214,33\t187,37\t182,6\t245,82\t178,38\t169,66\t227,88\t177,08\t186,73\t221,28\t177,77\t182,38\t234,03\t187,09\t187,47\t239,79\t188,04\t178,15\t230,43\t185,36\t189,35\t189,68\t183,75\t180,14\t183,3\t192,1\t184,71\t188,96\t191,36\t192,15\t187,42\n" +
    "19,56\t211,83\t291,15\t273,27\t218,42\t247,13\t283,91\t190,17\t192,18\t266,25\t192,62\t185,4\t251,28\t261,32\t247,12\t353,59\t284,08\t241,92\t313,59\t185,98\t189,66\t274,6\t183,76\t179,9\t239,67\t273,49\t292,02\t272,91\t284,67\t287,77\t291,71\t185,52\t184,6\t216,77\t183,7\t191,85\t205,11\t348,48\t395,14\t311,41\t359,73\t401,96\t321,17\t181,47\t187,25\t312,06\t190,67\t185,42\t244,29\t190,83\t202,46\t271,63\t193,68\t216,04\t277,28\t182,8\t189,73\t266,55\t174,88\t187,1\t245,06\t215,01\t180,44\t225,33\t178,39\t191,99\t241,94\t190,48\t185,37\t290,27\t179,92\t173,01\t264,07\t179,4\t188,08\t250,74\t180,19\t186,71\t268,77\t189,66\t190,73\t281,4\t189,41\t180,77\t265,07\t185,66\t187,73\t190,34\t186,31\t181,93\t183,76\t194,63\t187,05\t188,22\t191,65\t193,32\t186,63\n" +
    "20,56\t242,08\t346,52\t325,33\t254,26\t299,21\t346,17\t193,23\t196,22\t314,11\t194,68\t188,36\t295,87\t316,46\t296,04\t413,42\t346,65\t293,34\t393,52\t187,23\t193,72\t327,28\t186,25\t183,14\t279,35\t331,95\t357,86\t323,7\t351,22\t360,46\t356,24\t186,68\t185,84\t240,75\t184\t194,2\t227,28\t411,68\t483,25\t385,54\t443,79\t493,38\t409,95\t183,68\t191,95\t376,39\t192,88\t187,72\t292,81\t203,15\t225,42\t326,46\t206,4\t240,74\t340,76\t186,41\t194,61\t322,23\t177,93\t190,42\t293,17\t218,14\t187,48\t261,41\t180,6\t197,57\t285,77\t194,88\t189,11\t357,7\t183,48\t175,38\t317,7\t182,28\t193,37\t299,91\t183,12\t191,42\t325,2\t192,64\t194,7\t345,42\t192,31\t186,91\t316,47\t188,57\t189,86\t190,54\t189,57\t181,92\t183,38\t195,86\t187,51\t188,01\t193,26\t193,14\t186,87\n" +
    "21,56\t286,04\t425,71\t387,02\t308,07\t374,35\t429,17\t196,47\t202,76\t369,1\t199,06\t192,84\t355,37\t384,16\t368,17\t485,47\t428,28\t369,46\t475,25\t190,54\t203,57\t397,75\t189,9\t190,67\t333,49\t406,65\t440,82\t380,92\t432,55\t460,44\t441,24\t188,78\t190,07\t280,91\t187,07\t197,22\t265,92\t455,6\t552,62\t470,04\t507,95\t571,9\t501,78\t188,39\t199,96\t469,98\t197,45\t195,86\t358,87\t223,62\t263,84\t399,88\t230,14\t285,06\t428,97\t192,97\t203,08\t392,86\t184,7\t198,57\t352,34\t224,43\t200,55\t310,25\t187,57\t212,16\t350,86\t201\t196,81\t439,99\t189,88\t185,08\t384,98\t188,81\t204,17\t369,84\t190,92\t204,47\t399,81\t199,31\t203,09\t429,36\t198,59\t196,84\t386,39\t193,73\t190,9\t191,31\t196,63\t181,55\t183,43\t196,36\t188,6\t188,64\t192,9\t194,86\t187,95\n" +
    "22,65\t341,58\t519,71\t449,37\t373,68\t450,99\t504,12\t204,1\t216,21\t430,58\t209,74\t206,99\t432,93\t436,92\t448,98\t559,75\t489,29\t458,66\t539,04\t200,52\t221,6\t488,97\t198,96\t207,49\t404,68\t470,86\t517,39\t444,79\t486,54\t544,42\t514,86\t194,29\t200,29\t344,48\t194,2\t206,88\t325,77\t489,71\t607,28\t533,31\t541,44\t630,11\t576,13\t199,54\t217,02\t550,87\t210,59\t209,2\t439,05\t257,57\t322,9\t476,74\t273,07\t356,45\t507,94\t206,17\t224,07\t474,41\t194,48\t212\t430,65\t235,73\t222,34\t373,04\t200,94\t238,6\t438,88\t215,17\t213,24\t538,59\t201,49\t199,91\t460\t203,56\t222,6\t456,2\t203,78\t225,25\t494,11\t213,52\t222,35\t524,64\t210,38\t212,1\t466,09\t203,9\t192,57\t193,29\t211,98\t184,38\t186,11\t197,95\t192,11\t189,8\t194,77\t196,94\t188,71\n" +
    "23,59\t382,77\t599,73\t495,28\t418,36\t514,24\t555,83\t220,68\t239,44\t478,49\t225,54\t227,77\t492,04\t466,41\t519,58\t623,96\t527,7\t539,29\t584,41\t216,25\t253,3\t547,56\t215,27\t233,79\t461,09\t498,78\t575,78\t496,09\t523,08\t609,92\t565,93\t205,24\t217,26\t423,11\t203,61\t219,99\t397,16\t521,65\t649,78\t580,63\t582,05\t678,35\t628,24\t221,03\t246,11\t618,17\t229,59\t239,47\t494,69\t308,49\t401,32\t530,29\t337,34\t448,9\t564,45\t228,89\t259,8\t527,96\t213,02\t238,23\t483,84\t256,23\t263,92\t444,98\t224,25\t284,63\t516,38\t241,26\t244,21\t602,34\t222,04\t228,65\t511,71\t226,31\t258,65\t527,87\t228,79\t263,28\t563,52\t237,32\t252,45\t592,2\t229,82\t240,81\t522,63\t221,39\t199,13\t196,71\t235,05\t187,3\t188,39\t200,65\t195,18\t191,53\t196,35\t199,25\t191,44\n" +
    "24,58\t407,83\t659,56\t536,49\t444,87\t563,7\t602,29\t246,18\t280,1\t529,56\t255,32\t263,97\t541,37\t498,24\t575,75\t679,86\t570,61\t606,09\t631,29\t244,27\t309,36\t601,19\t244,88\t281,62\t508,96\t528,97\t621,03\t534,51\t564,67\t666,76\t615,85\t223,99\t249,74\t496,95\t223,01\t249,18\t463,63\t549,33\t684,55\t626,27\t623,7\t716,78\t683,22\t267,45\t298,42\t679,89\t263,78\t287,72\t545,8\t367,38\t481,6\t587,4\t414,52\t537,97\t617,06\t270,43\t319,45\t579,78\t247,81\t283\t521,26\t290,01\t325,15\t502,97\t266,77\t352,13\t575,16\t283,49\t294,75\t662,75\t260,33\t279,84\t559,95\t267,26\t314,35\t579,56\t272,64\t325,98\t619,23\t278,74\t306,19\t647,65\t266,29\t292,38\t577,98\t250,49\t208,5\t201,15\t272,76\t192,71\t192,25\t203,5\t202,07\t195,99\t198,94\t205,63\t197,64\n" +
    "25,63\t433,05\t708,31\t570,44\t474,05\t602,04\t642,63\t289,92\t341,24\t570,52\t302,66\t320,28\t581,24\t527,1\t620,78\t722,01\t608,38\t655,01\t666,67\t289,47\t384,68\t647,63\t291,76\t347,26\t550,34\t546,06\t655,91\t567,94\t599,04\t707,46\t654,88\t257,84\t302,66\t549,89\t257,62\t290,75\t515,25\t556,96\t710,89\t661,68\t643,91\t747,9\t729,84\t327,19\t373,78\t731,32\t315,49\t358,62\t586,52\t411,67\t548,89\t635,12\t472,75\t612,38\t661,64\t329,62\t403,45\t619,47\t301,28\t348,64\t562,41\t340,7\t409,11\t545,78\t328,41\t439,97\t626,52\t349,8\t372,23\t709,19\t318,03\t352,31\t600,41\t328,83\t392,01\t625,57\t338,41\t408,98\t668,86\t344,58\t381,89\t696,94\t320,69\t354,83\t622,46\t299,5\t229,31\t212,28\t323,99\t203,71\t200,07\t212,7\t214,62\t203,82\t204,73\t217,9\t207,2\n" +
    "26,63\t460,47\t748,91\t601\t503,3\t632,28\t674,86\t356,48\t416,66\t609,24\t373,75\t393,09\t618,6\t555,23\t655,99\t755,49\t642,06\t695,79\t697,5\t358,66\t471,03\t681,61\t357,81\t421,05\t586,39\t573,01\t683,25\t611,52\t628,91\t740,02\t688,02\t312,09\t378,53\t599,37\t311,59\t345,62\t566,11\t575,55\t728,82\t692,15\t668,06\t767,54\t763,44\t397,89\t466,91\t770,49\t385,93\t448,09\t623,83\t431,55\t603,79\t679,16\t512,64\t673,09\t699,03\t407,74\t501,6\t655,98\t368,49\t423,02\t593,47\t392,96\t495,33\t586,48\t400,39\t529,57\t672,7\t431,46\t463,79\t751,03\t388,43\t438,56\t634,95\t398,13\t476,47\t667,24\t415,27\t499,74\t711,66\t426,09\t466,99\t738,41\t386,23\t439,72\t662,84\t362,11\t264,93\t230,27\t387,6\t222,32\t210,91\t227,62\t237,13\t218,2\t214,2\t233,38\t224,88\n" +
    "27,63\t483,01\t781,13\t625,16\t527,86\t656,52\t697,72\t422,63\t490,51\t638,31\t443,57\t467,77\t647,5\t582,83\t686,36\t774,79\t662,36\t731,89\t718,75\t430,34\t547,91\t712,18\t423,23\t484,9\t616,87\t609,64\t706,94\t642,9\t655,19\t762,82\t714,07\t383,86\t464,37\t642,67\t380,19\t404,99\t607,57\t593,33\t747,08\t718,44\t692,88\t788,59\t793,56\t461,58\t556,81\t803,01\t451,28\t532,66\t650,05\t459,01\t649,92\t709,64\t554,93\t720,44\t727,66\t476,73\t590,92\t682,22\t425,58\t488,42\t626,56\t432,15\t566,94\t606,29\t452,83\t601,76\t708,09\t493,68\t550,46\t780,88\t445,03\t514,78\t661,85\t447,65\t550,44\t699,4\t467,53\t576,39\t744,48\t491,11\t543,5\t782,6\t434,26\t502,76\t691\t418,72\t317,5\t259,72\t443,55\t254,97\t231,99\t253,32\t275,98\t246,25\t232,73\t264,96\t257,51\n" +
    "28,63\t505,17\t804,61\t643,34\t547,6\t672,21\t714,72\t465,82\t549\t660,19\t484,64\t525,82\t668,56\t602,98\t706,61\t798,24\t682,04\t753,58\t735,4\t477,04\t609,03\t735,81\t461,35\t533,64\t637,36\t648,14\t721,33\t664,35\t677,67\t783,97\t731,67\t445,44\t554,42\t674,89\t436,58\t460,16\t638,82\t619,57\t761,95\t732,37\t729,13\t802,61\t819,06\t496,43\t625,02\t825,12\t502,04\t599,44\t672,06\t487,54\t684,15\t712,01\t590,58\t755,41\t747,63\t516,41\t660,29\t703,44\t458,62\t541,31\t647,29\t461,67\t625,77\t643,05\t487,41\t657,32\t736,5\t531,16\t619,87\t804,14\t478,16\t585,68\t680,48\t480,52\t607,6\t724,35\t501,31\t634\t767,08\t529,58\t602,72\t795,7\t464,22\t556,65\t715,25\t450,02\t389,07\t312,83\t473,38\t308,34\t267,14\t298,04\t338,3\t290,99\t265,09\t316,13\t308,49\n" +
    "29,63\t523,07\t825,63\t657,44\t567,01\t692,43\t733,31\t499,27\t597,5\t682,32\t522,96\t579,12\t687,46\t617,75\t728,75\t826,25\t711,56\t773,81\t750,32\t512,34\t656,72\t750,83\t496,53\t575,67\t656,02\t672,63\t733,09\t682,75\t697,11\t801,95\t747,48\t486,23\t607,7\t702,39\t474,23\t514,72\t663,15\t647,81\t773\t748,67\t741,63\t809,82\t846,92\t536,68\t683,14\t844,48\t537,15\t655,68\t689,7\t518,26\t712,77\t754,7\t622,73\t783,89\t766,71\t558,66\t717,23\t718,55\t493,99\t585,8\t663,69\t493,04\t670,67\t681,74\t524,34\t705,96\t756,76\t574,43\t675,12\t822,44\t515,48\t629,26\t698,63\t516,92\t653,19\t744,63\t539,91\t680,92\t787,99\t572,81\t652,57\t813,14\t499,16\t610,58\t735,16\t476,36\t459\t383,58\t505,42\t381,74\t325,12\t359,79\t414,04\t359,69\t313,42\t387,07\t377,21\n" +
    "30,63\t536,48\t840,36\t671,36\t580,04\t705,56\t745,08\t531,95\t634,5\t698,27\t557,4\t617,03\t700,76\t632,04\t742,46\t834,59\t742,51\t790,56\t762,68\t556,23\t694,25\t768,97\t530,82\t606,69\t670,43\t688,75\t749,57\t699,1\t715,05\t812,64\t761,22\t521,53\t652,45\t722,07\t509,14\t559,16\t682,07\t667,62\t781,42\t758,66\t766,47\t822,37\t862,92\t575,74\t726,35\t857,11\t572,64\t696,22\t703,88\t537,29\t733,72\t775,42\t650,23\t808,37\t781,04\t596,5\t759,61\t731,31\t526,63\t620,62\t680,84\t520,75\t707,36\t699,37\t558,96\t739,63\t772,57\t613,89\t717,71\t838,05\t546,99\t665,61\t711,18\t550,2\t690,77\t760,42\t575,48\t715,89\t802,55\t609,26\t689,89\t826,08\t528,58\t668,78\t747,65\t499,11\t495,5\t456,01\t530,06\t453,2\t397,1\t437,26\t482,09\t442,32\t375,6\t458,29\t441,13\n" +
    "31,63\t549,82\t857,22\t682,32\t595,19\t715,75\t757,1\t563,14\t666,25\t713,25\t592,85\t650,88\t711,55\t653,63\t751,45\t820,52\t753,51\t803,18\t778,26\t590,75\t723,7\t780,62\t561,01\t631,16\t682,75\t694,44\t756\t700,24\t729,39\t823,97\t772,25\t557,79\t689,21\t739,06\t544,91\t599,5\t697,16\t681,94\t788,73\t769,13\t773,34\t833,29\t828,31\t609,78\t770,6\t868,84\t625\t730,24\t714,78\t556,19\t752,51\t759,32\t675,4\t825,89\t794,98\t630,91\t794,76\t740,86\t556,9\t647,19\t685,32\t549,19\t734,25\t707\t590,56\t767,78\t787,69\t648,46\t751,95\t849,49\t578,3\t693,8\t724,2\t580,75\t717,11\t773,27\t606,47\t744,98\t814,47\t644,74\t722,11\t839,4\t558,28\t712,07\t760,68\t517,62\t527,41\t507,18\t555,2\t505,21\t462,77\t496,76\t522,6\t518,7\t431,47\t507,11\t482,48\n" +
    "32,63\t562,99\t866,25\t692,09\t606,82\t723,6\t763,76\t590,45\t692,86\t725,17\t619,83\t696,52\t722,71\t679,05\t762,79\t844,73\t729,96\t814,18\t786,55\t633,16\t747,35\t789,55\t589,52\t657,96\t692,13\t691,19\t765,28\t714,24\t740,85\t831,79\t783,77\t590,42\t719,52\t750,1\t575,37\t629,17\t711,26\t692,88\t796,3\t780,41\t784,24\t843,37\t835,67\t640,29\t797,01\t889,12\t656,37\t757,15\t723,53\t574,21\t767,41\t759,12\t696,82\t843,8\t805,24\t660,96\t819,1\t751,32\t582,34\t666,69\t692,19\t569,78\t758,13\t724,25\t619,64\t804,32\t800,13\t680,18\t777,57\t862,41\t606,11\t717,62\t731,67\t604,33\t741,03\t783,89\t633,72\t766,15\t825,9\t673,96\t746,44\t848,58\t582,3\t741,4\t775,91\t536,13\t556,35\t538,5\t574,98\t539,74\t504,17\t532,68\t554,19\t562,14\t467,95\t542,21\t510,98\n" +
    "33,63\t573,15\t878,14\t700,29\t617,73\t730,82\t773,7\t617,36\t708,32\t733,63\t645,16\t714,04\t730,24\t700,97\t770,16\t880,54\t735,76\t820,54\t792,71\t660,92\t769,56\t795,22\t611,95\t668,67\t701,1\t690,19\t774,15\t717,88\t753,66\t845,45\t794,88\t619,44\t742,75\t762,37\t602,94\t660,02\t721,24\t703,27\t802,95\t790,95\t792\t850,25\t838,82\t665,5\t817,73\t896,22\t670,25\t778,32\t733,73\t588,38\t780,33\t787,03\t711,39\t857,03\t816,39\t686,96\t848,7\t757,24\t606,11\t685,12\t698,8\t589,19\t776,66\t745,78\t641,26\t814,18\t814,01\t703,61\t813,35\t869,33\t629,72\t737,34\t738,78\t628,03\t758,08\t794,02\t656,27\t784,6\t843,59\t699,39\t764,29\t857,21\t604,31\t760,55\t784,09\t549,24\t580,59\t569,84\t592,76\t571,72\t532,46\t562,25\t584,09\t595,34\t500,43\t571,25\t534,75\n" +
    "34,61\t584,62\t889,39\t709,09\t629,55\t738,37\t784,63\t637,51\t720,06\t743,66\t669,73\t732,63\t739,2\t716,16\t782,75\t900,78\t752,55\t832,82\t803,04\t700,23\t779,69\t803,25\t636,01\t688,57\t711,38\t708,91\t784,31\t744,12\t763,6\t854,61\t802,86\t644,74\t769,27\t774,12\t627,27\t684,78\t731,28\t714,96\t807,74\t797,91\t816,08\t854,54\t848,73\t689,7\t836,14\t906,78\t688,96\t805,32\t741,38\t603,96\t792,46\t830,72\t728,05\t870,37\t822,48\t709,66\t866,66\t764,22\t624,99\t700,42\t707,5\t607,96\t787,78\t759,85\t661,57\t826,19\t819,35\t728,36\t828,5\t878,77\t652,87\t751,08\t747,62\t650,89\t774,69\t803,49\t679,67\t799,06\t846,27\t722,4\t782,76\t867,45\t626,07\t778,38\t793,57\t562,61\t601,8\t597,98\t605,88\t599,82\t563,19\t594,45\t609,13\t630,08\t539,31\t600\t561,48\n" +
    "35,63\t587,36\t886,27\t712,17\t633,66\t744,45\t785,04\t658,23\t728,41\t750\t684,29\t738,41\t742,1\t720,81\t785,68\t911,22\t757,16\t837,34\t805,07\t711,64\t790,85\t806,2\t661,29\t701,8\t715,54\t727,19\t787,25\t752,85\t772,13\t859,98\t803,95\t662,78\t784,07\t778,93\t644,18\t699,08\t736,98\t718,36\t810,5\t802\t829,75\t857,38\t849,5\t705,64\t851,11\t901,12\t704,97\t816,82\t744,9\t612,44\t800,48\t836,79\t740,99\t876,62\t832,82\t727,6\t882,69\t769,43\t638,86\t707,87\t712,61\t620,19\t798,18\t764,41\t674,35\t832,34\t824,3\t745,05\t831,82\t881,64\t665,83\t761,22\t751,16\t665,47\t783,04\t807,9\t694,97\t807,71\t850,69\t739,1\t793,17\t870,92\t639,59\t789,69\t797,01\t567,88\t614,64\t614,02\t613,89\t616,58\t581,02\t610,69\t626,13\t650,22\t560,5\t617,95\t574,35\n" +
    "36,56\t599,49\t900,89\t722,22\t645,78\t747,86\t797,36\t689,25\t744,23\t766,16\t710,25\t756,25\t757,77\t727,15\t793,24\t921,87\t779,72\t842,32\t811,07\t706,97\t809,52\t842,15\t676,98\t718,19\t731,72\t738,17\t794,85\t759,63\t784,11\t863,66\t811,04\t684,93\t795,46\t793,21\t669,3\t728,74\t754,93\t726,15\t816,13\t808,57\t830,67\t862,6\t858,42\t731,92\t862,62\t908,15\t736,13\t829,48\t758,92\t624,21\t809,67\t846,55\t755,75\t884,71\t837,72\t752,3\t892,7\t782,96\t657,89\t722,56\t719,5\t631,26\t809,24\t760,83\t690,39\t845,72\t834,13\t771,02\t849,34\t899,25\t687,31\t782,11\t765,23\t684,41\t792,75\t812,7\t712,59\t825,21\t865,01\t765,2\t810,4\t882,55\t659,43\t807,47\t814,44\t578,3\t628,97\t636,09\t625,59\t640,78\t607,74\t638,27\t648,57\t679,76\t590,55\t647,4\t597,08\n" +
    "37,56\t604,05\t911,93\t728,64\t650,37\t747,24\t798,25\t691,3\t751,44\t770,18\t722,45\t764,7\t760,93\t733,77\t795,97\t926,11\t817,37\t847,95\t822,87\t713,38\t818,43\t847,64\t687,95\t722,38\t737,35\t724,67\t794,88\t765,19\t791,92\t869,43\t816,63\t702,03\t804,65\t800,42\t685,92\t745,33\t760,69\t732,9\t822,3\t811,18\t846,9\t864,47\t869,82\t744,04\t871,66\t909,89\t751,66\t838,67\t766,71\t632,64\t816,75\t826,19\t766,83\t892,17\t843,62\t766,4\t900,54\t815,58\t672,46\t729,61\t719,73\t641,7\t817,24\t766,3\t705,86\t855,8\t840,9\t785,03\t859,05\t906,28\t700,29\t789,74\t770,1\t694,94\t801,74\t815,03\t723,03\t834,25\t868,49\t777,14\t822,3\t888,17\t673,2\t817,04\t819,12\t585,04\t640,29\t650,23\t632,35\t653,48\t620,68\t651,35\t658,84\t695,88\t608,12\t660,94\t611,01\n" +
    "38,58\t609,33\t921,33\t734,31\t654,29\t748,84\t801,83\t699,67\t755,48\t776,61\t735,83\t766,88\t765,66\t738,1\t801,2\t935,1\t841,52\t851,5\t823,08\t725,86\t827,05\t834,7\t698,49\t729,32\t742,5\t738,98\t800,77\t771,67\t797,65\t878,93\t820,82\t717,5\t812,96\t806,63\t700,03\t758,22\t765,41\t740,61\t825,96\t817,81\t848,58\t868,23\t899,12\t756,18\t880,04\t909,9\t767,03\t847,32\t769,22\t642,03\t823,35\t847,58\t775,92\t897,39\t847,29\t779,54\t908\t842,63\t681,98\t738,39\t720,78\t652,27\t824,27\t766,4\t717,08\t862,32\t844\t798,55\t866,82\t911,98\t712\t797,8\t772,33\t706,47\t808,52\t819,8\t736,28\t842,18\t873,75\t791,43\t830,92\t891,4\t684,67\t826,88\t827,81\t587,65\t650,2\t661,54\t641,19\t665,16\t634,96\t666,43\t671,96\t708,19\t625,67\t672,51\t620,46\n" +
    "39,58\t614,71\t928,14\t735,36\t661,13\t752,83\t805,55\t707,92\t762,23\t780,64\t747,57\t768,77\t768,46\t741,82\t804,49\t939,51\t853,65\t854,28\t822,87\t735,26\t834,45\t837,25\t721,26\t734,79\t745,93\t756,64\t803,12\t777,87\t803,66\t876,24\t824,16\t754,51\t818,35\t810,12\t711,41\t764,63\t771,1\t743,47\t827,52\t820,93\t853,52\t872,72\t922,56\t770,13\t886,85\t912,81\t790,62\t853,83\t773,19\t647,51\t827,87\t856,98\t786,17\t900,29\t851,53\t791,03\t914,59\t838,79\t690,4\t742,42\t729,59\t659,5\t830,2\t789,78\t724,25\t867,57\t847,15\t809,9\t873,8\t913,65\t720,53\t803,14\t775,85\t718,47\t812,48\t824,66\t746,81\t847,66\t875,83\t803,34\t853,49\t896,11\t695,48\t833,67\t832,1\t596,18\t658,03\t675\t646,78\t674,33\t645,9\t675,21\t681,88\t723,62\t638,97\t681,61\t630,47\n" +
    "40,56\t620,09\t927,53\t733,68\t664,76\t755,09\t807,06\t717,58\t767,45\t783,09\t755,02\t762,62\t771\t748,24\t807,93\t944,58\t852,47\t863,05\t825,16\t743,14\t839\t838,92\t746,65\t730,38\t748,94\t768,71\t804,76\t782,78\t806,66\t875,7\t828,68\t763,52\t824,85\t812,36\t720,24\t773,57\t774,69\t747,13\t830,28\t824,9\t862,64\t874,98\t951,27\t776,7\t892,95\t915,71\t795,89\t859,05\t774,43\t652,84\t830,69\t873,33\t789,6\t901,42\t853,82\t804,05\t922,03\t825,35\t699,79\t746,09\t732,72\t666,34\t836,15\t799,25\t732,65\t872,31\t857,68\t819,35\t875,9\t917,32\t736,96\t808,94\t780,61\t726,09\t817,85\t826,53\t755,14\t850,47\t880,98\t812,37\t877,18\t898,77\t703,12\t836,75\t836,23\t598,06\t661,72\t682,22\t650,77\t679,05\t653,09\t688,31\t687,15\t730,58\t649,76\t692,32\t635,32\n" +
    "41,58\t621,88\t927,55\t730,08\t669,25\t755,68\t810,32\t724,04\t771,39\t789,87\t764,07\t768,26\t776,04\t749,29\t810,35\t932,94\t837,39\t864,54\t826,8\t752,04\t842,87\t855,68\t760,66\t732,05\t754,45\t769,87\t805,64\t787,75\t811,59\t885,17\t832,76\t758,95\t827,68\t816,44\t727,81\t784,26\t778,46\t750,14\t832,14\t827,29\t865,78\t876,3\t958,9\t784,58\t896,86\t916,84\t799,78\t864,57\t778,45\t658,46\t836,15\t871,19\t795,93\t903,85\t863,18\t815,94\t926,15\t818,46\t707,6\t751,42\t734,92\t674,01\t840,4\t804,42\t744,42\t877,11\t856,17\t830,57\t883,85\t920,79\t748,74\t812,85\t780,62\t733,89\t822,5\t829,88\t760,75\t860,15\t881,06\t821,85\t856,15\t901,57\t714,11\t823,72\t840,04\t601,33\t669,67\t690,07\t653,72\t683,04\t661,12\t693,99\t693,26\t739,18\t671,51\t699,03\t644,25\n" +
    "42,56\t628,53\t924,38\t731,01\t673,19\t758,82\t814,15\t730,64\t774,88\t790,98\t773,14\t770,82\t778,35\t754,74\t810,53\t923,38\t860,87\t862,69\t828,73\t764,08\t845,93\t870,85\t744,01\t732,38\t756,39\t754,36\t808,55\t791,35\t819,32\t883,41\t858,27\t758,33\t832,17\t819,56\t736,45\t790,78\t781,03\t756,1\t833,15\t827,91\t866,5\t883,72\t964,02\t793,5\t902,04\t920,01\t814,14\t868,5\t779,25\t663,22\t837,77\t891,13\t803,13\t908,86\t864,52\t817,78\t930,33\t813,01\t713,47\t753,72\t737,49\t680,8\t844,94\t808,69\t748,93\t879,86\t859,25\t839,04\t888,39\t923,7\t756,62\t815,27\t783,06\t738,81\t824,03\t833,31\t769,41\t861,19\t885,93\t831,15\t853,15\t903,28\t717,78\t829,62\t842,89\t604,21\t672,9\t695,93\t659,11\t691,25\t667,08\t702,33\t700,37\t747,89\t672,17\t705,29\t649,28\n" +
    "43,56\t635,11\t925,12\t735,28\t677,13\t760,98\t815,26\t739,56\t775,96\t793,66\t779,28\t783,87\t780,16\t758,79\t813,67\t922,85\t884,02\t867,08\t832,55\t771,29\t851,28\t849,17\t738,29\t741,73\t758\t763,56\t810\t794,47\t821,74\t883,12\t875,4\t762,75\t837,25\t821,65\t745,45\t799,97\t782,58\t760,88\t835,2\t829,73\t869,18\t913,14\t950,07\t802,31\t903,88\t923,5\t823,62\t870,39\t780,74\t667,77\t840,45\t884,28\t807,23\t912,21\t864\t824,06\t947,78\t815,12\t720,28\t756,63\t740,32\t686,4\t847,6\t796,94\t753,5\t884,05\t856,84\t845,03\t891,39\t924,88\t762,63\t818,46\t785,58\t747,91\t825,76\t835,17\t775,67\t862,02\t886,16\t835,75\t856,49\t904,76\t726,4\t800,27\t846,76\t608,03\t677,77\t702,96\t663,97\t699,25\t674,96\t708,86\t704,46\t754,02\t674,93\t712,36\t653,92\n" +
    "44,58\t634,88\t923,84\t739,5\t680,47\t761,54\t816,33\t741,85\t780,31\t797,63\t787,56\t791,75\t781,08\t761,43\t814,13\t946,47\t896,9\t867,45\t834,25\t775,9\t855,34\t864,69\t739,5\t749,18\t760,64\t780,65\t811,65\t799,49\t824,97\t883,71\t879,12\t766,42\t839,5\t831,73\t751,26\t802,37\t786,07\t762,63\t839,58\t833,16\t874\t915,98\t956,79\t808,38\t907,47\t922,74\t839,28\t875,81\t784,41\t671,46\t843,64\t883,58\t811,69\t910,88\t868\t831,54\t945,09\t812,94\t725,31\t760,86\t744,75\t691,86\t851,3\t800,82\t760,3\t887,2\t862,95\t851,56\t895,93\t925,88\t766,81\t822,88\t789,38\t753,87\t830,99\t836,28\t781,8\t864,84\t891,45\t845,4\t858,29\t916,3\t739,48\t795,46\t852,77\t611,44\t682,59\t708,08\t668,55\t702,22\t680,57\t715,57\t710,42\t760,69\t681,32\t718,66\t660,56\n";

    return ret;
}

