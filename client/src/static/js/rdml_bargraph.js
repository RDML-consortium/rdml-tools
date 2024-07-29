"use strict";

var jquery = require("jquery");
window.$ = window.jQuery = jquery; // notice the definition of global variables here

const API_URL = process.env.API_URL
const API_LINK = process.env.API_LINK

const submitButton = document.getElementById('btn-submit')
submitButton.addEventListener('click', loadInputFile)

const exampleButton = document.getElementById('btn-example')
exampleButton.addEventListener('click', showExample)

const saveDataButton = document.getElementById('btn-data-save')
saveDataButton.addEventListener('click', saveDataTable)

const clearDataButton = document.getElementById('btn-data-clear')
clearDataButton.addEventListener('click', clearDataTable)

const saveMeanButton = document.getElementById('btn-mean-save')
saveMeanButton.addEventListener('click', saveMeanTable)

const inputFile = document.getElementById('inputFile')
const resultInfo = document.getElementById('result-info')
const resultError = document.getElementById('result-error')
const svgImage = document.getElementById('svg-image-data')

const inputTableView = document.getElementById('import-table-view')
const tableDataPoints = document.getElementById('table-data-points')
const tableCombinedData = document.getElementById('table-combined-data')


const reshapeTableView = document.getElementById('reshape-table-view')
const exportTableView = document.getElementById('export-table-view')

const saveJsonButton = document.getElementById('btn-save-Json')
saveJsonButton.addEventListener('click', saveJsonFile)
const saveSvgButton = document.getElementById('btn-save-svg')
saveSvgButton.addEventListener('click', saveSVGFile)
const loadJFile = document.getElementById('inputJsonFile')
loadJFile.addEventListener('change', loadJsonFile, false);


// Global data
window.inputFile = "";
window.inputFileName = "";
window.inputSeparator = "\t";
window.inputReplaceComma = true;
window.inputReplaceSemicolon = true;
window.inputTabStr = "";
window.inputTabFix = [];
window.selA = [];
window.selB = [];
window.sortData = {};
window.sortPara = {};
window.averTabStr = "";
window.samColorLookup = {};

window.resultTab = [];

window.xPosOrder = [];
window.xGroupCenter = [];
window.xPosLookUp = {};

window.svgDimXStart = 0.0;
window.svgDimXEnd = 9.0 * 96.0;
window.svgDimYStart = 0.0;
window.svgDimYEnd = 6.0 * 96.0;

window.modifySettings = {};
window.modifySettings["YAxLinLog"] = "lin";
window.modifySettings["YAxMaxVal"] = "";
window.modifySettings["YAxMinVal"] = "";
window.modifySettings["YPlAxisStroke"] = "2.0";
window.modifySettings["YPlTickStroke"] = "2.0";
window.modifySettings["YPlTickLength"] = "7.0";
window.modifySettings["YPlTextSpace"] = "6.0";
window.modifySettings["YPlTextSize"] = "10.0";
window.modifySettings["YPlTextType"] = "Arial";
window.modifySettings["YPlDescText"] = "";
window.modifySettings["YPlDescSpace"] = "12.0";
window.modifySettings["YPlDescSize"] = "14.0";
window.modifySettings["YPlDescType"] = "Arial";

window.modifySettings["XAxEmptySpace"] = "y";
window.modifySettings["XAxGapBar"] = "0.5";
window.modifySettings["XAxGapGrp"] = "0.25";
window.modifySettings["XPlAxisStroke"] = "2.0";
window.modifySettings["XPlTickStroke"] = "2.0";
window.modifySettings["XPlTickLength"] = "7.0";
window.modifySettings["XPlAxisOrientation"] = "-90";
window.modifySettings["XPlTextSpace"] = "6.0";
window.modifySettings["XPlTextSize"] = "10.0";
window.modifySettings["XPlTextType"] = "Arial";
window.modifySettings["XPlLineSpace"] = "12.0";
window.modifySettings["XPlLineStroke"] = "2.0";
window.modifySettings["XPlLineDelta"] = "0.0";
window.modifySettings["XPlAxisOrientation2"] = "0";
window.modifySettings["XPlTextSpace2"] = "12.0";
window.modifySettings["XPlTextSize2"] = "10.0";
window.modifySettings["XPlTextType2"] = "Arial";

window.modifySettings["BoxLineStroke"] = "1.0";
window.modifySettings["MedianLineStroke"] = "2.0";

window.modifySettings["ErrShowIt"] = "y";
window.modifySettings["ErrShape"] = "both";
window.modifySettings["ErrTickStroke"] = "1.5";
window.modifySettings["ErrTickLength"] = "6.0";

window.modifySettings["DotShowIt"] = "y";
window.modifySettings["DotPlacingMethod"] = "comp-asc";
window.modifySettings["DotSize"] = "2.0";
window.modifySettings["DotLineWidth"] = "0.5";
window.modifySettings["DotColor"] = "#FFFFFF";

window.modifySettings["GraphHeight"] = "6.0";
window.modifySettings["GraphWidth"] = "9.0";
window.modifySettings["GraphCmInch"] = "cm";
window.modifySettings["GraphTitlText"] = "";
window.modifySettings["GraphTitlSpace"] = "18.0";
window.modifySettings["GraphTitlSize"] = "24.0";
window.modifySettings["GraphTitlType"] = "Arial";


document.addEventListener("DOMContentLoaded", function() {
    loadModification(window.modifySettings);
    checkForUUID();
});

function checkForUUID() {
    var uuid = ""

    var path = (window.location.search + "").replace(/^\?/, "") // .pathname decodeURIComponent(;
    path = path.replace(/&/g, ";")
    var allPairs = path.split(";")
    for (var i = 0 ; i < allPairs.length ; i++) {
        var pair = allPairs[i].split("=")
        var pKey = decodeURIComponent(pair[0])
        var pVal = ""
        if (pair.length > 1) {
            pVal = decodeURIComponent(pair[1])
        }
        if (pKey == "UUID") {
            uuid = pVal
        }
    }
    const formData = new FormData()
    formData.append('uuid', uuid)

    hideElement(resultError)
    showElement(resultInfo)
    window.errorMessage = "";

    axios
        .post(`${API_URL}/bargraph`, formData)
        .then(res => {
	        if (res.status === 200) {
                window.uuid = res.data.data.uuid
                var tsvData = res.data.data.relativetsv
                if (tsvData != "") {
                    window.inputFileName = "relative_analysis"
                    window.inputFile = tsvData;
                    updateSepCount(window.inputFile);

                    $('[href="#save-tab"]').tab('show');
                }
            }
            hideElement(resultInfo)
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
            window.errorMessage += " " + errorMessage
            var err = '<i class="fas fa-fire"></i>\n<span id="error-message">'
            err += window.errorMessage + '</span>'
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

function errorTxt(mess) {
    showElement(resultError)
    resultError.innerHTML = '<i class="fas fa-fire"></i>\n<span id="error-message">' + mess + '</span>'
}

function showExample() {
    window.inputFileName = "example"
    window.inputFile = getSampleStr();
    updateSepCount(window.inputFile);

    $('[href="#save-tab"]').tab('show');
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

    $('[href="#save-tab"]').tab('show');
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

window.updateSemicolonManual = updateSemicolonManual;
function updateSemicolonManual() {
    window.inputReplaceSemicolon = document.getElementById("modSemicolonTab").checked;
}


window.importTable = importTable;
function importTable() {
    processTable(window.inputFile, window.inputSeparator);
}

window.readHtmlRawData = readHtmlRawData;
function readHtmlRawData() {
    var dataIn = getSaveHtmlData("table-data-points")
    if (window.inputReplaceSemicolon) {
        dataIn = dataIn.replace(/;/g, "\t");
    }
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
        var a_0 = rawLine[0].replace(/\t/g, " ");
        var a_1 = rawLine[1].replace(/\t/g, " ");
        for (var k = 2 ; k < rawLine.length ; k++ ){
            var rawVals = rawLine[k];
            if (rawLine[k] == "") {
                continue;
            }
            rawVals = rawVals.replace(/[^0-9\.,;-]/g, "");
            rawVals = rawVals.replace(/^;/, "");
            rawVals = rawVals.replace(/;$/, "");
            if (window.inputReplaceComma) {
                rawVals = rawVals.replace(/,/g, ".")
            } else {
                rawVals = rawVals.replace(/,/g, "")
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
    inputTableView.innerHTML = drawHtmlTable(window.inputTabFix);
    selectDataCombiMeth();
}

window.clearDataTable = clearDataTable;
function clearDataTable() {
    var ele = document.getElementById("table-data-points");
    ele.innerHTML = "";
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
        var complete = true;
        for (var k = 0 ; k < tab[i].length ; k++) {
            retVal += "<td>" + tab[i][k] + "</td>\n"
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

function cMedianQuart(array) {
  if (!array || array.length === 0) {
      return Number.Nan;
  }
  var cArr = JSON.parse(JSON.stringify(array));
  cArr.sort(function(a,b) { return a - b;});
  const n = cArr.length;
  var max = cArr[n - 1];
  var min = cArr[0];
  var median = cMedian(cArr);
  var lowQuart = null;
  var highQuart = null;
  
  if (n % 2 == 0) {
    var cent = n / 2;
    if (n > 4.0) {
      lowQuart = cMedian(cArr.slice(0, cent));
      highQuart = cMedian(cArr.slice(cent, n));  
    }
  } else {
    var cent = (n - 1)/ 2;
    if (n > 4.0) {
      lowQuart = cMedian(cArr.slice(0, cent));
      highQuart = cMedian(cArr.slice(cent + 1, n));
    }
  }
  return [min, lowQuart, median, highQuart, max];
}

function cMedian(array) {
  // Works on sorted array!
  if (!array || array.length === 0) {
    return Number.Nan;
  }
  const n = array.length;
  if (n % 2 == 0) {
    var cent = (n / 2) - 1;
    return (array[cent] + array[cent + 1]) / 2.0;
  } else {
    var cent = (n - 1)/ 2;
    return array[cent];
  }
}
  
function cMean(array) {
  if (!array || array.length === 0) {
      return Number.Nan;
  }
  const n = array.length;
  return array.reduce((a, b) => a + b) / n;
}

function cSd (array) {
  if (!array || array.length === 0) {
      return Number.Nan;
  }
  const n = array.length;
  const mean = array.reduce((a, b) => a + b) / n;
  return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / (n - 1));
}

function cSEM (array) {
  if (!array || array.length === 0) {
      return Number.Nan;
  }
  const n = array.length;
  const mean = array.reduce((a, b) => a + b) / n;
  const sd = Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / (n - 1));
  return sd /  Math.sqrt(n);
}

window.selectDataCombiMeth = selectDataCombiMeth;
function selectDataCombiMeth(){
    window.sortData = {};
    window.sortPara = {};
    window.sortPara["yRawMin"] = Number.POSITIVE_INFINITY;
    window.sortPara["yRawPosMin"] = Number.POSITIVE_INFINITY;
    window.sortPara["yRawMax"] = Number.NEGATIVE_INFINITY;
    window.sortPara["yMin"] = Number.POSITIVE_INFINITY;
    window.sortPara["yPosMin"] = Number.POSITIVE_INFINITY;
    window.sortPara["yMax"] = Number.NEGATIVE_INFINITY;
    var selMethod = document.getElementById('selDataCombiMeth').value;
    window.selA = getUniqueCol(window.inputTabFix, 0);
    var srtEleA = document.getElementById("modSamFirstOrder");
    var outSrtStrA = "";
    for (var i = 0 ; i < window.selA.length ; i++) {
        outSrtStrA += window.selA[i] + "\t";
    }
    srtEleA.value = outSrtStrA.replace(/\t$/, "");
    if (window.selA.length == 0) {
        alert("Data must have labels")
        return
    }
    window.selB = getUniqueCol(window.inputTabFix, 1);
    var srtEleB = document.getElementById("modSamSecondOrder");
    var outSrtStrB = "";
    for (var i = 0 ; i < window.selB.length ; i++) {
        outSrtStrB += window.selB[i] + "\t";
    }
    srtEleB.value = outSrtStrB.replace(/\t$/, "");

    // Create the html to select the colors of the boxes
    var colorEle = document.getElementById("sample-color-sel");
    var colorHtml = '<table style="width:100%;">\n';
    if (window.selB.length != 0) {
        for (var i = 0 ; i < window.selB.length ; i++) {
            colorHtml += '<tr>\n';
            colorHtml += '<td style="width:25%;">' + window.selB[i] + ' Color:</td>\n';
            colorHtml += '<td style="width:75%">\n';
            colorHtml += '<input type="color" id="uniqueSamID_' + i +'" onchange="colorSam(\'';
            colorHtml +=  window.selB[i] + '\', \'uniqueSamID_' + i + '\')" value="#0000FF">\n';
            colorHtml += '</td>\n</tr>\n';
        }
    } else {
        for (var i = 0 ; i < window.selA.length ; i++) {
            colorHtml += '<tr>\n';
            colorHtml += '<td style="width:25%;">' + window.selA[i] + ' Color:</td>\n';
            colorHtml += '<td style="width:75%">\n';
            colorHtml += '<input type="color" id="uniqueSamID_' + i +'" onchange="colorSam(\'';
            colorHtml +=  window.selA[i] + '\', \'uniqueSamID_' + i + '\')" value="#0000FF">\n';
            colorHtml += '</td>\n</tr>\n';
        }
    }
    colorHtml += "</table>\n";
    colorEle.innerHTML = colorHtml;

    // Collect all datapoints in their respective groups
    //     and collect min, positive min and max
    for (var i = 0 ; i < window.inputTabFix.length ; i++) {
        if (window.inputTabFix[i].length != 3) {
            continue;
        }
        var elA = window.inputTabFix[i][0];
        var elB = window.inputTabFix[i][1];

        if (!(elA in window.sortData)) {
            window.sortData[elA] = {};
        }
        if (window.selB.length != 0) {
            if (!(elB in window.sortData[elA])) {
                window.sortData[elA][elB] = {};
            }
            if (!("dp" in window.sortData[elA][elB])) {
                window.sortData[elA][elB]["dp"] = [];
            }
            var currVal = parseFloat(window.inputTabFix[i][2]);
            if (currVal < window.sortPara["yRawMin"]) {
                window.sortPara["yRawMin"] = currVal
            }
            if ((currVal < window.sortPara["yRawPosMin"]) &&
                (currVal > 0.0)) {
                window.sortPara["yRawPosMin"] = currVal
            }
            if (currVal > window.sortPara["yRawMax"]) {
                window.sortPara["yRawMax"] = currVal
            }
            window.sortData[elA][elB]["dp"].push(currVal);
        } else {
            if (!("dp" in window.sortData[elA])) {
                window.sortData[elA]["dp"] = [];
            }
            var currVal = parseFloat(window.inputTabFix[i][2]);
            if (currVal < window.sortPara["yRawMin"]) {
                window.sortPara["yRawMin"] = currVal
            }
            if ((currVal < window.sortPara["yRawPosMin"]) &&
                (currVal > 0.0)) {
                window.sortPara["yRawPosMin"] = currVal
            }
            if (currVal > window.sortPara["yRawMax"]) {
                window.sortPara["yRawMax"] = currVal
            }
            window.sortData[elA]["dp"].push(currVal);
        }
    }

    // Calculate the requested statistics
    //     and update min, positive min and max
    for (var i = 0 ; i < window.selA.length ; i++) {
        var ccMean = Number.Nan;
        var ccErrMin = Number.Nan;
        var ccErrMax = Number.Nan;
        if (window.selB.length != 0) {
            for (var j = 0 ; j < window.selB.length ; j++) {
                if (!(window.selB[j] in window.sortData[window.selA[i]])) {
                    continue;
                }
                if (!("dp" in window.sortData[window.selA[i]][window.selB[j]])) {
                    continue;
                }
                if (window.sortData[window.selA[i]][window.selB[j]]["dp"].length == 0) {
                    continue;
                }
                if (selMethod == "mean_quart") {
                    var resArr = cMedianQuart(window.sortData[window.selA[i]][window.selB[j]]["dp"])
                    // [0 min, 1 lowQuart, 2 median, 3 highQuart, 4 max]
                    ccErrMin = cSEM(window.sortData[window.selA[i]][window.selB[j]]["dp"])
                    ccErrMax = ccErrMin
                    window.sortData[window.selA[i]][window.selB[j]]["aver"] = resArr[2]
                    window.sortData[window.selA[i]][window.selB[j]]["min"] = resArr[0]
                    window.sortData[window.selA[i]][window.selB[j]]["max"] = resArr[4]
                    window.sortData[window.selA[i]][window.selB[j]]["quart_low"] = resArr[1]
                    window.sortData[window.selA[i]][window.selB[j]]["quart_high"] = resArr[3]
                } else if (selMethod == "mean_sem") {
                    ccMean = cMean(window.sortData[window.selA[i]][window.selB[j]]["dp"])
                    ccErrMin = cSEM(window.sortData[window.selA[i]][window.selB[j]]["dp"])
                    ccErrMax = ccErrMin
                    window.sortData[window.selA[i]][window.selB[j]]["aver"] = ccMean
                    window.sortData[window.selA[i]][window.selB[j]]["err_min"] = ccErrMin
                    window.sortData[window.selA[i]][window.selB[j]]["err_max"] = ccErrMax
                } else if (selMethod == "mean_sd") {
                    ccMean = cMean(window.sortData[window.selA[i]][window.selB[j]]["dp"])
                    ccErrMin = cSd(window.sortData[window.selA[i]][window.selB[j]]["dp"])
                    ccErrMax = ccErrMin
                    window.sortData[window.selA[i]][window.selB[j]]["aver"] = ccMean
                    window.sortData[window.selA[i]][window.selB[j]]["err_min"] = ccErrMin
                    window.sortData[window.selA[i]][window.selB[j]]["err_max"] = ccErrMax
                }

                // Update min, pos min and max
                if ((isFinite(window.sortData[window.selA[i]][window.selB[j]]["min"])) &&
                    (window.sortData[window.selA[i]][window.selB[j]]["min"] < window.sortPara["yMin"])) {
                    window.sortPara["yMin"] = window.sortData[window.selA[i]][window.selB[j]]["min"];
                }
                if ((isFinite(window.sortData[window.selA[i]][window.selB[j]]["min"])) &&
                    (window.sortData[window.selA[i]][window.selB[j]]["min"] < window.sortPara["yPosMin"]) &&
                    (window.sortData[window.selA[i]][window.selB[j]]["min"] > 0.0)) {
                    window.sortPara["yPosMin"] = window.sortData[window.selA[i]][window.selB[j]]["min"];
                }
                if ((isFinite(ccMean)) &&
                    (isFinite(ccErrMin)) &&
                    (ccMean - ccErrMin < window.sortPara["yMin"])) {
                    window.sortPara["yMin"] = ccMean - ccErrMin;
                }
                if ((isFinite(ccMean)) &&
                    (isFinite(ccErrMin)) &&
                    (ccMean - ccErrMin < window.sortPara["yPosMin"]) &&
                    (ccMean - ccErrMin > 0.0)) {
                    window.sortPara["yPosMin"] = ccMean - ccErrMin;
                }
                if ((isFinite(ccMean)) &&
                    (isFinite(ccErrMax)) &&
                    (ccMean + ccErrMax > window.sortPara["yMax"])) {
                    window.sortPara["yMax"] = ccMean + ccErrMax;
                }
            }
        } else {
            if (!("dp" in window.sortData[window.selA[i]])) {
                continue;
            }
            if (window.sortData[window.selA[i]]["dp"].length == 0) {
                continue;
            }
            if (selMethod == "mean_quart") {
                var resArr = cMedianQuart(window.sortData[window.selA[i]]["dp"])
                // [0 min, 1 lowQuart, 2 median, 3 highQuart, 4 max]
                ccErrMin = cSEM(window.sortData[window.selA[i]]["dp"])
                ccErrMax = ccErrMin
                window.sortData[window.selA[i]]["aver"] = resArr[2]
                window.sortData[window.selA[i]]["min"] = resArr[0]
                window.sortData[window.selA[i]]["max"] = resArr[4]
                window.sortData[window.selA[i]]["quart_low"] = resArr[1]
                window.sortData[window.selA[i]]["quart_high"] = resArr[3]
            } else if (selMethod == "mean_sem") {
                ccMean = cMean(window.sortData[window.selA[i]]["dp"])
                ccErrMin = cSEM(window.sortData[window.selA[i]]["dp"])
                ccErrMax = ccErrMin
                window.sortData[window.selA[i]]["aver"] = ccMean
                window.sortData[window.selA[i]]["err_min"] = ccErrMin
                window.sortData[window.selA[i]]["err_max"] = ccErrMax
            } else if (selMethod == "mean_sd") {
                ccMean = cMean(window.sortData[window.selA[i]]["dp"])
                ccErrMin = cSd(window.sortData[window.selA[i]]["dp"])
                ccErrMax = ccErrMin
                window.sortData[window.selA[i]]["aver"] = ccMean
                window.sortData[window.selA[i]]["err_min"] = ccErrMin
                window.sortData[window.selA[i]]["err_max"] = ccErrMax
            }



            if ((isFinite(window.sortData[window.selA[i]]["min"])) &&
                (window.sortData[window.selA[i]]["min"] < window.sortPara["yMin"])) {
                window.sortPara["yMin"] = window.sortData[window.selA[i]]["min"];
            }
            if ((isFinite(window.sortData[window.selA[i]]["min"])) &&
                (window.sortData[window.selA[i]]["min"] < window.sortPara["yPosMin"]) &&
                (window.sortData[window.selA[i]]["min"] > 0.0)) {
                window.sortPara["yPosMin"] = window.sortData[window.selA[i]]["min"];
            }
            if ((isFinite(ccMean)) &&
                (isFinite(ccErrMin)) &&
                (ccMean - ccErrMin < window.sortPara["yMin"])) {
                window.sortPara["yMin"] = ccMean - ccErrMin;
            }
            if ((isFinite(ccMean)) &&
                (isFinite(ccErrMin)) &&
                (ccMean - ccErrMin < window.sortPara["yPosMin"]) &&
                (ccMean - ccErrMin > 0.0)) {
                window.sortPara["yPosMin"] = ccMean - ccErrMin;
            }
            if ((isFinite(ccMean)) &&
                (isFinite(ccErrMax)) &&
                (ccMean + ccErrMax > window.sortPara["yMax"])) {
                window.sortPara["yMax"] = ccMean + ccErrMax;
            }
        }
    }
    if (window.sortPara["yMin"] > window.sortPara["yRawMin"]) {
        window.sortPara["yMin"] = window.sortPara["yRawMin"];
    }
    if (window.sortPara["yPosMin"] > window.sortPara["yRawPosMin"]) {
        window.sortPara["yPosMin"] = window.sortPara["yRawPosMin"];
    }
    if (window.sortPara["yMax"] < window.sortPara["yRawMax"]) {
        window.sortPara["yMax"] = window.sortPara["yRawMax"];
    }

    // Create the results table
    window.averTabStr = "";
    for (var i = 0 ; i < window.selA.length ; i++) {
        if (window.selB.length != 0) {
            for (var j = 0 ; j < window.selB.length ; j++) {
                window.averTabStr += window.selA[i] + "\t" + window.selB[j] + "\t";
                if (!(window.selB[j] in window.sortData[window.selA[i]])) {
                    continue;
                }
                if ("aver" in window.sortData[window.selA[i]][window.selB[j]]) {
                    window.averTabStr += window.sortData[window.selA[i]][window.selB[j]]["aver"];
                }
                window.averTabStr += "\t"
                if (selMethod == "mean_quart") {
                    if ("aver" in window.sortData[window.selA[i]][window.selB[j]]) {
                        window.averTabStr += window.sortData[window.selA[i]][window.selB[j]]["min"];
                    }
                    window.averTabStr += "\t"
                    if ("aver" in window.sortData[window.selA[i]][window.selB[j]]) {
                        window.averTabStr += window.sortData[window.selA[i]][window.selB[j]]["quart_low"];
                    }
                    window.averTabStr += "\t"
                    if ("aver" in window.sortData[window.selA[i]][window.selB[j]]) {
                        window.averTabStr += window.sortData[window.selA[i]][window.selB[j]]["quart_high"];
                    }
                    window.averTabStr += "\t"
                    if ("aver" in window.sortData[window.selA[i]][window.selB[j]]) {
                        window.averTabStr += window.sortData[window.selA[i]][window.selB[j]]["max"];
                    }
                } else {
                    if ("aver" in window.sortData[window.selA[i]][window.selB[j]]) {
                        window.averTabStr += window.sortData[window.selA[i]][window.selB[j]]["err_min"];
                    }
                    window.averTabStr += "\t"
                    if ("aver" in window.sortData[window.selA[i]][window.selB[j]]) {
                        window.averTabStr += window.sortData[window.selA[i]][window.selB[j]]["err_max"];
                    }
                }
                window.averTabStr += "\n"
            }
        } else {
            window.averTabStr += window.selA[i] + "\t\t";
            if ("aver" in window.sortData[window.selA[i]]) {
                window.averTabStr += window.sortData[window.selA[i]]["aver"];
            }
            window.averTabStr += "\t"
            if (selMethod == "mean_quart") {
                if ("aver" in window.sortData[window.selA[i]]) {
                    window.averTabStr += window.sortData[window.selA[i]]["min"];
                }
                window.averTabStr += "\t"
                if ("aver" in window.sortData[window.selA[i]]) {
                    window.averTabStr += window.sortData[window.selA[i]]["quart_low"];
                }
                window.averTabStr += "\t"
                if ("aver" in window.sortData[window.selA[i]]) {
                    window.averTabStr += window.sortData[window.selA[i]]["quart_high"];
                }
                window.averTabStr += "\t"
                if ("aver" in window.sortData[window.selA[i]]) {
                    window.averTabStr += window.sortData[window.selA[i]]["max"];
                }
            } else {
                if ("aver" in window.sortData[window.selA[i]]) {
                    window.averTabStr += window.sortData[window.selA[i]]["err_min"];
                }
                window.averTabStr += "\t"
                if ("aver" in window.sortData[window.selA[i]]) {
                    window.averTabStr += window.sortData[window.selA[i]]["err_max"];
                }
            }
            window.averTabStr += "\n"
        }
    }
    tableCombinedData.innerHTML = window.averTabStr;
    showSVG();
}

window.updateSam = updateSam;
function updateSam(id) {
    var str = document.getElementById(id).value;
    if (window.inputReplaceSemicolon) {
        str = str.replace(/;/g, "\t");
        document.getElementById(id).value = str;
    }
    var rawLine = str.split("\t");
    var collect = [];
    for (var i = 0 ; i < rawLine.length ; i++) {
        if (rawLine[i] != "") {
            collect.push(rawLine[i]);
        }
    }
    if (id == "modSamFirstOrder") {
        window.selA = collect;
    } else {
        window.selB = collect;
    }
    showSVG();
}

window.colorSam = colorSam;
function colorSam(sam, id) {
    var col = document.getElementById(id).value;
    window.samColorLookup[sam] = col;
    showSVG();
}

window.showSVG = showSVG;
function showSVG() {
    var retVal = createSVG();
    if (0) {
    var regEx1 = /</g;
    retVal = retVal.replace(regEx1, "%3C");
    var regEx2 = />/g;
    retVal = retVal.replace(regEx2, "%3E");
    var regEx3 = /#/g;
    retVal = retVal.replace(regEx3, "%23");
    retVal = '<img src="data:image/svg+xml,' + retVal + '" alt="Digest-SVG" width="900px">';
    }
    svgImage.innerHTML = retVal;
}

function createSVG() {
    setStartStop();
    var retVal = "";
    retVal += createBoxes();
    if (window.modifySettings["DotShowIt"] == "y") {
        retVal += createDots();
    }
    if (window.modifySettings["ErrShowIt"] == "y") {
        retVal += createErrorBars();
    }
    retVal += createCoordinates();
    retVal += "</svg>";

    window.svgDimXStart -= 20;
    window.svgDimYStart -= 20;
    window.svgDimXEnd += 20;
    window.svgDimYEnd += 20;
    var svgWith = window.svgDimXEnd - window.svgDimXStart;
    var svgHight = window.svgDimYEnd - window.svgDimYStart;
    var head = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='" + window.svgDimXStart + " "
    head += window.svgDimYStart + " " + svgWith + " " + svgHight + "' width='900px'>";
    return head + retVal;
}

function setStartStop() {
    if (window.modifySettings["GraphCmInch"] == "cm") {
        window.frameXend = parseFloat(window.modifySettings["GraphWidth"]) * 37.795275591;
        window.frameYend = parseFloat(window.modifySettings["GraphHeight"]) * 37.795275591;
    } else {
        window.frameXend = parseFloat(window.modifySettings["GraphWidth"]) * 96.0;
        window.frameYend = parseFloat(window.modifySettings["GraphHeight"]) * 96.0;
    }

    window.svgDimXStart = 0.0;
    window.svgDimYStart = 0.0;
    window.svgDimXEnd = window.frameXend;
    window.svgDimYEnd = window.frameYend;

    window.winYmax = window.sortPara["yMax"]
    if (window.modifySettings["YAxLinLog"] == "lin") {
        window.winYmin = window.sortPara["yMin"];
    } else {
        window.winYmin = window.sortPara["yPosMin"];
    }
    if (window.modifySettings["YAxMaxVal"] != "") {
        window.winYmax = parseFloat(window.modifySettings["YAxMaxVal"]);
    }
    if (window.modifySettings["YAxMinVal"] != "") {
        var tWinYmin = parseFloat(window.modifySettings["YAxMinVal"]);
        if ((window.modifySettings["YAxLinLog"] == "lin") || (tWinYmin > 0.0)) {
            window.winYmin = tWinYmin;
        }
    }

    window.xPosOrder = [];
    window.xGroupCenter = [];
    window.xPosLookUp = {};
    window.xGroupLookUp = {};
    var addGapBar = parseFloat(window.modifySettings["XAxGapBar"]);
    var addGapGrp = parseFloat(window.modifySettings["XAxGapGrp"]);
    var barCount = 0;
    var grpCount = 0;
    if (window.selB.length != 0) {
        grpCount = -1;
    }
    for (var i = 0 ; i < window.selA.length ; i++) {
        if (window.selB.length != 0) {
            for (var j = 0 ; j < window.selB.length ; j++) {
                if ((window.selB[j] in window.sortData[window.selA[i]]) &&
                    (isFinite(window.sortData[window.selA[i]][window.selB[j]]["aver"]))) {
                    barCount += 1;
                } else {
                    if (window.modifySettings["XAxEmptySpace"] == "y") {
                        barCount += 1;
                    }
                }
            }
            grpCount += 1;
        } else {
            if (isFinite(window.sortData[window.selA[i]]["aver"])) {
                barCount += 1;
            }
        }
    }
    var totalSize = barCount * (1.0 + addGapBar) + grpCount * addGapGrp + addGapBar;
    window.xPosBarWidth = 0.5 * window.frameXend / totalSize;
    barCount = 0;
    grpCount = 0;
    var grpLast = 0;
    for (var i = 0 ; i < window.selA.length ; i++) {
        if (window.selB.length != 0) {
            for (var j = 0 ; j < window.selB.length ; j++) {
                if ((window.selB[j] in window.sortData[window.selA[i]]) &&
                    (isFinite(window.sortData[window.selA[i]][window.selB[j]]["aver"]))) {
                    barCount += 1;
                    var curPos = (barCount * (1.0 + addGapBar) - 0.5 + grpCount * addGapGrp) * window.frameXend / totalSize;
                    window.xPosOrder.push(curPos);
                    if (!(window.selA[i] in window.xPosLookUp)) {
                        window.xPosLookUp[window.selA[i]] = {};
                    }
                    window.xPosLookUp[window.selA[i]][window.selB[j]] = curPos;
                } else {
                    if (window.modifySettings["XAxEmptySpace"] == "y") {
                        barCount += 1;
                        var curPos = (barCount * (1.0 + addGapBar) - 0.5 + grpCount * addGapGrp) * window.frameXend / totalSize;
                        window.xPosOrder.push(curPos);
                        if (!(window.selA[i] in window.xPosLookUp)) {
                            window.xPosLookUp[window.selA[i]] = {};
                        }
                        window.xPosLookUp[window.selA[i]][window.selB[j]] = curPos;
                    }
                }
            }
            var grpPos = (grpLast + ((barCount * (1.0 + addGapBar) + 0.5 + grpCount * addGapGrp) - grpLast) / 2.0 ) * window.frameXend / totalSize;
            grpLast = barCount * (1.0 + addGapBar) + grpCount * addGapGrp + addGapGrp
            window.xGroupCenter.push(grpPos);
            window.xGroupLookUp[window.selA[i]] = grpPos;
            grpCount += 1;
        } else {
            if (isFinite(window.sortData[window.selA[i]]["aver"])) {
                barCount += 1;
                var curPos = (barCount * (1.0 + addGapBar) - 0.5 ) * window.frameXend / totalSize;
                window.xPosOrder.push(curPos);
                window.xPosLookUp[window.selA[i]] = curPos;
            }
        }
    }

    if (window.modifySettings["YAxLinLog"] == "lin") {
        if (window.winYmin > 0.0) {
            var dimension = Math.pow(10, Math.floor(Math.log(window.winYmax) / Math.log(10)))
            var scaleNorm = window.winYmax / dimension
            if (scaleNorm > 6) {
                window.winYstep = 2.0 * dimension
                window.winYprec = 0
            } else if (scaleNorm > 4) {
                window.winYstep = 1.0 * dimension
                window.winYprec = 0
            } else if (scaleNorm > 2) {
                window.winYstep = 0.5 * dimension
                window.winYprec = 1
            } else {
                window.winYstep = 0.2 * dimension
                window.winYprec = 1
            }
            window.winYst = 0.0;
            window.winYend = Math.ceil(window.winYmax / window.winYstep) * window.winYstep;
        } else {
            var dimension = Math.pow(10, Math.floor(Math.log(window.winYmax - window.winYmin) / Math.log(10)))
            var scaleNorm = window.winYmax / dimension
            if (scaleNorm > 6) {
                window.winYstep = 2.0 * dimension
                window.winYprec = 0
            } else if (scaleNorm > 4) {
                window.winYstep = 1.0 * dimension
                window.winYprec = 0
            } else if (scaleNorm > 2) {
                window.winYstep = 0.5 * dimension
                window.winYprec = 1
            } else {
                window.winYstep = 0.2 * dimension
                window.winYprec = 1
            }
            window.winYst = Math.floor(window.winYmin / window.winYstep) * window.winYstep;
            window.winYend = Math.ceil(window.winYmax / window.winYstep) * window.winYstep;
        }
    } else {
        if (window.winYmax < 0.000000001) {
            // There are no useful values
            window.winYst = 0.1;
            window.winYend = 10.0;
        } else {
            // First fix the max window
            window.winYstep = Math.pow(10, Math.floor(Math.log10(Math.abs(window.winYmax) / 10)));
            window.winYend = Math.ceil(window.winYmax / window.winYstep) * window.winYstep;
            // Get the right start
            window.winYstep = Math.pow(10, Math.floor(Math.log10(Math.abs(window.winYmin))));
            window.winYst = Math.floor(window.winYmin / window.winYstep) * window.winYstep;
            if (window.winYst < window.winYend/Math.abs(window.maxLogRange)) {
                window.winYstep = Math.pow(10, Math.floor(Math.log10(Math.abs(window.winYend/window.maxLogRange))));
                window.winYst = Math.floor((window.winYend/window.maxLogRange) / window.winYstep) * window.winYstep;
            }
        }
    }
}

function toSvgYScale(val) {
    if (window.modifySettings["YAxLinLog"] == "lin") {
        return toSvgYLinScale(val);
    } else {
        return toSvgYLogScale(val);
    }
}

function toSvgSaveYScale(val) {
    if (window.modifySettings["YAxLinLog"] == "lin") {
        return toSvgYLinScale(val);
    } else {
        if (val < window.winYst) {
            return toSvgYLogScale(window.winYst);
        } else {
            return toSvgYLogScale(val);
        }
    }
}

function toSvgYLinScale(val) {
    if (val < window.winYst) {
        return window.frameYend
    }
    return window.frameYend - (val - window.winYst) / (window.winYend - window.winYst) * window.frameYend;
}

function toSvgYLogScale(val) {
    if (val < window.winYst) {
        return window.frameYend
    }
    return window.frameYend - (Math.log10(val) - Math.log10(window.winYst)) / (Math.log10(window.winYend) - Math.log10(window.winYst)) * window.frameYend;

}

function createCoordinates () {
    var retVal = ""

    var xAxisStroke = 2.0;
    var xTickStroke = 2.0;
    var xTickLength = 7.0;
    var xTextOrientation = -90.0;
    var xTextSpace = 6.0;
    var xTextSize = 10.0;
    var xTextType = "Arial";

    var xLineSpace = 12.0;
    var xLineStroke = 2.0;
    var xLineDelta = 0.0;

    var xTextOrientation2 = 0.0;
    var xTextSpace2 = 12.0;
    var xTextSize2 = 10.0;
    var xTextType2 = "Arial";

    var yAxisStroke = 2.0;
    var yTickStroke = 2.0;
    var yTickLength = 7.0;
    var yTextSpace = 6.0;
    var yTextSize = 10.0;
    var yTextType = "Arial";

    if (isFinite(parseFloat(window.modifySettings["YPlAxisStroke"]))) {
        yAxisStroke = parseFloat(window.modifySettings["YPlAxisStroke"]);
    }
    if (isFinite(parseFloat(window.modifySettings["YPlTickStroke"]))) {
        yTickStroke = parseFloat(window.modifySettings["YPlTickStroke"]);
    }
    if (isFinite(parseFloat(window.modifySettings["YPlTickLength"]))) {
        yTickLength = parseFloat(window.modifySettings["YPlTickLength"]);
    }
    if (isFinite(parseFloat(window.modifySettings["YPlTextSpace"]))) {
        yTextSpace = parseFloat(window.modifySettings["YPlTextSpace"]);
    }
    if (isFinite(parseFloat(window.modifySettings["YPlTextSize"]))) {
        yTextSize = parseFloat(window.modifySettings["YPlTextSize"]);
    }
    if (window.modifySettings["YPlTextType"] != "") {
        yTextType = window.modifySettings["YPlTextType"];
    }

    if (isFinite(parseFloat(window.modifySettings["XPlAxisOrientation"]))) {
        xTextOrientation = parseFloat(window.modifySettings["XPlAxisOrientation"]);
    }
    if (isFinite(parseFloat(window.modifySettings["XPlAxisStroke"]))) {
        xAxisStroke = parseFloat(window.modifySettings["XPlAxisStroke"]);
    }
    if (isFinite(parseFloat(window.modifySettings["XPlTickStroke"]))) {
        xTickStroke = parseFloat(window.modifySettings["XPlTickStroke"]);
    }
    if (isFinite(parseFloat(window.modifySettings["XPlTickLength"]))) {
        xTickLength = parseFloat(window.modifySettings["XPlTickLength"]);
    }
    if (isFinite(parseFloat(window.modifySettings["XPlTextSpace"]))) {
        xTextSpace = parseFloat(window.modifySettings["XPlTextSpace"]);
    }
    if (isFinite(parseFloat(window.modifySettings["XPlTextSize"]))) {
        xTextSize = parseFloat(window.modifySettings["XPlTextSize"]);
    }
    if (window.modifySettings["XPlTextType"] != "") {
        xTextType = window.modifySettings["XPlTextType"];
    }

    if (isFinite(parseFloat(window.modifySettings["XPlLineSpace"]))) {
        xLineSpace = parseFloat(window.modifySettings["XPlLineSpace"]);
    }
    if (isFinite(parseFloat(window.modifySettings["XPlLineStroke"]))) {
        xLineStroke = parseFloat(window.modifySettings["XPlLineStroke"]);
    }
    if (isFinite(parseFloat(window.modifySettings["XPlLineDelta"]))) {
        xLineDelta = parseFloat(window.modifySettings["XPlLineDelta"]);
    }

    if (isFinite(parseFloat(window.modifySettings["XPlAxisOrientation2"]))) {
        xTextOrientation2 = parseFloat(window.modifySettings["XPlAxisOrientation2"]);
    }
    if (isFinite(parseFloat(window.modifySettings["XPlTextSpace2"]))) {
        xTextSpace2 = parseFloat(window.modifySettings["XPlTextSpace2"]);
    }
    if (isFinite(parseFloat(window.modifySettings["XPlTextSize2"]))) {
        xTextSize2 = parseFloat(window.modifySettings["XPlTextSize2"]);
    }
    if (window.modifySettings["XPlTextType2"] != "") {
        xTextType2 = window.modifySettings["XPlTextType2"];
    }


    var lineXend = window.frameXend + 5.0;
    var lineYst = -5.0;
    window.svgDimYStart += lineYst;
    window.svgDimXEnd += 5.0;

    // The X-Axis
    for (var i = 0; i < window.xPosOrder.length; i++) {
        var xPos = window.xPosOrder[i];
        retVal += "<line x1='" + xPos + "' y1='" + window.frameYend;
        retVal += "' x2='" + xPos + "' y2='" + (window.frameYend + xTickLength) ;
        retVal += "' stroke-width='" + xTickStroke + "' stroke='black' />";
    }
    var maxXText = 0.0;
    var maxXText2 = 0.0;
    var addUpSpace = 0.0;
    for (var i = 0 ; i < window.selA.length ; i++) {
        if (window.selB.length != 0) {
            var grpLineStart = -1.0;
            var grpLineEnd = -1.0;
            for (var j = 0 ; j < window.selB.length ; j++) {
                if ((selA[i] in window.xPosLookUp) &&
                        (selB[j] in window.xPosLookUp[window.selA[i]]) &&
                        (selB[j] in window.sortData[window.selA[i]]) &&
                        ("aver" in window.sortData[window.selA[i]][window.selB[j]]) &&
                        (isFinite(window.sortData[window.selA[i]][window.selB[j]]["aver"]))){
                    if (grpLineStart == -1.0) {
                        grpLineStart = window.xPosLookUp[window.selA[i]][window.selB[j]];
                    }
                    grpLineEnd = window.xPosLookUp[window.selA[i]][window.selB[j]];
                    if (Math.abs(-90 - xTextOrientation) < 1) {
                        retVal += "<text x='0.0' y='0.0' font-family='" + xTextType + "' font-size='" + xTextSize;
                        retVal += "' fill='black' text-anchor='end' transform='translate(";
                        retVal += (window.xPosLookUp[window.selA[i]][window.selB[j]] + xTextSize * 3.0 / 8.0) + ", "
                        retVal += (window.frameYend + xTickLength + xTextSpace) + ") rotate(-90)'>";
                        retVal += window.selB[j] + "</text>";
                        maxXText = mSvgTextLen(maxXText, window.selB[j], xTextSize, xTextType);
                    }
                    if (Math.abs(xTextOrientation) < 1) {
                        retVal += "<text x='" + window.xPosLookUp[window.selA[i]][window.selB[j]];
                        retVal += "'  y='" + (window.frameYend + xTickLength + xTextSpace + xTextSize)
                        retVal += "' font-family='" + xTextType + "' font-size='" + xTextSize;
                        retVal += "' fill='black' text-anchor='middle'>";
                        retVal += window.selB[j] + "</text>";
                        maxXText = xTextSize;
                    }
                    if (Math.abs(90 - xTextOrientation) < 1) {
                        retVal += "<text x='0.0' y='0.0' font-family='" + xTextType + "' font-size='" + xTextSize;
                        retVal += "' fill='black' text-anchor='start' transform='translate(";
                        retVal += (window.xPosLookUp[window.selA[i]][window.selB[j]] - xTextSize * 3.0 / 8.0) + ", "
                        retVal += (window.frameYend + xTickLength + xTextSpace) + ") rotate(90)'>";
                        retVal += window.selB[j] + "</text>";
                        maxXText = mSvgTextLen(maxXText, window.selB[j], xTextSize, xTextType);
                    }
                } else {
                    if (window.modifySettings["XAxEmptySpace"] == "y") {
                        if (grpLineStart == -1.0) {
                            grpLineStart = window.xPosLookUp[window.selA[i]][window.selB[j]];
                        }
                        grpLineEnd = window.xPosLookUp[window.selA[i]][window.selB[j]];
                    }
                }
            }
            var linYPos = window.frameYend + xTickLength + xTextSpace + maxXText + xLineSpace;
            if ((grpLineStart != grpLineEnd) && (xLineStroke > 0.0)) {
                retVal += "<line x1='" + (grpLineStart - window.xPosBarWidth - xLineDelta) + "' y1='" + linYPos;
                retVal += "' x2='" + (grpLineEnd + window.xPosBarWidth + xLineDelta) + "' y2='" + linYPos;
                retVal += "' stroke-width='" + xLineStroke + "' stroke='black' />";
            }
            if (Math.abs(-90 - xTextOrientation2) < 1) {
                retVal += "<text x='0.0' y='0.0' font-family='" + xTextType2 + "' font-size='" + xTextSize2;
                retVal += "' fill='black' text-anchor='end' transform='translate(";
                retVal += (window.xGroupLookUp[window.selA[i]] + xTextSize2 * 3.0 / 8.0) + ", "
                retVal += (linYPos + xLineStroke  + xTextSpace2) + ") rotate(-90)'>";
                retVal += window.selA[i] + "</text>";
                maxXText2 = mSvgTextLen(maxXText2, window.selA[i], xTextSize2, xTextType2);
            }
            if (Math.abs(xTextOrientation2) < 1) {
                retVal += "<text x='" + window.xGroupLookUp[window.selA[i]];
                retVal += "'  y='" + (linYPos + xLineStroke + xTextSpace2 + xTextSize2)
                retVal += "' font-family='" + xTextType + "' font-size='" + xTextSize2;
                retVal += "' fill='black' text-anchor='middle'>";
                retVal += window.selA[i] + "</text>";
                maxXText2 = xTextSize2;
            }
            if (Math.abs(90 - xTextOrientation2) < 1) {
                retVal += "<text x='0.0' y='0.0' font-family='" + xTextType2 + "' font-size='" + xTextSize2;
                retVal += "' fill='black' text-anchor='start' transform='translate(";
                retVal += (window.xGroupLookUp[window.selA[i]] + xTextSize2 * 3.0 / 8.0) + ", "
                retVal += (linYPos + xLineStroke  + xTextSpace2) + ") rotate(90)'>";
                retVal += window.selA[i] + "</text>";
                maxXText2 = mSvgTextLen(maxXText2, window.selA[i], xTextSize2, xTextType2);
            }
            addUpSpace = xTextSpace + maxXText + xLineSpace + xLineStroke + xTextSpace2 + maxXText2;
        } else {
            if ((selA[i] in window.xPosLookUp)  &&
                    (isFinite(window.sortData[window.selA[i]]["aver"]))) {

                if (Math.abs(-90 - xTextOrientation) < 1) {
                    retVal += "<text x='0.0' y='0.0' font-family='" + xTextType + "' font-size='" + xTextSize;
                    retVal += "' fill='black' text-anchor='end' transform='translate(";
                    retVal += (window.xPosLookUp[window.selA[i]] + xTextSize * 3.0 / 8.0) + ", "
                    retVal += (window.frameYend + xTickLength + xTextSpace) + ") rotate(-90)'>";
                    retVal += window.selA[i] + "</text>";
                    maxXText = mSvgTextLen(maxXText, window.selA[i], xTextSize, xTextType);
                }
                if (Math.abs(xTextOrientation) < 1) {
                    retVal += "<text x='" + window.xPosLookUp[window.selA[i]];
                    retVal += "'  y='" + (window.frameYend + xTickLength + xTextSpace + xTextSize)
                    retVal += "' font-family='" + xTextType + "' font-size='" + xTextSize;
                    retVal += "' fill='black' text-anchor='middle'>";
                    retVal += window.selA[i] + "</text>";
                    maxXText = xTextSize;
                }
                if (Math.abs(90 - xTextOrientation) < 1) {
                    retVal += "<text x='0.0' y='0.0' font-family='" + xTextType + "' font-size='" + xTextSize;
                    retVal += "' fill='black' text-anchor='start' transform='translate(";
                    retVal += (window.xPosLookUp[window.selA[i]] - xTextSize * 3.0 / 8.0) + ", "
                    retVal += (window.frameYend + xTickLength + xTextSpace) + ") rotate(90)'>";
                    retVal += window.selA[i] + "</text>";
                    maxXText = mSvgTextLen(maxXText, window.selA[i], xTextSize, xTextType);
                }
                addUpSpace = xTextSpace + maxXText;
            }
        }
    }
    window.svgDimYEnd += xTickLength + addUpSpace;

    // The Y-Axis
    var maxYText = 0.0;
    if (window.modifySettings["YAxLinLog"] == "lin") {
        var maxYScaleVal = window.winYend - window.winYst + window.winYstep;
        var yRound = Math.max(0, Math.floor(1 - Math.log10(Math.abs(maxYScaleVal))))
        if (Math.log10(maxYScaleVal) < 1.0) {
            yRound = yRound + window.winYprec
        }
        for (var i = 0; i *  window.winYstep < window.winYend - window.winYst + window.winYstep; i++) {
            var yPos = toSvgYLinScale(window.winYst + i *  window.winYstep);
            retVal += "<line x1='0.0' y1='" + yPos;
            retVal += "' x2='" + (0.0 - yTickLength) + "' y2='" + yPos + "' stroke-width='" + yTickStroke + "' stroke='black' />";
            var textValOut = i *  window.winYstep + window.winYst
            var textValStr = textValOut.toFixed(yRound)
            maxYText = mSvgTextLen(maxYText, textValStr, yTextSize, yTextType);
            retVal += "<text x='" + (0.0 - yTickLength - yTextSpace) + "' y='" + (yPos + yTextSize * 3.0 / 8.0);
            retVal += "' font-family='" + yTextType + "' font-size='" + yTextSize + "' fill='black' text-anchor='end'>";
            retVal += textValStr + "</text>";
        }
    } else {
        var sumVal = window.winYst
        var yLogStep = window.winYstep
        var dispRange = Math.log10(window.winYend) - Math.log10(sumVal)
        for (var i = 0; (sumVal + i * yLogStep) < window.winYend ; i++) {
            if ((sumVal + i * yLogStep) / yLogStep >= 10) {
                yLogStep = yLogStep * 10
                i = 0
                sumVal = yLogStep
            }
            var yPos = toSvgYLogScale(sumVal + i * yLogStep);
            retVal += "<line x1='0.0' y1='" + yPos;
            retVal += "' x2='" + (0.0 - yTickLength) + "' y2='" + yPos + "' stroke-width='" + yTickStroke + "' stroke='black' />";
            var textValOut = sumVal + i * yLogStep
            var textValStr = textValOut.toFixed(yRound)
            var yRound = Math.max(0, Math.floor(2 - Math.log10(Math.abs(textValOut))))
            if (!(((Math.round(textValOut.toFixed(yRound) / yLogStep) == 2) && (dispRange > 3)) ||
                  ((Math.round(textValOut.toFixed(yRound) / yLogStep) == 4) && (dispRange > 3)) ||
                  ((Math.round(textValOut.toFixed(yRound) / yLogStep) == 6) && (window.maxLogRange > 3000)) ||
                  ((Math.round(textValOut.toFixed(yRound) / yLogStep) == 6) && (dispRange > 2)) ||
                  ((Math.round(textValOut.toFixed(yRound) / yLogStep) == 7) && (dispRange > 1)) ||
                  ((Math.round(textValOut.toFixed(yRound) / yLogStep) == 8) && (dispRange > 3)) ||
                  (Math.round(textValOut.toFixed(yRound) / yLogStep) == 9))) {
                maxYText = mSvgTextLen(maxYText, textValStr, yTextSize, yTextType);
                retVal += "<text x='" + (0.0 - yTickLength - yTextSpace) + "' y='" + (yPos + yTextSize * 3.0 / 8.0);
                retVal += "' font-family='" + yTextType + "' font-size='" + yTextSize + "' fill='black' text-anchor='end'>";
                retVal += textValStr + "</text>";
            }
        }
    }
    window.svgDimXStart -= yTickLength + yTextSpace + maxYText;

    if (window.modifySettings["YPlDescText"] != "") {
        var descSpace = 8.0;
        var descSize = 16.0;
        var descType = "Arial";
        if (isFinite(parseFloat(window.modifySettings["YPlDescSpace"]))) {
            descSpace = parseFloat(window.modifySettings["YPlDescSpace"]);
        }
        if (isFinite(parseFloat(window.modifySettings["YPlDescSize"]))) {
            descSize = parseFloat(window.modifySettings["YPlDescSize"]);
        }
        if (window.modifySettings["YPlDescType"] != "") {
            descType = window.modifySettings["YPlDescType"];
        }
        retVal += "<text x='0.0' y='0.0' font-family='" + descType + "' font-size='" + descSize
        retVal += "' fill='black' text-anchor='middle' transform='translate("
        retVal += (window.svgDimXStart - descSpace) + ", " + (window.frameYend / 2.0) + ") rotate(-90)'>";
        retVal += window.modifySettings["YPlDescText"] + "</text>";
        window.svgDimXStart -= descSpace + descSize;
    }

    if (window.modifySettings["GraphTitlText"] != "") {
        var titleSpace = 8.0;
        var titleSize = 16.0;
        var titleType = "Arial";
        if (isFinite(parseFloat(window.modifySettings["GraphTitlSpace"]))) {
            titleSpace = parseFloat(window.modifySettings["GraphTitlSpace"]);
        }
        if (isFinite(parseFloat(window.modifySettings["GraphTitlSize"]))) {
            titleSize = parseFloat(window.modifySettings["GraphTitlSize"]);
        }
        if (window.modifySettings["GraphTitlType"] != "") {
            titleType = window.modifySettings["GraphTitlType"];
        }
        retVal += "<text x='" + ((window.svgDimXEnd + window.svgDimXStart) / 2.0)
        retVal +=  "' y='" + (window.svgDimYStart - titleSpace);
        retVal += "' font-family='" + titleType + "' font-size='" + titleSize
        retVal += "' fill='black' text-anchor='middle'>";
        retVal += window.modifySettings["GraphTitlText"] + "</text>";
        window.svgDimYStart -= titleSpace + titleSize;
    }

    retVal += "<line x1='0.0' y1='" + window.frameYend;
    retVal += "' x2='" + lineXend + "' y2='" + window.frameYend + "' stroke-width='"
    retVal += xAxisStroke + "' stroke='black' stroke-linecap='square'/>";
    retVal += "<line x1='0.0' y1='" + lineYst;
    retVal += "' x2='0.0' y2='" + window.frameYend + "' stroke-width='"
    retVal += yAxisStroke + "' stroke='black' stroke-linecap='square'/>";

    return retVal;
}

function createBoxes() {
    var retVal = ""
    var barStroke = 2.0;
    var boxStroke = 1.0;
    var selMethod = document.getElementById('selDataCombiMeth').value;
    if (isFinite(parseFloat(window.modifySettings["MedianLineStroke"]))) {
        barStroke = parseFloat(window.modifySettings["MedianLineStroke"]);
    }
    if (isFinite(parseFloat(window.modifySettings["BoxLineStroke"]))) {
        boxStroke = parseFloat(window.modifySettings["BoxLineStroke"]);
    }

    for (var i = 0 ; i < window.selA.length ; i++) {
        if (window.selB.length != 0) {
            for (var j = 0 ; j < window.selB.length ; j++) {
                if (selMethod == "mean_quart") {
                    if ((selA[i] in window.xPosLookUp) &&
                            (selB[j] in window.xPosLookUp[window.selA[i]]) &&
                            (selB[j] in window.sortData[window.selA[i]]) &&
                            ("quart_low" in window.sortData[window.selA[i]][window.selB[j]]) &&
                            (isFinite(window.sortData[window.selA[i]][window.selB[j]]["quart_low"])) &&
                            ("quart_high" in window.sortData[window.selA[i]][window.selB[j]]) &&
                            (isFinite(window.sortData[window.selA[i]][window.selB[j]]["quart_high"]))){
                        var xPos = window.xPosLookUp[window.selA[i]][window.selB[j]] - window.xPosBarWidth;
                        var yPos = toSvgYScale(window.sortData[window.selA[i]][window.selB[j]]["quart_high"]);
                        var xWid = 2 * window.xPosBarWidth;
                        var yHig = toSvgYScale(window.sortData[window.selA[i]][window.selB[j]]["quart_low"]) - yPos;
                        retVal += "<rect x='" + xPos + "' y='" + yPos
                        retVal += "' width='" + xWid + "' height='" + yHig
                        var useCol = "#0000FF";
                        if (selB[j] in window.samColorLookup) {
                            useCol = window.samColorLookup[selB[j]];
                        }
                        retVal += "' fill='" + useCol + "' stroke-width='" + boxStroke + "' stroke='#000000' />"
                    }
                    if ((selA[i] in window.xPosLookUp) &&
                        (selB[j] in window.xPosLookUp[window.selA[i]]) &&
                        (selB[j] in window.sortData[window.selA[i]]) &&
                        ("aver" in window.sortData[window.selA[i]][window.selB[j]]) &&
                        (isFinite(window.sortData[window.selA[i]][window.selB[j]]["aver"]))){
                        var xPos = window.xPosLookUp[window.selA[i]][window.selB[j]] - window.xPosBarWidth;
                        var yPos = toSvgYScale(window.sortData[window.selA[i]][window.selB[j]]["aver"]);
                        var x2Pos = xPos + 2 * window.xPosBarWidth;
                        var yHig = window.frameYend - yPos;
                        retVal += "<line x1='" + xPos + "' y1='" + yPos + "' x2='" + x2Pos + "' y2='" + yPos
                        retVal += "' stroke='#000000' stroke-width='" + barStroke + "' />"
                    }
                } else {
                    if ((selA[i] in window.xPosLookUp) &&
                            (selB[j] in window.xPosLookUp[window.selA[i]]) &&
                            (selB[j] in window.sortData[window.selA[i]]) &&
                            ("aver" in window.sortData[window.selA[i]][window.selB[j]]) &&
                            (isFinite(window.sortData[window.selA[i]][window.selB[j]]["aver"]))){
                        var xPos = window.xPosLookUp[window.selA[i]][window.selB[j]] - window.xPosBarWidth;
                        var yPos = toSvgYScale(window.sortData[window.selA[i]][window.selB[j]]["aver"]);
                        var xWid = 2 * window.xPosBarWidth;
                        var yHig = window.frameYend - yPos;
                        retVal += "<rect x='" + xPos + "' y='" + yPos
                        retVal += "' width='" + xWid + "' height='" + yHig
                        var useCol = "#0000FF";
                        if (selB[j] in window.samColorLookup) {
                            useCol = window.samColorLookup[selB[j]];
                        }
                        retVal += "' fill='" + useCol + "' stroke-width='" + boxStroke + "' stroke='#000000' />"
                    }
                }
            }
        } else {
            if (selMethod == "mean_quart") {
                if ((selA[i] in window.xPosLookUp) &&
                        ("quart_low" in window.sortData[window.selA[i]]) &&
                        (isFinite(window.sortData[window.selA[i]]["quart_low"])) &&
                        ("quart_high" in window.sortData[window.selA[i]]) &&
                        (isFinite(window.sortData[window.selA[i]]["quart_high"]))){
                    var xPos = window.xPosLookUp[window.selA[i]] - window.xPosBarWidth;
                    var yPos = toSvgYScale(window.sortData[window.selA[i]]["quart_high"]);
                    var xWid = 2 * window.xPosBarWidth;
                    var yHig = toSvgYScale(window.sortData[window.selA[i]]["quart_low"]) - yPos;
                    retVal += "<rect x='" + xPos + "' y='" + yPos
                    retVal += "' width='" + xWid + "' height='" + yHig
                    var useCol = "#0000FF";
                    if (selB[j] in window.samColorLookup) {
                        useCol = window.samColorLookup[selB[j]];
                    }
                    retVal += "' fill='" + useCol + "' stroke-width='" + boxStroke + "' stroke='#000000' />"
                }
                if ((selA[i] in window.xPosLookUp)  &&
                    (isFinite(window.sortData[window.selA[i]]["aver"]))) {
                    var xPos = window.xPosLookUp[window.selA[i]] - window.xPosBarWidth;
                    var yPos = toSvgYScale(window.sortData[window.selA[i]]["aver"]);
                    var x2Pos = xPos + 2 * window.xPosBarWidth;
                    var yHig = window.frameYend - yPos;
                    retVal += "<line x1='" + xPos + "' y1='" + yPos + "' x2='" + x2Pos + "' y2='" + yPos
                    retVal += "' stroke='#000000' stroke-width='" + barStroke + "' />"
                }
            } else {
                if ((selA[i] in window.xPosLookUp)  &&
                        (isFinite(window.sortData[window.selA[i]]["aver"]))) {
                    var xPos = window.xPosLookUp[window.selA[i]] - window.xPosBarWidth;
                    var yPos = toSvgYScale(window.sortData[window.selA[i]]["aver"]);
                    var xWid = 2 * window.xPosBarWidth;
                    var yHig = window.frameYend - yPos;
                    retVal += "<rect x='" + xPos + "' y='" + yPos
                    retVal += "' width='" + xWid + "' height='" + yHig
                    var useCol = "#0000FF";
                    if (selA[i] in window.samColorLookup) {
                        useCol = window.samColorLookup[selA[i]];
                    }
                    retVal += "' fill='" + useCol + "' stroke-width='" + boxStroke + "' stroke='#000000' />"
                }
            }
        }
    }

    return retVal;
}

function createErrorBars() {
    var retVal = "";
    var barStroke = 1.5;
    var tickLength = 6.0;

    if (isFinite(parseFloat(window.modifySettings["ErrTickStroke"]))) {
        barStroke = parseFloat(window.modifySettings["ErrTickStroke"]);
    }
    if (isFinite(parseFloat(window.modifySettings["ErrTickLength"]))) {
        tickLength = parseFloat(window.modifySettings["ErrTickLength"]);
    }

    for (var i = 0 ; i < window.selA.length ; i++) {
        if (window.selB.length != 0) {
            for (var j = 0 ; j < window.selB.length ; j++) {
                if ((selA[i] in window.xPosLookUp) &&
                        (selB[j] in window.xPosLookUp[window.selA[i]]) &&
                        (selB[j] in window.sortData[window.selA[i]]) &&
                        ("aver" in window.sortData[window.selA[i]][window.selB[j]]) &&
                        (isFinite(window.sortData[window.selA[i]][window.selB[j]]["aver"]))){
                    var xPos = window.xPosLookUp[window.selA[i]][window.selB[j]];
                    var aver = window.sortData[window.selA[i]][window.selB[j]]["aver"]
                    var errMax = aver;
                    var errMin = aver;
                    if ((window.modifySettings["ErrShape"] == "both") ||
                        (window.modifySettings["ErrShape"] == "upper")) {
                        if (isFinite(window.sortData[window.selA[i]][window.selB[j]]["err_max"])) {
                            errMax = aver + window.sortData[window.selA[i]][window.selB[j]]["err_max"];
                        }
                        if (isFinite(window.sortData[window.selA[i]][window.selB[j]]["max"])) {
                            errMax = window.sortData[window.selA[i]][window.selB[j]]["max"];
                        }
                    }
                    if ((window.modifySettings["ErrShape"] == "both") ||
                        (window.modifySettings["ErrShape"] == "lower")) {
                        if (isFinite(window.sortData[window.selA[i]][window.selB[j]]["err_min"])) {
                            errMin = aver - window.sortData[window.selA[i]][window.selB[j]]["err_min"];
                        }
                        if (isFinite(window.sortData[window.selA[i]][window.selB[j]]["min"])) {
                            errMin = window.sortData[window.selA[i]][window.selB[j]]["min"];
                        }
                    }
                    if (errMax == errMin) {
                        continue;
                    }
                    retVal += "<line x1='" + xPos + "' y1='" + toSvgYScale(errMin) + "' x2='" + xPos + "' y2='" + toSvgYScale(errMax)
                    retVal += "' stroke='#000000' stroke-width='" + barStroke + "' />"
                    if ((errMax!= aver) && (parseFloat(tickLength))) {
                        retVal += "<line x1='" + (xPos - tickLength) + "' y1='" + toSvgYScale(errMax)
                        retVal += "' x2='" + (xPos + tickLength) + "' y2='" + toSvgYScale(errMax)
                        retVal += "' stroke='#000000' stroke-width='" + barStroke + "' />"
                    }
                    if ((errMin != aver) && (parseFloat(tickLength))) {
                        retVal += "<line x1='" + (xPos - tickLength) + "' y1='" + toSvgYScale(errMin)
                        retVal += "' x2='" + (xPos + tickLength) + "' y2='" + toSvgYScale(errMin)
                        retVal += "' stroke='#000000' stroke-width='" + barStroke + "' />"
                    }
                }
            }
        } else {
            if ((selA[i] in window.xPosLookUp)  &&
                    (isFinite(window.sortData[window.selA[i]]["aver"]))) {
                var xPos = window.xPosLookUp[window.selA[i]];
                var aver = window.sortData[window.selA[i]]["aver"]
                var errMax = aver;
                var errMin = aver;
                if ((window.modifySettings["ErrShape"] == "both") ||
                    (window.modifySettings["ErrShape"] == "upper")) {
                    if (isFinite(window.sortData[window.selA[i]]["err_max"])) {
                        errMax = aver + window.sortData[window.selA[i]]["err_max"];
                    }
                    if (isFinite(window.sortData[window.selA[i]]["max"])) {
                        errMax = window.sortData[window.selA[i]]["max"];
                    }
                }
                if ((window.modifySettings["ErrShape"] == "both") ||
                        (window.modifySettings["ErrShape"] == "lower")) {
                    if (isFinite(window.sortData[window.selA[i]]["err_min"])) {
                        errMin = aver - window.sortData[window.selA[i]]["err_min"];
                    }
                    if (isFinite(window.sortData[window.selA[i]]["min"])) {
                        errMin = window.sortData[window.selA[i]]["min"];
                    }
                }
                if (errMax == errMin) {
                    continue;
                }
                retVal += "<line x1='" + xPos + "' y1='" + toSvgYScale(errMin) + "' x2='" + xPos + "' y2='" + toSvgYScale(errMax) + "' style='stroke:rgb(0,0,0);stroke-width:1.0' />"
                if (errMax != aver) {
                    retVal += "<line x1='" + (xPos - 6) + "' y1='" + toSvgYScale(errMax) + "' x2='" + (xPos + 6) + "' y2='" + toSvgYScale(errMax) + "' style='stroke:rgb(0,0,0);stroke-width:1.0' />"
                }
                if ((errMin != aver) &&  (errMin > window.winYst)) {
                    retVal += "<line x1='" + (xPos - 6) + "' y1='" + toSvgYScale(errMin) + "' x2='" + (xPos + 6) + "' y2='" + toSvgYScale(errMin) + "' style='stroke:rgb(0,0,0);stroke-width:1.0' />"
                }
            }
        }
    }

    return retVal;
}

function createDots() {
    var retVal = "";
    var usrDSize = "2.0";
    var usrDStroke = "0.5";
    var usrDColor= "#FFFFFF";
    if (isFinite(parseFloat(window.modifySettings["DotSize"]))) {
        usrDSize = parseFloat(window.modifySettings["DotSize"]);
    }
    if (isFinite(parseFloat(window.modifySettings["DotLineWidth"]))) {
        usrDStroke = parseFloat(window.modifySettings["DotLineWidth"]);
    }
    if (window.modifySettings["DotColor"] != "") {
        usrDColor = window.modifySettings["DotColor"];
    }

    var yDotSize = 0.0;
    if (window.modifySettings["YAxLinLog"] == "lin") {
        yDotSize = (window.winYend - window.winYst) / window.frameYend;
    } else {
        yDotSize = (Math.log10(window.winYend) - Math.log10(window.winYst)) / window.frameYend;
    }
    var xDotSize = 2.0 * usrDSize + usrDStroke;
    yDotSize = yDotSize * xDotSize;
    // window.frameYend - (val - window.winYst) / (window.winYend - window.winYst) * window.frameYend;
    //  window.frameYend - (Math.log10(val) - Math.log10(window.winYst)) / (Math.log10(window.winYend) - Math.log10(window.winYst)) * window.frameYend;
    for (var i = 0 ; i < window.selA.length ; i++) {
        if (window.selB.length != 0) {
            for (var j = 0 ; j < window.selB.length ; j++) {
                if ((selA[i] in window.xPosLookUp) &&
                        (selB[j] in window.xPosLookUp[window.selA[i]]) &&
                        (selB[j] in window.sortData[window.selA[i]]) &&
                        ("dp" in window.sortData[window.selA[i]][window.selB[j]]) &&
                        (window.sortData[window.selA[i]][window.selB[j]]["dp"].length > 0)){

                    var yVals = window.sortData[window.selA[i]][window.selB[j]]["dp"];
                    var xOff = swarmCalc(yVals, yDotSize, xDotSize);
                    for (var k = 0 ; k < window.sortData[window.selA[i]][window.selB[j]]["dp"].length ; k++) {
                        if ((window.modifySettings["YAxLinLog"] == "lin") || (window.sortData[window.selA[i]][window.selB[j]]["dp"][k] > 0.0 )){
                            var xPos = window.xPosLookUp[window.selA[i]][window.selB[j]] + xOff[k];
                            var yPos = toSvgYScale(window.sortData[window.selA[i]][window.selB[j]]["dp"][k]);
                            retVal += "<circle cx='" + xPos + "' cy='" + yPos + "' r='" + usrDSize
                            retVal += "' stroke='black' stroke-width='" + usrDStroke + "' fill='" + usrDColor + "' />"
                         }
                    }
                }
            }
        } else {
            if ((selA[i] in window.xPosLookUp)  &&
                    (window.sortData[window.selA[i]]["dp"].length > 0)){
                var yVals = window.sortData[window.selA[i]]["dp"];
                var xOff = swarmCalc(yVals, yDotSize, xDotSize);
                for (var k = 0 ; k < window.sortData[window.selA[i]]["dp"].length ; k++) {
                    if ((window.modifySettings["YAxLinLog"] == "lin") || (window.sortData[window.selA[i]]["dp"][k] > 0.0 )){
                        var xPos = window.xPosLookUp[window.selA[i]] + xOff[k];
                        var yPos = toSvgYScale(window.sortData[window.selA[i]]["dp"][k]);
                        retVal += "<circle cx='" + xPos + "' cy='" + yPos + "' r='" + usrDSize
                        retVal += "' stroke='black' stroke-width='" + usrDStroke + "' fill='" + usrDColor + "' />"
                    }
                }
            }
        }
    }

    return retVal;
}

function swarmCalc(rawX, dsize, gsize) {
    if (rawX.length < 2) {
        return [0.0];
    }
    var plMeth = "comp-asc";
    if (window.modifySettings["DotPlacingMethod"] != "") {
        if ((window.modifySettings["DotPlacingMethod"] == "comp-rand") ||
            (window.modifySettings["DotPlacingMethod"] == "comp-desc") ||
            (window.modifySettings["DotPlacingMethod"] == "swarm-asc") ||
            (window.modifySettings["DotPlacingMethod"] == "swarm-rand") ||
            (window.modifySettings["DotPlacingMethod"] == "swarm-desc")) {
            plMeth = window.modifySettings["DotPlacingMethod"];
        }
    }

    // This function is inspired by the calculateCompactSwarm function from https://github.com/aroneklund/beeswarm
    // 0: x, 1:y, 2:index, 3:placed, 4:low, 5:high, 6:best, 7:current abs diff
    var dd = [];
    var ret = [];
    // Fill the data structure
    for (var i = 0 ; i < rawX.length ; i++) {
        if (window.modifySettings["YAxLinLog"] == "lin") {
            dd.push([rawX[i]/dsize, 0.0, i + 1, false, 0.0, 0.0, 0.0, 0.0]);
        } else {
            if (rawX[i] <= 0.0) {
                dd.push([-1.0/dsize, 0.0, i + 1, true, 0.0, 0.0, 0.0, 0.0]);
            } else {
                dd.push([Math.log10(rawX[i])/dsize, 0.0, i + 1, false, 0.0, 0.0, 0.0, 0.0]);
            }
        }
    }
    // Sort for smiles, random would avoid smiles
    if ((plMeth == "comp-asc") || (plMeth == "swarm-asc")) {
        dd.sort(sortAsc);
    }
    if ((plMeth == "comp-rand") || (plMeth == "swarm-rand")) {
        fisherYates(dd);
    }
    if ((plMeth == "comp-desc") || (plMeth == "swarm-desc")) {
        dd.sort(sortDesc);
    }

    // Place the dots
    for (var i = 0 ; i < dd.length ; i++) {
        // Find the best dot to place now
        var minBest = Number.POSITIVE_INFINITY;
        var cur = Number.POSITIVE_INFINITY;
        for (var j = 0 ; j < dd.length ; j++) {
            if (Math.abs(dd[j][6]) < minBest) {
                minBest = Math.abs(dd[j][6]);
                cur = j
            }
        }
        var xi = dd[cur][0];
        var yi = dd[cur][6];
        dd[cur][1] = yi;
        dd[cur][3] = true;
        dd[cur][6] = Number.POSITIVE_INFINITY;
        for (var j = 0 ; j < dd.length ; j++) {
            dd[j][7] = Math.abs(xi - dd[j][0])
        }
        // Move the overlapping dots
        if ((plMeth == "comp-asc") || (plMeth == "comp-rand") || (plMeth == "comp-desc")) {
            for (var j = 0 ; j < dd.length ; j++) {
                if (dd[j][3]) {
                    continue;
                }
                if (dd[j][7] >= 1.0) {
                    continue;
                }
                var offset = Math.sqrt(1 - Math.pow(dd[j][7], 2));
                var high = Math.max(dd[j][5], yi + offset);
                dd[j][5] = high;
                var low = Math.min(dd[j][4], yi - offset);
                dd[j][4] = low;
                if (-low < high) {
                    dd[j][6] = low;
                } else {
                    dd[j][6] = high;
                }
            }
        } else {
            // collect offsets
            var preX = [];
            var preY = [];
            var possOff = [0.0];
            for (var j = 0 ; j < i ; j++) {
                if (dd[j][7] >= 1.0) {
                    continue;
                }
                var offset = Math.sqrt(1 - Math.pow(dd[j][7], 2));
                possOff.push(dd[j][1] + offset);
                possOff.push(dd[j][1] - offset);
                preX.push(dd[j][0]);
                preY.push(dd[j][1]);
            }
            if (preX.length > 0) {
                for (var j = 0 ; j < possOff.length ; j++) {
                    var currOver = possOff[j];
                    var isAnyOverlap = false;
                    for (var k = 0 ; k < preX.length ; k++) {
                        if (Math.pow(xi - preX[k], 2) + Math.pow(currOver - preY[k], 2) < 0.999) {
                            possOff[j] = Number.POSITIVE_INFINITY;
                        }
                    }
                }
                var minY = Number.POSITIVE_INFINITY;
                for (var j = 0 ; j < possOff.length ; j++) {
                    if(Math.abs(possOff[j]) < Math.abs(minY)) {
                        minY = possOff[j];
                    }
                }
                dd[cur][1] = minY;
            }
        }
    }
    dd.sort(sortBack);
    for (var i = 0 ; i < dd.length ; i++) {
        ret.push(dd[i][1] * gsize);
    }
    return ret;
}

function sortAsc(a, b) {
    if (a[0] === b[0]) {
        return 0;
    }
    else {
        return (a[0] < b[0]) ? -1 : 1;
    }
}

function sortDesc(a, b) {
    if (a[0] === b[0]) {
        return 0;
    }
    else {
        return (a[0] > b[0]) ? -1 : 1;
    }
}

function sortBack(a, b) {
    if (a[2] === b[2]) {
        return 0;
    }
    else {
        return (a[2] < b[2]) ? -1 : 1;
    }
}

function fisherYates(arr) {
  var i = arr.length;
  if ( i == 0 ) return false;
  while ( --i ) {
     var j = Math.floor( Math.random() * ( i + 1 ) );
     var tempi = arr[i];
     var tempj = arr[j];
     arr[i] = tempj;
     arr[j] = tempi;
   }
}

function mSvgTextLen(mVal, txt, fSize, fType) {
    return Math.max(mVal, svgTextLen(txt, fSize, fType));
}

function svgTextLen(txt, fSize, fType) {
    var retVal = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='-60 -40 60 40' width='90px'>";
    retVal += "<text id='svg-scale-helper-text' x='0' y='0' font-family='" + fType;
    retVal += "' font-size='" + fSize + "' fill='black'>" + txt  + "</text></svg>";
    var ele = document.getElementById("svg-scale-helper");
    ele.innerHTML = retVal;
    var txtEle = document.getElementById("svg-scale-helper-text");
    var retSize = txtEle.getComputedTextLength()
    ele.innerHTML = "";
    return retSize;
}












window.saveDataTable = saveDataTable;
function saveDataTable() {
    saveTabFile("Raw_Data.tsv", window.inputTabStr)
    return;
};

window.saveMeanTable = saveMeanTable;
function saveMeanTable() {
    saveTabFile("Mean_Data.tsv", window.averTabStr)
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

window.saveSVGFile = saveSVGFile;
function saveSVGFile() {
    var fileName = "bargraph.svg"
    var content = createSVG();
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style.display = "none";
    var blob = new Blob([content], {type: "image/svg+xml"});
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
            showSVG();
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
    updateKeyEl(newSett,"YAxLinLog","modYAxLinLog");
    updateKeyEl(newSett,"YAxMaxVal","modYAxMaxVal");
    updateKeyEl(newSett,"YAxMinVal","modYAxMinVal");
    updateKeyEl(newSett,"YPlAxisStroke","modYPlAxisStroke");
    updateKeyEl(newSett,"YPlTickStroke","modYPlTickStroke");
    updateKeyEl(newSett,"YPlTickLength","modYPlTickLength");
    updateKeyEl(newSett,"YPlTextSpace","modYPlTextSpace");
    updateKeyEl(newSett,"YPlTextSize","modYPlTextSize");
    updateKeyEl(newSett,"YPlTextType","modYPlTextType");
    updateKeyEl(newSett,"YPlDescText","modYPlDescText");
    updateKeyEl(newSett,"YPlDescSpace","modYPlDescSpace");
    updateKeyEl(newSett,"YPlDescSize","modYPlDescSize");
    updateKeyEl(newSett,"YPlDescType","modYPlDescType");

    updateKeyEl(newSett,"XAxEmptySpace","modXAxEmptySpace");
    updateKeyEl(newSett,"XAxGapBar","modXAxGapBar");
    updateKeyEl(newSett,"XAxGapGrp","modXAxGapGrp");
    updateKeyEl(newSett,"XPlAxisStroke","modXPlAxisStroke");
    updateKeyEl(newSett,"XPlTickStroke","modXPlTickStroke");
    updateKeyEl(newSett,"XPlTickLength","modXPlTickLength");
    updateKeyEl(newSett,"XPlAxisOrientation","modXPlAxisOrientation");
    updateKeyEl(newSett,"XPlTextSpace","modXPlTextSpace");
    updateKeyEl(newSett,"XPlTextSize","modXPlTextSize");
    updateKeyEl(newSett,"XPlTextType","modXPlTextType");
    updateKeyEl(newSett,"XPlLineSpace","modXPlLineSpace");
    updateKeyEl(newSett,"XPlLineStroke","modXPlLineStroke");
    updateKeyEl(newSett,"XPlLineDelta","modXPlLineDelta");
    updateKeyEl(newSett,"XPlAxisOrientation2","modXPlAxisOrientation2");
    updateKeyEl(newSett,"XPlTextSpace2","modXPlTextSpace2");
    updateKeyEl(newSett,"XPlTextSize2","modXPlTextSize2");
    updateKeyEl(newSett,"XPlTextType2","modXPlTextType2");

    updateKeyEl(newSett,"BoxLineStroke","modBoxLineStroke");
    updateKeyEl(newSett,"MedianLineStroke","modMedianLineStroke");

    updateKeyEl(newSett,"ErrShowIt","modErrShowIt");
    updateKeyEl(newSett,"ErrShape","modErrShape");
    updateKeyEl(newSett,"ErrTickStroke","modErrTickStroke");
    updateKeyEl(newSett,"ErrTickLength","modErrTickLength");

    updateKeyEl(newSett,"DotShowIt","modDotShowIt");
    updateKeyEl(newSett,"DotPlacingMethod","modDotPlacingMethod");
    updateKeyEl(newSett,"DotSize","modDotSize");
    updateKeyEl(newSett,"DotLineWidth","modDotLineWidth");
    updateKeyEl(newSett,"DotColor","modDotColor");

    updateKeyEl(newSett,"GraphHeight","modGraphHeight");
    updateKeyEl(newSett,"GraphWidth","modGraphWidth");
    updateKeyEl(newSett,"GraphCmInch","modGraphCmInch");
    updateKeyEl(newSett,"GraphTitlText","modGraphTitlText");
    updateKeyEl(newSett,"GraphTitlSpace","modGraphTitlSpace");
    updateKeyEl(newSett,"GraphTitlSize","modGraphTitlSize");
    updateKeyEl(newSett,"GraphTitlType","modGraphTitlType");
}

window.updateMod = updateMod;
function updateMod(ele, hashId) {
    var mEle = document.getElementById(ele)
    if ((mEle) && (window.modifySettings.hasOwnProperty(hashId))) {
        window.modifySettings[hashId] = mEle.value;
    }
    showSVG();
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

