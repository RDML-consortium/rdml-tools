#! /usr/bin/env python

import os
import uuid
import re
import argparse
import json
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


uuid_re = re.compile(r'(^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})-{0,1}([ap]{0,1})([cj]{0,1})$')


def is_valid_uuid(s):
    return uuid_re.match(s) is not None


@app.route('/api/v1/validate', methods=['POST'])
def validate_file():
    if request.method == 'POST':
        if 'showExample' in request.form.keys():
            fexpname = os.path.join(RDMLWS, "error.rdml")
            uuidstr = "error.rdml"
        elif 'uuid' in request.form.keys():
            uuidstr = request.form['uuid']
            if uuidstr == "error.rdml":
                fexpname = os.path.join(RDMLWS, "error.rdml")
            else:
                if not is_valid_uuid(uuidstr):
                    return jsonify(errors=[{"title": "Invalid UUID - UUID link outdated or invalid!"}]), 400
                sf = os.path.join(app.config['UPLOAD_FOLDER'], uuidstr[0:2])
                if not os.path.exists(sf):
                    return jsonify(errors=[{"title": "Invalid path - UUID link outdated or invalid!"}]), 400
                fname = "rdml_" + uuidstr + ".rdml";
                if not allowed_file(fname):
                    return jsonify(errors=[{"title": "Invalid filename - UUID link outdated or invalid!"}]), 400
                fexpname = os.path.join(sf, fname)
                if not os.path.isfile(fexpname):
                    return jsonify(errors=[{"title": "Invalid file - UUID Link outdated or invalid!"}]), 400
        else:
            if 'queryFile' not in request.files:
                return jsonify(errors = [{"title": "RDML file is missing!"}]), 400
            fexp = request.files['queryFile']
            if fexp.filename == '':
                return jsonify(errors = [{"title": "RDML file name is missing!"}]), 400
            if not allowed_file(fexp.filename):
                return jsonify(errors = [{"title": "RDML file has incorrect file type!"}]), 400
            uuidstr = str(uuid.uuid4())
            # Get subfolder
            sf = os.path.join(app.config['UPLOAD_FOLDER'], uuidstr[0:2])
            if not os.path.exists(sf):
                os.makedirs(sf)
            fexpname = os.path.join(sf, "rdml_" + uuidstr + ".rdml")
            fexp.save(fexpname)

        # Run RDML-Python
        rd = rdml.Rdml()
        ret = rd.validate(fexpname)
        return jsonify(data={"table": ret, "uuid": uuidstr})
    return jsonify(errors=[{"title": "Error in handling POST request!"}]), 400


@app.route('/api/v1/upload', methods=['POST'])
def upload_file():
    if request.method == 'POST':
        if 'showExample' in request.form.keys():
            fexpname = os.path.join(RDMLWS, "sample.rdml")
            uuidstr = "sample.rdml"
        elif 'uuid' in request.form.keys():
            uuidstr = request.form['uuid']
            if uuidstr == "sample.rdml":
                fexpname = os.path.join(RDMLWS, "sample.rdml")
            else:
                if not is_valid_uuid(uuidstr):
                    return jsonify(errors=[{"title": "Invalid UUID - UUID link outdated or invalid!"}]), 400
                sf = os.path.join(app.config['UPLOAD_FOLDER'], uuidstr[0:2])
                if not os.path.exists(sf):
                    return jsonify(errors=[{"title": "Invalid path - UUID link outdated or invalid!"}]), 400
                fname = "rdml_" + uuidstr + ".rdml";
                if not allowed_file(fname):
                    return jsonify(errors=[{"title": "Invalid filename - UUID link outdated or invalid!"}]), 400
                fexpname = os.path.join(sf, fname)
                if not os.path.isfile(fexpname):
                    return jsonify(errors=[{"title": "Invalid file - UUID Link outdated or invalid!"}]), 400
        else:
            if 'queryFile' not in request.files:
                return jsonify(errors = [{"title": "RDML file is missing!"}]), 400
            fexp = request.files['queryFile']
            if fexp.filename == '':
                return jsonify(errors = [{"title": "RDML file name is missing!"}]), 400
            if not allowed_file(fexp.filename):
                return jsonify(errors = [{"title": "RDML file has incorrect file type!"}]), 400
            uuidstr = str(uuid.uuid4())
            # Get subfolder
            sf = os.path.join(app.config['UPLOAD_FOLDER'], uuidstr[0:2])
            if not os.path.exists(sf):
                os.makedirs(sf)
            fexpname = os.path.join(sf, "rdml_" + uuidstr + ".rdml")
            fexp.save(fexpname)

        # Return the uuid
        rd = rdml.Rdml()
        ret = rd.isvalid(fexpname)
        return jsonify(data={"isvalid": ret, "uuid": uuidstr})
    return jsonify(errors=[{"title": "Error in handling POST request!"}]), 400


@app.route('/api/v1/data', methods=['POST'])
def handle_data():
    if request.method == 'POST':
        if 'showExample' in request.form.keys():
            fexpname = os.path.join(RDMLWS, "sample.rdml")
            uuidstr = "sample.rdml"
        elif 'uuid' in request.form.keys():
            uuidstr = request.form['uuid']
            if uuidstr == "sample.rdml":
                fexpname = os.path.join(RDMLWS, "sample.rdml")
            else:
                if not is_valid_uuid(uuidstr):
                    return jsonify(errors=[{"title": "Invalid UUID - UUID link outdated or invalid!"}]), 400
                sf = os.path.join(app.config['UPLOAD_FOLDER'], uuidstr[0:2])
                if not os.path.exists(sf):
                    return jsonify(errors=[{"title": "Invalid path - UUID link outdated or invalid!"}]), 400
                fname = "rdml_" + uuidstr + ".rdml";
                if not allowed_file(fname):
                    return jsonify(errors=[{"title": "Invalid filename - UUID link outdated or invalid!"}]), 400
                fexpname = os.path.join(sf, fname)
                if not os.path.isfile(fexpname):
                    return jsonify(errors=[{"title": "Invalid file - UUID Link outdated or invalid!"}]), 400
        else:
            return jsonify(errors=[{"title": "Upload RDML file first!"}]), 400

        # Run RDML-Python
        rd = rdml.Rdml(fexpname)
        ret = rd.tojson()
        rd.save("nnnn.rdml")
        return jsonify(data=ret)
    return jsonify(errors=[{"title": "Error in handling POST request!"}]), 400


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3300, debug=True, threaded=True)
