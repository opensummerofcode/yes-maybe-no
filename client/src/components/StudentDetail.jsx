import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Badge, Icon, Button, Dialog, TextInput, Select } from 'evergreen-ui';
import { useStudents, useSuggestions, useAuth } from '@/services';

import dashStyles from '../assets/styles/dashboard.module.css';
import styles from '../assets/styles/student-detail.module.css';

const Wrapper = ({ children }) => (
  <section className={`${dashStyles['student-detail']} ${styles['student-detail']}`}>
    {children}
  </section>
);

const ExternalLink = ({ href, children, ...rest }) => (
  <a href={href} {...rest} target="_blank" rel="noopener noreferrer">
    {children}
  </a>
);

/* TODO:
  This component can be a lot more dynamic since we're rendering
  a lot based a fixed 3 statuses: yes, maybe, no
  Refactor required
*/
const StudentDetail = () => {
  const { user } = useAuth();
  const { students, isLoading: studentsAreLoading } = useStudents();
  const { suggestions } = useSuggestions();

  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestionIsLoading, setSuggestionIsLoading] = useState(false);
  const [student, setStudent] = useState(null);

  const router = useRouter();
  const studentId = router.query.id;

  useEffect(() => {
    if (studentsAreLoading) return;
    const newStudent = students[studentId];
    setStudent(newStudent);
  }, [studentsAreLoading, studentId]);

  let $inputReason = useRef(null);
  if (!student) {
    return (
      <Wrapper>
        <h2 className={styles.empty}>Select a student from the sidebar to get started</h2>
      </Wrapper>
    );
  }

  const renderStatusIcon = (condition, status) => {
    // TODO: make accessible for screen{ match }readers
    let $icon = <Icon size={16} icon="cross" color="danger" />;
    if (status === 'yes' || condition) $icon = <Icon size={16} icon="tick" color="success" />;
    else if (status === 'maybe') $icon = <Icon size={16} icon="minus" color="orange" />;
    return <i className={styles.icon}>{$icon}</i>;
  };

  const makeSuggestion = async () => {
    setSuggestionIsLoading(true);

    const exists = !!suggestions[student.id];
    await student.createOrUpdateSuggestion(user.name, isSuggesting, $inputReason.value, exists);
    if ($inputReason) $inputReason.value = '';
    setIsSuggesting(false);
    setSuggestionIsLoading(false);
  };

  const suggest = (type) => setIsSuggesting(type);

  const select = (type) => student.setStatus(type);

  const renderSuggestionsPerType = (type) => {
    const suggestionsForStudent = suggestions[student.id];
    if (!suggestionsForStudent) return [];
    return Object.keys(suggestionsForStudent)
      .filter((person) => suggestionsForStudent[person].status === type)
      .map((person) => {
        const { status, reason } = suggestionsForStudent[person];
        return (
          <li key={`${person}-${type}`}>
            {renderStatusIcon(null, status)}
            <strong>{person}</strong>
            {reason ? `: ${reason}` : ''}
          </li>
        );
      });
  };

  const $suggestions = ['yes', 'maybe', 'no'].map(renderSuggestionsPerType);
  const $applyingFor = student.applyingForRoles.map((r) => (
    <Badge key={r} marginRight={8}>
      {r}
    </Badge>
  ));

  const { firstName, lastName } = student;
  return (
    <Wrapper>
      <Dialog
        isShown={!!isSuggesting}
        title={`Suggest "${isSuggesting}" for ${student.firstName}`}
        intent="none"
        onCloseComplete={() => setIsSuggesting(false)}
        confirmLabel="Make suggestion"
        onConfirm={makeSuggestion}
        hasCancel={false}
        isConfirmLoading={suggestionIsLoading}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            makeSuggestion();
          }}
          className={styles.reasoning}
        >
          <h2>Why are you making this decision?</h2>
          <TextInput
            width="100%"
            placeholder="Enter reason..."
            autoFocus
            innerRef={(c) => ($inputReason = c)}
          />
          <p>
            A reason is not required, but will open up discussion and help us and your fellow
            coaches understand.
          </p>
        </form>
      </Dialog>
      <header>
        <h2 className={styles.name}>
          {firstName} {lastName}{' '}
        </h2>
        <div className={styles.socials}>
          {student.twitter && (
            <ExternalLink href={student.twitter}>
              <div className={styles['icon-container']}>
                <img src="/img/icon-twitter.png" alt="Twitter" />
              </div>
            </ExternalLink>
          )}
          {student.github && (
            <ExternalLink href={student.github}>
              <div className={styles['icon-container']}>
                <img src="/img/icon-github.png" alt="GitHub" />
              </div>
            </ExternalLink>
          )}
          {student.linkedin && (
            <ExternalLink href={student.linkedin}>
              <div className={styles['icon-container']}>
                <img src="/img/icon-linkedin.png" alt="LinkedIn" />
              </div>
            </ExternalLink>
          )}
        </div>
        {student.isAlum && (
          <Badge color="green" marginLeft={16}>
            alum
          </Badge>
        )}
        <div className={styles.actions}>
          <div>
            {!student.confirmed ? (
              <>
                <Button
                  marginRight={16}
                  onClick={() => suggest('yes')}
                  appearance="primary"
                  intent="success"
                >
                  Suggest yes
                </Button>
                <Button
                  marginRight={16}
                  onClick={() => suggest('maybe')}
                  appearance="primary"
                  intent="warning"
                >
                  Suggest maybe
                </Button>
                <Button
                  marginRight={16}
                  onClick={() => suggest('no')}
                  appearance="primary"
                  intent="danger"
                >
                  Suggest no
                </Button>
              </>
            ) : (
              <p>
                {firstName} has received an email from us and cannot receive additional suggestions.
              </p>
            )}
          </div>
          {user.isAdmin && (
            <div>
              <Select
                className={styles.selectors}
                value={student.statusType}
                onChange={(e) => select(e.target.value)}
                disabled={student.confirmed}
              >
                <option value="no-status">Undecided</option>
                <option value="yes">Yes</option>
                <option value="maybe">Maybe</option>
                <option value="no">No</option>
              </Select>
              <Button marginRight={16} onClick={student.toggleConfirmed} appearance="primary">
                {student.confirmed ? 'Unconfirm' : 'Confirm'}
              </Button>
            </div>
          )}
        </div>
      </header>
      <section>
        <h3>Suggestions</h3>
        {[].concat(...$suggestions).length > 0 ? (
          <ul className={styles['true-false']}>{$suggestions}</ul>
        ) : (
          <p>No one has made a suggestion for {student.firstName} yet.</p>
        )}
      </section>

      <section>
        <h3>Academia</h3>
        <ul>
          <li>
            Enrolled at <strong>{student.nameOfSchool}</strong>
          </li>
          <li>
            Studies: <strong>{student.fieldOfStudy.join(', ')}</strong>
          </li>
          <li>
            Type of degree: <strong>{student.typeOfDegree}</strong>
          </li>
          <li>
            Year into degree: <strong>{student.yearIntoDegree}</strong>
          </li>
        </ul>
      </section>

      <section>
        <h3>Experience</h3>
        <ul>
          {student.cv && (
            <li>
              <ExternalLink href={student.cv}>CV</ExternalLink>
            </li>
          )}
          {student.cvSecondary && (
            <li>
              <ExternalLink href={student.cvSecondary}>CV (external link)</ExternalLink>
            </li>
          )}
          {student.portfolio && (
            <li>
              <ExternalLink href={student.portfolio}>Portfolio</ExternalLink>
            </li>
          )}
          {student.portfolioSecondary && (
            <li>
              <ExternalLink href={student.portfolioSecondary}>
                Portfolio (external link)
              </ExternalLink>
            </li>
          )}
        </ul>
        <h4>Project you&apos;re most proud of:</h4>
        <p className={styles.newlines}>{student.mostProud}</p>
        {student.isAlum && (
          <ul className={styles['true-false']}>
            <li>
              {renderStatusIcon(student.wantsToCoach)}
              {student.firstName} {student.wantsToCoach ? 'wants to be' : 'does not want to be'} a
              student coach
            </li>
          </ul>
        )}
      </section>

      <section>
        <h3>Practical</h3>
        <p>The student can work:</p>
        <ul className={styles['true-false']}>
          <li>
            {renderStatusIcon(student.canWorkUnderEmploymentAgreement)}under a Belgian employment
            agreement
          </li>
          <li>
            {renderStatusIcon(student.canWorkDuringHours)}
            during the month of July, Monday through Thursday
          </li>
          <li>
            {renderStatusIcon(!student.otherTimezone)}
            in the Brussels time zone{' '}
            {!!student.otherTimezone && <span>&nbsp;- They are in {student.otherTimezone}</span>}
          </li>
          <li>
            {renderStatusIcon(student.ownLaptop)}
            on their own laptop
          </li>
        </ul>
        <p>Details:</p>
        <ul>
          <li>
            First language: <strong>{student.firstLanguage}</strong>
          </li>
          <li>
            Level of English: <strong>{student.levelOfEnglish}/5</strong>
          </li>
        </ul>
      </section>

      <section>
        <h3>Motivation</h3>
        <h4>Why do you want to participate in osoc?</h4>
        <p className={styles.newlines}>{student.whyOsoc}</p>

        <h4>Why do you think you&apos;re a good fit?</h4>
        <p className={styles.newlines}>{student.whyGoodFit}</p>

        <h4>What are the things you want to learn at osoc?</h4>
        <p className={styles.newlines}>{student.whatToLearn}</p>

        <h4>What skills can you best help your teammates with?</h4>
        <p className={styles.newlines}>{student.whatSkills}</p>

        {student.anythingElse && (
          <>
            <h4>Is there anything else you&apos;d like to share?</h4>
            <p className={styles.newlines}>{student.anythingElse}</p>
          </>
        )}
      </section>
      <div className={styles.applyingFor}> {$applyingFor}</div>
    </Wrapper>
  );
};

export default StudentDetail;
