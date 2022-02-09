"use strict";

const API_URL = process.env.API_URL
const API_LINK = process.env.API_LINK

const resultLink = document.getElementById('uuid-link-box')

const submitButton = document.getElementById('btn-submit')
submitButton.addEventListener('click', showUpload)

const exampleButton = document.getElementById('btn-example')
exampleButton.addEventListener('click', showExample)

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
window.selRunOnLoad = "";

window.selReact = -1;
window.selWell = "";
window.selTar = "";
window.selPCR = 0;
window.selExcl = "";
window.selNote = "";

function resetSelection() {
    window.selReact = -1;
    window.selWell = "";
    window.selTar = "";
    window.selPCR = 0;
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
        resetSelection()
        updateServerData(uuid, '{"mode": "upload", "validate": true}')
    }
}

$('#mainTab a').on('click', function(e) {
    e.preventDefault()
    $(this).tab('show')
})

function showExample() {
    window.selRun = "";
    window.selExperiment = "Experiment_1";
    window.selRunOnLoad = "Run_1";
 
    resetSelection()
    updateServerData("example", '{"mode": "upload", "validate": true}')
    $('[href="#runs-tab"]').tab('show')
}

function showUpload() {
    window.selRun = "";
    window.selExperiment = "";
    window.selRunOnLoad = "";
 
    resetSelection()
    updateServerData("data", '{"mode": "upload", "validate": true}')
    $('[href="#runs-tab"]').tab('show')
}

window.delReactData = delReactData;
function delReactData() {
    var ret = {}
    ret["mode"] = "run-ed-del-react"
    ret["sel-experiment"] = window.selExperiment
    ret["sel-run"] = window.selRun
    ret["sel-react"] = window.selReact
    ret["sel-well"] = document.getElementById('runView-ele-react').value
    updateServerData(window.uuid, JSON.stringify(ret))
}

window.delTarData = delTarData;
function delTarData() {
    var ret = {}
    ret["mode"] = "run-ed-del-re-tar"
    ret["sel-experiment"] = window.selExperiment
    ret["sel-run"] = window.selRun
    ret["sel-react"] = window.selReact
    ret["sel-well"] = document.getElementById('runView-ele-react').value
    ret["sel-pcr"] = document.getElementById('runView-ele-pcrstyle').value
    ret["sel-tar"] = document.getElementById('runView-ele-tar').value
    updateServerData(window.uuid, JSON.stringify(ret))
}

window.replaceExcl = replaceExcl;
function replaceExcl() {
    var ret = {}
    ret["mode"] = "run-ed-up-excl"
    ret["sel-experiment"] = window.selExperiment
    ret["sel-run"] = window.selRun
    ret["sel-react"] = window.selReact
    ret["sel-well"] = document.getElementById('runView-ele-react').value
    ret["sel-pcr"] = document.getElementById('runView-ele-pcrstyle').value
    ret["sel-tar"] = document.getElementById('runView-ele-tar').value
    ret["sel-excl"] = document.getElementById('runView-ele-excl').value
    ret["sel-append"] = false
    updateServerData(window.uuid, JSON.stringify(ret))
}

window.appendExcl = appendExcl;
function appendExcl() {
    var ret = {}
    ret["mode"] = "run-ed-up-excl"
    ret["sel-experiment"] = window.selExperiment
    ret["sel-run"] = window.selRun
    ret["sel-react"] = window.selReact
    ret["sel-well"] = document.getElementById('runView-ele-react').value
    ret["sel-pcr"] = document.getElementById('runView-ele-pcrstyle').value
    ret["sel-tar"] = document.getElementById('runView-ele-tar').value
    ret["sel-excl"] = document.getElementById('runView-ele-excl').value
    ret["sel-append"] = true
    updateServerData(window.uuid, JSON.stringify(ret))
}

window.replaceNote = replaceNote;
function replaceNote() {
    var ret = {}
    ret["mode"] = "run-ed-up-note"
    ret["sel-experiment"] = window.selExperiment
    ret["sel-run"] = window.selRun
    ret["sel-react"] = window.selReact
    ret["sel-well"] = document.getElementById('runView-ele-react').value
    ret["sel-pcr"] = document.getElementById('runView-ele-pcrstyle').value
    ret["sel-tar"] = document.getElementById('runView-ele-tar').value
    ret["sel-note"] = document.getElementById('runView-ele-note').value
    ret["sel-append"] = false
    updateServerData(window.uuid, JSON.stringify(ret))
}

window.appendNote = appendNote;
function appendNote() {
    var ret = {}
    ret["mode"] = "run-ed-up-note"
    ret["sel-experiment"] = window.selExperiment
    ret["sel-run"] = window.selRun
    ret["sel-react"] = window.selReact
    ret["sel-well"] = document.getElementById('runView-ele-react').value
    ret["sel-pcr"] = document.getElementById('runView-ele-pcrstyle').value
    ret["sel-tar"] = document.getElementById('runView-ele-tar').value
    ret["sel-note"] = document.getElementById('runView-ele-note').value
    ret["sel-append"] = true
    updateServerData(window.uuid, JSON.stringify(ret))
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
    // The UUID box
    var ret = '<br /><div class="card">\n<div class="card-body">\n'
    ret += '<h5 class="card-title">Links to other RDML tools</h5>\n<p>Link to this result page:<br />'
    ret += '<a href="' + `${API_LINK}` + "runview.html?UUID=" + window.uuid + ';TAB=runs-tab'
    ret += ';EXP=' + encodeURIComponent(window.selExperiment) + ';RUN=' + encodeURIComponent(window.selRun) + '" '
    ret += 'target="_blank">'
    ret += `${API_LINK}` + "runview.html?UUID=" + window.uuid + ';TAB=runs-tab'
    ret += ';EXP=' + encodeURIComponent(window.selExperiment)
    ret += ';RUN=' + encodeURIComponent(window.selRun) + '</a> (valid for 3 days)\n<br />\n'
    ret += '</p>\n'
    ret += '<p>Download RDML file:<br />'
    ret += '<a href="' + `${API_URL}` + "/download/" + window.uuid + '" target="_blank" id="download-link">'
    ret += `${API_URL}` + "/download/" + window.uuid + '</a> (valid for 3 days)\n<br />\n'
    ret += '</p>\n'
    ret += '<p>Analyze RDML file in LinRegPCR:<br />'
    ret += '<a href="' + `${API_LINK}` + "linregpcr.html?UUID=" + window.uuid + ';TAB=runs-tab'
    ret += ';EXP=' + encodeURIComponent(window.selExperiment) + ';RUN=' + encodeURIComponent(window.selRun) + '" '
    ret += 'target="_blank">'
    ret += `${API_LINK}`  + "linregpcr.html?UUID=" + window.uuid + ';TAB=runs-tab'
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
    ret += '</p>\n'
    ret += '<p>Remove Uploaded Data from Server:<br />'
    ret += '<a href="' + `${API_LINK}` + "remove.html?UUID=" + window.uuid + '" target="_blank">'
    ret += `${API_LINK}`  + "remove.html?UUID=" + window.uuid + '</a> (valid for 3 days)\n<br />\n'
    ret += '</p>\n</div>\n</div>\n'
    resultLink.innerHTML = ret

    if (!(window.rdmlData.hasOwnProperty("rdml"))) {
        return
    }
    var ret = ''
    var exp = window.rdmlData.rdml.experiments;

    ret = '<table style="width:100%;">'
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
    ret += '<td style="width:22%;">\n'
    ret += '    <button type="submit" class="btn btn-outline-primary" onclick="showRDMLSave()">\n'
    ret += '    <i class="far fa-save" style="margin-right: 5px;"></i>\n'
    ret += '      Save RDML\n'
    ret += '    </button>\n'
    ret += '</td>\n</tr>\n'
    ret += '</table>\n'

    selectorsData.innerHTML = ret
    ret = ""

    if ((window.experimentPos > -1) && (window.runPos > -1) && (window.reactData.hasOwnProperty("reacts"))) {
        var reacts = window.reactData.reacts
        var the_run = exp[window.experimentPos].runs[window.runPos]
        var rows = parseInt(the_run.pcrFormat.rows)
        var columns = parseInt(the_run.pcrFormat.columns)
        var rowLabel = the_run.pcrFormat.rowLabel
        var columnLabel = the_run.pcrFormat.columnLabel
        var finRowLabel = ""
        var finColumnLabel = ""
        ret += '<table id="rdmlPlateTab" style="width:100%;">'
        var exRowCount = 0
        var exClasRowUsed = false
        var exDigiRowUsed = false
        var rowCont = ""
        var lastClassic = 0
        for (var r = 0; r < rows; r++) {
            rowCont += '  <tr>'
            if (rowLabel == "123") {
                finRowLabel = r + 1
            } else if (rowLabel == "ABC") {
                finRowLabel = String.fromCharCode('A'.charCodeAt(0) + r)
            }
            for (var c = 0; c < columns; c++) {
                if (columnLabel == "123") {
                    finColumnLabel = c + 1
                } else if (columnLabel == "ABC") {
                    finColumnLabel = String.fromCharCode('A'.charCodeAt(0) + c)
                }    
                var id = r * columns + c + 1
                var cell = '  <td></td>'
                for (var reac = 0; reac < reacts.length; reac++) {
                    if (parseInt(reacts[reac].id) == id) {
                        var hasReactData = false
                        if ((reacts[reac].hasOwnProperty("datas")) && 
                            (reacts[reac].datas.length > 0)) {
                            hasReactData = true
                        }
                        if ((reacts[reac].hasOwnProperty("partitions")) &&
                            (reacts[reac].partitions.hasOwnProperty("datas")) &&
                            (reacts[reac].partitions.datas.length > 0)) {
                            hasReactData = true
                        }
                        if (exRowCount == 0) {
                            if (hasReactData == true) {
                                cell = '  <td style="font-size:0.7em;background-color:#cccccc;">'
                                cell += finRowLabel + finColumnLabel + '<br />'
                                cell += reacts[reac].sample + '</td>'
                                exClasRowUsed = true
                            } else {
                                cell = '  <td></td>'
                            }
                        } else {
                            var dataPos = exRowCount - 1
                            if ((reacts[reac].hasOwnProperty("datas")) && 
                                (dataPos < reacts[reac].datas.length)) {
                                var cBgCol = "#ffffff"
                                var cExcl = ""
                                var cNote = ""
                                if (reacts[reac].datas[dataPos].hasOwnProperty("note")) {
                                    cNote = reacts[reac].datas[dataPos].note
                                    cBgCol = "#ccff66"
                                }
                                if (reacts[reac].datas[dataPos].hasOwnProperty("excl")) {
                                    cExcl = reacts[reac].datas[dataPos].excl
                                    cBgCol = "#ff704d"
                                }
                                cell = '  <td style="font-size:0.7em;background-color:' + cBgCol + ';"'
                                cell += ' onclick="showReactSel(0, ' + reac + ', ' + dataPos + ')">'
                                cell += reacts[reac].datas[dataPos].tar + '<br />'
                                cell += 'Excl: ' + cExcl + '<br />'
                                cell += 'Note: ' + cNote + '</td>'
                                exClasRowUsed = true
                                lastClassic = dataPos
                            }
                            var dataPos = exRowCount - lastClassic - 1
                            if ((exClasRowUsed == false) &&
                                (reacts[reac].hasOwnProperty("partitions")) &&
                                (reacts[reac].partitions.hasOwnProperty("datas")) &&
                                (dataPos < reacts[reac].partitions.datas.length)) {
                                var cBgCol = "#ffffff"
                                var cExcl = ""
                                var cNote = ""
                                if (reacts[reac].partitions.datas[dataPos].hasOwnProperty("note")) {
                                    cNote = reacts[reac].partitions.datas[dataPos].note
                                    cBgCol = "#ccff66"
                                }
                                if (reacts[reac].partitions.datas[dataPos].hasOwnProperty("excluded")) {
                                    cExcl = reacts[reac].partitions.datas[dataPos].excluded
                                    cBgCol = "#ff704d"
                                }
                                cell = '  <td style="font-size:0.7em;background-color:' + cBgCol + ';"'
                                cell += ' onclick="showReactSel(1, ' + reac + ', ' + dataPos + ')">'
                                cell += reacts[reac].partitions.datas[dataPos].tar + '<br />'
                                cell += 'Excl: ' + cExcl + '<br />'
                                cell += 'Note: ' + cNote + '</td>'
                                exDigiRowUsed = true
                                }
                            if ((exClasRowUsed == false) &&
                                (exDigiRowUsed == false)) {
                                cell = '  <td></td>'
                            }
                        }




                    }
                    if(0) {
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
                rowCont += cell
            }
            rowCont += '</tr>\n'
            if ((exClasRowUsed == true) ||
                (exDigiRowUsed == true)) {
                ret += rowCont
                exClasRowUsed = false
                exDigiRowUsed = false
                r--
                exRowCount++
            } else {
                exRowCount = 0
            }
            rowCont = ""
        }
        ret += '</table><br /><br />'

        ret += '<div class="card">'
        ret += '  <div class="card-header">Annotation</div>'
        ret += '  <div class="card-body">'
        ret += '    <div class="form-group">'
        ret += '      <label for="runView-ele-react">Reaction (Ranges may be provided as B2-D6):</label>'
        ret += '      <input type="text" class="form-control" id="runView-ele-react"'
        ret += ' value="' + window.selWell + '" onchange="updateWellSel()">'
        ret += '    </div>'
        ret += '    <div class="form-group">'
        ret += '      <label for="runView-ele-tar">Target:</label>'
        ret += '      <input type="text" class="form-control" id="runView-ele-tar"'
        ret += ' value="' + window.selTar + '" onchange="updateWellSel()">'
        ret += '    </div>'
        ret += '    <div class="form-group">'
        ret += '      <label for="runView-ele-pcrstyle">Data Source:</label>'
        ret += '      <select class="form-control" id="runView-ele-pcrstyle" onchange="updateWellSel()">'
        if (window.selPCR == 0) {
            ret += '        <option value="classic" selected>classic</option>\n'
            ret += '        <option value="digital">digital</option>\n'
        } else {
            ret += '        <option value="classic">classic</option>\n'
            ret += '        <option value="digital" selected>digital</option>\n'
        }
        ret += '      </select>\n'
        ret += '    </div>'
        ret += '    <div class="form-group">'
        ret += '      <label for="runView-ele-excl">Excluded:</label>'
        ret += '      <input type="text" class="form-control" id="runView-ele-excl" onchange="updateErrNote()"'
        ret += ' value="' + window.selExcl + '" >'
        ret += '    </div>'
        if (window.rdmlData.rdml.version == "1.3") {
            ret += '    <div class="form-group">'
            ret += '      <label for="runView-ele-note">Notes:</label>'
            ret += '      <input type="text" class="form-control" id="runView-ele-note" onchange="updateErrNote()"'
            ret += ' value="' + window.selNote + '" >'
            ret += '    </div>'
        } else {
            ret += '      <input type="hidden" id="runView-ele-note" value="" >'
        }
        ret += '<button type="submit" class="btn btn-outline-primary" '
        ret += 'onclick="replaceExcl()">'
        ret += '      <i class="fas fa-rocket" style="margin-right: 5px;"></i>'
        ret += '        Replace Exclusion'
        ret += '    </button>&nbsp;'
        ret += '<button type="submit" class="btn btn-outline-primary" '
        ret += 'onclick="replaceNote()">'
        ret += '      <i class="fas fa-rocket" style="margin-right: 5px;"></i>'
        ret += '        Replace Note'
        ret += '    </button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
        ret += '<button type="submit" class="btn btn-outline-primary" '
        ret += 'onclick="appendExcl()">'
        ret += '      <i class="fas fa-rocket" style="margin-right: 5px;"></i>'
        ret += '        Append Exclusion'
        ret += '    </button>&nbsp;'
        ret += '<button type="submit" class="btn btn-outline-primary" '
        ret += 'onclick="appendNote()">'
        ret += '      <i class="fas fa-rocket" style="margin-right: 5px;"></i>'
        ret += '        Append Note'
        ret += '    </button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
        ret += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
        ret += '<button type="submit" class="btn btn-outline-danger" '
        ret += 'onclick="delTarData()">'
        ret += '      <i class="fas fa-rocket" style="margin-right: 5px;"></i>'
        ret += '        Delete Target Data'
        ret += '    </button>&nbsp;'
        ret += '<button type="submit" class="btn btn-outline-danger" '
        ret += 'onclick="delReactData()">'
        ret += '      <i class="fas fa-rocket" style="margin-right: 5px;"></i>'
        ret += '        Delete Reaction Data'
        ret += '    </button><br /><br />'
        ret += '    Here you can view the exclusion remarks and from RDML version 1.3 the'
        ret += '    notes of the RDML file. Any entry in exclusion will exclude this reaction/target combination '
        ret += '    from further analysis. <br />'
        ret += '  </div>'
        ret += '</div>'

    }
    resultData.innerHTML = ret
    updateWellSel()
}

window.updateExperimenter = updateExperimenter;
function updateExperimenter() {
    var newData = getSaveHtmlData("dropSelExperiment")
    if (window.selExperiment == newData) {
        return
    }
    window.selExperiment = newData
    window.selRun = ""
    resetSelection()
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
    var ret = {}
    ret["mode"] = "get-run-data"
    ret["sel-experiment"] = window.selExperiment
    ret["sel-run"] = window.selRun
    resetSelection()
    updateServerData(uuid, JSON.stringify(ret))
}

window.updateErrNote = updateErrNote;
function updateErrNote() {
    window.selExcl = document.getElementById('runView-ele-excl').value
    window.selNote = document.getElementById('runView-ele-note').value
}

window.updateWellSel = updateWellSel;
function updateWellSel() {
    window.selReact = -1;
    var well = document.getElementById('runView-ele-react').value
    window.selWell = well
    var pcrStr = document.getElementById('runView-ele-pcrstyle').value
    var pcr = 0
    window.selPCR = 0
    if (pcrStr != "classic") {
        pcr = 1
        window.selPCR = 1
    }
    var tar = document.getElementById('runView-ele-tar').value
    window.selTar = tar

    if (well.indexOf("-") > -1) {
        return
    }
    var match = well.match(/(\D)(\d+)\s*/)
    if ((match != null) &&
        (window.experimentPos > -1) && 
        (window.runPos > -1) && 
        (window.reactData.hasOwnProperty("reacts"))) {
        var reacts = window.reactData.reacts
        var exp = window.rdmlData.rdml.experiments
        var the_run = exp[window.experimentPos].runs[window.runPos]
        var columns = parseInt(the_run.pcrFormat.columns)
        var newId = parseInt(match[2]) + (match[1].toUpperCase().charCodeAt() - 'A'.charCodeAt()) * columns
        var react = -1
        for (var reac = 0; reac < reacts.length; reac++) {
            if (parseInt(reacts[reac].id) == newId) {
                react = reac
                window.selReact = newId
                break
            }
        }
        var newTar = -1
        if ((pcr == 0) &&
            (react > 0) &&
            (reacts[react].hasOwnProperty("datas")) && 
            (reacts[react].datas.length) > 0) {
            for (var dataIt = 0; dataIt < reacts[react].datas.length; dataIt++) {
                if (reacts[react].datas[dataIt].tar == tar) {
                    newTar = dataIt
                    break
                }
            }
        }
        if ((pcr == 1) && 
            (react > 0) &&
            (window.rdmlData.rdml.version == "1.3") &&
            (reacts[react].hasOwnProperty("partitions")) &&
            (reacts[react].partitions.hasOwnProperty("datas")) &&
            (reacts[react].partitions.datas.length) > 0) {
            for (var dataIt = 0; dataIt < reacts[react].partitions.datas.length; dataIt++) {
                if (reacts[react].partitions.datas[dataIt].tar == tar) {
                    newTar = dataIt
                    break
                }
            }
        }
        if ((react > 0) && (newTar > -1)) {
            showReactSel(pcr, react, newTar)
        }
    }
}


window.showReactSel = showReactSel;
function showReactSel(pcr, react, dataPos) {
    if ((window.experimentPos > -1) && 
        (window.runPos > -1) && 
        (window.reactData.hasOwnProperty("reacts"))) {
        var reacts = window.reactData.reacts
        var id = parseInt(reacts[react].id)
        window.selReact = id
        var exp = window.rdmlData.rdml.experiments
        var the_run = exp[window.experimentPos].runs[window.runPos]
        
        var columns = parseInt(the_run.pcrFormat.columns)
        var rowLabel = the_run.pcrFormat.rowLabel
        var columnLabel = the_run.pcrFormat.columnLabel
        var finColumn = (parseInt(id) - 1) % columns
        var finRow = (parseInt((parseInt(id) - 1) / columns))
        var wellId = ""
        if (rowLabel == "123") {
            wellId += finRow + 1
        } else if (rowLabel == "ABC") {
            wellId += String.fromCharCode('A'.charCodeAt(0) + finRow)
        }
        if (columnLabel == "123") {
            wellId += finColumn + 1
        } else if (columnLabel == "ABC") {
            wellId += String.fromCharCode('A'.charCodeAt(0) + finColumn)
        }    
        document.getElementById('runView-ele-react').value = wellId
        window.selWell = wellId
 
        if ((pcr == 0) &&
            (reacts[react].hasOwnProperty("datas")) && 
            (dataPos < reacts[react].datas.length)) {
            document.getElementById('runView-ele-pcrstyle').selectedIndex = 0
            window.selPCR = 0
            document.getElementById('runView-ele-tar').value = reacts[react].datas[dataPos].tar
            window.selTar = reacts[react].datas[dataPos].tar
            document.getElementById('runView-ele-excl').value = saveUndefKey(reacts[react].datas[dataPos], "excl")
            if (window.rdmlData.rdml.version == "1.3") {
                document.getElementById('runView-ele-note').value = saveUndefKey(reacts[react].datas[dataPos], "note")
            }
        }
        if ((pcr == 1) && 
            (window.rdmlData.rdml.version == "1.3") &&
            (reacts[react].hasOwnProperty("partitions")) &&
            (reacts[react].partitions.hasOwnProperty("datas")) &&
            (dataPos < reacts[react].partitions.datas.length)) {
            document.getElementById('runView-ele-pcrstyle').selectedIndex = 1
            window.selPCR = 1
            document.getElementById('runView-ele-tar').value = reacts[react].partitions.datas[dataPos].tar
            window.selTar = reacts[react].partitions.datas[dataPos].tar
            document.getElementById('runView-ele-excl').value = saveUndefKey(reacts[react].partitions.datas[dataPos], "excluded")
            document.getElementById('runView-ele-note').value = saveUndefKey(reacts[react].partitions.datas[dataPos], "note")
        }
    }
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
