from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from sqlalchemy import Column, Float, String
from datetime import datetime
import os

TIMESTAMP_FORMAT = '%Y-%m-%d %H:%M:%S'
app = Flask(__name__)
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'data.db')
app.config['TIMESTAMP_FORMAT'] = TIMESTAMP_FORMAT
db = SQLAlchemy(app)
ma = Marshmallow(app)


@app.cli.command('db_create')
def db_create():
    db.create_all()
    print('Database created.')


@app.cli.command('db_drop')
def db_drop():
    db.drop_all()
    print('Database dropped.')


class SensorData(db.Model):
    __tablename__ = 'sensor_data'
    time_stamp = Column(db.DateTime, primary_key=True)
    sensor_type = Column(String, primary_key=True)
    location = Column(String, primary_key=True)
    sensor_output = Column(Float)


class SensorDataSchema(ma.Schema):
    class Meta:
        fields = ('time_stamp', 'sensor_type', 'location', 'sensor_output')


@app.route('/add_sensor_data', methods=['POST'])
def add_sensor_data():
    time_stamp = datetime.strptime(request.form['time_stamp'], TIMESTAMP_FORMAT)
    sensor_type = request.form['sensor_type']
    location = request.form['location']
    sensor_output = request.form['sensor_output']
    data = SensorData(time_stamp=time_stamp, sensor_type=sensor_type, location=location, sensor_output=sensor_output)
    db.session.add(data)
    db.session.commit()
    return jsonify(
        message=f'sensor type: {sensor_type}, location: {location}, output: {sensor_output}, time: {time_stamp}'), 200
