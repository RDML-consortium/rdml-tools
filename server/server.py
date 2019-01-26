#! /usr/bin/env python

import os
import uuid
import re
import subprocess
import argparse
import json
from subprocess import call
from flask import Flask, send_file, flash, send_from_directory, request, redirect, url_for, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename

import rdmlpython as rdml

RDMLWS = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__)
CORS(app)
app.config['RDML'] = os.path.join(RDMLWS, "..")
app.config['UPLOAD_FOLDER'] = os.path.join(app.config['RDML'], "data")
app.config['MAX_CONTENT_LENGTH'] = 32 * 1024 * 1024   # maximum of 32MB


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in set(['rdml', 'rdm', 'xml'])


@app.route('/api/v1/validate', methods=['POST'])
def upload_file():
    if request.method == 'POST':
        uuidstr = str(uuid.uuid4())
        
        # Get subfolder
        sf = os.path.join(app.config['UPLOAD_FOLDER'], uuidstr[0:2])
        if not os.path.exists(sf):
            os.makedirs(sf)
       
        if 'showExample' in request.form.keys():
            fexpname = os.path.join(RDMLWS, "error.rdml")
        else:
            if 'queryFile' not in request.files:
                return jsonify(errors = [{"title": "RDML file is missing!"}]), 400
            fexp = request.files['queryFile']
            if fexp.filename == '':
                return jsonify(errors = [{"title": "RDML file name is missing!"}]), 400
            if not allowed_file(fexp.filename):
                return jsonify(errors = [{"title": "RDML file has incorrect file type!"}]), 400 
            fexpname = os.path.join(sf, "rdml_" + uuidstr + "_" + secure_filename(fexp.filename))
            fexp.save(fexpname)

        # Run RDML-Python
        rd = rdml.Rdml()
        ret = rd.validate(fexpname)
        return jsonify(data = ret)
    return jsonify(errors = [{"title": "Error in handling POST request!"}]), 400


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3300, debug=True, threaded=True)
