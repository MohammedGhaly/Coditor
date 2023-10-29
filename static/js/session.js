class Session {
  constructor(session_id = "") {
    this.id = session_id;
    this.session_members_list = [];
    this.channel = NaN;
    this.lang = "Python";
  }

  invite_rejected(session_id, invite_accepter) {
    this.session_members_list.pop(invite_accepter);
  }

  create_a_channel() {
    if (this.channel === undefined || isNaN(this.channel)) {
      this.id = generateUUID();
      this.subscribe(this.id);
    }
  }

  subscribe(session_id) {
    this.id = session_id;
    this.channel = pusher.subscribe(String(this.id));
  }

  unsubscribe() {
    this.channel.unsubscribe();
    this.id = "";
    this.session_members_list = [];
    updateMembersList(this.session_members_list);
    resetTimer();
  }

  isActive() {
    return this.id !== "";
  }
}
