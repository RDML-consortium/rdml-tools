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
const inputFile = document.getElementById('inputFile')
const addFile = document.getElementById('addFile')
const resultInfo = document.getElementById('result-info')
const resultError = document.getElementById('result-error')
const resultData = document.getElementById('result-data')

window.uuid = "";
window.rdmlBase = "";
window.baseIsValid = "untested";
window.rdmlAdd = "";
window.addIsValid = "untested";

function resetAllGlobalVal() {
    hideElement(resultError)
    updateClientData()
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
    }
    if (tab != "") {
        $('[href="#' + tab + '"]').tab('show')
    }
    if (uuid != "") {
        updateServerData(uuid, '{"mode": "upload", "validate": true}')
        $('[href="#runs-tab"]').tab('show')
    }
}

$('#mainTab a').on('click', function(e) {
    e.preventDefault()
    $(this).tab('show')
})

function showExample() {
    resetAllGlobalVal()
    updateServerData("example", '{"mode": "upload", "validate": true}')
    $('[href="#runs-tab"]').tab('show')
}

function showUpload() {
    resetAllGlobalVal()
    updateServerData("data", '{"mode": "upload", "validate": true}')
    $('[href="#runs-tab"]').tab('show')
}

window.moveElement = moveElement
function moveElement(element, selId, addMode) {
    resetAllGlobalVal()
    var ret = {}
    ret["mode"] = "modify"
    ret["validate"] = true
    ret["ele-type"] = element
    ret["ele-id"] = selId
    ret["add-mode"] = addMode
    updateServerData(window.uuid, JSON.stringify(ret))
    $('[href="#runs-tab"]').tab('show')
}

// TODO client-side validation
function updateServerData(stat, reqData) {
    const formData = new FormData()
    if (stat == "example") {
        formData.append('showExample', 'showExample')
    } else if (stat == "data") {
        formData.append('queryFile', inputFile.files[0])
        formData.append('addFile', addFile.files[0])
    } else {
        formData.append('uuid', stat)
    }
    formData.append('reqData', reqData)

    showElement(resultInfo)

    axios
        .post(`${API_URL}/merge`, formData)
        .then(res => {
	        if (res.status === 200) {
                window.rdmlBase = res.data.data.basedata
                window.rdmlAdd = res.data.data.adddata
                window.uuid = res.data.data.uuid
                rdmlLibVersion.innerHTML = "rdmlpython version: " + res.data.data.rdml_lib_version
                if (res.data.data.hasOwnProperty("baseisvalid")) {
                    if (res.data.data.baseisvalid) {
                        window.baseIsValid = "valid"
                    } else {
                        window.baseIsValid = "invalid"
                    }
                } else {
                    window.baseIsValid = "untested"
                }
                if (res.data.data.hasOwnProperty("addisvalid")) {
                    if (res.data.data.addisvalid) {
                        window.addIsValid = "valid"
                    } else {
                        window.addIsValid = "invalid"
                    }
                } else {
                    window.addIsValid = "untested"
                }
                hideElement(resultInfo)
                if (res.data.data.hasOwnProperty("error")) {
                    showElement(resultError)
                    var err = '<i class="fas fa-fire"></i>\n<span id="error-message">'
                    err += res.data.data.error + '</span>'
                    resultError.innerHTML = err
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

window.updateClientData = updateClientData
function updateClientData() {
    // The UUID box
    var ret = '<br /><div class="card">\n<div class="card-body">\n'
    ret += '<h5 class="card-title">Links to other RDML tools</h5>\n<p>Link to this result page:<br />'
    ret += '<a href="' + `${API_LINK}` + "merge.html?UUID=" + window.uuid + '" target="_blank">'
    ret += `${API_LINK}` + "merge.html?UUID=" + window.uuid + '</a> (valid for 3 days)\n<br />\n'
    ret += '</p>\n'
    ret += '<p>Download RDML file:<br />'
    var stuffer = new Date();
    var stufferStr = stuffer.getTime()
    ret += '<a href="' + `${API_URL}` + "/download/" + window.uuid + '?UNIQUE=' + stufferStr
    ret += '" target="_blank" id="download-link">'
    ret += `${API_URL}` + "/download/" + window.uuid + '</a> (valid for 3 days)\n<br />\n'
    ret += '</p>\n'
    ret += '<p>View single run in RunView:<br />'
    ret += '<a href="' + `${API_LINK}` + "runview.html?UUID=" + window.uuid + '" target="_blank">'
    ret += `${API_LINK}`  + "runview.html?UUID=" + window.uuid + '</a> (valid for 3 days)\n<br />\n'
    ret += '</p>\n'
    ret += '<p>View or edit RDML file:<br />'
    ret += '<a href="' + `${API_LINK}` + "edit.html?UUID=" + window.uuid + '" target="_blank">'
    ret += `${API_LINK}` + "edit.html?UUID=" + window.uuid + '</a> (valid for 3 days)\n</p>\n'
    ret += '<p>Click here to validate RDML file:<br />'
    ret += '<a href="' + `${API_LINK}` + "validate.html?UUID=" + window.uuid + '" target="_blank">'
    ret += `${API_LINK}` + "validate.html?UUID=" + window.uuid + '</a> (valid for 3 days)\n<br />\n'
    ret += '</p>\n</div>\n</div>\n'
    resultLink.innerHTML = ret

    if ((!(window.rdmlBase.hasOwnProperty("rdml"))) || (!(window.rdmlAdd.hasOwnProperty("rdml")))) {
        return
    }
    var ret = ''
    var baseData = window.rdmlBase.rdml;
    var addData = window.rdmlAdd.rdml;

    var joinExperimenters = {}  // 1: base, 2: add, 3: both
    for (var i = 0; i < baseData.experimenters.length; i++) {
        joinExperimenters[baseData.experimenters[i].id] = 0
    }
    for (var i = 0; i < addData.experimenters.length; i++) {
        joinExperimenters[addData.experimenters[i].id] = 0
    }
    for (var i = 0; i < baseData.experimenters.length; i++) {
        joinExperimenters[baseData.experimenters[i].id] += 1
    }
    for (var i = 0; i < addData.experimenters.length; i++) {
        joinExperimenters[addData.experimenters[i].id] += 2
    }

    var joinDocumentations = {}  // 1: base, 2: add, 3: both
    for (var i = 0; i < baseData.documentations.length; i++) {
        joinDocumentations[baseData.documentations[i].id] = 0
    }
    for (var i = 0; i < addData.documentations.length; i++) {
        joinDocumentations[addData.documentations[i].id] = 0
    }
    for (var i = 0; i < baseData.documentations.length; i++) {
        joinDocumentations[baseData.documentations[i].id] += 1
    }
    for (var i = 0; i < addData.documentations.length; i++) {
        joinDocumentations[addData.documentations[i].id] += 2
    }

    var joinDyes = {}  // 1: base, 2: add, 3: both
    for (var i = 0; i < baseData.dyes.length; i++) {
        joinDyes[baseData.dyes[i].id] = 0
    }
    for (var i = 0; i < addData.dyes.length; i++) {
        joinDyes[addData.dyes[i].id] = 0
    }
    for (var i = 0; i < baseData.dyes.length; i++) {
        joinDyes[baseData.dyes[i].id] += 1
    }
    for (var i = 0; i < addData.dyes.length; i++) {
        joinDyes[addData.dyes[i].id] += 2
    }

    var joinSamples = {}  // 1: base, 2: add, 3: both
    for (var i = 0; i < baseData.samples.length; i++) {
        joinSamples[baseData.samples[i].id] = 0
    }
    for (var i = 0; i < addData.samples.length; i++) {
        joinSamples[addData.samples[i].id] = 0
    }
    for (var i = 0; i < baseData.samples.length; i++) {
        joinSamples[baseData.samples[i].id] += 1
    }
    for (var i = 0; i < addData.samples.length; i++) {
        joinSamples[addData.samples[i].id] += 2
    }

    var joinTargets = {}  // 1: base, 2: add, 3: both
    for (var i = 0; i < baseData.targets.length; i++) {
        joinTargets[baseData.targets[i].id] = 0
    }
    for (var i = 0; i < addData.targets.length; i++) {
        joinTargets[addData.targets[i].id] = 0
    }
    for (var i = 0; i < baseData.targets.length; i++) {
        joinTargets[baseData.targets[i].id] += 1
    }
    for (var i = 0; i < addData.targets.length; i++) {
        joinTargets[addData.targets[i].id] += 2
    }

    var joinThermCycCons = {}  // 1: base, 2: add, 3: both
    for (var i = 0; i < baseData.therm_cyc_cons.length; i++) {
        joinThermCycCons[baseData.therm_cyc_cons[i].id] = 0
    }
    for (var i = 0; i < addData.therm_cyc_cons.length; i++) {
        joinThermCycCons[addData.therm_cyc_cons[i].id] = 0
    }
    for (var i = 0; i < baseData.therm_cyc_cons.length; i++) {
        joinThermCycCons[baseData.therm_cyc_cons[i].id] += 1
    }
    for (var i = 0; i < addData.therm_cyc_cons.length; i++) {
        joinThermCycCons[addData.therm_cyc_cons[i].id] += 2
    }

    var joinExperiments = {}  // 1: base, 2: add, 3: both
    for (var i = 0; i < baseData.experiments.length; i++) {
        joinExperiments[baseData.experiments[i].id] = 0
    }
    for (var i = 0; i < addData.experiments.length; i++) {
        joinExperiments[addData.experiments[i].id] = 0
    }
    for (var i = 0; i < baseData.experiments.length; i++) {
        joinExperiments[baseData.experiments[i].id] += 1
    }
    for (var i = 0; i < addData.experiments.length; i++) {
        joinExperiments[addData.experiments[i].id] += 2
    }

    ret = ''
    var joinExperimentsList = Object.keys(joinExperiments)
    joinExperimentsList.sort()
    if (joinExperimentsList.length > 0) {
        ret += '<br /><br />\n'
        ret += '<h2>Experiments:</h2>\n'
        ret += '<p>\n<td colspan="5"><button type="button" class="btn btn-success" '
        ret += 'onclick="moveElement(\'all-experiments\', \'not required\', \'update\');"'
        ret += '>Update existing Experiments (-)</button>&nbsp;&nbsp;&nbsp;&nbsp;\n'
        ret += '  <button type="button" class="btn btn-success" '
        ret += 'onclick="moveElement(\'all-experiments\', \'not required\', \'update-incl-dep\');"'
        ret += '>Update existing Experiments (+)</button><br /><br />\n'
        ret += '  <button type="button" class="btn btn-success" '
        ret += 'onclick="moveElement(\'all-experiments\', \'not required\', \'only-new\');"'
        ret += '>Copy only additional Experiments (-)</button>&nbsp;&nbsp;&nbsp;&nbsp;\n'
        ret += '  <button type="button" class="btn btn-success" '
        ret += 'onclick="moveElement(\'all-experiments\', \'not required\', \'only-new-incl-dep\');"'
        ret += '>Copy only additional Experiments(+)</button><br /><br />\n'
        ret += '  <button type="button" class="btn btn-success" '
        ret += 'onclick="moveElement(\'all-experiments\', \'not required\', \'all\');"'
        ret += '>Copy all Experiments (-)</button>&nbsp;&nbsp;&nbsp;&nbsp;\n'
        ret += '  <button type="button" class="btn btn-success" '
        ret += 'onclick="moveElement(\'all-experiments\', \'not required\', \'all-incl-dep\');"'
        ret += '>Copy all Experiments (+)</button><br /><br />\n'
        ret += '</p>\n'
        ret += '<table style="width:100%;">'
        ret += '  <tr>\n'
        ret += '     <th style="width:20%;">Base RDML</th>\n'
        ret += '     <th style="width:20%;">RDML to Add</th>\n'
        ret += '     <th style="width:20%;"></th>\n'
        ret += '     <th style="width:40%;"></th>\n'
        ret += '  </tr>\n'
    }
    for (var i = 0; i < joinExperimentsList.length; i++) {
        var currId = joinExperimentsList[i]
        var found = joinExperiments[currId]
        // alert(currId + " - " + found)
        ret += '  <tr>\n'
        if ((found == 1) || (found == 3)) {
            ret += '     <td>' + currId + '</td>\n'
        } else {
            ret += '     <td></td>\n'
        }
        if ((found == 2) || (found == 3)) {
            ret += '     <td>' + currId + '</td>\n'
            ret += '     <td><button type="button" class="btn btn-success" '
            ret += 'onclick="moveElement(\'experiment\', \'' + currId + '\', \'only-new\');"'
            ret += '>Copy ' + currId + ' (-)</button></td>\n'
            ret += '     <td><button type="button" class="btn btn-success" '
            ret += 'onclick="moveElement(\'experiment\', \'' + currId + '\', \'all-dep\');"'
            ret += '>Copy ' + currId + ' (+)</button></td>\n'
        } else {
            ret += '     <td></td>\n'
            ret += '     <td></td>\n'
            ret += '     <td></td>\n'
        }
        ret += '  </tr>\n'
    }
    if (joinExperimentsList.length > 0) {
        ret += '</table>\n'
    }

    var joinTargetsList = Object.keys(joinTargets)
    joinTargetsList.sort()
    if (joinTargetsList.length > 0) {
        ret += '<br /><br />\n'
        ret += '<h2>Targets:</h2>\n'
        ret += '<p>\n<td colspan="5"><button type="button" class="btn btn-success" '
        ret += 'onclick="moveElement(\'all-targets\', \'not required\', \'update\');"'
        ret += '>Update existing Targets (-)</button>&nbsp;&nbsp;&nbsp;&nbsp;\n'
        ret += '  <button type="button" class="btn btn-success" '
        ret += 'onclick="moveElement(\'all-targets\', \'not required\', \'update-incl-dep\');"'
        ret += '>Update existing Targets (+)</button><br /><br />\n'
        ret += '  <button type="button" class="btn btn-success" '
        ret += 'onclick="moveElement(\'all-targets\', \'not required\', \'only-new\');"'
        ret += '>Copy only additional Targets (-)</button>&nbsp;&nbsp;&nbsp;&nbsp;\n'
        ret += '  <button type="button" class="btn btn-success" '
        ret += 'onclick="moveElement(\'all-targets\', \'not required\', \'only-new-incl-dep\');"'
        ret += '>Copy only additional Targets(+)</button><br /><br />\n'
        ret += '  <button type="button" class="btn btn-success" '
        ret += 'onclick="moveElement(\'all-targets\', \'not required\', \'all\');"'
        ret += '>Copy all Targets (-)</button>&nbsp;&nbsp;&nbsp;&nbsp;\n'
        ret += '  <button type="button" class="btn btn-success" '
        ret += 'onclick="moveElement(\'all-targets\', \'not required\', \'all-incl-dep\');"'
        ret += '>Copy all Targets (+)</button><br /><br />\n'
        ret += '</p>\n'
        ret += '<table style="width:100%;">'
        ret += '  <tr>\n'
        ret += '     <th style="width:20%;">Base RDML</th>\n'
        ret += '     <th style="width:20%;">RDML to Add</th>\n'
        ret += '     <th style="width:20%;"></th>\n'
        ret += '     <th style="width:40%;"></th>\n'
        ret += '  </tr>\n'
    }
    for (var i = 0; i < joinTargetsList.length; i++) {
        var currId = joinTargetsList[i]
        var found = joinTargets[currId]
        // alert(currId + " - " + found)
        ret += '  <tr>\n'
        if ((found == 1) || (found == 3)) {
            ret += '     <td>' + currId + '</td>\n'
        } else {
            ret += '     <td></td>\n'
        }
        if ((found == 2) || (found == 3)) {
            ret += '     <td>' + currId + '</td>\n'
            ret += '     <td><button type="button" class="btn btn-success" '
            ret += 'onclick="moveElement(\'target\', \'' + currId + '\', \'only-new\');"'
            ret += '>Copy ' + currId + ' (-)</button></td>\n'
            ret += '     <td><button type="button" class="btn btn-success" '
            ret += 'onclick="moveElement(\'target\', \'' + currId + '\', \'all-dep\');"'
            ret += '>Copy ' + currId + ' (+)</button></td>\n'
        } else {
            ret += '     <td></td>\n'
            ret += '     <td></td>\n'
            ret += '     <td></td>\n'
        }
        ret += '  </tr>\n'
    }
    if (joinTargetsList.length > 0) {
        ret += '</table>\n'
    }

    var joinDyesList = Object.keys(joinDyes)
    joinDyesList.sort()
    if (joinDyesList.length > 0) {
        ret += '<br /><br />\n'
        ret += '<h2>Dyes:</h2>\n'
        ret += '<p>\n<td colspan="5"><button type="button" class="btn btn-success" '
        ret += 'onclick="moveElement(\'all-dyes\', \'not required\', \'update\');"'
        ret += '>Update existing Dyes</button>&nbsp;&nbsp;&nbsp;&nbsp;\n'
        ret += '  <button type="button" class="btn btn-success" '
        ret += 'onclick="moveElement(\'all-dyes\', \'not required\', \'only-new\');"'
        ret += '>Copy only additional Dyes</button>&nbsp;&nbsp;&nbsp;&nbsp;\n'
        ret += '  <button type="button" class="btn btn-success" '
        ret += 'onclick="moveElement(\'all-dyes\', \'not required\', \'all\');"'
        ret += '>Copy all Dyes</button><br /><br />\n'
        ret += '</p>\n'
        ret += '<table style="width:100%;">'
        ret += '  <tr>\n'
        ret += '     <th style="width:20%;">Base RDML</th>\n'
        ret += '     <th style="width:20%;">RDML to Add</th>\n'
        ret += '     <th style="width:20%;"></th>\n'
        ret += '     <th style="width:40%;"></th>\n'
        ret += '  </tr>\n'
    }
    for (var i = 0; i < joinDyesList.length; i++) {
        var currId = joinDyesList[i]
        var found = joinDyes[currId]
        // alert(currId + " - " + found)
        ret += '  <tr>\n'
        if ((found == 1) || (found == 3)) {
            ret += '     <td>' + currId + '</td>\n'
        } else {
            ret += '     <td></td>\n'
        }
        if ((found == 2) || (found == 3)) {
            ret += '     <td>' + currId + '</td>\n'
            ret += '     <td><button type="button" class="btn btn-success" '
            ret += 'onclick="moveElement(\'dye\', \'' + currId + '\', \'only-new\');"'
            ret += '>Copy ' + currId + '</button></td>\n'
            ret += '     <td></td>\n'
        } else {
            ret += '     <td></td>\n'
            ret += '     <td></td>\n'
            ret += '     <td></td>\n'
        }
        ret += '  </tr>\n'
    }
    if (joinDyesList.length > 0) {
        ret += '</table>\n'
    }

    var joinThermCycConsList = Object.keys(joinThermCycCons)
    joinThermCycConsList.sort()
    if (joinThermCycConsList.length > 0) {
        ret += '<br /><br />\n'
        ret += '<h2>Thermal Cycling Conditions:</h2>\n'
        ret += '<p>\n<td colspan="5"><button type="button" class="btn btn-success" '
        ret += 'onclick="moveElement(\'all-thermCycCons\', \'not required\', \'update\');"'
        ret += '>Update existing ThermCycCons (-)</button>&nbsp;&nbsp;&nbsp;&nbsp;\n'
        ret += '  <button type="button" class="btn btn-success" '
        ret += 'onclick="moveElement(\'all-thermCycCons\', \'not required\', \'update-incl-dep\');"'
        ret += '>Update existing ThermCycCons (+)</button><br /><br />\n'
        ret += '  <button type="button" class="btn btn-success" '
        ret += 'onclick="moveElement(\'all-thermCycCons\', \'not required\', \'only-new\');"'
        ret += '>Copy only additional ThermCycCons (-)</button>&nbsp;&nbsp;&nbsp;&nbsp;\n'
        ret += '  <button type="button" class="btn btn-success" '
        ret += 'onclick="moveElement(\'all-thermCycCons\', \'not required\', \'only-new-incl-dep\');"'
        ret += '>Copy only additional ThermCycCons(+)</button><br /><br />\n'
        ret += '  <button type="button" class="btn btn-success" '
        ret += 'onclick="moveElement(\'all-thermCycCons\', \'not required\', \'all\');"'
        ret += '>Copy all ThermCycCons (-)</button>&nbsp;&nbsp;&nbsp;&nbsp;\n'
        ret += '  <button type="button" class="btn btn-success" '
        ret += 'onclick="moveElement(\'all-thermCycCons\', \'not required\', \'all-incl-dep\');"'
        ret += '>Copy all ThermCycCons (+)</button><br /><br />\n'
        ret += '</p>\n'
        ret += '<table style="width:100%;">'
        ret += '  <tr>\n'
        ret += '     <th style="width:20%;">Base RDML</th>\n'
        ret += '     <th style="width:20%;">RDML to Add</th>\n'
        ret += '     <th style="width:20%;"></th>\n'
        ret += '     <th style="width:40%;"></th>\n'
        ret += '  </tr>\n'
    }
    for (var i = 0; i < joinThermCycConsList.length; i++) {
        var currId = joinThermCycConsList[i]
        var found = joinThermCycCons[currId]
        // alert(currId + " - " + found)
        ret += '  <tr>\n'
        if ((found == 1) || (found == 3)) {
            ret += '     <td>' + currId + '</td>\n'
        } else {
            ret += '     <td></td>\n'
        }
        if ((found == 2) || (found == 3)) {
            ret += '     <td>' + currId + '</td>\n'
            ret += '     <td><button type="button" class="btn btn-success" '
            ret += 'onclick="moveElement(\'thermCycCon\', \'' + currId + '\', \'only-new\');"'
            ret += '>Copy ' + currId + ' (-)</button></td>\n'
            ret += '     <td><button type="button" class="btn btn-success" '
            ret += 'onclick="moveElement(\'thermCycCon\', \'' + currId + '\', \'all-dep\');"'
            ret += '>Copy ' + currId + ' (+)</button></td>\n'
        } else {
            ret += '     <td></td>\n'
            ret += '     <td></td>\n'
            ret += '     <td></td>\n'
        }
        ret += '  </tr>\n'
    }
    if (joinThermCycConsList.length > 0) {
        ret += '</table>\n'
    }

    var joinDocumentationsList = Object.keys(joinDocumentations)
    joinDocumentationsList.sort()
    if (joinDocumentationsList.length > 0) {
        ret += '<br /><br />\n'
        ret += '<h2>Documentations:</h2>\n'
        ret += '<p>\n<td colspan="5"><button type="button" class="btn btn-success" '
        ret += 'onclick="moveElement(\'all-documentations\', \'not required\', \'update\');"'
        ret += '>Update existing Documentations</button>&nbsp;&nbsp;&nbsp;&nbsp;\n'
        ret += '  <button type="button" class="btn btn-success" '
        ret += 'onclick="moveElement(\'all-documentations\', \'not required\', \'only-new\');"'
        ret += '>Copy only additional Documentations</button>&nbsp;&nbsp;&nbsp;&nbsp;\n'
        ret += '  <button type="button" class="btn btn-success" '
        ret += 'onclick="moveElement(\'all-documentations\', \'not required\', \'all\');"'
        ret += '>Copy all Documentations</button><br /><br />\n'
        ret += '</p>\n'
        ret += '<table style="width:100%;">'
        ret += '  <tr>\n'
        ret += '     <th style="width:20%;">Base RDML</th>\n'
        ret += '     <th style="width:20%;">RDML to Add</th>\n'
        ret += '     <th style="width:20%;"></th>\n'
        ret += '     <th style="width:40%;"></th>\n'
        ret += '  </tr>\n'
    }
    for (var i = 0; i < joinDocumentationsList.length; i++) {
        var currId = joinDocumentationsList[i]
        var found = joinDocumentations[currId]
        // alert(currId + " - " + found)
        ret += '  <tr>\n'
        if ((found == 1) || (found == 3)) {
            ret += '     <td>' + currId + '</td>\n'
        } else {
            ret += '     <td></td>\n'
        }
        if ((found == 2) || (found == 3)) {
            ret += '     <td>' + currId + '</td>\n'
            ret += '     <td><button type="button" class="btn btn-success" '
            ret += 'onclick="moveElement(\'documentation\', \'' + currId + '\', \'only-new\');"'
            ret += '>Copy ' + currId + '</button></td>\n'
            ret += '     <td></td>\n'
        } else {
            ret += '     <td></td>\n'
            ret += '     <td></td>\n'
            ret += '     <td></td>\n'
        }
        ret += '  </tr>\n'
    }
    if (joinDocumentationsList.length > 0) {
        ret += '</table>\n'
    }

    var joinExperimentersList = Object.keys(joinExperimenters)
    joinExperimentersList.sort()
    if (joinExperimentersList.length > 0) {
        ret += '<h2>Experimenters:</h2>\n'
        ret += '<p>\n<td colspan="5"><button type="button" class="btn btn-success" '
        ret += 'onclick="moveElement(\'all-experimenters\', \'not required\', \'update\');"'
        ret += '>Update existing Experimenters</button>&nbsp;&nbsp;&nbsp;&nbsp;\n'
        ret += '  <button type="button" class="btn btn-success" '
        ret += 'onclick="moveElement(\'all-experimenters\', \'not required\', \'only-new\');"'
        ret += '>Copy only additional Experimenters</button>&nbsp;&nbsp;&nbsp;&nbsp;\n'
        ret += '  <button type="button" class="btn btn-success" '
        ret += 'onclick="moveElement(\'all-experimenters\', \'not required\', \'all\');"'
        ret += '>Copy all Experimenters</button><br /><br />\n'
        ret += '</p>\n'
        ret += '<table style="width:100%;">'
        ret += '  <tr>\n'
        ret += '     <th style="width:20%;">Base RDML</th>\n'
        ret += '     <th style="width:20%;">RDML to Add</th>\n'
        ret += '     <th style="width:20%;"></th>\n'
        ret += '     <th style="width:40%;"></th>\n'
        ret += '  </tr>\n'
    }
    for (var i = 0; i < joinExperimentersList.length; i++) {
        var currId = joinExperimentersList[i]
        var found = joinExperimenters[currId]
        //alert(currId + " - " + found)
        ret += '  <tr>\n'
        if ((found == 1) || (found == 3)) {
            ret += '     <td>' + currId + '</td>\n'
        } else {
            ret += '     <td></td>\n'
        }
        if ((found == 2) || (found == 3)) {
            ret += '     <td>' + currId + '</td>\n'
            ret += '     <td><button type="button" class="btn btn-success" '
            ret += 'onclick="moveElement(\'experimenter\', \'' + currId + '\', \'only-new\');"'
            ret += '>Copy ' + currId + '</button></td>\n'
            ret += '     <td></td>\n'
        } else {
            ret += '     <td></td>\n'
            ret += '     <td></td>\n'
            ret += '     <td></td>\n'
        }
        ret += '  </tr>\n'
    }
    if (joinExperimentersList.length > 0) {
        ret += '</table>\n'
    }

    var joinSamplesList = Object.keys(joinSamples)
    joinSamplesList.sort()
    if (joinSamplesList.length > 0) {
        ret += '<br /><br />\n'
        ret += '<h2>Samples:</h2>\n'
        ret += '<p>\n<td colspan="5"><button type="button" class="btn btn-success" '
        ret += 'onclick="moveElement(\'all-samples\', \'not required\', \'update\');"'
        ret += '>Update existing Samples (-)</button>&nbsp;&nbsp;&nbsp;&nbsp;\n'
        ret += '  <button type="button" class="btn btn-success" '
        ret += 'onclick="moveElement(\'all-samples\', \'not required\', \'update-incl-dep\');"'
        ret += '>Update existing Samples (+)</button><br /><br />\n'
        ret += '  <button type="button" class="btn btn-success" '
        ret += 'onclick="moveElement(\'all-samples\', \'not required\', \'only-new\');"'
        ret += '>Copy only additional Samples (-)</button>&nbsp;&nbsp;&nbsp;&nbsp;\n'
        ret += '  <button type="button" class="btn btn-success" '
        ret += 'onclick="moveElement(\'all-samples\', \'not required\', \'only-new-incl-dep\');"'
        ret += '>Copy only additional Samples(+)</button><br /><br />\n'
        ret += '  <button type="button" class="btn btn-success" '
        ret += 'onclick="moveElement(\'all-samples\', \'not required\', \'all\');"'
        ret += '>Copy all Samples (-)</button>&nbsp;&nbsp;&nbsp;&nbsp;\n'
        ret += '  <button type="button" class="btn btn-success" '
        ret += 'onclick="moveElement(\'all-samples\', \'not required\', \'all-incl-dep\');"'
        ret += '>Copy all Samples (+)</button><br /><br />\n'
        ret += '</p>\n'
        ret += '<table style="width:100%;">'
        ret += '  <tr>\n'
        ret += '     <th style="width:20%;">Base RDML</th>\n'
        ret += '     <th style="width:20%;">RDML to Add</th>\n'
        ret += '     <th style="width:20%;"></th>\n'
        ret += '     <th style="width:40%;"></th>\n'
        ret += '  </tr>\n'
    }
    for (var i = 0; i < joinSamplesList.length; i++) {
        var currId = joinSamplesList[i]
        var found = joinSamples[currId]
        // alert(currId + " - " + found)
        ret += '  <tr>\n'
        if ((found == 1) || (found == 3)) {
            ret += '     <td>' + currId + '</td>\n'
        } else {
            ret += '     <td></td>\n'
        }
        if ((found == 2) || (found == 3)) {
            ret += '     <td>' + currId + '</td>\n'
            ret += '     <td><button type="button" class="btn btn-success" '
            ret += 'onclick="moveElement(\'sample\', \'' + currId + '\', \'only-new\');"'
            ret += '>Copy ' + currId + ' (-)</button></td>\n'
            ret += '     <td><button type="button" class="btn btn-success" '
            ret += 'onclick="moveElement(\'sample\', \'' + currId + '\', \'all-dep\');"'
            ret += '>Copy ' + currId + ' (+)</button></td>\n'
        } else {
            ret += '     <td></td>\n'
            ret += '     <td></td>\n'
            ret += '     <td></td>\n'
        }
        ret += '  </tr>\n'
    }
    if (joinSamplesList.length > 0) {
        ret += '</table>\n'
    }

    resultData.innerHTML = ret
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
