import StudentDetail from '@/components/StudentDetail';
import SidebarLayout from '@/components/SidebarLayout';

function Index() {
  return <StudentDetail />;
}

Index.getLayout = (page) => <SidebarLayout>{page}</SidebarLayout>;

export default Index;
