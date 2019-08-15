"use strict";

const API_URL = "dddd" //process.env.API_URL
const API_LINK = " fffff" //process.env.API_LINK

const submitButton = document.getElementById('btn-submit')
submitButton.addEventListener('click', loadInputFile)

const exampleButton = document.getElementById('btn-example')
exampleButton.addEventListener('click', showExample)

const compButton = document.getElementById('btn-apply-comp')
compButton.addEventListener('click', compResTable)

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
    updateKeyEl(newSett,"fluorDelColStart","modDelColStart");
    updateKeyEl(newSett,"fluorDelRowStart","modDelRowStart");
    updateKeyEl(newSett,"fluorDelOtherCol","modDelOtherCol");
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
    window.modifySettings["fluorDelOtherCol"] = parseInt(document.getElementById('modDelOtherCol').value);
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
        for (var r = minRowNr ; r < maxRowNr ; r++) {
            ftab[(r - minRowNr + 1)] = ["", "", "", "", "", ""];
            var minColNr = 0;
            if (window.modifySettings["fluorDelColStart"] > 0) {
                 minColNr = window.modifySettings["fluorDelColStart"];
            }
            var maxColNr = tab[r].length;
            if ((window.modifySettings["fluorDelColEnd"] > 1) &&
                (window.modifySettings["fluorDelColEnd"] < tab[r].length)) {
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
                    var resVal = tab[r][c].replace(/\./g, "");;
                    ftab[(r - minRowNr + 1)][realColNr] = resVal.replace(/,/g, ".");;
                } else {
                    ftab[(r - minRowNr + 1)][realColNr] = tab[r][c];
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
            var jumpStep = 1;
            if (window.modifySettings["fluorDelOtherCol"] > 0) {
                 jumpStep = window.modifySettings["fluorDelOtherCol"] + 1 ;
            }
            var realColNr = 5;
            for (var c = minColNr ; c < maxColNr ; c += jumpStep) {
                realColNr++;
                if (cycRowRe.test(tab[fRow][c])) {
                    var match = cycRowRe.exec(tab[fRow][c]);
                    if (window.modifySettings["fluorCommaDot"] == true) {
                        var colVal = match[1].replace(/\./g, "");;
                        ftab[0][realColNr] = Math.ceil(parseFloat(colVal.replace(/,/g, ".")));
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
            for (var r = minRowNr ; r < maxRowNr ; r++) {
                if (wellColRe.test(tab[r][wellCol])) {
                    var match = wellColRe.exec(tab[r][wellCol]);
                    ftab[(r - minRowNr + 1)][0] = match[1];
                } else {
                    ftab[(r - minRowNr + 1)][0] = "";
                }
            }
        }
        // Sample information
        if (window.modifySettings["exSamCol"] > 0) {
            var samColRe = new RegExp(window.modifySettings["exSamRegEx"]);
            var samCol = window.modifySettings["exSamCol"] - 1;
            for (var r = minRowNr ; r < maxRowNr ; r++) {
                if (samColRe.test(tab[r][samCol])) {
                    var match = samColRe.exec(tab[r][samCol]);
                    ftab[(r - minRowNr + 1)][1] = match[1];
                } else {
                    ftab[(r - minRowNr + 1)][1] = "";
                }
            }
        }
        // Sample Type information
        if (window.modifySettings["exSamTypeCol"] > 0) {
            var samTypeColRe = new RegExp(window.modifySettings["exSamTypeRegEx"]);
            var samTypeCol = window.modifySettings["exSamTypeCol"] - 1;
            for (var r = minRowNr ; r < maxRowNr ; r++) {
                if (samTypeColRe.test(tab[r][samTypeCol])) {
                    var match = samTypeColRe.exec(tab[r][samTypeCol]);
                    ftab[(r - minRowNr + 1)][2] = match[1];
                } else {
                    ftab[(r - minRowNr + 1)][2] = "";
                }
            }
        }

        // Target information
        if (window.modifySettings["exTarCol"] > 0) {
            var tarColRe = new RegExp(window.modifySettings["exTarRegEx"]);
            var tarCol = window.modifySettings["exTarCol"] - 1;
            for (var r = minRowNr ; r < maxRowNr ; r++) {
                if (tarColRe.test(tab[r][tarCol])) {
                    var match = tarColRe.exec(tab[r][tarCol]);
                    ftab[(r - minRowNr + 1)][3] = match[1];
                } else {
                    ftab[(r - minRowNr + 1)][3] = "";
                }
            }
        }
        // Target Type information
        if (window.modifySettings["exTarTypeCol"] > 0) {
            var tarTypeColRe = new RegExp(window.modifySettings["exTarTypeRegEx"]);
            var tarTypeCol = window.modifySettings["exTarTypeCol"] - 1;
            for (var r = minRowNr ; r < maxRowNr ; r++) {
                if (tarTypeColRe.test(tab[r][tarTypeCol])) {
                    var match = tarTypeColRe.exec(tab[r][tarTypeCol]);
                    ftab[(r - minRowNr + 1)][4] = match[1];
                } else {
                    ftab[(r - minRowNr + 1)][4] = "";
                }
            }
        }
        // Dye information
        if (window.modifySettings["exDyeCol"] > 0) {
            var dyeColRe = new RegExp(window.modifySettings["exDyeRegEx"]);
            var dyeCol = window.modifySettings["exDyeCol"] - 1;
            for (var r = minRowNr ; r < maxRowNr ; r++) {
                if (dyeColRe.test(tab[r][dyeCol])) {
                    var match = dyeColRe.exec(tab[r][dyeCol]);
                    ftab[(r - minRowNr + 1)][5] = match[1];
                } else {
                    ftab[(r - minRowNr + 1)][5] = "";
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
                var resVal = tab[r][fluorCol].replace(/\./g, "");;
                ftab[wellLookUp[wellVal]][cycLookUp[cycVal]] = resVal.replace(/,/g, ".");
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
    if (modSel == "2") {
        repText = document.getElementById('inCompSamType').value;
    }
    if (modSel == "4") {
        repText = document.getElementById('inCompTarType').value;
    }
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

function getSettingsArr() {
    var ret = [{
               "settingsID":"Applied Biosystems SDS v2.4",
               "reformatTableShape":"keep",
               "fluorDelColStart":3,
               "fluorDelRowStart":2,
               "fluorDelOtherCol":0,
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
               "fluorDelOtherCol":0,
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
               "fluorDelOtherCol":0,
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
               "fluorDelOtherCol":0,
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
               "exSamCol":2,
               "exSamRegEx":"^[A-Za-z]+[0-9]+ (.*)",
               "exSamTypeCol":null,
               "exSamTypeRegEx":"(.*)",
               "exTarCol":null,"exTarRegEx":"(.*)",
               "exTarTypeCol":null,
               "exTarTypeRegEx":"(.*)",
               "exDyeCol":null,
               "exDyeRegEx":"(.*)"
               },{
               "settingsID":"Eppendorf Realplex",
               "reformatTableShape":"keep",
               "fluorDelColStart":6,
               "fluorDelRowStart":4,
               "fluorDelOtherCol":0,
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
               "fluorDelOtherCol":0,
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
               "fluorDelOtherCol":0,
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
               "fluorDelOtherCol":0,
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
               "settingsID":"Roche LC96",
               "reformatTableShape":"keep",
               "fluorDelColStart":1,
               "fluorDelRowStart":1,
               "fluorDelOtherCol":0,
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
               "settingsID":"Roche LightCycler480",
               "reformatTableShape":"keep",
               "fluorDelColStart":2,
               "fluorDelRowStart":1,
               "fluorDelOtherCol":0,
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
               "settingsID":"Rotorgene",
               "reformatTableShape":"keep",
               "fluorDelColStart":6,
               "fluorDelRowStart":4,
               "fluorDelOtherCol":0,
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
               }
              ];
    return ret;
}
