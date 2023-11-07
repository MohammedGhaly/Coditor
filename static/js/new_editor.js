var editor = ace.edit("editor");
editor.session.setMode("ace/mode/python");
editor.setTheme("ace/theme/dracula");
editor.setShowPrintMargin(false);

var pusher = new Pusher("d10a97a35fd247566d31", {
  cluster: "mt1",
});

const user = new User(
  $("#user-div").attr("user-flask-username"),
  $("#user-div").attr("user-flask-id")
);

function publish_content() {
  if (user.session.isActive()) {
    const message_dict = {
      content: `${editor.getSession().getValue()}`,
      row: editor.getCursorPosition().row,
      column: editor.getCursorPosition().column,
      user_username: user.username,
      coding_channel_name: user.session.id,
    };

    $.post("/message", message_dict, function () {});
  }
}

$("document").ready(function () {
  user.invite_channel = pusher.subscribe(`${user.id}_invite_channel`);
  user.bind_invite();

  var textarea = editor.textInput.getElement();

  $("#form-submit").click(function () {
    event.preventDefault();
    user.invite($("#form-search").val());
    $("#form-search").val("");
  });

  textarea.addEventListener("keyup", function (event) {
    publish_content();
    $(".lines-number-title").text(`lines:\t${editor.session.getLength()}`);
  });

  $("#accept-invitation").click(function () {
    last_invite = user.invites.pop();
    const data = {
      invited_username: user.username,
      sender: last_invite.sender,
      coding_channel_name: last_invite.session_id,
      feedback: "invite_accepted",
    };

    user.session.subscribe(last_invite.session_id);
    user.bind_change();
    startTimer();
    $.post("/invite", data, function () {});
    $.post(
      "/joined",
      { user: user.username, session_id: user.session.id },
      function () {}
    );
  });

  $("#decline-invitation").click(function () {
    last_invite = user.invites.pop();
    const data = {
      invited_username: user.username,
      sender: last_invite.sender,
      coding_channel_name: last_invite.session_id,
      feedback: "invite_declined",
    };

    $.post("/invite", data, function () {});
  });

  $("#logout").click(function () {
    if (user.session.isActive()) {
      user.leave_session();
    }
    window.location.href = "/logout";
  });

  $("#leave-session").click(function () {
    if (user.session.isActive()) {
      user.leave_session();
    } else {
      notify("there is no active session to leave", "error");
    }
  });

  $("#run-btn").click(function () {
    disable_run_btn();
    const data = {
      code: editor.getValue(),
      language: user.session.lang,
      coding_channel_name: user.session.id,
    };
    $.post("/run", data, function (data) {
      enable_run_btn();
      if (data.result === "failed") {
        notify("execution failed, try again later", "error");
      } else if (data.result === "success") {
        updateOutput(data.output);
      }
    });
  });

  window.addEventListener("beforeunload", function (e) {
    if (!user.iamalone()) {
      console.log(user.iamalone())
      user.leave_session();
      console.log(user.session.session_members_list)
    }
  });
});
