"use strict";

var jquery = require("jquery");
window.$ = window.jQuery = jquery; // notice the definition of global variables here

const API_URL = process.env.API_URL
const API_LINK = process.env.API_LINK

var rawResults = "";
var rdml_errors = [];

const resultInfo = document.getElementById('result-info')
const resultError = document.getElementById('result-error')

document.addEventListener("DOMContentLoaded", function() {
  const formData = new FormData();
  axios
    .post(`${API_URL}/statistics`, formData)
    .then(res => {
        if (res.status === 200) {
          rawResults = res.data.outfile;
          formatTable();
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
});

function showElement(element) {
  element.classList.remove('d-none')
}

function hideElement(element) {
  element.classList.add('d-none')
}

function formatTable() {
  if (rawResults != "") {
    var lineSplit = rawResults.split('\n');
    var res = '<div class="rdml_section">\n<table id="rdml-full-with">\n'
    for (var i = 0; i < lineSplit.length; i++) {
      var colSplit = lineSplit[i].split('\t');
      res += "<tr>\n";
      for (var k = 0; k < colSplit.length; k++) {
        var alig = ""
        if (k != 0) {
          alig = ' style="text-align: right"'
        }
        if (i == 0) {
          res += "<th" + alig + ">" + colSplit[k] + "</th>\n";
        } else {
          res += "<td" + alig + ">" + colSplit[k] + "</td>\n";
        }
      }
      res += "</tr>\n";
    }
    res += '</div>\n</table>\n'

    document.getElementById('results-statistics').innerHTML = res
    hideElement(resultInfo)
  }
}
