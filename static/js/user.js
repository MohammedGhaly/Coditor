class User {
  constructor(username, id) {
    this.username = username;
    this.id = id;
    this.session = new Session();

    this.invite_channel = NaN;
    this.invites = [];
  }

  invite(invited_username) {
    if (invited_username == this.username) {
      notify("you can not invite yourself", "error");
      return;
    }

    if (!this.session.isActive()) {
      this.session.session_members_list.push(this.username);
      this.session.create_a_channel();
      this.bind_change();
    }

    const data = {
      invited_username: invited_username,
      sender: this.username,
      coding_channel_name: this.session.id,
      feedback: "invite_sent",
    };
    $.post("/invite", data, function (data) {
      if (data.result === "failed") {
        notify(data.message, "error");
      }
    });
  }

  leave_session() {
    $.post(
      "/left",
      { user: this.username, session_id: this.session.id },
      function () {}
    );
    this.session.unsubscribe();
  }

  bind_change() {
    this.bind_members();
    this.bind_joined_left();
    this.bind_run();
    this.session.channel.bind("my-event", (data) => {
      update_recent_writer(data.user);
      if (data.user !== this.username) {
        update_editor(data.forwarded, data.row, data.column);
      }
    });
  }

  bind_invite() {
    this.invite_channel.bind("invite_event", (data) => {
      const new_invite = new Invite(
        data.sender,
        data.invited_user,
        data.channel
      );

      if (data.feedback === "invite_sent") {
        this.invites.push(new_invite);
        notify_invite_recieved(this);
      } else if (data.feedback === "invite_accepted") {
        if (!this.session.session_members_list.includes(new_invite.invited)) {
          this.session.session_members_list.push(new_invite.invited);
          updateMembersList(this.session.session_members_list);
        }
        $.post(
          "/members",
          {
            members: JSON.stringify(this.session.session_members_list),
            language: this.session.lang,
            session_id: this.session.id,
          },
          function () {}
        );
        publish_content();
      } else if (data.feedback === "invite_declined") {
        notify(`ghaly declined the request`, "left");
        if (this.session.session_members_list.length === 1) {
          this.session.unsubscribe();
        }
      }
    });
  }

  bind_joined_left() {
    this.session.channel.bind("joined", (data) => {
      if (data.user !== this.username) {
        notify(`${data.user} joined the session`, "joined");
	console.log(`isrunning = ${isRunning}`)
        if (!isRunning) {
          startTimer();
        }
        if (!this.session.session_members_list.includes(data.user)) {
          this.add_member(data.user);
        }
      }
    });

    this.session.channel.bind("left", (data) => {
      if (data.user !== this.username) {
        this.remove_member(data.user);
        if (this.iamalone()) this.session.unsubscribe();
        notify(`${data.user} left the session`, "left");
      }
    });
  }

  bind_members() {
    this.session.channel.bind("members", (data) => {
      this.session.session_members_list = data.members;
      this.session.lang = data.language;
      selectLanguage(this.session.lang);
      updateLanguageMenu(this.session.lang);
      updateMembersList(this.session.session_members_list);
    });
  }

  bind_run() {
    this.session.channel.bind("code_output", (data) => {
      updateOutput(data.output);
    });
  }

  iamalone() {
    return (
      this.session.session_members_list.length <= 1 &&
      (this.session.session_members_list[0] === this.username ||
      this.session.session_members_list[0] == undefined)
    );
  }

  add_member(user) {
    this.session.session_members_list.push(user);
    updateMembersList(this.session.session_members_list);
  }
  remove_member(user) {
    remove_element(this.session.session_members_list, user);
  }
}
