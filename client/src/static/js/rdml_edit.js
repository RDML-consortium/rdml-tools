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
const cyclingConditionsData = document.getElementById('cyclingConditions-data')
const experimentsData = document.getElementById('experiments-data')
const debugData = document.getElementById('debug-data')

window.uuid = "";
window.rdmlData = "";
window.isvalid = "untested";

window.editMode = false;
window.editType = "";
window.editIsNew = false;
window.editNumber = -1;
window.docIdOpen = "";

function resetAllGlobalVal() {
    window.editMode = false;
    window.editType = "";
    window.editIsNew = false;
    window.editNumber = -1;
}

document.addEventListener("DOMContentLoaded", function() {
    checkForUUID();
});

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
    var path = window.location.search; // .pathname;
    if (path.match(/UUID=.+/)) {
        var uuid = path.split("UUID=")[1];
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
    if (base.hasOwnProperty(key) && base[key] == true) {
        ret += ' checked'
    }
    ret += '>&nbsp;' + trV + "&nbsp;&nbsp;&nbsp;&nbsp;"
    ret += '    <input type="radio" name="' + tag + '_radios" id="' + tag + '_false" value="false"'
    if (base.hasOwnProperty(key) && base[key] == false) {
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

function htmlUnitSelector(tag, val) {
    if (typeof val !== 'undefined') {
        val = ""
        if (val.hasOwnProperty("unit")) {
            val = base["unit"]
        } else {
            val = ""
        }
    } else {
        val = ""
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
            ret += saveUndef(exp[i].cdnaSynthesisMethod_enzyme) + '"></td>\n'
            ret += '  </tr>'
            ret += '  <tr>\n    <td style="width:25%;">cDNA - Priming Method:</td>\n'
            ret += '    <td style="width:75%"><select class="form-control" id="inExpCdnaSynthesisMethod_primingMethod">\n'
            ret += '        <option value=""'
            if (exp[i].cdnaSynthesisMethod_primingMethod == "") {
                ret += ' selected'
            }
            ret += '>not set</option>\n'
            ret += '        <option value="oligo-dt"'
            if (exp[i].cdnaSynthesisMethod_primingMethod == "oligo-dt") {
                ret += ' selected'
            }
            ret += '>oligo-dt</option>\n'
            ret += '        <option value="random"'
            if (exp[i].cdnaSynthesisMethod_primingMethod == "random") {
                ret += ' selected'
            }
            ret += '>random</option>\n'
            ret += '        <option value="target-specific"'
            if (exp[i].cdnaSynthesisMethod_primingMethod == "target-specific") {
                ret += ' selected'
            }
            ret += '>target-specific</option>\n'
            ret += '        <option value="oligo-dt and random"'
            if (exp[i].cdnaSynthesisMethod_primingMethod == "oligo-dt and random") {
                ret += ' selected'
            }
            ret += '>oligo-dt and random</option>\n'
            ret += '        <option value="other"'
            if (exp[i].cdnaSynthesisMethod_primingMethod == "other") {
                ret += ' selected'
            }
            ret += '>other</option>\n'
            ret += '      </select></td>\n'
            ret += '  </tr>'
            ret += htmlTriState("cDNA - DNase Treatment", 85,"inExpCdnaSynthesisMethod_dnaseTreatment", exp[i],
                                "cdnaSynthesisMethod_dnaseTreatment", "Yes", "No", "Not Set")
            ret += '  <tr>\n    <td style="width:25%;">cDNA - Thermal Cycling Conditions:</td>\n'
            ret += '    <td style="width:75%"><input type="text" class="form-control" '
            ret += 'id="inExpCdnaSynthesisMethod_thermalCyclingConditions" value="'
            ret += saveUndef(exp[i].cdnaSynthesisMethod_thermalCyclingConditions) + '"></td>\n'
            ret += '  </tr>'
              // Todo: make dropdown selection

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
                    xref += '<button type="button" class="btn btn-success btn-sm" '
                    xref += 'onclick="editXref(\'sample\', ' + i + ', ' + j + ');">Edit</button>&nbsp;&nbsp;'

                    if (j == 0) {
                        xref += '<button type="button" class="btn btn-success btn-sm disabled">Move Up</button>&nbsp;&nbsp;'
                    } else {
                        xref += '<button type="button" class="btn btn-success btn-sm" '
                        xref += 'onclick="moveSecElement(\'sample\', ' + i + ', \'\', 0, \'xRef\', ' + j
                        xref += ', ' + (j - 1) + ');">Move Up</button>&nbsp;&nbsp;'
                    }
                    if (j == k - 1) {
                        xref += '<button type="button" class="btn btn-success btn-sm disabled">Move Down</button>&nbsp;&nbsp;&nbsp;'
                    } else {
                        xref += '<button type="button" class="btn btn-success btn-sm" '
                        xref += 'onclick="moveSecElement(\'sample\', ' + i + ', \'\', 0, \'xRef\', ' + j
                        xref += ', ' + (j + 2) + ');">Move Down</button>&nbsp;&nbsp;&nbsp;'
                    }
                    xref += '<button type="button" class="btn btn-success btn-sm" '
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

            var hasData = false
            var doc = '<div class="card">\n<div class="card-body">\n'
            doc += '<h5 class="card-title">Documentation:</h5>\n'
            var desc = saveUndef(exp[i].description)
            if (desc != "") {
                doc += '<p>' + desc + '</p>'
                hasData = true
            }
            doc += '<button type="button" class="btn btn-success btn-sm" '
            doc += ' onclick="showDocSecElement(\'sample\', ' + i + ', \'\', 0, \'documentation\', '
            doc += '\'pDoc-sample-' + i + '\', this);">Show All Document Information</button>'
            doc += '&nbsp;&nbsp;<button type="button" class="btn btn-success btn-sm" '
            doc += 'onclick="selectSecElement(\'sample\', ' + i + ', \'\', 0, \'documentation\', '
            doc += '\'pDoc-sample-' + i + '\');">Change Attached Document Ids</button>'
            doc += '<div id="pDoc-sample-' + i + '"></div>'
            doc += '</div>\n</div><br />\n'
            if (hasData == true) {
                ret += doc
            }

            ret += '<button type="button" class="btn btn-success" '
            ret += 'onclick="editPresentElement(\'sample\', ' + i + ');">Edit</button>&nbsp;&nbsp;&nbsp;&nbsp;'
            ret += '<button type="button" class="btn btn-success" '
            ret += 'onclick="editXref(\'sample\', ' + i + ', -1);">New xRef</button>&nbsp;&nbsp;&nbsp;&nbsp;'
            if (i == 0) {
                ret += '<button type="button" class="btn btn-success disabled">Move Up</button>&nbsp;&nbsp;'
            } else {
                ret += '<button type="button" class="btn btn-success" '
            ret += 'onclick="moveEditElement(\'sample\', \'' + exp[i].id + '\', ' + (i - 1) + ');">Move Up</button>&nbsp;&nbsp;'
            }
            if (i == exp.length - 1) {
                ret += '<button type="button" class="btn btn-success disabled">Move Down</button>&nbsp;&nbsp;&nbsp;'
            } else {
                ret += '<button type="button" class="btn btn-success" '
            ret += 'onclick="moveEditElement(\'sample\', \'' + exp[i].id + '\', ' + (i + 2) + ');">Move Down</button>&nbsp;&nbsp;&nbsp;'
            }
            ret += '&nbsp;<button type="button" class="btn btn-success" '
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
            ret += '  <tr>\n    <td style="width:25%;">Detection Limit:</td>\n'
            ret += '    <td style="width:75%"><input type="text" class="form-control" '
            ret += 'id="inTarDetectionLimit" value="'+ saveUndef(exp[i].detectionLimit) + '"></td>\n'
            ret += '  </tr>'
            ret += '  <tr>\n    <td style="width:25%;">Dye ID:</td>\n'
            ret += '    <td style="width:75%"><input type="text" class="form-control" '
            ret += 'id="inTarDyeId" value="'+ saveUndef(exp[i].dyeId) + '"></td>\n'
            ret += '  </tr>'
                    // Todo: create special selector
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
                    xref += '<button type="button" class="btn btn-success btn-sm" '
                    xref += 'onclick="editXref(\'target\', ' + i + ', ' + j + ');">Edit</button>&nbsp;&nbsp;'

                    if (j == 0) {
                        xref += '<button type="button" class="btn btn-success btn-sm disabled">Move Up</button>&nbsp;&nbsp;'
                    } else {
                        xref += '<button type="button" class="btn btn-success btn-sm" '
                        xref += 'onclick="moveSecElement(\'target\', ' + i + ', \'\', 0, \'xRef\', ' + j
                        xref += ', ' + (j - 1) + ');">Move Up</button>&nbsp;&nbsp;'
                    }
                    if (j == k - 1) {
                        xref += '<button type="button" class="btn btn-success btn-sm disabled">Move Down</button>&nbsp;&nbsp;&nbsp;'
                    } else {
                        xref += '<button type="button" class="btn btn-success btn-sm" '
                        xref += 'onclick="moveSecElement(\'target\', ' + i + ', \'\', 0, \'xRef\', ' + j
                        xref += ', ' + (j + 2) + ');">Move Down</button>&nbsp;&nbsp;&nbsp;'
                    }
                    xref += '<button type="button" class="btn btn-success btn-sm" '
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

            var hasData = false
            var doc = '<div class="card">\n<div class="card-body">\n'
            doc += '<h5 class="card-title">Documentation:</h5>\n'
            var desc = saveUndef(exp[i].description)
            if (desc != "") {
                doc += '<p>' + desc + '</p>'
                hasData = true
            }
            doc += '<button type="button" class="btn btn-success btn-sm" '
            doc += ' onclick="showDocSecElement(\'target\', ' + i + ', \'\', 0, \'documentation\', '
            doc += '\'pDoc-target-' + i + '\', this);">Show All Document Information</button>'
            doc += '&nbsp;&nbsp;<button type="button" class="btn btn-success btn-sm" '
            doc += 'onclick="selectSecElement(\'target\', ' + i + ', \'\', 0, \'documentation\', '
            doc += '\'pDoc-target-' + i + '\');">Change Attached Document Ids</button>'
            doc += '<div id="pDoc-target-' + i + '"></div>'
            doc += '</div>\n</div><br />\n'
            if (hasData == true) {
                ret += doc
            }

            ret += '<button type="button" class="btn btn-success" '
            ret += 'onclick="editPresentElement(\'target\', ' + i + ');">Edit</button>&nbsp;&nbsp;&nbsp;&nbsp;'
            ret += '<button type="button" class="btn btn-success" '
            ret += 'onclick="editXref(\'target\', ' + i + ', -1);">New xRef</button>&nbsp;&nbsp;&nbsp;&nbsp;'
            if (i == 0) {
                ret += '<button type="button" class="btn btn-success disabled">Move Up</button>&nbsp;&nbsp;'
            } else {
                ret += '<button type="button" class="btn btn-success" '
            ret += 'onclick="moveEditElement(\'target\', \'' + exp[i].id + '\', ' + (i - 1) + ');">Move Up</button>&nbsp;&nbsp;'
            }
            if (i == exp.length - 1) {
                ret += '<button type="button" class="btn btn-success disabled">Move Down</button>&nbsp;&nbsp;&nbsp;'
            } else {
                ret += '<button type="button" class="btn btn-success" '
            ret += 'onclick="moveEditElement(\'target\', \'' + exp[i].id + '\', ' + (i + 2) + ');">Move Down</button>&nbsp;&nbsp;&nbsp;'
            }
            ret += '&nbsp;<button type="button" class="btn btn-success" '
            ret += 'onclick="deleteEditElement(\'target\', ' + i + ');">Delete</button>&nbsp;&nbsp;&nbsp;'
            ret += '</div>\n</div>\n'
        }
    }
    targetsData.innerHTML = ret

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
            ret += '<button type="button" class="btn btn-success" '
            ret += 'onclick="editPresentElement(\'experimenter\', ' + i + ');">Edit</button>&nbsp;&nbsp;&nbsp;&nbsp;'
            if (i == 0) {
                ret += '<button type="button" class="btn btn-success disabled">Move Up</button>&nbsp;&nbsp;'
            } else {
                ret += '<button type="button" class="btn btn-success" '
            ret += 'onclick="moveEditElement(\'experimenter\', \'' + exp[i].id + '\', ' + (i - 1) + ');">Move Up</button>&nbsp;&nbsp;'
            }
            if (i == exp.length - 1) {
                ret += '<button type="button" class="btn btn-success disabled">Move Down</button>&nbsp;&nbsp;&nbsp;'
            } else {
                ret += '<button type="button" class="btn btn-success" '
            ret += 'onclick="moveEditElement(\'experimenter\', \'' + exp[i].id + '\', ' + (i + 2) + ');">Move Down</button>&nbsp;&nbsp;&nbsp;'
            }
            ret += '&nbsp;<button type="button" class="btn btn-success" '
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
            ret += '<button type="button" class="btn btn-success" '
            ret += 'onclick="editPresentElement(\'documentation\', ' + i + ');">Edit</button>&nbsp;&nbsp;&nbsp;&nbsp;'
            if (i == 0) {
                ret += '<button type="button" class="btn btn-success disabled">Move Up</button>&nbsp;&nbsp;'
            } else {
                ret += '<button type="button" class="btn btn-success" '
            ret += 'onclick="moveEditElement(\'documentation\', \'' + exp[i].id + '\', ' + (i - 1) + ');">Move Up</button>&nbsp;&nbsp;'
            }
            if (i == exp.length - 1) {
                ret += '<button type="button" class="btn btn-success disabled">Move Down</button>&nbsp;&nbsp;&nbsp;'
            } else {
                ret += '<button type="button" class="btn btn-success" '
            ret += 'onclick="moveEditElement(\'documentation\', \'' + exp[i].id + '\', ' + (i + 2) + ');">Move Down</button>&nbsp;&nbsp;&nbsp;'
            }
            ret += '&nbsp;<button type="button" class="btn btn-success" '
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
            ret += '<button type="button" class="btn btn-success" '
            ret += 'onclick="editPresentElement(\'rdmlid\', ' + i + ');">Edit</button>&nbsp;&nbsp;&nbsp;&nbsp;'
            if (i == 0) {
                ret += '<button type="button" class="btn btn-success disabled">Move Up</button>&nbsp;&nbsp;'
            } else {
                ret += '<button type="button" class="btn btn-success" '
            ret += 'onclick="moveEditElement(\'rdmlid\', \'' + i + '\', ' + (i - 1) + ');">Move Up</button>&nbsp;&nbsp;'
            }
            if (i == exp.length - 1) {
                ret += '<button type="button" class="btn btn-success disabled">Move Down</button>&nbsp;&nbsp;&nbsp;'
            } else {
                ret += '<button type="button" class="btn btn-success" '
            ret += 'onclick="moveEditElement(\'rdmlid\', \'' + i + '\', ' + (i + 2) + ');">Move Down</button>&nbsp;&nbsp;&nbsp;'
            }
            ret += '&nbsp;<button type="button" class="btn btn-success" '
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
            ret += '<button type="button" class="btn btn-success" '
            ret += 'onclick="editPresentElement(\'dye\', ' + i + ');">Edit</button>&nbsp;&nbsp;&nbsp;&nbsp;'
            if (i == 0) {
                ret += '<button type="button" class="btn btn-success disabled">Move Up</button>&nbsp;&nbsp;'
            } else {
                ret += '<button type="button" class="btn btn-success" '
            ret += 'onclick="moveEditElement(\'dye\', \'' + exp[i].id + '\', ' + (i - 1) + ');">Move Up</button>&nbsp;&nbsp;'
            }
            if (i == exp.length - 1) {
                ret += '<button type="button" class="btn btn-success disabled">Move Down</button>&nbsp;&nbsp;&nbsp;'
            } else {
                ret += '<button type="button" class="btn btn-success" '
            ret += 'onclick="moveEditElement(\'dye\', \'' + exp[i].id + '\', ' + (i + 2) + ');">Move Down</button>&nbsp;&nbsp;&nbsp;'
            }
            ret += '&nbsp;<button type="button" class="btn btn-success" '
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
    if (typ == "cyclingConditions") {
        var nex = {}
        nex["id"] = "New Cycling Conditions"
        window.rdmlData.rdml.cyclingConditions.unshift(nex)
        window.editType = "cyclingConditions";
        window.editNumber = 0;
        updateClientData()
    }
    if (typ == "experiment") {
        var nex = {}
        nex["id"] = "New Experiment"
        window.rdmlData.rdml.experiments.unshift(nex)
        window.editType = "experiments";
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
deleteSecElement

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
        if (typ == "cyclingConditions") {
            window.rdmlData.rdml.cyclingConditions.shift()
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
        ret["data"] = el
    }
    if (typ == "cyclingConditions") {
        ret["type"] = "cyclingConditions"
        el["id"] = getSaveHtmlData("inCycId")
        ret["data"] = el
    }
    if (typ == "experiment") {
        ret["type"] = "experiment"
        el["id"] = getSaveHtmlData("inExId")
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
    var ret = '<p><br />'
    for (var i = 0; i < exp.length; i++) {
            ret += '<h3>' + exp[i] + '</h3>\n'
            if (i == 0) {
                ret += '<button type="button" class="btn btn-success btn-sm disabled">Move Up</button>&nbsp;&nbsp;'
            } else {
                ret += '<button type="button" class="btn btn-success btn-sm" '
                ret += 'onclick="moveSecElement(\'' + prim_key + '\', ' + prim_pos + ', \'' + sec_key + '\', ' + sec_pos + ', \''
                ret +=  id_source + '\', ' +  i + ', ' + (i - 1) + ');">Move Up</button>&nbsp;&nbsp;'
            }
            if (i == exp.length - 1) {
                ret += '<button type="button" class="btn btn-success btn-sm disabled">Move Down</button>'
            } else {
                ret += '<button type="button" class="btn btn-success btn-sm" '
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
