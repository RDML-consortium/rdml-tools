"use strict";

var jquery = require("jquery");
window.$ = window.jQuery = jquery; // notice the definition of global variables here

const API_URL = process.env.API_URL
const API_LINK = process.env.API_LINK

const rdmlLibVersion = document.getElementById('rdml_lib_version')

const resultLink = document.getElementById('uuid-link-box')

const submitButton = document.getElementById('btn-submit')
submitButton.addEventListener('click', showUpload)

const createNewButton = document.getElementById('btn-create-new')
createNewButton.addEventListener('click', showCreateNew)

const exampleButton = document.getElementById('btn-example')
exampleButton.addEventListener('click', showExample)

const createSaveButton = document.getElementById('btn-save')
createSaveButton.addEventListener('click', showSave)

const inputFile = document.getElementById('inputFile')
const resultInfo = document.getElementById('result-info')
const resultError = document.getElementById('result-error')

const fileInfoData = document.getElementById('file-info-data')
const rdmlidsData = document.getElementById('rdmlids-data')
const experimentersData = document.getElementById('experimenters-data')
const documentationsData = document.getElementById('documentations-data')
const dyesData = document.getElementById('dyes-data')
const samplesData = document.getElementById('samples-data')
const targetsData = document.getElementById('targets-data')
const therm_cyc_consData = document.getElementById('cyclingConditions-data')
const experimentsData = document.getElementById('experiments-data')
const debugData = document.getElementById('debug-data')

window.uuid = "";
window.selExperiment = "";
window.selRun = "";
window.rdmlData = "";
window.isvalid = "untested";
window.errorMessage = "";

window.showEditButt = false;
window.editMode = false;
window.editType = "";
window.editIsNew = false;
window.editNumber = -1;
window.docIdOpen = "";

window.selIdOnLoad = "";

function resetAllGlobalVal() {
    window.selExperiment = "";
    window.selRun = "";
    window.editMode = false;
    window.editType = "";
    window.editIsNew = false;
    window.editNumber = -1;
}

document.addEventListener("DOMContentLoaded", function() {
    checkForUUID();
});


window.showEditButtons = showEditButtons;
function showEditButtons() {
    var butt = document.getElementById('btn-show-edit-buttons')
    var elem = document.getElementsByClassName('rdml-btn-edit');
    if (window.showEditButt == true) {
        butt.textContent = "Enable Edit Mode"
        window.showEditButt = false;
        for (var i = 0 ; i < elem.length ; i++) {
            elem[i].style.display = "none";
        }
    } else {
        butt.textContent = "Enable Read-Only Mode"
        window.showEditButt = true;
        for (var i = 0 ; i < elem.length ; i++) {
            elem[i].style.display = "inline";
        }
    }
}

function saveUndef(tst) {
    if (tst) {
        return tst
    } else {
        return ""
    }
}

function saveUndefKey(base, key) {
    if (base) {
        if(base.hasOwnProperty(key)) {
            return base[key]
        }
    }
    return ""
}

function saveUndefKeyKey(base, key, skey) {
    if (base) {
        if(base.hasOwnProperty(key)) {
            if(base[key].hasOwnProperty(skey)) {
                return base[key][skey]
            }
        }
    }
    return ""
}

function tarSeqHtml(base, key) {
    var has_data = true
    if (!(base) || !(base.hasOwnProperty("sequences")) || !(base.sequences.hasOwnProperty(key))) {
        has_data = false
    }
    var print_name = ""
    var elem = {}
    if (key == "forwardPrimer") {
        if (has_data == true) {
            elem = base.sequences.forwardPrimer
        }
        print_name = "Forward Primer"
    }
    if (key == "reversePrimer") {
        if (has_data == true) {
            elem = base.sequences.reversePrimer
        }
        print_name = "Reverse Primer"
    }
    if (key == "probe1") {
        if (has_data == true) {
            elem = base.sequences.probe1
        }
        print_name = "Probe 1"
    }
    if (key == "probe2") {
        if (has_data == true) {
            elem = base.sequences.probe2
        }
        print_name = "Probe 2"
    }
    if (key == "amplicon") {
        if (has_data == true) {
            elem = base.sequences.amplicon
        }
        print_name = "Amplicon"
    }
    var ret = '  <tr>\n    <td style="width:25%;">' + print_name + ' - Five Prime Tag:</td>\n'
    ret += '    <td style="width:75%"><input type="text" class="form-control" id="inTarSequences_' + key
    ret += '_fivePrimeTag" value="' + saveUndefKey(elem, "fivePrimeTag") + '"></td>\n'
    ret += '  </tr>'
    ret += '  <tr>\n    <td style="width:25%;">' + print_name + ' - Three Prime Tag:</td>\n'
    ret += '    <td style="width:75%"><input type="text" class="form-control" id="inTarSequences_' + key
    ret += '_threePrimeTag" value="' + saveUndefKey(elem, "threePrimeTag") + '"></td>\n'
    ret += '  </tr>'
    return ret
}


function htmllize(tst) {
    tst = tst.replace(/\n/g, "<br />")

    return tst
}

function niceTargetType(txt) {
    if (txt == "ref") {
        return "ref - reference target"
    }
    if (txt == "toi") {
        return "toi - target of interest"
    }
    return txt
}

function niceSampleType(txt) {
    if (txt == "") {
        return "not set - unknown sample"
    }
    if (txt == "unkn") {
        return "unkn - unknown sample"
    }
    if (txt == "ntc") {
        return "ntc - non template control"
    }
    if (txt == "nac") {
        return "nac - no amplification control"
    }
    if (txt == "std") {
        return "std - standard sample"
    }
    if (txt == "ntp") {
        return "ntp - no target present"
    }
    if (txt == "nrt") {
        return "nrt - minusRT"
    }
    if (txt == "pos") {
        return "pos - positive control"
    }
    if (txt == "opt") {
        return "opt - optical calibrator sample"
    }
    return txt
}

function niceUnitType(txt) {
    if (txt == "cop") {
        return "cop - copies per microliter"
    }
    if (txt == "fold") {
        return "fold - fold change"
    }
    if (txt == "dil") {
        return "dil - dilution (10 would mean 1:10 dilution)"
    }
    if (txt == "nMol") {
        return "nMol - nanomol per microliter"
    }
    if (txt == "ng") {
        return "ng - nanogram per microliter"
    }
    if (txt == "other") {
        return "other - other linear unit"
    }
    return txt
}

function niceLongSeq(seq) {
    var ret = ""
    for (var i = 0; i < seq.length ; i++) {
        if (i % 50 == 0) {
            if (i != 0) {
                ret += "<br />";
            }
        } else {
            if (i % 10 == 0) {
                ret += " ";
            }
        }
        ret += seq.charAt(i);
    }
    return ret
}

function getSaveHtmlData(key) {
    var el = document.getElementById(key)
    if (el) {
        return el.value
    } else {
        return ""
    }
}

function checkForUUID() {
    var uuid = ""
    var tab = ""
    var editMode = false
    window.selExperiment = ""
    window.selRun = ""

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
        if ((pKey == "EDITMODE") && (pVal == "on")) {
            editMode = true
        }
        if (pKey == "TAB") {
            tab = pVal
        }
        if (pKey == "EXP") {
            window.selExperiment = pVal
        }
        if (pKey == "RUN") {
            window.selRun = pVal
        }
        if (pKey == "ID") {
            window.selIdOnLoad = pVal
        }
    }
    if (tab != "") {
        $('[href="#' + tab + '"]').tab('show')
    }
    if (uuid != "") {
        updateServerData(uuid, '{"mode": "upload", "validate": true}')
        if (editMode) {
            var butt = document.getElementById('btn-show-edit-buttons')
            var elem = document.getElementsByClassName('rdml-btn-edit');
            butt.textContent = "Enable Read-Only Mode"
            window.showEditButt = true;
            for (var i = 0 ; i < elem.length ; i++) {
                elem[i].style.display = "inline";
            }
        }
    }
}

$('#mainTab a').on('click', function(e) {
    e.preventDefault()
    $(this).tab('show')
})

function showExample() {
    updateServerData("example", '{"mode": "upload", "validate": true}')
    $('[href="#experiments-tab"]').tab('show')
}

function showUpload() {
    updateServerData("data", '{"mode": "upload", "validate": true}')
    $('[href="#experiments-tab"]').tab('show')
}

function showCreateNew() {
    updateServerData("createNew", '{"mode": "new", "validate": false}')
    $('[href="#experiments-tab"]').tab('show')
    showEditButtons();
}

function showSave() {
    var elem = document.getElementById('download-link')
    elem.click()
}

// TODO client-side validation
function updateServerData(stat, reqData) {
    const formData = new FormData()
    if (stat == "example") {
        formData.append('showExample', 'showExample')
    } else if (stat == "data") {
        formData.append('queryFile', inputFile.files[0])
    } else if (stat == "createNew") {
        formData.append('createNew', 'createNew')
    } else {
        formData.append('uuid', stat)
        var checkReq = JSON.parse(reqData)
        if (checkReq.hasOwnProperty("tableUploadAmplification") && (checkReq["tableUploadAmplification"] == true)) {
            formData.append('tableUploadAmplification', document.getElementById("inRunUploadAmplification").files[0])
        }
        if (checkReq.hasOwnProperty("tableUploadMelting") && (checkReq["tableUploadMelting"] == true)) {
            formData.append('tableUploadMelting', document.getElementById("inRunUploadMelting").files[0])
        }
        if (checkReq.hasOwnProperty("tableUploadDigOverview") && (checkReq["tableUploadDigOverview"] == true)) {
            formData.append('tableUploadDigOverview', document.getElementById("inRunUploadDigOverview").files[0])
        }
        if (checkReq.hasOwnProperty("tableUploadDigWells") && (checkReq["tableUploadDigWells"] == true)) {
            var inputFiles = document.getElementById("inRunUploadDigWells");
            formData.append('tableUploadDigWellsCount', inputFiles.files.length);
            for (var i = 0 ; i < inputFiles.files.length ; i++) {
                formData.append('tableUploadDigWell_' + i, inputFiles.files[i]);
            }
        }
        if (checkReq.hasOwnProperty("tableUploadAnnotation") && (checkReq["tableUploadAnnotation"] == true)) {
            formData.append('tableUploadAnnotation', document.getElementById("inSamUploadAnnotation").files[0])
        }
    }
    formData.append('reqData', reqData)

    hideElement(resultError)
    showElement(resultInfo)
    window.errorMessage = "";

    axios
        .post(`${API_URL}/data`, formData)
        .then(res => {
	        if (res.status === 200) {
                resetAllGlobalVal()
                debugData.value = JSON.stringify(res.data.data, null, 2)
                window.rdmlData = res.data.data.filedata
                window.uuid = res.data.data.uuid
                rdmlLibVersion.innerHTML = "rdmlpython version: " + res.data.data.rdml_lib_version
                if (res.data.data.hasOwnProperty("isvalid")) {
                    if (res.data.data.isvalid) {
                        window.isvalid = "valid"
                    } else {
                        window.isvalid = "invalid"
                    }
                } else {
                    window.isvalid = "untested"
                }
                hideElement(resultInfo)
                if (res.data.data.hasOwnProperty("error")) {
                    window.errorMessage = res.data.data.error;
                    showElement(resultError)
                    var err = '<i class="fas fa-fire"></i>\n<span id="error-message">'
                    err += window.errorMessage + '</span>'
                    resultError.innerHTML = err
                } else {
                    window.errorMessage = "";
                    hideElement(resultError)
                }
                if (res.data.data.hasOwnProperty("exporttable")) {
                    saveFile("data_export.tsv", res.data.data.exporttable, "tsv")
                }
                updateClientData()
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
            window.errorMessage += " " + errorMessage
            var err = '<i class="fas fa-fire"></i>\n<span id="error-message">'
            err += window.errorMessage + '</span>'
            resultError.innerHTML = err
        })
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
    alert("Unknown Browser: Functionality may be impaired!\n\n" +browser);
    return browser;
}

window.saveFile = saveFile;
function saveFile(fileName,content,type) {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style.display = "none";
    var blob;
    if (type == "tsv") {
        blob = new Blob([content], {type: "text/tab-separated-values"});
    } else if (type == "svg") {
        blob = new Blob([content], {type: "image/svg+xml"});
    } else {
        blob = new Blob([content], {type: "text/plain"});
    }
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
    return "";
};



function htmlTriState(desc, div, tag, base, key, trV, faV, unV) {
    var ret = '  <tr>\n    <td style="width:' + (100-div) + '%;">' + desc + ':</td>\n'
    ret += '    <td style="width:' + div + '%;padding:10px;">\n'
    ret += '    <input type="radio" name="' + tag + '_radios" id="' + tag + '_true" value="true"'
    if (base.hasOwnProperty(key) && ((base[key] == true) || (base[key].toLowerCase() == "true"))){
        ret += ' checked'
    }
    ret += '>&nbsp;' + trV + "&nbsp;&nbsp;&nbsp;&nbsp;"
    ret += '    <input type="radio" name="' + tag + '_radios" id="' + tag + '_false" value="false"'
    if (base.hasOwnProperty(key) && ((base[key] == false) || (base[key].toLowerCase() == "false"))) {
        ret += ' checked'
    }
    ret += '>&nbsp;' + faV + "&nbsp;&nbsp;&nbsp;&nbsp;"
    ret += '    <input type="radio" name="' + tag + '_radios" id="' + tag + '_absent" value=""'
    if (!(base.hasOwnProperty(key))) {
        ret += ' checked'
    }
    ret += '>&nbsp;' + unV + '</tr>'
    return ret
}

function readTriState(tag) {
    var elem = document.getElementsByName(tag + '_radios')
    for (var i = 0 ; i < elem.length ; i++) {
        if (elem[i].checked) {
            return elem[i].value
        }
    }
    return ""
}

function htmlUnitSelector(tag, base) {
    var val = ""
    if (typeof base !== 'undefined') {
        if (base.hasOwnProperty("unit")) {
            val = base["unit"]
        }
    }
    var ret = '<select class="form-control" id="' + tag + '">\n'
    ret += '        <option value=""'
    if (val == "") {
        ret += ' selected'
    }
    ret += '>not set</option>\n'
    ret += '        <option value="cop"'
    if (val == "cop") {
        ret += ' selected'
    }
    ret += '>cop - copies per microliter</option>\n'
    ret += '        <option value="fold"'
    if (val == "fold") {
        ret += ' selected'
    }
    ret += '>fold - fold change</option>\n'
    ret += '        <option value="dil"'
    if (val == "dil") {
        ret += ' selected'
    }
    ret += '>dil - dilution (10 would mean 1:10 dilution)</option>\n'
    ret += '        <option value="nMol"'
    if (val == "nMol") {
        ret += ' selected'
    }
    ret += '>nMol - nanomol per microliter</option>\n'
    ret += '        <option value="ng"'
    if (val == "ng") {
        ret += ' selected'
    }
    ret += '>ng - nanogram per microliter</option>\n'
    ret += '        <option value="other"'
    if (val == "other") {
        ret += ' selected'
    }
    ret += '>other - other linear unit</option>\n'
    ret += '      </select></td>\n'
    return ret
}

window.createLinkBox = createLinkBox
function createLinkBox(apiLink, apiURL, toolhtml, uuuid, valid, experiment = "", run = "") {
    // The UUID box
    if (experiment == "") {
        run = "";
    }
    if (!(experiment == "")) {
        experiment = ';EXP=' + encodeURIComponent(experiment);
    }
    if (!(run == "")) {
        run = ';RUN=' + encodeURIComponent(run);
    }

    var ret = '<br /><div class="card">\n<div class="card-body">\n'
    ret += '<h5 class="card-title">Links to other RDML tools</h5>\n<p>Link to this result page:<br />'
    ret += '<a href="' + apiLink + toolhtml + "?UUID=" + uuuid + ';TAB=runs-tab'
    ret += experiment + run + '" target="_blank">'
    ret += apiLink + toolhtml + "?UUID=" + uuuid + ';TAB=runs-tab'
    ret += experiment + run + '</a> (valid for 3 days)\n<br />\n'
    ret += '</p>\n'
    ret += '<p>Download RDML file:<br />'
    var stuffer = new Date();
    var stufferStr = stuffer.getTime()
    ret += '<a href="' + apiURL + "/download/" + uuuid + '?UNIQUE=' + stufferStr
    ret += '" target="_blank" id="download-link">'
    ret += apiURL + "/download/" + uuuid + '</a> (valid for 3 days)\n<br />\n'
    ret += '</p>\n'
    if (!(toolhtml == 'edit.html')) {
        ret += '<p>View or edit RDML file:<br />'
        ret += '<a href="' + apiLink + "edit.html?UUID=" + uuuid + ';TAB=experiments-tab'
        ret += experiment + run + '" target="_blank">'
        ret += apiLink  + "edit.html?UUID=" + uuuid + ';TAB=experiments-tab'
        ret += experiment + run + '</a> (valid for 3 days)\n<br />\n</p>\n'
    }
    if (!(toolhtml == 'runedit.html')) {
        ret += '<p>Edit a single Run in RunEdit:<br />'
        ret += '<a href="' + apiLink + "runedit.html?UUID=" + uuuid + ';TAB=runs-tab'
        ret += experiment + run + '" target="_blank">'
        ret += apiLink  + "runedit.html?UUID=" + uuuid + ';TAB=runs-tab'
        ret += experiment + run + '</a> (valid for 3 days)\n<br />\n</p>\n'
    }
    if (!(toolhtml == 'annotationedit.html')) {
        ret += '<p>Modify the annotations with AnnotationEdit:<br />'
        ret += '<a href="' + apiLink + "annotationedit.html?UUID=" + uuuid + ';TAB=runs-tab'
        ret += experiment + run + '" target="_blank">'
        ret += apiLink  + "annotationedit.html?UUID=" + uuuid + ';TAB=runs-tab'
        ret += experiment + run + '</a> (valid for 3 days)\n<br />\n</p>\n'
    }
    if (!(toolhtml == 'runanalysis.html')) {
        ret += '<p>Analyze Run in RunAnalysis:<br />'
        ret += '<a href="' + apiLink + "runanalysis.html?UUID=" + uuuid + ';TAB=runs-tab'
        ret += experiment + run + '" target="_blank">'
        ret += apiLink  + "runanalysis.html?UUID=" + uuuid + ';TAB=runs-tab'
        ret += experiment + run + '</a> (valid for 3 days)\n<br />\n</p>\n'
    }
    if (!(toolhtml == 'experimentanalysis.html')) {
        ret += '<p>Analyze Experiment in ExperimentAnalysis:<br />'
        ret += '<a href="' + apiLink + "experimentanalysis.html?UUID=" + uuuid + ';TAB=runs-tab'
        ret += experiment + run + '" target="_blank">'
        ret += apiLink  + "experimentanalysis.html?UUID=" + uuuid + ';TAB=runs-tab'
        ret += experiment + run + '</a> (valid for 3 days)\n<br />\n</p>\n'
    }
    if (!(toolhtml == 'runview.html')) {
        ret += '<p>View single run in RunView:<br />'
        ret += '<a href="' + apiLink + "runview.html?UUID=" + uuuid + ';TAB=runs-tab'
        ret += experiment + run + '" target="_blank">'
        ret += apiLink  + "runview.html?UUID=" + uuuid + ';TAB=runs-tab'
        ret += experiment + run + '</a> (valid for 3 days)\n<br />\n</p>\n'
    }
    if (!(toolhtml == 'validate.html')) {
        if (valid == "untested") {
            ret += '<p>Click here to validate RDML file:<br />'
        }
        if (valid == "valid") {
            ret += '<p>File is valid RDML! Click here for more information:<br />'
        }
        if (valid == "invalid") {
            ret += '<p>File is not valid RDML! Click here for more information:<br />'
        }
        ret += '<a href="' + apiLink + "validate.html?UUID=" + uuuid + '" target="_blank">'
        ret += apiLink + "validate.html?UUID=" + uuuid + '</a> (valid for 3 days)\n<br />\n</p>\n'
    }
    ret += '<p>Remove Uploaded Data from Server:<br />'
    ret += '<a href="' + apiLink + "remove.html?UUID=" + uuuid + '" target="_blank">'
    ret += apiLink  + "remove.html?UUID=" + uuuid + '</a> (valid for 3 days)\n<br />\n'
    ret += '</p>\n</div>\n</div>\n'
    return ret;
}

function updateClientData() {
    // The UUID box
    var ret = '<br />' + createLinkBox(`${API_LINK}`, `${API_URL}`, 'edit.html', window.uuid, window.isvalid, window.selExperiment, window.selRun);
    if (window.isvalid == "invalid") {
        var errT = '<i class="fas fa-fire"></i>\n<span id="error-message">'
        errT += 'Error: Uploaded file is not valid RDML! (<a href="' + `${API_LINK}` +
                '/help.html#RDML-FixBrokenRDML" target="_blank">click to read more</a>) '
        errT += window.errorMessage + '</span>'
        resultError.innerHTML = errT
        showElement(resultError)
    }
    resultLink.innerHTML = ret

    if (!(window.rdmlData.hasOwnProperty("rdml"))) {
        deleteAllData()
        return
    }
    var ret = ''

    // The Experiments tab
    var exp = window.rdmlData.rdml.experiments;
    ret = ''
    for (var i = 0; i < exp.length; i++) {
        if ((editMode == true) && (editType == "experiment") && (i == editNumber)) {
            ret += '<br /><div class="card text-white bg-primary">\n<div class="card-body">\n'
            ret += '<h5 class="card-title">' + (i + 1) + '. Thermal Cycling Conditions ID: ' + exp[i].id + '</h5>\n<p>'
            ret += '<table style="width:100%;">'
            ret += '  <tr>\n    <td style="width:25%;background-color:#cc7a00;">ID:</td>\n'
            ret += '    <td style="width:75%"><input type="text" class="form-control" '
            ret += 'id="inExId" value="'+ exp[i].id + '"></td>\n'
            ret += '  </tr>'
            ret += '  <tr>\n    <td style="width:25%;">Place at Position:</td>\n'
            ret += '    <td style="width:75%"><input type="text" class="form-control" '
            ret += 'id="inPos" value="' + (i + 1) + '"></td>\n'
            ret += '  </tr>'
            ret += '  <tr>\n    <td style="width:25%;">Description:</td>\n'
            ret += '    <td style="width:75%"><input type="text" class="form-control" '
            ret += 'id="inExDescription" value="'+ saveUndef(exp[i].description) + '"></td>\n'
            ret += '  </tr>'
            ret += '</table></p>\n'
            ret += '<button type="button" class="btn btn-success" '
            ret += 'onclick="saveEditElement(\'experiment\', ' + i + ', \'' + exp[i].id + '\');">Save Changes</button>'
            ret += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button type="button" class="btn btn-success" '
            ret += 'onclick="deleteEditElement(\'experiment\', ' + i + ');">Delete</button>&nbsp;&nbsp;&nbsp;'
            ret += '</div>\n</div>\n'
        } else {
            ret += '<br /><div class="card">\n<div class="card-body">\n'
            ret += '<h5 class="card-title">' + (i + 1) + '. Experiment ID: ' + exp[i].id + '</h5>\n<p>'
            ret += '<div class="card">\n<div class="card-body">\n'
            ret += '<h5 class="card-title">Runs:</h5>\n'
            var runs = exp[i].runs
            for (var s = 0 ; s < runs.length ; s++){
                ret += '<div class="card">\n<div class="card-body">\n'
                ret += '<h5 class="card-title">Run ID: ' + runs[s].id + '</h5>\n'
                ret += '<table style="width:100%;">'
                if (runs[s].hasOwnProperty("runDate")) {
                    ret += '  <tr>\n    <td style="width:25%;">Run Date:</td>\n'
                    ret += '    <td style="width:75%">' + runs[s].runDate + '</td>\n'
                    ret += '  </tr>'
                }
                if (runs[s].hasOwnProperty("thermalCyclingConditions")) {
                    ret += '  <tr>\n    <td style="width:25%;">Thermal Cycling Conditions:</td>\n'
                    ret += '    <td style="width:75%">' + runs[s].thermalCyclingConditions + '</td>\n'
                    ret += '  </tr>'
                    // Todo: Add link
                }
                if (runs[s].hasOwnProperty("cqDetectionMethod")) {
                    ret += '  <tr>\n    <td style="width:25%;">Cq Detection Method:</td>\n'
                    ret += '    <td style="width:75%">' + runs[s].cqDetectionMethod + '</td>\n'
                    ret += '  </tr>'
                }
                if (runs[s].hasOwnProperty("backgroundDeterminationMethod")) {
                    ret += '  <tr>\n    <td style="width:25%;">Background Determination Method:</td>\n'
                    ret += '    <td style="width:75%">' + runs[s].backgroundDeterminationMethod + '</td>\n'
                    ret += '  </tr>'
                }
                ret += '  <tr>\n    <td style="width:25%;">PCR Format - Columns:</td>\n'
                ret += '    <td style="width:75%">\n'+ runs[s].pcrFormat.columns + '</td>\n'
                ret += '  </tr>'
                ret += '  <tr>\n    <td style="width:25%;">PCR Format - Column Label:</td>\n'
                ret += '    <td style="width:75%">\n'+ runs[s].pcrFormat.columnLabel + '</td>\n'
                ret += '  </tr>'
                ret += '  <tr>\n    <td style="width:25%;">PCR Format - Rows:</td>\n'
                ret += '    <td style="width:75%">\n'+ runs[s].pcrFormat.rows + '</td>\n'
                ret += '  </tr>'
                ret += '  <tr>\n    <td style="width:25%;">PCR Format - Row Label:</td>\n'
                ret += '    <td style="width:75%">\n'+ runs[s].pcrFormat.rowLabel + '</td>\n'
                ret += '  </tr>'
                if (runs[s].hasOwnProperty("instrument")) {
                    ret += '  <tr>\n    <td style="width:25%;">Instrument:</td>\n'
                    ret += '    <td style="width:75%">' + runs[s].instrument + '</td>\n'
                    ret += '  </tr>'
                }
                if (runs[s].hasOwnProperty("dataCollectionSoftware")) {
                    if (runs[s].dataCollectionSoftware.hasOwnProperty("name")) {
                      ret += '  <tr>\n    <td style="width:25%;">Software - Name:</td>\n'
                      ret += '    <td style="width:75%">\n'+ runs[s].dataCollectionSoftware.name + '</td>\n'
                      ret += '  </tr>'
                    }
                    if (runs[s].dataCollectionSoftware.hasOwnProperty("version")) {
                      ret += '  <tr>\n    <td style="width:25%;">Software - Version:</td>\n'
                      ret += '    <td style="width:75%">\n'+ runs[s].dataCollectionSoftware.version + '</td>\n'
                      ret += '  </tr>'
                    }
                }
                ret += '  <tr>\n    <td style="width:25%;">Number of Reactions:</td>\n'
                ret += '    <td style="width:75%">\n'+ runs[s].react + '</td>\n'
                ret += '  </tr>\n</table>'
                ret += '<a href="' + `${API_LINK}` + "runanalysis.html?UUID=" + window.uuid + ';TAB=runs-tab'
                ret += ';EXP=' + encodeURIComponent(exp[i].id) + ';RUN=' + encodeURIComponent(runs[s].id) + '" '
                ret += 'target="_blank">Analyze Run in RunAnalysis</a><br />\n'
                ret += '</p>\n'

                var k = 0
                var xref = '<div class="card">\n<div class="card-body">\n'
                xref += '<h5 class="card-title">Experimenters:</h5>\n'
                xref += '<table style="width:100%;">'
                if (runs[s].hasOwnProperty("experimenters")) {
                    k = runs[s].experimenters.length
                    for (var j = 0; j < k; j++) {
                        xref += '  <tr>\n    <td style="width:75%;">'
                        xref += saveUndef(runs[s].experimenters[j]) + '</td>\n'
                        // Todo make link
                        xref += '    <td style="width:25%">\n'
                        if (j == 0) {
                            xref += '<button type="button" class="btn btn-success rdml-btn-edit btn-sm disabled">Move Up</button>&nbsp;&nbsp;'
                        } else {
                            xref += '<button type="button" class="btn btn-success rdml-btn-edit btn-sm" '
                            xref += 'onclick="moveSecElement(\'experiment\', ' + i + ', \'run\', ' + s + ', \'experimenter\', ' + j
                            xref += ', ' + (j - 1) + ');">Move Up</button>&nbsp;&nbsp;'
                        }
                        if (j == k - 1) {
                            xref += '<button type="button" class="btn btn-success rdml-btn-edit btn-sm disabled">Move Down</button>&nbsp;&nbsp;&nbsp;'
                        } else {
                            xref += '<button type="button" class="btn btn-success rdml-btn-edit btn-sm" '
                            xref += 'onclick="moveSecElement(\'experiment\', ' + i + ', \'run\', ' + s + ', \'experimenter\', ' + j
                            xref += ', ' + (j + 2) + ');">Move Down</button>'
                        }
                        xref += '</td>\n  </tr>'
                    }
                }
                xref += '</table></p>\n'
                xref += '</div>\n</div><br />\n'
                if (k > 0) {
                    ret += xref
                }
                ret += '<div id="pExp-experiment-' + i + '-run-' + s + '"></div>'

                var idoc = '<div class="card">\n<div class="card-body">\n'
                idoc += '<h5 class="card-title">Documentation:</h5>\n'
                var desc = saveUndef(runs[s].description)
                if (desc != "") {
                    idoc += '<p>' + desc + '</p>'
                }
                idoc += '<button type="button" class="btn btn-success btn-sm" '
                idoc += ' onclick="showDocSecElement(\'experiment\', ' + i + ', \'run\', ' + s + ', \'documentation\', '
                idoc += '\'pDoc-experiment-' + i + '-run-' + s + '\', this);">Show All Document Information</button>'
                idoc += '&nbsp;&nbsp;<button type="button" class="btn btn-success rdml-btn-edit btn-sm" '
                idoc += 'onclick="selectSecElement(\'experiment\', ' + i + ', \'run\', ' + s + ', \'documentation\', '
                idoc += '\'pDoc-experiment-' + i + '-run-' + s + '\');">Change Attached Document Ids</button>'
                idoc += '<div id="pDoc-experiment-' + i + '-run-' + s + '"></div>'
                idoc += '</div>\n</div><br />\n'
                ret += idoc

                ret += '<button type="button" class="btn btn-success btn-sm" '
                ret += 'onclick="exportTable(\'' + exp[i].id + '\', \'' + runs[s].id + '\', \'amp\');"'
                ret += '>Export Amplification Data</button>&nbsp;&nbsp;'
                ret += '<button type="button" class="btn btn-success btn-sm" '
                ret += 'onclick="exportTable(\'' + exp[i].id + '\', \'' + runs[s].id + '\', \'melt\');"'
                ret += '>Export Melting Data</button>&nbsp;&nbsp;'

                ret += '<button type="button" class="btn btn-success rdml-btn-edit btn-sm" '
                ret += 'onclick="newEditRun(' + i + ', ' + s + ', \'' + exp[i].id + '\');">Edit Run</button>&nbsp;&nbsp;'
                ret += '<button type="button" class="btn btn-success rdml-btn-edit btn-sm" '
                ret += 'onclick="selectSecElement(\'experiment\', ' + i + ', \'run\', ' + s + ', \'experimenter\', '
                ret += '\'pExp-experiment-' + i + '-run-' + s + '\');"">Change Attached Experimenters</button>&nbsp;&nbsp;&nbsp;&nbsp;'
                if (i == 0) {
                    ret += '<button type="button" class="btn btn-success rdml-btn-edit btn-sm disabled">Move Up</button>&nbsp;&nbsp;'
                } else {
                    ret += '<button type="button" class="btn btn-success rdml-btn-edit btn-sm" '
                ret += 'onclick="moveEditElement(\'experiment\', \'' + exp[i].id + '\', ' + (i - 1) + ');">Move Up</button>&nbsp;&nbsp;'
                }
                if (i == exp.length - 1) {
                    ret += '<button type="button" class="btn btn-success rdml-btn-edit btn-sm disabled">Move Down</button>&nbsp;&nbsp;&nbsp;'
                } else {
                    ret += '<button type="button" class="btn btn-success rdml-btn-edit btn-sm" '
                ret += 'onclick="moveEditElement(\'experiment\', \'' + exp[i].id + '\', ' + (i + 2) + ');">Move Down</button>&nbsp;&nbsp;&nbsp;'
                }
                ret += '<button type="button" class="btn btn-success rdml-btn-edit btn-sm" '
                ret += 'onclick="deleteSecElement(\'experiment\', ' + i + ', \'\', 0, \'run\', ' + s
                ret += ');">Delete Run</button>&nbsp;&nbsp;'
                ret += '</div>\n</div><br />\n'
            }

            ret += '<div id="pRun-experiment-' + i + '"></div>'

            ret += '<button type="button" class="btn btn-success rdml-btn-edit btn-sm" '
            ret += 'onclick="newEditRun(' + i + ', 999999, \'' + exp[i].id + '\');">New Run</button>'
            ret += '</div>\n</div><br />\n'

            var doc = '<div class="card">\n<div class="card-body">\n'
            doc += '<h5 class="card-title">Documentation:</h5>\n'
            var desc = saveUndef(exp[i].description)
            if (desc != "") {
                doc += '<p>' + desc + '</p>'
            }
            doc += '<button type="button" class="btn btn-success btn-sm" '
            doc += ' onclick="showDocSecElement(\'experiment\', ' + i + ', \'\', 0, \'documentation\', '
            doc += '\'pDoc-experiment-' + i + '\', this);">Show All Document Information</button>'
            doc += '&nbsp;&nbsp;<button type="button" class="btn btn-success rdml-btn-edit btn-sm" '
            doc += 'onclick="selectSecElement(\'experiment\', ' + i + ', \'\', 0, \'documentation\', '
            doc += '\'pDoc-experiment-' + i + '\');">Change Attached Document Ids</button>'
            doc += '<div id="pDoc-experiment-' + i + '"></div>'
            doc += '</div>\n</div><br />\n'
            ret += doc

            ret += '<button type="button" class="btn btn-success rdml-btn-edit" '
            ret += 'onclick="editPresentElement(\'experiment\', ' + i + ');">Edit</button>&nbsp;&nbsp;&nbsp;&nbsp;'
            ret += '<button type="button" class="btn btn-success rdml-btn-edit" '
            ret += 'onclick="selectSecElement(\'experiment\', ' + i + ', \'\', 0, \'experimenter\', '
            ret += '\'pExp-therm_cyc_cons-' + i + '\');"">Change Attached Experimenters</button>&nbsp;&nbsp;&nbsp;&nbsp;'
            if (i == 0) {
                ret += '<button type="button" class="btn btn-success rdml-btn-edit disabled">Move Up</button>&nbsp;&nbsp;'
            } else {
                ret += '<button type="button" class="btn btn-success rdml-btn-edit" '
            ret += 'onclick="moveEditElement(\'experiment\', \'' + exp[i].id + '\', ' + (i - 1) + ');">Move Up</button>&nbsp;&nbsp;'
            }
            if (i == exp.length - 1) {
                ret += '<button type="button" class="btn btn-success rdml-btn-edit disabled">Move Down</button>&nbsp;&nbsp;&nbsp;'
            } else {
                ret += '<button type="button" class="btn btn-success rdml-btn-edit" '
            ret += 'onclick="moveEditElement(\'experiment\', \'' + exp[i].id + '\', ' + (i + 2) + ');">Move Down</button>&nbsp;&nbsp;&nbsp;'
            }
            ret += '&nbsp;<button type="button" class="btn btn-success rdml-btn-edit" '
            ret += 'onclick="deleteEditElement(\'experiment\', ' + i + ');">Delete</button>&nbsp;&nbsp;&nbsp;'
            ret += '</div>\n</div>\n'
        }
    }
    experimentsData.innerHTML = ret

    // The samples tab
    var exp = window.rdmlData.rdml.samples;
    ret = ''
    for (var i = 0; i < exp.length; i++) {
        if ((editMode == true) && (editType == "sample") && (i == editNumber)) {
            ret += '<br /><div class="card text-white bg-primary">\n<div class="card-body">\n'
            ret += '<h5 class="card-title">' + (i + 1) + '. Sample ID: ' + exp[i].id + '</h5>\n<p>'
            ret += '<table style="width:100%;">'
            ret += '  <tr>\n    <td style="width:25%;background-color:#cc7a00;">ID:</td>\n'
            ret += '    <td style="width:75%"><input type="text" class="form-control" '
            ret += 'id="inSampId" value="'+ exp[i].id + '"></td>\n'
            ret += '  </tr>'
            if (["1.3", "1.4"].includes(window.rdmlData.rdml.version)) {
                ret += htmlTriState("Double Stranded", 75, "inDoubleStranded", exp[i],
                    "doubleStranded", "Yes", "No", "Not Set")            }
            ret += '  <tr>\n    <td style="width:25%;">Type:</td>\n'
            ret += '    <td style="width:75%"><select class="form-control" id="inSampType">\n'
            ret += '        <option value="unkn"'
            if (exp[i].types.length == 0 || exp[i].types[0].type == "unkn") {
                ret += ' selected'
            }
            ret += '>unkn - unknown sample</option>\n'
            ret += '        <option value="ntc"'
            if (exp[i].types.length > 0 && exp[i].types[0].type == "ntc") {
                ret += ' selected'
            }
            ret += '>ntc  - non template control</option>\n'
            ret += '        <option value="nac"'
            if (exp[i].types.length > 0 && exp[i].types[0].type == "nac") {
                ret += ' selected'
            }
            ret += '>nac  - no amplification control</option>\n'
            ret += '        <option value="std"'
            if (exp[i].types.length > 0 && exp[i].types[0].type == "std") {
                ret += ' selected'
            }
            ret += '>std  - standard sample</option>\n'
            ret += '        <option value="ntp"'
            if (exp[i].types.length > 0 && exp[i].types[0].type == "ntp") {
                ret += ' selected'
            }
            ret += '>ntp  - no target present</option>\n'
            ret += '        <option value="nrt"'
            if (exp[i].types.length > 0 && exp[i].types[0].type == "nrt") {
                ret += ' selected'
            }
            ret += '>nrt  - minusRT</option>\n'
            ret += '        <option value="pos"'
            if (exp[i].types.length > 0 && exp[i].types[0].type == "pos") {
                ret += ' selected'
            }
            ret += '>pos  - positive control</option>\n'
            ret += '        <option value="opt"'
            if (exp[i].types.length > 0 && exp[i].types[0].type == "opt") {
                ret += ' selected'
            }
            ret += '>opt  - optical calibrator sample</option>\n'
            ret += '      </select></td>\n'
            ret += '  </tr>'
            if (["1.3", "1.4"].includes(window.rdmlData.rdml.version)) {
                ret += '  <tr>\n    <td style="width:25%;">Target for Type:</td>\n'
                ret += '    <td style="width:75%">'
                var selTypeTarget = ""
                if (exp[i].types.length > 0 && (exp[i].types[0].hasOwnProperty("targetId")) && (exp[i].types[0].targetId != "")) {
                    selTypeTarget = exp[i].types[0].targetId
                }
                ret += '<select class="form-control" id="inSampTypeTarget">\n'
                var allTargets = window.rdmlData.rdml.targets;
                ret += '        <option value=""'
                if (selTypeTarget == "") {
                    ret += ' selected'
                }
                ret += '>not set</option>\n'
                for (var cc = 0; cc < allTargets.length; cc++) {
                    ret += '        <option value="' + allTargets[cc].id + '"'
                    if (selTypeTarget == allTargets[cc].id) {
                        ret += ' selected'
                    }
                    ret += '>' + allTargets[cc].id + '</option>\n'
                }
                ret += '</select>\n</td>\n'
                ret += '  </tr>'
            }
            ret += '  <tr>\n    <td style="width:25%;">Quantity:</td>\n'
            ret += '    <td style="width:75%"><table style="width:100%;">'
            ret += '      <tr><td style="width:50%;">'
            ret += '        <input type="text" class="form-control" id="inExpQuantity_Value" value="'
            if (exp[i].quantitys.length > 0) {
                ret += saveUndefKey(exp[i].quantitys[0], "value")
            }
            ret += '">        </td>\n<td style="width:50%">'
            if (exp[i].quantitys.length > 0) {
                ret += htmlUnitSelector("inExpQuantity_Unit", exp[i].quantitys[0])
            } else {
                ret += htmlUnitSelector("inExpQuantity_Unit", "")
            }
            ret += '</td>\n</tr>\n</table>  </tr>'
            if (["1.3", "1.4"].includes(window.rdmlData.rdml.version)) {
                ret += '  <tr>\n    <td style="width:25%;">Target for Quantity:</td>\n'
                ret += '    <td style="width:75%">'
                var selQuantTarget = ""
                if ((exp[i].quantitys.length > 0) &&
                    (exp[i].quantitys[0].hasOwnProperty("targetId")) &&
                    (exp[i].quantitys[0].targetId != "")) {
                    selQuantTarget = exp[i].quantitys[0].targetId
                }
                ret += '<select class="form-control" id="inSampQuantTarget">\n'
                var allTargets = window.rdmlData.rdml.targets;
                ret += '        <option value=""'
                if (selQuantTarget == "") {
                    ret += ' selected'
                }
                ret += '>not set</option>\n'
                for (var cc = 0; cc < allTargets.length; cc++) {
                    ret += '        <option value="' + allTargets[cc].id + '"'
                    if (selQuantTarget == allTargets[cc].id) {
                        ret += ' selected'
                    }
                    ret += '>' + allTargets[cc].id + '</option>\n'
                }
                ret += '</select>\n</td>\n'
                ret += '  </tr>'
            }
            ret += '</table></p>\n'
            ret += '<button type="button" class="btn btn-success" '
            ret += 'onclick="saveEditElement(\'sample\', ' + i + ', \'' + exp[i].id + '\');">Save Changes</button>'
            ret += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button type="button" class="btn btn-success" '
            ret += 'onclick="deleteEditElement(\'sample\', ' + i + ');">Delete</button>'
            ret += '<br /><br /><br />\n'

            ret += '<h5 class="card-title">Advanced:</h5>\n'
            ret += '<p><table style="width:100%;">'
            ret += '  <tr>\n    <td style="width:25%;">Method of modification:</td>\n'
            ret += '    <td style="width:75%"><select class="form-control" id="inSampIdUnique">\n'
            ret += '        <option value=false selected>Id must be unique and will be renamed</option>\n'
            ret += '        <option value=true>Change all its uses to existing Id (dangerous - may corrupt data)</option>\n'
            ret += '      </select></td>\n'
            ret += '  </tr>'
            ret += '  <tr>\n    <td style="width:25%;">Place at Position:</td>\n'
            ret += '    <td style="width:75%"><input type="text" class="form-control" '
            ret += 'id="inPos" value="' + (i + 1) + '"></td>\n'
            ret += '  </tr>'
            ret += '  <tr>\n    <td style="width:25%;">Description:</td>\n'
            ret += '    <td style="width:75%"><input type="text" class="form-control" '
            ret += 'id="inExpDescription" value="'+ saveUndef(exp[i].description) + '"></td>\n'
            ret += '  </tr>'
            ret += htmlTriState("Calibrator Sample", 75, "inExpCalibratorSample", exp[i],
                                "calibratorSample", "Yes", "No", "Not Set")
            ret += htmlTriState("Inter Run Calibrator", 75,"inExpInterRunCalibrator", exp[i],
                                "interRunCalibrator", "Yes", "No", "Not Set")
            ret += '  <tr>\n    <td style="width:25%;">cDNA - Enzyme:</td>\n'
            ret += '    <td style="width:75%"><input type="text" class="form-control" '
            ret += 'id="inExpCdnaSynthesisMethod_enzyme" value="'
            ret += saveUndefKey(exp[i].cdnaSynthesisMethod, "enzyme") + '"></td>\n'
            ret += '  </tr>'
            ret += '  <tr>\n    <td style="width:25%;">cDNA - Priming Method:</td>\n'
            ret += '    <td style="width:75%"><select class="form-control" id="inExpCdnaSynthesisMethod_primingMethod">\n'
            ret += '        <option value=""'
            var primMeth = saveUndefKey(exp[i].cdnaSynthesisMethod, "primingMethod")
            if (primMeth == "") {
                ret += ' selected'
            }
            ret += '>not set</option>\n'
            ret += '        <option value="oligo-dt"'
            if (primMeth == "oligo-dt") {
                ret += ' selected'
            }
            ret += '>oligo-dt</option>\n'
            ret += '        <option value="random"'
            if (primMeth == "random") {
                ret += ' selected'
            }
            ret += '>random</option>\n'
            ret += '        <option value="target-specific"'
            if (primMeth == "target-specific") {
                ret += ' selected'
            }
            ret += '>target-specific</option>\n'
            ret += '        <option value="oligo-dt and random"'
            if (primMeth == "oligo-dt and random") {
                ret += ' selected'
            }
            ret += '>oligo-dt and random</option>\n'
            ret += '        <option value="other"'
            if (primMeth == "other") {
                ret += ' selected'
            }
            ret += '>other</option>\n'
            ret += '      </select></td>\n'
            ret += '  </tr>'
            var newBaseCyc = {}
            if (exp[i].hasOwnProperty("cdnaSynthesisMethod")) {
                newBaseCyc = exp[i].cdnaSynthesisMethod
            }
            ret += htmlTriState("cDNA - DNase Treatment", 85,"inExpCdnaSynthesisMethod_dnaseTreatment", newBaseCyc,
                                "dnaseTreatment", "Yes", "No", "Not Set")
            ret += '  <tr>\n    <td style="width:25%;">cDNA - Thermal Cycling Conditions:</td>\n'
            ret += '    <td style="width:75%">'
            var cycProt = saveUndefKey(exp[i].cdnaSynthesisMethod, "thermalCyclingConditions")
            ret += '<select class="form-control" id="inExpCdnaSynthesisMethod_thermalCyclingConditions">\n'
            ret += '        <option value=""'
            if (cycProt == "") {
                ret += ' selected'
            }
            ret += '>not set</option>\n'
            var allCycs = window.rdmlData.rdml.therm_cyc_cons;
            for (var cc = 0; cc < allCycs.length; cc++) {
                ret += '        <option value="' + allCycs[cc].id + '"'
                if (cycProt == allCycs[cc].id) {
                    ret += ' selected'
                }
                ret += '>' + allCycs[cc].id + '</option>\n'
            }
            ret += '</select>\n</td>\n'
            ret += '  </tr>'
            if (window.rdmlData.rdml.version == "1.1") {
                ret += '  <tr>\n    <td style="width:25%;">Template RNA Quantity:</td>\n'
                ret += '    <td style="width:75%"><table style="width:100%;">'
                ret += '      <tr><td style="width:50%;">'
                ret += '        <input type="text" class="form-control" id="inExpTemplateRNAQuantity_Value" value="'
                ret += saveUndefKey(exp[i].templateRNAQuantity, "value") + '">'
                ret += '        </td>\n<td style="width:50%">'
                ret += htmlUnitSelector("inExpTemplateRNAQuantity_Unit", exp[i].templateRNAQuantity) + '</td>\n</tr>\n</table>'
                ret += '  </tr>'
                ret += '  <tr>\n    <td style="width:25%;">Template RNA Quality - Method:</td>\n'
                ret += '    <td style="width:75%"><input type="text" class="form-control" '
                ret += 'id="inExpTemplateRNAQuality_Method" value="'+ saveUndefKey(exp[i].templateRNAQuality, "method") + '"></td>\n'
                ret += '  </tr>'
                ret += '  <tr>\n    <td style="width:25%;">Template RNA Quality - Result:</td>\n'
                ret += '    <td style="width:75%"><input type="text" class="form-control" '
                ret += 'id="inExpTemplateRNAQuality_Result" value="'+ saveUndefKey(exp[i].templateRNAQuality, "result") + '"></td>\n'
                ret += '  </tr>'
                ret += '  <tr>\n    <td style="width:25%;">Template DNA Quantity:</td>\n'
                ret += '    <td style="width:75%"><table style="width:100%;">'
                ret += '      <tr><td style="width:50%;">'
                ret += '        <input type="text" class="form-control" id="inExpTemplateDNAQuantity_Value" value="'
                ret += saveUndefKey(exp[i].templateDNAQuantity, "value") + '">'
                ret += '        </td>\n<td style="width:50%">'
                ret += htmlUnitSelector("inExpTemplateDNAQuantity_Unit", exp[i].templateDNAQuantity) + '</td>\n</tr>\n</table>'
                ret += '  </tr>'
                ret += '  <tr>\n    <td style="width:25%;">Template DNA Quality - Method:</td>\n'
                ret += '    <td style="width:75%"><input type="text" class="form-control" '
                ret += 'id="inExpTemplateDNAQuality_Method" value="'+ saveUndefKey(exp[i].templateDNAQuality, "method") + '"></td>\n'
                ret += '  </tr>'
                ret += '  <tr>\n    <td style="width:25%;">Template DNA Quality - Result:</td>\n'
                ret += '    <td style="width:75%"><input type="text" class="form-control" '
                ret += 'id="inExpTemplateDNAQuality_Result" value="'+ saveUndefKey(exp[i].templateDNAQuality, "result") + '"></td>\n'
                ret += '  </tr>'
            }
            if (window.rdmlData.rdml.version != "1.1") {
                ret += '  <tr>\n    <td style="width:25%;">Template Quantity:</td>\n'
                ret += '    <td style="width:75%"><table style="width:100%;">'
                ret += '      <tr><td style="width:50%;">'
                ret += '        <input type="text" class="form-control" id="inExpTemplateQuantity_conc" value="'
                ret += saveUndefKey(exp[i].templateQuantity, "conc") + '">'
                ret += '        </td>\n<td style="width:50%">'
                var selUnit = saveUndefKey(exp[i].templateQuantity, "nucleotide")
                ret += '<select class="form-control" id="inExpTemplateQuantity_nucleotide">\n'
                ret += '        <option value=""'
                if (selUnit == "") {
                    ret += ' selected'
                }
                ret += '>not set</option>\n'
                ret += '        <option value="DNA"'
                if (selUnit == "DNA") {
                    ret += ' selected'
                }
                ret += '>DNA</option>\n'
                ret += '        <option value="genomic DNA"'
                if (selUnit == "genomic DNA") {
                    ret += ' selected'
                }
                ret += '>genomic DNA</option>\n'
                ret += '        <option value="cDNA"'
                if (selUnit == "cDNA") {
                    ret += ' selected'
                }
                ret += '>cDNA</option>\n'
                ret += '        <option value="RNA"'
                if (selUnit == "RNA") {
                    ret += ' selected'
                }
                ret += '>RNA</option>\n'
                ret += '</select>\n'
                ret += '</td>\n</tr>\n</table>'
                ret += '  </tr>'
            }
            ret += '</table></p>\n'
            ret += '<button type="button" class="btn btn-success" '
            ret += 'onclick="saveEditElement(\'sample\', ' + i + ', \'' + exp[i].id + '\');">Save Changes</button>'
            ret += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button type="button" class="btn btn-success" '
            ret += 'onclick="deleteEditElement(\'sample\', ' + i + ');">Delete</button>&nbsp;&nbsp;&nbsp;'
            ret += '</div>\n</div>\n'
        } else {
            ret += '<br /><div class="card">\n<div class="card-body">\n'
            ret += '<h5 class="card-title">' + (i + 1) + '. Sample ID: ' + exp[i].id + '</h5>\n<p>'
            ret += '<table style="width:100%;">'
            var typesLen = exp[i].types.length
            for (var j = 0; j < typesLen; j++) {
                ret += '  <tr>\n    <td style="width:25%;">Type:</td>\n'
                if ((exp[i].types[j].hasOwnProperty("targetId")) && (exp[i].types[j].targetId != "")) {
                    ret += '    <td style="width:45%">\nFor Target "' + exp[i].types[j].targetId + '" the type is "'
                    ret += niceSampleType(exp[i].types[j].type) + '"</td>\n'
                } else {
                    ret += '    <td style="width:45%">\n'+ niceSampleType(exp[i].types[j].type) + '</td>\n'
                }
                if (["1.3", "1.4"].includes(window.rdmlData.rdml.version)) {
                    ret += '<td style="width:30%">\n<button type="button" class="btn btn-success rdml-btn-edit btn-sm" '
                    ret += 'onclick="editSamType(' + i + ', ' + j + ');">Edit</button>&nbsp;&nbsp;'
                    if (j == 0) {
                        ret += '<button type="button" class="btn btn-success rdml-btn-edit btn-sm disabled">Move Up</button>&nbsp;&nbsp;'
                    } else {
                        ret += '<button type="button" class="btn btn-success rdml-btn-edit btn-sm" '
                        ret += 'onclick="moveSecElement(\'sample\', ' + i + ', \'\', 0, \'type\', ' + j
                        ret += ', ' + (j - 1) + ');">Move Up</button>&nbsp;&nbsp;'
                    }
                    if (j == typesLen - 1) {
                        ret += '<button type="button" class="btn btn-success rdml-btn-edit btn-sm disabled">Move Down</button>&nbsp;&nbsp;&nbsp;'
                    } else {
                        ret += '<button type="button" class="btn btn-success rdml-btn-edit btn-sm" '
                        ret += 'onclick="moveSecElement(\'sample\', ' + i + ', \'\', 0, \'type\', ' + j
                        ret += ', ' + (j + 2) + ');">Move Down</button>&nbsp;&nbsp;&nbsp;'
                    }
                    ret += '<button type="button" class="btn btn-success rdml-btn-edit btn-sm" '
                    ret += 'onclick="deleteSecElement(\'sample\', ' + i + ', \'\', 0, \'type\', ' + j
                    ret += ');">Delete</button>'
                } else {
                    ret += '<td style="width:30%">'
                }
                ret += '</td>\n  </tr>'
            }
            if (exp[i].hasOwnProperty("doubleStranded")) {
                ret += '  <tr>\n    <td style="width:25%;">Double Stranded:</td>\n'
                if (exp[i].doubleStranded == "true") {
                    ret += '    <td colspan="2">Yes (genomic DNA, Plasmid)</td>\n'
                } else {
                    ret += '    <td colspan="2">No (cDNA, Oligos)</td>\n'
                }
                ret += '  </tr>'
            }
            if (exp[i].hasOwnProperty("calibratorSample")) {
              ret += '  <tr>\n    <td style="width:25%;">Calibrator Sample:</td>\n'
              if (exp[i].calibratorSample == "true") {
                  ret += '    <td colspan="2">Yes, used as Calibrator</td>\n'
              } else {
                  ret += '    <td colspan="2">No</td>\n'
              }
              ret += '  </tr>'
            }
            if (exp[i].hasOwnProperty("interRunCalibrator")) {
              ret += '  <tr>\n    <td style="width:25%;">Inter Run Calibrator:</td>\n'
              if (exp[i].interRunCalibrator == "true") {
                  ret += '    <td colspan="2">Yes, used as Inter Run Calibrator</td>\n'
              } else {
                  ret += '    <td colspan="2">No</td>\n'
              }
              ret += '  </tr>'
            }
            var quantitysLen = exp[i].quantitys.length
            for (var j = 0; j < quantitysLen; j++) {
                ret += '  <tr>\n    <td style="width:25%;">Quantity:</td>\n'
                if ((exp[i].quantitys[j].hasOwnProperty("targetId")) && (exp[i].quantitys[j].targetId != "")) {
                    ret += '    <td style="width:45%">\nFor Target "' + exp[i].quantitys[j].targetId + '" the quantity is "'
                    ret += exp[i].quantitys[j].value + ' ' + niceUnitType(exp[i].quantitys[j].unit) + '"</td>\n'
                } else {
                    ret += '    <td style="width:45%">\n'+ exp[i].quantitys[j].value
                    ret += ' ' + niceUnitType(exp[i].quantitys[j].unit) + '</td>\n'
                }
                if (["1.3", "1.4"].includes(window.rdmlData.rdml.version)) {
                    ret += '<td style="width:30%">\n<button type="button" class="btn btn-success rdml-btn-edit btn-sm" '
                    ret += 'onclick="editQunatType(' + i + ', ' + j + ');">Edit</button>&nbsp;&nbsp;'
                    if (j == 0) {
                        ret += '<button type="button" class="btn btn-success rdml-btn-edit btn-sm disabled">Move Up</button>&nbsp;&nbsp;'
                    } else {
                        ret += '<button type="button" class="btn btn-success rdml-btn-edit btn-sm" '
                        ret += 'onclick="moveSecElement(\'sample\', ' + i + ', \'\', 0, \'quantity\', ' + j
                        ret += ', ' + (j - 1) + ');">Move Up</button>&nbsp;&nbsp;'
                    }
                    if (j == quantitysLen - 1) {
                        ret += '<button type="button" class="btn btn-success rdml-btn-edit btn-sm disabled">Move Down</button>&nbsp;&nbsp;&nbsp;'
                    } else {
                        ret += '<button type="button" class="btn btn-success rdml-btn-edit btn-sm" '
                        ret += 'onclick="moveSecElement(\'sample\', ' + i + ', \'\', 0, \'quantity\', ' + j
                        ret += ', ' + (j + 2) + ');">Move Down</button>&nbsp;&nbsp;&nbsp;'
                    }
                    ret += '<button type="button" class="btn btn-success rdml-btn-edit btn-sm" '
                    ret += 'onclick="deleteSecElement(\'sample\', ' + i + ', \'\', 0, \'quantity\', ' + j
                    ret += ');">Delete</button>'
                } else {
                    ret += '<td style="width:30%">'
                }
                ret += '</td>\n  </tr>'
            }
            if (exp[i].hasOwnProperty("cdnaSynthesisMethod")) {
                if (exp[i].cdnaSynthesisMethod.hasOwnProperty("enzyme")) {
                  ret += '  <tr>\n    <td style="width:25%;">cDNA - Enzyme:</td>\n'
                  ret += '    <td colspan="2">\n'+ exp[i].cdnaSynthesisMethod.enzyme + '</td>\n'
                  ret += '  </tr>'
                }
                if (exp[i].cdnaSynthesisMethod.hasOwnProperty("primingMethod")) {
                  ret += '  <tr>\n    <td style="width:25%;">cDNA - Priming Method:</td>\n'
                  ret += '    <td colspan="2">\n'+ exp[i].cdnaSynthesisMethod.primingMethod + '</td>\n'
                  ret += '  </tr>'
                }
                if (exp[i].cdnaSynthesisMethod.hasOwnProperty("dnaseTreatment")) {
                  ret += '  <tr>\n    <td style="width:25%;">cDNA - DNase Treatment:</td>\n'
                  if (exp[i].cdnaSynthesisMethod.dnaseTreatment == "true") {
                      ret += '    <td colspan="2">Yes, treated with DNase</td>\n'
                  } else {
                      ret += '    <td colspan="2">No</td>\n'
                  }
                  ret += '  </tr>'
                }
                if (exp[i].cdnaSynthesisMethod.hasOwnProperty("thermalCyclingConditions")) {
                  ret += '  <tr>\n    <td style="width:25%;">cDNA - Thermal Cycling Conditions:</td>\n'
                  ret += '    <td colspan="2">\n'+ exp[i].cdnaSynthesisMethod.thermalCyclingConditions + '</td>\n'
                  ret += '  </tr>'
                  // Todo: add link
                }
            }


            if (exp[i].hasOwnProperty("templateRNAQuantity")) {
              ret += '  <tr>\n    <td style="width:25%;">Template RNA Quantity:</td>\n'
              ret += '    <td colspan="2">\n'+ exp[i].templateRNAQuantity.value
              ret += ' ' + niceUnitType(exp[i].templateRNAQuantity.unit) + '</td>\n'
              ret += '  </tr>'
            }
            if (exp[i].hasOwnProperty("templateRNAQuality")) {
              ret += '  <tr>\n    <td style="width:25%;">Template RNA Quality:</td>\n'
              ret += '    <td colspan="2">\n'+ exp[i].templateRNAQuality.method
              ret += ' is ' + niceUnitType(exp[i].templateRNAQuality.result) + '</td>\n'
              ret += '  </tr>'
            }
            if (exp[i].hasOwnProperty("templateDNAQuantity")) {
              ret += '  <tr>\n    <td style="width:25%;">Template DNA Quantity:</td>\n'
              ret += '    <td colspan="2">\n'+ exp[i].templateDNAQuantity.value
              ret += ' ' + niceUnitType(exp[i].templateDNAQuantity.unit) + '</td>\n'
              ret += '  </tr>'
            }
            if (exp[i].hasOwnProperty("templateDNAQuality")) {
              ret += '  <tr>\n    <td style="width:25%;">Template DNA Quality:</td>\n'
              ret += '    <td colspan="2">\n'+ exp[i].templateDNAQuality.method
              ret += ' is ' + niceUnitType(exp[i].templateDNAQuality.result) + '</td>\n'
              ret += '  </tr>'
            }
            if (exp[i].hasOwnProperty("templateQuantity")) {
              ret += '  <tr>\n    <td style="width:25%;">Template Nucleotide Type:</td>\n'
              ret += '    <td colspan="2">\n'+ exp[i].templateQuantity.nucleotide + '</td>\n'
              ret += '  </tr>'
              ret += '  <tr>\n    <td style="width:25%;">Template Quantity:</td>\n'
              ret += '    <td colspan="2">\n'+ exp[i].templateQuantity.conc + ' ng/&micro;l</td>\n'
              ret += '  </tr>'
            }
            ret += '</table></p>\n'

            ret += '<div id="pType-sample-' + i + '"></div>'

            var au = 0
            var xref = '<div class="card">\n<div class="card-body">\n'
            xref += '<h5 class="card-title">Annotation:</h5>\n'
            xref += '<table style="width:100%;">'
            if (exp[i].hasOwnProperty("annotations")) {
                au = exp[i].annotations.length
                for (var j = 0; j < au; j++) {
                    xref += '  <tr>\n    <td style="width:15%;">'
                    xref += saveUndef(exp[i].annotations[j].property) + ': </td>\n'
                    xref += '    <td style="width:45%;">'
                    xref += saveUndef(exp[i].annotations[j].value) + '</td>\n'
                    xref += '    <td style="width:40%">\n'
                    xref += '<button type="button" class="btn btn-success rdml-btn-edit btn-sm" '
                    xref += 'onclick="editAnnotation(\'sample\', ' + i + ', ' + j + ');">Edit</button>&nbsp;&nbsp;'

                    if (j == 0) {
                        xref += '<button type="button" class="btn btn-success rdml-btn-edit btn-sm disabled">Move Up</button>&nbsp;&nbsp;'
                    } else {
                        xref += '<button type="button" class="btn btn-success rdml-btn-edit btn-sm" '
                        xref += 'onclick="moveSecElement(\'sample\', ' + i + ', \'\', 0, \'annotation\', ' + j
                        xref += ', ' + (j - 1) + ');">Move Up</button>&nbsp;&nbsp;'
                    }
                    if (j == au - 1) {
                        xref += '<button type="button" class="btn btn-success rdml-btn-edit btn-sm disabled">Move Down</button>&nbsp;&nbsp;&nbsp;'
                    } else {
                        xref += '<button type="button" class="btn btn-success rdml-btn-edit btn-sm" '
                        xref += 'onclick="moveSecElement(\'sample\', ' + i + ', \'\', 0, \'annotation\', ' + j
                        xref += ', ' + (j + 2) + ');">Move Down</button>&nbsp;&nbsp;&nbsp;'
                    }
                    xref += '<button type="button" class="btn btn-success rdml-btn-edit btn-sm" '
                    xref += 'onclick="deleteSecElement(\'sample\', ' + i + ', \'\', 0, \'annotation\', ' + j
                    xref += ');">Delete</button></td>\n  </tr>'
                }
            }
            xref += '</table></p>\n'
            xref += '</div>\n</div><br />\n'
            if (au > 0) {
                ret += xref
            }

            ret += '<div id="pAnnotation-sample-' + i + '"></div>'

            var k = 0
            var xref = '<div class="card">\n<div class="card-body">\n'
            xref += '<h5 class="card-title">References (xRef):</h5>\n'
            xref += '<table style="width:100%;">'
            if (exp[i].hasOwnProperty("xRefs")) {
                k = exp[i].xRefs.length
                for (var j = 0; j < k; j++) {
                    xref += '  <tr>\n    <td style="width:30%;">Name: '
                    xref += saveUndef(exp[i].xRefs[j].name) + '</td>\n'
                    xref += '    <td style="width:30%;">Id: '
                    xref += saveUndef(exp[i].xRefs[j].id) + '</td>\n'
                    xref += '    <td style="width:40%">\n'
                    xref += '<button type="button" class="btn btn-success rdml-btn-edit btn-sm" '
                    xref += 'onclick="editXref(\'sample\', ' + i + ', ' + j + ');">Edit</button>&nbsp;&nbsp;'

                    if (j == 0) {
                        xref += '<button type="button" class="btn btn-success rdml-btn-edit btn-sm disabled">Move Up</button>&nbsp;&nbsp;'
                    } else {
                        xref += '<button type="button" class="btn btn-success rdml-btn-edit btn-sm" '
                        xref += 'onclick="moveSecElement(\'sample\', ' + i + ', \'\', 0, \'xRef\', ' + j
                        xref += ', ' + (j - 1) + ');">Move Up</button>&nbsp;&nbsp;'
                    }
                    if (j == k - 1) {
                        xref += '<button type="button" class="btn btn-success rdml-btn-edit btn-sm disabled">Move Down</button>&nbsp;&nbsp;&nbsp;'
                    } else {
                        xref += '<button type="button" class="btn btn-success rdml-btn-edit btn-sm" '
                        xref += 'onclick="moveSecElement(\'sample\', ' + i + ', \'\', 0, \'xRef\', ' + j
                        xref += ', ' + (j + 2) + ');">Move Down</button>&nbsp;&nbsp;&nbsp;'
                    }
                    xref += '<button type="button" class="btn btn-success rdml-btn-edit btn-sm" '
                    xref += 'onclick="deleteSecElement(\'sample\', ' + i + ', \'\', 0, \'xRef\', ' + j
                    xref += ');">Delete</button></td>\n  </tr>'
                }
            }
            xref += '</table></p>\n'
            xref += '</div>\n</div><br />\n'
            if (k > 0) {
                ret += xref
            }

            ret += '<div id="pXref-sample-' + i + '"></div>'

            var doc = '<div class="card">\n<div class="card-body">\n'
            doc += '<h5 class="card-title">Documentation:</h5>\n'
            var desc = saveUndef(exp[i].description)
            if (desc != "") {
                doc += '<p>' + desc + '</p>'
            }
            doc += '<button type="button" class="btn btn-success btn-sm" '
            doc += ' onclick="showDocSecElement(\'sample\', ' + i + ', \'\', 0, \'documentation\', '
            doc += '\'pDoc-sample-' + i + '\', this);">Show All Document Information</button>'
            doc += '&nbsp;&nbsp;<button type="button" class="btn btn-success rdml-btn-edit btn-sm" '
            doc += 'onclick="selectSecElement(\'sample\', ' + i + ', \'\', 0, \'documentation\', '
            doc += '\'pDoc-sample-' + i + '\');">Change Attached Document Ids</button>'
            doc += '<div id="pDoc-sample-' + i + '"></div>'
            doc += '</div>\n</div><br />\n'
            ret += doc

            ret += '<button type="button" class="btn btn-success rdml-btn-edit" '
            ret += 'onclick="editPresentElement(\'sample\', ' + i + ');">Edit</button>&nbsp;&nbsp;&nbsp;&nbsp;'
            if (["1.3", "1.4"].includes(window.rdmlData.rdml.version)) {
                ret += '<button type="button" class="btn btn-success rdml-btn-edit" '
                ret += 'onclick="editSamType(' + i + ', -1);">Add Type</button>&nbsp;&nbsp;&nbsp;&nbsp;'
                ret += '<button type="button" class="btn btn-success rdml-btn-edit" '
                ret += 'onclick="editQunatType(' + i + ', -1);">Add Quantity</button>&nbsp;&nbsp;&nbsp;&nbsp;'
            }
            if (window.rdmlData.rdml.version != "1.1") {
                ret += '<button type="button" class="btn btn-success rdml-btn-edit" '
                ret += 'onclick="editAnnotation(\'sample\', ' + i + ', -1);">New Annotation</button>&nbsp;&nbsp;&nbsp;&nbsp;'
            }
            ret += '<button type="button" class="btn btn-success rdml-btn-edit" '
            ret += 'onclick="editXref(\'sample\', ' + i + ', -1);">New xRef</button>&nbsp;&nbsp;&nbsp;&nbsp;'
            if (i == 0) {
                ret += '<button type="button" class="btn btn-success rdml-btn-edit disabled">Move Up</button>&nbsp;&nbsp;'
            } else {
                ret += '<button type="button" class="btn btn-success rdml-btn-edit" '
            ret += 'onclick="moveEditElement(\'sample\', \'' + exp[i].id + '\', ' + (i - 1) + ');">Move Up</button>&nbsp;&nbsp;'
            }
            if (i == exp.length - 1) {
                ret += '<button type="button" class="btn btn-success rdml-btn-edit disabled">Move Down</button>&nbsp;&nbsp;&nbsp;'
            } else {
                ret += '<button type="button" class="btn btn-success rdml-btn-edit" '
            ret += 'onclick="moveEditElement(\'sample\', \'' + exp[i].id + '\', ' + (i + 2) + ');">Move Down</button>&nbsp;&nbsp;&nbsp;'
            }
            ret += '&nbsp;<button type="button" class="btn btn-success rdml-btn-edit" '
            ret += 'onclick="deleteEditElement(\'sample\', ' + i + ');">Delete</button>&nbsp;&nbsp;&nbsp;'
            ret += '</div>\n</div>\n'
        }
    }
    samplesData.innerHTML = ret

    // The targets tab
    var exp = window.rdmlData.rdml.targets;
    ret = ''
    if ((editMode == true) && (editType == "target_melting")) {
        ret += '<br /><div class="card text-white bg-primary">\n<div class="card-body">\n'
        ret += '<h5 class="card-title">Edit Amplicon Sequence and Melting Temperature</h5>\n<p>'
        ret += '<input type="hidden" id="ed_melt_count" value="' + exp.length + '">'
        ret += '<table style="width:100%;">'
        ret += '  <tr>\n'
        ret += '    <td style="width:25%">Target ID</td>\n'
        ret += '    <td style="width:15%">Melting Temp.</td>\n'
        ret += '    <td style="width:60%">Amplicon Sequence (or length in bp)</td>\n'
        ret += '  </tr>'
        for (var i = 0; i < exp.length; i++) {
            ret += '  <tr>\n'
            ret += '    <td style="width:25%"><input type="hidden" id="ed_melt_tar_'
            ret += i + '" value="'
            ret += exp[i].id + '">' + exp[i].id + '</td>\n'
            ret += '    <td style="width:15%"><input type="text" class="form-control" id="ed_melt_tm_'
            ret += i + '" value="'
            if (["1.3", "1.4"].includes(window.rdmlData.rdml.version)) {
                ret += saveUndef(exp[i].meltingTemperature)
            } else {
                ret += 'NA in Ver. <1.3'; // on change edit also saveMeltingChanges();
            }
            ret += '"></td>\n'
            ret += '    <td style="width:60%"><input type="text" class="form-control" id="ed_melt_seq_'
            ret += i + '" value="'
            if (exp[i].hasOwnProperty("sequences")) {
                if (exp[i].sequences.hasOwnProperty("amplicon")) {
                    ret += saveUndefKey(exp[i].sequences.amplicon, "sequence")
                }
            }
            ret += '"></td>\n'
            ret += '  </tr>'
        }
        ret += '</table></p>\n'
        ret += '<button type="button" class="btn btn-success" '
        ret += 'onclick="saveMeltingChanges();">Save Changes</button>'
        ret += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button type="button" class="btn btn-success" '
        ret += 'onclick="deleteTargetMelting();">Cancle</button>&nbsp;&nbsp;&nbsp;'
        ret += '</div>\n</div>\n'
    }
    for (var i = 0; i < exp.length; i++) {
        if ((editMode == true) && (editType == "target") && (i == editNumber)) {
            ret += '<br /><div class="card text-white bg-primary">\n<div class="card-body">\n'
            ret += '<h5 class="card-title">' + (i + 1) + '. Target ID: ' + exp[i].id + '</h5>\n<p>'
            ret += '<table style="width:100%;">'
            ret += '  <tr>\n    <td style="width:25%;background-color:#cc7a00;">ID:</td>\n'
            ret += '    <td style="width:75%"><input type="text" class="form-control" '
            ret += 'id="inTarId" value="'+ exp[i].id + '"></td>\n'
            ret += '  </tr>'
            ret += '  <tr>\n    <td style="width:25%;background-color:#cc7a00;">Type:</td>\n'
            ret += '    <td style="width:75%"><select class="form-control" id="inTarType">\n'
            ret += '        <option value="ref"'
            if (exp[i].type == "ref") {
                ret += ' selected'
            }
            ret += '>ref - reference target</option>\n'
            ret += '        <option value="toi"'
            if (exp[i].type == "toi") {
                ret += ' selected'
            }
            ret += '>toi - target of interest</option>\n'
            ret += '      </select></td>\n'
            ret += '  </tr>'
            ret += '  <tr>\n    <td style="width:25%;background-color:#cc7a00;">Dye ID:</td>\n'
            ret += '    <td style="width:75%">'
            var selDye = saveUndef(exp[i].dyeId)
            ret += '<select class="form-control" id="inTarDyeId">\n'
            var allDyes = window.rdmlData.rdml.dyes;
            for (var cc = 0; cc < allDyes.length; cc++) {
                ret += '        <option value="' + allDyes[cc].id + '"'
                if (selDye == allDyes[cc].id) {
                    ret += ' selected'
                }
                ret += '>' + allDyes[cc].id + '</option>\n'
            }
            ret += '</select>\n</td>\n'
            ret += '  </tr>'
            ret += '  <tr>\n    <td style="width:25%;">' + 'Forward Primer - Sequence:</td>\n'
            ret += '    <td style="width:75%"><input type="text" class="form-control" id="inTarSequences_forwardPrimer_sequence" value="'
            if (exp[i].hasOwnProperty("sequences")) {
                if (exp[i].sequences.hasOwnProperty("forwardPrimer")) {
                    ret += saveUndefKey(exp[i].sequences.forwardPrimer, "sequence")
                }
            }
            ret += '"></td>\n'
            ret += '  </tr>'
            ret += '  <tr>\n    <td style="width:25%;">' + 'Forward Primer - Conc. (nMol/l):</td>\n'
            ret += '    <td style="width:75%"><input type="text" class="form-control" id="inTarSequences_forwardPrimer_oligoConc" value="'
            if (exp[i].hasOwnProperty("sequences")) {
                if (exp[i].sequences.hasOwnProperty("forwardPrimer")) {
                    ret += saveUndefKey(exp[i].sequences.forwardPrimer, "oligoConc")
                }
            }
            ret += '"></td>\n'
            ret += '  </tr>'
            ret += '  <tr>\n    <td style="width:25%;">' + 'Reverse Primer - Sequence:</td>\n'
            ret += '    <td style="width:75%"><input type="text" class="form-control" id="inTarSequences_reversePrimer_sequence" value="'
            if (exp[i].hasOwnProperty("sequences")) {
                if (exp[i].sequences.hasOwnProperty("reversePrimer")) {
                    ret += saveUndefKey(exp[i].sequences.reversePrimer, "sequence")
                }
            }
            ret += '"></td>\n'
            ret += '  </tr>'
            ret += '  <tr>\n    <td style="width:25%;">' + 'Reverse Primer - Conc. (nMol/l):</td>\n'
            ret += '    <td style="width:75%"><input type="text" class="form-control" id="inTarSequences_reversePrimer_oligoConc" value="'
            if (exp[i].hasOwnProperty("sequences")) {
                if (exp[i].sequences.hasOwnProperty("reversePrimer")) {
                    ret += saveUndefKey(exp[i].sequences.reversePrimer, "oligoConc")
                }
            }
            ret += '"></td>\n'
            ret += '  </tr>'
            ret += '  <tr>\n    <td style="width:25%;">' + 'probe1 - Sequence:</td>\n'
            ret += '    <td style="width:75%"><input type="text" class="form-control" id="inTarSequences_probe1_sequence" value="'
            if (exp[i].hasOwnProperty("sequences")) {
                if (exp[i].sequences.hasOwnProperty("probe1")) {
                    ret += saveUndefKey(exp[i].sequences.probe1, "sequence")
                }
            }
            ret += '"></td>\n'
            ret += '  </tr>'
            ret += '  <tr>\n    <td style="width:25%;">' + 'probe1 - Conc. (nMol/l):</td>\n'
            ret += '    <td style="width:75%"><input type="text" class="form-control" id="inTarSequences_probe1_oligoConc" value="'
            if (exp[i].hasOwnProperty("sequences")) {
                if (exp[i].sequences.hasOwnProperty("probe1")) {
                    ret += saveUndefKey(exp[i].sequences.probe1, "oligoConc")
                }
            }
            ret += '"></td>\n'
            ret += '  </tr>'
            ret += '  <tr>\n    <td style="width:25%;">' + 'Probe2 - Sequence:</td>\n'
            ret += '    <td style="width:75%"><input type="text" class="form-control" id="inTarSequences_probe2_sequence" value="'
            if (exp[i].hasOwnProperty("sequences")) {
                if (exp[i].sequences.hasOwnProperty("probe2")) {
                    ret += saveUndefKey(exp[i].sequences.probe2, "sequence")
                }
            }
            ret += '"></td>\n'
            ret += '  </tr>'
            ret += '  <tr>\n    <td style="width:25%;">' + 'Probe2 - Conc. (nMol/l):</td>\n'
            ret += '    <td style="width:75%"><input type="text" class="form-control" id="inTarSequences_probe2_oligoConc" value="'
            if (exp[i].hasOwnProperty("sequences")) {
                if (exp[i].sequences.hasOwnProperty("probe2")) {
                    ret += saveUndefKey(exp[i].sequences.probe2, "oligoConc")
                }
            }
            ret += '"></td>\n'
            ret += '  </tr>'
            ret += '  <tr>\n    <td style="width:25%;">' + 'Amplicon - Sequence:</td>\n'
            ret += '    <td style="width:75%"><input type="text" class="form-control" id="inTarSequences_amplicon_sequence" value="'
            if (exp[i].hasOwnProperty("sequences")) {
                if (exp[i].sequences.hasOwnProperty("amplicon")) {
                    ret += saveUndefKey(exp[i].sequences.amplicon, "sequence")
                }
            }
            ret += '"></td>\n'
            ret += '  </tr>'
            if (["1.3", "1.4"].includes(window.rdmlData.rdml.version)) {
                ret += '  <tr>\n    <td style="width:25%;">Amplicon MeltingTemperature:</td>\n'
                ret += '    <td style="width:75%"><input type="text" class="form-control" '
                ret += 'id="inTarMeltingTemperature" value="'+ saveUndef(exp[i].meltingTemperature) + '"></td>\n'
                ret += '  </tr>'
            }
            ret += '  <tr>\n    <td style="width:25%;">' + 'Amplicon Seq. Tools:</td>\n'
            ret += '    <td style="width:75%"><table style="width:100%;">'
            ret += '      <tr><td style="width:25%;">'
            ret += '        <input type="text" class="form-control" id="inTarSequences_fake_amplicon_len"'
            ret += ' value=""</td>\n<td style="width:75%">&nbsp;&nbsp;&nbsp;'
            ret += ' <button type="button" onclick="setNAmpliconSeq();">Add number of N as Amplicon Seq.</button>&nbsp;&nbsp;'
            ret += ' <button type="button" onclick="cleanAmpliconSeq();">Clean Amplicon Seq.</button></td>\n</tr>\n</table>  </tr>'
            ret += '  </tr>'
            ret += '</table></p>\n'
            ret += '<button type="button" class="btn btn-success" '
            ret += 'onclick="saveEditElement(\'target\', ' + i + ', \'' + exp[i].id + '\');">Save Changes</button>'
            ret += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button type="button" class="btn btn-success" '
            ret += 'onclick="deleteEditElement(\'target\', ' + i + ');">Delete</button>'
            ret += '<br /><br /><br />\n'

            ret += '<h5 class="card-title">Advanced:</h5>\n'
            ret += '<p><table style="width:100%;">'
            ret += '  <tr>\n    <td style="width:25%;">Method of modification:</td>\n'
            ret += '    <td style="width:75%"><select class="form-control" id="inTarIdUnique">\n'
            ret += '        <option value=false selected>Id must be unique and will be renamed</option>\n'
            ret += '        <option value=true>Change all its uses to existing Id (dangerous - may corrupt data)</option>\n'
            ret += '      </select></td>\n'
            ret += '  </tr>'
            ret += '  <tr>\n    <td style="width:25%;">Place at Position:</td>\n'
            ret += '    <td style="width:75%"><input type="text" class="form-control" '
            ret += 'id="inPos" value="' + (i + 1) + '"></td>\n'
            ret += '  </tr>'
            ret += '  <tr>\n    <td style="width:25%;">Description:</td>\n'
            ret += '    <td style="width:75%"><input type="text" class="form-control" '
            ret += 'id="inTarDescription" value="'+ saveUndef(exp[i].description) + '"></td>\n'
            ret += '  </tr>'
            ret += '  <tr>\n    <td style="width:25%;">Amplification Efficiency Method:</td>\n'
            ret += '    <td style="width:75%"><input type="text" class="form-control" '
            ret += 'id="inTarAmplificationEfficiencyMethod" value="'+ saveUndef(exp[i].amplificationEfficiencyMethod) + '"></td>\n'
            ret += '  </tr>'
            ret += '  <tr>\n    <td style="width:25%;">Amplification Efficiency:</td>\n'
            ret += '    <td style="width:75%"><input type="text" class="form-control" '
            ret += 'id="inTarAmplificationEfficiency" value="'+ saveUndef(exp[i].amplificationEfficiency) + '"></td>\n'
            ret += '  </tr>'
            if (window.rdmlData.rdml.version != "1.1") {
                ret += '  <tr>\n    <td style="width:25%;">Amplification Efficiency Std Err:</td>\n'
                ret += '    <td style="width:75%"><input type="text" class="form-control" '
                ret += 'id="inTarAmplificationEfficiencySE" value="'+ saveUndef(exp[i].amplificationEfficiencySE) + '"></td>\n'
                ret += '  </tr>'
            }
            ret += '  <tr>\n    <td style="width:25%;">Detection Limit:</td>\n'
            ret += '    <td style="width:75%"><input type="text" class="form-control" '
            ret += 'id="inTarDetectionLimit" value="'+ saveUndef(exp[i].detectionLimit) + '"></td>\n'
            ret += '  </tr>'
            ret += tarSeqHtml(exp[i], "forwardPrimer")
            ret += tarSeqHtml(exp[i], "reversePrimer")
            ret += tarSeqHtml(exp[i], "probe1")
            ret += tarSeqHtml(exp[i], "probe2")
            ret += tarSeqHtml(exp[i], "amplicon")
            ret += '  <tr>\n    <td style="width:25%;">Commercial Assay - Company:</td>\n'
            ret += '    <td style="width:75%"><input type="text" class="form-control" '
            ret += 'id="inTarCommercialAssay_company" value="'+ saveUndefKey(exp[i].commercialAssay, "company") + '"></td>\n'
            ret += '  </tr>'
            ret += '  <tr>\n    <td style="width:25%;">Commercial Assay - Order Number:</td>\n'
            ret += '    <td style="width:75%"><input type="text" class="form-control" '
            ret += 'id="inTarCommercialAssay_orderNumber" value="'+ saveUndefKey(exp[i].commercialAssay, "orderNumber") + '"></td>\n'
            ret += '  </tr>'
            ret += '</table></p>\n'
            ret += '<button type="button" class="btn btn-success" '
            ret += 'onclick="saveEditElement(\'target\', ' + i + ', \'' + exp[i].id + '\');">Save Changes</button>'
            ret += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button type="button" class="btn btn-success" '
            ret += 'onclick="deleteEditElement(\'target\', ' + i + ');">Delete</button>&nbsp;&nbsp;&nbsp;'
            ret += '</div>\n</div>\n'
        } else {
            ret += '<br /><div class="card">\n<div class="card-body">\n'
            ret += '<h5 class="card-title">' + (i + 1) + '. Target ID: ' + exp[i].id + '</h5>\n<p>'
            ret += '<table style="width:100%;">'
            ret += '  <tr>\n    <td style="width:25%;">Type:</td>\n'
            ret += '    <td style="width:75%">\n'+ niceTargetType(exp[i].type) + '</td>\n'
            ret += '  </tr>'
            if (exp[i].hasOwnProperty("amplificationEfficiencyMethod")) {
                ret += '  <tr>\n    <td style="width:25%;">Amplification Efficiency Method:</td>\n'
                ret += '    <td style="width:75%">\n'+ exp[i].amplificationEfficiencyMethod + '</td>\n'
                ret += '  </tr>'
            }
            if (exp[i].hasOwnProperty("amplificationEfficiency")) {
                ret += '  <tr>\n    <td style="width:25%;">Amplification Efficiency:</td>\n'
                ret += '    <td style="width:75%">\n'+ exp[i].amplificationEfficiency + '</td>\n'
                ret += '  </tr>'
            }
            if (exp[i].hasOwnProperty("amplificationEfficiencySE")) {
                ret += '  <tr>\n    <td style="width:25%;">Amplification Efficiency Std Err:</td>\n'
                ret += '    <td style="width:75%">\n'+ exp[i].amplificationEfficiencySE + '</td>\n'
                ret += '  </tr>'
            }
            if (exp[i].hasOwnProperty("meltingTemperature")) {
                ret += '  <tr>\n    <td style="width:25%;">Melting Temperature:</td>\n'
                ret += '    <td style="width:75%">\n'+ exp[i].meltingTemperature + '&deg;C</td>\n'
                ret += '  </tr>'
            }
            if (exp[i].hasOwnProperty("detectionLimit")) {
                ret += '  <tr>\n    <td style="width:25%;">detectionLimit:</td>\n'
                ret += '    <td style="width:75%">\n'+ exp[i].detectionLimit + '</td>\n'
                ret += '  </tr>'
            }
            if (exp[i].hasOwnProperty("dyeId")) {
                ret += '  <tr>\n    <td style="width:25%;">Dye Id:</td>\n'
                ret += '    <td style="width:75%">\n'+ exp[i].dyeId + '</td>\n'
                ret += '  </tr>'
                // Todo: add link
            }
            if (exp[i].hasOwnProperty("sequences")) {
                if (exp[i].sequences.hasOwnProperty("forwardPrimer")) {
                    var oligo_elem = exp[i].sequences.forwardPrimer
                    var use_oligo = false
                    var oligo = '  <tr>\n    <td style="width:25%;">Forward Primer:</td>\n'
                    oligo += '    <td style="width:75%">\n'
                    if (oligo_elem.hasOwnProperty("fivePrimeTag")) {
                      oligo += oligo_elem.fivePrimeTag + ' '
                      use_oligo = true
                    }
                    if (oligo_elem.hasOwnProperty("sequence")) {
                      oligo += oligo_elem.sequence
                      use_oligo = true
                    }
                    if (oligo_elem.hasOwnProperty("threePrimeTag")) {
                      oligo += ' '+ oligo_elem.threePrimeTag
                      use_oligo = true
                    }
                    if (use_oligo == true) {
                      ret += oligo + '</td>\n  </tr>'
                    }
                    if (oligo_elem.hasOwnProperty("oligoConc")) {
                        ret += '  <tr>\n    <td style="width:25%;">Forward Primer Conc:</td>\n'
                        ret += '    <td style="width:75%">\n' + oligo_elem.oligoConc
                        ret += ' nMol/l</td>\n  </tr>'
                    }
                }
                if (exp[i].sequences.hasOwnProperty("reversePrimer")) {
                    var oligo_elem = exp[i].sequences.reversePrimer
                    var use_oligo = false
                    var oligo = '  <tr>\n    <td style="width:25%;">Reverse Primer:</td>\n'
                    oligo += '    <td style="width:75%">\n'
                    if (oligo_elem.hasOwnProperty("fivePrimeTag")) {
                      oligo += oligo_elem.fivePrimeTag + ' '
                      use_oligo = true
                    }
                    if (oligo_elem.hasOwnProperty("sequence")) {
                      oligo += oligo_elem.sequence
                      use_oligo = true
                    }
                    if (oligo_elem.hasOwnProperty("threePrimeTag")) {
                      oligo += ' '+ oligo_elem.threePrimeTag
                      use_oligo = true
                    }
                    if (use_oligo == true) {
                      ret += oligo + '</td>\n  </tr>'
                    }
                    if (oligo_elem.hasOwnProperty("oligoConc")) {
                        ret += '  <tr>\n    <td style="width:25%;">Reverse Primer Conc:</td>\n'
                        ret += '    <td style="width:75%">\n' + oligo_elem.oligoConc
                        ret += ' nMol/l</td>\n  </tr>'
                    }
                }
                if (exp[i].sequences.hasOwnProperty("probe1")) {
                    var oligo_elem = exp[i].sequences.probe1
                    var use_oligo = false
                    var oligo = '  <tr>\n    <td style="width:25%;">Probe 1:</td>\n'
                    oligo += '    <td style="width:75%">\n'
                    if (oligo_elem.hasOwnProperty("fivePrimeTag")) {
                      oligo += oligo_elem.fivePrimeTag + ' '
                      use_oligo = true
                    }
                    if (oligo_elem.hasOwnProperty("sequence")) {
                      oligo += oligo_elem.sequence
                      use_oligo = true
                    }
                    if (oligo_elem.hasOwnProperty("threePrimeTag")) {
                      oligo += ' '+ oligo_elem.threePrimeTag
                      use_oligo = true
                    }
                    if (use_oligo == true) {
                      ret += oligo + '</td>\n  </tr>'
                    }
                    if (oligo_elem.hasOwnProperty("oligoConc")) {
                        ret += '  <tr>\n    <td style="width:25%;">Probe 1 Conc:</td>\n'
                        ret += '    <td style="width:75%">\n' + oligo_elem.oligoConc
                        ret += ' nMol/l</td>\n  </tr>'
                    }
                }
                if (exp[i].sequences.hasOwnProperty("probe2")) {
                    var oligo_elem = exp[i].sequences.probe2
                    var use_oligo = false
                    var oligo = '  <tr>\n    <td style="width:25%;">Probe 2:</td>\n'
                    oligo += '    <td style="width:75%">\n'
                    if (oligo_elem.hasOwnProperty("fivePrimeTag")) {
                      oligo += oligo_elem.fivePrimeTag + ' '
                      use_oligo = true
                    }
                    if (oligo_elem.hasOwnProperty("sequence")) {
                      oligo += oligo_elem.sequence
                      use_oligo = true
                    }
                    if (oligo_elem.hasOwnProperty("threePrimeTag")) {
                      oligo += ' '+ oligo_elem.threePrimeTag
                      use_oligo = true
                    }
                    if (use_oligo == true) {
                      ret += oligo + '</td>\n  </tr>'
                    }
                    if (oligo_elem.hasOwnProperty("oligoConc")) {
                        ret += '  <tr>\n    <td style="width:25%;">Probe 2 Conc:</td>\n'
                        ret += '    <td style="width:75%">\n' + oligo_elem.oligoConc
                        ret += ' nMol/l</td>\n  </tr>'
                    }
               }
                if (exp[i].sequences.hasOwnProperty("amplicon")) {
                    var oligo_elem = exp[i].sequences.amplicon
                    var use_oligo = false
                    var oligo = '  <tr>\n    <td style="width:25%;">Amplicon:</td>\n'
                    oligo += '    <td style="width:75%">\n'
                    if (oligo_elem.hasOwnProperty("fivePrimeTag")) {
                      oligo += oligo_elem.fivePrimeTag + ' '
                      use_oligo = true
                    }
                    if (oligo_elem.hasOwnProperty("sequence")) {
                      oligo += niceLongSeq(oligo_elem.sequence)
                      use_oligo = true
                    }
                    if (oligo_elem.hasOwnProperty("threePrimeTag")) {
                      oligo += ' '+ oligo_elem.threePrimeTag
                      use_oligo = true
                    }
                    if (use_oligo == true) {
                      ret += oligo + '</td>\n  </tr>'
                    }
                }
            }
            if (exp[i].hasOwnProperty("commercialAssay")) {
                if (exp[i].commercialAssay.hasOwnProperty("company")) {
                  ret += '  <tr>\n    <td style="width:25%;">Commercial Assay - Company:</td>\n'
                  ret += '    <td style="width:75%">\n'+ exp[i].commercialAssay.company + '</td>\n'
                  ret += '  </tr>'
                }
                if (exp[i].commercialAssay.hasOwnProperty("orderNumber")) {
                  ret += '  <tr>\n    <td style="width:25%;">Commercial Assay - Order Number:</td>\n'
                  ret += '    <td style="width:75%">\n'+ exp[i].commercialAssay.orderNumber + '</td>\n'
                  ret += '  </tr>'
                }
            }
            ret += '</table></p>\n'

            var k = 0
            var xref = '<div class="card">\n<div class="card-body">\n'
            xref += '<h5 class="card-title">References (xRef):</h5>\n'
            xref += '<table style="width:100%;">'
            if (exp[i].hasOwnProperty("xRefs")) {
                k = exp[i].xRefs.length
                for (var j = 0; j < k; j++) {
                    xref += '  <tr>\n    <td style="width:30%;">Name: '
                    xref += saveUndef(exp[i].xRefs[j].name) + '</td>\n'
                    xref += '    <td style="width:30%;">Id: '
                    xref += saveUndef(exp[i].xRefs[j].id) + '</td>\n'
                    xref += '    <td style="width:40%">\n'
                    xref += '<button type="button" class="btn btn-success rdml-btn-edit btn-sm" '
                    xref += 'onclick="editXref(\'target\', ' + i + ', ' + j + ');">Edit</button>&nbsp;&nbsp;'

                    if (j == 0) {
                        xref += '<button type="button" class="btn btn-success rdml-btn-edit btn-sm disabled">Move Up</button>&nbsp;&nbsp;'
                    } else {
                        xref += '<button type="button" class="btn btn-success rdml-btn-edit btn-sm" '
                        xref += 'onclick="moveSecElement(\'target\', ' + i + ', \'\', 0, \'xRef\', ' + j
                        xref += ', ' + (j - 1) + ');">Move Up</button>&nbsp;&nbsp;'
                    }
                    if (j == k - 1) {
                        xref += '<button type="button" class="btn btn-success rdml-btn-edit btn-sm disabled">Move Down</button>&nbsp;&nbsp;&nbsp;'
                    } else {
                        xref += '<button type="button" class="btn btn-success rdml-btn-edit btn-sm" '
                        xref += 'onclick="moveSecElement(\'target\', ' + i + ', \'\', 0, \'xRef\', ' + j
                        xref += ', ' + (j + 2) + ');">Move Down</button>&nbsp;&nbsp;&nbsp;'
                    }
                    xref += '<button type="button" class="btn btn-success rdml-btn-edit btn-sm" '
                    xref += 'onclick="deleteSecElement(\'target\', ' + i + ', \'\', 0, \'xRef\', ' + j
                    xref += ');">Delete</button></td>\n  </tr>'
                }
            }
            xref += '</table></p>\n'
            xref += '</div>\n</div><br />\n'
            if (k > 0) {
                ret += xref
            }

            ret += '<div id="pXref-target-' + i + '"></div>'

            var doc = '<div class="card">\n<div class="card-body">\n'
            doc += '<h5 class="card-title">Documentation:</h5>\n'
            var desc = saveUndef(exp[i].description)
            if (desc != "") {
                doc += '<p>' + desc + '</p>'
            }
            doc += '<button type="button" class="btn btn-success btn-sm" '
            doc += ' onclick="showDocSecElement(\'target\', ' + i + ', \'\', 0, \'documentation\', '
            doc += '\'pDoc-target-' + i + '\', this);">Show All Document Information</button>'
            doc += '&nbsp;&nbsp;<button type="button" class="btn btn-success rdml-btn-edit btn-sm" '
            doc += 'onclick="selectSecElement(\'target\', ' + i + ', \'\', 0, \'documentation\', '
            doc += '\'pDoc-target-' + i + '\');">Change Attached Document Ids</button>'
            doc += '<div id="pDoc-target-' + i + '"></div>'
            doc += '</div>\n</div><br />\n'
            ret += doc

            ret += '<button type="button" class="btn btn-success rdml-btn-edit" '
            ret += 'onclick="editPresentElement(\'target\', ' + i + ');">Edit</button>&nbsp;&nbsp;&nbsp;&nbsp;'
            ret += '<button type="button" class="btn btn-success rdml-btn-edit" '
            ret += 'onclick="editXref(\'target\', ' + i + ', -1);">New xRef</button>&nbsp;&nbsp;&nbsp;&nbsp;'
            if (i == 0) {
                ret += '<button type="button" class="btn btn-success rdml-btn-edit disabled">Move Up</button>&nbsp;&nbsp;'
            } else {
                ret += '<button type="button" class="btn btn-success rdml-btn-edit" '
            ret += 'onclick="moveEditElement(\'target\', \'' + exp[i].id + '\', ' + (i - 1) + ');">Move Up</button>&nbsp;&nbsp;'
            }
            if (i == exp.length - 1) {
                ret += '<button type="button" class="btn btn-success rdml-btn-edit disabled">Move Down</button>&nbsp;&nbsp;&nbsp;'
            } else {
                ret += '<button type="button" class="btn btn-success rdml-btn-edit" '
            ret += 'onclick="moveEditElement(\'target\', \'' + exp[i].id + '\', ' + (i + 2) + ');">Move Down</button>&nbsp;&nbsp;&nbsp;'
            }
            ret += '&nbsp;<button type="button" class="btn btn-success rdml-btn-edit" '
            ret += 'onclick="deleteEditElement(\'target\', ' + i + ');">Delete</button>&nbsp;&nbsp;&nbsp;'
            ret += '</div>\n</div>\n'
        }
    }
    targetsData.innerHTML = ret

    // The Thermal Cycling Conditions tab
    var exp = window.rdmlData.rdml.therm_cyc_cons;
    ret = ''
    for (var i = 0; i < exp.length; i++) {
        if ((editMode == true) && (editType == "therm_cyc_cons") && (i == editNumber)) {
            ret += '<br /><div class="card text-white bg-primary">\n<div class="card-body">\n'
            ret += '<h5 class="card-title">' + (i + 1) + '. Thermal Cycling Conditions ID: ' + exp[i].id + '</h5>\n<p>'
            ret += '<table style="width:100%;">'
            ret += '  <tr>\n    <td style="width:25%;background-color:#cc7a00;">ID:</td>\n'
            ret += '    <td style="width:75%"><input type="text" class="form-control" '
            ret += 'id="inCycId" value="'+ exp[i].id + '"></td>\n'
            ret += '  </tr>'
            ret += '  <tr>\n    <td style="width:25%;">Method of modification:</td>\n'
            ret += '    <td style="width:75%"><select class="form-control" id="inCycIdUnique">\n'
            ret += '        <option value=false selected>Id must be unique and will be renamed</option>\n'
            ret += '        <option value=true>Change all its uses to existing Id (dangerous - may corrupt data)</option>\n'
            ret += '      </select></td>\n'
            ret += '  </tr>'
            ret += '  <tr>\n    <td style="width:25%;">Place at Position:</td>\n'
            ret += '    <td style="width:75%"><input type="text" class="form-control" '
            ret += 'id="inPos" value="' + (i + 1) + '"></td>\n'
            ret += '  </tr>'
            ret += '  <tr>\n    <td style="width:25%;">Description:</td>\n'
            ret += '    <td style="width:75%"><input type="text" class="form-control" '
            ret += 'id="inCycDescription" value="'+ saveUndef(exp[i].description) + '"></td>\n'
            ret += '  </tr>'
            ret += '  <tr>\n    <td style="width:25%;">Lid Temperature:</td>\n'
            ret += '    <td style="width:75%"><input type="text" class="form-control" '
            ret += 'id="inCycLidTemperature" value="'+ saveUndef(exp[i].lidTemperature) + '"></td>\n'
            ret += '  </tr>'
            ret += '</table></p>\n'
            ret += '<button type="button" class="btn btn-success" '
            ret += 'onclick="saveEditElement(\'therm_cyc_cons\', ' + i + ', \'' + exp[i].id + '\');">Save Changes</button>'
            ret += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button type="button" class="btn btn-success" '
            ret += 'onclick="deleteEditElement(\'therm_cyc_cons\', ' + i + ');">Delete</button>&nbsp;&nbsp;&nbsp;'
            ret += '</div>\n</div>\n'
        } else {
            ret += '<br /><div class="card">\n<div class="card-body">\n'
            ret += '<h5 class="card-title">' + (i + 1) + '. Thermal Cycling Conditions ID: ' + exp[i].id + '</h5>\n<p>'
            ret += '<table style="width:100%;">'
            if (exp[i].hasOwnProperty("lidTemperature")) {
                ret += '  <tr>\n    <td style="width:25%;">Lid Temperature:</td>\n'
                ret += '    <td style="width:75%">\n'+ exp[i].lidTemperature + ' &deg;C</td>\n'
                ret += '  </tr>'
            }
            ret += '</table></p>\n'
            ret += '<div class="card">\n<div class="card-body">\n'
            ret += '<h5 class="card-title">Cycling Protocol:</h5>\n'
            var cyc_steps = exp[i].steps
            for (var s = 0 ; s < cyc_steps.length ; s++){
                ret += '<div class="card">\n<div class="card-body">\n'
                if (cyc_steps[s].hasOwnProperty("temperature")) {
                    ret += '<h5 class="card-title">Step ' + cyc_steps[s].nr + ' - Temperature:</h5>\n'
                    ret += '<table style="width:100%;">'
                    ret += '  <tr>\n    <td style="width:25%;">Temperature:</td>\n'
                    ret += '    <td style="width:75%">\n'+ cyc_steps[s].temperature.temperature + ' &deg;C</td>\n'
                    ret += '  </tr>'
                    ret += '  <tr>\n    <td style="width:25%;">Duration:</td>\n'
                    ret += '    <td style="width:75%">\n'+ cyc_steps[s].temperature.duration + ' sec</td>\n'
                    ret += '  </tr>'
                    if (cyc_steps[s].temperature.hasOwnProperty("temperatureChange")) {
                        ret += '  <tr>\n    <td style="width:25%;">Temperature Change:</td>\n'
                        ret += '    <td style="width:75%">\n'+ cyc_steps[s].temperature.temperatureChange + ' &deg;C/cycle</td>\n'
                        ret += '  </tr>'
                    }
                    if (cyc_steps[s].temperature.hasOwnProperty("durationChange")) {
                        ret += '  <tr>\n    <td style="width:25%;">Duration Change:</td>\n'
                        ret += '    <td style="width:75%">\n'+ cyc_steps[s].temperature.durationChange + ' sec/cycle</td>\n'
                        ret += '  </tr>'
                    }
                    if (cyc_steps[s].temperature.hasOwnProperty("measure")) {
                        ret += '  <tr>\n    <td style="width:25%;">Measure for:</td>\n'
                        ret += '    <td style="width:75%">\n'+ cyc_steps[s].temperature.measure + '</td>\n'
                        ret += '  </tr>'
                    }
                    if (cyc_steps[s].temperature.hasOwnProperty("ramp")) {
                        ret += '  <tr>\n    <td style="width:25%;">Max. Ramp Speed:</td>\n'
                        ret += '    <td style="width:75%">\n'+ cyc_steps[s].temperature.ramp + ' &deg;C/sec</td>\n'
                        ret += '  </tr>'
                    }
                }
                if (cyc_steps[s].hasOwnProperty("gradient")) {
                    ret += '<h5 class="card-title">Step ' + cyc_steps[s].nr + ' - Gradient:</h5>\n'
                    ret += '<table style="width:100%;">'
                    ret += '  <tr>\n    <td style="width:25%;">High Temperature:</td>\n'
                    ret += '    <td style="width:75%">\n'+ cyc_steps[s].gradient.highTemperature + ' &deg;C</td>\n'
                    ret += '  </tr>'
                    ret += '  <tr>\n    <td style="width:25%;">Low Temperature:</td>\n'
                    ret += '    <td style="width:75%">\n'+ cyc_steps[s].gradient.lowTemperature + ' &deg;C</td>\n'
                    ret += '  </tr>'
                    ret += '  <tr>\n    <td style="width:25%;">Duration:</td>\n'
                    ret += '    <td style="width:75%">\n'+ cyc_steps[s].gradient.duration + ' sec</td>\n'
                    ret += '  </tr>'
                    if (cyc_steps[s].gradient.hasOwnProperty("temperatureChange")) {
                        ret += '  <tr>\n    <td style="width:25%;">Temperature Change:</td>\n'
                        ret += '    <td style="width:75%">\n'+ cyc_steps[s].gradient.temperatureChange + ' &deg;C/cycle</td>\n'
                        ret += '  </tr>'
                    }
                    if (cyc_steps[s].gradient.hasOwnProperty("durationChange")) {
                        ret += '  <tr>\n    <td style="width:25%;">Duration Change:</td>\n'
                        ret += '    <td style="width:75%">\n'+ cyc_steps[s].gradient.durationChange + ' sec/cycle</td>\n'
                        ret += '  </tr>'
                    }
                    if (cyc_steps[s].gradient.hasOwnProperty("measure")) {
                        ret += '  <tr>\n    <td style="width:25%;">Measure for:</td>\n'
                        ret += '    <td style="width:75%">\n'+ cyc_steps[s].gradient.measure + '</td>\n'
                        ret += '  </tr>'
                    }
                    if (cyc_steps[s].gradient.hasOwnProperty("ramp")) {
                        ret += '  <tr>\n    <td style="width:25%;">Max. Ramp Speed:</td>\n'
                        ret += '    <td style="width:75%">\n'+ cyc_steps[s].gradient.ramp + ' &deg;C/sec</td>\n'
                        ret += '  </tr>'
                    }
                }
                if (cyc_steps[s].hasOwnProperty("loop")) {
                    ret += '<h5 class="card-title">Step ' + cyc_steps[s].nr + ' - Loop:</h5>\n'
                    ret += '<table style="width:100%;">'
                    ret += '  <tr>\n    <td style="width:25%;">Go back to step:</td>\n'
                    ret += '    <td style="width:75%">\n'+ cyc_steps[s].loop.goto + '</td>\n'
                    ret += '  </tr>'
                    ret += '  <tr>\n    <td style="width:25%;">Repeat:</td>\n'
                    ret += '    <td style="width:75%">\n' + cyc_steps[s].loop.repeat + ' times ('
                    ret += (parseInt(cyc_steps[s].loop.repeat) + 1)  + ' cycles)</td>\n'
                    ret += '  </tr>'
                }
                if (cyc_steps[s].hasOwnProperty("pause")) {
                    ret += '<h5 class="card-title">Step ' + cyc_steps[s].nr + ' - Pause:</h5>\n'
                    ret += '<table style="width:100%;">'
                    ret += '  <tr>\n    <td style="width:25%;">Temperature:</td>\n'
                    ret += '    <td style="width:75%">\n'+ cyc_steps[s].pause.temperature + ' &deg;C</td>\n'
                    ret += '  </tr>'
                }
                if (cyc_steps[s].hasOwnProperty("lidOpen")) {
                    ret += '<h5 class="card-title">Step ' + cyc_steps[s].nr + ' - LidOpen:</h5>\n'
                    ret += '<table style="width:100%;">'
                    ret += '  <tr>\n    <td style="width:25%;">Lid Open:</td>\n'
                    ret += '    <td style="width:75%">\nWait for lid open.</td>\n'
                    ret += '  </tr>'
                }
                ret += '</table></p>\n'
                ret += '<button type="button" class="btn btn-success rdml-btn-edit btn-sm" '
                ret += 'onclick="newEditStep(' + i + ', ' + (s + 1) + ', \'edit\');">Edit Step</button>&nbsp;&nbsp;'
                ret += '<button type="button" class="btn btn-success rdml-btn-edit btn-sm" '
                ret += 'onclick="deleteStep(' + i + ', ' + (s + 1) + ');">Delete Step</button>&nbsp;&nbsp;'
                ret += '</div>\n</div><br />\n'
            }
            ret += '<div id="pStep-therm_cyc_cons-' + i + '"></div>'
            ret += '<button type="button" class="btn btn-success rdml-btn-edit btn-sm" '
            ret += 'onclick="newEditStep(' + i + ', 999999, \'temperature\');">New Temperature Step</button>&nbsp;&nbsp;'
            ret += '<button type="button" class="btn btn-success rdml-btn-edit btn-sm" '
            ret += 'onclick="newEditStep(' + i + ', 999999, \'gradient\');">New Gradient Step</button>&nbsp;&nbsp;'
            ret += '<button type="button" class="btn btn-success rdml-btn-edit btn-sm" '
            ret += 'onclick="newEditStep(' + i + ', 999999, \'loop\');">New Loop Step</button>&nbsp;&nbsp;'
            ret += '<button type="button" class="btn btn-success rdml-btn-edit btn-sm" '
            ret += 'onclick="newEditStep(' + i + ', 999999, \'pause\');">New Pause Step</button>&nbsp;&nbsp;'
            ret += '<button type="button" class="btn btn-success rdml-btn-edit btn-sm" '
            ret += 'onclick="newEditStep(' + i + ', 999999, \'lidOpen\');">New Lid Open Step</button><br />'
            ret += '</div>\n</div><br />\n'

            var k = 0
            var xref = '<div class="card">\n<div class="card-body">\n'
            xref += '<h5 class="card-title">Experimenters:</h5>\n'
            xref += '<table style="width:100%;">'
            if (exp[i].hasOwnProperty("experimenters")) {
                k = exp[i].experimenters.length
                for (var j = 0; j < k; j++) {
                    xref += '  <tr>\n    <td style="width:75%;">'
                    xref += saveUndef(exp[i].experimenters[j]) + '</td>\n'
                    // Todo make link
                    xref += '    <td style="width:25%">\n'
                    if (j == 0) {
                        xref += '<button type="button" class="btn btn-success rdml-btn-edit btn-sm disabled">Move Up</button>&nbsp;&nbsp;'
                    } else {
                        xref += '<button type="button" class="btn btn-success rdml-btn-edit btn-sm" '
                        xref += 'onclick="moveSecElement(\'therm_cyc_cons\', ' + i + ', \'\', 0, \'experimenter\', ' + j
                        xref += ', ' + (j - 1) + ');">Move Up</button>&nbsp;&nbsp;'
                    }
                    if (j == k - 1) {
                        xref += '<button type="button" class="btn btn-success rdml-btn-edit btn-sm disabled">Move Down</button>&nbsp;&nbsp;&nbsp;'
                    } else {
                        xref += '<button type="button" class="btn btn-success rdml-btn-edit btn-sm" '
                        xref += 'onclick="moveSecElement(\'therm_cyc_cons\', ' + i + ', \'\', 0, \'experimenter\', ' + j
                        xref += ', ' + (j + 2) + ');">Move Down</button>'
                    }
                    xref += '</td>\n  </tr>'
                }
            }
            xref += '</table></p>\n'
            xref += '</div>\n</div><br />\n'
            if (k > 0) {
                ret += xref
            }
            ret += '<div id="pExp-therm_cyc_cons-' + i + '"></div>'

            var doc = '<div class="card">\n<div class="card-body">\n'
            doc += '<h5 class="card-title">Documentation:</h5>\n'
            var desc = saveUndef(exp[i].description)
            if (desc != "") {
                doc += '<p>' + desc + '</p>'
            }
            doc += '<button type="button" class="btn btn-success btn-sm" '
            doc += ' onclick="showDocSecElement(\'therm_cyc_cons\', ' + i + ', \'\', 0, \'documentation\', '
            doc += '\'pDoc-therm_cyc_cons-' + i + '\', this);">Show All Document Information</button>'
            doc += '&nbsp;&nbsp;<button type="button" class="btn btn-success rdml-btn-edit btn-sm" '
            doc += 'onclick="selectSecElement(\'therm_cyc_cons\', ' + i + ', \'\', 0, \'documentation\', '
            doc += '\'pDoc-therm_cyc_cons-' + i + '\');">Change Attached Document Ids</button>'
            doc += '<div id="pDoc-therm_cyc_cons-' + i + '"></div>'
            doc += '</div>\n</div><br />\n'
            ret += doc

            ret += '<button type="button" class="btn btn-success rdml-btn-edit" '
            ret += 'onclick="editPresentElement(\'therm_cyc_cons\', ' + i + ');">Edit</button>&nbsp;&nbsp;&nbsp;&nbsp;'
            ret += '<button type="button" class="btn btn-success rdml-btn-edit" '
            ret += 'onclick="selectSecElement(\'therm_cyc_cons\', ' + i + ', \'\', 0, \'experimenter\', '
            ret += '\'pExp-therm_cyc_cons-' + i + '\');"">Change Attached Experimenters</button>&nbsp;&nbsp;&nbsp;&nbsp;'
            if (i == 0) {
                ret += '<button type="button" class="btn btn-success rdml-btn-edit disabled">Move Up</button>&nbsp;&nbsp;'
            } else {
                ret += '<button type="button" class="btn btn-success rdml-btn-edit" '
            ret += 'onclick="moveEditElement(\'therm_cyc_cons\', \'' + exp[i].id + '\', ' + (i - 1) + ');">Move Up</button>&nbsp;&nbsp;'
            }
            if (i == exp.length - 1) {
                ret += '<button type="button" class="btn btn-success rdml-btn-edit disabled">Move Down</button>&nbsp;&nbsp;&nbsp;'
            } else {
                ret += '<button type="button" class="btn btn-success rdml-btn-edit" '
            ret += 'onclick="moveEditElement(\'therm_cyc_cons\', \'' + exp[i].id + '\', ' + (i + 2) + ');">Move Down</button>&nbsp;&nbsp;&nbsp;'
            }
            ret += '&nbsp;<button type="button" class="btn btn-success rdml-btn-edit" '
            ret += 'onclick="deleteEditElement(\'therm_cyc_cons\', ' + i + ');">Delete</button>&nbsp;&nbsp;&nbsp;'
            ret += '</div>\n</div>\n'
        }
    }
    therm_cyc_consData.innerHTML = ret

    // The experimenters tab
    var exp = window.rdmlData.rdml.experimenters;
    ret = ''
    for (var i = 0; i < exp.length; i++) {
        if ((editMode == true) && (editType == "experimenter") && (i == editNumber)) {
            ret += '<br /><div class="card text-white bg-primary">\n<div class="card-body">\n'
            ret += '<h5 class="card-title">' + (i + 1) + '. Experimenter ID: ' + exp[i].id + '</h5>\n<p>'
            ret += '<table style="width:100%;">'
            ret += '  <tr>\n    <td style="width:15%;background-color:#cc7a00;">ID:</td>\n'
            ret += '    <td style="width:85%"><input type="text" class="form-control" '
            ret += 'id="inExpId" value="'+ exp[i].id + '"></td>\n'
            ret += '  </tr>'
            ret += '  <tr>\n    <td style="width:25%;">Method of modification:</td>\n'
            ret += '    <td style="width:75%"><select class="form-control" id="inExpIdUnique">\n'
            ret += '        <option value=false selected>Id must be unique and will be renamed</option>\n'
            ret += '        <option value=true>Change all its uses to existing Id (dangerous - may corrupt data)</option>\n'
            ret += '      </select></td>\n'
            ret += '  </tr>'
            ret += '  <tr>\n    <td style="width:15%;">Place at Position:</td>\n'
            ret += '    <td style="width:85%"><input type="text" class="form-control" '
            ret += 'id="inPos" value="' + (i + 1) + '"></td>\n'
            ret += '  </tr>'
            ret += '  <tr>\n    <td style="width:15%;background-color:#cc7a00;">First Name:</td>\n'
            ret += '    <td style="width:85%"><input type="text" class="form-control" '
            ret += 'id="inExpFirstName" value="'+ exp[i].firstName + '"></td>\n'
            ret += '  </tr>'
            ret += '  <tr>\n    <td style="width:15%;background-color:#cc7a00">Last Name:</td>\n'
            ret += '    <td style="width:85%"><input type="text" class="form-control" '
            ret += 'id="inExpLastName" value="'+ exp[i].lastName + '"></td>\n'
            ret += '  </tr>'
            ret += '  <tr>\n    <td style="width:15%;">E-Mail:</td>\n'
            ret += '    <td style="width:85%"><input type="text" class="form-control" '
            ret += 'id="inExpEmail" value="'+ saveUndef(exp[i].email) + '"></td>\n'
            ret += '  </tr>'
            ret += '  <tr>\n    <td style="width:15%;">Lab Name:</td>\n'
            ret += '    <td style="width:85%"><input type="text" class="form-control" '
            ret += 'id="inExpLabName" value="'+ saveUndef(exp[i].labName) + '"></td>\n'
            ret += '  </tr>'
            ret += '  <tr>\n    <td style="width:15%;">Lab Address:</td>\n'
            ret += '    <td style="width:85%"><input type="text" class="form-control" '
            ret += 'id="inExpLabAddress" value="'+ saveUndef(exp[i].labAddress) + '"></td>\n'
            ret += '  </tr>'
            ret += '</table></p>\n'
            ret += '<button type="button" class="btn btn-success" '
            ret += 'onclick="saveEditElement(\'experimenter\', ' + i + ', \'' + exp[i].id + '\');">Save Changes</button>'
            ret += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button type="button" class="btn btn-success" '
            ret += 'onclick="deleteEditElement(\'experimenter\', ' + i + ');">Delete</button>&nbsp;&nbsp;&nbsp;'
            ret += '</div>\n</div>\n'
        } else {
            ret += '<br /><div class="card">\n<div class="card-body">\n'
            ret += '<h5 class="card-title">' + (i + 1) + '. Experimenter ID: ' + exp[i].id + '</h5>\n<p>'
            ret += '<table style="width:100%;">'
            ret += '  <tr>\n    <td style="width:15%;">Name:</td>\n'
            ret += '    <td style="width:85%">\n'+ exp[i].lastName + ', ' + exp[i].firstName + '</td>\n'
            ret += '  </tr>'
            if (exp[i].hasOwnProperty("email")) {
              ret += '  <tr>\n    <td style="width:15%;">E-Mail:</td>\n'
              ret += '    <td style="width:85%">\n'+ exp[i].email + '</td>\n'
              ret += '  </tr>'
            }
            if (exp[i].hasOwnProperty("labName")) {
              ret += '  <tr>\n    <td style="width:15%;">Lab Name:</td>\n'
              ret += '    <td style="width:85%">\n'+ exp[i].labName + '</td>\n'
              ret += '  </tr>'
            }
            if (exp[i].hasOwnProperty("labAddress")) {
              ret += '  <tr>\n    <td style="width:15%;">Lab Address:</td>\n'
              ret += '    <td style="width:85%">\n'+ exp[i].labAddress + '</td>\n'
              ret += '  </tr>'
            }
            ret += '</table></p>\n'
            ret += '<button type="button" class="btn btn-success rdml-btn-edit" '
            ret += 'onclick="editPresentElement(\'experimenter\', ' + i + ');">Edit</button>&nbsp;&nbsp;&nbsp;&nbsp;'
            if (i == 0) {
                ret += '<button type="button" class="btn btn-success rdml-btn-edit disabled">Move Up</button>&nbsp;&nbsp;'
            } else {
                ret += '<button type="button" class="btn btn-success rdml-btn-edit" '
            ret += 'onclick="moveEditElement(\'experimenter\', \'' + exp[i].id + '\', ' + (i - 1) + ');">Move Up</button>&nbsp;&nbsp;'
            }
            if (i == exp.length - 1) {
                ret += '<button type="button" class="btn btn-success rdml-btn-edit disabled">Move Down</button>&nbsp;&nbsp;&nbsp;'
            } else {
                ret += '<button type="button" class="btn btn-success rdml-btn-edit" '
            ret += 'onclick="moveEditElement(\'experimenter\', \'' + exp[i].id + '\', ' + (i + 2) + ');">Move Down</button>&nbsp;&nbsp;&nbsp;'
            }
            ret += '&nbsp;<button type="button" class="btn btn-success rdml-btn-edit" '
            ret += 'onclick="deleteEditElement(\'experimenter\', ' + i + ');">Delete</button>&nbsp;&nbsp;&nbsp;'
            ret += '</div>\n</div>\n'
        }
    }
    experimentersData.innerHTML = ret

    // The documentations tab
    var exp = window.rdmlData.rdml.documentations;
    ret = ''
    for (var i = 0; i < exp.length; i++) {
        if ((editMode == true) && (editType == "documentation") && (i == editNumber)) {
            ret += '<br /><div class="card text-white bg-primary">\n<div class="card-body">\n'
            ret += '<h5 class="card-title">' + (i + 1) + '. Documentation ID: ' + exp[i].id + '</h5>\n<p>'
            ret += '<table style="width:100%;">'
            ret += '  <tr>\n    <td style="width:15%;background-color:#cc7a00;">ID:</td>\n'
            ret += '    <td style="width:85%"><input type="text" class="form-control" '
            ret += 'id="inDocId" value="'+ exp[i].id + '"></td>\n'
            ret += '  </tr>'
            ret += '  <tr>\n    <td style="width:25%;">Method of modification:</td>\n'
            ret += '    <td style="width:75%"><select class="form-control" id="inDocIdUnique">\n'
            ret += '        <option value=false selected>Id must be unique and will be renamed</option>\n'
            ret += '        <option value=true>Change all its uses to existing Id (dangerous - may corrupt data)</option>\n'
            ret += '      </select></td>\n'
            ret += '  </tr>'
            ret += '  <tr>\n    <td style="width:15%;">Place at Position:</td>\n'
            ret += '    <td style="width:85%"><input type="text" class="form-control" '
            ret += 'id="inPos" value="' + (i + 1) + '"></td>\n'
            ret += '  </tr>'
            ret += '</table></p><textarea class="form-control" id="inDocText" rows="20">' + saveUndef(exp[i].text) + '</textarea><br /><br />\n'
            ret += '<button type="button" class="btn btn-success" '
            ret += 'onclick="saveEditElement(\'documentation\', ' + i + ', \'' + exp[i].id + '\');">Save Changes</button>'
            ret += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button type="button" class="btn btn-success" '
            ret += 'onclick="deleteEditElement(\'documentation\', ' + i + ');">Delete</button>&nbsp;&nbsp;&nbsp;'
            ret += '</div>\n</div>\n'
        } else {
            ret += '<br /><div class="card">\n<div class="card-body">\n'
            ret += '<h5 class="card-title">' + (i + 1) + '. Documentation ID: ' + exp[i].id + '</h5>\n<p>'
            ret += '<p>' + htmllize(saveUndef(exp[i].text)) + '</p>\n'
            ret += '<button type="button" class="btn btn-success rdml-btn-edit" '
            ret += 'onclick="editPresentElement(\'documentation\', ' + i + ');">Edit</button>&nbsp;&nbsp;&nbsp;&nbsp;'
            if (i == 0) {
                ret += '<button type="button" class="btn btn-success rdml-btn-edit disabled">Move Up</button>&nbsp;&nbsp;'
            } else {
                ret += '<button type="button" class="btn btn-success rdml-btn-edit" '
            ret += 'onclick="moveEditElement(\'documentation\', \'' + exp[i].id + '\', ' + (i - 1) + ');">Move Up</button>&nbsp;&nbsp;'
            }
            if (i == exp.length - 1) {
                ret += '<button type="button" class="btn btn-success rdml-btn-edit disabled">Move Down</button>&nbsp;&nbsp;&nbsp;'
            } else {
                ret += '<button type="button" class="btn btn-success rdml-btn-edit" '
            ret += 'onclick="moveEditElement(\'documentation\', \'' + exp[i].id + '\', ' + (i + 2) + ');">Move Down</button>&nbsp;&nbsp;&nbsp;'
            }
            ret += '&nbsp;<button type="button" class="btn btn-success rdml-btn-edit" '
            ret += 'onclick="deleteEditElement(\'documentation\', ' + i + ');">Delete</button>&nbsp;&nbsp;&nbsp;'
            ret += '</div>\n</div>\n'
        }
    }
    documentationsData.innerHTML = ret

    // The dye tab - File Info
    var fileRoot = window.rdmlData.rdml
    ret = '<br /><div class="card">\n<div class="card-body">\n'
    ret += '<h5 class="card-title">RDML File Information</h5>\n<p>'
    ret += '<table style="width:100%;">'
    ret += '  <tr>\n    <td style="width:15%;">Version:</td>\n'
    ret += '    <td style="width:85%">\n'+ fileRoot.version + '</td>\n'
    ret += '  </tr>'
    ret += '  <tr>\n    <td style="width:15%;">Date Created:</td>\n'
    ret += '    <td style="width:85%">\n'+ fileRoot.dateMade.replace("T", " at ") + ' UTC</td>\n'
    ret += '  </tr>'
    ret += '  <tr>\n    <td style="width:15%;">Date Updated:</td>\n'
    ret += '    <td style="width:85%">\n'+ fileRoot.dateUpdated.replace("T", " at ") + ' UTC</td>\n'
    ret += '  </tr>'
    ret += '</table></p>\n'
    ret += '</div>\n</div>\n'
    fileInfoData.innerHTML = ret

    // The dye tab - RDML Id Info
    var exp = window.rdmlData.rdml.ids;
    ret = ''
    for (var i = 0; i < exp.length; i++) {
        if ((editMode == true) && (editType == "rdmlid") && (i == editNumber)) {
            ret += '<br /><div class="card text-white bg-primary">\n<div class="card-body">\n'
            ret += '<h5 class="card-title">' + (i + 1) + '. RDML File  ID:</h5>\n<p>'
            ret += '<table style="width:100%;">'
            ret += '  <tr>\n    <td style="width:15%;">Place at Position:</td>\n'
            ret += '    <td style="width:85%"><input type="text" class="form-control" '
            ret += 'id="inPos" value="' + (i + 1) + '"></td>\n'
            ret += '  </tr>'
            ret += '  <tr>\n    <td style="width:15%;background-color:#cc7a00;">Publisher:</td>\n'
            ret += '    <td style="width:85%"><input type="text" class="form-control" '
            ret += 'id="inRdmlidPublisher" value="'+ exp[i].publisher + '"></td>\n'
            ret += '  </tr>'
            ret += '  <tr>\n    <td style="width:15%;background-color:#cc7a00;">Serial Number:</td>\n'
            ret += '    <td style="width:85%"><input type="text" class="form-control" '
            ret += 'id="inRdmlidSerialNumber" value="'+ exp[i].serialNumber + '"></td>\n'
            ret += '  </tr>'
            ret += '  <tr>\n    <td style="width:15%;">MD5Hash:</td>\n'
            ret += '    <td style="width:85%"><input type="text" class="form-control" '
            ret += 'id="inRdmlidMD5Hash" value="'+ saveUndef(exp[i].MD5Hash) + '"></td>\n'
            ret += '  </tr>'
            ret += '</table></p>\n'
            ret += '<button type="button" class="btn btn-success" '
            ret += 'onclick="saveEditElement(\'rdmlid\', ' + i + ', \'' + i + '\');">Save Changes</button>'
            ret += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button type="button" class="btn btn-success" '
            ret += 'onclick="deleteEditElement(\'rdmlid\', ' + i + ');">Delete</button>&nbsp;&nbsp;&nbsp;'
            ret += '</div>\n</div>\n'
        } else {
            ret += '<br /><div class="card">\n<div class="card-body">\n'
            ret += '<h5 class="card-title">' + (i + 1) + '. RDML File ID: </h5>\n<p>'
            ret += '<table style="width:100%;">'
            ret += '  <tr>\n    <td style="width:15%;">Publisher:</td>\n'
            ret += '    <td style="width:85%">\n'+ exp[i].publisher + '</td>\n'
            ret += '  </tr>'
            ret += '  <tr>\n    <td style="width:15%;">Serial Number:</td>\n'
            ret += '    <td style="width:85%">\n'+ exp[i].serialNumber + '</td>\n'
            ret += '  </tr>'
            if (exp[i].hasOwnProperty("MD5Hash")) {
              ret += '  <tr>\n    <td style="width:15%;">MD5Hash:</td>\n'
              ret += '    <td style="width:85%">\n'+ exp[i].MD5Hash + '</td>\n'
              ret += '  </tr>'
            }
            ret += '</table></p>\n'
            ret += '<button type="button" class="btn btn-success rdml-btn-edit" '
            ret += 'onclick="editPresentElement(\'rdmlid\', ' + i + ');">Edit</button>&nbsp;&nbsp;&nbsp;&nbsp;'
            if (i == 0) {
                ret += '<button type="button" class="btn btn-success rdml-btn-edit disabled">Move Up</button>&nbsp;&nbsp;'
            } else {
                ret += '<button type="button" class="btn btn-success rdml-btn-edit" '
            ret += 'onclick="moveEditElement(\'rdmlid\', \'' + i + '\', ' + (i - 1) + ');">Move Up</button>&nbsp;&nbsp;'
            }
            if (i == exp.length - 1) {
                ret += '<button type="button" class="btn btn-success rdml-btn-edit disabled">Move Down</button>&nbsp;&nbsp;&nbsp;'
            } else {
                ret += '<button type="button" class="btn btn-success rdml-btn-edit" '
            ret += 'onclick="moveEditElement(\'rdmlid\', \'' + i + '\', ' + (i + 2) + ');">Move Down</button>&nbsp;&nbsp;&nbsp;'
            }
            ret += '&nbsp;<button type="button" class="btn btn-success rdml-btn-edit" '
            ret += 'onclick="deleteEditElement(\'rdmlid\', ' + i + ');">Delete</button>&nbsp;&nbsp;&nbsp;'
            ret += '</div>\n</div>\n'
        }
    }
    rdmlidsData.innerHTML = ret

    // The dye tab - dyes tab
    var exp = window.rdmlData.rdml.dyes;
    ret = ''
    for (var i = 0; i < exp.length; i++) {
        if ((editMode == true) && (editType == "dye") && (i == editNumber)) {
            ret += '<br /><div class="card text-white bg-primary">\n<div class="card-body">\n'
            ret += '<h5 class="card-title">' + (i + 1) + '. Dye ID: ' + exp[i].id + '</h5>\n<p>'
            ret += '<table style="width:100%;">'
            ret += '  <tr>\n    <td style="width:15%;background-color:#cc7a00;">ID:</td>\n'
            ret += '    <td style="width:85%"><input type="text" class="form-control" '
            ret += 'id="inDyeId" value="'+ exp[i].id + '"></td>\n'
            ret += '  </tr>'
            if (["1.3", "1.4"].includes(window.rdmlData.rdml.version)) {
                ret += '  <tr>\n    <td style="width:25%;">Fluorescence Reporter:</td>\n'
                ret += '    <td style="width:75%"><select class="form-control" id="inDyeDyeChemistry">\n'
                ret += '        <option value=""'
                var primRep = saveUndef(exp[i].dyeChemistry)
                if (primRep == "") {
                    ret += ' selected'
                }
                ret += '>not set</option>\n'
                ret += '        <option value="non-saturating DNA binding dye"'
                if (primRep == "non-saturating DNA binding dye") {
                    ret += ' selected'
                }
                ret += '>non-saturating DNA binding dye (SYBR Green I)</option>\n'
                ret += '        <option value="saturating DNA binding dye"'
                if (primRep == "saturating DNA binding dye") {
                    ret += ' selected'
                }
                ret += '>saturating DNA binding dye (Eva Green, LC Green Plus, BEBO, Syto9)</option>\n'
                ret += '        <option value="hybridization probe"'
                if (primRep == "hybridization probe") {
                    ret += ' selected'
                }
                ret += '>hybridization probe (Molecular Beacon, Light-Up probes, BHQnova Probe)</option>\n'
                ret += '        <option value="hydrolysis probe"'
                if (primRep == "hydrolysis probe") {
                    ret += ' selected'
                }
                ret += '>hydrolysis probe (TaqMan, NuPCR)</option>\n'
                ret += '        <option value="labelled forward primer"'
                if (primRep == "labelled forward primer") {
                    ret += ' selected'
                }
                ret += '>labelled forward primer (LUX primer)</option>\n'
                ret += '        <option value="labelled reverse primer"'
                if (primRep == "labelled reverse primer") {
                    ret += ' selected'
                }
                ret += '>labelled reverse primer (Scorpion probe, Sunrise probe, Amplifluor Universal detection system)</option>\n'
                ret += '        <option value="DNA-zyme probe"'
                if (primRep == "DNA-zyme probe") {
                    ret += ' selected'
                }
                ret += '>DNA-zyme probe (QZyme probe)</option>\n'
                ret += '      </select></td>\n'
                ret += '  </tr>'
            }
            if (["1.4"].includes(window.rdmlData.rdml.version)) {
                ret += '  <tr>\n    <td style="width:15%;">dNTP Concentration (&micro;Mol/l)</td>\n'
                ret += '    <td style="width:85%"><input type="text" class="form-control" '
                ret += 'id="inDyeDNTPs" value="'
                if (exp[i].hasOwnProperty("dNTPs")) {
                    ret += exp[i].dNTPs
                }
                ret += '"></td>\n  </tr>'
                ret += '  <tr>\n    <td style="width:15%;">Dye Concentration (nMol/l)</td>\n'
                ret += '    <td style="width:85%"><input type="text" class="form-control" '
                ret += 'id="inDyeConc" value="'
                if (exp[i].hasOwnProperty("dyeConc")) {
                    ret += exp[i].dyeConc
                }
                ret += '"></td>\n  </tr>'
            }
            ret += '  <tr>\n    <td style="width:25%;">Method of modification:</td>\n'
            ret += '    <td style="width:75%"><select class="form-control" id="inDyeIdUnique">\n'
            ret += '        <option value=false selected>Id must be unique and will be renamed</option>\n'
            ret += '        <option value=true>Change all its uses to existing Id (dangerous - may corrupt data)</option>\n'
            ret += '      </select></td>\n'
            ret += '  </tr>'
            ret += '  <tr>\n    <td style="width:15%;">Place at Position:</td>\n'
            ret += '    <td style="width:85%"><input type="text" class="form-control" '
            ret += 'id="inPos" value="' + (i + 1) + '"></td>\n'
            ret += '  </tr>'
            ret += '</table></p><textarea class="form-control" id="inDyeDescription" rows="20">'
            ret += htmllize(saveUndef(exp[i].description)) + '</textarea><br /><br />\n'
            ret += '<button type="button" class="btn btn-success" '
            ret += 'onclick="saveEditElement(\'dye\', ' + i + ', \'' + exp[i].id + '\');">Save Changes</button>'
            ret += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button type="button" class="btn btn-success" '
            ret += 'onclick="deleteEditElement(\'dye\', ' + i + ');">Delete</button>&nbsp;&nbsp;&nbsp;'
            ret += '</div>\n</div>\n'
        } else {
            ret += '<br /><div class="card">\n<div class="card-body">\n'
            ret += '<h5 class="card-title">' + (i + 1) + '. Dye ID: ' + exp[i].id + '</h5>\n<p>'
            ret += '<table style="width:100%;">'
            if (exp[i].hasOwnProperty("dyeChemistry")) {
                ret += '  <tr>\n    <td style="width:25%;">Fluorescence Reporter:</td>\n'
                ret += '    <td style="width:75%">\n'+ exp[i].dyeChemistry + '</td>\n'
                ret += '  </tr>\n'
            }
            if (exp[i].hasOwnProperty("dyeConc")) {
                ret += '  <tr>\n    <td style="width:25%;">Dye Concentration:</td>\n'
                ret += '    <td style="width:75%">\n'+ exp[i].dyeConc + ' nMol/l</td>\n'
                ret += '  </tr>\n'
            }
            if (exp[i].hasOwnProperty("dNTPs")) {
                ret += '  <tr>\n    <td style="width:25%;">dNTPs Concentration:</td>\n'
                ret += '    <td style="width:75%">\n'+ exp[i].dNTPs + ' &micro;Mol/l</td>\n'
                ret += '  </tr>\n'
            }
            ret += '</table>'
            ret += '<p>' + saveUndef(exp[i].description) + '</p>\n'
            ret += '<button type="button" class="btn btn-success rdml-btn-edit" '
            ret += 'onclick="editPresentElement(\'dye\', ' + i + ');">Edit</button>&nbsp;&nbsp;&nbsp;&nbsp;'
            if (i == 0) {
                ret += '<button type="button" class="btn btn-success rdml-btn-edit disabled">Move Up</button>&nbsp;&nbsp;'
            } else {
                ret += '<button type="button" class="btn btn-success rdml-btn-edit" '
            ret += 'onclick="moveEditElement(\'dye\', \'' + exp[i].id + '\', ' + (i - 1) + ');">Move Up</button>&nbsp;&nbsp;'
            }
            if (i == exp.length - 1) {
                ret += '<button type="button" class="btn btn-success rdml-btn-edit disabled">Move Down</button>&nbsp;&nbsp;&nbsp;'
            } else {
                ret += '<button type="button" class="btn btn-success rdml-btn-edit" '
            ret += 'onclick="moveEditElement(\'dye\', \'' + exp[i].id + '\', ' + (i + 2) + ');">Move Down</button>&nbsp;&nbsp;&nbsp;'
            }
            ret += '&nbsp;<button type="button" class="btn btn-success rdml-btn-edit" '
            ret += 'onclick="deleteEditElement(\'dye\', ' + i + ');">Delete</button>&nbsp;&nbsp;&nbsp;'
            ret += '</div>\n</div>\n'
        }
    }
    dyesData.innerHTML = ret


    if (window.docIdOpen != "") {
        try {
            showDocSecElement(window.docIdOpen[0], window.docIdOpen[1], window.docIdOpen[2], window.docIdOpen[3],
                              window.docIdOpen[4], window.docIdOpen[5], null);
        }
        catch(err) {
            window.docIdOpen = ""
        }
    }

    var elem = document.getElementsByClassName('rdml-btn-edit')
    if (window.showEditButt == false) {
        for (var i = 0 ; i < elem.length ; i++) {
            elem[i].style.display = "none"
        }
    } else {
        for (var i = 0 ; i < elem.length ; i++) {
            elem[i].style.display = "inline"
        }
    }

    if (window.selIdOnLoad != "") {
        var lElem = document.getElementById(window.selIdOnLoad)
        window.selIdOnLoad = ""
        if (lElem) {
            lElem.scrollIntoView()
        }
    }
}

function deleteAllData() {
    experimentersData.innerHTML = ""
}

function showElement(element) {
    element.classList.remove('d-none')
}

function hideElement(element) {
    element.classList.add('d-none')
}

window.createNewElement = createNewElement;
function createNewElement(typ){
    if (!(window.rdmlData.hasOwnProperty("rdml"))) {
        return
    }
    if (window.editMode == true) {
        return  // Another element is already edited
    }
    window.editMode = true;
    window.editIsNew = true;
    if (typ == "rdmlid") {
        var nex = {}
        nex["publisher"] = "New Publisher"
        nex["serialNumber"] = "New Serial Number"
        window.rdmlData.rdml.ids.unshift(nex)
        window.editType = "rdmlid";
        window.editNumber = 0;
        updateClientData()
    }
    if (typ == "experimenter") {
        var nex = {}
        nex["id"] = "New Experimenter"
        nex["firstName"] = "New First Name"
        nex["lastName"] = "New Last Name"
        window.rdmlData.rdml.experimenters.unshift(nex)
        window.editType = "experimenter";
        window.editNumber = 0;
        updateClientData()
    }
    if (typ == "documentation") {
        var nex = {}
        nex["id"] = "New Documentation"
        window.rdmlData.rdml.documentations.unshift(nex)
        window.editType = "documentation";
        window.editNumber = 0;
        updateClientData()
    }
    if (typ == "dye") {
        var nex = {}
        nex["id"] = "New Dye"
        window.rdmlData.rdml.dyes.unshift(nex)
        window.editType = "dye";
        window.editNumber = 0;
        updateClientData()
    }
    if (typ == "sample") {
        var nex = {}
        nex["id"] = "New Sample"
        nex["types"] = [{"type" : "unkn"}]
        nex["quantitys"] = [{"value" : "", "unit" : ""}]
        window.rdmlData.rdml.samples.unshift(nex)
        window.editType = "sample";
        window.editNumber = 0;
        updateClientData()
    }
    if (typ == "target") {
        var nex = {}
        nex["id"] = "New Target"
        window.rdmlData.rdml.targets.unshift(nex)
        window.editType = "target";
        window.editNumber = 0;
        updateClientData()
    }
    if (typ == "therm_cyc_cons") {
        var nex = {}
        nex["id"] = "New Cycling Conditions"
        window.rdmlData.rdml.therm_cyc_cons.unshift(nex)
        window.editType = "therm_cyc_cons";
        window.editNumber = 0;
        updateClientData()
    }
    if (typ == "experiment") {
        var nex = {}
        nex["id"] = "New Experiment"
        nex["runs"] = []
        window.rdmlData.rdml.experiments.unshift(nex)
        window.editType = "experiment";
        window.editNumber = 0;
        updateClientData()
    }

}

window.editTargetMelting = editTargetMelting;
function editTargetMelting(){
    if (!(window.rdmlData.hasOwnProperty("rdml"))) {
        return
    }
    if (window.editMode == true) {
        return  // Another element is already edited
    }
    window.editMode = true;
    window.editType = "target_melting"
    updateClientData()
}

window.deleteTargetMelting = deleteTargetMelting;
function deleteTargetMelting(){
    if (!(window.rdmlData.hasOwnProperty("rdml"))) {
        return
    }
    if (window.editMode == false) {
        return  // This can not happen
    }
    window.editMode = false;
    window.editType = ""
    updateClientData()
}

window.saveMeltingChanges = saveMeltingChanges;
function saveMeltingChanges(){
    if (!(window.rdmlData.hasOwnProperty("rdml"))) {
        return
    }
    if (window.editMode == false) {
        return  // This can not happen
    }
    var ret = {}
    ret["type"] = "edit-target-melting"
    ret["mode"] = "edit"
    var el = {}
    var tarNum = getSaveHtmlData("ed_melt_count");
    el["targets"] = tarNum;
    var tarCount = parseInt(tarNum);
    var dataArr = [];
    for (var i = 0; i < tarCount; i++) {
        var collDat = {};
        collDat["tar"] = getSaveHtmlData("ed_melt_tar_" + i);
        var readTm = getSaveHtmlData("ed_melt_tm_" + i);
        if (readTm == 'NA in Ver. <1.3') {
            collDat["tm"] = "";
        } else {
            collDat["tm"] = readTm;
        }
        collDat["seq"] = getSaveHtmlData("ed_melt_seq_" + i);
        dataArr.push(collDat);
    }
    el["tarData"] = dataArr;
    ret["data"] = el
    updateServerData(uuid, JSON.stringify(ret))
}

// Set the edit mode for the selected element
window.editPresentElement = editPresentElement;
function editPresentElement(typ, pos){
    if (!(window.rdmlData.hasOwnProperty("rdml"))) {
        return
    }
    if (window.editMode == true) {
        return  // Another element is already edited
    }
    window.editMode = true;
    window.editIsNew = false;
    window.editType = typ;
    window.editNumber = pos;
    updateClientData()
}

// Move the selected element
window.moveSecElement = moveSecElement;
function moveSecElement(prim_key, prim_pos, sec_key, sec_pos, id_source, cur_pos, new_pos){
    if (!(window.rdmlData.hasOwnProperty("rdml"))) {
        return
    }
    if (window.editMode == false) {
        var ret = {}
        ret["mode"] = "moveSecIds"
        ret["primary-key"] = prim_key
        ret["primary-position"] = prim_pos
        ret["secondary-key"] = sec_key
        ret["secondary-position"] = sec_pos
        ret["id-source"] = id_source
        ret["old-position"] = cur_pos
        ret["new-position"] = new_pos
        updateServerData(uuid, JSON.stringify(ret))
    }
    // If edit mode, ignore the other delete buttons
}

// Delete the selected element
window.deleteSecElement = deleteSecElement;
function deleteSecElement(prim_key, prim_pos, sec_key, sec_pos, id_source, cur_pos){
    if (!(window.rdmlData.hasOwnProperty("rdml"))) {
        return
    }
    if (window.editMode == false) {
        var ret = {}
        ret["mode"] = "deleteSecIds"
        ret["primary-key"] = prim_key
        ret["primary-position"] = prim_pos
        ret["secondary-key"] = sec_key
        ret["secondary-position"] = sec_pos
        ret["id-source"] = id_source
        ret["old-position"] = cur_pos
        updateServerData(uuid, JSON.stringify(ret))
    }
    // If edit mode, ignore the other delete buttons
}

// Move the selected secondary element
window.moveEditElement = moveEditElement;
function moveEditElement(typ, id, pos){
    if (!(window.rdmlData.hasOwnProperty("rdml"))) {
        return
    }
    if (window.editMode == false) {
        updateServerData(uuid, '{"mode": "move", "type": "' + typ + '", "id": "' + id + '", "position": ' + pos + '}')
    }
    // If edit mode, ignore the other delete buttons
}


// Delete the selected element
window.deleteEditElement = deleteEditElement;
function deleteEditElement(typ, pos){
    if (!(window.rdmlData.hasOwnProperty("rdml"))) {
        return
    }
    if ((window.editIsNew == true) && (pos == 0)) {  // New element is only existing in the client
        if (typ == "rdmlid") {
            window.rdmlData.rdml.ids.shift()
            window.editMode = false;
            window.editIsNew = false;
            window.editType = "";
            window.editNumber = -1;
            updateClientData()
        }
        if (typ == "experimenter") {
            window.rdmlData.rdml.experimenters.shift()
            window.editMode = false;
            window.editIsNew = false;
            window.editType = "";
            window.editNumber = -1;
            updateClientData()
        }
        if (typ == "documentation") {
            window.rdmlData.rdml.documentations.shift()
            window.editMode = false;
            window.editIsNew = false;
            window.editType = "";
            window.editNumber = -1;
            updateClientData()
        }
        if (typ == "dye") {
            window.rdmlData.rdml.dyes.shift()
            window.editMode = false;
            window.editIsNew = false;
            window.editType = "";
            window.editNumber = -1;
            updateClientData()
        }
        if (typ == "sample") {
            window.rdmlData.rdml.samples.shift()
            window.editMode = false;
            window.editIsNew = false;
            window.editType = "";
            window.editNumber = -1;
            updateClientData()
        }
        if (typ == "target") {
            window.rdmlData.rdml.targets.shift()
            window.editMode = false;
            window.editIsNew = false;
            window.editType = "";
            window.editNumber = -1;
            updateClientData()
        }
        if (typ == "therm_cyc_cons") {
            window.rdmlData.rdml.therm_cyc_cons.shift()
            window.editMode = false;
            window.editIsNew = false;
            window.editType = "";
            window.editNumber = -1;
            updateClientData()
        }
        if (typ == "experiment") {
            window.rdmlData.rdml.experiments.shift()
            window.editMode = false;
            window.editIsNew = false;
            window.editType = "";
            window.editNumber = -1;
            updateClientData()
        }
    } else  if ((window.editIsNew == false) && (window.editMode == true) && (window.editNumber == pos)) {
            updateServerData(uuid, '{"mode": "delete", "type": "' + typ + '", "position": ' + pos + '}')
    } else  if (window.editMode == false) {
            updateServerData(uuid, '{"mode": "delete", "type": "' + typ + '", "position": ' + pos + '}')
    }
    // If edit mode, delete only the edited element, ignore the other delete buttons
}

// Save edit element changes, create new ones
window.saveEditElement = saveEditElement;
function saveEditElement(typ, pos, oldId){
    if (!(window.rdmlData.hasOwnProperty("rdml"))) {
        return
    }
    if (window.editMode == false) {
        return  // This can not happen
    }
    var ret = {}
    if (window.editIsNew == true) {
        ret["mode"] = "create"
    } else {
        ret["mode"] = "edit"
    }
    var el = {}
    ret["current-position"] = pos
    ret["new-position"] = getSaveHtmlData("inPos") - 1
    ret["old-id"] = oldId
    ret["version"] = window.rdmlData.rdml.version
    if (typ == "rdmlid") {
        ret["type"] = "rdmlid"
        el["publisher"] = getSaveHtmlData("inRdmlidPublisher")
        el["serialNumber"] = getSaveHtmlData("inRdmlidSerialNumber")
        el["MD5Hash"] = getSaveHtmlData("inRdmlidMD5Hash")
        ret["data"] = el
    }
    if (typ == "experimenter") {
        ret["type"] = "experimenter"
        el["id"] = getSaveHtmlData("inExpId")
        el["idUnique"] = getSaveHtmlData("inExpIdUnique")
        el["firstName"] = getSaveHtmlData("inExpFirstName")
        el["lastName"] = getSaveHtmlData("inExpLastName")
        el["email"] = getSaveHtmlData("inExpEmail")
        el["labName"] = getSaveHtmlData("inExpLabName")
        el["labAddress"] = getSaveHtmlData("inExpLabAddress")
        ret["data"] = el
    }
    if (typ == "documentation") {
        ret["type"] = "documentation"
        el["id"] = getSaveHtmlData("inDocId")
        el["idUnique"] = getSaveHtmlData("inDocIdUnique")
        el["text"] = getSaveHtmlData("inDocText")
        ret["data"] = el
    }
    if (typ == "dye") {
        ret["type"] = "dye"
        el["id"] = getSaveHtmlData("inDyeId")
        el["idUnique"] = getSaveHtmlData("inDyeIdUnique")
        el["description"] = getSaveHtmlData("inDyeDescription")
        var ver_sense_dye = document.getElementById("inDyeDyeChemistry")
        if (ver_sense_dye) {
            el["dyeChemistry"] = ver_sense_dye.value
        }
        var ver_dNTPs = document.getElementById("inDyeDNTPs")
        if (ver_dNTPs) {
            el["dNTPs"] = ver_dNTPs.value
        }
        var ver_dyeConc = document.getElementById("inDyeConc")
        if (ver_dyeConc) {
            el["dyeConc"] = ver_dyeConc.value
        }
        ret["data"] = el
    }
    if (typ == "sample") {
        ret["type"] = "sample"
        el["id"] = getSaveHtmlData("inSampId")
        el["idUnique"] = getSaveHtmlData("inSampIdUnique")
        el["type"] = getSaveHtmlData("inSampType")
        if (["1.3", "1.4"].includes(window.rdmlData.rdml.version)) {
            el["typeTargetId"] = getSaveHtmlData("inSampTypeTarget")
            el["quantTargetId"] = getSaveHtmlData("inSampQuantTarget")
        }
        el["calibratorSample"] = readTriState("inExpCalibratorSample")
        el["doubleStranded"] = readTriState("inDoubleStranded")
        el["interRunCalibrator"] = readTriState("inExpInterRunCalibrator")
        var quant = {}
        quant["value"] = getSaveHtmlData("inExpQuantity_Value")
        quant["unit"] = getSaveHtmlData("inExpQuantity_Unit")
        el["quantity"] = quant
        el["cdnaSynthesisMethod_enzyme"] = getSaveHtmlData("inExpCdnaSynthesisMethod_enzyme")
        el["cdnaSynthesisMethod_primingMethod"] = getSaveHtmlData("inExpCdnaSynthesisMethod_primingMethod")
        el["cdnaSynthesisMethod_dnaseTreatment"] = readTriState("inExpCdnaSynthesisMethod_dnaseTreatment")
        el["cdnaSynthesisMethod_thermalCyclingConditions"] = getSaveHtmlData("inExpCdnaSynthesisMethod_thermalCyclingConditions")
        if (window.rdmlData.rdml.version == "1.1") {
            quant = {}
            quant["value"] = getSaveHtmlData("inExpTemplateRNAQuantity_Value")
            quant["unit"] = getSaveHtmlData("inExpTemplateRNAQuantity_Unit")
            el["templateRNAQuantity"] = quant
            quant = {}
            quant["method"] = getSaveHtmlData("inExpTemplateRNAQuality_Method")
            quant["result"] = getSaveHtmlData("inExpTemplateRNAQuality_Result")
            el["templateRNAQuality"] = quant
            quant = {}
            quant["value"] = getSaveHtmlData("inExpTemplateDNAQuantity_Value")
            quant["unit"] = getSaveHtmlData("inExpTemplateDNAQuantity_Unit")
            el["templateDNAQuantity"] = quant
            quant = {}
            quant["method"] = getSaveHtmlData("inExpTemplateDNAQuality_Method")
            quant["result"] = getSaveHtmlData("inExpTemplateDNAQuality_Result")
            el["templateDNAQuality"] = quant
        }
        if (window.rdmlData.rdml.version != "1.1") {
            quant = {}
            quant["conc"] = getSaveHtmlData("inExpTemplateQuantity_conc")
            quant["nucleotide"] = getSaveHtmlData("inExpTemplateQuantity_nucleotide")
            el["templateQuantity"] = quant
        }
        el["description"] = getSaveHtmlData("inExpDescription")
        ret["data"] = el
    }
    if (typ == "target") {
        ret["type"] = "target"
        el["id"] = getSaveHtmlData("inTarId")
        el["idUnique"] = getSaveHtmlData("inTarIdUnique")
        el["type"] = getSaveHtmlData("inTarType")
        el["amplificationEfficiencyMethod"] = getSaveHtmlData("inTarAmplificationEfficiencyMethod")
        el["amplificationEfficiency"] = getSaveHtmlData("inTarAmplificationEfficiency")
        el["detectionLimit"] = getSaveHtmlData("inTarDetectionLimit")
        el["dyeId"] = getSaveHtmlData("inTarDyeId")
        el["sequences_forwardPrimer_fivePrimeTag"] = getSaveHtmlData("inTarSequences_forwardPrimer_fivePrimeTag")
        el["sequences_forwardPrimer_sequence"] = getSaveHtmlData("inTarSequences_forwardPrimer_sequence")
        el["sequences_forwardPrimer_oligoConc"] = getSaveHtmlData("inTarSequences_forwardPrimer_oligoConc")
        el["sequences_forwardPrimer_threePrimeTag"] = getSaveHtmlData("inTarSequences_forwardPrimer_threePrimeTag")
        el["sequences_reversePrimer_fivePrimeTag"] = getSaveHtmlData("inTarSequences_reversePrimer_fivePrimeTag")
        el["sequences_reversePrimer_sequence"] = getSaveHtmlData("inTarSequences_reversePrimer_sequence")
        el["sequences_reversePrimer_oligoConc"] = getSaveHtmlData("inTarSequences_reversePrimer_oligoConc")
        el["sequences_reversePrimer_threePrimeTag"] = getSaveHtmlData("inTarSequences_reversePrimer_threePrimeTag")
        el["sequences_probe1_fivePrimeTag"] = getSaveHtmlData("inTarSequences_probe1_fivePrimeTag")
        el["sequences_probe1_sequence"] = getSaveHtmlData("inTarSequences_probe1_sequence")
        el["sequences_probe1_oligoConc"] = getSaveHtmlData("inTarSequences_probe1_oligoConc")
        el["sequences_probe1_threePrimeTag"] = getSaveHtmlData("inTarSequences_probe1_threePrimeTag")
        el["sequences_probe2_fivePrimeTag"] = getSaveHtmlData("inTarSequences_probe2_fivePrimeTag")
        el["sequences_probe2_sequence"] = getSaveHtmlData("inTarSequences_probe2_sequence")
        el["sequences_probe2_oligoConc"] = getSaveHtmlData("inTarSequences_probe2_oligoConc")
        el["sequences_probe2_threePrimeTag"] = getSaveHtmlData("inTarSequences_probe2_threePrimeTag")
        el["sequences_amplicon_fivePrimeTag"] = getSaveHtmlData("inTarSequences_amplicon_fivePrimeTag")
        el["sequences_amplicon_sequence"] = getSaveHtmlData("inTarSequences_amplicon_sequence")
        el["sequences_amplicon_threePrimeTag"] = getSaveHtmlData("inTarSequences_amplicon_threePrimeTag")
        el["commercialAssay_company"] = getSaveHtmlData("inTarCommercialAssay_company")
        el["commercialAssay_orderNumber"] = getSaveHtmlData("inTarCommercialAssay_orderNumber")
        el["description"] = getSaveHtmlData("inTarDescription")
        var ver_sense = document.getElementById("inTarAmplificationEfficiencySE")
        if (ver_sense) {
            el["amplificationEfficiencySE"] = ver_sense.value
        }
        var ver_sense2 = document.getElementById("inTarMeltingTemperature")
        if (ver_sense2) {
            el["meltingTemperature"] = ver_sense2.value
        }
        ret["data"] = el
    }
    if (typ == "therm_cyc_cons") {
        ret["type"] = "therm_cyc_cons"
        el["id"] = getSaveHtmlData("inCycId")
        el["idUnique"] = getSaveHtmlData("inCycIdUnique")
        el["lidTemperature"] = getSaveHtmlData("inCycLidTemperature")
        el["description"] = getSaveHtmlData("inCycDescription")
        ret["data"] = el
    }
    if (typ == "experiment") {
        ret["type"] = "experiment"
        el["id"] = getSaveHtmlData("inExId")
        el["description"] = getSaveHtmlData("inExDescription")
        ret["data"] = el
    }
    updateServerData(uuid, JSON.stringify(ret))
}

// Save edit sample type changes, create new ones
window.saveSamType = saveSamType;
function saveSamType(prim_pos, samType_pos, edit){
    if (!(window.rdmlData.hasOwnProperty("rdml"))) {
        return
    }
    if (window.editMode == true) {
        return
    }
    var ret = {}
    if (edit == false) {
        ret["mode"] = "create-sampleType"
    } else {
        ret["mode"] = "edit-sampleType"
    }
    ret["primary-position"] = prim_pos
    ret["sampleType-position"] = samType_pos
    ret["new-position"] = getSaveHtmlData("inPos") - 1
    var el = {}
    el["sampType"] = getSaveHtmlData("inSampTypeSel")
    el["sampTypeTarget"] = getSaveHtmlData("inSampTypeTargetSel")
    ret["data"] = el
    updateServerData(uuid, JSON.stringify(ret))
}

window.saveSamQuant = saveSamQuant;
function saveSamQuant(prim_pos, samQuant_pos, edit){
    if (!(window.rdmlData.hasOwnProperty("rdml"))) {
        return
    }
    if (window.editMode == true) {
        return
    }
    var ret = {}
    if (edit == false) {
        ret["mode"] = "create-sampleQuantity"
    } else {
        ret["mode"] = "edit-sampleQuantity"
    }
    ret["primary-position"] = prim_pos
    ret["sampleQuant-position"] = samQuant_pos
    ret["new-position"] = getSaveHtmlData("inPos") - 1
    var el = {}
    el["sampValue"] = getSaveHtmlData("inExpQuantity_Value")
    el["sampUnit"] = getSaveHtmlData("inExpQuantity_Unit")
    el["sampQuantTarget"] = getSaveHtmlData("inSampQuantTargetSel")
    ret["data"] = el
    updateServerData(uuid, JSON.stringify(ret))
}

// Save edit xRef changes, create new ones
window.saveXref = saveXref;
function saveXref(prim_key, prim_pos, xref_pos, edit){
    if (!(window.rdmlData.hasOwnProperty("rdml"))) {
        return
    }
    if (window.editMode == true) {
        return
    }
    var ret = {}
    if (edit == false) {
        ret["mode"] = "create-xref"
    } else {
        ret["mode"] = "edit-xref"
    }
    ret["primary-key"] = prim_key
    ret["primary-position"] = prim_pos
    ret["xref-position"] = xref_pos
    ret["new-position"] = getSaveHtmlData("inPos") - 1
    var el = {}
    el["name"] = getSaveHtmlData("inXRefName")
    el["id"] = getSaveHtmlData("inXRefId")
    ret["data"] = el
    updateServerData(uuid, JSON.stringify(ret))
}

// Save edit annotation changes, create new ones
window.saveAnnotation = saveAnnotation;
function saveAnnotation(prim_key, prim_pos, anno_pos, edit){
    if (!(window.rdmlData.hasOwnProperty("rdml"))) {
        return
    }
    if (window.editMode == true) {
        return
    }
    var ret = {}
    if (edit == false) {
        ret["mode"] = "create-annotation"
    } else {
        ret["mode"] = "edit-annotation"
    }
    ret["primary-key"] = prim_key
    ret["primary-position"] = prim_pos
    ret["annotation-position"] = anno_pos
    ret["new-position"] = getSaveHtmlData("inAnnoPos") - 1
    var el = {}
    el["property"] = getSaveHtmlData("inAnnoProperty")
    el["value"] = getSaveHtmlData("inAnnoValue")
    ret["data"] = el
    updateServerData(uuid, JSON.stringify(ret))
}

// Show documentation for selected ids
window.showDocSecElement = showDocSecElement;
function showDocSecElement(prim_key, prim_pos, sec_key, sec_pos, id_source, div_target, par) {
    if (!(window.rdmlData.hasOwnProperty("rdml"))) {
        return
    }
    if (window.editMode == true) {
        window.docIdOpen = ""
        return
    }
    if (par != null) {
        var but_text = par.textContent
        if (but_text == "Show All Document Information") {
            par.textContent = "Hide All Document Information"
            window.docIdOpen = [prim_key, prim_pos, sec_key, sec_pos, id_source, div_target, par]
        } else {
            par.textContent = "Show All Document Information"
            document.getElementById(div_target).innerHTML = ""
            window.docIdOpen = ""
            return
        }
    }
    var exp = []
    var allDic = {}
    if (id_source == "documentation") {
        var src = window.rdmlData.rdml.documentations
        for (var i = 0; i < src.length; i++) {
            allDic[src[i].id] = src[i].text
        }
    }
    if (prim_key == "sample") {
        exp = window.rdmlData.rdml.samples[prim_pos].documentations
    }
    if (prim_key == "target") {
        exp = window.rdmlData.rdml.targets[prim_pos].documentations
    }
    if (prim_key == "therm_cyc_cons") {
        exp = window.rdmlData.rdml.therm_cyc_cons[prim_pos].documentations
    }
    if (prim_key == "experiment") {
        if (sec_key == "run") {
            exp = window.rdmlData.rdml.experiments[prim_pos].runs[sec_pos].documentations
        } else {
            exp = window.rdmlData.rdml.experiments[prim_pos].documentations
        }
    }
    var ret = '<p><br />'
    for (var i = 0; i < exp.length; i++) {
            ret += '<h3>' + exp[i] + '</h3>\n'
            if (i == 0) {
                ret += '<button type="button" class="btn btn-success rdml-btn-edit btn-sm disabled">Move Up</button>&nbsp;&nbsp;'
            } else {
                ret += '<button type="button" class="btn btn-success rdml-btn-edit btn-sm" '
                ret += 'onclick="moveSecElement(\'' + prim_key + '\', ' + prim_pos + ', \'' + sec_key + '\', ' + sec_pos + ', \''
                ret +=  id_source + '\', ' +  i + ', ' + (i - 1) + ');">Move Up</button>&nbsp;&nbsp;'
            }
            if (i == exp.length - 1) {
                ret += '<button type="button" class="btn btn-success rdml-btn-edit btn-sm disabled">Move Down</button>'
            } else {
                ret += '<button type="button" class="btn btn-success rdml-btn-edit btn-sm" '
                ret += 'onclick="moveSecElement(\'' + prim_key + '\', ' + prim_pos + ', \'' + sec_key + '\', ' + sec_pos + ', \''
                ret +=  id_source + '\', ' + i + ', ' + (i + 2) + ');">Move Down</button>'
            }
            ret += '<p>' + allDic[exp[i]] + '</p>'
    }
    ret += '</p>'
    var ele = document.getElementById(div_target)
    ele.innerHTML = ret
}

// Edit or create an sample type
window.editSamType = editSamType;
function editSamType(prim_pos, samType_pos) {
    if (!(window.rdmlData.hasOwnProperty("rdml"))) {
        return
    }
    if (window.editMode == true) {
        return
    }
    var exp = window.rdmlData.rdml.samples
    var eType = ""
    var eTarget = ""
    var edit = true
    if (samType_pos == -1) {
        samType_pos = 0
        edit = false
    }
    if ((edit == true) && (exp != null) && (prim_pos < exp.length) && (samType_pos < exp[prim_pos].types.length)) {
        if ((exp[prim_pos].types[samType_pos]) && (exp[prim_pos].types[samType_pos].hasOwnProperty("type"))){
            eType = exp[prim_pos].types[samType_pos].type
        }
        if ((exp[prim_pos].types[samType_pos]) && (exp[prim_pos].types[samType_pos].hasOwnProperty("targetId"))){
            eTarget = exp[prim_pos].types[samType_pos].targetId
        }
    }
    var ret = '<div class="card">\n<div class="card-body">\n'
    ret += '<h5 class="card-title">New Sample Type:</h5>\n'
    ret += '<p><table style="width:100%;">'
    ret += '  <tr>\n    <td style="width:25%;background-color:#cc7a00;">Type:</td>\n'
    ret += '    <td style="width:75%"><select class="form-control" id="inSampTypeSel">\n'
    ret += '        <option value="unkn"'
    if ((eType == "unkn") || (eType == "")){
        ret += ' selected'
    }
    ret += '>unkn - unknown sample</option>\n'
    ret += '        <option value="ntc"'
    if (eType == "ntc") {
        ret += ' selected'
    }
    ret += '>ntc  - non template control</option>\n'
    ret += '        <option value="nac"'
    if (eType == "nac") {
        ret += ' selected'
    }
    ret += '>nac  - no amplification control</option>\n'
    ret += '        <option value="std"'
    if (eType == "std") {
        ret += ' selected'
    }
    ret += '>std  - standard sample</option>\n'
    ret += '        <option value="ntp"'
    if (eType == "ntp") {
        ret += ' selected'
    }
    ret += '>ntp  - no target present</option>\n'
    ret += '        <option value="nrt"'
    if (eType == "nrt") {
        ret += ' selected'
    }
    ret += '>nrt  - minusRT</option>\n'
    ret += '        <option value="pos"'
    if (eType == "pos") {
        ret += ' selected'
    }
    ret += '>pos  - positive control</option>\n'
    ret += '        <option value="opt"'
    if (eType == "opt") {
        ret += ' selected'
    }
    ret += '>opt  - optical calibrator sample</option>\n'
    ret += '      </select></td>\n'
    ret += '  </tr>'

    ret += '  <tr>\n    <td style="width:25%;">Target for Type:</td>\n'
    ret += '    <td style="width:75%">'
    ret += '<select class="form-control" id="inSampTypeTargetSel">\n'
    var allTargets = window.rdmlData.rdml.targets;
    ret += '        <option value=""'
    if (eTarget == "") {
        ret += ' selected'
    }
    ret += '>not set</option>\n'
    for (var cc = 0; cc < allTargets.length; cc++) {
        ret += '        <option value="' + allTargets[cc].id + '"'
        if (eTarget == allTargets[cc].id) {
            ret += ' selected'
        }
        ret += '>' + allTargets[cc].id + '</option>\n'
    }
    ret += '</select>\n</td>\n'
    ret += '  </tr>'
    ret += '  <tr>\n    <td style="width:25%;">Place at Position:</td>\n'
    ret += '    <td style="width:75%"><input type="text" class="form-control" '
    ret += 'id="inPos" value="' + (samType_pos + 1) + '"></td>\n'
    ret += '  </tr>'
    ret += '</table></p>\n'
    ret += '<button type="button" class="btn btn-success btn-sm" '
    ret += 'onclick="saveSamType(' + prim_pos + ', ' + samType_pos + ', ' + edit + ');">Save Changes</button>'
    ret += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button type="button" class="btn btn-success btn-sm" '
    ret += 'onclick="disChangesSecElement(\'pType-sample-' + prim_pos + '\');">Discard Changes</button>'
    ret += '</div>\n</div><br />\n'
    var ele = document.getElementById('pType-sample-' + prim_pos)
    ele.innerHTML = ret
}

// Edit or create an sample quantity
window.editQunatType = editQunatType;
function editQunatType(prim_pos, samQuant_pos) {
    if (!(window.rdmlData.hasOwnProperty("rdml"))) {
        return
    }
    if (window.editMode == true) {
        return
    }
    var exp = window.rdmlData.rdml.samples
    var eValue = ""
    var eUnit = ""
    var eTarget = ""
    var edit = true
    if (samQuant_pos == -1) {
        samQuant_pos = 0
        edit = false
    }
    if ((edit == true) && (exp != null) && (prim_pos < exp.length) && (samQuant_pos < exp[prim_pos].quantitys.length)) {
        if ((exp[prim_pos].quantitys[samQuant_pos]) && (exp[prim_pos].quantitys[samQuant_pos].hasOwnProperty("value"))){
            eValue = exp[prim_pos].quantitys[samQuant_pos].value
        }
        if ((exp[prim_pos].quantitys[samQuant_pos]) && (exp[prim_pos].quantitys[samQuant_pos].hasOwnProperty("targetId"))){
            eTarget = exp[prim_pos].quantitys[samQuant_pos].targetId
        }
    }
    var ret = '<div class="card">\n<div class="card-body">\n'
    ret += '<h5 class="card-title">New Sample Quantity:</h5>\n'
    ret += '<p><table style="width:100%;">'
    ret += '  <tr>\n    <td style="width:25%;background-color:#cc7a00;">Value:</td>\n'
    ret += '    <td style="width:75%">'
    ret += '<input type="text" class="form-control" id="inExpQuantity_Value" value="'
    ret += eValue + '"></td>\n'
    ret += '  </tr>'

    ret += '  <tr>\n    <td style="width:25%;background-color:#cc7a00;">Unit:</td>\n'
    ret += '    <td style="width:75%">\n'
    ret += htmlUnitSelector("inExpQuantity_Unit", exp[prim_pos].quantitys[samQuant_pos])
    ret += '</td>\n'
    ret += '  </tr>'
    ret += '  <tr>\n    <td style="width:25%;">Target for Quantity:</td>\n'
    ret += '    <td style="width:75%">'
    ret += '<select class="form-control" id="inSampQuantTargetSel">\n'
    var allTargets = window.rdmlData.rdml.targets;
    ret += '        <option value=""'
    if (eTarget == "") {
        ret += ' selected'
    }
    ret += '>not set</option>\n'
    for (var cc = 0; cc < allTargets.length; cc++) {
        ret += '        <option value="' + allTargets[cc].id + '"'
        if (eTarget == allTargets[cc].id) {
            ret += ' selected'
        }
        ret += '>' + allTargets[cc].id + '</option>\n'
    }
    ret += '</select>\n</td>\n'
    ret += '  </tr>'
    ret += '  <tr>\n    <td style="width:25%;">Place at Position:</td>\n'
    ret += '    <td style="width:75%"><input type="text" class="form-control" '
    ret += 'id="inPos" value="' + (samQuant_pos + 1) + '"></td>\n'
    ret += '  </tr>'
    ret += '</table></p>\n'
    ret += '<button type="button" class="btn btn-success btn-sm" '
    ret += 'onclick="saveSamQuant(' + prim_pos + ', ' + samQuant_pos + ', ' + edit + ');">Save Changes</button>'
    ret += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button type="button" class="btn btn-success btn-sm" '
    ret += 'onclick="disChangesSecElement(\'pType-sample-' + prim_pos + '\');">Discard Changes</button>'
    ret += '</div>\n</div><br />\n'
    var ele = document.getElementById('pType-sample-' + prim_pos)
    ele.innerHTML = ret
}


// Edit or create an xRef
window.editXref = editXref;
function editXref(prim_key, prim_pos, xref_pos) {
    if (!(window.rdmlData.hasOwnProperty("rdml"))) {
        return
    }
    if (window.editMode == true) {
        return
    }
    var exp = null
    if (prim_key == "sample") {
        exp = window.rdmlData.rdml.samples
    }
    if (prim_key == "target") {
        exp = window.rdmlData.rdml.targets
    }
    var name = ""
    var id = ""
    var edit = true
    if (xref_pos == -1) {
        xref_pos = 0
        edit = false
    }
    if ((edit == true) && (exp != null) && (prim_pos < exp.length) && (xref_pos < exp[prim_pos].xRefs.length)) {
        if ((exp[prim_pos].xRefs[xref_pos]) && (exp[prim_pos].xRefs[xref_pos].hasOwnProperty("name"))){
            name = exp[prim_pos].xRefs[xref_pos].name
        }
        if ((exp[prim_pos].xRefs[xref_pos]) && (exp[prim_pos].xRefs[xref_pos].hasOwnProperty("id"))){
            id = exp[prim_pos].xRefs[xref_pos].id
        }
    }
    var ret = '<div class="card">\n<div class="card-body">\n'
    ret += '<h5 class="card-title">New Reference (xRef):</h5>\n'
    ret += '<p><table style="width:100%;">'
    ret += '  <tr>\n    <td style="width:15%;">Name:</td>\n'
    ret += '    <td style="width:85%">\n<input type="text" class="form-control" '
    ret += 'id="inXRefName" value="' + name + '"></td>\n'
    ret += '  </tr>'
    ret += '  <tr>\n    <td style="width:15%;">Id:</td>\n'
    ret += '    <td style="width:85%">\n<input type="text" class="form-control" '
    ret += 'id="inXRefId" value="' + id + '"></td>\n'
    ret += '  </tr>'
    ret += '  <tr>\n    <td style="width:15%;">Place at Position:</td>\n'
    ret += '    <td style="width:85%"><input type="text" class="form-control" '
    ret += 'id="inPos" value="' + (xref_pos + 1) + '"></td>\n'
    ret += '  </tr>'
    ret += '</table></p>\n'
    ret += '<button type="button" class="btn btn-success btn-sm" '
    ret += 'onclick="saveXref(\'' + prim_key + '\', ' + prim_pos + ', ' + xref_pos + ', ' + edit + ');">Save Changes</button>'
    ret += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button type="button" class="btn btn-success btn-sm" '
    ret += 'onclick="disChangesSecElement(\'pXref-' + prim_key + '-' + prim_pos + '\');">Discard Changes</button>'
    ret += '</div>\n</div><br />\n'
    var ele = document.getElementById('pXref-' + prim_key + '-' + prim_pos)
    ele.innerHTML = ret
}

// Edit or create an Annotation
window.editAnnotation = editAnnotation;
function editAnnotation(prim_key, prim_pos, anno_pos) {
    if (!(window.rdmlData.hasOwnProperty("rdml"))) {
        return
    }
    if (window.editMode == true) {
        return
    }
    var exp = null
    exp = window.rdmlData.rdml.samples
    var property = ""
    var value = ""
    var edit = true
    if (anno_pos == -1) {
        anno_pos = 0
        edit = false
    }
    if ((edit == true) && (exp != null) && (prim_pos < exp.length) && (anno_pos < exp[prim_pos].annotations.length)) {
        if ((exp[prim_pos].annotations[anno_pos]) && (exp[prim_pos].annotations[anno_pos].hasOwnProperty("property"))){
            property = exp[prim_pos].annotations[anno_pos].property
        }
        if ((exp[prim_pos].annotations[anno_pos]) && (exp[prim_pos].annotations[anno_pos].hasOwnProperty("value"))){
            value = exp[prim_pos].annotations[anno_pos].value
        }
    }
    var ret = '<div class="card">\n<div class="card-body">\n'
    ret += '<h5 class="card-title">New Annotation:</h5>\n'
    ret += '<p><table style="width:100%;">'
    ret += '  <tr>\n    <td style="width:15%;">Property:</td>\n'
    ret += '    <td style="width:85%">\n<input type="text" class="form-control" '
    ret += 'id="inAnnoProperty" value="' + property + '"></td>\n'
    ret += '  </tr>'
    ret += '  <tr>\n    <td style="width:15%;">Value:</td>\n'
    ret += '    <td style="width:85%">\n<input type="text" class="form-control" '
    ret += 'id="inAnnoValue" value="' + value + '"></td>\n'
    ret += '  </tr>'
    ret += '  <tr>\n    <td style="width:15%;">Place at Position:</td>\n'
    ret += '    <td style="width:85%"><input type="text" class="form-control" '
    ret += 'id="inAnnoPos" value="' + (anno_pos + 1) + '"></td>\n'
    ret += '  </tr>'
    ret += '</table></p>\n'
    ret += '<button type="button" class="btn btn-success btn-sm" '
    ret += 'onclick="saveAnnotation(\'' + prim_key + '\', ' + prim_pos + ', ' + anno_pos + ', ' + edit + ');">Save Changes</button>'
    ret += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button type="button" class="btn btn-success btn-sm" '
    ret += 'onclick="disChangesSecElement(\'pAnnotation-' + prim_key + '-' + prim_pos + '\');">Discard Changes</button>'
    ret += '</div>\n</div><br />\n'
    var ele = document.getElementById('pAnnotation-' + prim_key + '-' + prim_pos)
    ele.innerHTML = ret
}

// Create a selector for ids
window.selectSecElement = selectSecElement;
function selectSecElement(prim_key, prim_pos, sec_key, sec_pos, id_source, div_target) {
    if (!(window.rdmlData.hasOwnProperty("rdml"))) {
        return
    }
    if (window.editMode == true) {
        return
    }
    var exp = null
    var sel = {}
    if (id_source == "documentation") {
        exp = window.rdmlData.rdml.documentations
    }
    if (id_source == "experimenter") {
        exp = window.rdmlData.rdml.experimenters
    }
    window.docIdOpen = ""
    if (prim_key == "sample") {
        var elem = window.rdmlData.rdml.samples[prim_pos].documentations
        for (var i = 0; i < elem.length; i++) {
            sel[elem[i]] = true
        }
    }
    if (prim_key == "target") {
        var elem = window.rdmlData.rdml.targets[prim_pos].documentations
        for (var i = 0; i < elem.length; i++) {
            sel[elem[i]] = true
        }
    }
    if (prim_key == "therm_cyc_cons") {
        var elem = null
        if (id_source == "experimenter") {
            elem = window.rdmlData.rdml.therm_cyc_cons[prim_pos].experimenters
        } else {
            elem = window.rdmlData.rdml.therm_cyc_cons[prim_pos].documentations
        }
        for (var i = 0; i < elem.length; i++) {
            sel[elem[i]] = true
        }
    }
    if (prim_key == "experiment") {
        var elem = null
        if (sec_key == "run") {
            if (id_source == "experimenter") {
                elem = window.rdmlData.rdml.experiments[prim_pos].runs[sec_pos].experimenters
            } else {
                elem = window.rdmlData.rdml.experiments[prim_pos].runs[sec_pos].documentations
            }
        } else {
            elem = window.rdmlData.rdml.experiments[prim_pos].documentations
        }
        for (var i = 0; i < elem.length; i++) {
            sel[elem[i]] = true
        }
    }
    var ret = '<p><br />'
    for (var i = 0; i < exp.length; i++) {
        ret += '<input type="checkbox" name="select-elements-by-ids" value="' + exp[i].id
        ret += '" id="select-id-' + exp[i].id + '"'
        if (sel.hasOwnProperty(exp[i].id)) {
            ret += ' checked'
        }
        ret += '>&nbsp;&nbsp;<label for="select-id-' + exp[i].id
        ret += '">' + exp[i].id + '</label><br />'
    }
    ret += '</p>'
    ret += '<button type="button" class="btn btn-success" '
    ret += 'onclick="saveSecElement(\'' + prim_key + '\', ' + prim_pos + ', \'' + sec_key + '\', ' + sec_pos + ', \''
    ret +=  id_source + '\', \'select-elements-by-ids\');">Save Changes</button>'
    ret += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button type="button" class="btn btn-success" '
    ret += 'onclick="disChangesSecElement(\'' + div_target + '\');">Discard Changes</button>'
    if (id_source == "experimenter") {
        ret += '<br /><br />'
    }
    var ele = document.getElementById(div_target)
    ele.innerHTML = ret
}

// Send the selection to the server
window.saveSecElement = saveSecElement;
function saveSecElement(prim_key, prim_pos, sec_key, sec_pos, id_source, group_name) {
    if (!(window.rdmlData.hasOwnProperty("rdml"))) {
        return
    }
    if (window.editMode == true) {
        return
    }
    var all = document.getElementsByName(group_name)
    var el = {}
    for (var i = 0 ; i < all.length ; i++) {
        if (all[i].checked) {
            el[all[i].value] = "true"
        } else {
            el[all[i].value] = "false"
        }
    }
    var ret = {}
    ret["mode"] = "addSecIds"
    ret["primary-key"] = prim_key
    ret["primary-position"] = prim_pos
    ret["secondary-key"] = sec_key
    ret["secondary-position"] = sec_pos
    ret["id-source"] = id_source
    ret["data"] = el
    updateServerData(uuid, JSON.stringify(ret))
}


// Edit or create an cycling conditions step
window.newEditStep = newEditStep;
function newEditStep(prim_pos, step_pos, type) {
    if (!(window.rdmlData.hasOwnProperty("rdml"))) {
        return
    }
    if (window.editMode == true) {
        return
    }
    var edit = true
    var useType = ""
    if (type != "edit") {
        useType = type
        edit = false
    } else {
        var step = window.rdmlData.rdml.therm_cyc_cons[prim_pos].steps[(step_pos - 1)]
        if (step.hasOwnProperty("temperature")) {
            useType = "temperature"
        }
        if (step.hasOwnProperty("gradient")) {
            useType = "gradient"
        }
        if (step.hasOwnProperty("loop")) {
            useType = "loop"
        }
        if (step.hasOwnProperty("pause")) {
            useType = "pause"
        }
        if (step.hasOwnProperty("lidOpen")) {
            useType = "lidOpen"
        }
    }
    var ret = '<div class="card">\n<div class="card-body">\n'
    var temperature = ""
    var highTemperature = ""
    var lowTemperature = ""
    var duration = ""
    var temperatureChange = ""
    var durationChange = ""
    var measure = ""
    var ramp = ""
    var goto = ""
    var repeat = ""
    if (useType == "temperature") {
        if (step_pos < 999999) {
            temperature = step.temperature.temperature
            duration = step.temperature.duration
            temperatureChange = saveUndef(step.temperature.temperatureChange)
            durationChange = saveUndef(step.temperature.durationChange)
            measure = saveUndef(step.temperature.measure)
            ramp = saveUndef(step.temperature.ramp)
            ret += '<h5 class="card-title">Edit Step - Temperature:</h5>\n'
        } else {
            ret += '<h5 class="card-title">New Step - Temperature:</h5>\n'
        }
        ret += '<p><table style="width:100%;">'
        ret += '  <tr>\n    <td style="width:25%;background-color:#ffcc99;">Place at Step:</td>\n'
        ret += '    <td style="width:75%"><input type="text" class="form-control" '
        ret += 'id="inStepPos" value="' + step_pos + '"></td>\n'
        ret += '  </tr>'
        ret += '  <tr>\n    <td style="width:25%;background-color:#ffcc99;">Temperature:</td>\n'
        ret += '    <td style="width:75%">\n<input type="text" class="form-control" '
        ret += 'id="inStepTemperature" value="' + temperature + '"></td>\n'
        ret += '  </tr>'
        ret += '  <tr>\n    <td style="width:25%;background-color:#ffcc99;">Duration:</td>\n'
        ret += '    <td style="width:75%">\n<input type="text" class="form-control" '
        ret += 'id="inStepDuration" value="' + duration + '"></td>\n'
        ret += '  </tr>'
        ret += '  <tr>\n    <td style="width:25%;">Temperature Change:</td>\n'
        ret += '    <td style="width:75%">\n<input type="text" class="form-control" '
        ret += 'id="inStepTemperatureChange" value="' + temperatureChange + '"></td>\n'
        ret += '  </tr>'
        ret += '  <tr>\n    <td style="width:25%;">Duration Change:</td>\n'
        ret += '    <td style="width:75%">\n<input type="text" class="form-control" '
        ret += 'id="inStepDurationChange" value="' + durationChange + '"></td>\n'
        ret += '  </tr>'
        ret += '  <tr>\n    <td style="width:25%;">Measure:</td>\n'
        ret += '    <td style="width:75%"><select class="form-control" id="inStepMeasure">\n'
        ret += '        <option value=""'
        if (measure == "") {
            ret += ' selected'
        }
        ret += '>Do not measure</option>\n'
        ret += '        <option value="real time"'
        if (measure == "real time") {
            ret += ' selected'
        }
        ret += '>real time</option>\n'
        ret += '        <option value="meltcurve"'
        if (measure == "meltcurve") {
            ret += ' selected'
        }
        ret += '>meltcurve</option>\n'
        ret += '      </select></td>\n'
        ret += '  </tr>'
        ret += '  <tr>\n    <td style="width:25%;">Ramp:</td>\n'
        ret += '    <td style="width:75%">\n<input type="text" class="form-control" '
        ret += 'id="inStepRamp" value="' + ramp + '"></td>\n'
        ret += '  </tr>'
    }
    if (useType == "gradient") {
        if (step_pos < 999999) {
            highTemperature = step.gradient.highTemperature
            lowTemperature = step.gradient.lowTemperature
            duration = step.gradient.duration
            temperatureChange = saveUndef(step.gradient.temperatureChange)
            durationChange = saveUndef(step.gradient.durationChange)
            measure = saveUndef(step.gradient.measure)
            ramp = saveUndef(step.gradient.ramp)
            ret += '<h5 class="card-title">Edit Step - Gradient:</h5>\n'
        } else {
            ret += '<h5 class="card-title">New Step - Gradient:</h5>\n'
        }
        ret += '<p><table style="width:100%;">'
        ret += '  <tr>\n    <td style="width:25%;background-color:#ffcc99;">Place at Step:</td>\n'
        ret += '    <td style="width:75%"><input type="text" class="form-control" '
        ret += 'id="inStepPos" value="' + step_pos + '"></td>\n'
        ret += '  </tr>'
        ret += '  <tr>\n    <td style="width:25%;background-color:#ffcc99;">High Temperature:</td>\n'
        ret += '    <td style="width:75%">\n<input type="text" class="form-control" '
        ret += 'id="inStepHighTemperature" value="' + highTemperature + '"></td>\n'
        ret += '  </tr>'
        ret += '  <tr>\n    <td style="width:25%;background-color:#ffcc99;">Low Temperature:</td>\n'
        ret += '    <td style="width:75%">\n<input type="text" class="form-control" '
        ret += 'id="inStepLowTemperature" value="' + lowTemperature + '"></td>\n'
        ret += '  </tr>'
        ret += '  <tr>\n    <td style="width:25%;background-color:#ffcc99;">Duration:</td>\n'
        ret += '    <td style="width:75%">\n<input type="text" class="form-control" '
        ret += 'id="inStepDuration" value="' + duration + '"></td>\n'
        ret += '  </tr>'
        ret += '  <tr>\n    <td style="width:25%;">Temperature Change:</td>\n'
        ret += '    <td style="width:75%">\n<input type="text" class="form-control" '
        ret += 'id="inStepTemperatureChange" value="' + temperatureChange + '"></td>\n'
        ret += '  </tr>'
        ret += '  <tr>\n    <td style="width:25%;">Duration Change:</td>\n'
        ret += '    <td style="width:75%">\n<input type="text" class="form-control" '
        ret += 'id="inStepDurationChange" value="' + durationChange + '"></td>\n'
        ret += '  </tr>'
        ret += '  <tr>\n    <td style="width:25%;">Measure:</td>\n'
        ret += '    <td style="width:75%"><select class="form-control" id="inStepMeasure">\n'
        ret += '        <option value=""'
        if (measure == "") {
            ret += ' selected'
        }
        ret += '>Do not measure</option>\n'
        ret += '        <option value="real time"'
        if (measure == "real time") {
            ret += ' selected'
        }
        ret += '>real time</option>\n'
        ret += '        <option value="meltcurve"'
        if (measure == "meltcurve") {
            ret += ' selected'
        }
        ret += '>meltcurve</option>\n'
        ret += '      </select></td>\n'
        ret += '  </tr>'
        ret += '  <tr>\n    <td style="width:25%;">Ramp:</td>\n'
        ret += '    <td style="width:75%">\n<input type="text" class="form-control" '
        ret += 'id="inStepRamp" value="' + ramp + '"></td>\n'
        ret += '  </tr>'
    }
    if (useType == "loop") {
        if (step_pos < 999999) {
            goto = step.loop.goto
            repeat = step.loop.repeat
            ret += '<h5 class="card-title">Edit Step - Loop:</h5>\n'
        } else {
            ret += '<h5 class="card-title">New Step - Loop:</h5>\n'
        }
        ret += '<p><table style="width:100%;">'
        ret += '  <tr>\n    <td style="width:25%;background-color:#ffcc99;">Place at Step:</td>\n'
        ret += '    <td style="width:75%"><input type="text" class="form-control" '
        ret += 'id="inStepPos" value="' + step_pos + '"></td>\n'
        ret += '  </tr>'
        ret += '  <tr>\n    <td style="width:25%;background-color:#ffcc99;">Go back to step:</td>\n'
        ret += '    <td style="width:75%">\n<input type="text" class="form-control" '
        ret += 'id="inStepGoto" value="' + goto + '"></td>\n'
        ret += '  </tr>'
        ret += '  <tr>\n    <td style="width:25%;background-color:#ffcc99;">Repeat for:</td>\n'
        ret += '    <td style="width:75%">\n<input type="text" class="form-control" '
        ret += 'id="inStepRepeat" value="' + repeat + '"></td>\n'
        ret += '  </tr>'
    }
    if (useType == "pause") {
        if (step_pos < 999999) {
            temperature = step.pause.temperature
            ret += '<h5 class="card-title">Edit Step - Pause:</h5>\n'
        } else {
            ret += '<h5 class="card-title">New Step - Pause:</h5>\n'
        }
        ret += '<p><table style="width:100%;">'
        ret += '  <tr>\n    <td style="width:25%;background-color:#ffcc99;">Place at Step:</td>\n'
        ret += '    <td style="width:75%"><input type="text" class="form-control" '
        ret += 'id="inStepPos" value="' + step_pos + '"></td>\n'
        ret += '  </tr>'
        ret += '  <tr>\n    <td style="width:25%;background-color:#ffcc99;">Temperature:</td>\n'
        ret += '    <td style="width:75%">\n<input type="text" class="form-control" '
        ret += 'id="inStepTemperature" value="' + temperature + '"></td>\n'
        ret += '  </tr>'
    }
    if (useType == "lidOpen") {
        if (step_pos < 999999) {
            ret += '<h5 class="card-title">Edit Step - Lid Open:</h5>\n'
        } else {
            ret += '<h5 class="card-title">New Step - Lid Open:</h5>\n'
        }
        ret += '<p><table style="width:100%;">'
        ret += '  <tr>\n    <td style="width:25%;background-color:#ffcc99;">Place at Step:</td>\n'
        ret += '    <td style="width:75%"><input type="text" class="form-control" '
        ret += 'id="inStepPos" value="' + step_pos + '"></td>\n'
        ret += '  </tr>'
    }
    ret += '</table></p>\n'
    ret += '<button type="button" class="btn btn-success btn-sm" '
    ret += 'onclick="saveStep(' + prim_pos + ', ' + step_pos + ', \'' + useType + '\', ' + edit + ');">Save Changes</button>'
    ret += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button type="button" class="btn btn-success btn-sm" '
    ret += 'onclick="disChangesSecElement(\'pStep-therm_cyc_cons-' + prim_pos + '\');">Discard Changes</button>'
    ret += '</div>\n</div><br />\n'
    var ele = document.getElementById('pStep-therm_cyc_cons-' + prim_pos)
    ele.innerHTML = ret
    ele.scrollIntoView();
}

// Edit or create an experiment run
window.newEditRun = newEditRun;
function newEditRun(prim_pos, sec_pos, exp) {
    if (!(window.rdmlData.hasOwnProperty("rdml"))) {
        return
    }
    if (window.editMode == true) {
        return
    }
    var edit = false
    var run = null
    var ret = '<div class="card">\n<div class="card-body">\n'
    var id_val = ""
    if (sec_pos < 999999) {
        edit = true
        run = window.rdmlData.rdml.experiments[prim_pos].runs[sec_pos]
        id_val = run.id
        ret += '<h5 class="card-title">Edit Run:</h5>\n'
    } else {
        edit = false
        id_val = "New Run"
        ret += '<h5 class="card-title">New Run:</h5>\n'
    }
    ret += '<p><table style="width:100%;">'
    ret += '  <tr>\n    <td style="width:25%;">Experiment:</td>\n'
    ret += '    <td style="width:75%">\n'
    ret += '<select class="form-control" id="inRunParentExperiment">\n'
    var allExperiments = window.rdmlData.rdml.experiments;
    for (var cc = 0; cc < allExperiments.length; cc++) {
        ret += '        <option value="' + allExperiments[cc].id + '"'
        if (exp == allExperiments[cc].id) {
            ret += ' selected'
        }
        ret += '>' + allExperiments[cc].id + '</option>\n'
    }
    ret += '</select>\n</td>\n'
    ret += '  <tr>\n    <td style="width:25%;background-color:#ffcc99;">ID:</td>\n'
    ret += '    <td style="width:75%"><input type="text" class="form-control" '
    ret += 'id="inRunId" value="'+ id_val + '"></td>\n'
    ret += '  </tr>'
    ret += '  <tr>\n    <td style="width:25%;background-color:#ffcc99;">PCR Format - Predefined:</td>\n'
    ret += '    <td style="width:75%"><button type="button" onclick="selPlate_Rotor();">Rotor</button>&nbsp;&nbsp;'
    ret += ' <button type="button" onclick="selPlate_96_Well();">96 Well Plate</button>&nbsp;&nbsp;'
    ret += ' <button type="button" onclick="selPlate_384_Well();">384 Well Plate</button></td>\n'
    ret += '  </tr>'
    ret += '  <tr>\n    <td style="width:25%;background-color:#ffcc99;">PCR Format - Columns:</td>\n'
    ret += '    <td style="width:75%">\n<input type="text" class="form-control" '
    ret += 'id="inRunPcrFormat_columns" value="' + saveUndefKeyKey(run, "pcrFormat", "columns") + '"></td>\n'
    ret += '  </tr>'
    select_val = saveUndefKeyKey(run, "pcrFormat", "columnLabel")
    ret += '  <tr>\n    <td style="width:25%;background-color:#ffcc99;">PCR Format - Column Label:</td>\n'
    ret += '    <td style="width:75%"><select class="form-control" id="inRunPcrFormat_columnLabel">\n'
    ret += '        <option value="ABC"'
    if (select_val == "ABC") {
        ret += ' selected'
    }
    ret += '>ABC</option>\n'
    ret += '        <option value="123"'
    if (select_val == "123") {
        ret += ' selected'
    }
    ret += '>123</option>\n'
    ret += '        <option value="A1a1"'
    if (select_val == "A1a1") {
        ret += ' selected'
    }
    ret += '>A1a1</option>\n'
    ret += '      </select></td>\n'
    ret += '  </tr>'
    ret += '  <tr>\n    <td style="width:25%;background-color:#ffcc99;">PCR Format - Rows:</td>\n'
    ret += '    <td style="width:75%">\n<input type="text" class="form-control" '
    ret += 'id="inRunPcrFormat_rows" value="' + saveUndefKeyKey(run, "pcrFormat", "rows") + '"></td>\n'
    ret += '  </tr>'
    select_val = saveUndefKeyKey(run, "pcrFormat", "rowLabel")
    ret += '  <tr>\n    <td style="width:25%;background-color:#ffcc99;">PCR Format - Row Label:</td>\n'
    ret += '    <td style="width:75%"><select class="form-control" id="inRunPcrFormat_rowLabel">\n'
    ret += '        <option value="ABC"'
    if (select_val == "ABC") {
        ret += ' selected'
    }
    ret += '>ABC</option>\n'
    ret += '        <option value="123"'
    if (select_val == "123") {
        ret += ' selected'
    }
    ret += '>123</option>\n'
    ret += '        <option value="A1a1"'
    if (select_val == "A1a1") {
        ret += ' selected'
    }
    ret += '>A1a1</option>\n'
    ret += '      </select></td>\n'
    ret += '  </tr>'
    ret += '  <tr>\n    <td style="width:25%;">Import Amplification RDES:</td>\n'
    ret += '    <td style="width:75%">\n<input type="file" class="form-control-file" id="inRunUploadAmplification"></td>\n'
    ret += '  </tr>'
    ret += '  <tr>\n    <td style="width:25%;">Import Melting RDES:</td>\n'
    ret += '    <td style="width:75%">\n<input type="file" class="form-control-file" id="inRunUploadMelting"></td>\n'
    ret += '  </tr>'
    ret += '  <tr>\n    <td style="width:25%;">Reaction Volume:</td>\n'
    ret += '    <td style="width:75%">\n<input type="text" class="form-control" '
    ret += 'id="inRunDefaultVolume" value=""></td>\n'
    ret += '  </tr>'
    ret += '</table></p>\n'
    ret += '<button type="button" class="btn btn-success btn-sm" '
    ret += 'onclick="saveRun(' + prim_pos + ', ' + sec_pos + ', ' + edit + ');">Save Changes</button>'
    ret += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button type="button" class="btn btn-success btn-sm" '
    ret += 'onclick="disChangesSecElement(\'pRun-experiment-' + prim_pos + '\');">Discard Changes</button>'
    ret += '<br /><br /><br />\n'

    ret += '<h5 class="card-title">Advanced:</h5>\n'
    ret += '<p><table style="width:100%;">'
    ret += '  <tr>\n    <td style="width:25%;">Place at Position:</td>\n'
    ret += '    <td style="width:75%"><input type="text" class="form-control" '
    ret += 'id="inRunPos" value="' + (sec_pos + 1) + '"></td>\n'
    ret += '  </tr>'
    ret += '  <tr>\n    <td style="width:25%;">Thermal Cycling Conditions:</td>\n'
    ret += '    <td style="width:75%">\n'
    var cycProt = saveUndefKey(run, "thermalCyclingConditions")
    ret += '<select class="form-control" id="inRunThermalCyclingConditions">\n'
    ret += '        <option value=""'
    if (cycProt == "") {
        ret += ' selected'
    }
    ret += '>not set</option>\n'
    var allCycs = window.rdmlData.rdml.therm_cyc_cons;
    for (var cc = 0; cc < allCycs.length; cc++) {
        ret += '        <option value="' + allCycs[cc].id + '"'
        if (cycProt == allCycs[cc].id) {
            ret += ' selected'
        }
        ret += '>' + allCycs[cc].id + '</option>\n'
    }
    ret += '</select>\n</td>\n'
    ret += '  <tr>\n    <td style="width:25%;">Background Determination Method:</td>\n'
    ret += '    <td style="width:75%">\n<input type="text" class="form-control" '
    ret += 'id="inRunBackgroundDeterminationMethod" value="' + saveUndefKey(run, "backgroundDeterminationMethod") + '"></td>\n'
    ret += '  </tr>'
    ret += '  <tr>\n    <td style="width:25%;">Description:</td>\n'
    ret += '    <td style="width:75%"><input type="text" class="form-control" '
    ret += 'id="inRunDescription" value="'+ saveUndefKey(run, "description") + '"></td>\n'
    ret += '  </tr>'
    ret += '  <tr>\n    <td style="width:25%;">Run Date:</td>\n'
    ret += '    <td style="width:75%">\n<input type="text" class="form-control" '
    ret += 'id="inRunRunDate" value="' + saveUndefKey(run, "runDate") + '"></td>\n'
    ret += '  </tr>'
    var select_val = saveUndefKey(run, "cqDetectionMethod")
    ret += '  <tr>\n    <td style="width:25%;">Cq Detection Method:</td>\n'
    ret += '    <td style="width:75%"><select class="form-control" id="inRunCqDetectionMethod">\n'
    ret += '        <option value=""'
    if (select_val == "") {
        ret += ' selected'
    }
    ret += '>No value selected</option>\n'
    ret += '        <option value="automated threshold and baseline settings"'
    if (select_val == "automated threshold and baseline settings") {
        ret += ' selected'
    }
    ret += '>automated threshold and baseline settings</option>\n'
    ret += '        <option value="manual threshold and baseline settings"'
    if (select_val == "manual threshold and baseline settings") {
        ret += ' selected'
    }
    ret += '>manual threshold and baseline settings</option>\n'
    ret += '        <option value="second derivative maximum"'
    if (select_val == "second derivative maximum") {
        ret += ' selected'
    }
    ret += '>second derivative maximum</option>\n'
    ret += '        <option value="other"'
    if (select_val == "other") {
        ret += ' selected'
    }
    ret += '>other</option>\n'
    ret += '      </select></td>\n'
    ret += '  </tr>'
    ret += '  <tr>\n    <td style="width:25%;">Instrument:</td>\n'
    ret += '    <td style="width:75%">\n<input type="text" class="form-control" '
    ret += 'id="inRunInstrument" value="' + saveUndefKey(run, "instrument") + '"></td>\n'
    ret += '  </tr>'
    ret += '  <tr>\n    <td style="width:25%;">Software - Name:</td>\n'
    ret += '    <td style="width:75%">\n<input type="text" class="form-control" '
    ret += 'id="inRunDataCollectionSoftware_name" value="' + saveUndefKeyKey(run, "dataCollectionSoftware", "name") + '"></td>\n'
    ret += '  </tr>'
    ret += '  <tr>\n    <td style="width:25%;">Software - Version:</td>\n'
    ret += '    <td style="width:75%">\n<input type="text" class="form-control" '
    ret += 'id="inRunDataCollectionSoftware_version" value="' + saveUndefKeyKey(run, "dataCollectionSoftware", "version") + '"></td>\n'
    ret += '  </tr>'
    if (["1.3", "1.4"].includes(window.rdmlData.rdml.version)) {
        ret += '  <tr>\n    <td style="width:25%;">Digital PCR Data Format:</td>\n'
        ret += '    <td style="width:75%"><select class="form-control" id="inRunUploadDigFormat">\n'
        ret += '        <option value="RDML"  selected >RDML</option>\n'
        ret += '        <option value="Bio-Rad">Bio-Rad</option>\n'
        ret += '        <option value="Stilla">Stilla</option>\n'
        ret += '      </select></td>\n'
        ret += '  </tr>'
        ret += '  <tr>\n    <td style="width:25%;">Import Digital Data Overview:</td>\n'
        ret += '    <td style="width:75%">\n<input type="file" class="form-control-file" id="inRunUploadDigOverview"></td>\n'
        ret += '  </tr>'
        ret += '  <tr>\n    <td style="width:25%;">Import Digital Data Wells:</td>\n'
        ret += '    <td style="width:75%">\n<input type="file" class="form-control-file" id="inRunUploadDigWells" multiple></td>\n'
        ret += '  </tr>'
        ret += '  <tr>\n    <td style="width:25%;">Ignore Channels:</td>\n'
        ret += '    <td style="width:75%">\n<input type="text" class="form-control" id="inRunUploadDigExclude"></td>\n'
        ret += '  </tr>'
    }
    ret += '</table></p>\n'
    ret += '<button type="button" class="btn btn-success btn-sm" '
    ret += 'onclick="saveRun(' + prim_pos + ', ' + sec_pos + ', ' + edit + ');">Save Changes</button>'
    ret += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button type="button" class="btn btn-success btn-sm" '
    ret += 'onclick="disChangesSecElement(\'pRun-experiment-' + prim_pos + '\');">Discard Changes</button>'
    ret += '</div>\n</div><br />\n'
    var ele = document.getElementById('pRun-experiment-' + prim_pos)
    ele.innerHTML = ret
    ele.scrollIntoView();
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
    var volume = document.getElementById('inRunDefaultVolume');
    volume.value = "20.0"
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
    var volume = document.getElementById('inRunDefaultVolume');
    volume.value = "20.0"
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
    var volume = document.getElementById('inRunDefaultVolume');
    volume.value = "10.0"
    return;
}

// Set N as amplicon sequence
window.setNAmpliconSeq = setNAmpliconSeq;
function setNAmpliconSeq(){
    var rLen = document.getElementById('inTarSequences_fake_amplicon_len');
    var len = parseInt(rLen.value);
    var amplicon = "";
    for (var i = 0; i < len; i++) {
        amplicon += "N"
    }
    var ampSeq = document.getElementById('inTarSequences_amplicon_sequence');
    if (ampSeq != null) {
        ampSeq.value = amplicon;
    }
    return;
}

// Clean amplicon sequence
window.cleanAmpliconSeq = cleanAmpliconSeq;
function cleanAmpliconSeq(){
    var rawSeq = document.getElementById('inTarSequences_amplicon_sequence').value;
    var amplicon = rawSeq.replace(/[^ACGTNacgtn]/g, '');
    var ampSeq = document.getElementById('inTarSequences_amplicon_sequence');
    ampSeq.value = amplicon;
    return;
}

// Save edit step changes, create new ones
window.saveStep = saveStep;
function saveStep(prim_pos, step_pos, useType, edit){
    if (!(window.rdmlData.hasOwnProperty("rdml"))) {
        return
    }
    if (window.editMode == true) {
        return
    }
    var ret = {}
    if (edit == false) {
        ret["mode"] = "create-step"
    } else {
        ret["mode"] = "edit-step"
    }
    ret["primary-position"] = prim_pos
    ret["step-position"] = step_pos
    ret["new-position"] = getSaveHtmlData("inStepPos")
    ret["type"] = useType
    var el = {}
    if (useType == "temperature") {
        el["temperature"] = getSaveHtmlData("inStepTemperature")
        el["duration"] = getSaveHtmlData("inStepDuration")
        el["temperatureChange"] = getSaveHtmlData("inStepTemperatureChange")
        el["durationChange"] = getSaveHtmlData("inStepDurationChange")
        el["measure"] = getSaveHtmlData("inStepMeasure")
        el["ramp"] = getSaveHtmlData("inStepRamp")
    }
    if (useType == "gradient") {
        el["highTemperature"] = getSaveHtmlData("inStepHighTemperature")
        el["lowTemperature"] = getSaveHtmlData("inStepLowTemperature")
        el["duration"] = getSaveHtmlData("inStepDuration")
        el["temperatureChange"] = getSaveHtmlData("inStepTemperatureChange")
        el["durationChange"] = getSaveHtmlData("inStepDurationChange")
        el["measure"] = getSaveHtmlData("inStepMeasure")
        el["ramp"] = getSaveHtmlData("inStepRamp")
    }
    if (useType == "loop") {
        el["goto"] = getSaveHtmlData("inStepGoto")
        el["repeat"] = getSaveHtmlData("inStepRepeat")
    }
    if (useType == "pause") {
        el["temperature"] = getSaveHtmlData("inStepTemperature")
    }
    ret["data"] = el
    updateServerData(uuid, JSON.stringify(ret))
}


// Save edit run changes, create new ones
window.saveRun = saveRun;
function saveRun(prim_pos, run_pos, edit){
    if (!(window.rdmlData.hasOwnProperty("rdml"))) {
        return
    }
    if (window.editMode == true) {
        return
    }
    var ret = {}
    if (edit == false) {
        ret["mode"] = "create-run"
    } else {
        ret["mode"] = "edit-run"
    }
    ret["primary-position"] = prim_pos
    ret["run-position"] = run_pos
    ret["new-position"] = getSaveHtmlData("inRunPos") - 1
    var el = {}
    el["runParentExperiment"] = getSaveHtmlData("inRunParentExperiment")
    el["id"] = getSaveHtmlData("inRunId")
    el["description"] = getSaveHtmlData("inRunDescription")
    el["runDate"] = getSaveHtmlData("inRunRunDate")
    el["thermalCyclingConditions"] = getSaveHtmlData("inRunThermalCyclingConditions")
    el["cqDetectionMethod"] = getSaveHtmlData("inRunCqDetectionMethod")
    el["backgroundDeterminationMethod"] = getSaveHtmlData("inRunBackgroundDeterminationMethod")
    el["pcrFormat_columns"] = getSaveHtmlData("inRunPcrFormat_columns")
    el["pcrFormat_columnLabel"] = getSaveHtmlData("inRunPcrFormat_columnLabel")
    el["pcrFormat_rows"] = getSaveHtmlData("inRunPcrFormat_rows")
    el["pcrFormat_rowLabel"] = getSaveHtmlData("inRunPcrFormat_rowLabel")
    el["defaultVolume"] = getSaveHtmlData("inRunDefaultVolume")
    el["instrument"] = getSaveHtmlData("inRunInstrument")
    el["dataCollectionSoftware_name"] = getSaveHtmlData("inRunDataCollectionSoftware_name")
    el["dataCollectionSoftware_version"] = getSaveHtmlData("inRunDataCollectionSoftware_version")
    if (document.getElementById("inRunUploadAmplification").value) {
         ret["tableUploadAmplification"] = true
    }
    if (document.getElementById("inRunUploadMelting").value) {
         ret["tableUploadMelting"] = true
    }
    el["tableUploadDigFormat"] = getSaveHtmlData("inRunUploadDigFormat")
    if ((document.getElementById("inRunUploadDigOverview")) &&
        (document.getElementById("inRunUploadDigOverview").value)) {
         ret["tableUploadDigOverview"] = true
    }
    if ((document.getElementById("inRunUploadDigWells")) &&
        (document.getElementById("inRunUploadDigWells").value)) {
         ret["tableUploadDigWells"] = true
    }
    el["tableUploadDigExclude"] = getSaveHtmlData("inRunUploadDigExclude")
    ret["data"] = el
    updateServerData(uuid, JSON.stringify(ret))
}


// Save edit step changes, create new ones
window.deleteStep = deleteStep;
function deleteStep(prim_pos, step_pos){
    if (!(window.rdmlData.hasOwnProperty("rdml"))) {
        return
    }
    if (window.editMode == true) {
        return
    }
    var ret = {}
    ret["mode"] = "delete-step"
    ret["primary-position"] = prim_pos
    ret["step-position"] = step_pos
    updateServerData(uuid, JSON.stringify(ret))
}


// Migrate RDML version
window.migrateRDMLversion = migrateRDMLversion;
function migrateRDMLversion(new_ver) {
    if (!(window.rdmlData.hasOwnProperty("rdml"))) {
        return
    }
    if (window.editMode == true) {
        return
    }
    if (window.rdmlData.rdml.version == new_ver) {
        return
    }
    var ret = {}
    ret["mode"] = "migrate-version"
    ret["new-version"] = new_ver
    updateServerData(uuid, JSON.stringify(ret))
}

window.recreateLostIds = recreateLostIds;
function recreateLostIds() {
    if (!(window.rdmlData.hasOwnProperty("rdml"))) {
        return
    }
    var ret = {}
    ret["mode"] = "recreate-lost-ids"
    updateServerData(uuid, JSON.stringify(ret))
}

window.repairRDMLFile = repairRDMLFile;
function repairRDMLFile() {
    if (!(window.rdmlData.hasOwnProperty("rdml"))) {
        return
    }
    var ret = {}
    ret["mode"] = "repair-rdml-file"
    updateServerData(uuid, JSON.stringify(ret))
}

window.recalcMeltingTemps = recalcMeltingTemps;
function recalcMeltingTemps() {
    if (!(window.rdmlData.hasOwnProperty("rdml"))) {
        return
    }
    var ret = {}
    ret["mode"] = "recalc-melting-temps"
    updateServerData(uuid, JSON.stringify(ret))
}

window.exportTable = exportTable;
function exportTable(sExp, sRun, sMode) {
    if (!(window.rdmlData.hasOwnProperty("rdml"))) {
        return
    }
    var ret = {}
    ret["mode"] = "export-run"
    ret["experiment"] = sExp
    ret["run"] = sRun
    ret["export-mode"] = sMode
    updateServerData(uuid, JSON.stringify(ret))
}

window.exportAnnotations = exportAnnotations;
function exportAnnotations() {
    if (!(window.rdmlData.hasOwnProperty("rdml"))) {
        return
    }
    var ret = {}
    ret["mode"] = "export-annotations"
    updateServerData(uuid, JSON.stringify(ret))
}

window.importAnnotations = importAnnotations;
function importAnnotations() {
    if (!(window.rdmlData.hasOwnProperty("rdml"))) {
        return
    }
    var ret = {}
    ret["mode"] = "import-annotations"
    if (document.getElementById("inSamUploadAnnotation").value) {
        ret["tableUploadAnnotation"] = true
        updateServerData(uuid, JSON.stringify(ret))
    }
}

// Create a selector for ids
window.disChangesSecElement = disChangesSecElement;
function disChangesSecElement(div_target) {
    var ele = document.getElementById(div_target)
    ele.innerHTML = ""
}

function checkStatVal() {
     alert("EditMode: " + window.editMode +
           "\nIsNew: " + window.editIsNew +
           "\nEditType: " + window.editType +
           "\nEditNumber: " + window.editNumber)

}
