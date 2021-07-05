import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import StudentList from '@/components/StudentList';

import styles from '../assets/styles/dashboard.module.css';

export default function SidebarLayout({ children }) {
  return (
    <DndProvider backend={HTML5Backend}>
      <main className={`page-container ${styles.dashboard}`}>
        <div className={styles['content-wrapper']}>
          <StudentList />
          {children}
        </div>
      </main>
    </DndProvider>
  );
}
