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


// Global data
window.inputFile = ""
window.inputSeparator = "\t"
window.modifySettings = {}


window.loadInputFile = loadInputFile
function loadInputFile(){
    var file = inputFile.files[0];
    if (file) { // && file.type.match("text/*")) {
        var reader = new FileReader();
        reader.onload = function(event) {
            var txt = event.target.result;
            txt = txt.replace(/\r\n/g, "\n");
            txt = txt.replace(/\r/g, "\n");
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

window.updateModification = updateModification;
function updateModification() {
    window.modifySettings["reformatTableShape"] = document.getElementById('modReformatTableShape').value;
    window.modifySettings["reformatCutStart"] = parseInt(document.getElementById('modReformatCutStart').value);
    window.modifySettings["reformatNewColum"] = parseInt(document.getElementById('modReformatNewColum').value);
    window.modifySettings["fluorDelColStart"] = parseInt(document.getElementById('modDelColStart').value);
    window.modifySettings["fluorDelRowStart"] = parseInt(document.getElementById('modDelRowStart').value);
    window.modifySettings["fluorDelOtherCol"] = parseInt(document.getElementById('modDelOtherCol').value);
    window.modifySettings["fluorDelColEnd"] = parseInt(document.getElementById('modDelColEnd').value);
    window.modifySettings["fluorDelRowEnd"] = parseInt(document.getElementById('modDelRowEnd').value);
    window.modifySettings["fluorCommaDot"] = document.getElementById("modCommaDot").checked;

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
