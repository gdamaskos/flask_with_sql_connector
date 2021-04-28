import logging
import requests
import sys
import traceback
import os
import uuid
import subprocess

from flask import (json, render_template,
                   request, send_from_directory,
                   send_file, url_for, redirect, jsonify)
from werkzeug.utils import secure_filename

from lahma import app
from lahma.services import db_connector


_log = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = set(['pdb', 'ent'])

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    if 'pdb_id' in request.args:
        pdb_id = request.args.get('pdb_id')
        return render_template('index.html', pdb_id=pdb_id)
    else:
        return render_template('index.html')


@app.route('/tutorial')
def tutorial():
    return render_template('tutorial.html')


@app.route('/credits')
def credits():
    return render_template('credits.html')


@app.route('/help')
def help():
    return render_template('help.html')


@app.route('/contact')
def contact():
    return render_template('contact.html')


@app.route('/search_database/<pdb_id>', methods=['GET'])
def search_database(pdb_id):
    _log.debug('Searching database..')
    try:
        warnings, ncs_data, output_list, num_homologs = db_connector.query_database(pdb_id)
    except db_connector.IdNotFoundError as err:
        _log.error('ID not found. {}'.format(err))
        return json.dumps({'error': 'ID not found.'})
    except Exception as e:
        _log.error('AnyERROR', exc_info=True)
        return json.dumps({'error': 'An error has ocurred. Please try again or contact administrators.'})
    return json.dumps([output_list, ncs_data, warnings, num_homologs])