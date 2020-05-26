import React, { useState, useEffect } from 'react';
import { SearchInput } from 'evergreen-ui';
import { db } from '../firebase';
import { useStudentData } from './StudentProvider';
import ProjectCard from './ProjectCard';
import Project from '../models/Project';

import styles from '../assets/styles/projects.module.css';
import { sortAlphabetically, normalizeString } from '../util';

const ProjectList = () => {
  const [projects, setProjects] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const { students } = useStudentData();

  useEffect(() => {
    const unsubscribe = db.collection('projects').onSnapshot((snapshot) => {
      const data = snapshot.docChanges();
      const newProjects = {};
      data.forEach((change) => {
        const updated = change.doc.data();
        const project = new Project(updated, change.doc.id);
        newProjects[project.id] = project;
      });
      setProjects((p) => ({ ...p, ...newProjects }));
    });
    return unsubscribe;
  }, []);

  const $projects = Object.keys(projects)
    .map((id) => projects[id])
    .filter((p) => normalizeString(p.name).includes(normalizeString(searchQuery)))
    .sort((p1, p2) => sortAlphabetically(p1.name, p2.name))
    .map((p) => {
      return <ProjectCard key={p.id} students={students} project={p} />;
    });
  return (
    <div className={styles['projects-container']}>
      <header className={styles.actions}>
        <SearchInput
          placeholder="Search projects by name..."
          width="100%"
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          value={searchQuery}
        />
      </header>
      <ul className={styles['projects-list']}>{$projects}</ul>
    </div>
  );
};

export default ProjectList;