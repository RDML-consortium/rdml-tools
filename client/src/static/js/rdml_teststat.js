"use strict";

var jquery = require("jquery");
window.$ = window.jQuery = jquery; // notice the definition of global variables here

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
  var textField = document.getElementById('table-area');
  var exampData = "a\t2.5820\t2.3426\t2.3980\t1.4048\t1.8926\t1.5056\t1.6677\n"
                + "a\t1.0000\t1.1834\n"
                + "b\t1.5366\n"
                + "b\t1.7910\t1.1842\t2.1703\t1.5164\n";
  textField.value = exampData;
}

function showUpload() {
  run()
}

// TODO client-side validation
function run() {
  resultLink.click()
  const formData = new FormData()
  var ret = {}
  var test = "N";
  if (document.getElementById('test-radio-non').checked) {
    test = "N";
  }
  if (document.getElementById('test-radio-para').checked) {
    test = "Y";
  }
  var sep = "\t";
  if (document.getElementById('sep-radio-tab').checked) {
    sep = "\t";
  }
  if (document.getElementById('sep-radio-comma').checked) {
    sep = ",";
  }
  if (document.getElementById('sep-radio-semicolon').checked) {
    sep = ";";
  }
  if (document.getElementById('sep-radio-colon').checked) {
    sep = ":";
  }
  ret["parametric"] = test
  ret["seperator"] = sep
  ret["replace-comma"] = document.getElementById('modCommaDot').checked
  ret["table"] = document.getElementById('table-area').value
  formData.append('reqData', JSON.stringify(ret))
  hideElement(resultError)
  resultData.innerHTML = ""
  showElement(resultInfo)

  axios
    .post(`${API_URL}/teststat`, formData)
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
    var ret = '<table style="width:100%; border-collapse: separate; border-spacing: 5px;">\n'
    ret += '  <tr>\n    <td style="width:20%;">Test: </td>\n'
    ret += '    <td style="width:80%;">\n' + res["table"]["test name"] + '</td>\n'
    ret += '  </tr>'
    ret += '  <tr>\n    <td style="width:20%;">' + res["table"]["stat name"] + ':</td>\n'
    ret += '    <td style="width:80%;">\n' + res["table"]["stat val"] + '</td>\n'
    ret += '  </tr>'
    ret += '  <tr>\n    <td style="width:20%;">p-value:</td>\n'
    ret += '    <td style="width:80%;">\n' + res["table"]["p val"] + '</td>\n'
    ret += '  </tr>'
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


