import Link from 'next/link';
import { useRouter } from 'next/router';
import { Badge, Pane, Pill } from 'evergreen-ui';
import { DragSource } from 'react-dnd';
import { useSuggestions } from '../services';

import styles from '../assets/styles/student-card.module.css';

const collect = (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
});

const beginDrag = (props) => ({ ...props });

const endDrag = (props, monitor) => {
  if (!monitor.didDrop()) return;

  const { student } = monitor.getItem();
  const { project } = monitor.getDropResult();
  project.startAssigning(student);
};

const StudentCard = ({ student, connectDragSource }) => {
  const router = useRouter();

  const { firstName, lastName } = student;
  const { suggestions } = useSuggestions();

  const selectedStudentId = router.query.id;
  const isActive = selectedStudentId && selectedStudentId === student.id;

  const suggestionList = suggestions[student.id];
  const countSuggestionsOfType = (type) => {
    if (!suggestionList) return 0;
    return Object.keys(suggestionList).filter((person) => suggestionList[person].status === type)
      .length;
  };

  const suggestionAmounts = ['yes', 'maybe', 'no'].reduce(
    (all, status) => {
      const amount = countSuggestionsOfType(status);
      all[status] = amount;
      all.total += amount;
      return all;
    },
    { total: 0 }
  );

  return connectDragSource(
    <li className={styles.card}>
      <Link href={`/student/${student.id}/${student.firstName}-${student.lastName}`}>
        <button type="button" className="button--seamless">
          <Pane
            className={`${styles.wrapper} ${isActive ? styles.active : ''} ${
              styles[`status-${student.statusType}`]
            }`}
            elevation={isActive ? 2 : 1}
          >
            <div className={styles.name}>
              {firstName}&nbsp;<strong>{lastName}</strong>
              {student.isAlum && (
                <Badge color="green" marginLeft={8}>
                  alum
                </Badge>
              )}
              {suggestionAmounts.total > 0 && (
                <div className={styles['suggestion-amount']}>
                  <Pill>{suggestionAmounts.total}</Pill>
                </div>
              )}
            </div>
            <div className={styles.suggestions}>
              {/* TODO: This could be a lot more dynamic */}
              {suggestionAmounts.total > 0 ? (
                <>
                  {suggestionAmounts.yes > 0 && (
                    <span
                      style={{ flex: suggestionAmounts.yes / suggestionAmounts.total }}
                      className={styles['suggestions-yes']}
                    />
                  )}
                  <span
                    style={{ flex: suggestionAmounts.maybe / suggestionAmounts.total }}
                    className={styles['suggestions-maybe']}
                  />
                  {suggestionAmounts.no > 0 && (
                    <span
                      style={{ flex: suggestionAmounts.no / suggestionAmounts.total }}
                      className={styles['suggestions-no']}
                    />
                  )}
                </>
              ) : (
                <span className={styles['suggestions-empty']} />
              )}
            </div>
          </Pane>
        </button>
      </Link>
    </li>
  );
};

export default DragSource('student', { beginDrag, endDrag }, collect)(StudentCard);
