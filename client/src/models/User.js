class User {
  constructor(user) {
    this.id = user.uid;
    this.uid = user.uid;
    this.name = user.displayName;
    this.email = user.email;
    this.isPending = user.pending;
    this.isAdmin = user.admin;
  }

  get role() {
    if (this.isAdmin) return 'admin';
    if (!this.isPending) return 'coach';
    return 'pending';
  }
}

export default User;
