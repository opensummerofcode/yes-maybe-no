import { useEffect } from 'react';
import create from 'zustand';
import { db } from '@/firebase';
import { Student } from '@/models';

const useStore = create((set, get) => ({
  students: {},
  isLoading: true,
  setIsLoading: (val) => set({ isLoading: val }),
  addStudent: (studentData) => {
    const student = new Student(studentData);
    const students = get().students || {};
    students[student.id] = student;
    // create new object so diffing doesn't happen shallowly
    set({ students: { ...students } });
  }
}));

export default function useStudents() {
  const { isLoading, setIsLoading, students, addStudent } = useStore();

  useEffect(() => {
    const unsubscribe = db.collection('students').onSnapshot((snapshot) => {
      const data = snapshot.docChanges();
      data.forEach((change) => {
        const updated = change.doc.data();
        addStudent(updated);
      });
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { students, isLoading };
}
