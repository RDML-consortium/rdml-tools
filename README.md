# RDML-Tools
A collection of web applications to visualize, edit and validate RDML files.

Install a local copy for testing
--------------------------------

`sudo apt-get install -y git-all`

`git clone --recursive https://github.com/RDML-consortium/rdml-tools.git rdml_tools`

`cd rdml_tools`

Update your local copy
----------------------

`git pull`

`git submodule update --recursive --remote`

Reconnect the submodules (for developpers)
------------------------------------------

`cd server/rdmlpython`

`git branch`

`git checkout main`

`cd schema`

`git branch`

`git checkout main`

Setup and run the server
------------------------

The server runs in a terminal

Install the dependencies:

`sudo apt install python3 python3-pip python3-lxml`

`sudo pip3 install matplotlib flask flask_cors numpy scipy`

Start the server:

`cd rdml_tools`

`python3 server/server.py`

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


# Hints on setting up a productive server

This introduction is far from complete and does not cover how to set up nginx or a
linux server to run secure on the internet. This should be known and the hints below
should be considered as incomplete tips to get you started faster.

Basics
------

RDML-Tools work in two parts. We need a web server (HTML) to distribute the homepage
and its JavaScript code and a different web server (PY) to handle the requests
made by this JavScript code, run the Python library and return the results,
which are then displayed by the javaScript code. A single nginx machine can handle
both functions.

Get the code
------------

`sudo apt-get install -y git-all`

`git clone --recursive https://github.com/RDML-consortium/rdml-tools.git rdml_tools`

`cd rdml_tools`

Create the pages for the HTML server
------------------------------------
First the production file has to be created:

`cd client`

`nano .env.production`

In .env.production you need three lines:

`API_URL=https://PY-SERVER.COM/rdml-tools/api/v1`

`API_LINK=https://www.HTML-SERVER.COM/rdml-tools/`

`INDEX_LINK_URL=https://www.HTML-SERVER.COM/rdml-tools/index.html`

Adapt the PY-SERVER.COM and HTML-SERVER.COM to your server names and the check the
path. Now the HTML files can be created:

`cd rdml_tools/client`

`sudo apt install npm`

`sudo npm install n -g`

`sudo n stable`

`sudo npm install`

`npm run bulid`

A folder dist will be created and its content should be made available under:
https://www.HTML-SERVER.COM/rdml-tools/

Get the PY service running
--------------------------
First install all required tools:

`sudo apt install python3 python3-pip python3-lxml`

`sudo pip3 install gunicorn lxml matplotlib flask flask_cors numpy scipy`

`sudo npm install pm2 -g`

Now we need to create a runscript run.sh:

`cd [RDML-TOOLS]/server`

`nano run.sh`

With one line:

`export URL_INDEX="https://www.HTML-SERVER.COM/rdml-tools/index.html"; gunicorn --timeout 125 -w 5 -b 0.0.0.0:8798 server:app`

Be aware that this will create a service at port 8798 (could be any other).

Now it needs to be started with pm2:

`pm2 start --name rdml-tools run.sh`

Check how it is running:

`pm2 list`

Get the PY server running
-------------------------
Now the service is running and the nginx server needs to connect to it. So
this is required for nginx serving https://PY-SERVER.COM/:

First you need to adapt the server config:

`sudo nano /etc/nginx/sites-available/PY-SERVER.COM`

And add the api part in your server (this is not a complete config):
```
server {
    server_name PY-SERVER.COM;
    [ALL OTHER STUFF]
    location /rdml-tools/api {
        rewrite ^/rdml-tools(.*) $1 break;
        proxy_pass http://127.0.0.1:8798;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Now activate and restart the server:

`sudo ln -s /etc/nginx/sites-available/PY-SERVER.COM /etc/nginx/sites-enabled/`

`sudo nginx -t`

`sudo nginx -s reload`

Last check if it works
----------------------
Go to www.HTML-SERVER.COM/rdml-tools/index.html and open LinRegPCR. Load example
file LinRegPCR, go to LinRegPCR tab and press Run LinRegPCR. If it calculates
and you get a table below, you made it!


