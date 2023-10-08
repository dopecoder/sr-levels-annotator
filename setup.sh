sudo apt-get update
sudo apt-get install apache2
sudo apt-get install libapache2-mod-wsgi
sudo apt-get install python-pip
sudo pip install flask yfinance python-dotenv
git clone https://github.com/dopecoder/sr-levels-annotator.git
sudo ln -sT ~/sr-levels-annotator /var/www/html/sr
cd ~/sr-levels-annotator
echo """import sys
sys.path.insert(0, '/var/www/html/flaskapp')
from flaskapp import app as application
""" >> ~/sr-levels-annotator/sr.wsgi



#/etc/apache2/sites-enabled/000-default.conf
# After DocumentRoot /var/www/html part

# WSGIDaemonProcess flaskapp threads=5
# WSGIScriptAlias / /var/www/html/flaskapp/flaskapp.wsgi
# <Directory flaskapp>
#     WSGIProcessGroup flaskapp
#     WSGIApplicationGroup %{GLOBAL}
#     Order deny,allow
#     Allow from all
# </Directory>

#sudo service apache2 restart