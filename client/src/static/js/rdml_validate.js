const API_URL = process.env.API_URL
const API_LINK = process.env.API_LINK

$('#mainTab a').on('click', function(e) {
  e.preventDefault()
  $(this).tab('show')
})

const resultLink = document.getElementById('link-results')

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
  resultLink.click()
  const formData = new FormData()
  if (stat == "example") {
    formData.append('showExample', 'showExample')
  } else if (stat == "data") {
    formData.append('queryFile', inputFile.files[0])
  } else {
    formData.append('uuid', stat)
  }
  hideElement(resultError)
  resultData.innerHTML = ""
  showElement(resultInfo)

  axios
    .post(`${API_URL}/validate`, formData)
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
      resultData.innerHTML = ""
      resultError.querySelector('#error-message').textContent = errorMessage
    })
}

function handleSuccess(res) {
    hideElement(resultInfo)
    var ret = '<p>Link to this result page:\n'
    ret += '<a href="' + `${API_LINK}` + "validate.html?UUID=" + res.uuid + '">'
    ret += `${API_LINK}` + "validate.html?UUID=" + res.uuid + '</a>\n'
    ret += ' (valid for 3 days)\n</p>\n'
    ret += '<p>Link to remove uploaded data:\n'
    ret += '<a href="' + `${API_LINK}` + "remove.html?UUID=" + res.uuid + '" target="_blank">'
    ret += `${API_LINK}`  + "remove.html?UUID=" + res.uuid + '</a> (valid for 3 days)\n<br />\n'
    ret += '</p>\n<br />\n'
    var resArr = res.table.split('\n')
    ret += '<table style="width:100%; border-collapse: separate; border-spacing: 5px;">\n'
    for (var i = 0 ; i < resArr.length ; i++) {
        var line = resArr[i].split('\t')
        if (line.length != 3) {
            continue;
        }
        ret += '  <tr>\n    <td style="width:20%;">' + line[0] + '</td>\n'
        ret += '    <td style="width:80%;background-color:'
        if (line[1] == "True") {
            ret += '#5cd65c;">\n'
        } else {
            ret += '#ff5c33;">\n'
        }
        ret += line[2] + '</td>\n'
        ret += '  </tr>'
    }
    ret += "</table>\n"
    resultData.innerHTML = ret
    hideElement(resultError)
}

function showElement(element) {
  element.classList.remove('d-none')
}

function hideElement(element) {
  element.classList.add('d-none')
}


