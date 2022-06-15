from flask_socketio import SocketIO
from application import create_app
from application.database import DataBase
import config
import netifaces
from flask import redirect, url_for
# from apscheduler.schedulers.background import BackgroundScheduler
import application.views as views
from faker import Faker
fake = Faker('en_IN')


# SETUP
app = create_app()
socketio = SocketIO(app)  # used for user communication
# allowed_mac_list = ('64-6E-E0-A1-77-1E', '64-6E-E0-A1-77-1F', '64-6E-E0-A1-77-ED')

# COMMUNICATION FUNCTIONS


@socketio.on('event')
def handle_my_custom_event(json, methods=['GET', 'POST']):
    """
    handles saving messages once received from web server
    and sending message to other clients
    :param json: json
    :param methods: POST GET
    :return: None
    """
    data = dict(json)
    if "name" in data:
        db = DataBase()
        dmsg = fake.text()
        db.save_message(data["name"], data["message"], dmsg)

    socketio.emit('message response', json)
    

# def job():
#     msgs = get_messages()
#     socketio.emit('price update', new_price, broadcast=True)


# #schedule job
# scheduler = BackgroundScheduler()
# running_job = scheduler.add_job(job, 'interval', seconds=4, max_instances=1)
# scheduler.start()

# MAINLINE
if __name__ == "__main__":  # start the web server
    # if mac_id in allowed_mac_list:
    socketio.run(app, debug=True, host=str(config.Config.SERVER))
