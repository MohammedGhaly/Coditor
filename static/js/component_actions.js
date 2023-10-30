document.addEventListener("DOMContentLoaded", function () {
  const openModalBtn = document.getElementById("invite-btn");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const modal = document.getElementById("myModal");

  const inviteNotificationBox = document.getElementById(
    "invite-notification-box"
  );
  const decline_request_button = document.getElementById("decline-invitation");
  const accept_request_button = document.getElementById("accept-invitation");
  const closeNotificationButton = document.getElementById("close-notification");
  const notificationBox = document.getElementById("notification-box");

  const menuButton = document.getElementById("menu-button");
  const leaveSession = document.getElementById("leave-session");
  const menu = document.querySelector(".menu");
  const langMenu = document.getElementById("lang-menu");

  menuButton.addEventListener("click", function () {
    menu.style.display = menu.style.display === "block" ? "none" : "block";
  });

  leaveSession.addEventListener("click", function () {
    menu.style.display = menu.style.display = "none";
  });

  openModalBtn.addEventListener("click", function () {
    modal.style.display = "block";
  });

  closeModalBtn.addEventListener("click", function () {
    modal.style.display = "none";
  });

  window.addEventListener("click", function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  });

  accept_request_button.addEventListener("click", function () {
    inviteNotificationBox.style.right = "-300px"; // Slide the notification out to the right
  });

  decline_request_button.addEventListener("click", function () {
    inviteNotificationBox.style.right = "-300px"; // Slide the notification out to the right
  });

  closeNotificationButton.addEventListener("click", function () {
    notificationBox.style.right = "-300px"; // Slide the notification out to the right
  });

  langMenu.addEventListener("change", function () {
    selectLanguage(langMenu.value);
  });
});
