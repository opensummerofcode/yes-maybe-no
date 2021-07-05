import StudentDetail from '@/components/StudentDetail';
import SidebarLayout from '@/components/SidebarLayout';

function Student() {
  return <StudentDetail />;
}

Student.getLayout = (page) => <SidebarLayout>{page}</SidebarLayout>;

export default Student;
