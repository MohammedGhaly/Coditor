let curretWriterTimerId = null;

function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function notify_invite_recieved(user) {
  $("#invite-notification-text").text(
    `you have a request from ${user.invites[0].sender}`
  );
  $("#invite-notification-box").css("right", "0");
}

function hideNotification() {
  $("#notification-box").css("right", "-300px");
}

function notify(message, type = "default") {
  switch (type) {
    case "joined":
      $("#notification-box").css("background-color", "#379600");
      break;
    case "left":
      $("#notification-box").css("background-color", "#e6a800");
      break;
    default:
      $("#notification-box").css("background-color", "#d10000");
  }
  $("#notification-text").text(message);
  $("#notification-box").css("right", "0");

  setTimeout(hideNotification, 3000);
}

function update_editor(content, row, column) {
  editor.getSession().setValue(content);
  editor.moveCursorTo(row, column);
  $(".lines-number-title").text(`lines:\t${editor.session.getLength()}`);
}

function hideRecentWriter() {
  $(".current-user-icon").css("display", "none");
  $(".signal-effect").css("display", "none");
}

function update_recent_writer(user) {
  $(".current-user-icon p").text(user);
  $(".current-user-icon").css("display", "flex");
  $(".signal-effect").css("display", "flex");

  cancelCurrentWriterTimer();
  startCurrentWriterTimer();
}

function startCurrentWriterTimer() {
  if (curretWriterTimerId !== null) {
    clearTimeout(curretWriterTimerId);
  }

  curretWriterTimerId = setTimeout(function () {
    hideRecentWriter();
  }, 3000);
}

function cancelCurrentWriterTimer() {
  if (curretWriterTimerId !== null) {
    clearTimeout(curretWriterTimerId);
    curretWriterTimerId = null;
  }
}

function updateMembersList(members) {
  // Get a reference to the members-list
  const membersList = document.getElementById("members-list");

  // Replace the current content with new list items
  membersList.innerHTML = ""; // Clear the current content

  // Add members to the list
  members.forEach(function (member) {
    const li = document.createElement("li");
    li.innerHTML = '<a class="member-item-title">' + member + "</a>";
    membersList.appendChild(li);
  });
}

function updateOutput(output) {
  console.log(output)
  $(".output-p").text(output);
}

function disable_run_btn() {
  $("#run-button").prop("disabled", true);
}

function enable_run_btn() {
  $("#run-button").prop("disabled", false);
}

function updateLanguageMenu(lang) {
  $("#lang-menu").val(lang);
}

function selectLanguage(language) {
  if (language === "Python") {
    user.session.lang = "Python";
    editor.session.setMode("ace/mode/python");
  } else if (language === "Javascript") {
    user.session.lang = "Javascript";
    editor.session.setMode("ace/mode/javascript");
  } else if (language === "C") {
    user.session.lang = "C";
    editor.session.setMode("ace/mode/c_cpp");
  }
}
