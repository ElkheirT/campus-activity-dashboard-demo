from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from sqlalchemy import Column, Integer, String, Float, Date
import os

app = Flask(__name__)
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'data.db')
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


class MotionDataPoint(db.Model):
    __tablename__ = 'motion_data'
    time_stamp = Column(Date, primary_key=True)
    sensor_count = Column(Integer)


class TempDataPoint(db.Model):
    __tablename__ = 'temp_data'
    time_stamp = Column(Date, primary_key=True)
    temp = Column(Float)


class HumidityDataPoint(db.Model):
    __tablename__ = 'humidity_data'
    time_stamp = Column(Date, primary_key=True)
    humidity = Column(Float)


class MotionDataSchema(ma.Schema):
    class Meta:
        fields = ('time_stamp', "sensor_count")


class TempDataSchema(ma.Schema):
    class Meta:
        fields = ('time_stamp', "temp")


class HumidityDataSchema(ma.Schema):
    class Meta:
        fields = ('time_stamp', "humidity")


@app.route('/add_motion_data', methods=['POST'])
def add_motion_data():
    time_stamp = request.form['time_stamp']
    sensor_count = request.form['sensor_count']
    data_point = MotionDataPoint(time_stamp=time_stamp, sensor_count=sensor_count)
    db.session.add(data_point)
    db.session.commit()
    return jsonify(message=f'Got sensor count: {sensor_count} at time {time_stamp}'), 200


@app.route('/add_temp_data', methods=['POST'])
def add_temp_data():
    time_stamp = request.form['time_stamp']
    temp = request.form['temp']
    data_point = TempDataPoint(time_stamp=time_stamp, temp=temp)
    db.session.add(data_point)
    db.session.commit()
    return jsonify(message=f'Got temp: {temp} at time {time_stamp}'), 200


@app.route('/add_humidity_data', methods=['POST'])
def add_humidity_data():
    time_stamp = request.form['time_stamp']
    humidity = request.form['humidity']
    data_point = TempDataPoint(time_stamp=time_stamp, humidity=humidity)
    db.session.add(data_point)
    db.session.commit()
    return jsonify(message=f'Got humidity: {humidity} at time {time_stamp}'), 200
