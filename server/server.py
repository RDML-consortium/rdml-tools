#! /usr/bin/env python

from __future__ import division
from __future__ import print_function

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
app.config['MAX_CONTENT_LENGTH'] = 64 * 1024 * 1024   # maximum of 64MB
app.config['MAX_NUMBER_UPLOAD_FILES'] = 120


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in set(['rdml', 'rdm', 'xml'])


def allowed_tab_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in set(['txt', 'tsv', 'csv', 'tab'])


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
            elif uuidstr == "sample.rdml":
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

        # Run RDML-Python
        rd = rdml.Rdml()
        ret = rd.validate(fexpname)
        return jsonify(data={"table": ret, "uuid": uuidstr})
    return jsonify(errors=[{"title": "Error in handling POST request!"}]), 400


@app.route('/api/v1/data', methods=['POST'])
def handle_data():
    if request.method == 'POST':
        sf = ""
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
        elif 'createFromTableShaper' in request.form.keys():
            if "experimentID" not in request.form.keys():
                return jsonify(errors=[{"title": "Invalid server request - experimentID missing!"}]), 400
            if "runID" not in request.form.keys():
                return jsonify(errors=[{"title": "Invalid server request - runID missing!"}]), 400
            if "pcrFormat_columns" not in request.form.keys():
                return jsonify(errors=[{"title": "Invalid server request - pcrFormat_columns missing!"}]), 400
            if "pcrFormat_columnLabel" not in request.form.keys():
                return jsonify(errors=[{"title": "Invalid server request - pcrFormat_columnLabel missing!"}]), 400
            if "pcrFormat_rows" not in request.form.keys():
                return jsonify(errors=[{"title": "Invalid server request - pcrFormat_rows missing!"}]), 400
            if "pcrFormat_rowLabel" not in request.form.keys():
                return jsonify(errors=[{"title": "Invalid server request - pcrFormat_rowLabel missing!"}]), 400
            if "tableData" not in request.form.keys():
                return jsonify(errors=[{"title": "Invalid server request - tableData missing!"}]), 400
            uuidstr = str(uuid.uuid4())
            data = {"uuid": uuidstr}
            # Get subfolder
            sf = os.path.join(app.config['UPLOAD_FOLDER'], uuidstr[0:2])
            if not os.path.exists(sf):
                os.makedirs(sf)
            fexpname = os.path.join(sf, "rdml_" + uuidstr + ".rdml")
            rd = rdml.Rdml()
            try:
                rd.new_experiment(id=request.form['experimentID'], newposition=0)
                elem = rd.get_experiment(byid=request.form['experimentID'])

                elem.new_run(id=request.form['runID'], newposition=0)
                run_ele = elem.get_run(byid=request.form['runID'])
                run_ele["pcrFormat_columns"] = request.form['pcrFormat_columns']
                run_ele["pcrFormat_columnLabel"] = request.form['pcrFormat_columnLabel']
                run_ele["pcrFormat_rows"] = request.form['pcrFormat_rows']
                run_ele["pcrFormat_rowLabel"] = request.form['pcrFormat_rowLabel']

                tabAmpFilename = os.path.join(sf, "rdml_" + uuidstr + "_amplification_upload.tsv")
                with open(tabAmpFilename, "w") as tabAmp:
                    tabAmp.write(request.form['tableData'])
                run_ele.import_table(rd, tabAmpFilename, "amp")

            except rdml.RdmlError as err:
                data["error"] = str(err)

            rd.save(fexpname)
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

        data = {"uuid": uuidstr, "rdml_lib_version": rdml.get_rdml_lib_version()}
        rd = rdml.Rdml(fexpname)
        if rd.version() == "1.0":
            rd.migrate_version_1_0_to_1_1()
            rd.save(fexpname)
            rd = rdml.Rdml(fexpname)
        modified = False

        if "validate" in reqdata and reqdata["validate"] is True:
            data["isvalid"] = rd.isvalid(fexpname)

        if "mode" in reqdata and reqdata["mode"] == "recreate-lost-ids":
            errRec = rd.recreate_lost_ids()
            if errRec:
                data["error"] = errRec
                modified = True

        if "mode" in reqdata and reqdata["mode"] == "repair-rdml-file":
            errRec = rd.repair_rdml_file()
            if errRec:
                data["error"] = errRec
                modified = True

        if "mode" in reqdata and reqdata["mode"] == "export-run":
            if "export-mode" not in reqdata:
                return jsonify(errors=[{"title": "Invalid server request - export-mode missing!"}]), 400
            if "experiment" not in reqdata:
                return jsonify(errors=[{"title": "Invalid server request - experiment information missing!"}]), 400
            if "run" not in reqdata:
                return jsonify(errors=[{"title": "Invalid server request - run information missing!"}]), 400

            try:
                elem = rd.get_experiment(byid=reqdata["experiment"])
                if elem is None:
                    return jsonify(errors=[{"title": "Invalid server request - experiment id not found!"}]), 400
                sElem = elem.get_run(byid=reqdata["run"])
                if sElem is None:
                    return jsonify(errors=[{"title": "Invalid server request - run id not found!"}]), 400
                data["exporttable"] = sElem.export_table(reqdata["export-mode"])
            except rdml.RdmlError as err:
                data["error"] = str(err)

        if "mode" in reqdata and reqdata["mode"] == "migrate-version":
            if "new-version" not in reqdata:
                return jsonify(errors=[{"title": "Invalid server request - new-version missing!"}]), 400
            migOldVersion = rd.version()
            try:
                modTxt = ""
                if reqdata["new-version"] == "1.1":
                    modTxt = rd.migrate_version_1_2_to_1_1()
                    modified = True
                if reqdata["new-version"] == "1.2":
                    if migOldVersion in ["1.0", "1.1"]:
                        modTxt = rd.migrate_version_1_1_to_1_2()
                        modified = True
                    if migOldVersion in ["1.3"]:
                        modTxt = rd.migrate_version_1_3_to_1_2()
                        modified = True
                if reqdata["new-version"] == "1.3":
                    modTxt = rd.migrate_version_1_2_to_1_3()
                    modified = True
                if modTxt != "":
                    ret = ""
                    for colText in modTxt:
                        ret += colText + "\n"
                        data["error"] = ret
            except rdml.RdmlError as err:
                data["error"] = str(err)

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
            if reqdata["type"] == "therm_cyc_cons":
                rd.delete_therm_cyc_cons(byposition=reqdata["position"])
                modified = True
            if reqdata["type"] == "experiment":
                rd.delete_experiment(byposition=reqdata["position"])
                modified = True

        if "mode" in reqdata and reqdata["mode"] in ["deleteSecIds"]:
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
            try:
                if reqdata["primary-key"] == "sample":
                    elem = rd.get_sample(byposition=reqdata["primary-position"])
                    if elem is None:
                        return jsonify(errors=[{"title": "Invalid server request - sample primary-position not found!"}]), 400
                    if reqdata["id-source"] == "type":
                        elem.delete_type(byposition=int(reqdata["old-position"]))
                    if reqdata["id-source"] == "xRef":
                        elem.delete_xref(byposition=int(reqdata["old-position"]))
                    if reqdata["id-source"] == "annotation":
                        elem.delete_annotation(byposition=int(reqdata["old-position"]))
                if reqdata["primary-key"] == "target":
                    elem = rd.get_target(byposition=reqdata["primary-position"])
                    if elem is None:
                        return jsonify(errors=[{"title": "Invalid server request - target primary-position not found!"}]), 400
                    if reqdata["id-source"] == "xRef":
                        elem.delete_xref(byposition=int(reqdata["old-position"]))
                if reqdata["primary-key"] == "experiment":
                    elem = rd.get_experiment(byposition=reqdata["primary-position"])
                    if elem is None:
                        return jsonify(errors=[{"title": "Invalid server request - experiment primary-position not found!"}]), 400
                    if reqdata["id-source"] == "run":
                        elem.delete_run(byposition=int(reqdata["old-position"]))
            except rdml.RdmlError as err:
                data["error"] = str(err)
            else:
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
            if reqdata["primary-key"] == "target":
                elem = rd.get_target(byposition=reqdata["primary-position"])
                if elem is None:
                    return jsonify(errors=[{"title": "Invalid server request - target at position not found!"}]), 400
            if reqdata["primary-key"] == "therm_cyc_cons":
                elem = rd.get_therm_cyc_cons(byposition=reqdata["primary-position"])
                if elem is None:
                    return jsonify(errors=[{"title": "Invalid server request - thermal cycling conditions at position not found!"}]), 400
            if reqdata["primary-key"] == "experiment":
                elem = rd.get_experiment(byposition=reqdata["primary-position"])
                if elem is None:
                    return jsonify(errors=[{"title": "Invalid server request - experiment at position not found!"}]), 400
                if reqdata["secondary-key"] == "run":
                    elem = elem.get_run(byposition=reqdata["secondary-position"])
                    if elem is None:
                        return jsonify(errors=[{"title": "Invalid server request - run at position not found!"}]), 400
            if reqdata["id-source"] == "documentation":
                modified = elem.update_documentation_ids(reqdata["data"])
            if reqdata["id-source"] == "experimenter":
                modified = elem.update_experimenter_ids(reqdata["data"])

        if "mode" in reqdata and reqdata["mode"] in ["create-sampleType", "edit-sampleType"]:
            if "sampleType-position" not in reqdata:
                return jsonify(errors=[{"title": "Invalid server request - sampleType-position missing!"}]), 400
            if "new-position" not in reqdata:
                return jsonify(errors=[{"title": "Invalid server request - new-position missing!"}]), 400
            if "data" not in reqdata:
                return jsonify(errors=[{"title": "Invalid server request - data missing!"}]), 400
            elem = rd.get_sample(byposition=reqdata["primary-position"])
            if elem is None:
                return jsonify(errors=[{"title": "Invalid server request - sample at position not found!"}]), 400

            if reqdata["mode"] == "create-sampleType":
                try:
                    elem.new_type(type=reqdata["data"]["sampType"],
                                  targetId=reqdata["data"]["sampTypeTarget"],
                                  newposition=reqdata["new-position"])
                except rdml.RdmlError as err:
                    data["error"] = str(err)
                else:
                    modified = True
            if reqdata["mode"] == "edit-sampleType":
                try:
                    elem.edit_type(type=reqdata["data"]["sampType"],
                                   oldposition=reqdata["sampleType-position"],
                                   newposition=reqdata["new-position"],
                                   targetId=reqdata["data"]["sampTypeTarget"])
                except rdml.RdmlError as err:
                    data["error"] = str(err)
                else:
                    modified = True

        if "mode" in reqdata and reqdata["mode"] in ["create-xref", "edit-xref"]:
            if "primary-key" not in reqdata or "primary-position" not in reqdata:
                return jsonify(errors=[{"title": "Invalid server request - primary-key or primary-position missing!"}]), 400
            if "xref-position" not in reqdata:
                return jsonify(errors=[{"title": "Invalid server request - xref-position missing!"}]), 400
            if "new-position" not in reqdata:
                return jsonify(errors=[{"title": "Invalid server request - new-position missing!"}]), 400
            if "data" not in reqdata:
                return jsonify(errors=[{"title": "Invalid server request - data missing!"}]), 400
            elem = None
            if reqdata["primary-key"] == "sample":
                elem = rd.get_sample(byposition=reqdata["primary-position"])
                if elem is None:
                    return jsonify(errors=[{"title": "Invalid server request - sample at position not found!"}]), 400
            if reqdata["primary-key"] == "target":
                elem = rd.get_target(byposition=reqdata["primary-position"])
                if elem is None:
                    return jsonify(errors=[{"title": "Invalid server request - target at position not found!"}]), 400

            if reqdata["mode"] == "create-xref":
                try:
                    elem.new_xref(name=reqdata["data"]["name"],
                                  id=reqdata["data"]["id"],
                                  newposition=reqdata["new-position"])
                except rdml.RdmlError as err:
                    data["error"] = str(err)
                else:
                    modified = True
            if reqdata["mode"] == "edit-xref":
                try:
                    elem.edit_xref(oldposition=reqdata["xref-position"],
                                   newposition=reqdata["new-position"],
                                   name=reqdata["data"]["name"],
                                   id=reqdata["data"]["id"])
                except rdml.RdmlError as err:
                    data["error"] = str(err)
                else:
                    modified = True

        if "mode" in reqdata and reqdata["mode"] in ["create-annotation", "edit-annotation"]:
            if "primary-key" not in reqdata or "primary-position" not in reqdata:
                return jsonify(errors=[{"title": "Invalid server request - primary-key or primary-position missing!"}]), 400
            if "annotation-position" not in reqdata:
                return jsonify(errors=[{"title": "Invalid server request - annotation-position missing!"}]), 400
            if "new-position" not in reqdata:
                return jsonify(errors=[{"title": "Invalid server request - new-position missing!"}]), 400
            if "data" not in reqdata:
                return jsonify(errors=[{"title": "Invalid server request - data missing!"}]), 400
            elem = None
            if reqdata["primary-key"] == "sample":
                elem = rd.get_sample(byposition=reqdata["primary-position"])
                if elem is None:
                    return jsonify(errors=[{"title": "Invalid server request - sample at position not found!"}]), 400
            if reqdata["mode"] == "create-annotation":
                try:
                    elem.new_annotation(property=reqdata["data"]["property"],
                                        value=reqdata["data"]["value"],
                                        newposition=reqdata["new-position"])
                except rdml.RdmlError as err:
                    data["error"] = str(err)
                else:
                    modified = True
            if reqdata["mode"] == "edit-annotation":
                try:
                    elem.edit_annotation(oldposition=reqdata["annotation-position"],
                                         newposition=reqdata["new-position"],
                                         property=reqdata["data"]["property"],
                                         value=reqdata["data"]["value"])
                except rdml.RdmlError as err:
                    data["error"] = str(err)
                else:
                    modified = True

        if "mode" in reqdata and reqdata["mode"] in ["create-run", "edit-run"]:
            errRec = ""
            if "primary-position" not in reqdata:
                return jsonify(errors=[{"title": "Invalid server request - run primary-position missing!"}]), 400
            if "run-position" not in reqdata:
                return jsonify(errors=[{"title": "Invalid server request - run run-position missing!"}]), 400
            if "new-position" not in reqdata:
                return jsonify(errors=[{"title": "Invalid server request - run new-position missing!"}]), 400
            if "data" not in reqdata:
                return jsonify(errors=[{"title": "Invalid server request - run data missing!"}]), 400
            if "id" not in reqdata["data"]:
                return jsonify(errors=[{"title": "Invalid server request - run id missing!"}]), 400
            if "description" not in reqdata["data"]:
                return jsonify(errors=[{"title": "Invalid server request - run description missing!"}]), 400
            if "runDate" not in reqdata["data"]:
                return jsonify(errors=[{"title": "Invalid server request - run runDate missing!"}]), 400
            if "thermalCyclingConditions" not in reqdata["data"]:
                return jsonify(errors=[{"title": "Invalid server request - run thermalCyclingConditions missing!"}]), 400
            if "cqDetectionMethod" not in reqdata["data"]:
                return jsonify(errors=[{"title": "Invalid server request - run cqDetectionMethod missing!"}]), 400
            if "backgroundDeterminationMethod" not in reqdata["data"]:
                return jsonify(errors=[{"title": "Invalid server request - run backgroundDeterminationMethod missing!"}]), 400
            if "pcrFormat_columns" not in reqdata["data"]:
                return jsonify(errors=[{"title": "Invalid server request - run pcrFormat_columns missing!"}]), 400
            if "pcrFormat_columnLabel" not in reqdata["data"]:
                return jsonify(errors=[{"title": "Invalid server request - run pcrFormat_columnLabel missing!"}]), 400
            if "pcrFormat_rows" not in reqdata["data"]:
                return jsonify(errors=[{"title": "Invalid server request - run pcrFormat_rows missing!"}]), 400
            if "pcrFormat_rowLabel" not in reqdata["data"]:
                return jsonify(errors=[{"title": "Invalid server request - run pcrFormat_rowLabel missing!"}]), 400
            if reqdata["data"]["pcrFormat_columns"] == "":
                return jsonify(errors=[{"title": "Invalid server request - run pcrFormat_columns value missing!"}]), 400
            if reqdata["data"]["pcrFormat_columnLabel"] == "":
                return jsonify(errors=[{"title": "Invalid server request - run pcrFormat_columnLabel value missing!"}]), 400
            if reqdata["data"]["pcrFormat_rows"] == "":
                return jsonify(errors=[{"title": "Invalid server request - run pcrFormat_rows value missing!"}]), 400
            if reqdata["data"]["pcrFormat_rowLabel"] == "":
                return jsonify(errors=[{"title": "Invalid server request - run pcrFormat_rowLabel value missing!"}]), 400
            if "instrument" not in reqdata["data"]:
                return jsonify(errors=[{"title": "Invalid server request - run instrument missing!"}]), 400
            if "dataCollectionSoftware_name" not in reqdata["data"]:
                return jsonify(errors=[{"title": "Invalid server request - run dataCollectionSoftware_name missing!"}]), 400
            if "dataCollectionSoftware_version" not in reqdata["data"]:
                return jsonify(errors=[{"title": "Invalid server request - run dataCollectionSoftware_version missing!"}]), 400
            elem = rd.get_experiment(byposition=reqdata["primary-position"])
            if elem is None:
                return jsonify(errors=[{"title": "Invalid server request - experiment at position not found!"}]), 400
            try:
                run_ele = None
                if reqdata["mode"] == "create-run":
                    elem.new_run(id=reqdata["data"]["id"], newposition=int(reqdata["new-position"]))
                    run_ele = elem.get_run(byid=reqdata["data"]["id"])
                if reqdata["mode"] == "edit-run":
                    run_ele = elem.get_run(byposition=int(reqdata["run-position"]))
                    run_ele["id"] = reqdata["data"]["id"]
                    elem.move_run(reqdata["data"]["id"], int(reqdata["new-position"]))
                run_ele["description"] = reqdata["data"]["description"]
                run_ele["runDate"] = reqdata["data"]["runDate"]
                run_ele["thermalCyclingConditions"] = reqdata["data"]["thermalCyclingConditions"]
                run_ele["cqDetectionMethod"] = reqdata["data"]["cqDetectionMethod"]
                run_ele["backgroundDeterminationMethod"] = reqdata["data"]["backgroundDeterminationMethod"]
                run_ele["pcrFormat_columns"] = reqdata["data"]["pcrFormat_columns"]
                run_ele["pcrFormat_columnLabel"] = reqdata["data"]["pcrFormat_columnLabel"]
                run_ele["pcrFormat_rows"] = reqdata["data"]["pcrFormat_rows"]
                run_ele["pcrFormat_rowLabel"] = reqdata["data"]["pcrFormat_rowLabel"]
                run_ele["instrument"] = reqdata["data"]["instrument"]
                run_ele["dataCollectionSoftware_name"] = reqdata["data"]["dataCollectionSoftware_name"]
                run_ele["dataCollectionSoftware_version"] = reqdata["data"]["dataCollectionSoftware_version"]
                errRec = ""
                if "tableUploadAmplification" in request.files:
                    tabAmpUpload = request.files['tableUploadAmplification']
                    modified = True
                    if uuidstr == "sample.rdml":
                        uuidstr = str(uuid.uuid4())
                        data["uuid"] = uuidstr
                        # Get subfolder
                        sf = os.path.join(app.config['UPLOAD_FOLDER'], uuidstr[0:2])
                        if not os.path.exists(sf):
                            os.makedirs(sf)
                        fexpname = os.path.join(sf, "rdml_" + uuidstr + ".rdml")
                    if tabAmpUpload.filename != '':
                        if not allowed_tab_file(tabAmpUpload.filename):
                            return jsonify(errors=[{"title": "Tab amplification file has incorrect file type!"}]), 400
                        tabAmpFilename = os.path.join(sf, "rdml_" + uuidstr + "_amplification_upload.tsv")
                        tabAmpUpload.save(tabAmpFilename)
                        errRec += run_ele.import_table(rd, tabAmpFilename, "amp")
                if "tableUploadMelting" in request.files:
                    tabMeltUpload = request.files['tableUploadMelting']
                    modified = True
                    if uuidstr == "sample.rdml":
                        uuidstr = str(uuid.uuid4())
                        data["uuid"] = uuidstr
                        # Get subfolder
                        sf = os.path.join(app.config['UPLOAD_FOLDER'], uuidstr[0:2])
                        if not os.path.exists(sf):
                            os.makedirs(sf)
                        fexpname = os.path.join(sf, "rdml_" + uuidstr + ".rdml")
                    if tabMeltUpload.filename != '':
                        if not allowed_tab_file(tabMeltUpload.filename):
                            return jsonify(errors=[{"title": "Tab meltcurve file has incorrect file type!"}]), 400
                        tabMeltFilename = os.path.join(sf, "rdml_" + uuidstr + "_melting_upload.tsv")
                        tabMeltUpload.save(tabMeltFilename)
                        errRec += run_ele.import_table(rd, tabMeltFilename, "melt")
                if "tableUploadDigOverview" in request.files or "tableUploadDigWellsCount" in request.form.keys():
                    if "tableUploadDigFormat" not in reqdata["data"]:
                        return jsonify(errors=[{"title": "Invalid server request - run tableUploadDigFormat missing!"}]), 400
                    modified = True
                    tabDigOverviewFilename = None
                    wellFileNames = []
                    if uuidstr == "sample.rdml":
                        uuidstr = str(uuid.uuid4())
                        data["uuid"] = uuidstr
                        # Get subfolder
                        sf = os.path.join(app.config['UPLOAD_FOLDER'], uuidstr[0:2])
                        if not os.path.exists(sf):
                            os.makedirs(sf)
                        fexpname = os.path.join(sf, "rdml_" + uuidstr + ".rdml")

                    if "tableUploadDigOverview" in request.files:
                        tabDigOverviewUpload = request.files['tableUploadDigOverview']
                        if tabDigOverviewUpload.filename != '':
                            if not allowed_tab_file(tabDigOverviewUpload.filename):
                                return jsonify(errors=[{"title": "Tab digital overview file has incorrect file type!"}]), 400
                            tabDigOverviewFilename = os.path.join(sf, "rdml_" + uuidstr + "_dig_upload_overview.tsv")
                            tabDigOverviewUpload.save(tabDigOverviewFilename)

                    if "tableUploadDigWellsCount" in request.form.keys():
                        digWellCount = int(request.form["tableUploadDigWellsCount"])
                        if digWellCount < 0:
                            digWellCount = 0
                        if digWellCount > app.config['MAX_NUMBER_UPLOAD_FILES']:
                            digWellCount = app.config['MAX_NUMBER_UPLOAD_FILES']
                        for i in range(0, digWellCount):
                            if 'tableUploadDigWell_' + str(i) not in request.files:
                                return jsonify(errors=[{"title": "Digital well file " + str(i) + " is missing!"}]), 400
                            wellFile = request.files['tableUploadDigWell_' + str(i)]
                            if wellFile.filename == '':
                                return jsonify(
                                    errors=[{"title": "Digital well file " + str(i) + " filename is missing!"}]), 400
                            if not allowed_tab_file(wellFile.filename):
                                return jsonify(errors=[{"title": "Digital well file \"" + wellFile.filename + "\" has incorrect file type!"}]), 400
                            improvedFilename = re.sub(r" \(\d+\)", "", wellFile.filename)
                            wellFileName = os.path.join(sf, "rdml_" + uuidstr + "_" + secure_filename(improvedFilename))
                            wellFile.save(wellFileName)
                            wellFileNames.append(wellFileName)

                    errRec += run_ele.import_digital_data(rd,
                                                          reqdata["data"]["tableUploadDigFormat"],
                                                          tabDigOverviewFilename,
                                                          wellFileNames)
                if errRec:
                    data["error"] = errRec
            except rdml.RdmlError as err:
                data["error"] = errRec + str(err)
            else:
                modified = True

        if "mode" in reqdata and reqdata["mode"] in ["create-step", "edit-step"]:
            if "primary-position" not in reqdata:
                return jsonify(errors=[{"title": "Invalid server request - step primary-position missing!"}]), 400
            if "step-position" not in reqdata:
                return jsonify(errors=[{"title": "Invalid server request - step step-position missing!"}]), 400
            if "new-position" not in reqdata:
                return jsonify(errors=[{"title": "Invalid server request - step new-position missing!"}]), 400
            if "type" not in reqdata:
                return jsonify(errors=[{"title": "Invalid server request - step type missing!"}]), 400
            if "data" not in reqdata:
                return jsonify(errors=[{"title": "Invalid server request - step data missing!"}]), 400
            elem = rd.get_therm_cyc_cons(byposition=reqdata["primary-position"])
            if elem is None:
                return jsonify(errors=[{"title": "Invalid server request - thermal cycling conditions at position not found!"}]), 400
            try:
                if reqdata["type"] == "temperature":
                    if "temperature" not in reqdata["data"]:
                        return jsonify(errors=[{"title": "Invalid server request - step temperature missing!"}]), 400
                    if "duration" not in reqdata["data"]:
                        return jsonify(errors=[{"title": "Invalid server request - step duration missing!"}]), 400
                    if "temperatureChange" not in reqdata["data"]:
                        return jsonify(errors=[{"title": "Invalid server request - step temperatureChange missing!"}]), 400
                    if "durationChange" not in reqdata["data"]:
                        return jsonify(errors=[{"title": "Invalid server request - step durationChange missing!"}]), 400
                    if "measure" not in reqdata["data"]:
                        return jsonify(errors=[{"title": "Invalid server request - step measure missing!"}]), 400
                    if "ramp" not in reqdata["data"]:
                        return jsonify(errors=[{"title": "Invalid server request - step ramp missing!"}]), 400
                    if reqdata["mode"] == "create-step":
                        elem.new_step_temperature(temperature=reqdata["data"]["temperature"],
                                                  duration=reqdata["data"]["duration"],
                                                  temperatureChange=reqdata["data"]["temperatureChange"],
                                                  durationChange=reqdata["data"]["durationChange"],
                                                  measure=reqdata["data"]["measure"],
                                                  ramp=reqdata["data"]["ramp"],
                                                  nr=reqdata["new-position"])
                    if reqdata["mode"] == "edit-step":
                        run_ele = elem.get_step(bystep=int(reqdata["step-position"]))
                        run_ele["temperature"] = reqdata["data"]["temperature"]
                        run_ele["duration"] = reqdata["data"]["duration"]
                        run_ele["temperatureChange"] = reqdata["data"]["temperatureChange"]
                        run_ele["durationChange"] = reqdata["data"]["durationChange"]
                        run_ele["measure"] = reqdata["data"]["measure"]
                        run_ele["ramp"] = reqdata["data"]["ramp"]
                        if int(reqdata["step-position"]) != int(reqdata["new-position"]):
                            if int(reqdata["step-position"]) < int(reqdata["new-position"]):
                                elem.move_step(int(reqdata["step-position"]), int(reqdata["new-position"]) + 1)
                            else:
                                elem.move_step(int(reqdata["step-position"]), int(reqdata["new-position"]))
                if reqdata["type"] == "gradient":
                    if "highTemperature" not in reqdata["data"]:
                        return jsonify(errors=[{"title": "Invalid server request - step highTemperature missing!"}]), 400
                    if "lowTemperature" not in reqdata["data"]:
                        return jsonify(errors=[{"title": "Invalid server request - step lowTemperature missing!"}]), 400
                    if "duration" not in reqdata["data"]:
                        return jsonify(errors=[{"title": "Invalid server request - step duration missing!"}]), 400
                    if "temperatureChange" not in reqdata["data"]:
                        return jsonify(errors=[{"title": "Invalid server request - step temperatureChange missing!"}]), 400
                    if "durationChange" not in reqdata["data"]:
                        return jsonify(errors=[{"title": "Invalid server request - step durationChange missing!"}]), 400
                    if "measure" not in reqdata["data"]:
                        return jsonify(errors=[{"title": "Invalid server request - step measure missing!"}]), 400
                    if "ramp" not in reqdata["data"]:
                        return jsonify(errors=[{"title": "Invalid server request - step ramp missing!"}]), 400
                    if reqdata["mode"] == "create-step":
                        elem.new_step_gradient(highTemperature=reqdata["data"]["highTemperature"],
                                               lowTemperature=reqdata["data"]["lowTemperature"],
                                               duration=reqdata["data"]["duration"],
                                               temperatureChange=reqdata["data"]["temperatureChange"],
                                               durationChange=reqdata["data"]["durationChange"],
                                               measure=reqdata["data"]["measure"],
                                               ramp=reqdata["data"]["ramp"],
                                               nr=reqdata["new-position"])
                    if reqdata["mode"] == "edit-step":
                        run_ele = elem.get_step(bystep=int(reqdata["step-position"]))
                        run_ele["highTemperature"] = reqdata["data"]["highTemperature"]
                        run_ele["lowTemperature"] = reqdata["data"]["lowTemperature"]
                        run_ele["duration"] = reqdata["data"]["duration"]
                        run_ele["temperatureChange"] = reqdata["data"]["temperatureChange"]
                        run_ele["durationChange"] = reqdata["data"]["durationChange"]
                        run_ele["measure"] = reqdata["data"]["measure"]
                        run_ele["ramp"] = reqdata["data"]["ramp"]
                        if int(reqdata["step-position"]) != int(reqdata["new-position"]):
                            if int(reqdata["step-position"]) < int(reqdata["new-position"]):
                                elem.move_step(int(reqdata["step-position"]), int(reqdata["new-position"]) + 1)
                            else:
                                elem.move_step(int(reqdata["step-position"]), int(reqdata["new-position"]))
                if reqdata["type"] == "loop":
                    if "goto" not in reqdata["data"]:
                        return jsonify(errors=[{"title": "Invalid server request - step goto missing!"}]), 400
                    if "repeat" not in reqdata["data"]:
                        return jsonify(errors=[{"title": "Invalid server request - step repeat missing!"}]), 400
                    if reqdata["mode"] == "create-step":
                        elem.new_step_loop(goto=reqdata["data"]["goto"],
                                           repeat=reqdata["data"]["repeat"],
                                           nr=reqdata["new-position"])
                    if reqdata["mode"] == "edit-step":
                        run_ele = elem.get_step(bystep=int(reqdata["step-position"]))
                        run_ele["goto"] = reqdata["data"]["goto"]
                        run_ele["repeat"] = reqdata["data"]["repeat"]
                        if int(reqdata["step-position"]) != int(reqdata["new-position"]):
                            if int(reqdata["step-position"]) < int(reqdata["new-position"]):
                                elem.move_step(int(reqdata["step-position"]), int(reqdata["new-position"]) + 1)
                            else:
                                elem.move_step(int(reqdata["step-position"]), int(reqdata["new-position"]))
                if reqdata["type"] == "pause":
                    if "temperature" not in reqdata["data"]:
                        return jsonify(errors=[{"title": "Invalid server request - step temperature missing!"}]), 400
                    if reqdata["mode"] == "create-step":
                        elem.new_step_pause(temperature=reqdata["data"]["temperature"],
                                            nr=reqdata["new-position"])
                    if reqdata["mode"] == "edit-step":
                        run_ele = elem.get_step(bystep=int(reqdata["step-position"]))
                        run_ele["temperature"] = reqdata["data"]["temperature"]
                        if int(reqdata["step-position"]) != int(reqdata["new-position"]):
                            if int(reqdata["step-position"]) < int(reqdata["new-position"]):
                                elem.move_step(int(reqdata["step-position"]), int(reqdata["new-position"]) + 1)
                            else:
                                elem.move_step(int(reqdata["step-position"]), int(reqdata["new-position"]))
                if reqdata["type"] == "lidOpen":
                    if reqdata["mode"] == "create-step":
                        elem.new_step_lidOpen(nr=reqdata["new-position"])
                    if reqdata["mode"] == "edit-step":
                        # run_ele = elem.get_step(bystep=int(reqdata["step-position"]))
                        if int(reqdata["step-position"]) != int(reqdata["new-position"]):
                            if int(reqdata["step-position"]) < int(reqdata["new-position"]):
                                elem.move_step(int(reqdata["step-position"]), int(reqdata["new-position"]) + 1)
                            else:
                                elem.move_step(int(reqdata["step-position"]), int(reqdata["new-position"]))
            except rdml.RdmlError as err:
                data["error"] = str(err)
            else:
                modified = True

        if "mode" in reqdata and reqdata["mode"] in ["delete-step"]:
            if "primary-position" not in reqdata:
                return jsonify(errors=[{"title": "Invalid server request - step primary-position missing!"}]), 400
            if "step-position" not in reqdata:
                return jsonify(errors=[{"title": "Invalid server request - step step-position missing!"}]), 400
            elem = rd.get_therm_cyc_cons(byposition=reqdata["primary-position"])
            if elem is None:
                return jsonify(errors=[{"title": "Invalid server request - thermal cycling conditions at position not found!"}]), 400
            try:
                elem.delete_step(bystep=int(reqdata["step-position"]))
            except rdml.RdmlError as err:
                data["error"] = str(err)
            else:
                modified = True

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
                if "idUnique" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - experimenter idUnique missing!"}]), 400
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
                        elem.change_id(reqdata["data"]["id"], merge_with_id=reqdata["data"]["idUnique"])
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
                if "idUnique" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - documentation idUnique missing!"}]), 400
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
                        elem.change_id(reqdata["data"]["id"], merge_with_id=reqdata["data"]["idUnique"])
                        elem["text"] = reqdata["data"]["text"]
                    except rdml.RdmlError as err:
                        data["error"] = str(err)
                    else:
                        modified = True

            if reqdata["type"] == "dye":
                if "id" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - dye id missing!"}]), 400
                if "idUnique" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - dye idUnique missing!"}]), 400
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
                        elem.change_id(reqdata["data"]["id"], merge_with_id=reqdata["data"]["idUnique"])
                        elem["description"] = reqdata["data"]["description"]
                        if "dyeChemistry" in reqdata["data"]:
                            elem["dyeChemistry"] = reqdata["data"]["dyeChemistry"]
                    except rdml.RdmlError as err:
                        data["error"] = str(err)
                    else:
                        modified = True

            if reqdata["type"] == "sample":
                if "id" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - sample id missing!"}]), 400
                if "idUnique" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - sample idUnique missing!"}]), 400
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
                if "version" not in reqdata:
                    return jsonify(errors=[{"title": "Invalid server request - version information missing!"}]), 400
                if reqdata["version"] == "1.1":
                    if "templateRNAQuantity" not in reqdata["data"]:
                        return jsonify(errors=[{"title": "Invalid server request - sample templateRNAQuantity missing!"}]), 400
                    if "templateRNAQuality" not in reqdata["data"]:
                        return jsonify(errors=[{"title": "Invalid server request - sample templateRNAQuality missing!"}]), 400
                    if "templateDNAQuantity" not in reqdata["data"]:
                        return jsonify(errors=[{"title": "Invalid server request - sample templateDNAQuantity missing!"}]), 400
                    if "templateDNAQuality" not in reqdata["data"]:
                        return jsonify(errors=[{"title": "Invalid server request - sample templateDNAQuality missing!"}]), 400
                if reqdata["version"] != "1.1":
                    if "templateQuantity" not in reqdata["data"]:
                        return jsonify(errors=[{"title": "Invalid server request - sample templateQuantity missing!"}]), 400
                if "current-position" not in reqdata or "new-position" not in reqdata:
                    return jsonify(errors=[{"title": "Invalid server request - position information missing!"}]), 400
                if reqdata["mode"] in ["create", "edit"]:
                    if reqdata["mode"] == "edit" and "old-id" not in reqdata:
                        return jsonify(errors=[{"title": "Invalid server request - sample old id information missing!"}]), 400
                    try:
                        elem = None
                        if reqdata["mode"] == "create":
                            if "typeTargetId" in reqdata["data"]:
                                rd.new_sample(id=reqdata["data"]["id"],
                                              type=reqdata["data"]["type"],
                                              targetId=reqdata["data"]["typeTargetId"],
                                              newposition=int(reqdata["new-position"]))
                            else:
                                rd.new_sample(id=reqdata["data"]["id"],
                                              type=reqdata["data"]["type"],
                                              newposition=int(reqdata["new-position"]))
                            elem = rd.get_sample(byid=reqdata["data"]["id"])
                        if reqdata["mode"] == "edit":
                            elem = rd.get_sample(byid=reqdata["old-id"])
                            if elem is None:
                                return jsonify(errors=[{"title": "Invalid server request - sample id not found!"}]), 400
                            elem.change_id(reqdata["data"]["id"], merge_with_id=reqdata["data"]["idUnique"])
                            if "typeTargetId" in reqdata["data"]:
                                elem.edit_type(reqdata["data"]["type"], 0, 0, reqdata["data"]["typeTargetId"])
                            else:
                                elem.edit_type(reqdata["data"]["type"], 0, 0)
                        elem["description"] = reqdata["data"]["description"]
                        elem["interRunCalibrator"] = reqdata["data"]["interRunCalibrator"]
                        elem["quantity"] = reqdata["data"]["quantity"]
                        elem["calibratorSample"] = reqdata["data"]["calibratorSample"]
                        elem["cdnaSynthesisMethod_enzyme"] = reqdata["data"]["cdnaSynthesisMethod_enzyme"]
                        elem["cdnaSynthesisMethod_primingMethod"] = reqdata["data"]["cdnaSynthesisMethod_primingMethod"]
                        elem["cdnaSynthesisMethod_dnaseTreatment"] = reqdata["data"]["cdnaSynthesisMethod_dnaseTreatment"]
                        elem["cdnaSynthesisMethod_thermalCyclingConditions"] = reqdata["data"]["cdnaSynthesisMethod_thermalCyclingConditions"]
                        if reqdata["version"] == "1.1":
                            elem["templateRNAQuantity"] = reqdata["data"]["templateRNAQuantity"]
                            elem["templateRNAQuality"] = reqdata["data"]["templateRNAQuality"]
                            elem["templateDNAQuantity"] = reqdata["data"]["templateDNAQuantity"]
                            elem["templateDNAQuality"] = reqdata["data"]["templateDNAQuality"]
                        if reqdata["version"] != "1.1":
                            elem["templateQuantity"] = reqdata["data"]["templateQuantity"]
                    except rdml.RdmlError as err:
                        data["error"] = str(err)
                    else:
                        modified = True

            if reqdata["type"] == "target":
                if "id" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - target id missing!"}]), 400
                if "idUnique" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - target idUnique missing!"}]), 400
                if "type" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - target type missing!"}]), 400
                if "description" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - target description missing!"}]), 400
                if "amplificationEfficiencyMethod" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - target amplificationEfficiencyMethod missing!"}]), 400
                if "amplificationEfficiency" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - target amplificationEfficiency missing!"}]), 400
                if "detectionLimit" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - target detectionLimit missing!"}]), 400
                if "dyeId" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - target dyeId missing!"}]), 400
                if "sequences_forwardPrimer_threePrimeTag" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - target sequences_forwardPrimer_threePrimeTag missing!"}]), 400
                if "sequences_forwardPrimer_fivePrimeTag" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - target sequences_forwardPrimer_fivePrimeTag missing!"}]), 400
                if "sequences_forwardPrimer_sequence" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - target sequences_forwardPrimer_sequence missing!"}]), 400
                if "sequences_reversePrimer_threePrimeTag" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - target sequences_reversePrimer_threePrimeTag missing!"}]), 400
                if "sequences_reversePrimer_fivePrimeTag" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - target sequences_reversePrimer_fivePrimeTag missing!"}]), 400
                if "sequences_reversePrimer_sequence" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - target sequences_reversePrimer_sequence missing!"}]), 400
                if "sequences_probe1_threePrimeTag" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - target sequences_probe1_threePrimeTag missing!"}]), 400
                if "sequences_probe1_fivePrimeTag" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - target sequences_probe1_fivePrimeTag missing!"}]), 400
                if "sequences_probe1_sequence" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - target sequences_probe1_sequence missing!"}]), 400
                if "sequences_probe2_threePrimeTag" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - target sequences_probe2_threePrimeTag missing!"}]), 400
                if "sequences_probe2_fivePrimeTag" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - target sequences_probe2_fivePrimeTag missing!"}]), 400
                if "sequences_probe2_sequence" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - target sequences_probe2_sequence missing!"}]), 400
                if "sequences_amplicon_threePrimeTag" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - target sequences_amplicon_threePrimeTag missing!"}]), 400
                if "sequences_amplicon_fivePrimeTag" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - target sequences_amplicon_fivePrimeTag missing!"}]), 400
                if "sequences_amplicon_sequence" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - target sequences_amplicon_sequence missing!"}]), 400
                if "commercialAssay_company" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - target commercialAssay_company missing!"}]), 400
                if "commercialAssay_orderNumber" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - target commercialAssay_orderNumber missing!"}]), 400
                if "current-position" not in reqdata or "new-position" not in reqdata:
                    return jsonify(errors=[{"title": "Invalid server request - position information missing!"}]), 400
                if "version" not in reqdata:
                    return jsonify(errors=[{"title": "Invalid server request - version information missing!"}]), 400
                if reqdata["mode"] in ["create", "edit"]:
                    if reqdata["mode"] == "edit" and "old-id" not in reqdata:
                        return jsonify(
                            errors=[{"title": "Invalid server request - target old id information missing!"}]), 400
                    try:
                        elem = None
                        if reqdata["mode"] == "create":
                            rd.new_target(id=reqdata["data"]["id"],
                                          type=reqdata["data"]["type"],
                                          newposition=int(reqdata["new-position"]))
                            elem = rd.get_target(byid=reqdata["data"]["id"])
                        if reqdata["mode"] == "edit":
                            elem = rd.get_target(byid=reqdata["old-id"])
                            if elem is None:
                                return jsonify(errors=[{"title": "Invalid server request - target id not found!"}]), 400
                            elem.change_id(reqdata["data"]["id"], merge_with_id=reqdata["data"]["idUnique"])
                            elem["type"] = reqdata["data"]["type"]
                        elem["description"] = reqdata["data"]["description"]
                        elem["amplificationEfficiencyMethod"] = reqdata["data"]["amplificationEfficiencyMethod"]
                        elem["amplificationEfficiency"] = reqdata["data"]["amplificationEfficiency"]
                        elem["detectionLimit"] = reqdata["data"]["detectionLimit"]
                        elem["dyeId"] = reqdata["data"]["dyeId"]
                        elem["sequences_forwardPrimer_fivePrimeTag"] = reqdata["data"]["sequences_forwardPrimer_fivePrimeTag"]
                        elem["sequences_forwardPrimer_sequence"] = reqdata["data"]["sequences_forwardPrimer_sequence"]
                        elem["sequences_forwardPrimer_threePrimeTag"] = reqdata["data"]["sequences_forwardPrimer_threePrimeTag"]
                        elem["sequences_reversePrimer_fivePrimeTag"] = reqdata["data"]["sequences_reversePrimer_fivePrimeTag"]
                        elem["sequences_reversePrimer_sequence"] = reqdata["data"]["sequences_reversePrimer_sequence"]
                        elem["sequences_reversePrimer_threePrimeTag"] = reqdata["data"]["sequences_reversePrimer_threePrimeTag"]
                        elem["sequences_probe1_fivePrimeTag"] = reqdata["data"]["sequences_probe1_fivePrimeTag"]
                        elem["sequences_probe1_sequence"] = reqdata["data"]["sequences_probe1_sequence"]
                        elem["sequences_probe1_threePrimeTag"] = reqdata["data"]["sequences_probe1_threePrimeTag"]
                        elem["sequences_probe2_fivePrimeTag"] = reqdata["data"]["sequences_probe2_fivePrimeTag"]
                        elem["sequences_probe2_sequence"] = reqdata["data"]["sequences_probe2_sequence"]
                        elem["sequences_probe2_threePrimeTag"] = reqdata["data"]["sequences_probe2_threePrimeTag"]
                        elem["sequences_amplicon_fivePrimeTag"] = reqdata["data"]["sequences_amplicon_fivePrimeTag"]
                        elem["sequences_amplicon_sequence"] = reqdata["data"]["sequences_amplicon_sequence"]
                        elem["sequences_amplicon_threePrimeTag"] = reqdata["data"]["sequences_amplicon_threePrimeTag"]
                        elem["commercialAssay_company"] = reqdata["data"]["commercialAssay_company"]
                        elem["commercialAssay_orderNumber"] = reqdata["data"]["commercialAssay_orderNumber"]
                        if "amplificationEfficiencySE" in reqdata["data"]:
                            elem["amplificationEfficiencySE"] = reqdata["data"]["amplificationEfficiencySE"]
                        if "meltingTemperature" in reqdata["data"]:
                            elem["meltingTemperature"] = reqdata["data"]["meltingTemperature"]
                    except rdml.RdmlError as err:
                        data["error"] = str(err)
                    else:
                        modified = True

            if reqdata["type"] == "therm_cyc_cons":
                if "id" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - thermal cycling conditions id missing!"}]), 400
                if "idUnique" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - thermal cycling conditions idUnique missing!"}]), 400
                if "description" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - thermal cycling conditions description missing!"}]), 400
                if "lidTemperature" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - thermal cycling conditions lidTemperature missing!"}]), 400
                if "current-position" not in reqdata or "new-position" not in reqdata:
                    return jsonify(errors=[{"title": "Invalid server request - thermal cycling conditions position " +
                                                     "information missing!"}]), 400
                if reqdata["mode"] in ["create", "edit"]:
                    if reqdata["mode"] == "edit" and "old-id" not in reqdata:
                        return jsonify(
                            errors=[{"title": "Invalid server request - thermal cycling conditions old id information missing!"}]), 400
                    try:
                        elem = None
                        if reqdata["mode"] == "create":
                            rd.new_therm_cyc_cons(id=reqdata["data"]["id"], newposition=int(reqdata["new-position"]))
                            elem = rd.get_therm_cyc_cons(byid=reqdata["data"]["id"])
                        if reqdata["mode"] == "edit":
                            elem = rd.get_therm_cyc_cons(byid=reqdata["old-id"])
                            if elem is None:
                                return jsonify(errors=[{"title": "Invalid server request - thermal cycling conditions id not found!"}]), 400
                            elem.change_id(reqdata["data"]["id"], merge_with_id=reqdata["data"]["idUnique"])
                        elem["description"] = reqdata["data"]["description"]
                        elem["lidTemperature"] = reqdata["data"]["lidTemperature"]
                    except rdml.RdmlError as err:
                        data["error"] = str(err)
                    else:
                        modified = True

            if reqdata["type"] == "experiment":
                if "id" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - experiment id missing!"}]), 400
                if "description" not in reqdata["data"]:
                    return jsonify(errors=[{"title": "Invalid server request - experiment description missing!"}]), 400
                if "current-position" not in reqdata or "new-position" not in reqdata:
                    return jsonify(errors=[{"title": "Invalid server request - experiment position information missing!"}]), 400
                if reqdata["mode"] in ["create", "edit"]:
                    if reqdata["mode"] == "edit" and "old-id" not in reqdata:
                        return jsonify(
                            errors=[{"title": "Invalid server request - experiment old id information missing!"}]), 400
                    try:
                        elem = None
                        if reqdata["mode"] == "create":
                            rd.new_experiment(id=reqdata["data"]["id"], newposition=int(reqdata["new-position"]))
                            elem = rd.get_experiment(byid=reqdata["data"]["id"])
                        if reqdata["mode"] == "edit":
                            elem = rd.get_experiment(byid=reqdata["old-id"])
                            if elem is None:
                                return jsonify(errors=[{"title": "Invalid server request - experiment id not found!"}]), 400
                            elem["id"] = reqdata["data"]["id"]
                        elem["description"] = reqdata["data"]["description"]
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
            try:
                elem = None
                if reqdata["primary-key"] == "sample":
                    elem = rd.get_sample(byposition=reqdata["primary-position"])
                    if elem is None:
                        return jsonify(errors=[{"title": "Invalid server request - sample primary-position not found!"}]), 400
                if reqdata["primary-key"] == "target":
                    elem = rd.get_target(byposition=reqdata["primary-position"])
                    if elem is None:
                        return jsonify(errors=[{"title": "Invalid server request - target primary-position not found!"}]), 400
                if reqdata["primary-key"] == "therm_cyc_cons":
                    elem = rd.get_therm_cyc_cons(byposition=reqdata["primary-position"])
                    if elem is None:
                        return jsonify(errors=[{"title": "Invalid server request - thermal cycling conditions primary-position not found!"}]), 400
                if reqdata["primary-key"] == "experiment":
                    elem = rd.get_experiment(byposition=reqdata["primary-position"])
                    if elem is None:
                        return jsonify(errors=[{"title": "Invalid server request - experiment primary-position not found!"}]), 400
                    if reqdata["secondary-key"] == "run":
                        elem = elem.get_run(byposition=reqdata["secondary-position"])
                        if elem is None:
                            return jsonify(errors=[{"title": "Invalid server request - run at secondary-position not found!"}]), 400
                if elem is None:
                    return jsonify(errors=[{"title": "Invalid server request - primary-key is unknown!"}]), 400
                if reqdata["id-source"] == "type":
                    elem.move_type(oldposition=int(reqdata["old-position"]),
                                   newposition=int(reqdata["new-position"]))
                if reqdata["id-source"] == "documentation":
                    elem.move_documentation(oldposition=int(reqdata["old-position"]),
                                            newposition=int(reqdata["new-position"]))
                if reqdata["id-source"] == "xRef":
                    elem.move_xref(oldposition=int(reqdata["old-position"]),
                                   newposition=int(reqdata["new-position"]))
                if reqdata["id-source"] == "annotation":
                    elem.move_annotation(oldposition=int(reqdata["old-position"]),
                                         newposition=int(reqdata["new-position"]))
                if reqdata["id-source"] == "experimenter":
                    elem.move_experimenter(oldposition=int(reqdata["old-position"]),
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
            if reqdata["type"] == "therm_cyc_cons":
                try:
                    rd.move_therm_cyc_cons(id=reqdata["id"], newposition=reqdata["position"])
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

        if "mode" in reqdata and reqdata["mode"] in ["get-run-data"]:
            if "sel-experiment" not in reqdata:
                return jsonify(errors=[{"title": "Invalid server request - sel-experiment id missing!"}]), 400
            if "sel-run" not in reqdata:
                return jsonify(errors=[{"title": "Invalid server request - sel-run id missing!"}]), 400
            try:
                experiment = rd.get_experiment(byid=reqdata["sel-experiment"])
                if experiment is None:
                    return jsonify(errors=[{"title": "Invalid server request - experiment id not found!"}]), 400
                s_run = experiment.get_run(byid=reqdata["sel-run"])
                if s_run is None:
                    return jsonify(errors=[{"title": "Invalid server request - run id not found!"}]), 400
                data["reactsdata"] = s_run.getreactjson()
            except rdml.RdmlError as err:
                data["error"] = str(err)
            # else:
            #     modified = True

        if "mode" in reqdata and reqdata["mode"] in ["run-linregpcr"]:
            if "sel-experiment" not in reqdata:
                return jsonify(errors=[{"title": "Invalid server request - sel-experiment id missing!"}]), 400
            if "sel-run" not in reqdata:
                return jsonify(errors=[{"title": "Invalid server request - sel-run id missing!"}]), 400
            if "baseline-correction" not in reqdata:
                return jsonify(errors=[{"title": "Invalid server request - baseline-correction missing!"}]), 400
            if "pcr-eff-range" not in reqdata:
                return jsonify(errors=[{"title": "Invalid server request - pcr-eff-range missing!"}]), 400
            if "update-RDML-data" not in reqdata:
                return jsonify(errors=[{"title": "Invalid server request - update-RDML-data missing!"}]), 400
            if "exclude-no-plateau" not in reqdata:
                return jsonify(errors=[{"title": "Invalid server request - exclude-no-plateau missing!"}]), 400
            if "exclude-efficiency" not in reqdata:
                return jsonify(errors=[{"title": "Invalid server request - exclude-efficiency missing!"}]), 400
            try:
                experiment = rd.get_experiment(byid=reqdata["sel-experiment"])
                if experiment is None:
                    return jsonify(errors=[{"title": "Invalid server request - experiment id not found!"}]), 400
                s_run = experiment.get_run(byid=reqdata["sel-run"])
                if s_run is None:
                    return jsonify(errors=[{"title": "Invalid server request - run id not found!"}]), 400
                data["reactsdata"] = s_run.webAppLinRegPCR(baselineCorr=reqdata["baseline-correction"],
                                                           pcrEfficiencyExl=reqdata["pcr-eff-range"],
                                                           updateRDML=reqdata["update-RDML-data"],
                                                           excludeNoPlateau=reqdata["exclude-no-plateau"],
                                                           excludeEfficiency=reqdata["exclude-efficiency"])
                if reqdata["update-RDML-data"]:
                    modified = True
            except rdml.RdmlError as err:
                data["error"] = str(err)
                modified = False

        if "mode" in reqdata and reqdata["mode"] in ["get-digital-file"]:
            if "sel-experiment" not in reqdata:
                return jsonify(errors=[{"title": "Invalid server request - sel-experiment id missing!"}]), 400
            if "sel-run" not in reqdata:
                return jsonify(errors=[{"title": "Invalid server request - sel-run id missing!"}]), 400
            if "sel-well" not in reqdata:
                return jsonify(errors=[{"title": "Invalid server request - sel-well id missing!"}]), 400
            try:
                experiment = rd.get_experiment(byid=reqdata["sel-experiment"])
                if experiment is None:
                    return jsonify(errors=[{"title": "Invalid server request - experiment id not found!"}]), 400
                s_run = experiment.get_run(byid=reqdata["sel-run"])
                if s_run is None:
                    return jsonify(errors=[{"title": "Invalid server request - run id not found!"}]), 400
                data["rawdigitalfile"] = s_run.get_digital_raw_data(reqdata["sel-well"])
            except rdml.RdmlError as err:
                data["error"] = str(err)

        if "mode" in reqdata and reqdata["mode"] in ["get-digital-overview-file"]:
            if "sel-experiment" not in reqdata:
                return jsonify(errors=[{"title": "Invalid server request - sel-experiment id missing!"}]), 400
            if "sel-run" not in reqdata:
                return jsonify(errors=[{"title": "Invalid server request - sel-run id missing!"}]), 400
            try:
                experiment = rd.get_experiment(byid=reqdata["sel-experiment"])
                if experiment is None:
                    return jsonify(errors=[{"title": "Invalid server request - experiment id not found!"}]), 400
                s_run = experiment.get_run(byid=reqdata["sel-run"])
                if s_run is None:
                    return jsonify(errors=[{"title": "Invalid server request - run id not found!"}]), 400
                data["rawdigitalfile"] = s_run.get_digital_overview_data(rd)
            except rdml.RdmlError as err:
                data["error"] = str(err)

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


@app.route('/api/v1/health', methods=['GET'])
def health():
    return jsonify(status="OK")


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3300, debug=True, threaded=True)
