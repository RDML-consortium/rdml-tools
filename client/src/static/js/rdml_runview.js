"use strict";

const API_URL = process.env.API_URL
const API_LINK = process.env.API_LINK

const resultLink = document.getElementById('uuid-link-box')

const submitButton = document.getElementById('btn-submit')
submitButton.addEventListener('click', showUpload)

const exampleButton = document.getElementById('btn-example')
exampleButton.addEventListener('click', showExample)

const inputFile = document.getElementById('inputFile')
const resultInfo = document.getElementById('result-info')
const resultError = document.getElementById('result-error')

const selectorsData = document.getElementById('selectors-data')
const plateData = document.getElementById('plate-data')
const curvesData = document.getElementById('curves-data')

const debugData = document.getElementById('debug-data')

window.uuid = "";
window.rdmlData = "";
window.reactData = "";
window.isvalid = "untested";

window.selExperiment = "";
window.selRun = "";


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

// TODO client-side validation
function updateServerData(stat, reqData) {
    const formData = new FormData()
    if (stat == "example") {
        formData.append('showExample', 'showExample')
    } else if (stat == "data") {
        formData.append('queryFile', inputFile.files[0])
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
                window.rdmlData = res.data.data.filedata
                window.uuid = res.data.data.uuid
                if (res.data.data.hasOwnProperty("reactsdata")) {
                    window.reactData = res.data.data.reactsdata
                    debugData.value = JSON.stringify(res.data.data.reactsdata, null, 2)
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

window.updateClientData = updateClientData
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

    ret = '<table style="width:100%;">'
    ret += '  <tr>\n    <td style="width:50%;">'
    ret += '<div class="form-group">\n'
    ret += '  <label for="dropSelExperiment">Selected Experiment:</label>'
    ret += '  <select class="form-control" id="dropSelExperiment" onchange="updateExperimenter()">'
    ret += '    <option value="">No experiment selected</option>\n'
    var experimentPos = -1
    for (var i = 0; i < exp.length; i++) {
        ret += '        <option value="' + exp[i].id + '"'
        if (window.selExperiment == exp[i].id) {
            ret += ' selected'
            experimentPos = i
        }
        ret += '>' + exp[i].id + '</option>\n'



     //   var runs = exp[i].runs
     //   for (var s = 0 ; s < runs.length ; s++){

       // }
    }
    ret += '  </select>\n'
    ret += '</div></td>\n    <td style="width:50%;">\n'
    ret += '<div class="form-group">\n'
    ret += '  <label for="dropSelRun">Selected Run:</label>'
    ret += '  <select class="form-control" id="dropSelRun" onchange="updateRun()">'
    ret += '    <option value="">No run selected</option>\n'
    if (experimentPos > -1) {
        var runs = exp[experimentPos].runs
        for (var i = 0; i < runs.length; i++) {
            ret += '        <option value="' + runs[i].id + '"'
            if (window.selRun == runs[i].id) {
                ret += ' selected'
            }
            ret += '>' + runs[i].id + '</option>\n'
        }
    }
    ret += '</td>\n</tr>\n</table>\n'
    selectorsData.innerHTML = ret


}

window.updateExperimenter = updateExperimenter;
function updateExperimenter() {
    var newData = getSaveHtmlData("dropSelExperiment")
    if (window.selExperiment == newData) {
        return
    }
    window.selExperiment = newData
    window.selRun = ""
    updateClientData()
}

window.updateRun = updateRun;
function updateRun() {
    var newData = getSaveHtmlData("dropSelRun")
    if (window.selExperiment == newData) {
        return
    }
    window.selRun = newData
    if (!(window.rdmlData.hasOwnProperty("rdml"))) {
        return
    }
    if ((window.selExperiment == "") || (window.selRun == "")){
        return
    }
    var ret = {}
    ret["mode"] = "get-run-data"
    ret["sel-experiment"] = window.selExperiment
    ret["sel-run"] = window.selRun
    updateServerData(uuid, JSON.stringify(ret))
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
    ret += '    <td style="width:75%">\n<input type="text" class="form-control" '
    ret += 'id="inRunThermalCyclingConditions" value="' + saveUndefKey(run, "thermalCyclingConditions") + '"></td>\n'
    ret += '  </tr>'
    // Todo add dropdown selector
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
