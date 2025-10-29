"use strict";

var jquery = require("jquery");
window.$ = window.jQuery = jquery; // notice the definition of global variables here

const API_URL = process.env.API_URL
const API_LINK = process.env.API_LINK

const resultLink = document.getElementById('uuid-link-box')

const submitButton = document.getElementById('btn-submit')
submitButton.addEventListener('click', showUpload)

const exampleButton = document.getElementById('btn-example')
exampleButton.addEventListener('click', showExample)

const saveRDMLButton = document.getElementById('btn-rdml-save')
saveRDMLButton.addEventListener('click', showRDMLSave)

const rdmlLibVersion = document.getElementById('rdml_lib_version')

// For debugging
// const jsDebugButton = document.getElementById('btn-jsDebug')
// jsDebugButton.addEventListener('click', jsDebugFunction)

function jsDebugFunction() {
    alert("Ready to debug")
    updateClientData()
}

const inputFile = document.getElementById('inputFile')
const resultInfo = document.getElementById('result-info')
const resultError = document.getElementById('result-error')

const selectorsData = document.getElementById('selectors-data')
const resultData = document.getElementById('result-data')

window.uuid = "";
window.rdmlData = "";
window.reactData = "";
window.isvalid = "untested";

window.selExperiment = "";
window.selRun = "";

window.sampleList = [];
window.sampleListCheck = {};
window.sampleListProp = "";
window.sampleListVal = "";

window.selExcl = "";
window.selNote = "";

function resetSelection() {
    window.sampleList = [];
    window.sampleListCheck = {};
    window.sampleListProp = "";
    window.sampleListVal = "";

    window.selExcl = "";
    window.selNote = "";
}

document.addEventListener("DOMContentLoaded", function() {
    checkForUUID();
});

window.showRDMLSave = showRDMLSave;
function showRDMLSave() {
    var elem = document.getElementById('download-link')
    elem.click()
}

function saveUndef(tst) {
    if (tst) {
        return tst
    } else {
        return ""
    }
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
    window.selRun = "";
    window.selExperiment = "";

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
        if (pKey == "TAB") {
            tab = pVal
        }
        if (pKey == "EXP") {
            window.selExperiment = pVal
        }
        if (pKey == "RUN") {
            window.selRun = pVal
        }
    }
    if (tab != "") {
        $('[href="#' + tab + '"]').tab('show')
    }
    if (uuid != "") {
        resetSelection()
        updateServerData(uuid, '{"mode": "upload", "validate": true}')
    }
}

$('#mainTab a').on('click', function(e) {
    e.preventDefault()
    $(this).tab('show')
})

function showExample() {
    window.selExperiment = "Experiment_1";
    window.selRun = "Run_1";

    resetSelection()
    updateServerData("example", '{"mode": "upload", "validate": true}')
    $('[href="#runs-tab"]').tab('show')
}

function showUpload() {
    window.selRun = "";
    window.selExperiment = "";

    resetSelection()
    updateServerData("data", '{"mode": "upload", "validate": true}')
    $('[href="#runs-tab"]').tab('show')
}

changeProperty
window.changeProperty = changeProperty;
function changeProperty() {
    var ret = {}
    ret["mode"] = "rename-annotation-property"
    ret["anno-old-property"] = getSaveHtmlData("inOldProperty")
    ret["anno-new-property"] = getSaveHtmlData("inNewProperty")
    updateServerData(uuid, JSON.stringify(ret))
    $('[href="#runs-tab"]').tab('show')
}

window.changeValue = changeValue;
function changeValue() {
    var ret = {}
    ret["mode"] = "rename-annotation-value"
    ret["anno-property"] = getSaveHtmlData("inProperty")
    ret["anno-old-value"] = getSaveHtmlData("inOldValue")
    ret["anno-new-value"] = getSaveHtmlData("inNewValue")
    updateServerData(uuid, JSON.stringify(ret))
    $('[href="#runs-tab"]').tab('show')
}

window.combineAnnos = combineAnnos;
function combineAnnos() {
    var ret = {}
    ret["mode"] = "create-annotation-combined"
    ret["anno-combined-property"] = getSaveHtmlData("inCombinedProperty")
    ret["anno-left-property"] = getSaveHtmlData("inPropertyLeft")
    ret["anno-connect-property"] = getSaveHtmlData("inConnector")
    ret["anno-right-property"] = getSaveHtmlData("inPropertyRight")
    updateServerData(uuid, JSON.stringify(ret))
    $('[href="#runs-tab"]').tab('show')
}

window.createAnnotations = createAnnotations;
function createAnnotations() {
    var ret = {}
    var allSam = []
    ret["mode"] = "create-annotation-list"
    ret["anno-new-property"] = getSaveHtmlData("inCreateProperty")
    ret["anno-new-value"] = getSaveHtmlData("inValue")
    window.sampleListProp = getSaveHtmlData("inCreateProperty");
    window.sampleListVal = getSaveHtmlData("inValue");
    for (var i = 0; i < window.sampleList.length; i++) {
        var ele = document.getElementById('inSample_' + i);
        if (ele) {
            window.sampleListCheck[window.sampleList[i]] = ele.checked;
            if (ele.checked) {
                allSam.push(window.sampleList[i])
            }
        }
    }
    ret["anno-sample-list"] = JSON.stringify(allSam)
    updateServerData(uuid, JSON.stringify(ret))
    $('[href="#runs-tab"]').tab('show')
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
        if (checkReq.hasOwnProperty("tableUploadAnnotation") && (checkReq["tableUploadAnnotation"] == true)) {
            formData.append('tableUploadAnnotation', document.getElementById("inSamUploadAnnotation").files[0])
        }
    }
    formData.append('reqData', reqData)

    hideElement(resultError)
    showElement(resultInfo)

    window.sampleList = [];

    axios
        .post(`${API_URL}/data`, formData)
        .then(res => {
	        if (res.status === 200) {
                window.rdmlData = res.data.data.filedata
                window.uuid = res.data.data.uuid
                rdmlLibVersion.innerHTML = "rdmlpython version: " + res.data.data.rdml_lib_version
                if (rdmlLibVersion.innerHTML == "1.1") {
                    showElement(resultError)
                    var err = '<i class="fas fa-fire"></i>\n<span id="error-message">'
                    err += 'Annotations are only available from RDML version 1.2 on. Use RDML-Edit to upgrade.</span>'
                    resultError.innerHTML = err
                }
                if (stat == "data") {
                    var exp = window.rdmlData.rdml.experiments;
                    if (exp.length > 0) {
                        window.selExperiment = exp[0].id;
                        var runs = exp[0].runs
                        if (runs.length > 0) {
                            window.selRun = runs[0].id;
                        }
                    }
                }
                if ((window.rdmlData.hasOwnProperty("rdml")) && (window.rdmlData.rdml.hasOwnProperty("samples"))) {
                    var exp = window.rdmlData.rdml.samples;
                    for (var i = 0; i < exp.length; i++) {
                        window.sampleList.push(exp[i].id);
                    }
                    window.sampleList.sort();
                }
                if (res.data.data.hasOwnProperty("reactsdata")) {
                    window.reactData = res.data.data.reactsdata
                    // For debugging
                    // document.getElementById('text-jsDebug').value = JSON.stringify(window.reactData, null, 2)
                } else {
                    window.reactData = ""
                }
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
                    showElement(resultError)
                    var err = '<i class="fas fa-fire"></i>\n<span id="error-message">'
                    err += res.data.data.error + '</span>'
                    resultError.innerHTML = err
                } else {
                    hideElement(resultError)
                }
                if (res.data.data.hasOwnProperty("exporttable")) {
                    saveFile("rdml_export.tsv", res.data.data.exporttable, "tsv")
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
            var err = '<i class="fas fa-fire"></i>\n<span id="error-message">'
            err += errorMessage + '</span>'
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

window.updateClientData = updateClientData
function updateClientData() {
    // The UUID box
    var ret = '<br />' + createLinkBox(`${API_LINK}`, `${API_URL}`, 'annotationedit.html', window.uuid, window.isvalid, window.selExperiment, window.selRun);
    if (window.isvalid == "invalid") {
        resultError.innerHTML = '<i class="fas fa-fire"></i>\n<span id="error-message">' +
                                'Error: Uploaded file is not valid RDML!</span>'
        showElement(resultError)
    }
    resultLink.innerHTML = ret

    if (!(window.rdmlData.hasOwnProperty("rdml"))) {
        return
    }
    var ret = ''
    var exp = window.rdmlData.rdml.experiments;

    ret = '<div class="card">\n<div class="card-body">\n'
    ret += '<h5 class="card-title">Rename Annotation Property</h5>\n<p>'
    ret += '<table style="width:100%;">'
    ret += '  <tr>\n    <td style="width:25%;">Old Property</td>\n'
    ret += '    <td style="width:75%"><input type="text" class="form-control" '
    ret += 'id="inOldProperty" value=""></td>\n'
    ret += '  </tr>'
    ret += '  <tr>\n    <td style="width:25%;">New Property</td>\n'
    ret += '    <td style="width:75%"><input type="text" class="form-control" '
    ret += 'id="inNewProperty" value=""></td>\n'
    ret += '  </tr>'
    ret += '</table>'
    ret += '<button type="button" class="btn btn-success" '
    ret += 'onclick="changeProperty();">Change All Properties</button>'
    ret += '</div>\n</div>\n<br />\n<br />\n'
    ret += '<div class="card">\n<div class="card-body">\n'
    ret += '<h5 class="card-title">Rename Annotation Value</h5>\n<p>'
    ret += '<table style="width:100%;">'
    ret += '  <tr>\n    <td style="width:25%;">Property</td>\n'
    ret += '    <td style="width:75%"><input type="text" class="form-control" '
    ret += 'id="inProperty" value=""></td>\n'
    ret += '  </tr>'
    ret += '  <tr>\n    <td style="width:25%;">Old Value</td>\n'
    ret += '    <td style="width:75%"><input type="text" class="form-control" '
    ret += 'id="inOldValue" value=""></td>\n'
    ret += '  </tr>'
    ret += '  <tr>\n    <td style="width:25%;">New Value</td>\n'
    ret += '    <td style="width:75%"><input type="text" class="form-control" '
    ret += 'id="inNewValue" value=""></td>\n'
    ret += '  </tr>'
    ret += '</table>'
    ret += '<button type="button" class="btn btn-success" '
    ret += 'onclick="changeValue();">Change All Values</button>'
    ret += '</div>\n</div>\n<br />\n<br />\n'
    ret += '<div class="card">\n<div class="card-body">\n'
    ret += '<h5 class="card-title">Create New Annotation from two existent Annotations</h5>\n<p>'
    ret += '<table style="width:100%;">'
    ret += '  <tr>\n    <td style="width:25%;">Combined Property Name</td>\n'
    ret += '    <td style="width:75%"><input type="text" class="form-control" '
    ret += 'id="inCombinedProperty" value=""></td>\n'
    ret += '  </tr>'
    ret += '  <tr>\n    <td style="width:25%;">Property Left</td>\n'
    ret += '    <td style="width:75%"><input type="text" class="form-control" '
    ret += 'id="inPropertyLeft" value=""></td>\n'
    ret += '  </tr>'
    ret += '  <tr>\n    <td style="width:25%;">Connect with</td>\n'
    ret += '    <td style="width:75%"><input type="text" class="form-control" '
    ret += 'id="inConnector" value=" - "></td>\n'
    ret += '  </tr>'
    ret += '  <tr>\n    <td style="width:25%;">Property Right</td>\n'
    ret += '    <td style="width:75%"><input type="text" class="form-control" '
    ret += 'id="inPropertyRight" value=""></td>\n'
    ret += '  </tr>'
    ret += '</table>'
    ret += '<button type="button" class="btn btn-success" '
    ret += 'onclick="combineAnnos();">Create Combined Annotation</button>'
    ret += '</div>\n</div>\n<br />\n<br />\n'
    ret += '<div class="card">\n<div class="card-body">\n'
    ret += '<h5 class="card-title">Create new Annotation</h5>\n<p>'
    ret += '<table style="width:100%;">'
    ret += '  <tr>\n    <td style="width:25%;">Property</td>\n'
    ret += '    <td style="width:75%"><input type="text" class="form-control" '
    ret += 'id="inCreateProperty" value="' + window.sampleListProp + '"></td>\n'
    ret += '  </tr>'
    ret += '  <tr>\n    <td style="width:25%;">Value</td>\n'
    ret += '    <td style="width:75%"><input type="text" class="form-control" '
    ret += 'id="inValue" value="' + window.sampleListVal + '"></td>\n'
    ret += '  </tr>'
    for (var i = 0; i < window.sampleList.length; i++) {
        ret += '  <tr>\n    <td style="width:25%;">Add Sample:</td>\n'
        ret += '    <td style="width:75%">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
        ret += '      <label class="form-check-label">'
        ret += '        <input type="checkbox" class="form-check-input" id="inSample_' + i
        ret += '" value=""'
        if (window.sampleListCheck[ window.sampleList[i]]) {
            ret += ' checked'
        }
        ret += '>' + window.sampleList[i]
        ret += '      </label></td>\n'
        ret += '  </tr>'
    }
    ret += '</table><br />'
    ret += '<button type="button" class="btn btn-success" '
    ret += 'onclick="createAnnotations();">Create Annotations</button>&nbsp;&nbsp;'
    ret += '<button type="button" class="btn btn-success" '
    ret += 'onclick="selAllSamples();">Select All Samples</button>&nbsp;&nbsp;'
    ret += '<button type="button" class="btn btn-success" '
    ret += 'onclick="invertSelSamples();">Invert Sample Selection</button>&nbsp;&nbsp;'
    ret += '<button type="button" class="btn btn-success" '
    ret += 'onclick="unSelAllSamples();">Deselect All Samples</button>&nbsp;&nbsp;'
    ret += '</div>\n</div>\n'

    selectorsData.innerHTML = ret


    var exp = window.rdmlData.rdml.samples;
    ret = '<br /><br /><h4>Current Sample Annotations:</h4>'
    for (var i = 0; i < exp.length; i++) {
        ret += '<br /><div class="card">\n<div class="card-body">\n'
        ret += '<h5 class="card-title">' + (i + 1) + '. Sample ID: ' + exp[i].id + '</h5>\n<p>'
        ret += '<div id="pType-sample-' + i + '"></div>'
        ret += '<div id="pAnnotation-sample-' + i + '"></div>'
        ret += '<div class="card">\n<div class="card-body">\n'
        ret += '<h5 class="card-title">Annotation:</h5>\n'
        ret += '<table style="width:100%;">'
        if (exp[i].hasOwnProperty("annotations")) {
            var au = exp[i].annotations.length
            for (var j = 0; j < au; j++) {
                ret += '  <tr>\n    <td style="width:15%;">'
                ret += saveUndef(exp[i].annotations[j].property) + ': </td>\n'
                ret += '    <td style="width:45%;">'
                ret += saveUndef(exp[i].annotations[j].value) + '</td>\n'
                ret += '    <td style="width:40%">\n'
                if (j == 0) {
                    ret += '<button type="button" class="btn btn-success btn-sm disabled">Move Up</button>&nbsp;&nbsp;'
                } else {
                    ret += '<button type="button" class="btn btn-success btn-sm" '
                    ret += 'onclick="moveSecElement(\'sample\', ' + i + ', \'\', 0, \'annotation\', ' + j
                    ret += ', ' + (j - 1) + ');">Move Up</button>&nbsp;&nbsp;'
                }
                if (j == au - 1) {
                    ret += '<button type="button" class="btn btn-success btn-sm disabled">Move Down</button>&nbsp;&nbsp;&nbsp;'
                } else {
                    ret += '<button type="button" class="btn btn-success btn-sm" '
                    ret += 'onclick="moveSecElement(\'sample\', ' + i + ', \'\', 0, \'annotation\', ' + j
                    ret += ', ' + (j + 2) + ');">Move Down</button>&nbsp;&nbsp;&nbsp;'
                }
                ret += '<button type="button" class="btn btn-success btn-sm" '
                ret += 'onclick="deleteSecElement(\'sample\', ' + i + ', \'\', 0, \'annotation\', ' + j
                ret += ');">Delete</button></td>\n  </tr>'
            }
        }
        ret += '</table>\n'
        ret += '</div>\n</div><br />\n'

        ret += '</div>\n</div>\n'
    }
    resultData.innerHTML = ret
}

window.selAllSamples = selAllSamples;
function selAllSamples(){
    if (!(window.rdmlData.hasOwnProperty("rdml"))) {
        return
    }
    for (var i = 0; i < window.sampleList.length; i++) {
        var ele = document.getElementById('inSample_' + i);
        if (ele) {
            ele.checked = true;
        }
    }
 }

window.invertSelSamples = invertSelSamples;
function invertSelSamples(){
    if (!(window.rdmlData.hasOwnProperty("rdml"))) {
        return
    }
    for (var i = 0; i < window.sampleList.length; i++) {
        var ele = document.getElementById('inSample_' + i);
        if (ele) {
            if (ele.checked) {
                ele.checked = false;
            } else {
                ele.checked = true;
            }
        }
    }
 }

window.unSelAllSamples = unSelAllSamples;
function unSelAllSamples(){
    if (!(window.rdmlData.hasOwnProperty("rdml"))) {
        return
    }
    for (var i = 0; i < window.sampleList.length; i++) {
        var ele = document.getElementById('inSample_' + i);
        if (ele) {
            ele.checked = false;
        }
    }
 }

window.moveSecElement = moveSecElement;
function moveSecElement(prim_key, prim_pos, sec_key, sec_pos, id_source, cur_pos, new_pos){
    if (!(window.rdmlData.hasOwnProperty("rdml"))) {
        return
    }
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

// Delete the selected element
window.deleteSecElement = deleteSecElement;
function deleteSecElement(prim_key, prim_pos, sec_key, sec_pos, id_source, cur_pos){
    if (!(window.rdmlData.hasOwnProperty("rdml"))) {
        return
    }
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
window.updateErrNote = updateErrNote;
function updateErrNote() {
    window.selExcl = document.getElementById('runView-ele-excl').value
    window.selNote = document.getElementById('runView-ele-note').value
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

function showElement(element) {
    element.classList.remove('d-none')
}

function hideElement(element) {
    element.classList.add('d-none')
}
