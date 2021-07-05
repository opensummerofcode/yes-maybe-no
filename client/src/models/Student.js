import { db } from '../firebase';

const capitalizeName = (name) =>
  name
    .split(' ')
    .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
    .join(' ');

class Student {
  constructor(student) {
    Object.keys(student).forEach((prop) => {
      const value = student[prop];
      if (prop === 'firstName') this[prop] = capitalizeName(value);
      else if (prop === 'lastName') this[prop] = capitalizeName(value);
      else this[prop] = value;
    });
    this.id = student.response_id;
  }

  get isAlum() {
    return !this.alum.includes("No, it's");
  }

  get wantsToCoach() {
    return this.alum.includes("Yes, I'd");
  }

  createOrUpdateSuggestion(userName, status, reason, exists) {
    const updated = { [userName]: { status, reason } };
    if (!exists) return db.collection('suggestions').doc(this.id).set(updated);
    return db.collection('suggestions').doc(this.id).update(updated);
  }

  get statusType() {
    return this.status || 'no-status';
  }

  setStatus(type) {
    const status = type === 'no-status' ? null : type;
    return db.collection('students').doc(this.id).update({ status });
  }

  toggleConfirmed() {
    const current = !!this.confirmed;
    return db.collection('students').doc(this.id).update({ confirmed: !current });
  }
}

export default Student;
