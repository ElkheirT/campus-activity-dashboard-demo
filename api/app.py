from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from sqlalchemy import Column, Integer, String, Float
import os
import datetime

app = Flask(__name__)
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'data.db')
db = SQLAlchemy(app)
ma = Marshmallow(app)


@app.cli.command('db_create')
def db_create():
    db.create_all()
    print('Database created.')


class MotionSensorData(db.Model):
    __tablename__ = 'motion_sensor_data'
    id = Column(String, primary_key=True)
    sensor_count = Column(Integer)


class MotionSensorDataSchema(ma.Schema):
    class Meta:
        fields = ('time_stamp', "motion_sensor_count")


@app.route('/add_data', methods=['POST'])
def add_data():
    sensor_count = request.form['sensor_count']
    time_stamp = datetime.datetime.now()
    data_point = MotionSensorData(id=time_stamp, sensor_count=sensor_count)
    return jsonify(message=f'Got sensor count: {sensor_count} at time {time_stamp}'), 200




