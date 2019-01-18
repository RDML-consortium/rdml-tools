const API_URL = process.env.API_URL

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
var sectionResults = document.getElementById('results')

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
  } else {
    formData.append('queryFile', inputFile.files[0])
  }
  hideElement(resultError)
  traceView.deleteContent()
  showElement(resultInfo)

  axios
    .post(`${API_URL}/upload`, formData)
    .then(res => {
	if (res.status === 200) {
          handleSuccess(res.data)
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
      traceView.deleteContent()
      resultError.querySelector('#error-message').textContent = errorMessage
    })
}

function handleSuccess(res) {
    hideElement(resultInfo)
    hideElement(resultError)
}

function showElement(element) {
  element.classList.remove('d-none')
}

function hideElement(element) {
  element.classList.add('d-none')
}


