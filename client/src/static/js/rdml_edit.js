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
const resultData = document.getElementById('result-data')
const fileInfoData = document.getElementById('file-info-data')
const rdmlidsData = document.getElementById('rdmlids-data')
const debugData = document.getElementById('debug-data')
const experimentersData = document.getElementById('experimenters-data')
var sectionResults = document.getElementById('results')

window.uuid = "";
window.rdmlData = "";
window.isvalid = "untested";

window.editMode = false;
window.editType = "";
window.editIsNew = false;
window.editNumber = -1;

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

    // The experimenters tab
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

moveEditElement

// Delete the selected element
window.moveEditElement = moveEditElement;
function moveEditElement(typ, id, pos){
    if (!(window.rdmlData.hasOwnProperty("rdml"))) {
        return
    }
    if (window.editMode == false) {
        updateServerData(uuid, '{"mode": "move", "type": "' + typ + '", "id": "' + id + '", "position": ' + pos + '}')
    }
    // If edit mode, delete only the edited element, ignore the other delete buttons
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


    updateServerData(uuid, JSON.stringify(ret))
}




function checkStatVal() {
     alert("EditMode: " + window.editMode +
           "\nIsNew: " + window.editIsNew +
           "\nEditType: " + window.editType +
           "\nEditNumber: " + window.editNumber)

}
