from flask import Flask, render_template, url_for, redirect, request, jsonify
import sys
import os
import json
import pusher
from flask_sqlalchemy import SQLAlchemy
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import InputRequired, Length, ValidationError
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from flask_bcrypt import Bcrypt
from api_key import pusher_key, pusher_app_id, pusher_secret
from runner import run_user_code


app = Flask(__name__, static_folder='static')
app.url_map.strict_slashes = False

basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + \
    os.path.join(basedir, 'app.sqlite')

app.config['SECRET_KEY'] = 'thisisasecretkey'
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)


login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

pusher_client = pusher.Pusher(
    app_id=pusher_app_id,
    key=pusher_key,
    secret=pusher_secret,
    cluster='mt1',
    ssl=True
)


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, nullable=False, unique=True)
    password = db.Column(db.String, nullable=False)
    email = db.Column(db.String, nullable=False, unique=True)


class RegisterForm(FlaskForm):
    email = StringField(validators=[InputRequired(), Length(
        min=8, max=40)], render_kw={'placeholder': 'Email'})

    username = StringField(validators=[InputRequired(), Length(
        min=4, max=20)], render_kw={'placeholder': 'Username'})

    password = PasswordField(validators=[InputRequired(), Length(
        min=8)], render_kw={'placeholder': 'Password'})

    submit = SubmitField('Register')

    def validate_username(self, username):
        existing_user_username = User.query.filter_by(
            username=username.data).first()
        if existing_user_username:
            raise ValidationError('username already existing')


class LoginForm(FlaskForm):
    username = StringField(validators=[InputRequired(), Length(
        min=4, max=20)], render_kw={'placeholder': 'Username'})

    password = PasswordField(validators=[InputRequired(), Length(
        min=8)], render_kw={'placeholder': 'Password'})

    submit = SubmitField('Log in')


@app.route('/run', methods=['POST'])
def run():
    code = request.form.get('code')
    language = request.form.get('language')
    coding_channel_name = request.form.get('coding_channel_name')

    output = run_user_code(code, language)
    if type(output) is str:
        print(output)
        if coding_channel_name is not None:
            pusher_client.trigger(coding_channel_name,
                                  'code_output', {'output': output})
        return jsonify({'result': 'success', 'output': output})
    else:
        return jsonify({'result': 'failed'})


@app.route('/message', methods=['POST'])
def message():
    content = request.form.get('content')
    row = request.form.get('row')
    column = request.form.get('column')
    user = request.form.get('user_username')
    coding_channel_name = request.form.get('coding_channel_name')

    print(f'row: {row}')
    print(f'column: {column}')
    print(coding_channel_name)
    pusher_client.trigger(coding_channel_name, 'my-event',
                          {'forwarded': content, 'row': row, 'column': column, 'user': current_user.username})

    return jsonify({'result': 'success'})


@app.route('/joined', methods=['POST'])
def joined():
    user = request.form.get('user')
    session_id = request.form.get('session_id')

    pusher_client.trigger(session_id, 'joined',
                          {'user': user})

    return jsonify({'result': 'success'})


@app.route('/left', methods=['POST'])
def left():
    user = request.form.get('user')
    session_id = request.form.get('session_id')

    pusher_client.trigger(session_id, 'left',
                          {'user': user})

    return jsonify({'result': 'success'})


@app.route('/members', methods=['POST'])
def members():
    members_json = request.form.get('members')
    members = json.loads(members_json)
    language = request.form.get('language')
    session_id = request.form.get('session_id')
    pusher_client.trigger(session_id, 'members',
                          {'members': members, 'language': language})

    return jsonify({'result': 'success'})


@app.route('/')
def home():
    return redirect(url_for("login"))


@app.route('/editor', methods=['GET', 'POST'])
@login_required
def editor():
    return render_template("editor.html", user=current_user)


@app.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user:
            if bcrypt.check_password_hash(user.password, form.password.data):
                login_user(user)
                return redirect(url_for("editor"))

    return render_template("login.html", form=form)


@app.route('/logout', methods=['GET', 'POST'])
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))


@app.route('/signup', methods=['GET', 'POST'])
def signup():
    form = RegisterForm()

    if form.validate_on_submit():
        hashed_password = bcrypt.generate_password_hash(form.password.data)
        new_user = User(username=form.username.data,
                        password=hashed_password, email=form.email.data)
        db.session.add(new_user)
        db.session.commit()
        return redirect(url_for("login"))

    return render_template("signup.html", form=form)


@app.route('/invite', methods=['POST'])
@login_required
def invite():
    invited_username = request.form.get('invited_username')
    sender_username = request.form.get('sender')
    coding_channel_name = request.form.get('coding_channel_name')
    feedback = request.form.get('feedback')

    if feedback == 'invite_sent':
        searched_user = User.query.filter_by(username=invited_username).first()
        if searched_user is None:
            return jsonify({'result': 'failed',
                            'message': "the username you entered doesn't exist"})
        else:
            send_invitation(searched_user.id, sender_username,
                            invited_username, coding_channel_name, feedback)
        return jsonify({'result': 'success'})
    if feedback in ['invite_accepted', 'invite_declined']:
        searched_user = User.query.filter_by(username=sender_username).first()
        if searched_user is None:
            return jsonify({'result': 'failed',
                            'message': "this username doesn't exist"})
        else:
            send_invitation_feedback(searched_user.id, sender_username,
                                     invited_username, coding_channel_name, feedback)
        return jsonify({'result': 'success'})


def send_invitation(invited_user_id: str, sender_username: str,
                    invited_username, coding_channel_name: str,
                    feedback: str):
    print(f'from send_invitation: invite sent by {sender_username}')
    print(f'session_id: {coding_channel_name}')
    pusher_client.trigger(f'{invited_user_id}_invite_channel', 'invite_event',
                          {'sender': sender_username,
                           'invited_user': invited_username,
                           'channel': coding_channel_name,
                           'feedback': feedback})


def send_invitation_feedback(sender_id: str, sender_username: str,
                             invited_username, coding_channel_name: str,
                             feedback):
    pusher_client.trigger(f'{sender_id}_invite_channel', 'invite_event',
                          {'sender': sender_username,
                           'invited_user': invited_username,
                           'channel': coding_channel_name,
                           'feedback': feedback})


if __name__ == '__main__':
    if __name__ == '__main__':
        app.run(host='0.0.0.0', port=5000, debug=True)
