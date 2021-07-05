import { db } from '../firebase';

class Project {
  constructor(project, id) {
    Object.keys(project).forEach((prop) => {
      this[prop] = project[prop];
    });
    this.id = id;
    if (!this.assignedStudents) this.assignedStudents = [];
  }

  startAssigning(student) {
    this.isBeingAssignedTo = student;
  }

  stopAssigning() {
    this.isBeingAssignedTo = null;
  }

  hasStudent(student) {
    return this.assignedStudents.find((s) => s.studentId === student.id);
  }

  assign(student, role, reason, suggester) {
    return db
      .collection('projects')
      .doc(this.id)
      .update({
        assignedStudents: [
          ...this.assignedStudents,
          {
            studentId: student.id,
            role,
            suggester,
            reason
          }
        ]
      });
  }

  unassign(studentId) {
    const assignedStudents = [...this.assignedStudents];
    const index = assignedStudents.findIndex((s) => s.studentId === studentId);
    if (index !== -1) assignedStudents.splice(index, 1);
    return db.collection('projects').doc(this.id).update({ assignedStudents });
  }
}

export default Project;
