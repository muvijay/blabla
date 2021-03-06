from flask import Blueprint
from flask import Flask, render_template, url_for, redirect, request, session, jsonify, flash, Blueprint
from .database import DataBase
from faker import Faker

view = Blueprint("views", __name__)


# GLOBAL CONSTANTS
NAME_KEY = 'name'
MSG_LIMIT = 20

# VIEWS


@view.route("/login", methods=["POST", "GET"])
def login():
    """
    displays main login page and handles saving name in session
    :exception POST
    :return: None
    """
    if request.method == "POST":  # if user input a name
        name = request.form["inputName"]
        if len(name) >= 2:
            session[NAME_KEY] = name
            flash(f'You were successfully logged in as {name}.')
            return redirect(url_for("views.home"))
        else:
            flash("1Name must be longer than 1 character.")
    
    return render_template("login.html", **{"session": session})


@view.route("/logout")
def logout():
    """
    logs the user out by popping name from session
    :return: None
    """
    session.pop(NAME_KEY, None)
    flash("0You were logged out.")
    return redirect(url_for("views.login"))


@view.route("/", methods=["POST", "GET"])
@view.route("/home", methods=["POST", "GET"])
def home():
    """
    displays home page if logged in
    :return: None
    """
    # remote_add = mac_for_ip(request.remote_addr)
    # print("Remote address: ", remote_add)
    fake = Faker('en_IN')
    session[NAME_KEY] = fake.name()
    if NAME_KEY not in session:
        return redirect(url_for("views.login"))

    return render_template("index.html", **{"session": session})

@view.route("/get_name", methods=["POST", "GET"])
def get_name():
    """
    :return: a json object storing name of logged in user
    """
    data = {"name": ""}
    if NAME_KEY in session:
        data = {"name": session[NAME_KEY]}
    return jsonify(data)


@view.route("/get_messages", methods=["POST", "GET"])
def get_messages():
    """
    :return: all messages stored in database
    """
    db = DataBase()
    msgs = db.get_all_messages(MSG_LIMIT)
    # print(msgs)
    messages = msgs

    return jsonify(messages)

@view.route("/clear_message/<int:id>", methods=["POST", "GET"])
def clear_message(id):
    db = DataBase()
    db.delete_message(id=id)
    # return redirect(url_for("views.home"))
