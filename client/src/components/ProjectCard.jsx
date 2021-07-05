import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Pane,
  Badge,
  IconButton,
  Dialog,
  Tooltip,
  Icon,
  Position,
  TextInputField,
  toaster,
  Text
} from 'evergreen-ui';
import { DropTarget } from 'react-dnd';
import { useAuth } from '@/services';
import { sortAlphabetically } from '../util';
import ProjectModel from '../models/Project';

import styles from '../assets/styles/projects.module.css';

const collectDrag = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOverDropZone: monitor.isOver(),
  isOverCurrent: monitor.isOver({ shallow: true }),
  canDrop: monitor.canDrop(),
  itemType: monitor.getItemType()
});

const ConditionalTooltip = ({ condition, content, children }) =>
  condition ? (
    <Tooltip content={content} position={Position.TOP}>
      {children}
    </Tooltip>
  ) : (
    children
  );

ConditionalTooltip.propTypes = {
  condition: PropTypes.bool.isRequired,
  content: PropTypes.node,
  children: PropTypes.node.isRequired
};

const canDrop = () => true;
const drop = (props) => ({ project: props.project });

const ProjectCard = ({ students, project, isOverDropZone, connectDropTarget }) => {
  const { user } = useAuth();
  const [studentBeingAssigned, setAssignedStudent] = useState(false);
  const [isAssignLoading, setIsAssignLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  let $inputReason = useRef(null);

  useEffect(() => {
    if (project.isBeingAssignedTo && project.hasStudent(project.isBeingAssignedTo)) {
      toaster.danger(`${project.isBeingAssignedTo.firstName} is already on ${project.name}`);
    } else setAssignedStudent(project.isBeingAssignedTo);
  }, [project, project.isBeingAssignedTo]);

  const stopAssigning = () => {
    project.stopAssigning();
    setAssignedStudent(null);
  };

  const doAssign = async () => {
    setIsAssignLoading(true);
    await project.assign(studentBeingAssigned, selectedRole, $inputReason.value, user.name);
    if ($inputReason) $inputReason.value = '';
    setIsAssignLoading(false);
    setSelectedRole(null);
    project.stopAssigning();
  };

  const renderCoachesList = () => {
    if (project.coaches.length === 0)
      return <p className={styles['coach-disclaimer']}>No coaches yet</p>;
    return project.coaches
      .sort((a, b) => {
        if (a.isLead - b.isLead) return -1;
        if (b.isLead - a.isLead) return 1;
        return sortAlphabetically(a.name, b.name);
      })
      .map((coach) => (
        <li key={coach.name}>
          <Badge color={coach.isLead ? 'purple' : 'neutral'}>{coach.name}</Badge>
        </li>
      ));
  };

  const renderRolesRequired = () =>
    project.requiredProfiles.map((profile, i) => (
      // eslint-disable-next-line react/no-array-index-key
      <li key={`${profile}-${i}`}>
        <ConditionalTooltip
          condition={!!profile.comment}
          content={profile.comment}
          position={Position.TOP}
        >
          <Badge className={styles.badge}>
            {profile.comment && <Icon color="info" marginRight={4} size={12} icon="info-sign" />}
            {profile.amount || 1}x {profile.role}
          </Badge>
        </ConditionalTooltip>
      </li>
    ));

  const renderRoleSelectors = () =>
    project.requiredProfiles.map((profile, i) => (
      <ConditionalTooltip
        condition={!!profile.comment}
        content={profile.comment}
        position={Position.TOP}
        // eslint-disable-next-line react/no-array-index-key
        key={`${profile.role}-${i}`}
      >
        <Badge
          className={styles.badge}
          color={
            selectedRole &&
            selectedRole.role === profile.role &&
            selectedRole.comment === profile.comment
              ? 'purple'
              : 'neutral'
          }
          isInteractive
          onClick={() => setSelectedRole(profile)}
          marginRight={8}
        >
          {profile.comment && <Icon color="info" marginRight={4} size={12} icon="info-sign" />}
          {profile.role}
        </Badge>
      </ConditionalTooltip>
    ));

  const removeStudent = (studentId) => project.unassign(studentId);

  const renderStudent = ({ role, studentId, suggester, reason }) => {
    const student = students[studentId];
    if (!student) return <React.Fragment key={studentId} />;
    return (
      <article key={studentId} className={styles.students__student}>
        <div>
          <div className={styles['student-name']}>
            {student.firstName} {student.lastName}{' '}
            {student.isAlum && (
              <Badge color="green" marginLeft={4}>
                alum
              </Badge>
            )}
            {reason && (
              <Tooltip content={reason} position={Position.TOP}>
                <IconButton appearance="minimal" icon="comment" />
              </Tooltip>
            )}
          </div>
          <ConditionalTooltip
            condition={!!role.comment}
            content={role.comment}
            position={Position.TOP}
          >
            <Badge className={`${styles.badge} ${styles['student-badge']}`}>
              {role.role}
              {role.comment && <Icon color="info" marginLeft={8} size={12} icon="info-sign" />}
            </Badge>
          </ConditionalTooltip>
          <Text size={300} marginTop={4}>
            Suggested by {suggester}
          </Text>
        </div>
        <IconButton
          icon="cross"
          intent="danger"
          height={32}
          onClick={() => removeStudent(studentId)}
        />
      </article>
    );
  };

  const $coaches = renderCoachesList();
  const $roles = renderRolesRequired();
  const $roleSelectors = renderRoleSelectors();
  const $assignedStudents = project.assignedStudents.map(renderStudent);

  return connectDropTarget(
    <li className={`${styles.project} ${isOverDropZone ? styles.dropping : ''}`}>
      <Pane elevation={2} className={styles.wrapper}>
        <Dialog
          isShown={!!studentBeingAssigned}
          title={
            studentBeingAssigned
              ? `Draft ${studentBeingAssigned.firstName} for ${project.name}`
              : 'Draft student'
          }
          intent="none"
          onCloseComplete={stopAssigning}
          confirmLabel={selectedRole ? `Draft as ${selectedRole.role}` : 'Draft'}
          onConfirm={doAssign}
          hasCancel
          isConfirmLoading={isAssignLoading}
          isConfirmDisabled={!selectedRole}
        >
          <Text size={400}>
            Which role are you drafting {studentBeingAssigned && studentBeingAssigned.firstName}{' '}
            for?
          </Text>
          <div className={styles['role-selector']}>{$roleSelectors}</div>
          <TextInputField
            width="100%"
            placeholder="Enter reason..."
            autoFocus
            innerRef={(c) => ($inputReason = c)}
            label="Why is this student a good fit for your team? (Optional)"
          />
          <Text size={400}>You can still remove this student from the team later.</Text>
        </Dialog>
        <header className={styles.header}>
          <div>
            <h3 className={styles.title}>{project.name}</h3>
            <div className={styles.details}>
              <span className={styles.partner}>{project.partner}</span>
              <ul className={styles.coaches}>{$coaches}</ul>
              {project.template && (
                <a
                  href={project.template}
                  className={styles['template-link']}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  View template
                </a>
              )}
            </div>
          </div>
          <ul className={styles.roles}>{$roles}</ul>
        </header>
        <div className={styles.students}>{$assignedStudents}</div>
      </Pane>
    </li>
  );
};

ProjectCard.propTypes = {
  project: PropTypes.instanceOf(ProjectModel).isRequired
};

export default DropTarget('student', { canDrop, drop }, collectDrag)(ProjectCard);
