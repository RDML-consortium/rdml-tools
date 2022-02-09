"use strict";

const API_URL = process.env.API_URL
const API_LINK = process.env.API_LINK

const resultLink = document.getElementById('uuid-link-box')

const submitButton = document.getElementById('btn-submit')
submitButton.addEventListener('click', showUpload)

const examplePlateCorrButton = document.getElementById('btn-example-platecorr')
examplePlateCorrButton.addEventListener('click', showPlateCorrExample)







const linRegPCRButton = document.getElementById('btn-linregpcr')
linRegPCRButton.addEventListener('click', runLinRegPCR)

const linRegPCRRDMLButton = document.getElementById('btn-rdml-linregpcr')
linRegPCRRDMLButton.addEventListener('click', showRDMLSave)

const meltcurveRDMLButton = document.getElementById('btn-rdml-meltcurve')
meltcurveRDMLButton.addEventListener('click', showRDMLSave)

const choiceSaveRDML = document.getElementById('updateRDMLData')
choiceSaveRDML.addEventListener('change', updateRDMLCheck)

const choiceExcludeNoPlat = document.getElementById('choiceExcludeNoPlateau')
choiceExcludeNoPlat.addEventListener('change', updateRDMLCheck)

const choiceExcludeEff = document.getElementById('choiceExcludeEfficiency')
choiceExcludeEff.addEventListener('change', updateRDMLCheck)






const rdmlLibVersion = document.getElementById('rdml_lib_version')

// For debugging
// const jsDebugButton = document.getElementById('btn-jsDebug')
// jsDebugButton.addEventListener('click', jsDebugFunction)

function jsDebugFunction() {
    alert("Ready to debug")
    saveTabFile("debug.txt", JSON.stringify(window.reactData, null, 2))
    updateClientData()
}


const inputFile = document.getElementById('inputFile')
const resultInfo = document.getElementById('result-info')
const resultError = document.getElementById('result-error')

const selectorsData = document.getElementById('selectors-data')
const resultData = document.getElementById('result-data')
const resultLinRegPCR = document.getElementById('result-linregpcr')
const resultMeltcurve = document.getElementById('result-meltcurve')
const resultCorrection = document.getElementById('result-correction')

window.uuid = "";
window.rdmlData = "";
window.reactData = "";
window.isvalid = "untested";

window.selExperiment = "";
window.selRun = "";
window.selPCRStyle = "classic";
window.selRunOnLoad = "";
window.reloadRun = false;
window.selDigitalOnLoad = "none";

window.plateView = "plate";
window.colorStyle = "tarsam";
window.decimalSepPoint = true;
window.selAnnotation = "";

window.selAnnota = false;
window.selPCREff = false;
window.selRawCq = false;
window.selRawN0 = false;
window.selCorCq = true;
window.selCorN0 = true;
window.selCorF = false;
window.selCorP = false;
window.selNote = false;
window.selExcl = false;

window.plateSaveTable = "";






window.exNoPlateau = true;
window.exDiffMean = "outlier";


window.linRegSaveTable = ""
window.meltcurveSaveTable = ""
window.correctionSaveTable = ""

window.tarToDye = {}
window.tarToNr = {}
window.samToNr = {}
window.samToType = {}
window.samAnnotations = {}
window.samToAnnotations = {}

window.usedSamples = {}
window.usedTargets = {}
window.usedDyeIds = {}
window.usedDyeMaxPos = 0

window.reactToLinRegTable = {}
window.reactToMeltcurveTable = {}
window.linRegPCRTable = []
window.meltcurveTable = []


function resetAllGlobalVal() {
    hideElement(resultError)
    updateClientData()
}

window.updatePlateDeciSep = updatePlateDeciSep
function updatePlateDeciSep() {
    var data = getSaveHtmlData("dropSelPlateDeciSep")
    if (data == "point") {
        window.decimalSepPoint = true;
    } else {
        window.decimalSepPoint = false;
    }
    updateClientData()
}

window.updateAnnotation = updateAnnotation
function updateAnnotation() {
    window.selAnnotation = getSaveHtmlData("dropSelAnnotation")
    window.samToAnnotations = {}
    var exp = window.rdmlData.rdml.samples
    for (var i = 0; i < exp.length; i++) {
        if (exp[i].hasOwnProperty("annotations")) {
            for (var j = 0; j < exp[i].annotations.length; j++) {
                if (window.selAnnotation == exp[i].annotations[j].property) {
                    window.samToAnnotations[exp[i].id] = exp[i].annotations[j].value
                }
            }
        }
    }
    updateClientData()
}

window.resetLinRegPCRdata = resetLinRegPCRdata
function resetLinRegPCRdata() {
    window.linRegSaveTable = ""
    window.linRegPCRTable = []
    window.reactToLinRegTable = {}
    resultLinRegPCR.innerHTML = ""
}

window.resetMeltcurveData = resetMeltcurveData
function resetMeltcurveData() {
    window.meltcurveSaveTable = ""
    window.meltcurveTable = []
    window.reactToMeltcurveTable = {}
    resultMeltcurve.innerHTML = ""
}

window.updateRDMLCheck = updateRDMLCheck
function updateRDMLCheck() {
    var bbUpdateRDML = document.getElementById('updateRDMLData')
    var optionalGreyTab = document.getElementById('tab-optional-grey')
    if ((bbUpdateRDML) && (bbUpdateRDML.value == "y")) {
        optionalGreyTab.style.backgroundColor = "#e6e6e6"
        resetLinRegPCRdata()
    } else {
        optionalGreyTab.style.backgroundColor = "#ffffff"
    }
}

document.addEventListener("DOMContentLoaded", function() {
    checkForUUID();
});

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

function htmllize(tst) {
    tst = tst.replace(/\n/g, "<br />")

    return tst
}

function niceSampleType(txt) {
    if (txt == "ref") {
        return "ref - reference target"
    }
    if (txt == "toi") {
        return "toi - target of interest"
    }
    return txt
}

function niceTargetType(txt) {
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

function getSaveHtmlData(key) {
    var el = document.getElementById(key)
    if (el) {
        return el.value
    } else {
        return ""
    }
}

function getSaveHtmlCheckbox(key) {
    var el = document.getElementById(key)
    if (el) {
        return el.checked
    } else {
        return false
    }
}

function checkForUUID() {
    var uuid = ""
    var tab = ""
    var vExp = ""
    var vRun = ""

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
            vExp = pVal
        }
        if (pKey == "RUN") {
            vRun = pVal
        }
    }
    if (tab != "") {
        $('[href="#' + tab + '"]').tab('show')
    }
    if (vExp != "") {
        window.selExperiment = vExp
        if (vRun != "") {
            window.selRunOnLoad = vRun
        }
    }
    if (uuid != "") {
        updateServerData(uuid, '{"mode": "upload", "validate": true}')
    }
}

$('#mainTab a').on('click', function(e) {
    e.preventDefault()
    $(this).tab('show')
})

function showPlateCorrExample() {
    window.selRun = "";
    window.selPCRStyle = "classic";
    window.selExperiment = "Plate Correction";
    window.selRunOnLoad = "Plate 1";
    window.selDigitalOnLoad = "none";
    resetAllGlobalVal()

    updateServerData("platecorr", '{"mode": "upload", "validate": true}')
    $('[href="#runs-tab"]').tab('show')
}

function showMeltcurveExample() {
    window.selRun = "";
    window.selPCRStyle = "classic";
    window.selExperiment = "Artifact Mix";
    window.selRunOnLoad = "Artifact Mix with SYBR Green I";
    window.selDigitalOnLoad = "none";
    resetAllGlobalVal()

    updateServerData("meltcurve", '{"mode": "upload", "validate": true}')
    $('[href="#runs-tab"]').tab('show')
}

function showUpload() {
    window.selRun = "";
    window.selExperiment = "";
    window.selRunOnLoad = "";
    window.selDigitalOnLoad = "none";
    resetAllGlobalVal()

    updateServerData("data", '{"mode": "upload", "validate": true}')
    $('[href="#runs-tab"]').tab('show')
}

function runLinRegPCR() {
    if (window.selRun == "") {
        alert("Select an experiment and run first!")
        return
    }
    resultLinRegPCR.innerHTML = ""
    var rPCREffRange = 0.05
    var rUpdateRDML = true
    hideElement(resultError)

    var ret = {}
    ret["mode"] = "run-linregpcr"
    ret["sel-experiment"] = window.selExperiment
    ret["sel-run"] = window.selRun
    ret["pcr-eff-range"] = rPCREffRange
    ret["update-RDML-data"] = rUpdateRDML
    ret["exclude-no-plateau"] = window.exNoPlateau
    ret["exclude-efficiency"] = window.exDiffMean
    updateServerData(uuid, JSON.stringify(ret))

    $('[href="#linregpcr-tab"]').tab('show')
}

// TODO client-side validation
function updateServerData(stat, reqData) {
    const formData = new FormData()
    if (stat == "platecorr") {
        formData.append('showPlateCorrExample', 'showPlateCorrExample')
    } else if (stat == "linregpcr") {
        formData.append('showLinRegPCRExample', 'showLinRegPCRExample')
    } else if (stat == "data") {
        formData.append('queryFile', inputFile.files[0])
    } else {
        formData.append('uuid', stat)
    }
    formData.append('reqData', reqData)

    showElement(resultInfo)

    axios
        .post(`${API_URL}/data`, formData)
        .then(res => {
	        if (res.status === 200) {
                window.rdmlData = res.data.data.filedata
                window.uuid = res.data.data.uuid
                rdmlLibVersion.innerHTML = "rdmlpython version: " + res.data.data.rdml_lib_version
                if (stat == "data") {
                    var exp = window.rdmlData.rdml.experiments;
                    if (exp.length > 0) {
                        window.selExperiment = exp[0].id;
                        var runs = exp[0].runs
                        window.selRunOnLoad = runs[0].id;
                    }
                }
                if (res.data.data.hasOwnProperty("reactsdata")) {
                    window.reactData = res.data.data.reactsdata
                    // For debugging
                    // document.getElementById('text-jsDebug').value = JSON.stringify(window.reactData, null, 2)
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
                }
                fillLookupDics()
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

window.fillLookupDics = fillLookupDics
function fillLookupDics() {
    var exp = window.rdmlData.rdml.targets
    window.tarToDye = {}
    window.tarToNr = {}
    window.samToNr = {}
    window.samToType = {}
    window.samAnnotations = {}
    window.usedSamples = {}
    window.usedTargets = {}
    window.usedDyeIds = {}
    window.usedDyeMaxPos = 0

    for (var i = 0; i < exp.length; i++) {
        window.tarToDye[exp[i].id] = exp[i].dyeId
        window.tarToNr[exp[i].id] = i
    }

    exp = window.rdmlData.rdml.samples
    for (var i = 0; i < exp.length; i++) {
        window.samToNr[exp[i].id] = i
        window.samToType[exp[i].id] = exp[i].type
        if (exp[i].hasOwnProperty("annotations")) {
            for (var j = 0; j < exp[i].annotations.length; j++) {
                window.samAnnotations[exp[i].annotations[j].property] = 1
            }
        }
    }

    // Add the selected bool
    if (window.reactData.hasOwnProperty("reacts")) {
        var reacts = window.reactData.reacts
        for (var i = 0; i < reacts.length; i++) {
            window.usedSamples[reacts[i].sample] = 1
            for (var k = 0; k < reacts[i].datas.length; k++) {
                window.usedTargets[reacts[i].datas[k].tar] = 1
                window.usedDyeIds[window.tarToDye[reacts[i].datas[k].tar]] = 1
                if (window.usedDyeMaxPos < k) {
                    window.usedDyeMaxPos = k
                }
                if (reacts[i].datas[k].hasOwnProperty("excl")) {
                   if (reacts[i].datas[k].excl == "")  {
                        window.usedExcluded["7s8e45-Empty-Val"] = 1
                    } else {
                        var splitExcl = reacts[i].datas[k].excl.split(";")
                        for (var ex = 0; ex < splitExcl.length; ex++) {
                            window.usedExcluded[splitExcl[ex]] = 1
                        }
                    }
                }
                reacts[i].datas[k]["runview_show"] = true
            }
        }
        window.tarToNr = {}
        var allTargets = Object.keys(window.usedTargets)
        allTargets.sort()
        for (var sam = 0; sam < allTargets.length; sam++) {
            window.tarToNr[allTargets[sam]] = sam
        }
        window.samToNr = {}
        var allSamples = Object.keys(window.usedSamples)
        allSamples.sort()
        for (var sam = 0; sam < allSamples.length; sam++) {
            window.samToNr[allSamples[sam]] = sam
        }
    }
}

window.updateClientData = updateClientData
function updateClientData() {
    if (window.selRunOnLoad != "") {
        window.selRun = window.selRunOnLoad
        if ((window.rdmlData.hasOwnProperty("rdml")) && (window.selExperiment != "") && (window.selRun != "")){
            var ret = {}
            ret["mode"] = "get-run-data-wo-curves"
            ret["sel-experiment"] = window.selExperiment
            ret["sel-run"] = window.selRun
            window.selRunOnLoad = ""
            updateServerData(uuid, JSON.stringify(ret))
        }
        return
    }
    if (window.reloadRun == true) {
        var ret = {}
        ret["mode"] = "get-run-data-wo-curves"
        ret["sel-experiment"] = window.selExperiment
        ret["sel-run"] = window.selRun
        window.reloadRun = false
        updateServerData(uuid, JSON.stringify(ret))
        return
    }

    // The UUID box
    var ret = '<br /><div class="card">\n<div class="card-body">\n'
    ret += '<h5 class="card-title">Links to other RDML tools</h5>\n<p>Link to this result page:<br />'
    ret += '<a href="' + `${API_LINK}` + "linregpcr.html?UUID=" + window.uuid + ';TAB=runs-tab'
    ret += ';EXP=' + encodeURIComponent(window.selExperiment) + ';RUN=' + encodeURIComponent(window.selRun) + '" '
    ret += 'target="_blank">'
    ret += `${API_LINK}` + "linregpcr.html?UUID=" + window.uuid + ';TAB=runs-tab'
    ret += ';EXP=' + encodeURIComponent(window.selExperiment)
    ret += ';RUN=' + encodeURIComponent(window.selRun) + '</a> (valid for 3 days)\n<br />\n'
    ret += '</p>\n'
    ret += '<p>Download RDML file:<br />'
    var stuffer = new Date();
    var stufferStr = stuffer.getTime()
    ret += '<a href="' + `${API_URL}` + "/download/" + window.uuid + '?UNIQUE=' + stufferStr
    ret += '" target="_blank" id="download-link">'
    ret += `${API_URL}` + "/download/" + window.uuid + '</a> (valid for 3 days)\n<br />\n'
    ret += '</p>\n'
    ret += '<p>View single run in RunView:<br />'
    ret += '<a href="' + `${API_LINK}` + "runview.html?UUID=" + window.uuid + ';TAB=runs-tab'
    ret += ';EXP=' + encodeURIComponent(window.selExperiment) + ';RUN=' + encodeURIComponent(window.selRun) + '" '
    ret += 'target="_blank">'
    ret += `${API_LINK}`  + "runview.html?UUID=" + window.uuid + ';TAB=runs-tab'
    ret += ';EXP=' + encodeURIComponent(window.selExperiment)
    ret += ';RUN=' + encodeURIComponent(window.selRun) + '</a> (valid for 3 days)\n<br />\n'
    ret += '</p>\n'
    ret += '<p>View or edit RDML file:<br />'
    ret += '<a href="' + `${API_LINK}` + "edit.html?UUID=" + window.uuid + '">'
    ret += `${API_LINK}` + "edit.html?UUID=" + window.uuid + '</a> (valid for 3 days)\n</p>\n'
    if (window.isvalid == "untested") {
        ret += '<p>Click here to validate RDML file:<br />'
    }
    if (window.isvalid == "valid") {
        ret += '<p>File is valid RDML! Click here for more information:<br />'
    }
    if (window.isvalid == "invalid") {
        ret += '<p>File is not valid RDML! Click here for more information:<br />'
        resultError.innerHTML = '<i class="fas fa-fire"></i>\n<span id="error-message">' +
                                'Error: Uploaded file is not valid RDML!</span>'
        showElement(resultError)
    }
    ret += '<a href="' + `${API_LINK}` + "validate.html?UUID=" + window.uuid + '" target="_blank">'
    ret += `${API_LINK}` + "validate.html?UUID=" + window.uuid + '</a> (valid for 3 days)\n<br />\n'
    ret += '</p>\n</div>\n</div>\n'
    resultLink.innerHTML = ret

    if (!(window.rdmlData.hasOwnProperty("rdml"))) {
        return
    }
    ret = ''
    var exp = window.rdmlData.rdml.experiments;

    ret = '<table style="width:100%;background-color: #e6e6e6;">'
    ret += '  <tr>\n    <td style="width:8%;">Experiment:</td>\n<td style="width:29%;">'
    ret += '  <select class="form-control" id="dropSelExperiment" onchange="updateExperiment()">'
    ret += '    <option value="">No experiment selected</option>\n'
    window.experimentPos = -1
    for (var i = 0; i < exp.length; i++) {
        ret += '        <option value="' + exp[i].id + '"'
        if (window.selExperiment == exp[i].id) {
            ret += ' selected'
            window.experimentPos = i
        }
        ret += '>' + exp[i].id + '</option>\n'
    }
    ret += '  </select>\n'
    ret += '</td>\n'
    ret += '<td style="width:4%;"></td>'
    ret += '    <td style="width:4%;">Run:</td>\n<td style="width:33%;">'
    ret += '  <select class="form-control" id="dropSelRun" onchange="updateRun()">'
    ret += '    <option value="">No run selected</option>\n'
    window.runPos = -1
    if (window.experimentPos > -1) {
        var runs = exp[window.experimentPos].runs
        for (var i = 0; i < runs.length; i++) {
            ret += '        <option value="' + runs[i].id + '"'
            if (window.selRun == runs[i].id) {
                ret += ' selected'
                window.runPos = i
            }
            ret += '>' + runs[i].id + '</option>\n'
        }
    }
    ret += '</td>\n'
    ret += '<td style="width:4%;"></td>'
    ret += '    <td style="width:7%;">PCR type:</td>\n<td style="width:11%;">'
    ret += '  <select class="form-control" id="dropSelPCRStyle" onchange="updatePCRStyle()">'

    if (window.selDigitalOnLoad == "none") {
        if ((window.experimentPos > -1) && (window.runPos > -1) && (window.reactData.hasOwnProperty("reacts"))) {
            var countData = 0
            var countPart = 0
            var eReacts = window.reactData.reacts
            for (var reac = 0; reac < eReacts.length; reac++) {
                if ((eReacts[reac].hasOwnProperty("datas")) &&
                    (eReacts[reac].datas.length > 0)) {
                    countData += 1;
                }
                if ((eReacts[reac].hasOwnProperty("partitions")) &&
                    (eReacts[reac].partitions.hasOwnProperty("datas"))) {
                    countPart += 1;
                }
            }
            if (countData > countPart) {
                window.selPCRStyle = "classic"
                ret += '    <option value="classic" selected>classic</option>\n'
                ret += '    <option value="digital">digital</option>\n'
            } else {
                window.selPCRStyle = "digital"
                ret += '    <option value="classic">classic</option>\n'
                ret += '    <option value="digital" selected>digital</option>\n'
            }
            window.selDigitalOnLoad = ""
        }
    } else {
        if (window.selPCRStyle == "classic") {
            ret += '    <option value="classic" selected>classic</option>\n'
            ret += '    <option value="digital">digital</option>\n'
        } else {
            ret += '    <option value="classic">classic</option>\n'
            ret += '    <option value="digital" selected>digital</option>\n'
        }
    }
    ret += '  </select>\n'
    ret += '</td>\n</tr>\n'
    ret += '</table>\n'

    ret += '<table style="width:100%;">'
    ret += '  <tr>\n    <td style="width:8%;">Data View:</td>\n<td style="width:10%;">'
    ret += '  <select class="form-control" id="dropSelPlateView" onchange="updatePlateView()">'
    ret += '        <option value="plate"'
    if (window.plateView == "plate") {
        ret += ' selected'
    }
    ret += '>Plate</option>\n'
    ret += '        <option value="list"'
    if (window.plateView == "list") {
        ret += ' selected'
    }
    ret += '>List</option>\n'
    ret += '  </select>\n'
    ret += '</td>\n'
    ret += '  <td style="width:4%;"></td>\n'
    ret += '  <td style="width:9%;">Color Coding:</td>\n<td style="width:12%;">'
    ret += '  <select class="form-control" id="dropSelColorStyle" onchange="updateColorStyle()">'
    ret += '        <option value="tarsam"'
    if (window.colorStyle == "tarsam") {
        ret += ' selected'
    }
    ret += '>Target & Sample</option>\n'
    ret += '        <option value="type"'
    if (window.colorStyle == "type") {
        ret += ' selected'
    }
    ret += '>Sample Type</option>\n'
    ret += '        <option value="tar"'
    if (window.colorStyle == "tar") {
        ret += ' selected'
    }
    ret += '>Target</option>\n'
    ret += '        <option value="sam"'
    if (window.colorStyle == "sam") {
        ret += ' selected'
    }
    ret += '>Sample</option>\n'
    ret += '  </select>\n'
    ret += '</td>\n<td style="width:4%;"></td>\n'
    ret += '  <td style="width:9%;">Decimal Separator:</td>\n<td style="width:12%;">'
    ret += '  <select class="form-control" id="dropSelPlateDeciSep" onchange="updatePlateDeciSep()">'
    ret += '        <option value="point"'
    if (window.decimalSepPoint == true) {
        ret += ' selected'
    }
    ret += '>Point</option>\n'
    ret += '        <option value="comma"'
    if (window.decimalSepPoint == false) {
        ret += ' selected'
    }
    ret += '>Comma</option>\n'
    ret += '  </select>\n'
    ret += '</td>\n<td style="width:4%;"></td>\n'
    ret += '  <td style="width:9%;">Select Annotation:</td>\n<td style="width:12%;">'
    ret += '  <select class="form-control" id="dropSelAnnotation" onchange="updateAnnotation()">'
    ret += '        <option value=""'
    if (window.selAnnotation == "") {
        ret += ' selected'
    }
    ret += '>Not Selected</option>\n'
    var allAnnotations = Object.keys(window.samAnnotations)
    for (var i = 0; i < allAnnotations.length; i++) {
        ret += '        <option value="' + allAnnotations[i] + '"'
        if (window.selAnnotation == allAnnotations[i]) {
            ret += ' selected'
        }
        ret += '>' + allAnnotations[i] + '</option>\n'
    }
    ret += '  </select>\n'
    ret += '</td>\n<td style="width:7%;"></td>\n</tr>\n'
    ret += '</table>\n'
    if (window.plateView == "plate") {
        ret += '<table style="width:100%;">'
        ret += '  <tr>\n    <td style="width:4%;"></td>\n'
        ret += '  <td style="width:8%;">'
        ret += '  <div class="form-check">\n'
        ret += '    <input type="checkbox" class="form-check-input" id="checkAnnota"'
        if (window.selAnnota == true) {
          ret += ' checked="checked"'
        }
        ret += ' onchange="updateCheckboxes()">\n'
        ret += '    <label class="form-check-label" for="checkAnnota">Annotation</label>\n'
        ret += '  </div>\n</td>\n<td style="width:8%;">'
        ret += '  <div class="form-check">\n'
        ret += '    <input type="checkbox" class="form-check-input" id="checkPCREff"'
        if (window.selPCREff == true) {
          ret += ' checked="checked"'
        }
        ret += ' onchange="updateCheckboxes()">\n'
        ret += '    <label class="form-check-label" for="checkPCREff">PCR Eff</label>\n'
        ret += '  </div>\n</td>\n<td style="width:8%;">'
        ret += '  <div class="form-check">\n'
        ret += '    <input type="checkbox" class="form-check-input" id="checkRawCq"'
        if (window.selRawCq == true) {
          ret += ' checked="checked"'
        }
        ret += ' onchange="updateCheckboxes()">\n'
        ret += '    <label class="form-check-label" for="checkRawCq">raw Cq</label>\n'
        ret += '  </div>\n</td>\n<td style="width:8%;">'
        ret += '  <div class="form-check">\n'
        ret += '    <input type="checkbox" class="form-check-input" id="checkRawN0"'
        if (window.selRawN0 == true) {
          ret += ' checked="checked"'
        }
        ret += ' onchange="updateCheckboxes()">\n'
        ret += '    <label class="form-check-label" for="checkRawN0">raw N0</label>\n'
        ret += '  </div>\n</td>\n<td style="width:8%;">'
        ret += '  <div class="form-check">\n'
        ret += '    <input type="checkbox" class="form-check-input" id="checkCorCq"'
        if (window.selCorCq == true) {
          ret += ' checked="checked"'
        }
        ret += ' onchange="updateCheckboxes()">\n'
        ret += '    <label class="form-check-label" for="checkCorCq">corr Cq</label>\n'
        ret += '  </div>\n</td>\n<td style="width:8%;">'
        ret += '  <div class="form-check">\n'
        ret += '    <input type="checkbox" class="form-check-input" id="checkCorN0"'
        if (window.selCorN0 == true) {
          ret += ' checked="checked"'
        }
        ret += ' onchange="updateCheckboxes()">\n'
        ret += '    <label class="form-check-label" for="checkCorN0">corr N0</label>\n'
        ret += '  </div>\n</td>\n<td style="width:8%;">'
        ret += '  <div class="form-check">\n'
        ret += '    <input type="checkbox" class="form-check-input" id="checkCorF"'
        if (window.selCorF == true) {
          ret += ' checked="checked"'
        }
        ret += ' onchange="updateCheckboxes()">\n'
        ret += '    <label class="form-check-label" for="checkCorF">corr Factor</label>\n'
        ret += '  </div>\n</td>\n<td style="width:8%;">'
        ret += '  <div class="form-check">\n'
        ret += '    <input type="checkbox" class="form-check-input" id="checkCorP"'
        if (window.selCorP == true) {
          ret += ' checked="checked"'
        }
        ret += ' onchange="updateCheckboxes()">\n'
        ret += '    <label class="form-check-label" for="checkCorP">corr Plate</label>\n'
        ret += '  </div>\n</td>\n<td style="width:8%;">'
        ret += '  <div class="form-check">\n'
        ret += '    <input type="checkbox" class="form-check-input" id="checkNote"'
        if (window.selNote == true) {
          ret += ' checked="checked"'
        }
        ret += ' onchange="updateCheckboxes()">\n'
        ret += '    <label class="form-check-label" for="checkNote">Note</label>\n'
        ret += '  </div>\n</td>\n<td style="width:8%;">'
        ret += '  <div class="form-check">\n'
        ret += '    <input type="checkbox" class="form-check-input" id="checkExcl"'
        if (window.selExcl == true) {
          ret += ' checked="checked"'
        }
        ret += ' onchange="updateCheckboxes()">\n'
        ret += '    <label class="form-check-label" for="checkExcl">Excluded</label>\n'
        ret += '  </div>\n</td>\n<td style="width:16%;">'
        ret += '</td>\n</tr>\n'
        ret += '</table>\n'
    } else {
    }
    ret += '<table style="width:100%;">\n'
    ret += '  <tr>\n'
    ret += '    <td style="width:61%;"></td>\n'
    ret += '    <td style="width:38%;text-align: right;">\n'
    ret += '      <button type="submit" class="btn btn-outline-primary" onclick="copyPlateTable()">\n'
    ret += '        <i class="fas fa-paste" style="margin-right: 5px;"></i>\n'
    ret += '        Copy table to clipboard\n'
    ret += '      </button>&nbsp;&nbsp;\n'
    if (window.plateView == "list") {
        ret += '      <button type="submit" class="btn btn-outline-primary" onclick="savePlateTable()">\n'
        ret += '        <i class="far fa-save" style="margin-right: 5px;"></i>\n'
        ret += '        Save table as CSV\n'
        ret += '      </button>\n'
    }
    ret += '    </td>\n'
    ret += '    <td style="width:1%;"></td>\n'
    ret += '  </tr>\n'
    ret += '</table>\n'

    selectorsData.innerHTML = ret
    ret = ""
    var csv = ""

    if ((window.experimentPos > -1) && (window.runPos > -1) && (window.reactData.hasOwnProperty("reacts"))) {
        var reacts = window.reactData.reacts
        var the_run = exp[window.experimentPos].runs[window.runPos]
        var rows = parseInt(the_run.pcrFormat.rows)
        var columns = parseInt(the_run.pcrFormat.columns)
        var rowLabel = the_run.pcrFormat.rowLabel
        var columnLabel = the_run.pcrFormat.columnLabel
        window.plateSaveTable = ""
        if (window.selPCRStyle != "classic") {
            ret += '<a href="#" onclick="getDigitalOverviewFile()">Overview as table data (.tsv)</a><br /><br />'
        }
        if (window.plateView == "plate") {
            ret += '<table id="rdmlPlateVTab" style="width:100%;">'
            ret += '<tr><td></td>'
            for (var h = 0; h < columns; h++) {
                if (columnLabel == "123") {
                    ret += '  <td>' + (h + 1) + '</td>'
                } else if (columnLabel == "ABC") {
                    ret += '  <td>' + String.fromCharCode('A'.charCodeAt(0) + h) + '</td>'
                }
            }
            ret += '</tr>\n'
            var exRowCount = 0
            var exRowUsed = false
            var rowCont = ""
            for (var r = 0; r < rows; r++) {
                rowCont += '  <tr>'
                if (rowLabel == "123") {
                    rowCont += '  <td>' + (r + 1) + '</td>'
                } else if (rowLabel == "ABC") {
                    rowCont += '  <td>' + String.fromCharCode('A'.charCodeAt(0) + r) + '</td>'
                }
                for (var c = 0; c < columns; c++) {
                    var id = r * columns + c + 1
                    var cell = '  <td></td>'
                    for (var reac = 0; reac < reacts.length; reac++) {
                        if (parseInt(reacts[reac].id) == id) {
                            if (window.selPCRStyle == "classic") {
                                var dataPos = exRowCount
                                if (dataPos < reacts[reac].datas.length) {
                                    var exlReact = false;
                                    var colo = "#000000"
                                    if ((reacts[reac].hasOwnProperty("datas")) && (window.reactData.max_data_len > 0)) {
                                        exlReact = reacts[reac].datas[dataPos].hasOwnProperty("excl")
                                    }
                                    if ((reacts[reac].datas[dataPos].hasOwnProperty("runview_show")) &&
                                        (reacts[reac].datas[dataPos].runview_show == true)) {
                                        if (window.colorStyle == "type") {
                                            var samType = window.samToType[reacts[reac].sample]
                                            if (samType =="unkn") {
                                                colo = "#000000"
                                            }
                                            if (samType =="std") {
                                                colo = "#a9a9a9"
                                            }
                                            if (samType =="ntc") {
                                                colo = "#ff0000"
                                            }
                                            if (samType =="nac") {
                                                colo = "#ff0000"
                                            }
                                            if (samType =="ntp") {
                                                colo = "#ff0000"
                                            }
                                            if (samType =="nrt") {
                                                colo = "#ff0000"
                                            }
                                            if (samType =="pos") {
                                                colo = "#006400"
                                            }
                                            if (samType =="opt") {
                                                colo = "#8b008b"
                                            }
                                            if (exlReact) {
                                                colo = "#ffff00"
                                            }
                                        }
                                        if (window.colorStyle == "tar") {
                                            var tarNr = 0
                                            if ((reacts[reac].hasOwnProperty("datas")) &&
                                                (window.reactData.max_data_len > 0)) {
                                                tarNr = window.tarToNr[reacts[reac].datas[dataPos].tar]
                                            }
                                            if (exlReact) {
                                                colo = "#ff0000"
                                            } else {
                                                colo = colorByNr(tarNr)
                                            }
                                        }
                                        if (window.colorStyle == "sam") {
                                            var samNr = window.samToNr[reacts[reac].sample]
                                            if (exlReact) {
                                                colo = "#ff0000"
                                            } else {
                                                colo = colorByNr(samNr)
                                            }
                                        }
                                        if (window.colorStyle == "tarsam") {
                                            var samNr = window.samToNr[reacts[reac].sample]
                                            var tarNr = 0
                                            if ((reacts[reac].hasOwnProperty("datas")) &&
                                                (window.reactData.max_data_len > 0)) {
                                                tarNr = window.tarToNr[reacts[reac].datas[dataPos].tar]
                                            }
                                            var samCount = window.rdmlData.rdml.samples.length
                                            var samTarNr = tarNr * samCount + samNr
                                            if (exlReact) {
                                                colo = "#ff0000"
                                            } else {
                                                colo = colorByNr(samTarNr)
                                            }
                                        }
                                    } else {
                                        colo = "#ffffff"
                                    }
                                    // colo = colorByNr(id)
                                    var fon_col = "#000000"
                                    if (hexToGrey(colo) < 128) {
                                        fon_col = "#ffffff"
                                    }
                                    cell = '  <td style="font-size:0.7em;background-color:' + colo
                                    cell += ';color:' + fon_col + ';" >'
                                    cell += reacts[reac].sample + '<br />'
                                    if ((reacts[reac].hasOwnProperty("datas")) &&
                                        (window.reactData.max_data_len > 0)) {
                                        cell += reacts[reac].datas[dataPos].tar + '<br />'
                                        if (window.selAnnota == true) {
                                            cell += 'Anno: '
                                            if (window.samToAnnotations.hasOwnProperty(reacts[reac].sample)) {
                                                cell += window.samToAnnotations[reacts[reac].sample]
                                            }
                                            cell += '<br />'
                                        }
                                        if (window.selPCREff == true) {
                                            cell += 'Eff: '
                                            if (reacts[reac].datas[dataPos].hasOwnProperty("ampEff")) {
                                                cell += floatWithPrec(reacts[reac].datas[dataPos].ampEff, 1000)
                                            }
                                            cell += '<br />'
                                        }
                                        if (window.selRawCq == true) {
                                            cell += 'raw Cq: '
                                            if (reacts[reac].datas[dataPos].hasOwnProperty("cq")) {
                                                cell += floatWithPrec(reacts[reac].datas[dataPos].cq, 100)
                                            }
                                            cell += '<br />'
                                        }
                                        if (window.selRawN0 == true) {
                                            cell += 'raw N0: '
                                            if (reacts[reac].datas[dataPos].hasOwnProperty("N0")) {
                                                cell += floatWithExPrec(reacts[reac].datas[dataPos].N0, 2)
                                            }
                                            cell += '<br />'
                                        }
                                        if (window.selCorCq == true) {
                                            cell += 'Cq: '
                                            if (reacts[reac].datas[dataPos].hasOwnProperty("corrCq")) {
                                                cell += floatWithPrec(reacts[reac].datas[dataPos].corrCq, 100)
                                            }
                                            cell += '<br />'
                                        }
                                        if (window.selCorN0 == true) {
                                            cell += 'N0: '
                                            if (reacts[reac].datas[dataPos].hasOwnProperty("corrN0")) {
                                                cell += floatWithExPrec(reacts[reac].datas[dataPos].corrN0, 2)
                                            }
                                            cell += '<br />'
                                        }
                                        if (window.selCorF == true) {
                                            cell += 'Corr F: '
                                            if (reacts[reac].datas[dataPos].hasOwnProperty("corrF")) {
                                                cell += floatWithPrec(reacts[reac].datas[dataPos].corrF, 100)
                                            } else {
                                                cell += floatWithPrec('1.0', 100)
                                            }
                                            cell += '<br />'
                                        }
                                        if (window.selCorP == true) {
                                            cell += 'Corr P: '
                                            if (reacts[reac].datas[dataPos].hasOwnProperty("corrP")) {
                                                cell += floatWithPrec(reacts[reac].datas[dataPos].corrP, 100)
                                            } else {
                                                cell += floatWithPrec('1.0', 100)
                                            }
                                            cell += '<br />'
                                        }
                                        if (window.selNote == true) {
                                            cell += 'Note:<br />'
                                            if (reacts[reac].datas[dataPos].hasOwnProperty("note")) {
                                                cell += reacts[reac].datas[dataPos].note
                                            }
                                            cell += '<br />'
                                        }
                                        if (window.selExcl == true) {
                                            cell += 'Excluded:<br />'
                                            if (reacts[reac].datas[dataPos].hasOwnProperty("excl")) {
                                                cell += reacts[reac].datas[dataPos].excl
                                            }
                                            cell += '<br />'
                                        }
                                        cell += '</td>'
                                    } else {
                                        cell += '---<br />---</td>'
                                    }
                                    exRowUsed = true
                                }
                            } else {
                                if ((reacts[reac].hasOwnProperty("partitions")) &&
                                    (reacts[reac].partitions.hasOwnProperty("datas")) &&
                                    (window.reactData.max_partition_data_len > 0)) {
                                    var samNr = window.samToNr[reacts[reac].sample]
                                    var colo = colorByNr(samNr)
                                    var fon_col = "#000000"
                                    if (hexToGrey(colo) < 128) {
                                        fon_col = "#ffffff"
                                    }
                                    if (exRowCount == 0) {
                                        cell = '  <td style="font-size:0.8em;background-color:'
                                        cell += colo + ';color:' + fon_col + ';vertical-align:top;">'
                                        cell += '<b><u>' + reacts[reac].sample + '</u></b><br />'
                                        if (reacts[reac].partitions.hasOwnProperty("endPtTable")) {
                                            cell += '<a href="#" onclick="getDigitalFile(\'' + id + '\',\''
                                            cell += reacts[reac].partitions.endPtTable + '\')">Raw data (.tsv)</a><br />'
                                        } else {
                                            cell += 'No raw data<br />'
                                        }
                                        cell += '</td>'
                                        exRowUsed = true
                                    } else {
                                        if (exRowCount - 1 < reacts[reac].partitions.datas.length) {
                                            var dData = exRowCount - 1
                                            cell = '  <td style="font-size:0.8em;background-color:' + colo
                                            cell += ';color:' + fon_col + ';vertical-align:top;">'
                                            cell += '<b><u>' + reacts[reac].sample + '</u></b><br />'
                                            cell += '<b>' + reacts[reac].partitions.datas[dData].tar + '</b><br />'
                                            cell += "Pos: " + reacts[reac].partitions.datas[dData].pos + '<br />'
                                            cell += "Neg: " + reacts[reac].partitions.datas[dData].neg + '<br />'
                                            if (reacts[reac].partitions.datas[dData].hasOwnProperty("undef")) {
                                                cell += "Undef: " + reacts[reac].partitions.datas[dData].undef + '<br />'

                                            }
                                            if (reacts[reac].partitions.datas[dData].hasOwnProperty("excl")) {
                                                cell += "Excl: " + reacts[reac].partitions.datas[dData].excl + '<br />'

                                            }
                                            if (reacts[reac].partitions.datas[dData].hasOwnProperty("conc")) {
                                                cell += reacts[reac].partitions.datas[dData].conc + ' cop/&micro;l<br />'

                                            }
                                            cell += '</td>'
                                            exRowUsed = true
                                        } else {
                                            cell = '  <td style="font-size:0.8em;background-color:' + colo + ';"></td>'
                                        }
                                    }
                                }
                            }
                        }
                    }
                    rowCont += cell
                }
                rowCont += '</tr>\n'
                if (exRowUsed == true) {
                    ret += rowCont
                    exRowUsed = false
                    r--
                    exRowCount++
                } else {
                    exRowCount = 0
                }
                rowCont = ""
            }
            ret += '</table>'
        } else {
            ret += '<table id="rdmlPlateVTab" style="width:100%;">'
            ret += '<tr>'
            ret += '<td>Well</td>'
            csv += 'Well\t'
            ret += '<td>Pos</td>'
            csv += 'Pos\t'
            ret += '<td>Sample</td>'
            csv += 'Sample\t'
            ret += '<td>Target</td>'
            csv += 'Target\t'
            var annoDes = window.selAnnotation
            if (annoDes == "") {
                annoDes = "No Annotation"
            }
            ret += '<td>' + annoDes + '</td>'
            csv += annoDes + '\t'
            ret += '<td>Excluded</td>'
            csv += 'Excluded\t'
            ret += '<td>Note</td>'
            csv += 'Note\t'
            if (window.selPCRStyle == "classic") {
                ret += '<td>PCR Eff</td>'
                csv += 'PCR Eff\t'
                ret += '<td>raw Cq</td>'
                csv += 'raw Cq\t'
                ret += '<td>raw N0</td>'
                csv += 'raw N0\t'
                ret += '<td>corr F</td>'
                csv += 'corr F\t'
                ret += '<td>corr P</td>'
                csv += 'corr P\t'
                ret += '<td>corr Cq</td>'
                csv += 'corr Cq\t'
                ret += '<td>corr N0</td>'
                csv += 'corr N0\n'
            } else {
                ret += '<td>Concentration</td>'
                csv += 'Concentration\t'
                ret += '<td>Positive</td>'
                csv += 'Positive\t'
                ret += '<td>Negative</td>'
                csv += 'Negative\t'
                ret += '<td>Undefined</td>'
                csv += 'Undefined\t'
                ret += '<td>Excluded</td>'
                csv += 'Excluded\n'
            }
            ret += '</tr>\n'
            var exRowCount = 0
            var exRowUsed = false
            for (var r = 0; r < rows; r++) {
                var rowCont = ''
                if (rowLabel == "123") {
                    rowCont += (r + 1)
                } else if (rowLabel == "ABC") {
                    rowCont += String.fromCharCode('A'.charCodeAt(0) + r)
                }
                if (rowLabel == columnLabel) {
                    rowCont += ' '
                }
                for (var c = 0; c < columns; c++) {
                    var combCol = rowCont
                    if (columnLabel == "123") {
                        combCol += (c + 1)
                    } else if (columnLabel == "ABC") {
                        combCol += String.fromCharCode('A'.charCodeAt(0) + c)
                    }
                    var id = r * columns + c + 1
                    for (var reac = 0; reac < reacts.length; reac++) {
                        if (parseInt(reacts[reac].id) == id) {
                            if (window.selPCRStyle == "classic") {
                                for (var dataPos = 0; dataPos < reacts[reac].datas.length; dataPos++) {
                                    ret += '  <tr>\n  <td>' + combCol + '</td>'
                                    csv += combCol + '\t'
                                    ret += '<td>' + reac + '</td>'
                                    csv += reac + '\t'
                                    ret += '<td>' + reacts[reac].sample + '</td>'
                                    csv += reacts[reac].sample + '\t'
                                    ret += '<td>' + reacts[reac].datas[dataPos].tar + '</td>'
                                    csv += reacts[reac].datas[dataPos].tar + '\t'
                                    ret += '<td>'
                                    if (window.samToAnnotations.hasOwnProperty(reacts[reac].sample)) {
                                        ret += window.samToAnnotations[reacts[reac].sample]
                                        csv += window.samToAnnotations[reacts[reac].sample]
                                    }
                                    ret += '</td>\n<td>'
                                    csv += '\t'
                                    if (reacts[reac].datas[dataPos].hasOwnProperty("excl")) {
                                        ret += reacts[reac].datas[dataPos].excl
                                        csv += reacts[reac].datas[dataPos].excl
                                    }
                                    ret += '</td>\n<td>'
                                    csv += '\t'
                                    if (reacts[reac].datas[dataPos].hasOwnProperty("note")) {
                                        ret += reacts[reac].datas[dataPos].note
                                        csv += reacts[reac].datas[dataPos].note
                                    }
                                    ret += '</td>\n<td>'
                                    csv += '\t'
                                    if (reacts[reac].datas[dataPos].hasOwnProperty("ampEff")) {
                                        ret += floatWithPrec(reacts[reac].datas[dataPos].ampEff, 1000)
                                        csv += floatWithPrec(reacts[reac].datas[dataPos].ampEff, 1000)
                                    }
                                    ret += '</td>\n<td>'
                                    csv += '\t'
                                    if (reacts[reac].datas[dataPos].hasOwnProperty("cq")) {
                                        ret += floatWithPrec(reacts[reac].datas[dataPos].cq, 100)
                                        csv += floatWithPrec(reacts[reac].datas[dataPos].cq, 100)
                                    }
                                    ret += '</td>\n<td>'
                                    csv += '\t'
                                    if (reacts[reac].datas[dataPos].hasOwnProperty("N0")) {
                                        ret += floatWithExPrec(reacts[reac].datas[dataPos].N0, 2)
                                        csv += floatWithExPrec(reacts[reac].datas[dataPos].N0, 2)
                                    }
                                    ret += '</td>\n<td>'
                                    csv += '\t'
                                    if (reacts[reac].datas[dataPos].hasOwnProperty("corrF")) {
                                        ret += floatWithPrec(reacts[reac].datas[dataPos].corrF, 100)
                                        csv += floatWithPrec(reacts[reac].datas[dataPos].corrF, 100)
                                    } else {
                                        ret += floatWithPrec('1.0', 100)
                                        csv += floatWithPrec('1.0', 100)
                                    }
                                    ret += '</td>\n<td>'
                                    csv += '\t'
                                    if (reacts[reac].datas[dataPos].hasOwnProperty("corrP")) {
                                        ret += floatWithPrec(reacts[reac].datas[dataPos].corrP, 100)
                                        csv += floatWithPrec(reacts[reac].datas[dataPos].corrP, 100)
                                    } else {
                                        ret += floatWithPrec('1.0', 100)
                                        csv += floatWithPrec('1.0', 100)
                                    }
                                    ret += '</td>\n<td>'
                                    csv += '\t'
                                    if (reacts[reac].datas[dataPos].hasOwnProperty("corrCq")) {
                                        ret += floatWithPrec(reacts[reac].datas[dataPos].corrCq, 100)
                                        csv += floatWithPrec(reacts[reac].datas[dataPos].corrCq, 100)
                                    }
                                    ret += '</td>\n<td>'
                                    csv += '\t'
                                    if (reacts[reac].datas[dataPos].hasOwnProperty("corrN0")) {
                                        ret += floatWithExPrec(reacts[reac].datas[dataPos].corrN0, 2)
                                        csv += floatWithExPrec(reacts[reac].datas[dataPos].corrN0, 2)
                                    }
                                    ret += '</td>\n</tr>\n'
                                    csv += '\n'
                                }
                            } else {
                                if ((reacts[reac].hasOwnProperty("partitions")) &&
                                    (reacts[reac].partitions.hasOwnProperty("datas")) &&
                                    (window.reactData.max_partition_data_len > 0)) {
                                    for (var dataPos = 0; dataPos < reacts[reac].partitions.datas.length; dataPos++) {
                                        ret += '  <tr>\n  <td>' + combCol + '</td>'
                                        csv += combCol + '\t'
                                        ret += '<td>' + reac + '</td>'
                                        csv += reac + '\t'
                                        ret += '<td>' + reacts[reac].sample + '</td>'
                                        csv += reacts[reac].sample + '\t'
                                        ret += '<td>' + reacts[reac].partitions.datas[dataPos].tar + '</td>'
                                        csv += reacts[reac].partitions.datas[dataPos].tar + '\t'
                                        ret += '<td>'
                                        if (reacts[reac].partitions.datas[dataPos].hasOwnProperty("excluded")) {
                                            ret += reacts[reac].partitions.datas[dataPos].excluded
                                            csv += reacts[reac].partitions.datas[dataPos].excluded
                                        }
                                        ret += '</td>\n<td>'
                                        csv += '\t'
                                        if (reacts[reac].partitions.datas[dataPos].hasOwnProperty("note")) {
                                            ret += reacts[reac].partitions.datas[dataPos].note
                                            csv += reacts[reac].partitions.datas[dataPos].note
                                        }
                                        ret += '</td>\n<td>'
                                        csv += '\t'
                                        if (reacts[reac].partitions.datas[dataPos].hasOwnProperty("conc")) {
                                            ret += reacts[reac].partitions.datas[dataPos].conc
                                            csv += reacts[reac].partitions.datas[dataPos].conc
                                        }
                                        ret += '</td>\n<td>'
                                        csv += '\t'
                                        if (reacts[reac].partitions.datas[dataPos].hasOwnProperty("pos")) {
                                            ret += reacts[reac].partitions.datas[dataPos].pos
                                            csv += reacts[reac].partitions.datas[dataPos].pos
                                        }
                                        ret += '</td>\n<td>'
                                        csv += '\t'
                                        if (reacts[reac].partitions.datas[dataPos].hasOwnProperty("neg")) {
                                            ret += reacts[reac].partitions.datas[dataPos].neg
                                            csv += reacts[reac].partitions.datas[dataPos].neg
                                        }
                                        ret += '</td>\n<td>'
                                        csv += '\t'
                                        if (reacts[reac].partitions.datas[dataPos].hasOwnProperty("undef")) {
                                            ret += reacts[reac].partitions.datas[dataPos].undef
                                            csv += reacts[reac].partitions.datas[dataPos].undef
                                        }
                                        ret += '</td>\n<td>'
                                        csv += '\t'
                                        if (reacts[reac].partitions.datas[dataPos].hasOwnProperty("excl")) {
                                            ret += reacts[reac].partitions.datas[dataPos].excl
                                            csv += reacts[reac].partitions.datas[dataPos].excl
                                        }
                                        ret += '</td>\n</tr>\n'
                                        csv += '\n'
                                    }
                                }
                            }
                        }
                    }
                }
            }
            ret += '</table>'
        }
    }
    resultData.innerHTML = ret
    window.plateSaveTable = csv
}

window.floatWithPrec = floatWithPrec
function floatWithPrec(val, prec) {
    var ret = "";
    if (val == "") {
        return "";
    }
    ret += String(Math.round(val * prec) / prec);
    if (window.decimalSepPoint == false) {
        ret = ret.replace(/\./g, ',');
    }
    return ret;
}

window.floatWithExPrec = floatWithExPrec
function floatWithExPrec(val, prec) {
    var ret = "";
    if (val == "") {
        return "";
    }
    if (Number.parseFloat(val) < 0.0) {
        return floatWithPrec(val, 10);
    }
    ret += String(Number.parseFloat(val).toExponential(prec));
    if (window.decimalSepPoint == false) {
        ret = ret.replace(/\./g, ',');
    }
    return ret;
}

window.NumPoint = NumPoint
function NumPoint(val) {
    var ret = "";
    if (val == "") {
        return "";
    }
    ret += String(val);
    if (window.decimalSepPoint == false) {
        ret = ret.replace(/\./g, ',');
    }
    return ret;
}

window.savePlateTable = savePlateTable;
function savePlateTable() {
    saveTabFile("Plate.tsv", window.plateSaveTable)
    return;
};

window.copyPlateTable = copyPlateTable;
function copyPlateTable() {
    var el = document.getElementById("rdmlPlateVTab");
    if (el) {
        var body = document.body
        var range
        var sel
        if (document.createRange && window.getSelection) {
            range = document.createRange();
            sel = window.getSelection();
            sel.removeAllRanges();
            try {
                range.selectNodeContents(el);
                sel.addRange(range);
            } catch (e) {
                range.selectNode(el);
                sel.addRange(range);
            }
        } else if (body.createTextRange) {
            range = body.createTextRange();
            range.moveToElementText(el);
            range.select();
        }
        document.execCommand("copy");
        sel.removeAllRanges();
    }
    return;
};

window.updateExperiment = updateExperiment;
function updateExperiment() {
    var newData = getSaveHtmlData("dropSelExperiment")
    if (window.selExperiment == newData) {
        return
    }
    resetLinRegPCRdata()
    resetMeltcurveData()
    window.selExperiment = newData
    window.selRun = ""
    updateClientData()
}

window.updateRun = updateRun;
function updateRun() {
    var newData = getSaveHtmlData("dropSelRun")
    if (window.selRun == newData) {
        return
    }
    window.selRun = newData
    if (!(window.rdmlData.hasOwnProperty("rdml"))) {
        return
    }
    if ((window.selExperiment == "") || (window.selRun == "")){
        return
    }
    resetLinRegPCRdata()
    resetMeltcurveData()
    var ret = {}
    ret["mode"] = "get-run-data-wo-curves"
    ret["sel-experiment"] = window.selExperiment
    ret["sel-run"] = window.selRun
    updateServerData(uuid, JSON.stringify(ret))
}

window.getDigitalFile = getDigitalFile;
function getDigitalFile(well, fileName) {
    if ((window.selExperiment == "") || (window.selRun == "") || (well == "")){
        return
    }
    var ret = {}
    ret["mode"] = "get-digital-file"
    ret["sel-experiment"] = window.selExperiment
    ret["sel-run"] = window.selRun
    ret["sel-well"] = well

    const formData = new FormData()
    formData.append('uuid', uuid)
    formData.append('reqData', JSON.stringify(ret))

    axios
        .post(`${API_URL}/data`, formData)
        .then(res => {
	        if (res.status === 200) {
                if (res.data.data.hasOwnProperty("rawdigitalfile")) {
                    saveTabFile(fileName, res.data.data.rawdigitalfile)
                }
                if (res.data.data.hasOwnProperty("error")) {
                    alert(res.data.data.error)
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
            alert(errorMessage)
        })
}

window.getDigitalOverviewFile = getDigitalOverviewFile;
function getDigitalOverviewFile() {
    if ((window.selExperiment == "") || (window.selRun == "")){
        return
    }
    var fileName = window.selExperiment + "_" + window.selRun + "_overview.tsv"
    var ret = {}
    ret["mode"] = "get-digital-overview-file"
    ret["sel-experiment"] = window.selExperiment
    ret["sel-run"] = window.selRun

    const formData = new FormData()
    formData.append('uuid', uuid)
    formData.append('reqData', JSON.stringify(ret))

    axios
        .post(`${API_URL}/data`, formData)
        .then(res => {
	        if (res.status === 200) {
                if (res.data.data.hasOwnProperty("rawdigitalfile")) {
                    saveTabFile(fileName, res.data.data.rawdigitalfile)
                }
                if (res.data.data.hasOwnProperty("error")) {
                    alert(res.data.data.error)
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
            alert(errorMessage)
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

window.updatePCRStyle = updatePCRStyle;
function updatePCRStyle() {
    window.selPCRStyle = getSaveHtmlData("dropSelPCRStyle")
    updateClientData()
}

window.updatePlateView = updatePlateView;
function updatePlateView() {
    window.plateView = getSaveHtmlData("dropSelPlateView")
    updateClientData()
}

window.updateCheckboxes = updateCheckboxes;
function updateCheckboxes() {
    window.selAnnota = getSaveHtmlCheckbox("checkAnnota")
    window.selPCREff = getSaveHtmlCheckbox("checkPCREff")
    window.selRawCq = getSaveHtmlCheckbox("checkRawCq")
    window.selRawN0 = getSaveHtmlCheckbox("checkRawN0")
    window.selCorCq = getSaveHtmlCheckbox("checkCorCq")
    window.selCorN0 = getSaveHtmlCheckbox("checkCorN0")
    window.selCorF = getSaveHtmlCheckbox("checkCorF")
    window.selCorP = getSaveHtmlCheckbox("checkCorP")
    window.selNote = getSaveHtmlCheckbox("checkNote")
    window.selExcl = getSaveHtmlCheckbox("checkExcl")
    updateClientData()
}

window.updateColorStyle = updateColorStyle;
function updateColorStyle() {
    var newData = getSaveHtmlData("dropSelColorStyle")
    if (window.colorStyle == newData) {
        return
    }
    window.colorStyle = newData
    updateClientData()
}

function colorByNr(number) {
    var col = [
                                                    "#FF4A46", "#008941", "#006FA6", "#A30059",
                   "#7A4900", "#0000A6", "#63FFAC", "#B79762", "#004D43", "#8FB0FF", "#997D87",
        "#5A0007", "#809693",            "#1B4400", "#4FC601", "#3B5DFF", "#4A3B53", "#FF2F80",
        "#61615A", "#BA0900", "#6B7900", "#00C2A0", "#FFAA92", "#FF90C9", "#B903AA", "#D16100",
                   "#000035", "#7B4F4B", "#A1C299", "#300018", "#0AA6D8", "#013349", "#00846F",
        "#372101", "#FFB500",            "#A079BF", "#CC0744", "#C0B9B2", "#C2FF99", "#001E09",
        "#00489C", "#6F0062", "#0CBD66", "#EEC3FF", "#456D75", "#B77B68", "#7A87A1", "#788D66",
        "#885578", "#FAD09F", "#FF8A9A", "#D157A0", "#BEC459", "#456648", "#0086ED", "#886F4C",

        "#34362D", "#B4A8BD", "#00A6AA", "#452C2C", "#636375", "#A3C8C9", "#FF913F", "#938A81",
        "#575329", "#00FECF", "#B05B6F", "#8CD0FF", "#3B9700", "#04F757", "#C8A1A1", "#1E6E00",
        "#7900D7", "#A77500", "#6367A9", "#A05837", "#6B002C", "#772600", "#D790FF", "#9B9700",
        "#549E79", "#FFF69F", "#201625", "#72418F", "#BC23FF", "#99ADC0", "#3A2465", "#922329",
        "#5B4534", "#FDE8DC", "#404E55", "#0089A3", "#CB7E98", "#A4E804", "#324E72", "#6A3A4C",
        "#83AB58", "#001C1E", "#D1F7CE", "#004B28", "#C8D0F6", "#A3A489", "#806C66", "#222800",
        "#BF5650", "#E83000", "#66796D", "#DA007C", "#FF1A59", "#8ADBB4", "#1E0200", "#5B4E51",
        "#C895C5", "#320033", "#FF6832", "#66E1D3", "#CFCDAC", "#D0AC94", "#7ED379", "#012C58",
        "#FFFF00", "#1CE6FF", "#FF34FF"
    ]
    var num = parseInt(number) % (col.length - 1)
    return col[num]
}

function hexToGrey(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return Math.floor((parseInt(result[1], 16) + parseInt(result[2], 16) + parseInt(result[3], 16)) / 3)
}


function colorByNr2(number) {
    number = parseInt(number) + 1;
    var base = Math.floor(number / 7);
    var jump = number % 7;

    if (jump == 0) {
        return "rgb(" + rdmlNumberInverter(base) + ", " + rdmlNumberInverter(base) + ", " + rdmlNumberInverter(base) + ")"
    }
    if (jump == 1) {
        return "rgb(" + rdmlNumberInverter(base) + ", " + rdmlNumberInverter(base) + ", " +  rdmlNumberInverter(base + 1) + ")"
    }
    if (jump == 2) {
        return "rgb(" + rdmlNumberInverter(base) + ", " + rdmlNumberInverter(base + 1) + ", " +  rdmlNumberInverter(base) + ")"
    }
    if (jump == 3) {
        return "rgb(" + rdmlNumberInverter(base) + ", " + rdmlNumberInverter(base + 1) + ", " + rdmlNumberInverter(base + 1) + ")"
    }
    if (jump == 4) {
        return "rgb(" + rdmlNumberInverter(base + 1) + ", " + rdmlNumberInverter(base) + ", " +  rdmlNumberInverter(base) + ")"
    }
    if (jump == 5) {
        return "rgb(" + rdmlNumberInverter(base + 1) + ", " + rdmlNumberInverter(base) + ", " +  rdmlNumberInverter(base + 1 ) + ")"
    }
    if (jump == 6) {
        return "rgb(" + rdmlNumberInverter(base + 1) + ", " + rdmlNumberInverter(base + 1) + ", " +  rdmlNumberInverter(base) + ")"
    }
    return "#ffffff";
}

function rdmlNumberInverter(number) {
    var ret = 0;
    var proc = number
    if (proc % 2 == 0) {
        ret += 128
    }
    proc = Math.floor(proc / 2)
    if (proc % 2 == 0) {
        ret += 64
    }
    proc = Math.floor(proc / 2)
    if (proc % 2 == 0) {
        ret += 32
    }
    proc = Math.floor(proc / 2)
    if (proc % 2 == 0) {
        ret += 16
    }
    proc = Math.floor(proc / 2)
    if (proc % 2 == 0) {
        ret += 8
    }
    proc = Math.floor(proc / 2)
    if (proc % 2 == 0) {
        ret += 4
    }
    proc = Math.floor(proc / 2)
    if (proc % 2 == 0) {
        ret += 2
    }
    proc = Math.floor(proc / 2)
    if (proc % 2 == 0) {
        ret += 1
    }
    return ret;
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
