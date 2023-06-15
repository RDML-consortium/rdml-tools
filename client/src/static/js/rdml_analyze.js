"use strict";

var jquery = require("jquery");
window.$ = window.jQuery = jquery; // notice the definition of global variables here

const API_URL = process.env.API_URL
const API_LINK = process.env.API_LINK

const resultLink = document.getElementById('uuid-link-box')

const resultSelReferences = document.getElementById('result-sel-references')

const submitButton = document.getElementById('btn-submit')
submitButton.addEventListener('click', showUpload)

const examplePlateTwoCorrButton = document.getElementById('btn-example-platecorr-two')
examplePlateTwoCorrButton.addEventListener('click', showPlateCorrTwoExample)

const examplePlateSixCorrButton = document.getElementById('btn-example-platecorr-six')
examplePlateSixCorrButton.addEventListener('click', showPlateCorrSixExample)

const exampleAbsolute = document.getElementById('btn-example-absolute')
exampleAbsolute.addEventListener('click', showAbsolute)

const exampleGenorm = document.getElementById('btn-example-genorm')
exampleGenorm.addEventListener('click', showGenorm)

const exampleRelative = document.getElementById('btn-example-relative')
exampleRelative.addEventListener('click', showRelative)

const interRunCorrButton = document.getElementById('btn-run-interruncorr')
interRunCorrButton.addEventListener('click', runInterRunCorr)

const absoluteQuanButton = document.getElementById('btn-run-absolute')
absoluteQuanButton.addEventListener('click', runAbsoluteQuan)

const genormButton = document.getElementById('btn-run-genorm')
genormButton.addEventListener('click', runGenorm)

const relativeButton = document.getElementById('btn-run-relative')
relativeButton.addEventListener('click', runRelative)

const interRunCorrRDMLButton = document.getElementById('btn-rdml-interruncorr')
interRunCorrRDMLButton.addEventListener('click', showRDMLSave)

const absoluteQuanRDMLButton = document.getElementById('btn-rdml-absolute')
absoluteQuanRDMLButton.addEventListener('click', showRDMLSave)

const genormRDMLButton = document.getElementById('btn-rdml-genorm')
genormRDMLButton.addEventListener('click', showRDMLSave)

const relativeRDMLButton = document.getElementById('btn-rdml-relative')
relativeRDMLButton.addEventListener('click', showRDMLSave)

const interRunCorrCopyButton = document.getElementById('btn-copy-interruncorr')
interRunCorrCopyButton.addEventListener('click', copyTabInterRunCorr)

const absoluteQuanCopyButton = document.getElementById('btn-copy-absolute')
absoluteQuanCopyButton.addEventListener('click', copyTabAbsoluteQuan)

const genormCopyButton = document.getElementById('btn-copy-genorm')
genormCopyButton.addEventListener('click', copyTabGenorm)

const relativeCopyButton = document.getElementById('btn-copy-relative')
relativeCopyButton.addEventListener('click', copyTabRelative)

const interRunCorrSaveButton = document.getElementById('btn-save-interruncorr')
interRunCorrSaveButton.addEventListener('click', saveTabInterRunCorr)

const absoluteQuanSaveButton = document.getElementById('btn-save-absolute')
absoluteQuanSaveButton.addEventListener('click', saveTabAbsoluteQuan)

const genormSaveButton = document.getElementById('btn-save-genorm')
genormSaveButton.addEventListener('click', saveTabGenorm)

const relativeSaveButton = document.getElementById('btn-save-relative')
relativeSaveButton.addEventListener('click', saveTabRelative)

const resSaveSVGMValButton = document.getElementById('btn-svg-mvalues')
resSaveSVGMValButton.addEventListener('click', saveMValsSVG)

const resSaveSVGVValButton = document.getElementById('btn-svg-vvalues')
resSaveSVGVValButton.addEventListener('click', saveVValsSVG)

const choiceIntRunAnno = document.getElementById('selInterAnnotation')
choiceIntRunAnno.addEventListener('change', updateIntRunAnno)

const choiceAbsoluteAnno = document.getElementById('selAbsoluteAnnotation')
choiceAbsoluteAnno.addEventListener('change', updateAbsoluteAnno)

const choiceGenormAnno = document.getElementById('selGenormAnnotation')
choiceGenormAnno.addEventListener('change', updateGenormAnno)

const choiceGenormAnVal = document.getElementById('selGenormAnVal')
choiceGenormAnVal.addEventListener('change', updateGenormAnVal)

const choiceRelativeAnno = document.getElementById('selRelativeAnnotation')
choiceRelativeAnno.addEventListener('change', updateRelativeAnno)

const choicePlateSeparator = document.getElementById('selPlateSeparator')
choicePlateSeparator.addEventListener('change', updatePlateResDeciSep)

const choiceAbsQuanSeparator = document.getElementById('selAbsoluteSeparator')
choiceAbsQuanSeparator.addEventListener('change', updateAbsQuanResDeciSep)

const choiceGenormSeparator = document.getElementById('selGenormSeparator')
choiceGenormSeparator.addEventListener('change', updateGenormResDeciSep)

const choiceRelativeSeparator = document.getElementById('selRelativeSeparator')
choiceRelativeSeparator.addEventListener('change', updateRelativeResDeciSep)

const rdmlLibVersion = document.getElementById('rdml_lib_version')

// For debugging
// const jsDebugButton = document.getElementById('btn-jsDebug')
// jsDebugButton.addEventListener('click', jsDebugFunction)

function jsDebugFunction() {
    alert("Ready to debug")
    saveTabFile("debug.txt", JSON.stringify(window.expData, null, 2))
    updateClientData()
}


const inputFile = document.getElementById('inputFile')
const resultInfo = document.getElementById('result-info')
const resultError = document.getElementById('result-error')

const selectorsData = document.getElementById('selectors-data')
const resultData = document.getElementById('result-data')
const resultInterRunCorr = document.getElementById('result-interruncorr')
const resultAbsoluteQant = document.getElementById('result-absolute')
const resultGenorm = document.getElementById('result-genorm')
const resultRelative = document.getElementById('result-relative')

window.uuid = "";
window.rdmlData = "";
window.expData = "";
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
window.selAnnoValue = "";

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

window.interRunCal = {};
window.interRunSaveTable = "";

window.absoluteQant = {};
window.absoluteQantSaveTable = "";
window.absoluteN0Corr = -1.0;
window.absoluteN0Unit = "";

window.genorm = {};
window.genormSaveTable = "";
window.genormSaveSVGMval = "";
window.genormSaveSVGVval = "";

window.relative = {};
window.selRefGenes = {};
window.relativeSaveTable = "";

window.tarToDye = {}
window.tarToNr = {}
window.samToNr = {}
window.samToType = {}
window.samAnnotations = {}
window.samToAnnotations = {}
window.samValues = {}

window.usedSamples = {}
window.usedTargets = {}
window.usedDyeIds = {}
window.usedDyeMaxPos = 0

function resetAllGlobalVal() {
    window.plateView = "plate";
    window.selAnnotation = "";
    window.selAnnoValue = "";
    window.samValues = {}
    hideElement(resultError)
    resetAllInterRun()
    resetAbsoluteQant()
    resetGenorm()
    resetRelative()
    window.selRefGenes = {};
    updateClientData()
}

function resetAllInterRun() {
    window.interRunCal = {};
    window.interRunSaveTable = "";
    resultInterRunCorr.innerHTML = "";
}

function resetAbsoluteQant() {
    window.absoluteQant = {};
    window.absoluteN0Corr = -1.0;
    window.absoluteN0Unit = "";
    window.absoluteQantTable = "";
    resultAbsoluteQant.innerHTML = "";
}

function resetGenorm() {
    window.genorm = {};
    window.genormSaveTable = "";
    window.genormSaveSVGMval = "";
    window.genormSaveSVGVval = "";
    resultGenorm.innerHTML = "";
}

function resetRelative() {
    window.relative = {};
    window.relativeSaveTable = "";
    resultRelative.innerHTML = "";
}

window.updatePlateDeciSep = updatePlateDeciSep
function updatePlateDeciSep() {
    var data = getSaveHtmlData("dropSelPlateDeciSep")
    if (data == "point") {
        window.decimalSepPoint = true;
    } else {
        window.decimalSepPoint = false;
    }
    updateAllDeciSep()
}

window.updatePlateResDeciSep = updatePlateResDeciSep
function updatePlateResDeciSep() {
    var data = getSaveHtmlData("selPlateSeparator")
    if (data == "point") {
        window.decimalSepPoint = true;
    } else {
        window.decimalSepPoint = false;
    }
    updateAllDeciSep()
}

window.updateAbsQuanResDeciSep = updateAbsQuanResDeciSep
function updateAbsQuanResDeciSep() {
    var data = getSaveHtmlData("selAbsoluteSeparator")
    if (data == "point") {
        window.decimalSepPoint = true;
    } else {
        window.decimalSepPoint = false;
    }
    updateAllDeciSep()
}

window.updateGenormResDeciSep = updateGenormResDeciSep
function updateGenormResDeciSep() {
    var data = getSaveHtmlData("selGenormSeparator")
    if (data == "point") {
        window.decimalSepPoint = true;
    } else {
        window.decimalSepPoint = false;
    }
    updateAllDeciSep()
}

window.updateRelativeResDeciSep = updateRelativeResDeciSep
function updateRelativeResDeciSep() {
    var data = getSaveHtmlData("selRelativeSeparator")
    if (data == "point") {
        window.decimalSepPoint = true;
    } else {
        window.decimalSepPoint = false;
    }
    updateAllDeciSep()
}

window.updateAllDeciSep = updateAllDeciSep
function updateAllDeciSep() {
    if (window.decimalSepPoint == true) {
        choicePlateSeparator.value = "point";
        choiceAbsQuanSeparator.value = "point";
        choiceGenormSeparator.value = "point";
        choiceRelativeSeparator.value = "point";
    } else {
        window.decimalSepPoint = false;
        choicePlateSeparator.value = "comma";
        choiceAbsQuanSeparator.value = "comma";
        choiceGenormSeparator.value = "comma";
        choiceRelativeSeparator.value = "comma";
    }
    updateClientData()
    updatePlateTable()
    updateAbsoluteTable()
    updateGenormTable()
    updateRelativeTable()
}


window.updateAnnotation = updateAnnotation
function updateAnnotation() {
    window.selAnnotation = getSaveHtmlData("dropSelAnnotation")
    updateAllAnnotations()
}

window.updateIntRunAnno = updateIntRunAnno
function updateIntRunAnno() {
    window.selAnnotation = getSaveHtmlData("selInterAnnotation")
    updateAllAnnotations()
}

window.updateAbsoluteAnno = updateAbsoluteAnno
function updateAbsoluteAnno() {
    window.selAnnotation = getSaveHtmlData("selAbsoluteAnnotation")
    updateAllAnnotations()
}

window.updateGenormAnno = updateGenormAnno
function updateGenormAnno() {
    window.selAnnotation = getSaveHtmlData("selGenormAnnotation")
    updateAllAnnotations()
}

window.updateGenormAnVal = updateGenormAnVal
function updateGenormAnVal() {
    window.selAnnoValue = getSaveHtmlData("selGenormAnVal")
    updateAllAnnotations()
}

window.updateRelativeAnno = updateRelativeAnno
function updateRelativeAnno() {
    window.selAnnotation = getSaveHtmlData("selRelativeAnnotation")
    updateAllAnnotations()
}

window.updateAllAnnotations = updateAllAnnotations
function updateAllAnnotations() {
    window.samToAnnotations = {}
    window.samValues = {}
    var exp = window.rdmlData.rdml.samples
    for (var i = 0; i < exp.length; i++) {
        if (exp[i].hasOwnProperty("annotations")) {
            for (var j = 0; j < exp[i].annotations.length; j++) {
                if (window.selAnnotation == exp[i].annotations[j].property) {
                    window.samToAnnotations[exp[i].id] = exp[i].annotations[j].value
                    window.samValues[exp[i].annotations[j].value] = 1
                }
            }
        }
    }
    updateClientData()
}

window.updateInterRunAnnotations = updateInterRunAnnotations
function updateInterRunAnnotations() {
    var selAn = document.getElementById("selInterAnnotation")
    for (var i = selAn.length - 1; i > 0; i--) {
        selAn.remove(i);
    }
    var allAnnotations = Object.keys(window.samAnnotations)
    for (var i = 0; i < allAnnotations.length; i++) {
        var opt = document.createElement('option');
        opt.value = allAnnotations[i];
        opt.innerHTML = allAnnotations[i];
        if (window.selAnnotation == allAnnotations[i]) {
            opt.selected = true;
        }
        selAn.appendChild(opt);
    }
}

window.updateAbsoluteAnnotations = updateAbsoluteAnnotations
function updateAbsoluteAnnotations() {
    var selAn = document.getElementById("selAbsoluteAnnotation")
    for (var i = selAn.length - 1; i > 0; i--) {
        selAn.remove(i);
    }
    var allAnnotations = Object.keys(window.samAnnotations)
    for (var i = 0; i < allAnnotations.length; i++) {
        var opt = document.createElement('option');
        opt.value = allAnnotations[i];
        opt.innerHTML = allAnnotations[i];
        if (window.selAnnotation == allAnnotations[i]) {
            opt.selected = true;
        }
        selAn.appendChild(opt);
    }
}

window.updateGenormAnnotations = updateGenormAnnotations
function updateGenormAnnotations() {
    var selAn = document.getElementById("selGenormAnnotation")
    for (var i = selAn.length - 1; i > 0; i--) {
        selAn.remove(i);
    }
    var allAnnotations = Object.keys(window.samAnnotations)
    for (var i = 0; i < allAnnotations.length; i++) {
        var opt = document.createElement('option');
        opt.value = allAnnotations[i];
        opt.innerHTML = allAnnotations[i];
        if (window.selAnnotation == allAnnotations[i]) {
            opt.selected = true;
        }
        selAn.appendChild(opt);
    }
    var selVal = document.getElementById("selGenormAnVal")
    for (var i = selVal.length - 1; i > 0; i--) {
        selVal.remove(i);
    }
    var allAnnotVals = Object.keys(window.samValues)
    for (var i = 0; i < allAnnotVals.length; i++) {
        var opt = document.createElement('option');
        opt.value = allAnnotVals[i];
        opt.innerHTML = allAnnotVals[i];
        if (window.selAnnoValue == allAnnotVals[i]) {
            opt.selected = true;
        }
        selVal.appendChild(opt);
    }
}

window.updateRelativeAnnotations = updateRelativeAnnotations
function updateRelativeAnnotations() {
    var selAn = document.getElementById("selRelativeAnnotation")
    for (var i = selAn.length - 1; i > 0; i--) {
        selAn.remove(i);
    }
    var allAnnotations = Object.keys(window.samAnnotations)
    for (var i = 0; i < allAnnotations.length; i++) {
        var opt = document.createElement('option');
        opt.value = allAnnotations[i];
        opt.innerHTML = allAnnotations[i];
        if (window.selAnnotation == allAnnotations[i]) {
            opt.selected = true;
        }
        selAn.appendChild(opt);
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

function niceQuantityType(txt) {
    if (txt == "cop") {
        return "copies per microliter"
    }
    if (txt == "fold") {
        return "fold change"
    }
    if (txt == "dil") {
        return "dilution"
    }
    if (txt == "nMol") {
        return "nanomol per microliter"
    }
    if (txt == "ng") {
        return "nanogram per microliter"
    }
    if (txt == "other") {
        return "other unit"
    }
    return txt
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

function showPlateCorrTwoExample() {
    resetAllGlobalVal()
    window.selRun = "";
    window.selPCRStyle = "classic";
    window.selExperiment = "Plate Correction";
    window.selRunOnLoad = "Plate 1";
    window.selDigitalOnLoad = "none";

    updateServerData("platecorrtwo", '{"mode": "upload", "validate": true}')
    $('[href="#runs-tab"]').tab('show')
}

function showPlateCorrSixExample() {
    resetAllGlobalVal()
    window.selRun = "";
    window.selPCRStyle = "classic";
    window.selExperiment = "Inter Run Correction";
    window.selRunOnLoad = "Run 1";
    window.selDigitalOnLoad = "none";

    updateServerData("platecorrsix", '{"mode": "upload", "validate": true}')
    $('[href="#runs-tab"]').tab('show')
}

function showAbsolute() {
    resetAllGlobalVal()
    window.selRun = "";
    window.selPCRStyle = "classic";
    window.selExperiment = "Reference Sample";
    window.selRunOnLoad = "Vermeulen Merge";
    window.selDigitalOnLoad = "none";

    updateServerData("absolute", '{"mode": "upload", "validate": true}')
    $('[href="#runs-tab"]').tab('show')
}

function showGenorm() {
    resetAllGlobalVal()
    window.selRun = "";
    window.selPCRStyle = "classic";
    window.selExperiment = "geNorm";
    window.selRunOnLoad = "Run geNorm";
    window.selDigitalOnLoad = "none";

    updateServerData("genorm", '{"mode": "upload", "validate": true}')
    $('[href="#runs-tab"]').tab('show')
}

function showRelative() {
    resetAllGlobalVal()
    window.selRun = "";
    window.selPCRStyle = "classic";
    window.selExperiment = "Relative Quantification";
    window.selRunOnLoad = "Run Relative Quantification";
    window.selDigitalOnLoad = "none";

    updateServerData("relative", '{"mode": "upload", "validate": true}')
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

function runInterRunCorr() {
    if (window.selExperiment == "") {
        alert("Select an experiment first!")
        return
    }
    var rUpdateRDML = false
    var bbUpdateRDML = document.getElementById('updateRDMLData')
    if ((bbUpdateRDML) && (bbUpdateRDML.value == "y")) {
        rUpdateRDML = true
    }
    resultInterRunCorr.innerHTML = ""
    hideElement(resultError)
    window.plateView = "list";

    var ret = {}
    ret["mode"] = "run-interruncorr"
    ret["sel-experiment"] = window.selExperiment
    ret["overlap-type"] = getSaveHtmlData("selOverlapType")
    ret["sel-annotation"] = window.selAnnotation
    ret["update-RDML-data"] = rUpdateRDML
    updateServerData(uuid, JSON.stringify(ret))

    $('[href="#interrun-tab"]').tab('show')
}

function runAbsoluteQuan() {
    if (window.selExperiment == "") {
        alert("Select an experiment first!")
        return
    }
    var inclAnno = false
    var inclAnno = document.getElementById('choiceIncludeAnnotationsAbs')
    if ((inclAnno) && (inclAnno.value == "y")) {
        inclAnno = true
    }
    resultAbsoluteQant.innerHTML = ""
    hideElement(resultError)
    window.plateView = "list";

    var ret = {}
    ret["mode"] = "run-absolute-quantification"
    ret["sel-experiment"] = window.selExperiment
    ret["absolute-method"] = getSaveHtmlData("selAbsoluteMethod")
    ret["absolute-unit"] = getSaveHtmlData("selAbsoluteUnit")
    ret["estimate-missing"] = getSaveHtmlData("selAbsoluteMissTar")
    ret["overlap-type"] = getSaveHtmlData("selOverlapAbsolute")
    ret["sel-annotation"] = window.selAnnotation
    ret["incl-annotation"] = inclAnno
    updateServerData(uuid, JSON.stringify(ret))

    $('[href="#absolute-tab"]').tab('show')
}

function runGenorm() {
    if (window.selExperiment == "") {
        alert("Select an experiment first!")
        return
    }
    resultGenorm.innerHTML = ""
    hideElement(resultError)
    
    var ret = {}
    ret["mode"] = "run-genorm"
    ret["sel-experiment"] = window.selExperiment
    ret["sel-sam-gen"] = getSaveHtmlData("selSamplesGenorm")
    ret["sel-annotation"] = window.selAnnotation
    ret["sel-anno-val"] = window.selAnnoValue
    updateServerData(uuid, JSON.stringify(ret))

    $('[href="#genorm-tab"]').tab('show')
}

function runRelative() {
    if (window.selExperiment == "") {
        alert("Select an experiment first!")
        return
    }
    resultRelative.innerHTML = ""
    hideElement(resultError)

    var selRefs = []
    var allRefList = getSaveHtmlData('all-used-references')
    if (allRefList != "") {
        var allRefIds = allRefList.split(";")
        for (var refPos = 0; refPos < allRefIds.length; refPos++) {
            if (allRefIds[refPos].length > 0) {
                var el = document.getElementById(allRefIds[refPos]);
                if (el) {
                    if (el.checked) {
                        selRefs.push(el.value);
                    }
                }
            }
        }
    }

    var inclAnno = false
    var inclAnno = document.getElementById('choiceIncludeAnnotationsRel')
    if ((inclAnno) && (inclAnno.value == "y")) {
        inclAnno = true
    }

    var ret = {}
    ret["mode"] = "run-relative"
    ret["sel-experiment"] = window.selExperiment
    ret["overlap-type"] = getSaveHtmlData("selOverlapRelative")
    ret["sel-annotation"] = window.selAnnotation
    ret["stats-parametric"] = getSaveHtmlData("selStatsParametric")
    ret["incl-annotation"] = inclAnno
    ret["sel-references"] = selRefs
    updateServerData(uuid, JSON.stringify(ret))

    $('[href="#relative-tab"]').tab('show')
}

// TODO client-side validation
function updateServerData(stat, reqData) {
    const formData = new FormData()
    if (stat == "platecorrtwo") {
        formData.append('showPlateCorrTwoExample', 'showPlateCorrExample')
    } else if (stat == "platecorrsix") {
        formData.append('showPlateCorrSixExample', 'showPlateCorrSixExample')
    } else if (stat == "absolute") {
        formData.append('showAbsolute', 'showAbsolute')
    } else if (stat == "genorm") {
        formData.append('showGenorm', 'showGenorm')
    } else if (stat == "relative") {
        formData.append('showRelative', 'showRelative')
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
                    window.expData = res.data.data.reactsdata
                    window.reactData = "";
                    if (res.data.data.hasOwnProperty("interruncal")) {
                        window.interRunCal = res.data.data.interruncal
                        updatePlateTable()
                    }
                    if (res.data.data.hasOwnProperty("absolutequan")) {
                        window.absoluteQant = res.data.data.absolutequan
                        window.absoluteN0Corr = res.data.data.absolutequan.fluorN0Fact
                        window.absoluteN0Unit = res.data.data.absolutequan.absUnit
                        updateAbsoluteTable()
                    }
                    if (res.data.data.hasOwnProperty("genorm")) {
                        window.genorm = res.data.data.genorm
                        window.genormSaveSVGMval = window.genorm.svg.m_values;
                        if (window.genorm.svg.hasOwnProperty("v_values")) {
                                window.genormSaveSVGVval = window.genorm.svg.v_values;
                            } else {
                                window.genormSaveSVGVval = "";
                            }
                        updateGenormTable()
                    }
                    if (res.data.data.hasOwnProperty("relative")) {
                        window.relative = res.data.data.relative
                        updateRelativeTable()
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
    if (window.expData.hasOwnProperty("runs")) {
        for (var run in window.expData.runs) {
            if (window.selRun == window.expData.runs[run]["id"]) {
                window.reactData = window.expData.runs[run]["AllData"]
            }
        }
    }

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
    if (!(toolhtml == 'linregpcr.html')) {
        ret += '<p>Analyze Run in LinRegPCR:<br />'
        ret += '<a href="' + apiLink + "linregpcr.html?UUID=" + uuuid + ';TAB=runs-tab'
        ret += experiment + run + '" target="_blank">'
        ret += apiLink  + "linregpcr.html?UUID=" + uuuid + ';TAB=runs-tab'
        ret += experiment + run + '</a> (valid for 3 days)\n<br />\n</p>\n'
    }
    if (!(toolhtml == 'analyze.html')) {
        ret += '<p>Analyze Experiment in RDML-Analyze:<br />'
        ret += '<a href="' + apiLink + "analyze.html?UUID=" + uuuid + ';TAB=runs-tab'
        ret += experiment + run + '" target="_blank">'
        ret += apiLink  + "analyze.html?UUID=" + uuuid + ';TAB=runs-tab'
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
    if (window.selRunOnLoad != "") {
        window.selRun = window.selRunOnLoad
        if ((window.rdmlData.hasOwnProperty("rdml")) && (window.selExperiment != "") && (window.selRun != "")){
            var ret = {}
            ret["mode"] = "get-exp-data-react"
            ret["sel-experiment"] = window.selExperiment
            window.selRunOnLoad = ""
            updateServerData(uuid, JSON.stringify(ret))
        }
        return
    }
    if (window.reloadRun == true) {
        var ret = {}
        ret["mode"] = "get-exp-data-react"
        ret["sel-experiment"] = window.selExperiment
        window.reloadRun = false
        updateServerData(uuid, JSON.stringify(ret))
        return
    }

    // The UUID box
    var ret = '<br />' + createLinkBox(`${API_LINK}`, `${API_URL}`, 'analyze.html', window.uuid, window.isvalid, window.selExperiment, window.selRun);
    if (window.isvalid == "invalid") {
        resultError.innerHTML = '<i class="fas fa-fire"></i>\n<span id="error-message">' +
                                'Error: Uploaded file is not valid RDML!</span>'
        showElement(resultError)
    }
    resultLink.innerHTML = ret

    if (!(window.rdmlData.hasOwnProperty("rdml"))) {
        return
    }
    ret = ''
    var exp = window.rdmlData.rdml.experiments;

    ret = '<table style="width:100%;">'
    ret += '  <tr>\n    <td style="width:8%;background-color: #e6e6e6;">Experiment:</td>\n'
    ret += '<td style="width:29%;background-color: #e6e6e6;">'
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
    ret += '<td style="width:2%;background-color: #e6e6e6;"></td><td style="width:2%;"></td>'
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
    ret += '<td style="width:2%;"></td><td style="width:2%;background-color: #e6e6e6;"></td>'
    ret += '    <td style="width:7%;background-color: #e6e6e6;">PCR type:</td>\n'
    ret += '<td style="width:11%;background-color: #e6e6e6;">'
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
    ret += '>Run</option>\n'
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
    ret += '  <td style="width:12%;">Selected Annotation:</td>\n<td style="width:14%;">'
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
    ret += '</td>\n<td style="width:2%;"></td>\n</tr>\n'
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
                                                cell += floatWithFixPrec(reacts[reac].datas[dataPos].ampEff, 4)
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
                                        if (window.selRawCq == true) {
                                            cell += 'raw Cq: '
                                            if (reacts[reac].datas[dataPos].hasOwnProperty("cq")) {
                                                cell += floatWithFixPrec(reacts[reac].datas[dataPos].cq, 2)
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
                                        if (window.selCorCq == true) {
                                            cell += 'Cq: '
                                            if (reacts[reac].datas[dataPos].hasOwnProperty("corrCq")) {
                                                cell += floatWithFixPrec(reacts[reac].datas[dataPos].corrCq, 2)
                                            }
                                            cell += '<br />'
                                        }
                                        if (window.selCorF == true) {
                                            cell += 'Corr F: '
                                            if (reacts[reac].datas[dataPos].hasOwnProperty("corrF")) {
                                                cell += floatWithFixPrec(reacts[reac].datas[dataPos].corrF, 2)
                                            } else {
                                                cell += floatWithFixPrec('1.0', 2)
                                            }
                                            cell += '<br />'
                                        }
                                        if (window.selCorP == true) {
                                            cell += 'Corr P: '
                                            if (reacts[reac].datas[dataPos].hasOwnProperty("corrP")) {
                                                cell += floatWithFixPrec(reacts[reac].datas[dataPos].corrP, 2)
                                            } else {
                                                cell += floatWithFixPrec('1.0', 2)
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
            ret += '<td>Run</td>'
            csv += 'Run\t'
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
                ret += '<td>raw N0</td>'
                csv += 'raw N0\t'
                ret += '<td>raw Cq</td>'
                csv += 'raw Cq\t'
                ret += '<td>corr F</td>'
                csv += 'corr F\t'
                ret += '<td>corr P</td>'
                csv += 'corr P\t'
                ret += '<td>corr N0</td>'
                csv += 'corr N0\t'
                ret += '<td>corr Cq</td>'
                csv += 'corr Cq'
                if (window.absoluteN0Unit != "") {
                    ret += '<td>' + niceQuantityType(window.absoluteN0Unit) + '</td>'
                    csv += '\t' +  niceQuantityType(window.absoluteN0Unit)
                }
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
                csv += 'Excluded'
            }
            csv += '\n'
            ret += '</tr>\n'
            for (var plRun in window.expData.runs) {
                reacts = window.expData.runs[plRun]["AllData"].reacts
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
                                        ret += '  <tr>\n  <td>' + window.expData.runs[plRun]["id"] + '</td>'
                                        csv += window.expData.runs[plRun]["id"] + '\t'
                                        ret += '  <td>' + combCol + '</td>'
                                        csv += combCol + '\t'
                                        ret += '<td>' + (reac + 1) + '</td>'
                                        csv += (reac + 1) + '\t'
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
                                            ret += floatWithFixPrec(reacts[reac].datas[dataPos].ampEff, 4)
                                            csv += floatWithFixPrec(reacts[reac].datas[dataPos].ampEff, 4)
                                        }
                                        ret += '</td>\n<td>'
                                        csv += '\t'
                                        if (reacts[reac].datas[dataPos].hasOwnProperty("N0")) {
                                            ret += floatWithExPrec(reacts[reac].datas[dataPos].N0, 2)
                                            csv += floatWithExPrec(reacts[reac].datas[dataPos].N0, 2)
                                        }
                                        ret += '</td>\n<td>'
                                        csv += '\t'
                                        if (reacts[reac].datas[dataPos].hasOwnProperty("cq")) {
                                            ret += floatWithFixPrec(reacts[reac].datas[dataPos].cq, 2)
                                            csv += floatWithFixPrec(reacts[reac].datas[dataPos].cq, 2)
                                        }
                                        ret += '</td>\n<td>'
                                        csv += '\t'
                                        if (reacts[reac].datas[dataPos].hasOwnProperty("corrF")) {
                                            ret += floatWithFixPrec(reacts[reac].datas[dataPos].corrF, 4)
                                            csv += floatWithFixPrec(reacts[reac].datas[dataPos].corrF, 4)
                                        } else {
                                            ret += floatWithFixPrec('1.0', 4)
                                            csv += floatWithFixPrec('1.0', 4)
                                        }
                                        ret += '</td>\n<td>'
                                        csv += '\t'
                                        if (reacts[reac].datas[dataPos].hasOwnProperty("corrP")) {
                                            ret += floatWithFixPrec(reacts[reac].datas[dataPos].corrP, 4)
                                            csv += floatWithFixPrec(reacts[reac].datas[dataPos].corrP, 4)
                                        } else {
                                            ret += floatWithFixPrec('1.0', 4)
                                            csv += floatWithFixPrec('1.0', 4)
                                        }
                                        ret += '</td>\n<td>'
                                        csv += '\t'
                                        if (reacts[reac].datas[dataPos].hasOwnProperty("corrN0")) {
                                            ret += floatWithExPrec(reacts[reac].datas[dataPos].corrN0, 2)
                                            csv += floatWithExPrec(reacts[reac].datas[dataPos].corrN0, 2)
                                        }
                                        ret += '</td>\n<td>'
                                        csv += '\t'
                                        if (reacts[reac].datas[dataPos].hasOwnProperty("corrCq")) {
                                            ret += floatWithFixPrec(reacts[reac].datas[dataPos].corrCq, 2)
                                            csv += floatWithFixPrec(reacts[reac].datas[dataPos].corrCq, 2)
                                        }
                                        if (window.absoluteN0Unit  != "") {
                                            ret += '</td>\n<td style="text-align: right;">'
                                            csv += '\t'
                                            if ((reacts[reac].datas[dataPos].hasOwnProperty("corrN0")) &&
                                                (parseFloat(reacts[reac].datas[dataPos].corrN0) > 0.0) &&
                                                (window.absoluteN0Corr.hasOwnProperty(reacts[reac].datas[dataPos].tar)) &&
                                                (parseFloat(window.absoluteN0Corr[reacts[reac].datas[dataPos].tar]) > 0.0)) {
                                                var fN0 = parseFloat(reacts[reac].datas[dataPos].corrN0)
                                                var cN0 = parseFloat(window.absoluteN0Corr[reacts[reac].datas[dataPos].tar]);
                                                if (window.absoluteN0Unit == "cop") {
                                                    ret += floatWithFixPrec(fN0 / cN0, 2)
                                                    csv += floatWithFixPrec(fN0 / cN0, 2)
                                                } else {
                                                    ret += floatWithExPrec(fN0 / cN0, 2)
                                                    csv += floatWithExPrec(fN0 / cN0, 2)
                                                }
                                            }
                                        }
                                        ret += '</td>\n</tr>\n'
                                        csv += '\n'
                                    }
                                } else {
                                    if ((reacts[reac].hasOwnProperty("partitions")) &&
                                        (reacts[reac].partitions.hasOwnProperty("datas")) &&
                                        (window.reactData.max_partition_data_len > 0)) {
                                        for (var dataPos = 0; dataPos < reacts[reac].partitions.datas.length; dataPos++) {
                                            ret += '  <tr>\n  <td>' + window.expData.runs[plRun]["id"] + '</td>'
                                            csv += window.expData.runs[plRun]["id"] + '\t'
                                            ret += '  <td>' + combCol + '</td>'
                                            csv += combCol + '\t'
                                            ret += '<td>' + (reac + 1) + '</td>'
                                            csv += (reac + 1) + '\t'
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
            }
            ret += '</table>'
        }
    }
    resultData.innerHTML = ret
    window.plateSaveTable = csv

    if ((window.expData.hasOwnProperty("used_references")) && (window.expData.used_references.length != 0)) {
        var refs = window.expData.used_references;
        var refList = '<input type="hidden" id="all-used-references" value="';
        var refBox = "<h4>Selected Reference Genes for Correction:</h4>";
        for (var refPos = 0; refPos < refs.length; refPos++) {
            var refId = "reference-sel-" + refs[refPos].replace(/[^A-Za-z0-9_]/g, "");
            refList += refId + ";"
            refBox += '<div class="form-check form-check-inline">'
            refBox += '  <label class="form-check-label">'
            refBox += '    <input type="checkbox" class="form-check-input" id="' + refId + '"'
            refBox += ' value="' + refs[refPos] +'"'
            refBox += ' onchange="window.selRefGene(\'' + refId + '\')"'
            if (!(window.selRefGenes.hasOwnProperty(refId))) {
                window.selRefGenes[refId] = true;
            }
            if (window.selRefGenes[refId] == true) {
                refBox += ' checked'
            }
            refBox += '>' + refs[refPos]
            refBox += '  </label>'
            refBox += '</div>'

        }
        refList = refList.replace(/;$/g, "") + '">\n'
        resultSelReferences.innerHTML = refBox + "\n" + refList;
    }
    updateInterRunAnnotations()
    updateAbsoluteAnnotations()
    updateGenormAnnotations()
    updateRelativeAnnotations()
}

window.selRefGene = selRefGene
function selRefGene(selId) {
    var el = document.getElementById(selId);
    if (el) {
        if (window.selRefGenes.hasOwnProperty(selId)) {
            window.selRefGenes[selId] = el.checked;
        }
    }
}

function tsvGetMaxColumns(tsvString, maxColumns) {
    maxColumns = parseInt(maxColumns)
    var tsvLines = tsvString.split("\n")
    for (var row = 0 ; row < tsvLines.length ; row++) {
        var tsvCells = tsvLines[row].split("\t")
        if (tsvCells.length > maxColumns) {
            maxColumns = tsvCells.length
        }
    }
    return maxColumns
}

function tsvToTableSection(tsvString, maxColumns) {
    maxColumns = parseInt(maxColumns)
    var ret = ''
    var tsvLines = tsvString.split("\n")
    for (var row = 0 ; row < tsvLines.length - 1 ; row++) {
        ret += '<tr>\n'
        var tsvCells = tsvLines[row].split("\t")
        for (var col = 0 ; col < maxColumns ; col++) {
            if (col < tsvCells.length) {
                if ((row == 0) || (col == 0)) {
                    ret += '<th>'
                } else {
                    ret += '<td>'
                }
                if ((window.decimalSepPoint == false) && (row != 0) && (col != 0)) {
                    ret += tsvCells[col].replace(/\./g, ',');
                } else {
                    ret += tsvCells[col]
                }
                if ((row == 0) || (col == 0)) {
                    ret += '</th>'
                } else {
                    ret += '</td>'
                }
            } else {
                ret += '<td></td>'
            }
        }
        ret += '</tr>\n'
    }
    return ret
}

function tsvToTableSectionHead(tsvString, maxColumns) {
    maxColumns = parseInt(maxColumns)
    var ret = ''
    var tsvLines = tsvString.split("\n")
    for (var row = 0 ; row < tsvLines.length - 1 ; row++) {
        ret += '<tr>\n'
        var tsvCells = tsvLines[row].split("\t")
        for (var col = 0 ; col < maxColumns ; col++) {
            if (col < tsvCells.length) {
                if (row == 0) {
                    ret += '<th>'
                } else {
                    ret += '<td>'
                }
                if ((window.decimalSepPoint == false) && (row != 0)) {
                    ret += tsvCells[col].replace(/\./g, ',');
                } else {
                    ret += tsvCells[col]
                }
                if (row == 0) {
                    ret += '</th>'
                } else {
                    ret += '</td>'
                }
            } else {
                ret += '<td></td>'
            }
        }
        ret += '</tr>\n'
    }
    return ret
}

function tsvToTableSectionNoRaw(tsvString, maxColumns) {
    maxColumns = parseInt(maxColumns)
    var ret = ''
    var rawCol = -1
    var tsvLines = tsvString.split("\n")
    for (var row = 0 ; row < tsvLines.length - 1 ; row++) {
        ret += '<tr>\n'
        var tsvCells = tsvLines[row].split("\t")
        var rawVals = ""
        for (var col = 0 ; col < maxColumns ; col++) {
            if (col < tsvCells.length) {
                if (row == 0) {
                    if (col != maxColumns - 1) {
                        if (tsvCells[col] == "Individual Values") {
                            rawCol = col
                        }
                    }
                    ret += '<th>'
                } else {
                    ret += '<td>'
                }

                if (rawCol == col ) {
                    rawVals = tsvCells[col]
                } else if ((window.decimalSepPoint == false) && (row != 0)) {
                    ret += tsvCells[col].replace(/\./g, ',');
                } else  {
                    ret += tsvCells[col]
                }

                if (row == 0) {
                    ret += '</th>'
                } else {
                    ret += '</td>'
                }
            } else {
                if (row == 0) {
                     ret += '<th>'
                } else {
                    ret += '<td>'
                }
                if (col == maxColumns - 1) {
                    if ((window.decimalSepPoint == false) && (row != 0)) {
                        ret += rawVals.replace(/\./g, ',');
                    } else {
                        ret += rawVals
                    }
                }

                if (row == 0) {
                    ret += '</th>'
                } else {
                    ret += '</td>'
                }
            }
        }
        ret += '</tr>\n'
    }
    return ret
}
function tsvToTsvSection(tsvString, maxColumns) {
    maxColumns = parseInt(maxColumns)
    var ret = ''
    var tsvLines = tsvString.split("\n")
    for (var row = 0 ; row < tsvLines.length - 1 ; row++) {
        var tsvCells = tsvLines[row].split("\t")
        for (var col = 0 ; col < maxColumns ; col++) {
            if (col < tsvCells.length) {
                if ((window.decimalSepPoint == false) && (row != 0) && (col != 0)) {
                    ret += tsvCells[col].replace(/\./g, ',');
                } else {
                    ret += tsvCells[col]
                }
            }
            if (col + 1 != maxColumns) {
                ret += '\t'
            }
        }
        ret += '\n'
    }
    return ret
}

function tsvToTsvSectionNoRaw(tsvString, maxColumns) {
    maxColumns = parseInt(maxColumns)
    var ret = ''
    var rawCol = -1
    var tsvLines = tsvString.split("\n")
    for (var row = 0 ; row < tsvLines.length - 1 ; row++) {
        var tsvCells = tsvLines[row].split("\t")
        var rawVals = ""
        for (var col = 0 ; col < maxColumns ; col++) {
            if (col < tsvCells.length) {
                if (row == 0) {
                    if (col != maxColumns - 1) {
                        if (tsvCells[col] == "Individual Values") {
                            rawCol = col
                        }
                    }
                }

                if (rawCol == col ) {
                    rawVals = tsvCells[col]
                } else if ((window.decimalSepPoint == false) && (row != 0)) {
                    ret += tsvCells[col].replace(/\./g, ',');
                } else {
                    ret += tsvCells[col]
                }
            }
            if (col + 1 != maxColumns) {
                ret += '\t'
            } else {
                if ((window.decimalSepPoint == false) && (row != 0)) {
                    ret += rawVals.replace(/\./g, ',');
                } else {
                    ret += rawVals
                }
            }
        }
        ret += '\n'
    }
    return ret
}


function tsvToTableHeadline(note, maxColumns) {
    return '<tr>\n<th colspan="' + maxColumns + '">' + note + '</th></tr>\n'
}

function tsvToTsvHeadline(note, maxColumns) {
    maxColumns = parseInt(maxColumns)
    var ret = ''
    for (var col = 0 ; col < maxColumns ; col++) {
        if (col == 0) {
            ret += note
        }
        if (col + 1 != maxColumns) {
            ret += '\t'
        }
    }
    ret += '\n'
    return ret
}


window.updatePlateTable = updatePlateTable
function updatePlateTable() {
    if (!(window.interRunCal.hasOwnProperty("plate"))) {
        return
    }
    var maxCols = 0
    maxCols = tsvGetMaxColumns(window.interRunCal.tsv.run_correction_factors, maxCols)
    maxCols = tsvGetMaxColumns(window.interRunCal.tsv.pcr_efficiency, maxCols)
    maxCols = tsvGetMaxColumns(window.interRunCal.tsv.threshold, maxCols)
    maxCols = tsvGetMaxColumns(window.interRunCal.tsv.overlapping_conditions, maxCols)

    var ret = '<p>The calculated results are displayed in the RunView tab.</p>\n'
    ret += '<table class="table table-bordered table-striped" id="plate-corr-result-table">\n'
    var content = ""
    ret += tsvToTableHeadline("Correction Factors", maxCols)
    content += tsvToTsvHeadline("Correction Factors", maxCols)
    ret += tsvToTableSection(window.interRunCal.tsv.run_correction_factors, maxCols)
    content += tsvToTsvSection(window.interRunCal.tsv.run_correction_factors, maxCols)
    ret += tsvToTableHeadline("", maxCols)
    content += tsvToTsvHeadline("", maxCols)
    ret += tsvToTableHeadline("PCR Efficiency", maxCols)
    content += tsvToTsvHeadline("PCR Efficiency", maxCols)
    ret += tsvToTableSection(window.interRunCal.tsv.pcr_efficiency, maxCols)
    content += tsvToTsvSection(window.interRunCal.tsv.pcr_efficiency, maxCols)
    ret += tsvToTableHeadline("", maxCols)
    content += tsvToTsvHeadline("", maxCols)
    ret += tsvToTableHeadline("Threshold", maxCols)
    content += tsvToTsvHeadline("Threshold", maxCols)
    ret += tsvToTableSection(window.interRunCal.tsv.threshold, maxCols)
    content += tsvToTsvSection(window.interRunCal.tsv.threshold, maxCols)
    ret += tsvToTableHeadline("", maxCols)
    content += tsvToTsvHeadline("", maxCols)
    ret += tsvToTableHeadline("Overlapping Conditions", maxCols)
    content += tsvToTsvHeadline("Overlapping Conditions", maxCols)
    ret += tsvToTableSection(window.interRunCal.tsv.overlapping_conditions, maxCols)
    content += tsvToTsvSection(window.interRunCal.tsv.overlapping_conditions, maxCols)
    ret += '</table>\n'
    window.interRunSaveTable = content
    resultInterRunCorr.innerHTML = ret
}

window.updateAbsoluteTable = updateAbsoluteTable
function updateAbsoluteTable() {
    if (!(window.absoluteQant.hasOwnProperty("fluorN0Fact"))) {
        return
    }
    var maxCols = 0
    maxCols = tsvGetMaxColumns(window.absoluteQant.tsv.fluorN0Fact, maxCols)
    maxCols = tsvGetMaxColumns(window.absoluteQant.tsv.threshold, maxCols)
    maxCols = tsvGetMaxColumns(window.absoluteQant.tsv.pcr_efficiency, maxCols)
    if (window.absoluteQant.tsv.hasOwnProperty("dilStandard")) {
        maxCols = tsvGetMaxColumns(window.absoluteQant.tsv.dilStandard, maxCols)
    }
    if (window.absoluteQant.tsv.hasOwnProperty("standard")) {
        maxCols = tsvGetMaxColumns(window.absoluteQant.tsv.standard, maxCols)
    }
    maxCols = tsvGetMaxColumns(window.absoluteQant.tsv.technical_data, maxCols)
    if (window.absoluteQant.tsv.hasOwnProperty("annotation_data")) {
        maxCols = tsvGetMaxColumns(window.absoluteQant.tsv.annotation_data, maxCols)
    }

    var ret = '<p>The calculated results are displayed in the RunView tab.</p>\n'
    ret += '<table class="table table-bordered table-striped" id="absolute-quan-result-table">\n'
    var content = ""
    ret += tsvToTableHeadline("Quantification Factor", maxCols)
    content += tsvToTsvHeadline("Quantification Factor", maxCols)
    ret += tsvToTableSection(window.absoluteQant.tsv.fluorN0Fact, maxCols)
    content += tsvToTsvSection(window.absoluteQant.tsv.fluorN0Fact, maxCols)
    ret += tsvToTableHeadline("", maxCols)
    content += tsvToTsvHeadline("", maxCols)
    ret += tsvToTableHeadline("Threshold", maxCols)
    content += tsvToTsvHeadline("Threshold", maxCols)
    ret += tsvToTableSection(window.absoluteQant.tsv.threshold, maxCols)
    content += tsvToTsvSection(window.absoluteQant.tsv.threshold, maxCols)
    ret += tsvToTableHeadline("", maxCols)
    content += tsvToTsvHeadline("", maxCols)
    ret += tsvToTableHeadline("PCR Efficiency", maxCols)
    content += tsvToTsvHeadline("PCR Efficiency", maxCols)
    ret += tsvToTableSection(window.absoluteQant.tsv.pcr_efficiency, maxCols)
    content += tsvToTsvSection(window.absoluteQant.tsv.pcr_efficiency, maxCols)
    ret += tsvToTableHeadline("", maxCols)
    content += tsvToTsvHeadline("", maxCols)
    if (window.absoluteQant.tsv.hasOwnProperty("dilStandard")) {
        ret += tsvToTableHeadline("Dilution Curves", maxCols)
        content += tsvToTsvHeadline("Dilution Curves", maxCols)
        ret += tsvToTableSection(window.absoluteQant.tsv.dilStandard, maxCols)
        content += tsvToTsvSection(window.absoluteQant.tsv.dilStandard, maxCols)
        ret += tsvToTableHeadline("", maxCols)
        content += tsvToTsvHeadline("", maxCols)
    }
    if (window.absoluteQant.tsv.hasOwnProperty("standard")) {
        ret += tsvToTableHeadline("Samples with Concentrations", maxCols)
        content += tsvToTsvHeadline("Samples with Concentrations", maxCols)
        ret += tsvToTableSection(window.absoluteQant.tsv.standard, maxCols)
        content += tsvToTsvSection(window.absoluteQant.tsv.standard, maxCols)
        ret += tsvToTableHeadline("", maxCols)
        content += tsvToTsvHeadline("", maxCols)
    }
    ret += tsvToTableHeadline("Technical Replicates", maxCols)
    content += tsvToTsvHeadline("Technical Replicates", maxCols)
    ret += tsvToTableSectionNoRaw(window.absoluteQant.tsv.technical_data, maxCols)
    content += tsvToTsvSectionNoRaw(window.absoluteQant.tsv.technical_data, maxCols)
    ret += tsvToTableHeadline("", maxCols)
    content += tsvToTsvHeadline("", maxCols)
    if (window.absoluteQant.tsv.hasOwnProperty("annotation_data")) {
        ret += tsvToTableHeadline("Expression by Annotation", maxCols)
        content += tsvToTsvHeadline("Expression by Annotation", maxCols)
        ret += tsvToTableSectionNoRaw(window.absoluteQant.tsv.annotation_data, maxCols)
        content += tsvToTsvSectionNoRaw(window.absoluteQant.tsv.annotation_data, maxCols)
        ret += tsvToTableHeadline("", maxCols)
        content += tsvToTsvHeadline("", maxCols)
    }
    window.absoluteQantSaveTable = content
    resultAbsoluteQant.innerHTML = ret
}

window.updateGenormTable = updateGenormTable
function updateGenormTable() {
    if (!(window.genorm.hasOwnProperty("tsv"))) {
        return
    }
    if (!(window.genorm.tsv.hasOwnProperty("m_values"))) {
        return
    }
    var maxCols = 0
    maxCols = tsvGetMaxColumns(window.genorm.tsv.m_values, maxCols)
    if (window.genorm.tsv.hasOwnProperty("v_values")) {
        maxCols = tsvGetMaxColumns(window.genorm.tsv.v_values, maxCols)
    }
    maxCols = tsvGetMaxColumns(window.genorm.tsv.n0_count, maxCols)
    maxCols = tsvGetMaxColumns(window.genorm.tsv.n0_values, maxCols)
    var ret = ""
    var content = ""

    ret += '<img src="data:image/svg+xml,' +  encodeURIComponent(window.genormSaveSVGMval) + '" alt="M-values-SVG" width="500px">'
    ret += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
    if (window.genorm.tsv.hasOwnProperty("v_values")) {
        ret += '<img src="data:image/svg+xml,' +  encodeURIComponent(window.genormSaveSVGVval) + '" alt="V-values-SVG" width="500px">'
    }

    ret += '<br /><br />\n'
    ret += '<table class="table table-bordered table-striped" id="genorm-result-table">\n'
    ret += tsvToTableHeadline("M-values", maxCols)
    content += tsvToTsvHeadline("M-values", maxCols)
    ret += tsvToTableSection(window.genorm.tsv.m_values, maxCols)
    content += tsvToTsvSection(window.genorm.tsv.m_values, maxCols)
    ret += tsvToTableHeadline("", maxCols)
    content += tsvToTsvHeadline("", maxCols)
    if (window.genorm.tsv.hasOwnProperty("v_values")) {
        ret += tsvToTableHeadline("V-values", maxCols)
        content += tsvToTsvHeadline("V-values", maxCols)
        ret += tsvToTableSection(window.genorm.tsv.v_values, maxCols)
        content += tsvToTsvSection(window.genorm.tsv.v_values, maxCols)
        ret += tsvToTableHeadline("", maxCols)
        content += tsvToTsvHeadline("", maxCols)
    }
    ret += tsvToTableHeadline("Found Conditions", maxCols)
    content += tsvToTsvHeadline("Found Conditions", maxCols)
    ret += tsvToTableSection(window.genorm.tsv.n0_count, maxCols)
    content += tsvToTsvSection(window.genorm.tsv.n0_count, maxCols)
    ret += tsvToTableHeadline("", maxCols)
    content += tsvToTsvHeadline("", maxCols)
    ret += tsvToTableHeadline("Gemetric Mean of N0", maxCols)
    content += tsvToTsvHeadline("Gemetric Mean of N0", maxCols)
    ret += tsvToTableSection(window.genorm.tsv.n0_values, maxCols)
    content += tsvToTsvSection(window.genorm.tsv.n0_values, maxCols)
    ret += '</table>\n'

    window.genormSaveTable = content
    resultGenorm.innerHTML = ret
}

window.updateRelativeTable = updateRelativeTable
function updateRelativeTable() {
    if (!(window.relative.hasOwnProperty("tsv"))) {
        return
    }
    if (!(window.relative.tsv.hasOwnProperty("technical_data"))) {
        return
    }
    var ret = ""
    var content = ""
    var maxCols = 0

    maxCols = tsvGetMaxColumns(window.relative.tsv.technical_data, maxCols)
    maxCols = tsvGetMaxColumns(window.relative.tsv.reference_data, maxCols)
    maxCols = tsvGetMaxColumns(window.relative.tsv.relative_data, maxCols)
    if (window.relative.tsv.hasOwnProperty("annotation_data")) {
        maxCols = tsvGetMaxColumns(window.relative.tsv.annotation_data, maxCols)
        maxCols = tsvGetMaxColumns(window.relative.tsv.statistics_data, maxCols)
        if (window.relative.tsv.hasOwnProperty("statistics_multi_comp")) {
            if (window.relative.tsv.statistics_multi_comp !=  "") {
                maxCols = tsvGetMaxColumns(window.relative.tsv.statistics_multi_comp, maxCols)
            }
        }
    }

    ret += '<br /><br />\n'
    ret += '<table class="table table-bordered table-striped" id="relative-result-table">\n'
    ret += tsvToTableHeadline("Technical Replicates", maxCols)
    content += tsvToTsvHeadline("Technical Replicates", maxCols)
    ret += tsvToTableSectionNoRaw(window.relative.tsv.technical_data, maxCols)
    content += tsvToTsvSectionNoRaw(window.relative.tsv.technical_data, maxCols)
    ret += tsvToTableHeadline("", maxCols)
    content += tsvToTsvHeadline("", maxCols)
    ret += tsvToTableHeadline("Reference Genes", maxCols)
    content += tsvToTsvHeadline("Reference Genes", maxCols)
    ret += tsvToTableSectionNoRaw(window.relative.tsv.reference_data, maxCols)
    content += tsvToTsvSectionNoRaw(window.relative.tsv.reference_data, maxCols)
    ret += tsvToTableHeadline("", maxCols)
    content += tsvToTsvHeadline("", maxCols)
    ret += tsvToTableHeadline("Relative Expression", maxCols)
    content += tsvToTsvHeadline("Relative Expression", maxCols)
    ret += tsvToTableSectionNoRaw(window.relative.tsv.relative_data, maxCols)
    content += tsvToTsvSectionNoRaw(window.relative.tsv.relative_data, maxCols)
    if (window.relative.tsv.hasOwnProperty("annotation_data")) {
        ret += tsvToTableHeadline("", maxCols)
        content += tsvToTsvHeadline("", maxCols)
        ret += tsvToTableHeadline("Expression by Annotation", maxCols)
        content += tsvToTsvHeadline("Expression by Annotation", maxCols)
        ret += tsvToTableSectionNoRaw(window.relative.tsv.annotation_data, maxCols)
        content += tsvToTsvSectionNoRaw(window.relative.tsv.annotation_data, maxCols)
        ret += tsvToTableHeadline("", maxCols)
        content += tsvToTsvHeadline("", maxCols)
        ret += tsvToTableHeadline("Statistics", maxCols)
        content += tsvToTsvHeadline("Statistics", maxCols)
        ret += tsvToTableSectionNoRaw(window.relative.tsv.statistics_data, maxCols)
        content += tsvToTsvSectionNoRaw(window.relative.tsv.statistics_data, maxCols)
        if (window.relative.tsv.hasOwnProperty("statistics_multi_comp")) {
            if (window.relative.tsv.statistics_multi_comp !=  "") {
                ret += tsvToTableHeadline("", maxCols)
                content += tsvToTsvHeadline("", maxCols)
                ret += tsvToTableHeadline("Multiple Comparison Result", maxCols)
                content += tsvToTsvHeadline("Multiple Comparison Result", maxCols)
                ret += tsvToTableSectionNoRaw(window.relative.tsv.statistics_multi_comp, maxCols)
                content += tsvToTsvSectionNoRaw(window.relative.tsv.statistics_multi_comp, maxCols)
            }
        }
    }
    ret += '</table>\n'

    if (window.relative.tsv.hasOwnProperty("annotation_data")) {
        ret += '<br /><h4>Visualize with RDML-BarGraph:</h4>\n<p>'
        ret += '<a href="' + `${API_LINK}` + "bargraph.html?UUID=" + window.uuid + '" target="_blank">'
        ret += `${API_LINK}`  + "bargraph.html?UUID=" + window.uuid + '</a> (valid for 3 days)\n<br />\n</p>\n'
    }

    window.relativeSaveTable = content
    resultRelative.innerHTML = ret
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
    saveTabFile("Experiment_Data.tsv", window.plateSaveTable)
    return;
};

window.saveTabInterRunCorr = saveTabInterRunCorr;
function saveTabInterRunCorr() {
    saveTabFile("Experiment_Overview.tsv", window.interRunSaveTable)
    return;
};

window.saveTabAbsoluteQuan = saveTabAbsoluteQuan;
function saveTabAbsoluteQuan() {
    saveTabFile("Absolute_Quantification.tsv", window.absoluteQantSaveTable)
    return;
};

window.saveTabGenorm = saveTabGenorm;
function saveTabGenorm() {
    saveTabFile("Genorm.tsv", window.genormSaveTable)
    return;
};

window.saveTabRelative = saveTabRelative;
function saveTabRelative() {
    saveTabFile("Relative.tsv", window.relativeSaveTable)
    return;
};

window.copyPlateTable = copyPlateTable;
function copyPlateTable() {
    var el = document.getElementById("rdmlPlateVTab");
    copyTableById(el);
    return;
};

window.copyTabInterRunCorr = copyTabInterRunCorr;
function copyTabInterRunCorr() {
    var el = document.getElementById("plate-corr-result-table");
    copyTableById(el);
    return;
};

window.copyTabAbsoluteQuan = copyTabAbsoluteQuan;
function copyTabAbsoluteQuan() {
    var el = document.getElementById("absolute-quan-result-table");
    copyTableById(el);
    return;
};

window.copyTabGenorm = copyTabGenorm;
function copyTabGenorm() {
    var el = document.getElementById("genorm-result-table");
    copyTableById(el);
    return;
};

window.copyTabRelative = copyTabRelative;
function copyTabRelative() {
    var el = document.getElementById("relative-result-table");
    copyTableById(el);
    return;
};

window.copyTableById = copyTableById;
function copyTableById(el) {
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
    resetAllInterRun()
    window.selExperiment = newData
    window.selRun = ""
    var ret = {}
    ret["mode"] = "get-exp-data-react"
    ret["sel-experiment"] = window.selExperiment
    updateServerData(uuid, JSON.stringify(ret))
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
    fillLookupDics()
    updateClientData()
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
function saveSVGFile(content, fileName) {
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

window.saveMValsSVG = saveMValsSVG;
function saveMValsSVG() {
    saveSVGFile(window.genormSaveSVGMval, "geNorm_M_values.svg")
    return;
}

window.saveVValsSVG = saveVValsSVG;
function saveVValsSVG() {
    saveSVGFile(window.genormSaveSVGVval, "geNorm_V_values.svg")
    return;
}

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
