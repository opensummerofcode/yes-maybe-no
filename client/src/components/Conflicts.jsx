import React from 'react';
import PropTypes from 'prop-types';
import { SideSheet } from 'evergreen-ui';

import styles from '../assets/styles/conflicts.module.css';
import { sortAlphabetically } from '../util';

// eslint-disable-next-line react/prop-types
const Conflicts = ({ conflicts, students, projects, isShown, setConflictsShown }) => {
  const renderConflict = ({ studentId, teams }) => {
    const $conflictingTeams = teams
      // eslint-disable-next-line react/prop-types
      .map((id) => projects[id].name)
      .sort(sortAlphabetically)
      .map((name) => <li key={studentId}>{name}</li>);

    return (
      students[studentId] && (
        <li key={studentId}>
          {/* eslint-disable-next-line react/prop-types */}
          {students[studentId].firstName} {students[studentId].lastName}:
          <ul>{$conflictingTeams}</ul>
        </li>
      )
    );
  };

  const $conflicts = conflicts.map(renderConflict);
  return (
    <SideSheet isShown={isShown} onCloseComplete={() => setConflictsShown(false)}>
      <section className={styles.conflicts}>
        <h2>Resolving conflics</h2>
        The student may be a better fit for a specific team, if they:
        <ul>
          <li>are an alum and the team doesn&apos;t have any yet</li>
          <li>are an alum on a team with a half-time coach</li>
          <li>are an alum and provide skills the coach does not have</li>
          <li>have pre-existing history with the project in question</li>
          <li>enrich the team&apos;s diversity</li>
          <li>
            have a skillset that is tough to find in other applicants, and matches exceptionally
            well with the project
          </li>
        </ul>
        <h2>
          {conflicts.length} {conflicts.length === 1 ? 'conflict' : 'conflicts'}
        </h2>
        <ul>{$conflicts}</ul>
      </section>
    </SideSheet>
  );
};

Conflicts.propTypes = {
  conflicts: PropTypes.arrayOf(PropTypes.shape({})),
  isShown: PropTypes.bool.isRequired,
  setConflictsShown: PropTypes.func.isRequired
};

export default Conflicts;
