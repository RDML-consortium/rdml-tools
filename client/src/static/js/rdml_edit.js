"use strict";

const API_URL = process.env.API_URL
const API_LINK = process.env.API_LINK

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
window.rdmlData = "";
window.isvalid = "untested";

window.showEditButt = false;
window.editMode = false;
window.editType = "";
window.editIsNew = false;
window.editNumber = -1;
window.docIdOpen = "";

window.selIdOnLoad = "";

function resetAllGlobalVal() {
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
    ret += '  <tr>\n    <td style="width:25%;">' + print_name + ' - Sequence:</td>\n'
    ret += '    <td style="width:75%"><input type="text" class="form-control" id="inTarSequences_' + key
    ret += '_sequence" value="' + saveUndefKey(elem, "sequence") + '"></td>\n'
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
        if (pKey == "ID") {
            window.selIdOnLoad = pVal
        }
    }
    if (tab != "") {
        $('[href="#' + tab + '"]').tab('show')
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
    updateServerData("example", '{"mode": "upload", "validate": true}')
}

function showUpload() {
    updateServerData("data", '{"mode": "upload", "validate": true}')
}

function showCreateNew() {
    updateServerData("createNew", '{"mode": "new", "validate": false}')
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
    }
    formData.append('reqData', reqData)

    hideElement(resultError)
    showElement(resultInfo)

    axios
        .post(`${API_URL}/data`, formData)
        .then(res => {
	        if (res.status === 200) {
                resetAllGlobalVal()
                debugData.value = JSON.stringify(res.data.data, null, 2)
                window.rdmlData = res.data.data.filedata
                window.uuid = res.data.data.uuid
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

function updateClientData() {
    // The UUID box
    var ret = '<br /><div class="card">\n<div class="card-body">\n'
    ret += '<h5 class="card-title">Links to other RDML tools</h5>\n<p>Link to this result page:<br />'
    ret += '<a href="' + `${API_LINK}` + "edit.html?UUID=" + window.uuid + '">'
    ret += `${API_LINK}` + "edit.html?UUID=" + window.uuid + '</a> (valid for 3 days)\n</p>\n'
    ret += '<p>Download RDML file:<br />'
    ret += '<a href="' + `${API_URL}` + "/download/" + window.uuid + '" target="_blank" id="download-link">'
    ret += `${API_URL}` + "/download/" + window.uuid + '</a> (valid for 3 days)\n<br />\n'
    ret += '</p>\n'
    ret += '<p>View a single run of this file:<br />'
    ret += '<a href="' + `${API_LINK}` + "runview.html?UUID=" + window.uuid + '">'
    ret += `${API_LINK}` + "runview.html?UUID=" + window.uuid + '</a> (valid for 3 days)\n</p>\n'
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
            ret += '  <tr>\n    <td style="width:25%;">ID:</td>\n'
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
                ret += '<a href="' + `${API_LINK}` + "runview.html?UUID=" + window.uuid + ';TAB=runs-tab'
                ret += ';EXP=' + encodeURIComponent(exp[i].id) + ';RUN=' + encodeURIComponent(runs[s].id) + '" '
                ret += 'target="_blank">View Run in RunView</a><br />\n'
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

                ret += '<button type="button" class="btn btn-success rdml-btn-edit btn-sm" '
                ret += 'onclick="newEditRun(' + i + ', ' + s + ', \'edit\');">Edit Run</button>&nbsp;&nbsp;'
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
                ret += 'onclick="deleteRun(' + i + ', ' + s + ');">Delete Run</button>&nbsp;&nbsp;'
                ret += '</div>\n</div><br />\n'
            }

            ret += '<div id="pRun-experiment-' + i + '"></div>'

            ret += '<button type="button" class="btn btn-success rdml-btn-edit btn-sm" '
            ret += 'onclick="newEditRun(' + i + ', 999999);">New Run</button>'
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
            ret += '  <tr>\n    <td style="width:25%;">ID:</td>\n'
            ret += '    <td style="width:75%"><input type="text" class="form-control" '
            ret += 'id="inSampId" value="'+ exp[i].id + '"></td>\n'
            ret += '  </tr>'
            ret += '  <tr>\n    <td style="width:25%;">Place at Position:</td>\n'
            ret += '    <td style="width:75%"><input type="text" class="form-control" '
            ret += 'id="inPos" value="' + (i + 1) + '"></td>\n'
            ret += '  </tr>'
            ret += '  <tr>\n    <td style="width:25%;">Type:</td>\n'
            ret += '    <td style="width:75%"><select class="form-control" id="inSampType">\n'
            ret += '        <option value="unkn"'
            if (exp[i].type == "unkn") {
                ret += ' selected'
            }
            ret += '>unkn - unknown sample</option>\n'
            ret += '        <option value="ntc"'
            if (exp[i].type == "ntc") {
                ret += ' selected'
            }
            ret += '>ntc  - non template control</option>\n'
            ret += '        <option value="nac"'
            if (exp[i].type == "nac") {
                ret += ' selected'
            }
            ret += '>nac  - no amplification control</option>\n'
            ret += '        <option value="std"'
            if (exp[i].type == "std") {
                ret += ' selected'
            }
            ret += '>std  - standard sample</option>\n'
            ret += '        <option value="ntp"'
            if (exp[i].type == "ntp") {
                ret += ' selected'
            }
            ret += '>ntp  - no target present</option>\n'
            ret += '        <option value="nrt"'
            if (exp[i].type == "nrt") {
                ret += ' selected'
            }
            ret += '>nrt  - minusRT</option>\n'
            ret += '        <option value="pos"'
            if (exp[i].type == "pos") {
                ret += ' selected'
            }
            ret += '>pos  - positive control</option>\n'
            ret += '        <option value="opt"'
            if (exp[i].type == "opt") {
                ret += ' selected'
            }
            ret += '>opt  - optical calibrator sample</option>\n'
            ret += '      </select></td>\n'
            ret += '  </tr>'
            ret += '  <tr>\n    <td style="width:25%;">Description:</td>\n'
            ret += '    <td style="width:75%"><input type="text" class="form-control" '
            ret += 'id="inExpDescription" value="'+ saveUndef(exp[i].description) + '"></td>\n'
            ret += '  </tr>'
            ret += htmlTriState("Calibrator Sample", 75, "inExpCalibratorSample", exp[i],
                                "calibratorSample", "Yes", "No", "Not Set")
            ret += htmlTriState("Inter Run Calibrator", 75,"inExpInterRunCalibrator", exp[i],
                                "interRunCalibrator", "Yes", "No", "Not Set")
            ret += '  <tr>\n    <td style="width:25%;">Quantity:</td>\n'
            ret += '    <td style="width:75%"><table style="width:100%;">'
            ret += '      <tr><td style="width:50%;">'
            ret += '        <input type="text" class="form-control" id="inExpQuantity_Value" value="'
            ret += saveUndefKey(exp[i].quantity, "value") + '">'
            ret += '        </td>\n<td style="width:50%">'
            ret += htmlUnitSelector("inExpQuantity_Unit", exp[i].quantity) + '</td>\n</tr>\n</table>'
            ret += '  </tr>'
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
                ret += saveUndefKey(exp[i].templateQuantity, "value") + '">'
                ret += '        </td>\n<td style="width:50%">'
                var selUnit = saveUndefKey(exp[i].templateQuantity, "value")
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
            ret += '  <tr>\n    <td style="width:25%;">Type:</td>\n'
            ret += '    <td style="width:75%">\n'+ niceSampleType(exp[i].type) + '</td>\n'
            ret += '  </tr>'
            if (exp[i].hasOwnProperty("calibratorSample")) {
              ret += '  <tr>\n    <td style="width:25%;">Calibrator Sample:</td>\n'
              if (exp[i].calibratorSample == "true") {
                  ret += '    <td style="width:75%">Yes, used as Calibrator</td>\n'
              } else {
                  ret += '    <td style="width:75%">No</td>\n'
              }
              ret += '  </tr>'
            }
            if (exp[i].hasOwnProperty("interRunCalibrator")) {
              ret += '  <tr>\n    <td style="width:25%;">Inter Run Calibrator:</td>\n'
              if (exp[i].interRunCalibrator == "true") {
                  ret += '    <td style="width:75%">Yes, used as Inter Run Calibrator</td>\n'
              } else {
                  ret += '    <td style="width:75%">No</td>\n'
              }
              ret += '  </tr>'
            }
            if (exp[i].hasOwnProperty("quantity")) {
              ret += '  <tr>\n    <td style="width:25%;">Quantity:</td>\n'
              ret += '    <td style="width:75%">\n'+ exp[i].quantity.value
              ret += ' ' + niceUnitType(exp[i].quantity.unit) + '</td>\n'
              ret += '  </tr>'
            }
            if (exp[i].hasOwnProperty("cdnaSynthesisMethod")) {
                if (exp[i].cdnaSynthesisMethod.hasOwnProperty("enzyme")) {
                  ret += '  <tr>\n    <td style="width:25%;">cDNA - Enzyme:</td>\n'
                  ret += '    <td style="width:75%">\n'+ exp[i].cdnaSynthesisMethod.enzyme + '</td>\n'
                  ret += '  </tr>'
                }
                if (exp[i].cdnaSynthesisMethod.hasOwnProperty("primingMethod")) {
                  ret += '  <tr>\n    <td style="width:25%;">cDNA - Priming Method:</td>\n'
                  ret += '    <td style="width:75%">\n'+ exp[i].cdnaSynthesisMethod.primingMethod + '</td>\n'
                  ret += '  </tr>'
                }
                if (exp[i].cdnaSynthesisMethod.hasOwnProperty("dnaseTreatment")) {
                  ret += '  <tr>\n    <td style="width:25%;">cDNA - DNase Treatment:</td>\n'
                  if (exp[i].cdnaSynthesisMethod.dnaseTreatment == "true") {
                      ret += '    <td style="width:75%">Yes, treated with DNase</td>\n'
                  } else {
                      ret += '    <td style="width:75%">No</td>\n'
                  }
                  ret += '  </tr>'
                }
                if (exp[i].cdnaSynthesisMethod.hasOwnProperty("thermalCyclingConditions")) {
                  ret += '  <tr>\n    <td style="width:25%;">cDNA - Thermal Cycling Conditions:</td>\n'
                  ret += '    <td style="width:75%">\n'+ exp[i].cdnaSynthesisMethod.thermalCyclingConditions + '</td>\n'
                  ret += '  </tr>'
                  // Todo: add link
                }
            }


            if (exp[i].hasOwnProperty("templateRNAQuantity")) {
              ret += '  <tr>\n    <td style="width:25%;">Template RNA Quantity:</td>\n'
              ret += '    <td style="width:75%">\n'+ exp[i].templateRNAQuantity.value
              ret += ' ' + niceUnitType(exp[i].templateRNAQuantity.unit) + '</td>\n'
              ret += '  </tr>'
            }
            if (exp[i].hasOwnProperty("templateRNAQuality")) {
              ret += '  <tr>\n    <td style="width:25%;">Template RNA Quality:</td>\n'
              ret += '    <td style="width:75%">\n'+ exp[i].templateRNAQuality.method
              ret += ' is ' + niceUnitType(exp[i].templateRNAQuality.result) + '</td>\n'
              ret += '  </tr>'
            }
            if (exp[i].hasOwnProperty("templateDNAQuantity")) {
              ret += '  <tr>\n    <td style="width:25%;">Template DNA Quantity:</td>\n'
              ret += '    <td style="width:75%">\n'+ exp[i].templateDNAQuantity.value
              ret += ' ' + niceUnitType(exp[i].templateDNAQuantity.unit) + '</td>\n'
              ret += '  </tr>'
            }
            if (exp[i].hasOwnProperty("templateDNAQuality")) {
              ret += '  <tr>\n    <td style="width:25%;">Template DNA Quality:</td>\n'
              ret += '    <td style="width:75%">\n'+ exp[i].templateDNAQuality.method
              ret += ' is ' + niceUnitType(exp[i].templateDNAQuality.result) + '</td>\n'
              ret += '  </tr>'
            }
            if (exp[i].hasOwnProperty("templateQuantity")) {
              ret += '  <tr>\n    <td style="width:25%;">Template Nucleotide Type:</td>\n'
              ret += '    <td style="width:75%">\n'+ exp[i].templateQuantity.nucleotide + '</td>\n'
              ret += '  </tr>'
              ret += '  <tr>\n    <td style="width:25%;">Template Quantity:</td>\n'
              ret += '    <td style="width:75%">\n'+ exp[i].templateQuantity.conc + ' ng/&micro;l</td>\n'
              ret += '  </tr>'
            }
            ret += '</table></p>\n'

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
    for (var i = 0; i < exp.length; i++) {
        if ((editMode == true) && (editType == "target") && (i == editNumber)) {
            ret += '<br /><div class="card text-white bg-primary">\n<div class="card-body">\n'
            ret += '<h5 class="card-title">' + (i + 1) + '. Target ID: ' + exp[i].id + '</h5>\n<p>'
            ret += '<table style="width:100%;">'
            ret += '  <tr>\n    <td style="width:25%;">ID:</td>\n'
            ret += '    <td style="width:75%"><input type="text" class="form-control" '
            ret += 'id="inTarId" value="'+ exp[i].id + '"></td>\n'
            ret += '  </tr>'
            ret += '  <tr>\n    <td style="width:25%;">Place at Position:</td>\n'
            ret += '    <td style="width:75%"><input type="text" class="form-control" '
            ret += 'id="inPos" value="' + (i + 1) + '"></td>\n'
            ret += '  </tr>'
            ret += '  <tr>\n    <td style="width:25%;">Type:</td>\n'
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
            ret += '  <tr>\n    <td style="width:25%;">Dye ID:</td>\n'
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
            ret += '  <tr>\n    <td style="width:25%;">ID:</td>\n'
            ret += '    <td style="width:75%"><input type="text" class="form-control" '
            ret += 'id="inCycId" value="'+ exp[i].id + '"></td>\n'
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
            ret += '  <tr>\n    <td style="width:15%;">ID:</td>\n'
            ret += '    <td style="width:85%"><input type="text" class="form-control" '
            ret += 'id="inExpId" value="'+ exp[i].id + '"></td>\n'
            ret += '  </tr>'
            ret += '  <tr>\n    <td style="width:15%;">Place at Position:</td>\n'
            ret += '    <td style="width:85%"><input type="text" class="form-control" '
            ret += 'id="inPos" value="' + (i + 1) + '"></td>\n'
            ret += '  </tr>'
            ret += '  <tr>\n    <td style="width:15%;">First Name:</td>\n'
            ret += '    <td style="width:85%"><input type="text" class="form-control" '
            ret += 'id="inExpFirstName" value="'+ exp[i].firstName + '"></td>\n'
            ret += '  </tr>'
            ret += '  <tr>\n    <td style="width:15%;">Last Name:</td>\n'
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
            ret += '  <tr>\n    <td style="width:15%;">ID:</td>\n'
            ret += '    <td style="width:85%"><input type="text" class="form-control" '
            ret += 'id="inDocId" value="'+ exp[i].id + '"></td>\n'
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

    // The more tab - File Info
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

    // The more tab - RDML Id Info
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
            ret += '  <tr>\n    <td style="width:15%;">Publisher:</td>\n'
            ret += '    <td style="width:85%"><input type="text" class="form-control" '
            ret += 'id="inRdmlidPublisher" value="'+ exp[i].publisher + '"></td>\n'
            ret += '  </tr>'
            ret += '  <tr>\n    <td style="width:15%;">Serial Number:</td>\n'
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

    // The more tab - dyes tab
    var exp = window.rdmlData.rdml.dyes;
    ret = ''
    for (var i = 0; i < exp.length; i++) {
        if ((editMode == true) && (editType == "dye") && (i == editNumber)) {
            ret += '<br /><div class="card text-white bg-primary">\n<div class="card-body">\n'
            ret += '<h5 class="card-title">' + (i + 1) + '. Dye ID: ' + exp[i].id + '</h5>\n<p>'
            ret += '<table style="width:100%;">'
            ret += '  <tr>\n    <td style="width:15%;">ID:</td>\n'
            ret += '    <td style="width:85%"><input type="text" class="form-control" '
            ret += 'id="inDyeId" value="'+ exp[i].id + '"></td>\n'
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
        el["text"] = getSaveHtmlData("inDocText")
        ret["data"] = el
    }
    if (typ == "dye") {
        ret["type"] = "dye"
        el["id"] = getSaveHtmlData("inDyeId")
        el["description"] = getSaveHtmlData("inDyeDescription")
        ret["data"] = el
    }
    if (typ == "sample") {
        ret["type"] = "sample"
        el["id"] = getSaveHtmlData("inSampId")
        el["type"] = getSaveHtmlData("inSampType")
        el["calibratorSample"] = readTriState("inExpCalibratorSample")
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
        if (window.rdmlData.rdml.version == "1.2") {
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
        el["type"] = getSaveHtmlData("inTarType")
        el["amplificationEfficiencyMethod"] = getSaveHtmlData("inTarAmplificationEfficiencyMethod")
        el["amplificationEfficiency"] = getSaveHtmlData("inTarAmplificationEfficiency")
        el["detectionLimit"] = getSaveHtmlData("inTarDetectionLimit")
        el["dyeId"] = getSaveHtmlData("inTarDyeId")
        el["sequences_forwardPrimer_fivePrimeTag"] = getSaveHtmlData("inTarSequences_forwardPrimer_fivePrimeTag")
        el["sequences_forwardPrimer_sequence"] = getSaveHtmlData("inTarSequences_forwardPrimer_sequence")
        el["sequences_forwardPrimer_threePrimeTag"] = getSaveHtmlData("inTarSequences_forwardPrimer_threePrimeTag")
        el["sequences_reversePrimer_fivePrimeTag"] = getSaveHtmlData("inTarSequences_reversePrimer_fivePrimeTag")
        el["sequences_reversePrimer_sequence"] = getSaveHtmlData("inTarSequences_reversePrimer_sequence")
        el["sequences_reversePrimer_threePrimeTag"] = getSaveHtmlData("inTarSequences_reversePrimer_threePrimeTag")
        el["sequences_probe1_fivePrimeTag"] = getSaveHtmlData("inTarSequences_probe1_fivePrimeTag")
        el["sequences_probe1_sequence"] = getSaveHtmlData("inTarSequences_probe1_sequence")
        el["sequences_probe1_threePrimeTag"] = getSaveHtmlData("inTarSequences_probe1_threePrimeTag")
        el["sequences_probe2_fivePrimeTag"] = getSaveHtmlData("inTarSequences_probe2_fivePrimeTag")
        el["sequences_probe2_sequence"] = getSaveHtmlData("inTarSequences_probe2_sequence")
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
        ret["data"] = el
    }
    if (typ == "therm_cyc_cons") {
        ret["type"] = "therm_cyc_cons"
        el["id"] = getSaveHtmlData("inCycId")
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
    if ((edit == true) && (exp != null) && (prim_pos < exp.length) && (anno_pos < exp[anno_pos].xRefs.length)) {
        if ((exp[prim_pos].xRefs[anno_pos]) && (exp[prim_pos].xRefs[anno_pos].hasOwnProperty("property"))){
            property = exp[prim_pos].xRefs[anno_pos].property
        }
        if ((exp[prim_pos].xRefs[anno_pos]) && (exp[prim_pos].xRefs[anno_pos].hasOwnProperty("value"))){
            value = exp[prim_pos].xRefs[anno_pos].value
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
        ret += '  <tr>\n    <td style="width:25%;">Place at Step:</td>\n'
        ret += '    <td style="width:75%"><input type="text" class="form-control" '
        ret += 'id="inStepPos" value="' + step_pos + '"></td>\n'
        ret += '  </tr>'
        ret += '  <tr>\n    <td style="width:25%;">Temperature:</td>\n'
        ret += '    <td style="width:75%">\n<input type="text" class="form-control" '
        ret += 'id="inStepTemperature" value="' + temperature + '"></td>\n'
        ret += '  </tr>'
        ret += '  <tr>\n    <td style="width:25%;">Duration:</td>\n'
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
        ret += '  <tr>\n    <td style="width:25%;">Place at Step:</td>\n'
        ret += '    <td style="width:75%"><input type="text" class="form-control" '
        ret += 'id="inStepPos" value="' + step_pos + '"></td>\n'
        ret += '  </tr>'
        ret += '  <tr>\n    <td style="width:25%;">High Temperature:</td>\n'
        ret += '    <td style="width:75%">\n<input type="text" class="form-control" '
        ret += 'id="inStepHighTemperature" value="' + highTemperature + '"></td>\n'
        ret += '  </tr>'
        ret += '  <tr>\n    <td style="width:25%;">Low Temperature:</td>\n'
        ret += '    <td style="width:75%">\n<input type="text" class="form-control" '
        ret += 'id="inStepLowTemperature" value="' + lowTemperature + '"></td>\n'
        ret += '  </tr>'
        ret += '  <tr>\n    <td style="width:25%;">Duration:</td>\n'
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
        ret += '  <tr>\n    <td style="width:25%;">Place at Step:</td>\n'
        ret += '    <td style="width:75%"><input type="text" class="form-control" '
        ret += 'id="inStepPos" value="' + step_pos + '"></td>\n'
        ret += '  </tr>'
        ret += '  <tr>\n    <td style="width:25%;">Go back to step:</td>\n'
        ret += '    <td style="width:75%">\n<input type="text" class="form-control" '
        ret += 'id="inStepGoto" value="' + goto + '"></td>\n'
        ret += '  </tr>'
        ret += '  <tr>\n    <td style="width:25%;">Repeat for:</td>\n'
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
        ret += '  <tr>\n    <td style="width:25%;">Place at Step:</td>\n'
        ret += '    <td style="width:75%"><input type="text" class="form-control" '
        ret += 'id="inStepPos" value="' + step_pos + '"></td>\n'
        ret += '  </tr>'
        ret += '  <tr>\n    <td style="width:25%;">Temperature:</td>\n'
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
        ret += '  <tr>\n    <td style="width:25%;">Place at Step:</td>\n'
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
function newEditRun(prim_pos, sec_pos) {
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
    ret += '  <tr>\n    <td style="width:25%;">ID:</td>\n'
    ret += '    <td style="width:75%"><input type="text" class="form-control" '
    ret += 'id="inRunId" value="'+ id_val + '"></td>\n'
    ret += '  </tr>'
    ret += '  <tr>\n    <td style="width:25%;">Place at Position:</td>\n'
    ret += '    <td style="width:75%"><input type="text" class="form-control" '
    ret += 'id="inRunPos" value="' + (sec_pos + 1) + '"></td>\n'
    ret += '  </tr>'
    ret += '  <tr>\n    <td style="width:25%;">Description:</td>\n'
    ret += '    <td style="width:75%"><input type="text" class="form-control" '
    ret += 'id="inRunDescription" value="'+ saveUndefKey(run, "description") + '"></td>\n'
    ret += '  </tr>'
    ret += '  <tr>\n    <td style="width:25%;">Run Date:</td>\n'
    ret += '    <td style="width:75%">\n<input type="text" class="form-control" '
    ret += 'id="inRunRunDate" value="' + saveUndefKey(run, "runDate") + '"></td>\n'
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
    ret += '  <tr>\n    <td style="width:25%;">Background Determination Method:</td>\n'
    ret += '    <td style="width:75%">\n<input type="text" class="form-control" '
    ret += 'id="inRunBackgroundDeterminationMethod" value="' + saveUndefKey(run, "backgroundDeterminationMethod") + '"></td>\n'
    ret += '  </tr>'
    ret += '  <tr>\n    <td style="width:25%;">PCR Format - Columns:</td>\n'
    ret += '    <td style="width:75%">\n<input type="text" class="form-control" '
    ret += 'id="inRunPcrFormat_columns" value="' + saveUndefKeyKey(run, "pcrFormat", "columns") + '"></td>\n'
    ret += '  </tr>'
    select_val = saveUndefKeyKey(run, "pcrFormat", "columnLabel")
    ret += '  <tr>\n    <td style="width:25%;">PCR Format - Column Label:</td>\n'
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
    ret += '  <tr>\n    <td style="width:25%;">PCR Format - Rows:</td>\n'
    ret += '    <td style="width:75%">\n<input type="text" class="form-control" '
    ret += 'id="inRunPcrFormat_rows" value="' + saveUndefKeyKey(run, "pcrFormat", "rows") + '"></td>\n'
    ret += '  </tr>'
    select_val = saveUndefKeyKey(run, "pcrFormat", "rowLabel")
    ret += '  <tr>\n    <td style="width:25%;">PCR Format - Row Label:</td>\n'
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
    el["instrument"] = getSaveHtmlData("inRunInstrument")
    el["dataCollectionSoftware_name"] = getSaveHtmlData("inRunDataCollectionSoftware_name")
    el["dataCollectionSoftware_version"] = getSaveHtmlData("inRunDataCollectionSoftware_version")
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
