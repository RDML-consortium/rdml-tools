const API_URL = process.env.API_URL
const API_LINK = process.env.API_LINK

const submitButton = document.getElementById('btn-remove')
submitButton.addEventListener('click', showUpload)

const resultError = document.getElementById('result-error')
const resultData = document.getElementById('result-data')

window.uuid = ""

document.addEventListener("DOMContentLoaded", function() {
    checkForUUID();
});

function checkForUUID() {
  var path = window.location.search; // .pathname;
  if (path.match(/UUID=.+/)) {
    window.uuid = path.split("UUID=")[1];
    run(window.uuid, "check")
  }
}

function showUpload() {
  if (window.uuid != "") {
    run(window.uuid, "remove")
  }
}

// TODO client-side validation
function run(stat, mode) {
  const formData = new FormData()
  formData.append('uuid', stat)
  formData.append('mode', mode)

  axios
    .post(`${API_URL}/remove`, formData)
    .then(res => {
	if (res.status === 200) {
          handleSuccess(res.data.data)
      }
    })
    .catch(err => {
      alert("ERR")
      let errorMessage = err
      if (err.response) {
        errorMessage = err.response.data.errors
          .map(error => error.title)
          .join('; ')
      }
      showElement(resultError)
      resultData.innerHTML = ""
      resultError.querySelector('#error-message').textContent = errorMessage
    })
}

function handleSuccess(res) {
    if (res.mode == "check") {
        var ret = '<h2>Data was found to delete!</h2>\n'
        ret += '<p>The data has the UUID: ' + res.uuid + '</p>\n'
        ret += '<p>' + res.files + '</p>\n'
        ret += '<p>All data will be automatically deleted within less than 7 days.</p>\n'
        ret += '<p>You may delete it now by clicking the button below (no undo).</p>\n'
        resultData.innerHTML = ret
        showElement(submitButton)
    } else {
        var ret = '<h2>The Data was deleted!</h2>\n'
        ret += '<p>The data had the UUID: ' + res.uuid + '</p>\n'
        ret += '<p>' + res.files + '</p>\n'
        resultData.innerHTML = ret
        hideElement(submitButton)
    }
}

function showElement(element) {
  element.classList.remove('d-none')
}

function hideElement(element) {
  element.classList.add('d-none')
}


