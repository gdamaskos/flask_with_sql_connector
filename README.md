# LAHMA core

LAHMA stands for Local Annotation of Homology Matched Aminoacids.

LAHMA is a web application that facilitates protein crystallography research. In this repository you can find the core of the application.

You can visit the full site https://lahma.pdb-redo.eu

Basic web software used in this project:
* Flask
* JQuery
* AJAX
* Google Material Design
* Bootstrap
* SQL

# Installation for development on your computer

## Prerequisites

First of all, you must be running a Debian Operating System like Ubuntu.

The following prerequisites are required and must be installed manually if not present:

* git (e.g. `apt-get install git` on a Debian-like OS)
* python 3.8, follow this tutorial to prepare https://www.digitalocean.com/community/tutorials/how-to-install-python-3-and-set-up-a-programming-environment-on-ubuntu-20-04-quickstart

## Steps for setting up the development environment

Clone the repository from github and go to the ccd directory:

    git clone https://github.com/gdamaskos/flask_with_sql_connector.git
    
    cd flask_with_sql_connector

Create a python3.8 virtual environment containing the dependences found in requirements.txt:

    python3 -m venv ~/virtual_environments/lahma
    source ~/virtual_environments/lahma/bin/activate

Install python dependencies:

    pip install wheel
    pip install -r requirements.txt

Modify the settings in `config/lahma_settings.example` to your needs and rename the
file to `config/lahma_settings.cfg`. Make sure you generate a new secret key,
and fill in a valid email.

The secret key can be generated using a python shell, for example:

	$ python
	>>> import os
	>>> os.urandom(96)

Start the app!

    ./run.sh

Visit the address:

    http://localhost:8080
