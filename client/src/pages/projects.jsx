import ProjectList from '@/components/ProjectList';

import SidebarLayout from '../components/SidebarLayout';

function Projects() {
  return <ProjectList />;
}

Projects.getLayout = (page) => <SidebarLayout>{page}</SidebarLayout>;

export default Projects;
