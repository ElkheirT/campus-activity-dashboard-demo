import json

import bcrypt
import os
import queue
import pandas as pd
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_socketio import SocketIO
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from sqlalchemy import Column, Float, String, Integer, func
from flask_jwt_extended import JWTManager, jwt_required, create_access_token
from datetime import datetime, date

app = Flask(__name__)
load_dotenv()
TIMESTAMP_FORMAT = '%Y-%m-%d %H:%M:%S'
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'data.db')
app.config['TIMESTAMP_FORMAT'] = TIMESTAMP_FORMAT
app.config['JWT_SECRET_KEY'] = os.environ['JWT_SECRET_KEY']
app.config['SECRET_KEY'] = os.environ['SECRET_KEY']

db = SQLAlchemy(app)
ma = Marshmallow(app)
jwt = JWTManager(app)
socketio = SocketIO(app, cors_allowed_origins=["http://localhost:3000"], logger=True, engineio_logger=True)
message_queue = queue.Queue()


@app.cli.command('db_create')
def db_create():
    db.create_all()
    print('Database created.')


@app.cli.command('db_drop')
def db_drop():
    db.drop_all()
    print('Database dropped.')


@app.cli.command('db_read_file')
def db_read_file():
    with open('./data/data.json', 'r') as f:
        data_list = json.loads(f.read())
        for data_point in data_list:
            time_stamp = datetime.strptime(data_point['time_stamp'], TIMESTAMP_FORMAT)
            sensor_type = data_point['sensor_type']
            location = data_point['location']
            sensor_output = data_point['sensor_output']
            data = SensorData(time_stamp=time_stamp, sensor_type=sensor_type, location=location,
                              sensor_output=sensor_output)
            db.session.add(data)
            db.session.commit()


class User(db.Model):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True)
    password = Column(String)


class SensorData(db.Model):
    __tablename__ = 'sensor_data'
    time_stamp = Column(db.DateTime, primary_key=True)
    sensor_type = Column(String, primary_key=True)
    location = Column(String, primary_key=True)
    sensor_output = Column(Float)


class SensorDataSchema(ma.Schema):
    class Meta:
        fields = ('time_stamp', 'sensor_type', 'location', 'sensor_output')


@app.route('/register', methods=['POST'])
def register():
    username = request.form['username']
    password = request.form['password']
    user = User.query.filter_by(username=username).first()
    if user:
        return jsonify(message=f'The user "{username}" already exists'), 409
    else:
        pw_as_bytes = str.encode(password)
        pw_hashed = bcrypt.hashpw(pw_as_bytes, bcrypt.gensalt())
        user = User(username=username, password=pw_hashed)
        db.session.add(user)
        db.session.commit()
        return jsonify(message=f'Successfully added user "{username}"'), 201


@app.route('/login', methods=['POST'])
def login():
    username = request.form['username']
    password = request.form['password']
    user = User.query.filter_by(username=username).first()
    if user:
        pw_as_bytes = str.encode(password)
        pw_hashed = user.password
        if bcrypt.checkpw(pw_as_bytes, pw_hashed):
            access_token = create_access_token(identity=username)
            return jsonify(message="Login succeeded", access_token=access_token), 200
        else:
            return jsonify(message="Bad username or password"), 401
    else:
        return jsonify(message="Bad username or password"), 401


@app.route('/add_sensor_data', methods=['POST'])
# @jwt_required()
def add_sensor_data():
    time_stamp = datetime.strptime(request.form['time_stamp'], TIMESTAMP_FORMAT)
    sensor_type = request.form['sensor_type']
    location = request.form['location']
    sensor_output = request.form['sensor_output']
    data = SensorData(time_stamp=time_stamp, sensor_type=sensor_type, location=location, sensor_output=sensor_output)
    db.session.add(data)
    db.session.commit()
    data_as_json = sensor_data_schema.dump(data)
    # send_data(data_as_json)
    message_queue.put(data_as_json)
    return jsonify(
        message=f'sensor type: {sensor_type}, location: {location}, output: {sensor_output}, time: {time_stamp}'), 200


@socketio.on('get_binned_data')
def get_binned_data(requested_date):
    bins = [7, 11, 15, 19, 23]
    labels = ['7AM-10AM', '11AM-2PM', '3PM-6PM', '7PM-10PM']
    requested_date = datetime.strptime(requested_date, '%Y-%m-%d').date()
    query_statement = SensorData.query.filter(func.date(SensorData.time_stamp) == requested_date).statement
    df = pd.read_sql(query_statement, db.session.bind)
    df['time_bins'] = pd.cut(df.time_stamp.dt.hour, bins, labels=labels, right=False)
    grouped_df = df.groupby('time_bins', as_index=True)['sensor_output'].agg('sum')
    socketio.emit('binned_data', grouped_df.to_json())


@socketio.on('get_data_stream')
def on_get_data():
    while True:
        message = message_queue.get()
        print("sending data")
        socketio.emit('new_data_point', message)
        message_queue.task_done()


@socketio.on('get_data_in_range')
def get_data_in_range(date_range):
    start_date = datetime.strptime(date_range["startDate"], TIMESTAMP_FORMAT)
    end_date = datetime.strptime(date_range["endDate"], TIMESTAMP_FORMAT)
    past_data = SensorData.query.filter(SensorData.time_stamp > start_date, SensorData.time_stamp < end_date)
    if past_data:
        result = sensor_data_list_schema.dump(past_data)
        socketio.emit('past_data', result)


sensor_data_schema = SensorDataSchema()
sensor_data_list_schema = SensorDataSchema(many=True)

if __name__ == '__main__':
    socketio.run(app, debug=True)
