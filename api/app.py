from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from sqlalchemy import Column, Integer, String, Float
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

class MotionSensorData(db.Model):
    __tablename__ = 'motion_sensor_data'
    id = Column(String, primary_key=True)
    sensor_count = Column(Integer)


@app.route('/add_data', methods=['POST'])
def add_data():
    sensor_count = request.form['sensor_count']
    return jsonify(message=f'Got sensor count: ${sensor_count}'), 200



