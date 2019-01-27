const API_URL = process.env.API_URL
const API_LINK = process.env.API_LINK

$('#mainTab a').on('click', function(e) {
  e.preventDefault()
  $(this).tab('show')
})

const resultLink = document.getElementById('uuid-link-box')

const submitButton = document.getElementById('btn-submit')
submitButton.addEventListener('click', showUpload)

const exampleButton = document.getElementById('btn-example')
exampleButton.addEventListener('click', showExample)

const inputFile = document.getElementById('inputFile')
const resultInfo = document.getElementById('result-info')
const resultError = document.getElementById('result-error')
const resultData = document.getElementById('result-data')
var sectionResults = document.getElementById('results')

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

function showExample() {
  run("example")
}

function showUpload() {
  run("data")
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
    if (res.isvalid) {
      var ret = '<p>Link to this result page:\n'
      ret += '<a href="' + `${API_LINK}` + "edit.html?UUID=" + res.uuid + '">'
      ret += `${API_LINK}` + "edit.html?UUID=" + res.uuid + '</a>\n'
      ret += ' (valid for 3 days) ' + res.isvalid + '\n</p>\n<br />\n'
      resultLink.innerHTML = ret
      hideElement(resultError)
    } else {
      resultLink.innerHTML = ""
      var ret = '<i class="fas fa-fire"></i>\nNot a valid RDML file:\n'
      ret += '<a href="' + `${API_LINK}` + "validate.html?UUID=" + res.uuid + '" target="_blank">'
      ret += `${API_LINK}` + "validate.html?UUID=" + res.uuid + '</a> (click for validation results)\n'
      hideElement(resultInfo)
      showElement(resultError)
      resultError.innerHTML = ret
    }
}

function showElement(element) {
  element.classList.remove('d-none')
}

function hideElement(element) {
  element.classList.add('d-none')
}


