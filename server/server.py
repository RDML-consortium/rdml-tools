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


@app.route('/api/v1/download/<uuidstr>')
def download(uuidstr):
    if is_valid_uuid(uuidstr):
        fname = "rdml_" + uuidstr + ".rdml"
        if allowed_file(fname):
            sf = os.path.join(app.config['UPLOAD_FOLDER'], uuidstr[0:2])
            if os.path.exists(sf):
                if os.path.isfile(os.path.join(sf, fname)):
                    fexpfilename = os.path.join(sf, "rdml_" + uuidstr + ".txt")
                    downFileName = "data.rdml"
                    if os.path.isfile(downFileName):
                        with open(fexpfilename, 'r') as the_file:
                            downFileName = the_file.read()
                            downFileName = downFileName.replace(".xml", ".rdml")
                    return send_file(os.path.join(sf, fname), mimetype="application/x-rdml", as_attachment=True, attachment_filename=downFileName)
    if uuidstr == "sample.rdml":
        return send_file("sample.rdml", mimetype="application/x-rdml", as_attachment=True, attachment_filename="sample.rdml")
    return "File does not exist!"


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
                fname = "rdml_" + uuidstr + ".rdml"
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
            fexpfilename = os.path.join(sf, "rdml_" + uuidstr + ".txt")
            with open(fexpfilename, 'a') as the_file:
                the_file.write(fexp.filename)
            fexp.save(fexpname)

        # Run RDML-Python
        rd = rdml.Rdml()
        ret = rd.validate(fexpname)
        return jsonify(data={"table": ret, "uuid": uuidstr})
    return jsonify(errors=[{"title": "Error in handling POST request!"}]), 400


@app.route('/api/v1/data', methods=['POST'])
def handle_data():
    if request.method == 'POST':
        if 'showExample' in request.form.keys():
            fexpname = os.path.join(RDMLWS, "sample.rdml")
            uuidstr = "sample.rdml"
        elif 'createNew' in request.form.keys():
            uuidstr = str(uuid.uuid4())
            data = {"uuid": uuidstr}
            # Get subfolder
            sf = os.path.join(app.config['UPLOAD_FOLDER'], uuidstr[0:2])
            if not os.path.exists(sf):
                os.makedirs(sf)
            fexpname = os.path.join(sf, "rdml_" + uuidstr + ".rdml")
            rd = rdml.Rdml()
            rd.save(fexpname)
            data["filedata"] = rd.tojson()
            return jsonify(data=data)
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
                fname = "rdml_" + uuidstr + ".rdml"
                if not allowed_file(fname):
                    return jsonify(errors=[{"title": "Invalid filename - UUID link outdated or invalid!"}]), 400
                fexpname = os.path.join(sf, fname)
                if not os.path.isfile(fexpname):
                    return jsonify(errors=[{"title": "Invalid file - UUID Link outdated or invalid!"}]), 400
        else:
            if 'queryFile' not in request.files:
                return jsonify(errors=[{"title": "RDML file is missing!"}]), 400
            fexp = request.files['queryFile']
            if fexp.filename == '':
                return jsonify(errors=[{"title": "RDML file name is missing!"}]), 400
            if not allowed_file(fexp.filename):
                return jsonify(errors=[{"title": "RDML file has incorrect file type!"}]), 400
            uuidstr = str(uuid.uuid4())
            # Get subfolder
            sf = os.path.join(app.config['UPLOAD_FOLDER'], uuidstr[0:2])
            if not os.path.exists(sf):
                os.makedirs(sf)
            fexpname = os.path.join(sf, "rdml_" + uuidstr + ".rdml")
            fexpfilename = os.path.join(sf, "rdml_" + uuidstr + ".txt")
            with open(fexpfilename, 'a') as the_file:
                the_file.write(fexp.filename)
            fexp.save(fexpname)

        if 'reqData' not in request.form.keys():
            return jsonify(errors=[{"title": "Invalid server request - reqData missing!"}]), 400
        reqdata = json.loads(request.form['reqData'])

        data = {"uuid": uuidstr}
        rd = rdml.Rdml(fexpname)
        modified = False

        if "validate" in reqdata and reqdata["validate"] is True:
            data["isvalid"] = rd.isvalid(fexpname)

        if "mode" in reqdata and reqdata["mode"] == "delete":
            if "type" not in reqdata or "position" not in reqdata:
                return jsonify(errors=[{"title": "Invalid server request - type or position missing!"}]), 400
            if reqdata["type"] == "rdmlid":
                rd.delete_rdmlid(byposition=reqdata["position"])
                modified = True
            if reqdata["type"] == "experimenter":
                rd.delete_experimenter(byposition=reqdata["position"])
                modified = True
            if reqdata["type"] == "documentation":
                rd.delete_documentation(byposition=reqdata["position"])
                modified = True
            if reqdata["type"] == "dye":
                rd.delete_dye(byposition=reqdata["position"])
                modified = True
            if reqdata["type"] == "sample":
                rd.delete_sample(byposition=reqdata["position"])
                modified = True
            if reqdata["type"] == "target":
                rd.delete_target(byposition=reqdata["position"])
                modified = True
            if reqdata["type"] == "cyclingConditions":
                rd.delete_cyclingConditions(byposition=reqdata["position"])
                modified = True
            if reqdata["type"] == "experiment":
                rd.delete_experiment(byposition=reqdata["position"])
                modified = True

        if "mode" in reqdata and reqdata["mode"] == "addSecIds":
            if "primary-key" not in reqdata or "primary-position" not in reqdata:
                return jsonify(errors=[{"title": "Invalid server request - primary-key or primary-position missing!"}]), 400
            if "secondary-key" not in reqdata or "secondary-position" not in reqdata:
                return jsonify(errors=[{"title": "Invalid server request - secondary-key or secondary-position missing!"}]), 400
            if "id-source" not in reqdata:
                return jsonify(errors=[{"title": "Invalid server request - id-source missing!"}]), 400
            if "data" not in reqdata:
                return jsonify(errors=[{"title": "Invalid server request - data missing!"}]), 400
            elem = None
            if reqdata["primary-key"] == "sample":
                elem = rd.get_sample(byposition=reqdata["primary-position"])
                if elem is None:
                    return jsonify(errors=[{"title": "Invalid server request - sample at position not found!"}]), 400
            modified = elem.update_documentation_ids(reqdata["data"])

        if "mode" in reqdata and reqdata["mode"] in ["create", "edit"]:
            if "type" not in reqdata or "data" not in reqdata:
                return jsonify(errors=[{"title": "Invalid server request - type or data missing!"}]), 400

            if reqdata["type"] == "rdmlid":
                if "publisher" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - rdmlid publisher missing!"}]), 400
                if "serialNumber" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - rdmlid serialNumber missing!"}]), 400
                if "MD5Hash" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - rdmlid MD5Hash missing!"}]), 400
                if "current-position" not in reqdata or "new-position" not in reqdata:
                    return jsonify(errors=[{"title": "Invalid server request - position information missing!"}]), 400
                if reqdata["mode"] == "create":
                    try:
                        rd.new_rdmlid(publisher=reqdata["data"]["publisher"],
                                      serialNumber=reqdata["data"]["serialNumber"],
                                      MD5Hash=reqdata["data"]["MD5Hash"],
                                      newposition=int(reqdata["new-position"]))
                    except rdml.RdmlError as err:
                        data["error"] = str(err)
                    else:
                        modified = True
                if reqdata["mode"] == "edit":
                    if "old-id" not in reqdata:
                        return jsonify(errors=[{"title": "Invalid server request - old id information missing!"}]), 400
                    try:
                        elem = rd.get_rdmlid(byposition=int(reqdata["old-id"]))
                        if elem is None:
                            return jsonify(errors=[{"title": "Invalid server request - experimenter id not found!"}]), 400
                        elem["publisher"] = reqdata["data"]["publisher"]
                        elem["serialNumber"] = reqdata["data"]["serialNumber"]
                        elem["MD5Hash"] = reqdata["data"]["MD5Hash"]
                    except rdml.RdmlError as err:
                        data["error"] = str(err)
                    else:
                        modified = True

            if reqdata["type"] == "experimenter":
                if "id" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - experimenter id missing!"}]), 400
                if "firstName" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - experimenter firstName missing!"}]), 400
                if "lastName" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - experimenter lastName missing!"}]), 400
                if "email" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - experimenter email missing!"}]), 400
                if "labName" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - experimenter labName missing!"}]), 400
                if "labAddress" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - experimenter labAddress missing!"}]), 400
                if "current-position" not in reqdata or "new-position" not in reqdata:
                    return jsonify(errors=[{"title": "Invalid server request - position information missing!"}]), 400
                if reqdata["mode"] == "create":
                    try:
                        rd.new_experimenter(id=reqdata["data"]["id"],
                                            firstName=reqdata["data"]["firstName"],
                                            lastName=reqdata["data"]["lastName"],
                                            email=reqdata["data"]["email"],
                                            labName=reqdata["data"]["labName"],
                                            labAddress=reqdata["data"]["labAddress"],
                                            newposition=int(reqdata["new-position"]))
                    except rdml.RdmlError as err:
                        data["error"] = str(err)
                    else:
                        modified = True
                if reqdata["mode"] == "edit":
                    if "old-id" not in reqdata:
                        return jsonify(errors=[{"title": "Invalid server request - old id information missing!"}]), 400
                    try:
                        elem = rd.get_experimenter(byid=reqdata["old-id"])
                        if elem is None:
                            return jsonify(errors=[{"title": "Invalid server request - experimenter id not found!"}]), 400
                        elem["id"] = reqdata["data"]["id"]
                        elem["firstName"] = reqdata["data"]["firstName"]
                        elem["lastName"] = reqdata["data"]["lastName"]
                        elem["email"] = reqdata["data"]["email"]
                        elem["labName"] = reqdata["data"]["labName"]
                        elem["labAddress"] = reqdata["data"]["labAddress"]
                    except rdml.RdmlError as err:
                        data["error"] = str(err)
                    else:
                        modified = True

            if reqdata["type"] == "documentation":
                if "id" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - documentation id missing!"}]), 400
                if "text" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - documentation text missing!"}]), 400
                if "current-position" not in reqdata or "new-position" not in reqdata:
                    return jsonify(errors=[{"title": "Invalid server request - documentation position " +
                                                     "information missing!"}]), 400
                if reqdata["mode"] == "create":
                    try:
                        rd.new_documentation(id=reqdata["data"]["id"],
                                             text=reqdata["data"]["text"],
                                             newposition=int(reqdata["new-position"]))
                    except rdml.RdmlError as err:
                        data["error"] = str(err)
                    else:
                        modified = True
                if reqdata["mode"] == "edit":
                    if "old-id" not in reqdata:
                        return jsonify(errors=[{"title": "Invalid server request - old id information missing!"}]), 400
                    try:
                        elem = rd.get_documentation(byid=reqdata["old-id"])
                        if elem is None:
                            return jsonify(errors=[{"title": "Invalid server request - documentation id not found!"}]), 400
                        elem["id"] = reqdata["data"]["id"]
                        elem["text"] = reqdata["data"]["text"]
                    except rdml.RdmlError as err:
                        data["error"] = str(err)
                    else:
                        modified = True

            if reqdata["type"] == "dye":
                if "id" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - dye id missing!"}]), 400
                if "description" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - dye description missing!"}]), 400
                if "current-position" not in reqdata or "new-position" not in reqdata:
                    return jsonify(errors=[{"title": "Invalid server request - dye position " +
                                                     "information missing!"}]), 400
                if reqdata["mode"] == "create":
                    try:
                        rd.new_dye(id=reqdata["data"]["id"],
                                   description=reqdata["data"]["description"],
                                   newposition=int(reqdata["new-position"]))
                    except rdml.RdmlError as err:
                        data["error"] = str(err)
                    else:
                        modified = True
                if reqdata["mode"] == "edit":
                    if "old-id" not in reqdata:
                        return jsonify(errors=[{"title": "Invalid server request - old id information missing!"}]), 400
                    try:
                        elem = rd.get_dye(byid=reqdata["old-id"])
                        if elem is None:
                            return jsonify(errors=[{"title": "Invalid server request - dye id not found!"}]), 400
                        elem["id"] = reqdata["data"]["id"]
                        elem["description"] = reqdata["data"]["description"]
                    except rdml.RdmlError as err:
                        data["error"] = str(err)
                    else:
                        modified = True

            if reqdata["type"] == "sample":
                if "id" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - sample id missing!"}]), 400
                if "type" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - sample type missing!"}]), 400
                if "description" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - sample description missing!"}]), 400
                if "interRunCalibrator" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - sample interRunCalibrator missing!"}]), 400
                if "quantity" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - sample quantity missing!"}]), 400
                if "calibratorSample" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - sample calibratorSample missing!"}]), 400
                if "cdnaSynthesisMethod_enzyme" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - sample cdnaSynthesisMethod_enzyme missing!"}]), 400
                if "cdnaSynthesisMethod_primingMethod" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - sample cdnaSynthesisMethod_primingMethod missing!"}]), 400
                if "cdnaSynthesisMethod_dnaseTreatment" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - sample cdnaSynthesisMethod_dnaseTreatment missing!"}]), 400
                if "cdnaSynthesisMethod_thermalCyclingConditions" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - sample cdnaSynthesisMethod_thermalCyclingConditions missing!"}]), 400
                if "templateRNAQuantity" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - sample templateRNAQuantity missing!"}]), 400
                if "templateRNAQuality" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - sample templateRNAQuality missing!"}]), 400
                if "templateDNAQuantity" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - sample templateDNAQuantity missing!"}]), 400
                if "templateDNAQuality" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - sample templateDNAQuality missing!"}]), 400
                if "current-position" not in reqdata or "new-position" not in reqdata:
                    return jsonify(errors=[{"title": "Invalid server request - position information missing!"}]), 400
                if reqdata["mode"] == "create":
                    try:
                        rd.new_sample(id=reqdata["data"]["id"],
                                      type=reqdata["data"]["type"],
                                      newposition=int(reqdata["new-position"]))
                    except rdml.RdmlError as err:
                        data["error"] = str(err)
                    else:
                        modified = True
                if reqdata["mode"] in ["create", "edit"]:
                    if reqdata["mode"] == "edit" and "old-id" not in reqdata:
                        return jsonify(errors=[{"title": "Invalid server request - sample old id information missing!"}]), 400
                    try:
                        elem = None
                        if reqdata["mode"] == "create":
                            rd.new_sample(id=reqdata["data"]["id"],
                                          type=reqdata["data"]["type"],
                                          newposition=int(reqdata["new-position"]))
                            elem = rd.get_sample(byid=reqdata["id"])
                        if reqdata["mode"] == "edit":
                            elem = rd.get_sample(byid=reqdata["old-id"])
                            if elem is None:
                                return jsonify(errors=[{"title": "Invalid server request - sample id not found!"}]), 400
                            elem["id"] = reqdata["data"]["id"]
                            elem["type"] = reqdata["data"]["type"]
                        elem["description"] = reqdata["data"]["description"]
                        elem["interRunCalibrator"] = reqdata["data"]["interRunCalibrator"]
                        elem["quantity"] = reqdata["data"]["quantity"]
                        elem["calibratorSample"] = reqdata["data"]["calibratorSample"]
                        elem["cdnaSynthesisMethod_enzyme"] = reqdata["data"]["cdnaSynthesisMethod_enzyme"]
                        elem["cdnaSynthesisMethod_primingMethod"] = reqdata["data"]["cdnaSynthesisMethod_primingMethod"]
                        elem["cdnaSynthesisMethod_dnaseTreatment"] = reqdata["data"]["cdnaSynthesisMethod_dnaseTreatment"]
                        elem["cdnaSynthesisMethod_thermalCyclingConditions"] = reqdata["data"]["cdnaSynthesisMethod_thermalCyclingConditions"]
                        elem["templateRNAQuantity"] = reqdata["data"]["templateRNAQuantity"]
                        elem["templateRNAQuality"] = reqdata["data"]["templateRNAQuality"]
                        elem["templateDNAQuantity"] = reqdata["data"]["templateDNAQuantity"]
                        elem["templateDNAQuality"] = reqdata["data"]["templateDNAQuality"]
                    except rdml.RdmlError as err:
                        data["error"] = str(err)
                    else:
                        modified = True

        if "mode" in reqdata and reqdata["mode"] in ["moveSecIds"]:
            if "primary-key" not in reqdata:
                return jsonify(errors=[{"title": "Invalid server request - primary-key missing!"}]), 400
            if "primary-position" not in reqdata:
                return jsonify(errors=[{"title": "Invalid server request - primary-position information missing!"}]), 400
            if "secondary-key" not in reqdata:
                return jsonify(errors=[{"title": "Invalid server request - secondary-key information missing!"}]), 400
            if "secondary-position" not in reqdata:
                return jsonify(errors=[{"title": "Invalid server request - secondary-position missing!"}]), 400
            if "id-source" not in reqdata:
                return jsonify(errors=[{"title": "Invalid server request - id-source information missing!"}]), 400
            if "old-position" not in reqdata:
                return jsonify(errors=[{"title": "Invalid server request - old-position information missing!"}]), 400
            if "new-position" not in reqdata:
                return jsonify(errors=[{"title": "Invalid server request - new-position missing!"}]), 400
            if reqdata["primary-key"] == "sample":
                try:
                    elem = rd.get_sample(byposition=reqdata["primary-position"])
                    if elem is None:
                        return jsonify(errors=[{"title": "Invalid server request - sample primary-position not found!"}]), 400
                    elem.move_documentation(oldposition=int(reqdata["old-position"]),
                                            newposition=int(reqdata["new-position"]))
                except rdml.RdmlError as err:
                    data["error"] = str(err)
                else:
                    modified = True

        if "mode" in reqdata and reqdata["mode"] in ["move"]:
            if "type" not in reqdata:
                return jsonify(errors=[{"title": "Invalid server request - type missing!"}]), 400
            if "id" not in reqdata:
                return jsonify(errors=[{"title": "Invalid server request - id information missing!"}]), 400
            if "position" not in reqdata:
                return jsonify(errors=[{"title": "Invalid server request - position information missing!"}]), 400
            if reqdata["type"] == "rdmlid":
                try:
                    rd.move_rdmlid(oldposition=int(reqdata["id"]), newposition=reqdata["position"])
                except rdml.RdmlError as err:
                    data["error"] = str(err)
                else:
                    modified = True
            if reqdata["type"] == "experimenter":
                try:
                    rd.move_experimenter(id=reqdata["id"], newposition=reqdata["position"])
                except rdml.RdmlError as err:
                    data["error"] = str(err)
                else:
                    modified = True
            if reqdata["type"] == "documentation":
                try:
                    rd.move_documentation(id=reqdata["id"], newposition=reqdata["position"])
                except rdml.RdmlError as err:
                    data["error"] = str(err)
                else:
                    modified = True
            if reqdata["type"] == "dye":
                try:
                    rd.move_dye(id=reqdata["id"], newposition=reqdata["position"])
                except rdml.RdmlError as err:
                    data["error"] = str(err)
                else:
                    modified = True
            if reqdata["type"] == "sample":
                try:
                    rd.move_sample(id=reqdata["id"], newposition=reqdata["position"])
                except rdml.RdmlError as err:
                    data["error"] = str(err)
                else:
                    modified = True
            if reqdata["type"] == "target":
                try:
                    rd.move_target(id=reqdata["id"], newposition=reqdata["position"])
                except rdml.RdmlError as err:
                    data["error"] = str(err)
                else:
                    modified = True
            if reqdata["type"] == "cyclingConditions":
                try:
                    rd.move_cyclingConditions(id=reqdata["id"], newposition=reqdata["position"])
                except rdml.RdmlError as err:
                    data["error"] = str(err)
                else:
                    modified = True
            if reqdata["type"] == "experiment":
                try:
                    rd.move_experiment(id=reqdata["id"], newposition=reqdata["position"])
                except rdml.RdmlError as err:
                    data["error"] = str(err)
                else:
                    modified = True

        if modified is True:
            if uuidstr == "sample.rdml":
                uuidstr = str(uuid.uuid4())
                data["uuid"] = uuidstr
                # Get subfolder
                sf = os.path.join(app.config['UPLOAD_FOLDER'], uuidstr[0:2])
                if not os.path.exists(sf):
                    os.makedirs(sf)
                fexpname = os.path.join(sf, "rdml_" + uuidstr + ".rdml")
            rd.save(fexpname)

        data["filedata"] = rd.tojson()
        return jsonify(data=data)
    return jsonify(errors=[{"title": "Error in handling POST request!"}]), 400


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3300, debug=True, threaded=True)
