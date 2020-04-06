# RDML-Tools
A collection of web applications to visualize, edit and validate RDML files.

Install a local copy for testing
--------------------------------

`git clone --recursive https://github.com/RDML-consortium/rdml-tools.git rdml_tools`

`cd rdml_tools`

Update your local copy
----------------------

`git pull`

`git submodule update --recursive --remote`

Setup and run the server
------------------------

The server runs in a terminal

Install the dependencies:

`sudo apt install python python-pip lxml`

`pip install flask flask_cors numpy`

Start the server:

`cd rdml_tools`

`python server/server.py`

Setup and run the client
------------------------

The client requires a different terminal

Install the dependencies:

`cd rdml_tools/client`

`sudo apt install npm`

`sudo npm install n -g`

`sudo n stable`

`sudo npm install`

Start the client:

`cd rdml_tools/client`

`npm run dev`


