FROM heroku/miniconda

# Grab requirements.txt.
ADD ./webapp/requirements.txt /svr/requirements.txt

# Install dependencies
RUN pip install -qr /svr/requirements.txt

# Add our code
ADD ./webapp /opt/webapp/
WORKDIR /opt/webapp

CMD gunicorn --bind 0.0.0.0:$PORT wsgi