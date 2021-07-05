import React, { useState, useEffect } from 'react';
import { SearchInput, Button, Pill } from 'evergreen-ui';
import { Project } from '@/models';
import { useStudents } from '@/services';
import { db } from '../firebase';
import Conflicts from './Conflicts';
import ProjectCard from './ProjectCard';

import styles from '../assets/styles/projects.module.css';
import { sortAlphabetically, normalizeString } from '../util';

const ProjectList = () => {
  const [projects, setProjects] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [conflictsShown, setConflictsShown] = useState(false);
  const { students } = useStudents();

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

  const assignments = Object.keys(projects).reduce((assignedStudents, id) => {
    const project = projects[id];

    project.assignedStudents.forEach((s) => {
      const { studentId } = s;
      const exists = assignedStudents[studentId];
      assignedStudents[studentId] = {
        studentId,
        amount: exists ? exists.amount + 1 : 1,
        teams: exists ? [...exists.teams, project.id] : [project.id]
      };
    });
    return assignedStudents;
  }, {});

  const conflicts = Object.keys(assignments)
    .map((a) => assignments[a])
    .filter((a) => a.amount > 1);

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
          width="80%"
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          value={searchQuery}
        />
        <Conflicts
          students={students}
          conflicts={conflicts}
          isShown={conflictsShown}
          projects={projects}
          setConflictsShown={setConflictsShown}
        />
        <Button onClick={() => setConflictsShown(!conflictsShown)}>
          {conflicts.length !== 0 && (
            <Pill color="red" marginRight={8}>
              {conflicts.length}
            </Pill>
          )}
          Conflicts
        </Button>
      </header>
      {$projects.length > 0 ? (
        <ul className={styles['projects-list']}>{$projects}</ul>
      ) : (
        <span>
          No projects have been added yet. They will be added before the second selection round.
        </span>
      )}
    </div>
  );
};

export default ProjectList;
