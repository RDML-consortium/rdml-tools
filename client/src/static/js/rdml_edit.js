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
const resultData = document.getElementById('result-data')
const experimentersData = document.getElementById('experimenters-data')
var sectionResults = document.getElementById('results')

var uuid = "";
var rdmlData = "";

document.addEventListener("DOMContentLoaded", function() {
    checkForUUID();
});

function checkForUUID() {
    var path = window.location.search; // .pathname;
    if (path.match(/UUID=.+/)) {
        var uuid = path.split("UUID=")[1];
        run(uuid)
    }
}

$('#mainTab a').on('click', function(e) {
    e.preventDefault()
    $(this).tab('show')
})

function showExample() {
    run("example")
}

function showUpload() {
    run("data")
}

// TODO client-side validation
function updateData() {
    const formData = new FormData()
    if (uuid == "sample.rdml") {
        formData.append('showExample', 'showExample')
    } else {
        formData.append('uuid', uuid)
    }

    axios
        .post(`${API_URL}/data`, formData)
        .then(res => {
            if (res.status === 200) {
                rdmlData = res.data.data
                updateAllData()
            }
        })
        .catch(err => {
            rdmlData = ""
            let errorMessage = err
            if (err.response) {
                errorMessage = err.response.data.errors
                .map(error => error.title)
                .join('; ')
            }
            showElement(resultError)
            var err = '<i class="fas fa-fire"></i>\n<span id="error-message">'
            err += errorMessage + '</span>'
            resultError.innerHTML = err
        })
}

// TODO client-side validation
function run(stat) {
  const formData = new FormData()
  if (stat == "example") {
    formData.append('showExample', 'showExample')
  } else if (stat == "data") {
    formData.append('queryFile', inputFile.files[0])
  } else {
    formData.append('uuid', stat)
  }
  hideElement(resultError)
  showElement(resultInfo)

  axios
    .post(`${API_URL}/upload`, formData)
    .then(res => {
	if (res.status === 200) {
          handleSuccess(res.data.data)
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

function handleSuccess(res) {
    hideElement(resultInfo)
    uuid = res.uuid
    var ret = '<br /><div class="card">\n<div class="card-body">\n'
    ret += '<h5 class="card-title">Link to this result page</h5>\n<p>'
    ret += '<a href="' + `${API_LINK}` + "edit.html?UUID=" + res.uuid + '">'
    ret += `${API_LINK}` + "edit.html?UUID=" + res.uuid + '</a> (valid for 3 days)\n</p>\n'
    ret += '<p>File is '
    if (!(res.isvalid)) {
        ret += 'not '
        err = '<i class="fas fa-fire"></i>\n<span id="error-message">'
        resultError.innerHTML = err + 'Error: Uploaded file is not valid RDML!</span>'
        showElement(resultError)
    } else {
        hideElement(resultError)
    }
    ret += 'valid RDML! Click here for more information:<br />'
    ret += '<a href="' + `${API_LINK}` + "validate.html?UUID=" + res.uuid + '" target="_blank">'
    ret += `${API_LINK}` + "validate.html?UUID=" + res.uuid + '</a> (valid for 3 days)\n<br />\n'
    ret += '</p>\n</div>\n</div>\n'
    resultLink.innerHTML = ret
    updateData()
}

function updateAllData() {
    if (!(rdmlData.hasOwnProperty("rdml"))) {
        deleteAllData()
        return
    }
    ret = ''
    var exp = rdmlData.rdml.experimenters;
    for (var i = 0; i < exp.length; i++) {
        ret += '<br /><div class="card">\n<div class="card-body">\n'
        ret += '<h5 class="card-title">Experimenter ID: ' + exp[i].id + '</h5>\n<p>'
        ret += '<table style="width:100%;">'
        ret += '  <tr>\n    <td style="width:20%;">Name:</td>\n'
        ret += '    <td style="width:80%">\n'+ exp[i].lastName + ', ' + exp[i].firstName + '</td>\n'
        ret += '  </tr>'
        if (exp[i].hasOwnProperty("email")) {
          ret += '  <tr>\n    <td style="width:20%;">E-Mail:</td>\n'
          ret += '    <td style="width:80%">\n'+ exp[i].email + '</td>\n'
          ret += '  </tr>'
        }
        if (exp[i].hasOwnProperty("labName")) {
          ret += '  <tr>\n    <td style="width:20%;">Lab Name:</td>\n'
          ret += '    <td style="width:80%">\n'+ exp[i].labName + '</td>\n'
          ret += '  </tr>'
        }
        if (exp[i].hasOwnProperty("labAddress")) {
          ret += '  <tr>\n    <td style="width:20%;">Lab Address:</td>\n'
          ret += '    <td style="width:80%">\n'+ exp[i].labAddress + '</td>\n'
          ret += '  </tr>'
        }
        ret += '</table></p>\n</div>\n</div>\n'
    }
    experimentersData.innerHTML = ret

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


