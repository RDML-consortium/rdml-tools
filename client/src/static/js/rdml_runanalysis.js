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

const exampleLinRegPCRButton = document.getElementById('btn-example-linregpcr')
exampleLinRegPCRButton.addEventListener('click', showLinRegPCRExample)

const exampleMeltcurveButton = document.getElementById('btn-example-meltcurve')
exampleMeltcurveButton.addEventListener('click', showMeltcurveExample)

const linRegPCRButton = document.getElementById('btn-linregpcr')
linRegPCRButton.addEventListener('click', runLinRegPCR)

const linRegPCRRDMLButton = document.getElementById('btn-rdml-linregpcr')
linRegPCRRDMLButton.addEventListener('click', showRDMLSave)

const meltcurveRDMLButton = document.getElementById('btn-rdml-meltcurve')
meltcurveRDMLButton.addEventListener('click', showRDMLSave)

const linRegPCRSaveButton = document.getElementById('btn-save-linregpcr')
linRegPCRSaveButton.addEventListener('click', saveTabLinRegPCR)

const meltcurveSaveButton = document.getElementById('btn-save-meltcurve')
meltcurveSaveButton.addEventListener('click', saveTabMeltcurve)

const correctionSaveButton = document.getElementById('btn-save-correction')
correctionSaveButton.addEventListener('click', saveTabCorrection)

const linRegPCRCopyButton = document.getElementById('btn-copy-linregpcr')
linRegPCRCopyButton.addEventListener('click', copyTabLinRegPCR)

const meltcurveCopyButton = document.getElementById('btn-copy-meltcurve')
meltcurveCopyButton.addEventListener('click', copyTabMeltcurve)

const correctionCopyButton = document.getElementById('btn-copy-correction')
correctionCopyButton.addEventListener('click', copyCorrection)

const choiceExclMeanEff = document.getElementById('text-exl-men-eff')
choiceExclMeanEff.addEventListener('change', resetLinRegPCRdata)

const choiceSaveRDML = document.getElementById('updateRDMLData')
choiceSaveRDML.addEventListener('change', updateRDMLCheck)

const choiceExcludeNoPlat = document.getElementById('choiceExcludeNoPlateau')
choiceExcludeNoPlat.addEventListener('change', updateRDMLCheck)

const choiceExcludeEff = document.getElementById('choiceExcludeEfficiency')
choiceExcludeEff.addEventListener('change', updateRDMLCheck)

const choiceExcludeUnstBase = document.getElementById('choiceExcludeUnstableBaseline')
choiceExcludeUnstBase.addEventListener('change', updateRDMLCheck)

const meltcurveButton = document.getElementById('btn-meltcurve')
meltcurveButton.addEventListener('click', runMeltcurve)



const choiceTable = document.getElementById('selTableStyle')
choiceTable.addEventListener('change', updateLinRegPCRTable)

const choiceMeltTable = document.getElementById('mcaTableStyle')
choiceMeltTable.addEventListener('change', updateMeltingTable)

const choiceDecimalSep = document.getElementById('selSeparator')
choiceDecimalSep.addEventListener('change', updateLinRegPCRDecimalSep)

const choiceMeltDecimalSep = document.getElementById('mcaSeparator')
choiceMeltDecimalSep.addEventListener('change', updateMeltDecimalSep)

const choiceCorrDecimalSep = document.getElementById('corrSeparator')
choiceCorrDecimalSep.addEventListener('change', updateCorrectionDecimalSep)

const choiceAnnotations = document.getElementById('choiceIncludeAnnotations')
choiceAnnotations.addEventListener('change', updateLinRegPCRTable)

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
window.baselineData = "";
window.meltcurveData = "";
window.isvalid = "untested";

window.selExperiment = "";
window.selRun = "";
window.selPCRStyle = "classic";
window.selRunOnLoad = "";
window.reloadCurves = false;
window.fixCurves = false;
window.selDigitalOnLoad = "none";

window.maxLogRange = 10000;

window.exNoPlateau = true;
window.exUnstBase  = true;
window.exDiffMean = "outlier";
window.updateTargets = false;
window.decimalSepPoint = true;

window.sampSelFirst = "7s8e45-Show-All"  // To avoid conflicts with existing values
window.sampSelSecond = "7s8e45-Show-All"  // To avoid conflicts with existing values
window.sampSelThird = "7s8e45-Show-All"  // To avoid conflicts with existing values
window.sampSelThirdList = []
window.yScale = "log"
window.curveSource = "adp"
window.colorStyle = "tarsam"

window.linRegSaveTable = ""
window.meltcurveSaveTable = ""
window.correctionSaveTable = ""

window.tarToDye = {}
window.tarToNr = {}
window.samToNr = {}
window.samToType = {}

window.usedSamples = {}
window.usedTargets = {}
window.usedDyeIds = {}
window.usedDyeMaxPos = 0
window.usedExcluded = {}

window.reactToLinRegTable = {}
window.reactToMeltcurveTable = {}
window.linRegPCRTable = []
window.meltcurveTable = []

window.lastSelReact = ""

window.convertField = { "id": 0,
                        "well": 1,
                        "sample": 2,
                        "sample type": 3,
                        "sample nucleotide": 4,
                        "target": 5,
                        "target chemistry": 6,
                        "excluded": 7,
                        "note": 8,
                        "baseline": 9,
                        "plateau": 10,
                        "plateau / baseline": 11,
                        "lower limit": 12,
                        "upper limit": 13,
                        "n in log phase": 14,
                        "last log cycle": 15,
                        "n included": 16,
                        "indiv PCR eff": 17,
                        "R2": 18,
                        "PCR eff": 19,
                        "standard error of PCR eff": 20,
                        "threshold": 21,
                        "Cq": 22,
                        "indiv Ncopy": 23,
                        "Ncopy": 24,
                        "amplification": 25,
                        "baseline error": 26,
                        "instable baseline": 27,
                        "plateau": 28,
                        "noisy sample": 29,
                        "excl PCR efficiency": 30,
                        "short log lin phase": 31,
                        "Cq is shifting": 32,
                        "too low Cq eff": 33,
                        "too low Cq N0": 34,
                        "used for W-o-L setting": 35,
                        "nAmpli": 36,
                        "vol": 37,
                        "dNTPs": 38,
                        "dyeConc": 39,
                        "primer len for": 40,
                        "primer conc for": 41,
                        "primer len rev": 42,
                        "primer conc rev": 43,
                        "probe1 len": 44,
                        "probe1 conc": 45,
                        "probe2 len": 46,
                        "probe2 conc": 47,
                        "amplicon len": 48};



const copyThreshold = 10 * Math.pow(1.9, 35.0);

// Global values for svg curves
// The value range
window.valXmin = 0;
window.valXmax = 75;
window.valYmin = 0;
window.valYmax = 5000;
// The value window
window.winXmin = 0;
window.winXmax = 75;
window.winYmin = 0;
window.winYmax = 5000;
window.winXst = 0;
window.winXend = 75;
window.winYst = 0;
window.winYstep = 500;
window.winYprec = 0;
window.winYend = 5000;
// The output window
window.frameXst = 0;
window.frameXend = 500;
window.frameYst = 0;
window.frameYend = 300;

function resetAllGlobalVal() {
    window.sampSelFirst = "7s8e45-Show-All"  // To avoid conflicts with existing values
    window.sampSelSecond = "7s8e45-Show-All"  // To avoid conflicts with existing values
    window.sampSelThird = "7s8e45-Show-All"  // To avoid conflicts with existing values
    hideElement(resultError)
    resetLinRegPCRdata()
    resetMeltcurveData()
    window.curveSource = "adp"
    updateClientData()
}

window.updateLinRegPCRDecimalSep = updateLinRegPCRDecimalSep
function updateLinRegPCRDecimalSep() {
    if (choiceDecimalSep.value == "point") {
        window.decimalSepPoint = true;
        choiceMeltDecimalSep.value = "point";
        choiceCorrDecimalSep.value = "point";
    } else {
        window.decimalSepPoint = false;
        choiceMeltDecimalSep.value = "comma";
        choiceCorrDecimalSep.value = "comma";
    }
    updateLinRegPCRTable()
}

window.updateMeltDecimalSep = updateMeltDecimalSep
function updateMeltDecimalSep() {
    if (choiceMeltDecimalSep.value == "point") {
        window.decimalSepPoint = true;
        choiceDecimalSep.value = "point";
        choiceCorrDecimalSep.value = "point";
    } else {
        window.decimalSepPoint = false;
        choiceDecimalSep.value = "comma";
        choiceCorrDecimalSep.value = "comma";
    }
    updateMeltingTable()
}

window.updateCorrectionDecimalSep = updateCorrectionDecimalSep
function updateCorrectionDecimalSep() {
    if (choiceCorrDecimalSep.value == "point") {
        window.decimalSepPoint = true;
        choiceDecimalSep.value = "point";
        choiceMeltDecimalSep.value = "point";
    } else {
        window.decimalSepPoint = false;
        choiceDecimalSep.value = "comma";
        choiceMeltDecimalSep.value = "comma";
    }
    updateCorrectionTable()
}

window.resetLinRegPCRdata = resetLinRegPCRdata
function resetLinRegPCRdata() {
    window.linRegSaveTable = ""
    window.linRegPCRTable = []
    window.reactToLinRegTable = {}
    window.curveSource = "adp"
    window.baselineData = ""
    resultLinRegPCR.innerHTML = ""
    var textEle = document.getElementById('report-linregpcr');
    if (textEle) {
        textEle.innerHTML = ""
    }
    updateLinRegPCRTable()
}

window.resetMeltcurveData = resetMeltcurveData
function resetMeltcurveData() {
    window.meltcurveSaveTable = ""
    window.meltcurveTable = []
    window.reactToMeltcurveTable = {}
    window.curveSource = "adp"
    window.meltcurveData = ""
    resultMeltcurve.innerHTML = ""
    updateMeltingTable()
}

window.updateRDMLCheck = updateRDMLCheck
function updateRDMLCheck() {
    var bbUpdateRDML = document.getElementById('updateRDMLData')
    if ((bbUpdateRDML) && (bbUpdateRDML.value == "y")) {
        resetLinRegPCRdata()
    }
    updateLinRegPCRTable()
}

document.addEventListener("DOMContentLoaded", function() {
    checkForUUID();
});

function showRDMLSave() {
    var elem = document.getElementById('download-link')
    elem.click()
}

window.updateMinLogRange = updateMinLogRange
function updateMinLogRange() {
    window.maxLogRange = parseInt(document.getElementById('text-max-log-range').value)
    updateClientData()
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

function checkForUUID() {
    var uuid = ""
    var tab = ""
    var vExp = ""
    var vRun = ""
    window.selRun = "";
    window.selExperiment = "";
    window.selRunOnLoad = "";

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

function showExample() {
    resetAllGlobalVal()
    window.selRun = "";
    window.selPCRStyle = "classic";
    window.selExperiment = "Experiment_1";
    window.selRunOnLoad = "Run_1";
    window.selDigitalOnLoad = "none";

    updateServerData("example", '{"mode": "upload", "validate": true}')
    $('[href="#runs-tab"]').tab('show')
}

function showLinRegPCRExample() {
    resetAllGlobalVal()
    window.selRun = "";
    window.selPCRStyle = "classic";
    window.selExperiment = "Experiment_1";
    window.selRunOnLoad = "Run_1";
    window.selDigitalOnLoad = "none";
    window.curveSource = "adp";
    window.yScale = "log";

    updateServerData("linregpcr", '{"mode": "upload", "validate": true}')
    $('[href="#runs-tab"]').tab('show')
}

function showMeltcurveExample() {
    resetAllGlobalVal()
    window.selRun = "";
    window.selPCRStyle = "classic";
    window.selExperiment = "Artifact Mix";
    window.selRunOnLoad = "Artifact Mix with SYBR Green I";
    window.selDigitalOnLoad = "none";
    window.curveSource = "mdp";
    window.yScale = "lin";

    updateServerData("meltcurve", '{"mode": "upload", "validate": true}')
    $('[href="#runs-tab"]').tab('show')
}

function showUpload() {
    resetAllGlobalVal()
    window.selRun = "";
    window.selExperiment = "";
    window.selRunOnLoad = "";
    window.selDigitalOnLoad = "none";

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
    window.exNoPlateau = true
    window.exUnstBase = true
    window.exDiffMean = "outlier"
    window.updateTargets = false
    hideElement(resultError)

    window.sampSelFirst = "7s8e45-Show-All"  // To avoid conflicts with existing values
    window.sampSelSecond = "7s8e45-Show-All"  // To avoid conflicts with existing values
    window.sampSelThird = "7s8e45-Show-All"  // To avoid conflicts with existing values


    var bbPCREff = document.getElementById('text-exl-men-eff')
    if (bbPCREff) {
        rPCREffRange = parseFloat(bbPCREff.value)
    }
    var bbUpdateRDML = document.getElementById('updateRDMLData')
    if ((bbUpdateRDML) && (bbUpdateRDML.value == "n")) {
        rUpdateRDML = false;
    }
    var bbExcludeNoPlateau = document.getElementById('choiceExcludeNoPlateau')
    if ((bbExcludeNoPlateau) && (bbExcludeNoPlateau.value == "n")) {
        window.exNoPlateau = false;
    }
    var bbExcludeEfficiency = document.getElementById('choiceExcludeEfficiency')
    if ((bbExcludeEfficiency) && (bbExcludeEfficiency.value == "n")) {
        window.exDiffMean = false;
    }
    var bbExcludeUnstBase = document.getElementById('choiceExcludeUnstableBaseline')
    if ((bbExcludeUnstBase) && (bbExcludeUnstBase.value == "n")) {
        window.exUnstBase = false;
    }
    var bbUpdateTarget = document.getElementById('choiceUpdateTarget')
    if ((bbUpdateTarget) && (bbUpdateTarget.value == "n")) {
        window.updateTargets = true;
    }

    window.yScale = "log"
    window.curveSource = "bas"

    var ret = {}
    ret["mode"] = "run-linregpcr"
    ret["sel-experiment"] = window.selExperiment
    ret["sel-run"] = window.selRun
    ret["pcr-eff-range"] = rPCREffRange
    ret["update-target-efficiency"] = window.updateTargets
    ret["update-RDML-data"] = rUpdateRDML
    ret["exclude-no-plateau"] = window.exNoPlateau
    ret["exclude-efficiency"] = window.exDiffMean
    ret["exclude-unstable-base"] = window.exUnstBase
    updateServerData(uuid, JSON.stringify(ret))

    $('[href="#linregpcr-tab"]').tab('show')
}

function runMeltcurve() {
    if (window.selRun == "") {
        alert("Select an experiment and run first!")
        return
    }
    resultMeltcurve.innerHTML = ""
    hideElement(resultError)

    window.sampSelFirst = "7s8e45-Show-All"  // To avoid conflicts with existing values
    window.sampSelSecond = "7s8e45-Show-All"  // To avoid conflicts with existing values
    window.sampSelThird = "7s8e45-Show-All"  // To avoid conflicts with existing values

    var rUpdateRDML = false
    var vMcaNormMethod = "exponential"
    var vMcaFluorLoss = "normalised"
    var vMcaTruePeakWidth = "1.0"
    var vMcaArtifactPeakWidth = "1.0"
    var vMcaExpLow = "65.0"
    var vMcaExpHigh = "92.0"
    var vMcaBilinLowStart = "68.0"
    var vMcaBilinLowStop = "70.0"
    var vMcaBilinHightStart = "93.0"
    var vMcaBilinHighStop = "94.0"
    var vMcaPeakLowTemp = "60.0"
    var vMcaPeakHighTemp ="98.0"
    var vMcaPeakMaxWidth ="5.0"
    var vMcaPeakCutoff = "5.0"

    var bbUpdateRDML = document.getElementById('updateMcaRDMLData')
    if ((bbUpdateRDML) && (bbUpdateRDML.value == "y")) {
        rUpdateRDML = true
    }
    var eleMcaNormMethod = document.getElementById('mcaNormMethod')
    if (eleMcaNormMethod) {
        vMcaNormMethod = eleMcaNormMethod.value
    }
    var eleMcaFluorLoss = document.getElementById('mcaFluorLoss')
    if (eleMcaFluorLoss) {
        vMcaFluorLoss = eleMcaFluorLoss.value
    }
    var eleMcaTruePeakWidth = document.getElementById('mcaTruePeakWidth')
    if (eleMcaTruePeakWidth) {
        vMcaTruePeakWidth = eleMcaTruePeakWidth.value
    }
    var eleMcaArtifactPeakWidth = document.getElementById('mcaArtifactPeakWidth')
    if (eleMcaArtifactPeakWidth) {
        vMcaArtifactPeakWidth = eleMcaArtifactPeakWidth.value
    }
    var eleMcaExpLow = document.getElementById('mcaExpLow')
    if (eleMcaExpLow) {
        vMcaExpLow = eleMcaExpLow.value
    }
    var eleMcaExpHigh = document.getElementById('mcaExpHigh')
    if (eleMcaExpHigh) {
        vMcaExpHigh = eleMcaExpHigh.value
    }
    var eleMcaBilinLowStart = document.getElementById('mcaBilinLowStart')
    if (eleMcaBilinLowStart) {
        vMcaBilinLowStart = eleMcaBilinLowStart.value
    }
    var eleMcaBilinLowStop = document.getElementById('mcaBilinLowStop')
    if (eleMcaBilinLowStop) {
        vMcaBilinLowStop = eleMcaBilinLowStop.value
    }
    var eleMcaBilinHightStart = document.getElementById('mcaBilinHightStart')
    if (eleMcaBilinHightStart) {
        vMcaBilinHightStart = eleMcaBilinHightStart.value
    }
    var eleMcaBilinHighStop = document.getElementById('mcaBilinHighStop')
    if (eleMcaBilinHighStop) {
        vMcaBilinHighStop = eleMcaBilinHighStop.value
    }
    var eleMcaPeakLowTemp = document.getElementById('mcaPeakLowTemp')
    if (eleMcaPeakLowTemp) {
        vMcaPeakLowTemp = eleMcaPeakLowTemp.value
    }
    var eleMcaPeakHighTemp = document.getElementById('mcaPeakHighTemp')
    if (eleMcaPeakHighTemp) {
        vMcaPeakHighTemp = eleMcaPeakHighTemp.value
    }
    var eleMcaPeakMaxWidth = document.getElementById('mcaPeakMaxWidth')
    if (eleMcaPeakMaxWidth) {
        vMcaPeakMaxWidth = eleMcaPeakMaxWidth.value
    }
    var eleMcaPeakCutoff = document.getElementById('mcaPeakCutoff')
    if (eleMcaPeakCutoff) {
        vMcaPeakCutoff = eleMcaPeakCutoff.value
    }

    window.yScale = "lin"
    window.curveSource = "fdm"

    var ret = {}
    ret["mode"] = "run-meltcurve"
    ret["sel-experiment"] = window.selExperiment
    ret["sel-run"] = window.selRun
    ret["update-RDML-data"] = rUpdateRDML
    ret["mca-norm-method"] = vMcaNormMethod
    ret["mca-fluor-loss"] = vMcaFluorLoss
    ret["mca-true-peak-width"] = vMcaTruePeakWidth
    ret["mca-artifact-peak-width"] = vMcaArtifactPeakWidth
    ret["mca-exp-low"] = vMcaExpLow
    ret["mca-exp-high"] = vMcaExpHigh
    ret["mca-bilin-low-start"] = vMcaBilinLowStart
    ret["mca-bilin-low-stop"] = vMcaBilinLowStop
    ret["mca-bilin-hight-start"] = vMcaBilinHightStart
    ret["mca-bilin-hight-stop"] = vMcaBilinHighStop
    ret["mca-peak-lowtemp"] = vMcaPeakLowTemp
    ret["mca-peak-hightemp"] = vMcaPeakHighTemp
    ret["mca-peak-maxwidth"] = vMcaPeakMaxWidth
    ret["mca-peak-cutoff"] = vMcaPeakCutoff
    updateServerData(uuid, JSON.stringify(ret))

    $('[href="#runMeltcurve-tab"]').tab('show')
}

// TODO client-side validation
function updateServerData(stat, reqData) {
    const formData = new FormData()
    if (stat == "example") {
        formData.append('showExample', 'showExample')
    } else if (stat == "linregpcr") {
        formData.append('showLinRegPCRExample', 'showLinRegPCRExample')
    } else if (stat == "meltcurve") {
        formData.append('showMeltcurveExample', 'showMeltcurveExample')
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
                        if (runs.length > 0) {
                            window.selRunOnLoad = runs[0].id;
                        }
                    }
                }
                if (res.data.data.hasOwnProperty("reactsdata")) {
                    window.reactData = res.data.data.reactsdata
                    if (window.reactData.adp_fluor_min < 0.0) {
                        createCorrAmpData()
                    }
                    if (window.reactData.hasOwnProperty("LinRegPCR_Result_Table")) {
                        window.baselineData = res.data.data.reactsdata
                        window.linRegPCRTable = JSON.parse(window.reactData.LinRegPCR_Result_Table)
                        for (var row = 0; row < window.linRegPCRTable.length; row++) {
                            var reactPos = window.linRegPCRTable[row][window.convertField["id"]]
                            if (!(window.reactToLinRegTable.hasOwnProperty(reactPos))) {
                                window.reactToLinRegTable[parseInt(reactPos)] = row
                            }
                        }
                        updateLinRegPCRTable()
                        if (window.reactData.hasOwnProperty("resultsLinRegPCRReport")) {
                            updateLinRegPCRReport(window.reactData.resultsLinRegPCRReport)
                        }
                        var bbUpdateRDML = document.getElementById('updateRDMLData')
                        if ((bbUpdateRDML) && (bbUpdateRDML.value == "y")){
                            window.reloadCurves = true;
                        }
                    }
                    if (window.reactData.hasOwnProperty("Meltcurve_Result_Table")) {
                        window.meltcurveData = res.data.data.reactsdata
                        window.meltcurveTable = JSON.parse(window.meltcurveData.Meltcurve_Result_Table)
                        for (var row = 0; row < window.meltcurveTable.length; row++) {
                            var reactPos = window.meltcurveTable[row][window.convertField["id"]]
                            if (!(window.reactToMeltcurveTable.hasOwnProperty(reactPos))) {
                                window.reactToMeltcurveTable[parseInt(reactPos)] = row
                            }
                        }
                        updateMeltingTable()
                        var bbUpdateRDML = document.getElementById('updateRDMLData')
                        if ((bbUpdateRDML) && (bbUpdateRDML.value == "y")){
                            window.reloadCurves = true;
                        }
                    }
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
                    resultError.innerHTML = err.replace("will result in wrong PCR efficiencies", 
                                                        "will result in wrong PCR efficiencies (<a href=\"" + 
                                                         `${API_LINK}` + 
                                                         "/help.html#LRP-Neg-Val-Warning\" target=\"_blank\">click to read more</a>)");
                }
                fillLookupDics()
                updateClientData()
                updateCorrectionTable()
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

function createCorrAmpData() {
    var reacts = window.reactData.reacts
    var globalMax = window.reactData.adp_fluor_max
    var fluor_max = Number.NEGATIVE_INFINITY
    var new_max = Number.NEGATIVE_INFINITY
    var new_min = Number.POSITIVE_INFINITY
    for (var reac = 0; reac < reacts.length; reac++) {
        for (var dataPos = 0; dataPos < reacts[reac].datas.length; dataPos++) {
            reacts[reac].datas[dataPos].cdps = []
            var curr_min = Number.POSITIVE_INFINITY
            for (var i = 0; i < reacts[reac].datas[dataPos].adps.length; i++) {
                var curr_fluor = parseFloat(reacts[reac].datas[dataPos].adps[i][1]);
                if (curr_fluor < curr_min) {
                    curr_min = curr_fluor
                }
            }
            var baseShift = 0.0
            if (curr_min < 0.0) {
                baseShift = (globalMax - curr_min) / 100.0 - curr_min
            }
            for (var i = 0; i < reacts[reac].datas[dataPos].adps.length; i++) {
                var curr_cyc = reacts[reac].datas[dataPos].adps[i][0];
                var curr_fluor = parseFloat(reacts[reac].datas[dataPos].adps[i][1]);
                reacts[reac].datas[dataPos].cdps.push([curr_cyc,curr_fluor + baseShift])
                if (curr_fluor + baseShift > new_max) {
                    new_max = curr_fluor + baseShift
                }
                if (curr_fluor + baseShift < new_min) {
                    new_min = curr_fluor + baseShift
                }
            }
        }
    }
    window.reactData.cdp_cyc_max = window.reactData.adp_cyc_max;
    window.reactData.cdp_fluor_min = new_min;
    window.reactData.cdp_fluor_max = new_max;
}


window.fillLookupDics = fillLookupDics
function fillLookupDics() {
    var exp = window.rdmlData.rdml.targets
    window.tarToDye = {}
    window.tarToNr = {}
    window.samToNr = {}
    window.samToType = {}
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
    if (!(window.rdmlData.hasOwnProperty("rdml"))) {
        return
    }
    var exp = window.rdmlData.rdml.experiments;
    if (window.selExperiment == "") {
        window.selExperiment = exp[0].id;
    }
    if (window.selRun == "") {
        var runs = exp[0].runs
        if (runs.length > 0) {
            window.selRunOnLoad = runs[0].id;
        }
    }
    if (window.selRunOnLoad != "") {
        window.selRun = window.selRunOnLoad
        if ((window.rdmlData.hasOwnProperty("rdml")) && (window.selExperiment != "") && (window.selRun != "")){
            var ret = {}
            ret["mode"] = "get-run-data"
            ret["sel-experiment"] = window.selExperiment
            ret["sel-run"] = window.selRun
            window.selRunOnLoad = ""
            updateServerData(uuid, JSON.stringify(ret))
        }
        return
    }
    if (window.reloadCurves == true) {
        var ret = {}
        ret["mode"] = "get-run-data"
        ret["sel-experiment"] = window.selExperiment
        ret["sel-run"] = window.selRun
        window.reloadCurves = false
        updateServerData(uuid, JSON.stringify(ret))
        return
    }
    if ((window.curveSource == "bas") && (window.linRegPCRTable.length < 1)) {
        window.curveSource = "adp"
    } else if ((["smo", "nrm", "fdm"].includes(window.curveSource)) && (window.meltcurveTable.length < 1)) {
        window.curveSource = "mdp"
    }

    // The UUID box
    var ret = '<br />' + createLinkBox(`${API_LINK}`, `${API_URL}`, 'runanalysis.html', window.uuid, window.isvalid, window.selExperiment, window.selRun);
    if (window.isvalid == "invalid") {
        resultError.innerHTML = '<i class="fas fa-fire"></i>\n<span id="error-message">' +
        'Error: Uploaded file is not valid RDML!</span>'
        showElement(resultError)
    }
    resultLink.innerHTML = ret

    ret = '<table style="width:100%;background-color: #e6e6e6;">'
    ret += '  <tr>\n    <td style="width:8%;">Experiment:</td>\n<td style="width:29%;">'
    ret += '  <select class="form-control" id="dropSelExperiment" onchange="updateExperimenter()">'
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
    ret += '    <td style="width:18%;"></td>\n</tr>\n'
    ret += '</table>\n'

    if (window.selPCRStyle == "classic") {
        ret += '<table style="width:100%;">'
        ret += '  <tr>\n    <td style="width:8%;">Data Source:</td>\n<td style="width:29%;">'
        ret += '  <select class="form-control" id="dropSelCurveSource" onchange="updateCurveSource()">'
        ret += '        <option value="adp"'
        if (window.curveSource == "adp") {
            ret += ' selected'
        }
        ret += '>Amplification - Raw Data</option>\n'
        if (window.reactData.adp_fluor_min < 0.0) {
            ret += '        <option value="cdp"'
            if (window.curveSource == "cdp") {
                ret += ' selected'
            }
            ret += '>Amplification - Scaled Negative Raw Data</option>\n'
        }
        if (window.linRegPCRTable.length > 0) {
            ret += '        <option value="bas"'
            if (window.curveSource == "bas") {
                ret += ' selected'
            }
            ret += '>Amplification - Baseline Corrected</option>\n'
        }
        ret += '        <option value="mdp"'
        if (window.curveSource == "mdp") {
            ret += ' selected'
        }
        ret += '>Meltcurve - Raw Data</option>\n'
        if (window.meltcurveTable.length > 0) {
            ret += '        <option value="smo"'
            if (window.curveSource == "smo") {
                ret += ' selected'
            }
            ret += '>Meltcurve - Smoothed</option>\n'
            ret += '        <option value="nrm"'
            if (window.curveSource == "nrm") {
                ret += ' selected'
            }
            ret += '>Meltcurve - Normalized</option>\n'
            ret += '        <option value="fdm"'
            if (window.curveSource == "fdm") {
                ret += ' selected'
            }
            ret += '>Meltcurve - First Derivative</option>\n'
        }
        ret += '  </select>\n'
        ret += '</td>\n'
        ret += '  <td style="width:4%;"></td>\n'
        ret += '  <td style="width:9%;">Color Coding:</td>\n<td style="width:28%;">'
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
        ret += '  <td style="width:5%;">Y-Axis:</td>\n<td style="width:13%;">'
        ret += '  <select class="form-control" id="dropSelYScale" onchange="updateYScale()">'
        ret += '        <option value="lin"'
        if (window.yScale == "lin") {
            ret += ' selected'
        }
        ret += '>Linear Scale</option>\n'
        ret += '        <option value="log"'
        if (window.yScale == "log") {
            ret += ' selected'
        }
        ret += '>Logarithmic Scale</option>\n'
        ret += '  </select>\n'
        ret += '</td>\n</tr>\n'
        ret += '</table>\n'
        ret += '<table style="width:100%;">'
        ret += '  <tr>\n    <td style="width:12%;">Select Sample by</td>\n<td style="width:25%;">'
        ret += '  <select class="form-control" id="dropSampSelFirst" onchange="updateSampSel(0)">'
        ret += '        <option value="7s8e45-Show-All"'
        if (window.sampSelFirst == "7s8e45-Show-All") {
            ret += ' selected'
        }
        ret += '>Show All</option>\n'
        ret += '        <option value="sample"'
        if (window.sampSelFirst == "sample") {
            ret += ' selected'
        }
        ret += '>Sample</option>\n'
        ret += '        <option value="target"'
        if (window.sampSelFirst == "target") {
            ret += ' selected'
        }
        ret += '>Target</option>\n'
        ret += '        <option value="dye_id"'
        if (window.sampSelFirst == "dye_id") {
            ret += ' selected'
        }
        ret += '>Dye by ID</option>\n'
        ret += '        <option value="dye_pos"'
        if (window.sampSelFirst == "dye_pos") {
            ret += ' selected'
        }
        ret += '>Dye by Position</option>\n'
        ret += '        <option value="excluded"'
        if (window.sampSelFirst == "excluded") {
            ret += ' selected'
        }
        ret += '>Excluded</option>\n'
        if (window.linRegPCRTable.length > 0 ) {
            ret += '        <option value="linRegPCR"'
            if (window.sampSelFirst == "linRegPCR") {
                ret += ' selected'
            }
            ret += '>Warnings by LinRegPCR</option>\n'
        }
        ret += '  </select>\n'
        ret += '</td>\n'
        ret += '  <td style="width:4%;"></td>\n'
        ret += '  <td style="width:9%;">and</td>\n'
        ret += '  <td style="width:28%;">'
        ret += '  <select class="form-control" id="dropSampSelSecond" onchange="updateSampSel(0)">'
        ret += '  </select>\n'
        ret += '</td>\n'
        ret += '<td style="width:4%;"></td>'
        ret += '<td style="width:5%;"></td>'
        ret += '  <td style="width:13%;">'
        ret += '  <select class="form-control" id="dropSampSelThird" onchange="updateSampSel(0)">'
        ret += '  </select>\n'
        ret += '</td>\n</tr>\n'
        ret += '</table>\n'
        ret += '<table style="width:100%;">'
        ret += '  <tr>\n    <td style="width:25%;">Maximal fluorescence range in Log view</td>\n<td style="width:12%;">'
        ret += '  <input type="text" class="form-control" id="text-max-log-range"'
        ret += ' value="' + window.maxLogRange + '" onchange="updateMinLogRange()">\n'
        ret += '</td>\n'
        ret += '  <td style="width:4%;"></td>\n'
        ret += '  <td style="width:9%;"></td>\n'
        ret += '  <td style="width:28%;">'
        ret += '</td>\n'
        ret += '<td style="width:4%;"></td>'
        ret += '<td style="width:5%;"></td>'
        ret += '  <td style="width:13%;">'
        ret += '    <button type="submit" class="btn btn-outline-primary" onclick="saveSVGFile()">'
        ret += '      <i class="far fa-save" style="margin-right: 5px;"></i>'
        ret += '        Save curves as SVG file'
        ret += '    </button>'
        ret += '</td>\n</tr>\n'
        ret += '</table>\n'
    }
    selectorsData.innerHTML = ret
    ret = ""

    if ((window.experimentPos > -1) && (window.runPos > -1) && (window.reactData.hasOwnProperty("reacts"))) {
        var reacts = window.reactData.reacts
        var the_run = exp[window.experimentPos].runs[window.runPos]
        var rows = parseInt(the_run.pcrFormat.rows)
        var columns = parseInt(the_run.pcrFormat.columns)
        var rowLabel = the_run.pcrFormat.rowLabel
        var columnLabel = the_run.pcrFormat.columnLabel
        if (window.selPCRStyle != "classic") {
            ret += '<a href="#" onclick="getDigitalOverviewFile()">Overview as table data (.tsv)</a><br /><br />'
        }
        ret += '<table id="rdmlPlateTab" style="width:100%;">'
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
                                cell = '  <td id="plateTab_' + id + '" style="font-size:0.7em;background-color:' + colo
                                cell += ';color:' + fon_col + ';" onclick="showReactSel(' + id + ', ' + dataPos + ')">'
                                cell += reacts[reac].sample + '<br />'
                                if ((reacts[reac].hasOwnProperty("datas")) &&
                                    (window.reactData.max_data_len > 0)) {
                                    cell += reacts[reac].datas[dataPos].tar + '<br />'
                                    cell += 'Cq: ' + reacts[reac].datas[dataPos].cq + '<br />'
                                } else {
                                    cell += '---<br />'
                                }
                                if ((reacts[reac].hasOwnProperty("datas")) &&
                                    (window.reactData.max_data_len > 0) &&
                                    (reacts[reac].datas[dataPos].hasOwnProperty("corrNcopy"))) {
                                    cell += 'Ncopy: ' + floatWithFixPrec(reacts[reac].datas[dataPos].corrNcopy, 2) + '</td>'
                                } else {
                                    cell += '---</td>'
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
                                    cell = '  <td id="plateTab_' + id + '" style="font-size:0.8em;background-color:'
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

        if ((window.reactData.max_data_len > 0) && (window.selPCRStyle == "classic")) {
            var finRet = '        <div class="container">'
            finRet += '          <div class="row">'
            finRet += '            <div class="col" id="plate-data">' + ret + '</div>'
            finRet += '            <div class="col" id="curves-data"></div>'
            finRet += '          </div>'
            finRet += '          <div class="row">'
            finRet += '            <div class="col" id="edit-notes"></div>'
            finRet += '          </div>'
            finRet += '        </div>'
            resultData.innerHTML = finRet;

            if (window.curveSource == "adp") {
                window.winXmin = 0;
                window.winXmax = window.reactData.adp_cyc_max;
                window.winYmin = window.reactData.adp_fluor_min;
                window.winYmax = window.reactData.adp_fluor_max;
            } else if (window.curveSource == "cdp") {
                window.winXmin = 0;
                window.winXmax = window.reactData.cdp_cyc_max;
                window.winYmin = window.reactData.cdp_fluor_min;
                window.winYmax = window.reactData.cdp_fluor_max;
            } else if (window.curveSource == "bas") {
                window.winXmin = 0;
                window.winXmax = window.baselineData.bas_cyc_max;
                window.winYmin = window.baselineData.bas_fluor_min;
                window.winYmax = window.baselineData.bas_fluor_max;
            } else if (window.curveSource == "smo") {
                window.winXmin = window.meltcurveData.smo_temp_min;
                window.winXmax = window.meltcurveData.smo_temp_max;
                window.winYmin = window.meltcurveData.smo_fluor_min;
                window.winYmax = window.meltcurveData.smo_fluor_max;
            } else if (window.curveSource == "nrm") {
                window.winXmin = window.meltcurveData.nrm_temp_min;
                window.winXmax = window.meltcurveData.nrm_temp_max;
                window.winYmin = window.meltcurveData.nrm_fluor_min;
                window.winYmax = window.meltcurveData.nrm_fluor_max;
            } else if (window.curveSource == "fdm") {
                window.winXmin = window.meltcurveData.fdm_temp_min;
                window.winXmax = window.meltcurveData.fdm_temp_max;
                window.winYmin = window.meltcurveData.fdm_fluor_min;
                window.winYmax = window.meltcurveData.fdm_fluor_max;
            } else {
                window.winXmin = window.reactData.mdp_tmp_min;
                window.winXmax = window.reactData.mdp_tmp_max;
                window.winYmin = window.reactData.mdp_fluor_min;
                window.winYmax = window.reactData.mdp_fluor_max;
            }
            showSVG();
            showEditNotes();
        } else {
            resultData.innerHTML = ret
        }
    } else {
        resultData.innerHTML = ret
    }

    if (window.fixCurves == true) {
        window.fixCurves = false
        updateSampSel(2)
        window.sampSelThird = "7s8e45-Show-All"
        updateSampSel(0)
    } else {
        updateSampSel(1)
    }
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

window.floatWithFixPrec = floatWithFixPrec
function floatWithFixPrec(val, prec) {
    var ret = "";
    if (val == "") {
        return "";
    }
    if (isNaN(parseFloat(val))) {
        return "";
    }
    ret += String(parseFloat(val).toFixed(prec));
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

function updateLinRegPCRReport(inText) {
    var textEle = document.getElementById('report-linregpcr');
    if (textEle) {
        var modText = inText.replace(/\n/, "<br /><br />"); 
        textEle.innerHTML = "<p>" + modText + "</p>";
    }
}

window.updateLinRegPCRTable = updateLinRegPCRTable
function updateLinRegPCRTable() {
    if (window.linRegPCRTable.length < 1) {
        return
    }

    var annoTab = [];
    var allUsedSamples = {};

    var cv = window.convertField;
    if (choiceAnnotations.value  == "y") {
        // Collect the samples
        var allUsedSamples = {};
        for (var row = 1; row < window.linRegPCRTable.length; row++) {
            allUsedSamples[window.linRegPCRTable[row][cv["sample"]]] = 1
        }
        // Collect the properties
        var allUsedProperties = {};
        var allSamples = window.rdmlData.rdml.samples
        for (var samp = 0; samp < allSamples.length; samp++) {
            if (allSamples[samp].id in allUsedSamples) {
                for (var prop = 0; prop < allSamples[samp].annotations.length; prop++) {
                    allUsedProperties[allSamples[samp].annotations[prop].property] = 1
                }
            }
        }
        var allProperties = Object.keys(allUsedProperties)
        allProperties.sort()
        annoTab = [allProperties];
        // Fill empty table
        var tempInnerTab = [];
        var lookupAnnotationKey = {};
        for (var col = 0; col < allProperties.length; col++) {
            tempInnerTab.push("");
            lookupAnnotationKey[allProperties[col]] = col;
        }
        for (var row = 1; row < window.linRegPCRTable.length; row++) {
            annoTab.push(JSON.parse(JSON.stringify(tempInnerTab)));
        }
        // Overwrite with the values
        for (var samp = 0; samp < allSamples.length; samp++) {
            if (allSamples[samp].id in allUsedSamples) {
                var filledTab = JSON.parse(JSON.stringify(tempInnerTab));
                for (var prop = 0; prop < allSamples[samp].annotations.length; prop++) {
                    filledTab[lookupAnnotationKey[allSamples[samp].annotations[prop].property]] = allSamples[samp].annotations[prop].value
                }
                for (var row = 1; row < window.linRegPCRTable.length; row++) {
                    if (window.linRegPCRTable[row][cv["sample"]] == allSamples[samp].id) {
                        annoTab[row] = filledTab
                    }
                }
            }
        }

    }

    var content = "";
    var htmlTag = 'td';
    var ret = '<table class="table table-bordered table-striped" id="LinRegPCR_Result_Table"><thead style=\"position: sticky;top: 0\">\n'
    if (choiceTable.value == "debug") {
        for (var row = 0; row < window.linRegPCRTable.length; row++) {
            if (row == 0) {
                ret += '<tr>\n'
                htmlTag = 'th'
            } else {
                ret += "<tr ondblclick='window.clickSampSel(\"" + window.linRegPCRTable[row][cv["target"]]
                ret += "\", \"" + window.linRegPCRTable[row][cv["id"]] + "\")'> \n"
                htmlTag = 'td'
            }
            for (var col = 0; col < window.linRegPCRTable[row].length; col++) {
                if (col < 9) {
                    content += window.linRegPCRTable[row][col] + "\t"
                    ret += '<' + htmlTag + '>' + window.linRegPCRTable[row][col] + '</' + htmlTag + '>\n'
                } else {
                    content += NumPoint(window.linRegPCRTable[row][col]) + "\t"
                    ret += '<' + htmlTag + '>' + NumPoint(window.linRegPCRTable[row][col]) + '</' + htmlTag + '>\n'
                }
            }
            content = content.replace(/\t$/g, "\n");
            ret += '</tr>\n'
            if (row == 0) {
                ret += '</thead>\n<tbody>\n'
            }
        }
    } else if (choiceTable.value == "extended") {
        for (var row = 0; row < window.linRegPCRTable.length; row++) {
            var highlight_nInLog = ""
            var highlight_indivPCREff = ""
            var highlight_nIncluded = ""
            var highlight_meanPCREff = ""
            var highlight_Cq = ""
            var highlight_Ncopy = ""
            var highlight_ErrAmp = ""
            var highlight_ErrBase = ""
            var highlight_ErrInstab = ""
            var highlight_ErrPlat = ""
            var highlight_ErrNoisy = ""
            var highlight_ErrEffOutside = ""

            var colWarn = ' style="background-color: #ffc266"'
            var colErr = ' style="background-color: #ff5c33"'

            var cqValue = -1.0;
            if (window.linRegPCRTable[row][cv["Cq"]] != "") {
                cqValue = parseFloat(window.linRegPCRTable[row][cv["Cq"]])
            }

            // Similar to rdml.py
            if (["ntc", "nac", "ntp", "nrt"].includes(window.linRegPCRTable[row][cv["sample type"]])) {
                if (cqValue > 0.0) {
                    highlight_Cq = colErr
                    highlight_Ncopy = colErr
                    if (window.linRegPCRTable[row][cv["amplification"]] == true) {
                        highlight_ErrAmp = colErr
                    }
                    if (window.linRegPCRTable[row][cv["plateau"]] == true) {
                        highlight_ErrPlat = colErr
                    }
                    if (window.linRegPCRTable[row][cv["excl PCR efficiency"]] == false) {
                        highlight_ErrEffOutside = colErr
                        highlight_meanPCREff = colWarn
                        highlight_indivPCREff = colWarn
                    }
                } else {
                    if (window.linRegPCRTable[row][cv["amplification"]] == true) {
                        highlight_ErrAmp = colWarn
                    }
                    if (window.linRegPCRTable[row][cv["plateau"]] == true) {
                        highlight_ErrPlat = colWarn
                    }
                    if (window.linRegPCRTable[row][cv["excl PCR efficiency"]] == false) {
                        highlight_ErrEffOutside = colWarn
                        highlight_meanPCREff = colWarn
                        highlight_indivPCREff = colWarn
                    }
                }
            }
            if (["std", "pos"].includes(window.linRegPCRTable[row][cv["sample type"]])) {
                if (parseInt(window.linRegPCRTable[row][cv["n in log phase"]]) < 5) {
                    highlight_nInLog = colWarn
                }
                if (parseFloat(window.linRegPCRTable[row][cv["indiv PCR eff"]]) < 1.7) {
                    highlight_indivPCREff = colWarn
                }
                if (cqValue > 34.0) {
                    highlight_Cq = colWarn
                    highlight_Ncopy = colWarn
                }
                if ((cqValue > -0.001) && (cqValue < 10.0)) {
                    highlight_Cqhighlight_Cq = colWarn
                    highlight_Ncopy = colWarn
                }

                if (!(cqValue > 0.0)) {
                    highlight_Cq = colErr
                    highlight_Ncopy = colErr
                    if (window.linRegPCRTable[row][cv["amplification"]] == false) {
                        highlight_ErrAmp = colErr
                    }
                    if (window.linRegPCRTable[row][cv["baseline error"]] == true) {
                        highlight_ErrBase = colErr
                    }
                    if (window.linRegPCRTable[row][cv["instable baseline"]] == true) {
                        highlight_ErrInstab = colErr
                    }
                    if (window.linRegPCRTable[row][cv["plateau"]] == false) {
                        highlight_ErrPlat = colErr
                    }
                    if (window.linRegPCRTable[row][cv["noisy sample"]] == true) {
                        highlight_ErrNoisy = colErr
                    }
                    if (window.linRegPCRTable[row][cv["excl PCR efficiency"]] == true) {
                        highlight_ErrEffOutside = colErr
                        highlight_meanPCREff = colWarn
                        highlight_indivPCREff = colWarn
                    }
                } else {
                    if (window.linRegPCRTable[row][cv["amplification"]] == false) {
                        highlight_ErrAmp = colWarn
                    }
                    if (window.linRegPCRTable[row][cv["baseline error"]] == true) {
                        highlight_ErrBase = colWarn
                    }
                    if (window.linRegPCRTable[row][cv["instable baseline"]] == true) {
                        highlight_ErrInstab = colWarn
                    }
                    if (window.linRegPCRTable[row][cv["plateau"]] == false) {
                        highlight_ErrPlat = colWarn
                    }
                    if (window.linRegPCRTable[row][cv["noisy sample"]] == true) {
                        highlight_ErrNoisy = colWarn
                    }
                    if (window.linRegPCRTable[row][cv["excl PCR efficiency"]] == true) {
                        highlight_ErrEffOutside = colWarn
                        highlight_meanPCREff = colWarn
                        highlight_indivPCREff = colWarn
                    }
                }
            }
            if (window.linRegPCRTable[row][cv["sample type"]] == "unkn") {
                if (parseInt(window.linRegPCRTable[row][cv["n in log phase"]]) < 5) {
                    highlight_nInLog = colWarn
                }
                if (parseFloat(window.linRegPCRTable[row][cv["indiv PCR eff"]]) < 1.7) {
                    highlight_indivPCREff = colWarn
                }
                if (cqValue > 34.0) {
                    highlight_Cq = colWarn
                    highlight_Ncopy = colWarn
                }
                if ((cqValue > -0.001) && (cqValue < 10.0)) {
                    highlight_Cq = colWarn
                    highlight_Ncopy = colWarn
                }
                if (window.linRegPCRTable[row][cv["amplification"]] == false) {
                    highlight_ErrAmp = colWarn
                }
                if (window.linRegPCRTable[row][cv["baseline error"]] == true) {
                    highlight_ErrBase = colWarn
                }
                if (window.linRegPCRTable[row][cv["instable baseline"]] == true) {
                    highlight_ErrInstab = colWarn
                }
                if (window.linRegPCRTable[row][cv["plateau"]] == false) {
                    highlight_ErrPlat = colWarn
                }
                if (window.linRegPCRTable[row][cv["noisy sample"]] == true) {
                    highlight_ErrNoisy = colWarn
                }
                if (window.linRegPCRTable[row][cv["excl PCR efficiency"]] == true) {
                    highlight_ErrEffOutside = colWarn
                    highlight_meanPCREff = colWarn
                    highlight_indivPCREff = colWarn
                }
            }

            if (row == 0) {
                ret += '<tr>\n'
                htmlTag = 'th'
            } else {
                ret += "<tr ondblclick='window.clickSampSel(\"" + window.linRegPCRTable[row][cv["target"]]
                ret += "\", \"" + window.linRegPCRTable[row][cv["id"]] + "\")'> \n"
                htmlTag = 'td'
            }
            for (var col = 0; col < 6; col++) { // "id" - "target"
                if (col == 4) {
                    continue
                }
                ret += '<' + htmlTag + '>' + window.linRegPCRTable[row][col] + '</' + htmlTag + '>\n'
                content += window.linRegPCRTable[row][col] + "\t"
            }
            if (choiceAnnotations.value  == "y") {
                for (var col = 0; col < annoTab[row].length; col++) {
                    if (row == 0) {
                        ret += '<th>annotation ' + annoTab[row][col] + '</th>\n'
                        content += 'annotation ' + annoTab[row][col] + "\t"
                    } else {
                        ret += '<td>' + annoTab[row][col] + '</td>\n'
                        content += annoTab[row][col] + "\t"
                    }
                }
            }
            if (row == 0) {
                ret += '<th>' + window.linRegPCRTable[row][cv["excluded"]] + '</thh>\n'
            } else {
                var brForm = window.linRegPCRTable[row][cv["excluded"]].replace(/;/g, ";<br />")
                var colorNotes = ''
                if (brForm != "") {
                    colorNotes = colErr
                }
                ret += '<td' + colorNotes + '>' + brForm + '</td>\n'
            }
            content += window.linRegPCRTable[row][cv["excluded"]] + "\t"
            if (row == 0) {
                ret += '<th>' + window.linRegPCRTable[row][cv["note"]] + '</thh>\n'
            } else {
                var brForm = window.linRegPCRTable[row][cv["note"]].replace(/;/g, ";<br />")
                var colorNotes = ''
                if (brForm != "") {
                    colorNotes = colWarn
                }
                ret += '<td' + colorNotes + '>' + brForm + '</td>\n'
            }
            content += window.linRegPCRTable[row][cv["note"]] + "\t"
            if (row == 0) {
                ret += '<th>' + window.linRegPCRTable[row][cv["plateau / baseline"]] + '</th>\n'
            } else {
                ret += '<td>' + floatWithPrec(window.linRegPCRTable[row][cv["plateau / baseline"]], 10) + '</td>\n'
            }
            content += NumPoint(window.linRegPCRTable[row][cv["plateau / baseline"]]) + "\t"
            if (row == 0) {
                ret += '<th>' + window.linRegPCRTable[row][cv["n in log phase"]] + '</th>\n'
            } else {
                ret += '<td' + highlight_nInLog + '>' + window.linRegPCRTable[row][cv["n in log phase"]] + '</td>\n'
            }
            content += NumPoint(window.linRegPCRTable[row][cv["n in log phase"]]) + "\t"
            if (row == 0) {
                ret += '<th>' + window.linRegPCRTable[row][cv["n included"]] + '</th>\n'
            } else {
                ret += '<td' + highlight_nIncluded + '>' + window.linRegPCRTable[row][cv["n included"]] + '</td>\n'
            }
            content += NumPoint(window.linRegPCRTable[row][cv["n included"]]) + "\t"
            if (row == 0) {
                ret += '<th>' + window.linRegPCRTable[row][cv["indiv PCR eff"]] + '</th>\n'
            } else {
                ret += '<td' + highlight_indivPCREff + '>'
                ret += floatWithPrec(window.linRegPCRTable[row][cv["indiv PCR eff"]], 1000) + '</td>\n'
            }
            content += NumPoint(window.linRegPCRTable[row][cv["indiv PCR eff"]]) + "\t"
            if (row == 0) {
                ret += '<th>mean PCR eff</th>\n'
                content += "mean PCR eff\t"
            } else {
                ret += '<td' + highlight_meanPCREff + '>'
                ret += floatWithPrec(window.linRegPCRTable[row][cv["PCR eff"]], 1000) + '</td>\n'
                content += NumPoint(window.linRegPCRTable[row][cv["PCR eff"]]) + "\t"
            }
            if (row == 0) {
                ret += '<th>standard error of mean PCR eff</th>\n'
                content += "standard error of mean PCR eff\t"
            } else {
                ret += '<td' + highlight_meanPCREff + '>'
                ret += floatWithPrec(window.linRegPCRTable[row][cv["standard error of PCR eff"]], 1000) + '</td>\n'
                content += NumPoint(window.linRegPCRTable[row][cv["standard error of PCR eff"]]) + "\t"
            }
            if (row == 0) {
                ret += '<th>Cq</th>\n'
                content += "Cq\t"
            } else {
                ret += '<td' + highlight_Cq + '>'
                ret += floatWithPrec(window.linRegPCRTable[row][cv["Cq"]], 1000) + '</td>\n'
                content += NumPoint(window.linRegPCRTable[row][cv["Cq"]]) + "\t"
            }
            if (row == 0) {
                ret += '<th>Ncopy</th>\n'
                content += "Ncopy\t"
            } else {
                ret += '<td' + highlight_Ncopy + '>'
                ret += floatWithPrec(window.linRegPCRTable[row][cv["Ncopy"]], 100) + '</td>\n'
                content += NumPoint(window.linRegPCRTable[row][cv["Ncopy"]]) + "\t"
            }
            if (row == 0) {
                ret += '<th>' + window.linRegPCRTable[row][cv["amplification"]] + '</th>\n'
                content += window.linRegPCRTable[row][cv["amplification"]] + "\t"
            } else {
                ret += '<td' + highlight_ErrAmp + '>'
                if (window.linRegPCRTable[row][cv["amplification"]] == true) {
                    ret += 'Yes</td>\n'
                    content += "Yes\t"
                } else {
                    ret += 'No</td>\n'
                    content += "No\t"
                }
            }
            if (row == 0) {
                ret += '<th>' + window.linRegPCRTable[row][cv["baseline error"]] + '</th>\n'
                content += window.linRegPCRTable[row][cv["baseline error"]] + "\t"
            } else {
                ret += '<td' + highlight_ErrBase + '>'
                if (window.linRegPCRTable[row][cv["baseline error"]] == true) {
                    ret += 'Yes</td>\n'
                    content += "Yes\t"
                } else {
                    ret += 'No</td>\n'
                    content += "No\t"
                }
            }
            if (row == 0) {
                ret += '<th>' + window.linRegPCRTable[row][cv["instable baseline"]] + '</th>\n'
                content += window.linRegPCRTable[row][cv["instable baseline"]] + "\t"
            } else {
                ret += '<td' + highlight_ErrInstab + '>'
                if (window.linRegPCRTable[row][cv["instable baseline"]] == true) {
                    ret += 'Yes</td>\n'
                    content += "Yes\t"
                } else {
                    ret += 'No</td>\n'
                    content += "No\t"
                }
            }
            if (row == 0) {
                ret += '<th>' + window.linRegPCRTable[row][cv["plateau"]] + '</th>\n'
                content += window.linRegPCRTable[row][cv["plateau"]] + "\t"
            } else {
                ret += '<td' + highlight_ErrPlat + '>'
                if (window.linRegPCRTable[row][cv["plateau"]] == true) {
                    ret += 'Yes</td>\n'
                    content += "Yes\t"
                } else {
                    ret += 'No</td>\n'
                    content += "No\t"
                }
            }
            if (row == 0) {
                ret += '<th>' + window.linRegPCRTable[row][cv["noisy sample"]] + '</th>\n'
                content += window.linRegPCRTable[row][cv["noisy sample"]] + "\t"
            } else {
                ret += '<td' + highlight_ErrNoisy + '>'
                if (window.linRegPCRTable[row][cv["noisy sample"]] == true) {
                    ret += 'Yes</td>\n'
                    content += "Yes\t"
                } else {
                    ret += 'No</td>\n'
                    content += "No\t"
                }
            }
            if (row == 0) {
                ret += '<th>' + window.linRegPCRTable[row][cv["excl PCR efficiency"]] + '</th>\n'
                content += window.linRegPCRTable[row][cv["excl PCR efficiency"]] + "\t"
            } else {
                ret += '<td' + highlight_ErrEffOutside + '>'
                if (window.linRegPCRTable[row][cv["excl PCR efficiency"]] == true) {
                    ret += 'Yes</td>\n'
                    content += "Yes\t"
                } else {
                    ret += 'No</td>\n'
                    content += "No\t"
                }
            }
            if (row == 0) {
                ret += '<th>' + window.linRegPCRTable[row][cv["used for W-o-L setting"]] + '</th>\n'
                content += window.linRegPCRTable[row][cv["used for W-o-L setting"]] + "\t"
            } else {
                if (window.linRegPCRTable[row][cv["used for W-o-L setting"]] == true) {
                    ret += '<td>Yes</td>\n'
                    content += "Yes\t"
                } else {
                    ret += '<td style="background-color: #ffc266;">No</td>\n'
                    content += "No\t"
                }
            }

            content = content.replace(/\t$/g, "\n");
            ret += '</tr>\n'
            if (row == 0) {
                ret += '</thead>\n<tbody>\n'
            }
        }
    }
    ret += '</tbody>\n</table>\n'
    window.linRegSaveTable = content
    resultLinRegPCR.innerHTML = ret
}


window.updateCorrectionTable = updateCorrectionTable
function updateCorrectionTable() {
    var ele = document.getElementById('correction-handle-tab')
    ele.style.display = "none";
    resultCorrection.innerHTML = ""
    window.correctionSaveTable = ""
    if (window.reactData.hasOwnProperty("anyCalcCorrections")) {
        if (window.reactData.anyCalcCorrections > 0) {
            ele.style.display = "inline";
            if ((window.experimentPos > -1) && (window.runPos > -1) && (window.reactData.hasOwnProperty("reacts"))) {
                var ret = '<table class="table table-bordered table-striped" id="Correction_Result_Table"><thead style=\"position: sticky;top: 0\">\n'
                var pcrFormat = window.rdmlData.rdml.experiments[window.experimentPos].runs[window.runPos].pcrFormat
                var rows = parseInt(pcrFormat.rows)
                var columns = parseInt(pcrFormat.columns)
                var rowLabel = pcrFormat.rowLabel
                var columnLabel = pcrFormat.columnLabel
                ret += '<tr><th>id</th><th>well</th><th>sample</th><th>target</th>'
                ret += '<th style="width: 180px;">excluded</th><th style="width: 180px;">note</th><th>PCR efficiency</th>'
                ret += '<th>corrected Cq</th><th>corrected N0</th><th>corrected Ncopy</th><th>correction factor</th>'
                ret += '<th>observed Cq</th><th>observed N0</th><th>observed Ncopy</th></tr></thead><tbody>\n'
                var content = 'id\twell\tsample\ttarget\texcluded\tnote\tPCR efficiency\tcorrected Cq\tcorrected N0\t'
                content += 'corrected Ncopy\tcorrection factor\tobserved Cq\tobserved N0\tobserved Ncopy\n'
                for (var id = 1; id < rows * columns + 1; id++) {
                    for (var reac = 0; reac < window.reactData.reacts.length; reac++) {
                        var react = window.reactData.reacts[reac]
                        if (parseInt(react.id) == id) {
                            for (var dat = 0; dat < react.datas.length; dat++) {
                                var dataS = react.datas[dat]
                                ret += '<tr><td>' + id + '</td><td>'
                                content += id + '\t'
                                var calcCol = (id - 1) % columns
                                var calcRow = (id - 1) / columns
                                var wellID = ""
                                if (rowLabel == "123") {
                                    wellID += (calcRow + 1)
                                } else if (rowLabel == "ABC") {
                                    wellID += String.fromCharCode('A'.charCodeAt(0) + calcRow)
                                }
                                if (columnLabel == "123") {
                                    wellID += (calcCol + 1)
                                } else if (columnLabel == "ABC") {
                                    wellID += String.fromCharCode('A'.charCodeAt(0) + calcCol)
                                }
                                ret += wellID + '</td><td>' + react.sample + '</td><td style="width: 180px;">'
                                content += wellID + '\t' + react.sample + '\t'
                                ret += dataS.tar + '</td><td style="width: 180px;">'
                                content += dataS.tar + '\t'
                                if (dataS.hasOwnProperty("excl")) {
                                    ret += dataS.excl + '</td><td style="width: 180px;">'
                                    content += dataS.excl + '\t'
                                } else {
                                    ret += '</td><td style="width: 180px;">'
                                    content += '\t'
                                }
                                if (dataS.hasOwnProperty("note")) {
                                    ret += dataS.note + '</td><td>'
                                    content += dataS.note + '\t'
                                } else {
                                    ret += '</td><td>'
                                    content += '\t'
                                }
                                if (dataS.hasOwnProperty("ampEff")) {
                                    ret += NumPoint(dataS.ampEff) + '</td><td>'
                                    content += NumPoint(dataS.ampEff) + '\t'
                                } else {
                                    ret += '</td><td>'
                                    content += '\t'
                                }
                                if (dataS.hasOwnProperty("corrNcopy")) {
                                    var corrCq = -1.0;
                                    if (parseFloat(dataS.corrNcopy) > 0.0) {
                                        corrCq = Math.log2(copyThreshold / parseFloat(dataS.corrNcopy));
                                    }
                                    ret += NumPoint(corrCq) + '</td><td>'
                                    content += NumPoint(corrCq) + '\t'
                                } else {
                                    ret += '</td><td>'
                                    content += '\t'
                                }
                                if (dataS.hasOwnProperty("corrN0")) {
                                    ret += NumPoint(dataS.corrN0) + '</td><td>'
                                    content += NumPoint(dataS.corrN0) + '\t'
                                } else {
                                    ret += '</td><td>'
                                    content += '\t'
                                }
                                if (dataS.hasOwnProperty("corrNcopy")) {
                                    ret += NumPoint(dataS.corrNcopy) + '</td><td>'
                                    content += NumPoint(dataS.corrNcopy) + '\t'
                                } else {
                                    ret += '</td><td>'
                                    content += '\t'
                                }
                                if (dataS.hasOwnProperty("corrF")) {
                                    ret += NumPoint(dataS.corrF) + '</td><td>'
                                    content += NumPoint(dataS.corrF) + '\t'
                                } else {
                                    ret += '</td><td>'
                                    content += '\t'
                                }
                                if (dataS.hasOwnProperty("cq")) {
                                    ret += NumPoint(dataS.cq) + '</td><td>'
                                    content += NumPoint(dataS.cq) + '\t'
                                } else {
                                    ret += '</td><td>'
                                    content += '\t'
                                }
                                if (dataS.hasOwnProperty("N0")) {
                                    ret += NumPoint(dataS.N0) + '</td><td>'
                                    content += NumPoint(dataS.N0) + '\t'
                                } else {
                                    ret += '</td><td>'
                                    content += '\t'
                                }
                                if (dataS.hasOwnProperty("Ncopy")) {
                                    ret += NumPoint(dataS.Ncopy) + '</td></tr>\n'
                                    content += NumPoint(dataS.Ncopy) + '\n'
                                } else {
                                    ret += '</td><td>\n'
                                    content += '\n'
                                }
                            }
                        }
                    }
                }
                ret += '</tbody>\n</table>\n'
                resultCorrection.innerHTML = ret
                window.correctionSaveTable = content
            }
        }
    }
}


window.updateMeltingTable = updateMeltingTable
function updateMeltingTable() {
    if (window.meltcurveTable.length < 1) {
        return
    }

    var content = "";
    var colGood = ' style="background-color: #00cc00"'
    var colWarn = ' style="background-color: #ffc266"'
    var colErr = ' style="background-color: #ff5c33"'
    var warnMesA = "no product with expected melting temperature"
    var warnMesB =  "several products with different melting temperatures detected"
    var warnMesC =  "product detected in negative control"

    var htmlTag = 'td';
    var ret = '<table class="table table-bordered table-striped" id="Meltcurve_Result_Table"><thead style=\"position: sticky;top: 0\">\n'
    if (choiceMeltTable.value == "debug") {
        for (var row = 0; row < window.meltcurveTable.length; row++) {
            if (row == 0) {
                ret += '<tr>\n'
                htmlTag = 'th'
            } else {
                ret += "<tr ondblclick='window.clickSampSel(\"" + window.meltcurveTable[row][window.convertField["target"]]
                ret += "\", \"" + window.meltcurveTable[row][window.convertField["id"]] + "\")'> \n"
                htmlTag = 'td'
            }
            for (var col = 0; col < window.meltcurveTable[row].length; col++) {
                if (col < 7) {
                    content += window.meltcurveTable[row][col] + "\t"
                    ret += '<' + htmlTag + '>' + window.meltcurveTable[row][col] + '</' + htmlTag + '>\n'
                } else {
                    content += NumPoint(window.meltcurveTable[row][col]) + "\t"
                    ret += '<' + htmlTag + '>' + NumPoint(window.meltcurveTable[row][col]) + '</' + htmlTag + '>\n'
                }
            }
            content = content.replace(/\t$/g, "\n");
            ret += '</tr>\n'
            if (row == 0) {
                ret += '</thead>\n<tbody>\n'
            }
        }
    } else {
        for (var row = 0; row < window.meltcurveTable.length; row++) {
            // Del the average line
            if (window.meltcurveTable[row][3].includes("Average")) {
                continue
            }
            if (row == 0) {
                ret += '<tr>\n'
                htmlTag = 'th'
            } else {
                ret += "<tr ondblclick='window.clickSampSel(\"" + window.meltcurveTable[row][window.convertField["target"]]
                ret += "\", \"" + window.meltcurveTable[row][window.convertField["id"]] + "\")'> \n"
                htmlTag = 'td'
            }
            var goodTemp = 0.0
            var currCol = "";
            for (var col = 0; col < window.meltcurveTable[row].length; col++) {
                if ((row == 0) && (col < 12)) {
                    content += window.meltcurveTable[row][col] + "\t"
                    ret += '<' + htmlTag + '>' + window.meltcurveTable[row][col] + '</' + htmlTag + '>\n'
                } else if (col < 7) {
                    content += window.meltcurveTable[row][col] + "\t"
                    ret += '<' + htmlTag + '>' + window.meltcurveTable[row][col] + '</' + htmlTag + '>\n'
                } else if (col < 8) {
                    var editLink = NumPoint(window.meltcurveTable[row][col])
                    content += NumPoint(window.meltcurveTable[row][col]) + "\t"
                    if ((window.meltcurveTable[row][3].includes("Average")) && (editLink == "")) {
                        currCol = ""
                        if (["1.3", "1.4"].includes(window.rdmlData.rdml.version)) {
                            editLink = '<a href="' + `${API_LINK}` + "edit.html?UUID=" + window.uuid
                            editLink += ';TAB=targets-tab;EDITMODE=on" target="_blank">Edit Tm</a>\n'
                        }
                    }
                    ret += '<' + htmlTag + '>' + editLink + '</' + htmlTag + '>\n'
                } else if (col < 9) {
                    content += floatWithPrec(window.meltcurveTable[row][col], 100) + "\t"
                    currCol = colGood
                    if (window.meltcurveTable[row][6].includes(warnMesA)) {
                        currCol = colWarn
                    }
                    if (window.meltcurveTable[row][6].includes(warnMesB)) {
                        currCol = colWarn
                    }
                    if (window.meltcurveTable[row][5].includes(warnMesA)) {
                        currCol = colErr
                    }
                    if (window.meltcurveTable[row][5].includes(warnMesB)) {
                        currCol = colErr
                    }
                    if (window.meltcurveTable[row][5].includes(warnMesC)) {
                        currCol = colErr
                    }
                    if (window.meltcurveTable[row][3].includes("Average")) {
                        currCol = ""
                    }
                    goodTemp = floatWithPrec(window.meltcurveTable[row][col], 100)
                    if (goodTemp == "") {
                        currCol = ""
                    }
                    ret += '<' + htmlTag + '' + currCol + '>' + goodTemp + '</' + htmlTag + '>\n'
                } else if (col < 10) {
                    content += floatWithPrec(window.meltcurveTable[row][col], 100) + "\t"
                    ret += '<' + htmlTag + '>' + floatWithPrec(window.meltcurveTable[row][col], 100) + '</' + htmlTag + '>\n'
                } else if (col < 12) {
                    content += floatWithPrec(window.meltcurveTable[row][col], 1000000) + "\t"
                    ret += '<' + htmlTag + '>' + floatWithPrec(window.meltcurveTable[row][col], 1000000) + '</' + htmlTag + '>\n'
                } else {
                    var subCol = (col - 16) % 9;
                    if ((row == 0) && (subCol >= 0) && (subCol < 4)) {
                        currCol = "";
                        content += window.meltcurveTable[row][col] + "\t"
                        ret += '<' + htmlTag + '>' + window.meltcurveTable[row][col] + '</' + htmlTag + '>\n'
                    } else if ((subCol >= 0) && (subCol < 2)) {
                        var currTemp = floatWithPrec(window.meltcurveTable[row][col], 100)
                        if (goodTemp == currTemp) {
                            currCol = colGood
                        } else {
                            currCol = colWarn
                        }
                        if (currTemp == "") {
                            currCol = ""
                        }
                        if (window.meltcurveTable[row][3].includes("Average")) {
                            currCol = ""
                        }
                        content += currTemp + "\t"
                        ret += '<' + htmlTag + '' + currCol + '>' + currTemp + '</' + htmlTag + '>\n'
                    } else if ((subCol >= 0) && (subCol < 3)) {
                        content += floatWithPrec(window.meltcurveTable[row][col], 100) + "\t"
                        ret += '<' + htmlTag + '' + currCol + '>' + floatWithPrec(window.meltcurveTable[row][col], 100) + '</' + htmlTag + '>\n'
                    } else if ((subCol >= 0) && (subCol < 4)) {
                        content += floatWithPrec(window.meltcurveTable[row][col], 1000000) + "\t"
                        ret += '<' + htmlTag + '' + currCol + '>' + floatWithPrec(window.meltcurveTable[row][col], 1000000) + '</' + htmlTag + '>\n'
                    }
                }
            }
            content = content.replace(/\t$/g, "\n");
            ret += '</tr>\n'
            if (row == 0) {
                ret += '</thead>\n<tbody>\n'
            }
        }
    }

    ret += '</tbody>\n</table>\n'
    window.meltcurveSaveTable = content
    resultMeltcurve.innerHTML = ret
}

window.saveTabLinRegPCR = saveTabLinRegPCR;
function saveTabLinRegPCR() {
    saveTabFile("LinRegPCR.tsv", window.linRegSaveTable)
    return;
};

window.saveTabMeltcurve = saveTabMeltcurve;
function saveTabMeltcurve() {
    saveTabFile("Meltcurve.tsv", window.meltcurveSaveTable)
    return;
};

window.saveTabCorrection = saveTabCorrection;
function saveTabCorrection() {
    saveTabFile("Corrections.tsv", window.correctionSaveTable)
    return;
};

window.copyTabLinRegPCR = copyTabLinRegPCR;
function copyTabLinRegPCR() {
    if (window.linRegSaveTable == "") {
        return
    }
    var el = document.getElementById("LinRegPCR_Result_Table");
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
    return;
};

window.copyTabMeltcurve = copyTabMeltcurve;
function copyTabMeltcurve() {
    if (window.meltcurveSaveTable == "") {
        return
    }
    var el = document.getElementById("Meltcurve_Result_Table");
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
    return;
};

window.copyCorrection = copyCorrection;
function copyCorrection() {
    if (window.correctionSaveTable == "") {
        return
    }
    var el = document.getElementById("Correction_Result_Table");
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
    return;
};

window.updateExperimenter = updateExperimenter;
function updateExperimenter() {
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
    ret["mode"] = "get-run-data"
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

window.saveSVGFile = saveSVGFile;
function saveSVGFile() {
    var fileName = "curves.svg"
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

window.showEditNotes = showEditNotes;
function showEditNotes() {
    if ((window.sampSelFirst == "target") &&
        (window.sampSelSecond != "7s8e45-Show-All") &&
        (window.sampSelThird != "7s8e45-Show-All")) {
        var sReact = sampSelThird;
        var sTar = window.sampSelSecond;
        var exclStr = "";
        var noteStr = "";
        var reacts = window.reactData.reacts
        for (var i = 0; i < reacts.length; i++) {
            if (reacts[i].id == sReact) {
                for (var k = 0; k < reacts[i].datas.length; k++) {
                    if (reacts[i].datas[k].tar == sTar) {
                        if (reacts[i].datas[k].hasOwnProperty("excl")) {
                            exclStr = reacts[i].datas[k].excl;
                        }
                        if (reacts[i].datas[k].hasOwnProperty("note")) {
                            noteStr = reacts[i].datas[k].note;
                        }
                    }
                }
            }
        }
        var retVal = '<div class="card">'
        retVal += '  <div class="card-header">Annotation</div>'
        retVal += '  <div class="card-body">'
        retVal += '    <div class="form-group">'
        retVal += '      <label for="runView-ele-excl">Excluded:</label>'
        retVal += '      <input type="text" class="form-control" id="runView-ele-excl" value="' + exclStr + '">'
        retVal += '    </div>'
        if (["1.3", "1.4"].includes(window.rdmlData.rdml.version)) {
            retVal += '    <div class="form-group">'
            retVal += '      <label for="runView-ele-notes">Notes:</label>'
            retVal += '      <input type="text" class="form-control" id="runView-ele-notes" value="' + noteStr + '">'
            retVal += '    </div>'
        }
        retVal += '<button type="submit" class="btn btn-outline-primary" '
        retVal += 'onclick="updateExclNotes(\'' + sReact + '\',\'' + sTar + '\')">'
        retVal += '      <i class="fas fa-rocket" style="margin-right: 5px;"></i>'
        retVal += '        Update Exclusion and Notes in RDML file'
        retVal += '    </button><br /><br />'
        retVal += '    Here you can view the exclusion remarks and from RDML version 1.3+ the'
        retVal += '    notes of the RDML file. Any entry in exclusion will exclude this reaction/target combination '
        retVal += '    from further analysis. <br />'
        retVal += '    Be aware: LinRegPCR runs with <i>"Update RDML Data: Yes"</i> selected will overwrite all '
        retVal += '    exclusion remarks and notes in the current run! Only edit this elements when the LinRegPCR '
        retVal += '    analysis is complete. <br />'
        retVal += '  </div>'
        retVal += '</div>'
        var sectionResults = document.getElementById('edit-notes')
        sectionResults.innerHTML = retVal;
    }
}

window.updateExclNotes = updateExclNotes;
function updateExclNotes(sReact, sTar) {
    var exclStr = getSaveHtmlData("runView-ele-excl");
    var noteStr = getSaveHtmlData("runView-ele-notes");
    if (window.linRegPCRTable.length > 0) {
        for (var row = 0; row < window.linRegPCRTable.length; row++) {
            if ((window.linRegPCRTable[row][window.convertField["id"]] == sReact) &&
                (window.linRegPCRTable[row][window.convertField["target"]] == sTar)) {
                window.linRegPCRTable[row][window.convertField["excluded"]] = exclStr
                window.linRegPCRTable[row][window.convertField["note"]] = noteStr
                updateLinRegPCRTable();
            }
        }
    }
    var ret = {}
    ret["mode"] = "update-excl-notes"
    ret["sel-experiment"] = window.selExperiment
    ret["sel-run"] = window.selRun
    ret["sel-react"] = sReact
    ret["sel-tar"] = sTar
    ret["sel-excl"] = exclStr
    ret["sel-note"] = noteStr
    window.fixCurves = true
    updateServerData(uuid, JSON.stringify(ret))
}

window.updatePCRStyle = updatePCRStyle;
function updatePCRStyle() {
    var newData = getSaveHtmlData("dropSelPCRStyle")
    window.selPCRStyle = newData
    updateClientData()
}

window.clickSampSel = clickSampSel;
function clickSampSel(tar, id) {
    window.sampSelFirst = "target"
    window.sampSelSecond = tar
    window.sampSelThird = id
    updateSampSel(2)
    window.sampSelThird = "7s8e45-Show-All"
    updateSampSel(0)
    $('[href="#runs-tab"]').tab('show')
}

window.updateSampSel = updateSampSel;
function updateSampSel(updateOnly) {
    // updateOnly = 0   New selected data, erase the rest
    // updateOnly = 1   Default way
    // updateOnly = 2   Set the choices as new and reselect
    var dropSecFirst = document.getElementById("dropSampSelFirst")
    var dropSecSecond = document.getElementById("dropSampSelSecond")
    var dropSecThird = document.getElementById("dropSampSelThird")
    if (!(dropSecFirst && dropSecSecond && dropSecThird)) {
        // One of the selections does not exist
        return
    }
    var newFirstData = getSaveHtmlData("dropSampSelFirst")
    var newSecondData = getSaveHtmlData("dropSampSelSecond")
    var newThirdData = getSaveHtmlData("dropSampSelThird")
    var reSelectSamples = false

    if ((updateOnly == 0) && (window.sampSelFirst != newFirstData)) {
        window.sampSelFirst = newFirstData
        window.sampSelSecond = "7s8e45-Show-All"
        newSecondData = "7s8e45-Show-All"
        window.sampSelThird = "7s8e45-Show-All"
        newThirdData = "7s8e45-Show-All"
        reSelectSamples = true
    }
    if ((updateOnly == 0) && (window.sampSelSecond != newSecondData)) {
        window.sampSelSecond = newSecondData
        window.sampSelThird = "7s8e45-Show-All"  // To avoid conflicts with existing values
        newThirdData = "7s8e45-Show-All"
        reSelectSamples = true
    }
    if ((updateOnly == 0) && (window.sampSelThird != newThirdData)) {
        window.sampSelThird = newThirdData
        reSelectSamples = true
    }

    if (updateOnly == 2) {
        newFirstData = window.sampSelFirst
        newSecondData = window.sampSelSecond
        newThirdData = window.sampSelThird
        reSelectSamples = true
    }

    // The second select
    var dropSec = document.getElementById("dropSampSelSecond")
    for (var opt = dropSec.options.length - 1; opt > -1; opt--) {
        dropSec.remove(dropSec.opt);
    }
    var option = document.createElement("option");
    option.text = "Show All"
    option.value = "7s8e45-Show-All"  // To avoid conflicts with existing values
    dropSec.add(option)
    if (window.sampSelSecond == "7s8e45-Show-All") {
        dropSec.options[0].selected = true
    } else {
        dropSec.options[0].selected = false
    }

    if (window.sampSelFirst == "sample") {
        var allSamples = Object.keys(window.samToNr)
        var selectNr = 0
        allSamples.sort()
        for (var sam = 0; sam < allSamples.length; sam++) {
            var option = document.createElement("option");
            option.text = allSamples[sam]
            option.value = allSamples[sam]
            dropSec.add(option)
            if (allSamples[sam] == window.sampSelSecond) {
                dropSec.options[sam + 1].selected = true
            } else {
                dropSec.options[sam + 1].selected = false
            }
        }
        if ((reSelectSamples == true) && (window.reactData.hasOwnProperty("reacts"))) {
            var reacts = window.reactData.reacts
            window.sampSelThirdList = []
            for (var i = 0; i < reacts.length; i++) {
                if (reacts[i].sample == newSecondData) {
                    window.sampSelThirdList.push(parseInt(reacts[i].id))
                }
            }
            window.sampSelThirdList.sort(function(a, b){return a - b})
        }
    }

    if (window.sampSelFirst == "target") {
        var allTargets = Object.keys(window.tarToNr)
        var selectNr = 0
        allTargets.sort()
        for (var sam = 0; sam < allTargets.length; sam++) {
            var option = document.createElement("option");
            option.text = allTargets[sam]
            option.value = allTargets[sam]
            dropSec.add(option)
            if (allTargets[sam] == window.sampSelSecond) {
                dropSec.options[sam + 1].selected = true
            } else {
                dropSec.options[sam + 1].selected = false
            }
        }
        if ((reSelectSamples == true) && (window.reactData.hasOwnProperty("reacts"))) {
            var reacts = window.reactData.reacts
            window.sampSelThirdList = []
            for (var i = 0; i < reacts.length; i++) {
                var keepSam = false
                for (var k = 0; k < reacts[i].datas.length; k++) {
                    if (reacts[i].datas[k].tar == newSecondData) {
                        keepSam = true
                    }
                }
                if (keepSam == true) {
                    window.sampSelThirdList.push(parseInt(reacts[i].id))
                }
            }
            window.sampSelThirdList.sort(function(a, b){return a - b})
        }
    }

    if (window.sampSelFirst == "dye_id") {
        var allDyeIds = Object.keys(window.usedDyeIds)
        var selectNr = 0
        allDyeIds.sort()
        for (var sam = 0; sam < allDyeIds.length; sam++) {
            var option = document.createElement("option");
            option.text = allDyeIds[sam]
            option.value = allDyeIds[sam]
            dropSec.add(option)
            if (allDyeIds[sam] == window.sampSelSecond) {
                dropSec.options[sam + 1].selected = true
            } else {
                dropSec.options[sam + 1].selected = false
            }
        }
        if ((reSelectSamples == true) && (window.reactData.hasOwnProperty("reacts"))) {
            var reacts = window.reactData.reacts
            window.sampSelThirdList = []
            for (var i = 0; i < reacts.length; i++) {
                var keepSam = false
                for (var k = 0; k < reacts[i].datas.length; k++) {
                    if (window.tarToDye[reacts[i].datas[k].tar] == newSecondData) {
                        keepSam = true
                    }
                }
                if (keepSam == true) {
                    window.sampSelThirdList.push(parseInt(reacts[i].id))
                }
            }
            window.sampSelThirdList.sort(function(a, b){return a - b})
        }
    }

    if (window.sampSelFirst == "dye_pos") {
        for (var sam = 0; sam < window.usedDyeMaxPos + 1; sam++) {
            var option = document.createElement("option");
            option.text = sam + 1
            option.value = sam
            dropSec.add(option)
            if (sam == window.sampSelSecond) {
                dropSec.options[sam + 1].selected = true
            } else {
                dropSec.options[sam + 1].selected = false
            }
        }
        if ((reSelectSamples == true) && (window.reactData.hasOwnProperty("reacts"))) {
            var reacts = window.reactData.reacts
            window.sampSelThirdList = []
            for (var i = 0; i < reacts.length; i++) {
                if (reacts[i].datas.length >= window.usedDyeMaxPos) {
                    window.sampSelThirdList.push(parseInt(reacts[i].id))
                }
            }
            window.sampSelThirdList.sort(function(a, b){return a - b})
        }
    }

    if (window.sampSelFirst == "excluded") {
        var allExcluded = Object.keys(window.usedExcluded)
        var selectNr = 0
        allExcluded.sort()
        for (var sam = 0; sam < allExcluded.length; sam++) {
            var option = document.createElement("option");
            if (allExcluded[sam] == "7s8e45-Empty-Val") {
                option.text = "No exclusion reason"
            } else {
                option.text = allExcluded[sam]
            }
            option.value = allExcluded[sam]
            dropSec.add(option)
            if (allExcluded[sam] == window.sampSelSecond) {
                dropSec.options[sam + 1].selected = true
            } else {
                dropSec.options[sam + 1].selected = false
            }
        }
        if ((reSelectSamples == true) && (window.reactData.hasOwnProperty("reacts"))) {
            var reacts = window.reactData.reacts
            window.sampSelThirdList = []
            for (var i = 0; i < reacts.length; i++) {
                var keepSam = false
                for (var k = 0; k < reacts[i].datas.length; k++) {
                    if (reacts[i].datas[k].hasOwnProperty("excl")) {
                        if ((window.sampSelSecond == "7s8e45-Show-All") ||
                            ((reacts[i].datas[k].excl != "") && (reacts[i].datas[k].excl == newSecondData)) ||
                            ((reacts[i].datas[k].excl == "") && ("7s8e45-Empty-Val" == newSecondData))) {
                            keepSam = true
                        }
                    }
                }
                if (keepSam == true) {
                    window.sampSelThirdList.push(parseInt(reacts[i].id))
                }
            }
            window.sampSelThirdList.sort(function(a, b){return a - b})
        }
    }
    if (window.sampSelFirst == "linRegPCR") {
        var linregLookup = {"no amplification": "no_amplification",
                          "baseline error": "no_baseline",
                          "no plateau": "no_plateau",
                          "noisy sample": "noisy_sample",
                          "excl PCR efficiency": "excl_PCReff",
                          "short log lin phase": "shortLogLin",
                          "Cq is shifting": "cqShifting",
                          "too low Cq eff": "tooLowCqEff",
                          "too low Cq N0": "tooLowCqN0",
                          "not used for W-o-L setting": "not_in_WoL"}
        var linregList = ["no amplification",
                          "baseline error",
                          "no plateau",
                          "noisy sample",
                          "excl PCR efficiency",
                          "short log lin phase",
                          "Cq is shifting",
                          "too low Cq eff",
                          "too low Cq N0",
                          "not used for W-o-L setting"]
        var selectNr = 0
        for (var sam = 0; sam < linregList.length; sam++) {
            var option = document.createElement("option");
            option.text = linregList[sam]
            option.value = linregLookup[linregList[sam]]
            dropSec.add(option)
            if (linregLookup[linregList[sam]] == window.sampSelSecond) {
                dropSec.options[sam + 1].selected = true
            } else {
                dropSec.options[sam + 1].selected = false
            }
        }
        if ((reSelectSamples == true) && (window.reactData.hasOwnProperty("reacts")) &&
            (window.linRegPCRTable.length > 0 )) {
            var reacts = window.reactData.reacts
            window.sampSelThirdList = []
            for (var lt = 1; lt < window.linRegPCRTable.length; lt++) {
                if (((newSecondData == "no_amplification") && (window.linRegPCRTable[lt][window.convertField["amplification"]] == false)) ||
                    ((newSecondData == "no_baseline") && (window.linRegPCRTable[lt][window.convertField["baseline error"]] == true)) ||
                    ((newSecondData == "no_plateau") && (window.linRegPCRTable[lt][window.convertField["plateau"]] == false)) ||
                    ((newSecondData == "noisy_sample") && (window.linRegPCRTable[lt][window.convertField["noisy sample"]] == true)) ||
                    ((newSecondData == "excl_PCReff") && (window.linRegPCRTable[lt][window.convertField["excl PCR efficiency"]] == true)) ||
                    ((newSecondData == "shortLogLin") && (window.linRegPCRTable[lt][window.convertField["short log lin phase"]] == true)) ||
                    ((newSecondData == "cqShifting") && (window.linRegPCRTable[lt][window.convertField["Cq is shifting"]] == true)) ||
                    ((newSecondData == "tooLowCqEff") && (window.linRegPCRTable[lt][window.convertField["too low Cq eff"]] == true)) ||
                    ((newSecondData == "tooLowCqN0") && (window.linRegPCRTable[lt][window.convertField["too low Cq N0"]] == true)) ||
                    ((newSecondData == "not_in_WoL") && (window.linRegPCRTable[lt][window.convertField["used for W-o-L setting"]] == false))) {
                    for (var i = 0; i < reacts.length; i++) {
                        if (reacts[i].id == window.linRegPCRTable[lt][window.convertField["id"]]) {
                            for (var k = 0; k < reacts[i].datas.length; k++) {
                                if (reacts[i].datas[k].tar == window.linRegPCRTable[lt][window.convertField["target"]]) {
                                    window.sampSelThirdList.push(parseInt(reacts[i].id))
                                }
                            }
                        }
                    }
                }
            }
            window.sampSelThirdList.sort(function(a, b){return a - b})
        }
    }


    // The third select
    var dropThird = document.getElementById("dropSampSelThird")
    for (var opt = dropThird.options.length - 1; opt > -1; opt--) {
        dropThird.remove(dropThird.opt);
    }
    var option = document.createElement("option");
    option.text = "Show All"
    option.value = "7s8e45-Show-All"  // To avoid conflicts with existing values
    dropThird.add(option)
    if (window.sampSelThird == "7s8e45-Show-All") {
        dropThird.options[0].selected = true
    } else {
        dropThird.options[0].selected = false
    }

    if ((window.experimentPos > -1) && (window.runPos > -1) && (window.reactData.hasOwnProperty("reacts"))) {
        var pcrFormat = window.rdmlData.rdml.experiments[window.experimentPos].runs[window.runPos].pcrFormat
        var columns = parseInt(pcrFormat.columns)
        var rowLabel = pcrFormat.rowLabel
        var columnLabel = pcrFormat.columnLabel
        for (var thirdSam = 0; thirdSam < sampSelThirdList.length; thirdSam++) {
            var option = document.createElement("option");
            var thirdCol = (parseInt(sampSelThirdList[thirdSam]) - 1) % columns + 1
            var thirdRow = Math.floor((parseInt(sampSelThirdList[thirdSam]) - 1)/ columns)
            var wellText = ""
            if (rowLabel == "123") {
                wellText += thirdRow
            } else if (rowLabel == "ABC") {
                wellText += String.fromCharCode('A'.charCodeAt(0) + thirdRow)
            }
            if ((columnLabel == "123") && (rowLabel == "123")) {
                wellText += " "
            }
            if ((columnLabel == "ABC") && (rowLabel == "ABC")) {
                wellText += " "
            }
            if (columnLabel == "123") {
                wellText += thirdCol
            } else if (columnLabel == "ABC") {
                wellText += String.fromCharCode('A'.charCodeAt(0) + thirdCol)
            }
            option.text = wellText
            option.value = sampSelThirdList[thirdSam]
            dropThird.add(option)
            if (sampSelThirdList[thirdSam] == window.sampSelThird) {
                dropThird.options[thirdSam + 1].selected = true
            } else {
                dropThird.options[thirdSam + 1].selected = false
            }
        }
    }


    if (reSelectSamples == true) {
        if (window.sampSelThird == "7s8e45-Show-All") {
            if ((window.sampSelFirst != "excluded") && (window.sampSelSecond == "7s8e45-Show-All")) {
                if (window.reactData.hasOwnProperty("reacts")) {
                    var reacts = window.reactData.reacts
                    for (var i = 0; i < reacts.length; i++) {
                        for (var k = 0; k < reacts[i].datas.length; k++) {
                            reacts[i].datas[k]["runview_show"] = true
                        }
                    }
                }
                window.sampSelThirdList = []
            } else {
                if (window.reactData.hasOwnProperty("reacts")) {
                    var reacts = window.reactData.reacts
                    for (var i = 0; i < reacts.length; i++) {
                        if (window.sampSelFirst == "sample") {
                            var selectItNow = false
                            if (reacts[i].sample == newSecondData) {
                                selectItNow = true
                            }
                            for (var k = 0; k < reacts[i].datas.length; k++) {
                                reacts[i].datas[k]["runview_show"] = selectItNow
                            }
                        }

                        if (window.sampSelFirst == "target") {
                            for (var k = 0; k < reacts[i].datas.length; k++) {
                                if (reacts[i].datas[k].tar == newSecondData) {
                                    reacts[i].datas[k]["runview_show"] = true
                                } else {
                                    reacts[i].datas[k]["runview_show"] = false
                                }
                            }
                        }

                        if (window.sampSelFirst == "dye_id") {
                            for (var k = 0; k < reacts[i].datas.length; k++) {
                                if (window.tarToDye[reacts[i].datas[k].tar] == newSecondData) {
                                    reacts[i].datas[k]["runview_show"] = true
                                } else {
                                    reacts[i].datas[k]["runview_show"] = false
                                }
                            }
                        }

                        if (window.sampSelFirst == "dye_pos") {
                            for (var k = 0; k < reacts[i].datas.length; k++) {
                                if (k == newSecondData) {
                                    reacts[i].datas[k]["runview_show"] = true
                                } else {
                                    reacts[i].datas[k]["runview_show"] = false
                                }
                            }
                        }

                        if (window.sampSelFirst == "excluded") {
                            for (var k = 0; k < reacts[i].datas.length; k++) {
                                reacts[i].datas[k]["runview_show"] = false
                                if (reacts[i].datas[k].hasOwnProperty("excl")) {
                                    if ((window.sampSelSecond == "7s8e45-Show-All") ||
                                        ((reacts[i].datas[k].excl != "") && (reacts[i].datas[k].excl == newSecondData)) ||
                                        ((reacts[i].datas[k].excl == "") && ("7s8e45-Empty-Val" == newSecondData))) {
                                        reacts[i].datas[k]["runview_show"] = true
                                    }
                                }
                            }
                        }

                        if ((window.sampSelFirst == "linRegPCR") && (window.linRegPCRTable.length > 0 )) {
                            for (var k = 0; k < reacts[i].datas.length; k++) {
                                reacts[i].datas[k]["runview_show"] = false
                                for (var lt = 1; lt < window.linRegPCRTable.length; lt++) {
                                    if (reacts[i].id == window.linRegPCRTable[lt][window.convertField["id"]] &&
                                        reacts[i].datas[k].tar == window.linRegPCRTable[lt][window.convertField["target"]] &&
                                        (((newSecondData == "no_amplification") && (window.linRegPCRTable[lt][window.convertField["amplification"]] == false)) ||
                                         ((newSecondData == "no_baseline") && (window.linRegPCRTable[lt][window.convertField["baseline error"]] == true)) ||
                                         ((newSecondData == "no_plateau") && (window.linRegPCRTable[lt][window.convertField["plateau"]] == false)) ||
                                         ((newSecondData == "noisy_sample") && (window.linRegPCRTable[lt][window.convertField["noisy sample"]] == true)) ||
                                         ((newSecondData == "excl_PCReff") && (window.linRegPCRTable[lt][window.convertField["excl PCR efficiency"]] == true)) ||
                                         ((newSecondData == "shortLogLin") && (window.linRegPCRTable[lt][window.convertField["short log lin phase"]] == true)) ||
                                         ((newSecondData == "cqShifting") && (window.linRegPCRTable[lt][window.convertField["Cq is shifting"]] == true)) ||
                                         ((newSecondData == "tooLowCqEff") && (window.linRegPCRTable[lt][window.convertField["too low Cq eff"]] == true)) ||
                                         ((newSecondData == "tooLowCqN0") && (window.linRegPCRTable[lt][window.convertField["too low Cq N0"]] == true)) ||
                                         ((newSecondData == "not_in_WoL") && (window.linRegPCRTable[lt][window.convertField["used for W-o-L setting"]] == false)))) {
                                        reacts[i].datas[k]["runview_show"] = true
                                        break
                                    }
                                }
                            }
                        }

                    }
                }
            }
        } else {
            if (window.reactData.hasOwnProperty("reacts")) {
                var reacts = window.reactData.reacts
                for (var i = 0; i < reacts.length; i++) {
                    var selectItNow = false
                    if (reacts[i].id == sampSelThird) {
                        selectItNow = true
                    }
                    for (var k = 0; k < reacts[i].datas.length; k++) {
                        reacts[i].datas[k]["runview_show"] = selectItNow
                    }
                }
            }
        }

        updateClientData()
    }
}

window.updateYScale = updateYScale;
function updateYScale() {
    var newData = getSaveHtmlData("dropSelYScale")
    if (window.yScale == newData) {
        return
    }
    window.yScale = newData
    updateClientData()
}

window.updateCurveSource = updateCurveSource;
function updateCurveSource() {
    var newData = getSaveHtmlData("dropSelCurveSource")
    if (window.curveSource == newData) {
        return
    }
    window.curveSource = newData
    if (["adp", "cdp", "bas"].includes(window.curveSource)) {
        window.yScale = "log"
    } else {
        window.yScale = "lin"
    }
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
    var sectionResults = document.getElementById('curves-data')
    sectionResults.innerHTML = retVal;
}

function createSVG() {
    setStartStop();
    var retVal = createEfficiencyCurves();
    retVal += createMeltcurveBox();
    retVal += createAllCurves();
    retVal += createCoordinates ();
    retVal += "<g id='svgHighCurve'></g>"
    retVal += "</svg>";
    var head = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='-60 -40 600 400' width='900px'>";
    return head + retVal;
}

function setStartStop() {
    if (["adp", "cdp", "bas"].includes(window.curveSource)) {
        window.winXst = window.winXmin;
        window.winXend = 5 * Math.ceil(window.winXmax / 5);
    } else {
        window.winXst = 5 * Math.floor(window.winXmin / 5);
        window.winXend = 5 * Math.ceil(window.winXmax / 5);
    }

    if (window.yScale == "lin") {
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

function toSvgXScale(val) {
    return window.frameXst + (val - window.winXst) / (window.winXend - window.winXst) * (window.frameXend - window.frameXst);
}

function toSvgYScale(val) {
    if (window.yScale == "lin") {
        return toSvgYLinScale(val);
    } else {
        return toSvgYLogScale(val);
    }
}

function toSvgSaveYScale(val) {
    if (window.yScale == "lin") {
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
    return window.frameYend - (val - window.winYst) / (window.winYend - window.winYst) * (window.frameYend - window.frameYst);
}

function toSvgYLogScale(val) {
    return window.frameYend - (Math.log10(val) - Math.log10(window.winYst)) / (Math.log10(window.winYend) - Math.log10(window.winYst)) * (window.frameYend - window.frameYst);

}

function createMeltcurveBox () {
    var lineXend = window.frameXend + 5;
    var lineYst = window.frameYst - 5;
    var retVal = ""
    // Expected Peak line
    if ((["smo", "nrm", "fdm", "mdp"].includes(window.curveSource)) &&
        (window.sampSelFirst == "target") &&
        (window.sampSelSecond != "7s8e45-Show-All")) {

        var mTemp = -1.0
        var mWidth = 0.0
        var exp = window.rdmlData.rdml.targets
        for (var i = 0; i < exp.length; i++) {
            if (exp[i].id == window.sampSelSecond) {
                if (exp[i].hasOwnProperty("meltingTemperature")) {
                    mTemp = parseFloat(exp[i].meltingTemperature)
                    var eleMcaTruePeakWidth = document.getElementById('mcaTruePeakWidth')
                    if (eleMcaTruePeakWidth) {
                        mWidth = parseFloat(eleMcaTruePeakWidth.value)
                    }
                }
            }
        }
        if ((mTemp > 0.0) && (!(isNaN(mWidth)))) {
            var rlPos = toSvgXScale(mTemp - mWidth)
            var rrPos = toSvgXScale(mTemp + mWidth)
            var rwPos = rrPos - rlPos
            var rhPos = window.frameYend - lineYst
            retVal += "<rect x='" + rlPos + "' y='" + lineYst;
            retVal += "' width='" + rwPos + "' height='" + rhPos + "' fill='rgb(230,230,230)' />"
        }
        if (mTemp > 0.0) {
            var xPos = toSvgXScale(mTemp);
            retVal += "<line x1='" + xPos + "' y1='" + lineYst;
            retVal += "' x2='" + xPos + "' y2='" + window.frameYend + "' stroke-width='0.5' stroke='black' />";
        }
    }
    return retVal;
}

function createCoordinates () {
    var lineXend = window.frameXend + 5;
    var lineYst = window.frameYst - 5;
    var retVal = ""
    var cv = window.convertField;

    // The X-Axis
    var xStep = 5;
    for (var i = 0; (i * xStep + window.winXst) < (window.winXend + xStep); i++) {
        var xPos = toSvgXScale(i * xStep + window.winXst);
        retVal += "<line x1='" + xPos + "' y1='" + window.frameYend;
        retVal += "' x2='" + xPos + "' y2='" + (window.frameYend + 7) + "' stroke-width='2' stroke='black' />";
        retVal += "<text x='" + xPos + "' y='" + (window.frameYend + 26);
        retVal += "' font-family='Arial' font-size='20' fill='black' text-anchor='middle'>";
        retVal += (i * xStep + window.winXst) + "</text>";
    }

    // The Y-Axis
    if (window.yScale == "lin") {
        var maxYScaleVal = window.winYend - window.winYst + window.winYstep;
        var yRound = Math.max(0, Math.floor(1 - Math.log10(Math.abs(maxYScaleVal))))
        if (Math.log10(maxYScaleVal) < 1.0) {
            yRound = yRound + window.winYprec
        }
        for (var i = 0; i *  window.winYstep < window.winYend - window.winYst + window.winYstep; i++) {
            var yPos = toSvgYLinScale(window.winYst + i *  window.winYstep);
            retVal += "<line x1='" + window.frameXst + "' y1='" + yPos;
            retVal += "' x2='" + (window.frameXst - 7) + "' y2='" + yPos + "' stroke-width='2' stroke='black' />";
            retVal += "<text x='" + (window.frameXst - 11) + "' y='" + (yPos + 3);
            retVal += "' font-family='Arial' font-size='10' fill='black' text-anchor='end'>";
            var textValOut = window.winYst + i *  window.winYstep
            retVal += textValOut.toFixed(yRound) + "</text>";
        }
    } else {
        var sumVal = window.winYst
        var yLogStep= window.winYstep
        for (var i = 0; (sumVal + i * yLogStep) < window.winYend ; i++) {
            if ((sumVal + i * yLogStep) / yLogStep >= 10) {
                yLogStep = yLogStep * 10
                i = 0
                sumVal = yLogStep
            }
            var yPos = toSvgYLogScale(sumVal + i * yLogStep);
            retVal += "<line x1='" + window.frameXst + "' y1='" + yPos;
            retVal += "' x2='" + (window.frameXst - 7) + "' y2='" + yPos + "' stroke-width='2' stroke='black' />";
            var textValOut = sumVal + i * yLogStep
            var yRound = Math.max(0, Math.floor(2 - Math.log10(Math.abs(textValOut))))
            if (!(((Math.round(textValOut.toFixed(yRound) / yLogStep) == 5) && (window.maxLogRange > 3000)) ||
                  (Math.round(textValOut.toFixed(yRound) / yLogStep) == 7) ||
                  (Math.round(textValOut.toFixed(yRound) / yLogStep) == 9) )) {
                retVal += "<text x='" + (window.frameXst - 11) + "' y='" + (yPos + 3);
                retVal += "' font-family='Arial' font-size='10' fill='black' text-anchor='end'>";
                retVal += textValOut.toFixed(yRound) + "</text>";
            }
        }
    }

    // Baseline and Limits
    if ((window.linRegPCRTable.length > 0) &&
        (window.curveSource == "bas") &&
        (window.sampSelFirst == "target") &&
        ((window.sampSelSecond != "7s8e45-Show-All") ||
         (window.sampSelThird != "7s8e45-Show-All"))) {
        var selReact = ""
        var selData = ""
        var runOn = true

        if (window.reactData.hasOwnProperty("reacts")) {
            var reacts = window.reactData.reacts
            for (var i = 0; i < reacts.length; i++) {
                for (var k = 0; k < reacts[i].datas.length; k++) {
                    if (reacts[i].datas[k]["runview_show"] == true) {
                        selReact = reacts[i].id
                        selData = reacts[i].datas[k].tar
                        k = reacts[i].datas.length
                        runOn = false
                    }
                }
                if (runOn == false) {
                    i = reacts.length
                }
            }

            runOn = true
            var i = window.reactToLinRegTable[parseInt(selReact)]
            var k = -1
            while ((runOn) && (selReact == window.linRegPCRTable[i][cv["id"]])) {
                if (selData == window.linRegPCRTable[i][cv["target"]]) {
                    k = i
                    runOn = false
                }
                i++
            }

            if (k > -1) {
                var yPos = toSvgYScale(parseFloat(window.linRegPCRTable[k][cv["lower limit"]]))
                retVal += "<line x1='" + window.frameXst + "' y1='" + yPos;
                retVal += "' x2='" + lineXend + "' y2='" + yPos;
                retVal += "' stroke-width='1.5' stroke='blue' stroke-linecap='square'/>";

                yPos = toSvgYScale(parseFloat(window.linRegPCRTable[k][cv["upper limit"]]))
                retVal += "<line x1='" + window.frameXst + "' y1='" + yPos;
                retVal += "' x2='" + lineXend + "' y2='" + yPos;
                retVal += "' stroke-width='1.5' stroke='blue' stroke-linecap='square'/>";

                yPos = toSvgYScale(parseFloat(window.linRegPCRTable[k][cv["threshold"]]))
                retVal += "<line x1='" + window.frameXst + "' y1='" + yPos;
                retVal += "' x2='" + lineXend + "' y2='" + yPos;
                retVal += "' stroke-width='1.5' stroke='lime' stroke-linecap='square'/>";

                if (window.sampSelThird != "7s8e45-Show-All") {
                    var cqVal = parseFloat(window.linRegPCRTable[k][cv["Cq"]])
                    if (cqVal > 0.0) {
                        var xPos = toSvgXScale(cqVal);
                        retVal += "<line x1='" + xPos + "' y1='" + yPos;
                        retVal += "' x2='" + xPos + "' y2='" + window.frameYend;
                        retVal += "' stroke-width='1.5' stroke='lime' stroke-linecap='square'/>";
                    }
                }
            }

        }
    }
    retVal += "<line x1='" + window.frameXst + "' y1='" + window.frameYend;
    retVal += "' x2='" + lineXend + "' y2='" + window.frameYend + "' stroke-width='2' stroke='black' stroke-linecap='square'/>";
    retVal += "<line x1='" + window.frameXst + "' y1='" + lineYst;
    retVal += "' x2='" + window.frameXst + "' y2='" + window.frameYend + "' stroke-width='2' stroke='black' stroke-linecap='square'/>";

    return retVal;
}

function createEfficiencyCurves () {
    var retVal = ""
    var cv = window.convertField;
    if ((window.linRegPCRTable.length > 0) &&
        (window.curveSource == "bas") &&
        (window.yScale == "log") &&
        (window.sampSelFirst == "target") &&
        (window.sampSelSecond != "7s8e45-Show-All") &&
        (window.sampSelThird != "7s8e45-Show-All") &&
        (window.reactData.hasOwnProperty("reacts"))) {
        var lineXend = window.frameXend + 5;
        var lineYst = window.frameYst - 5;
        var selReact = ""
        var selData = ""
        var runOn = true
        var reacts = window.reactData.reacts
        for (var i = 0; i < reacts.length; i++) {
            for (var k = 0; k < reacts[i].datas.length; k++) {
                if (reacts[i].datas[k]["runview_show"] == true) {
                    selReact = reacts[i].id
                    selData = reacts[i].datas[k].tar
                    k = reacts[i].datas.length
                    runOn = false
                }
            }
            if (runOn == false) {
                i = reacts.length
            }
        }

        runOn = true
        var i = window.reactToLinRegTable[parseInt(selReact)]
        var k = -1
        while ((runOn) && (selReact == window.linRegPCRTable[i][cv["id"]])) {
            if (selData == window.linRegPCRTable[i][cv["target"]]) {
                k = i
                runOn = false
            }
            i++
        }

        if (k > -1) {
            var chemistry = window.linRegPCRTable[k][cv["target chemistry"]]
            var meanFitX = parseFloat(window.linRegPCRTable[k][cv["Cq"]])
            var meanFitY = parseFloat(window.linRegPCRTable[k][cv["threshold"]])
            var indivEff = parseFloat(window.linRegPCRTable[k][cv["indiv PCR eff"]])
            var meanEff = parseFloat(window.linRegPCRTable[k][cv["PCR eff"]])

            // Only continue if all values are not nan
            if ((Number.isNaN(meanFitX)) ||
                (Number.isNaN(meanFitY)) ||
                (Number.isNaN(indivEff)) ||
                (Number.isNaN(meanEff))) {
                return retVal;
            }

            var yPos1 = toSvgYScale(window.winYst);
            var yPos2 = toSvgYScale(window.winYend);
            var xPos1 = toSvgXScale(meanFitX + (Math.log10(window.winYst) - Math.log10(meanFitY)) / Math.log10(indivEff));
            var xPos2 = toSvgXScale(meanFitX + (Math.log10(window.winYend) - Math.log10(meanFitY)) / Math.log10(indivEff));
            retVal += "<line x1='" + xPos1 + "' y1='" + yPos1;
            retVal += "' x2='" + xPos2 + "' y2='" + yPos2;
            retVal += "' stroke-width='0.5' stroke='grey' stroke-linecap='square'/>";

            xPos1 = toSvgXScale(meanFitX + (Math.log10(window.winYst) - Math.log10(meanFitY)) / Math.log10(meanEff));
            xPos2 = toSvgXScale(meanFitX + (Math.log10(window.winYend) - Math.log10(meanFitY)) / Math.log10(meanEff));
            retVal += "<line x1='" + xPos1 + "' y1='" + yPos1;
            retVal += "' x2='" + xPos2 + "' y2='" + yPos2;
            retVal += "' stroke-width='0.5' stroke='black' stroke-linecap='square'/>";

            // For debugging
            if (0) {
                // alert(meanFitX + " - " + meanFitY)
                var yPos = toSvgYScale(meanFitY);
                retVal += "<line x1='" + window.frameXst + "' y1='" + yPos;
                retVal += "' x2='" + lineXend + "' y2='" + yPos;
                retVal += "' stroke-width='0.5' stroke='red' stroke-linecap='square'/>";
                var xPos = toSvgXScale(meanFitX);
                retVal += "<line x1='" + xPos + "' y1='" + yPos;
                retVal += "' x2='" + xPos + "' y2='" + window.frameYend;
                retVal += "' stroke-width='0.5' stroke='red' stroke-linecap='square'/>";
            }
        }
    }
    return retVal;
}

function createAllCurves(){
    var retVal = ""
    var reacts = window.reactData.reacts
    var baseReact = window.reactData.reacts
    var meltReact = window.reactData.reacts
    if (window.curveSource == "bas") {
        baseReact = window.baselineData.reacts
    } else if (["smo", "nrm", "fdm"].includes(window.curveSource)) {
        meltReact =  window.meltcurveData.reacts;
    }

    var the_run = window.rdmlData.rdml.experiments[window.experimentPos].runs[window.runPos]
    var rows = parseInt(the_run.pcrFormat.rows)
    var columns = parseInt(the_run.pcrFormat.columns)
    for (var r = 0; r < rows; r++) {
        for (var c = 0; c < columns; c++) {
            var id = r * columns + c + 1
            for (var reac = 0; reac < reacts.length; reac++) {
                for (var dataPos = 0; dataPos < reacts[reac].datas.length; dataPos++) {
                    if ((reacts[reac].datas[dataPos].hasOwnProperty("runview_show")) &&
                        (reacts[reac].datas[dataPos].runview_show == true) &&
                        (parseInt(reacts[reac].id) == id)) {
                        var exlReact = reacts[reac].datas[dataPos].hasOwnProperty("excl")
                        var colo = "#000000"
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
                            var tarNr = window.tarToNr[reacts[reac].datas[dataPos].tar]
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
                            var tarNr = window.tarToNr[reacts[reac].datas[dataPos].tar]
                            var samCount = window.rdmlData.rdml.samples.length
                            var samTarNr = tarNr * samCount + samNr
                            if (exlReact) {
                                colo = "#ff0000"
                            } else {
                                colo = colorByNr(samTarNr)
                            }
                        }
                        if (window.curveSource == "adp") {
                            retVal += createOneCurve(parseInt(reacts[reac].id), dataPos, "1.2",
                                                     reacts[reac].datas[dataPos].adps, colo);
                        } else if (window.curveSource == "cdp") {
                            retVal += createOneCurve(parseInt(reacts[reac].id), dataPos, "1.2",
                                                     reacts[reac].datas[dataPos].cdps, colo);
                        } else if (window.curveSource == "bas") {
                            retVal += createOneCurve(parseInt(reacts[reac].id), dataPos, "1.2",
                                                     baseReact[reac].datas[dataPos].bass, colo);
                            retVal += createOneDots(reac, parseInt(reacts[reac].id), dataPos, "1.2",
                                                    baseReact[reac].datas[dataPos].bass, colo);
                        } else if (window.curveSource == "smo") {
                            retVal += createOneCurve(parseInt(reacts[reac].id), dataPos, "1.2",
                                                     meltReact[reac].datas[dataPos].smo, colo);
                        } else if (window.curveSource == "nrm") {
                            retVal += createOneCurve(parseInt(reacts[reac].id), dataPos, "1.2",
                                                     meltReact[reac].datas[dataPos].nrm, colo);
                        } else if (window.curveSource == "fdm") {
                            retVal += createOneCurve(parseInt(reacts[reac].id), dataPos, "1.2",
                                                     meltReact[reac].datas[dataPos].fdm, colo);
                        } else {
                            retVal += createOneCurve(parseInt(reacts[reac].id), dataPos, "1.2",
                                                     reacts[reac].datas[dataPos].mdps, colo);
                        }
                    }
                }
            }
        }
    }
    return retVal;
}

function createOneHighCurve(id, dataPos) {
    var theSvg = document.getElementById('svgHighCurve')
    if (id == "") {
        theSvg.innerHTML = ""
        return
    }
    var retVal = ""
    var reacts = window.reactData.reacts
    var baseReact = window.reactData.reacts
    var meltReact = window.reactData.reacts
    if (window.curveSource == "bas") {
        baseReact = window.baselineData.reacts
    } else if (["smo", "nrm", "fdm"].includes(window.curveSource)) {
        meltReact =  window.meltcurveData.reacts;
    }

    for (var reac = 0; reac < reacts.length; reac++) {
        if (parseInt(reacts[reac].id) == parseInt(id)) {
            var exlReact = reacts[reac].datas[dataPos].hasOwnProperty("excl")
            var colo = "#000000"
            if(0) { // Selected black according to Maurice suggestion
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
                var tarNr = window.tarToNr[reacts[reac].datas[dataPos].tar]
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
                var tarNr = window.tarToNr[reacts[reac].datas[dataPos].tar]
                var samCount = window.rdmlData.rdml.samples.length
                var samTarNr = tarNr * samCount + samNr
                if (exlReact) {
                    colo = "#ff0000"
                } else {
                    colo = colorByNr(samTarNr)
                }
            }
            } // Selected black according to Maurice suggestion
            if (window.curveSource == "adp") {
                retVal += createOneCurve(parseInt(reacts[reac].id), dataPos, "3.0",
                                         reacts[reac].datas[dataPos].adps, colo);
            } else if (window.curveSource == "cdp") {
                retVal += createOneCurve(parseInt(reacts[reac].id), dataPos, "3.0",
                                         reacts[reac].datas[dataPos].cdps, colo);
            } else if (window.curveSource == "bas") {
                retVal += createOneCurve(parseInt(reacts[reac].id), dataPos, "3.0",
                                         baseReact[reac].datas[dataPos].bass, colo);
                retVal += createOneDots(reac, parseInt(reacts[reac].id), dataPos, "3.0",
                                        baseReact[reac].datas[dataPos].bass, colo);
            } else if (window.curveSource == "smo") {
                retVal += createOneCurve(parseInt(reacts[reac].id), dataPos, "3.0",
                                         meltReact[reac].datas[dataPos].smo, colo);
            } else if (window.curveSource == "nrm") {
                retVal += createOneCurve(parseInt(reacts[reac].id), dataPos, "3.0",
                                         meltReact[reac].datas[dataPos].nrm, colo);
            } else if (window.curveSource == "fdm") {
                retVal += createOneCurve(parseInt(reacts[reac].id), dataPos, "3.0",
                                         meltReact[reac].datas[dataPos].fdm, colo);
            } else {
                retVal += createOneCurve(parseInt(reacts[reac].id), dataPos, "3.0",
                                         reacts[reac].datas[dataPos].mdps, colo);
            }
        }
    }
    theSvg.innerHTML = retVal;
}

window.showReactSel = showReactSel;
function showReactSel(react, dataPos) {
    if (window.lastSelReact == react) {
        if (window.lastSelReact != "") {
            document.getElementById('plateTab_' + window.lastSelReact).style.border = "none";
            createOneHighCurve("", "")
            window.lastSelReact = ""
        }
    } else {
        document.getElementById('plateTab_' + react).style.border = "thick solid #006400";
        createOneHighCurve(react, dataPos)
        if (window.lastSelReact != "") {
            document.getElementById('plateTab_' + window.lastSelReact).style.border = "none";
        }
        window.lastSelReact = react
    }
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

function createOneCurve(id, dataPos, stroke_str, curveDots, col){
    var retVal = "<polyline fill='none' stroke-linejoin='round' stroke='" + col;
    retVal += "' stroke-width='" + stroke_str + "' points='";
    for (var i = 0; i < curveDots.length; i++) {
        var xPos = toSvgXScale(parseFloat(curveDots[i][0]));
        var yPos = toSvgSaveYScale(parseFloat(curveDots[i][1]));
        retVal += xPos + "," + yPos + " ";
    }
    retVal += "' onclick='showReactSel(" + id + ", " + dataPos + ")'/>";
    return retVal;
}

function createOneDots(reac, id, dataPos, stroke_str, curveDots, col){
    var retVal = ""
    if ((window.linRegPCRTable.length > 0) &&
        (window.sampSelFirst == "target") &&
        ((window.sampSelSecond != "7s8e45-Show-All") ||
         (window.sampSelThird != "7s8e45-Show-All"))) {

        if (window.reactData.hasOwnProperty("reacts")) {
            var reacts = window.reactData.reacts
            var i = window.reactToLinRegTable[parseInt(id)]
            var k = -1
            var runOn = true
            while ((runOn) && (parseInt(reacts[reac].id) == parseInt(window.linRegPCRTable[i][window.convertField["id"]]))) {
                if (reacts[reac].datas[dataPos].tar == window.linRegPCRTable[i][window.convertField["target"]]) {
                    k = i
                    runOn = false
                }
                i++
            }

            if (k > -1) {
                for (var i = 0; i < curveDots.length; i++) {
                    var svgFill = "none"
                    var svgRadius = "1.2"
                    var xVal = parseInt(curveDots[i][0])
                    var yVal = parseFloat(curveDots[i][1])
                    if ((parseInt(window.linRegPCRTable[k][window.convertField["n in log phase"]]) > 0) &
                        (xVal <= parseInt(window.linRegPCRTable[k][window.convertField["last log cycle"]])) &&
                        (xVal > parseInt(window.linRegPCRTable[k][window.convertField["last log cycle"]]) - parseInt(window.linRegPCRTable[k][window.convertField["n in log phase"]]))) {
                        svgRadius = "2.4"
                        if ((parseInt(window.linRegPCRTable[k][window.convertField["n included"]]) > 0) &&
                            (yVal > parseFloat(window.linRegPCRTable[k][window.convertField["lower limit"]])) &&
                            (yVal < parseFloat(window.linRegPCRTable[k][window.convertField["upper limit"]]))) {
                            svgFill = col
                       }
                    }
                    var xPos = toSvgXScale(parseFloat(xVal));
                    var yPos = toSvgSaveYScale(yVal);
                    retVal += "<circle cx='" + xPos + "' cy='" + yPos + "' r='" + svgRadius + "' stroke='" + col
                    retVal += "' stroke-width='0.9' fill='" + svgFill + "' />" + col;
                }
            }
        }
    }
    return retVal;
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
