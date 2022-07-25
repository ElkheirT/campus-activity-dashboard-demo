import bcrypt
import os
import queue
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_socketio import SocketIO
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from sqlalchemy import Column, Float, String, Integer
from flask_jwt_extended import JWTManager, jwt_required, create_access_token
from datetime import datetime

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


@socketio.on('get_new_data')
def on_get_data():
    while True:
        message = message_queue.get()
        print("sending data")
        socketio.emit('new_data', message)
        message_queue.task_done()


@socketio.on('get_past_data')
def request_past_data(date_range):
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
