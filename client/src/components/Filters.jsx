import React, { useEffect, useReducer, memo } from 'react';
import PropTypes from 'prop-types';
import { Switch, SearchInput, Button, Pill } from 'evergreen-ui';
import { useAuth, useSuggestions } from '@/services';
import { normalizeString } from '../util';
import { Student } from '../models';
import { roles } from '../constants';
import RoleFilter from './RoleFilter';

import styles from '../assets/styles/filters.module.css';

/*
TODO:
status is locked-in - yes/no
*/

const initialState = (showOnly = []) => ({
  searchQuery: '',
  selectedRoles: [...roles],
  isAlum: false,
  wantsToCoach: false,
  includeAlreadySuggested: true,
  statuses: [
    { label: 'Yes', value: 'yes', selected: showOnly.length === 0 || showOnly.includes('yes') },
    {
      label: 'Maybe',
      value: 'maybe',
      selected: showOnly.length === 0 || showOnly.includes('maybe')
    },
    { label: 'No', value: 'no', selected: showOnly.length === 0 || showOnly.includes('no') },
    {
      label: 'Undecided',
      value: 'no-status',
      selected: showOnly.length === 0 || showOnly.includes('no-status')
    }
  ]
});

const reducer = (state, action) => {
  switch (action.type) {
    case 'search':
      return { ...state, searchQuery: action.payload };
    case 'show-alum-only':
      return { ...state, isAlum: action.payload };
    case 'show-coaches-only':
      return { ...state, wantsToCoach: action.payload };
    case 'select-roles':
      return { ...state, selectedRoles: action.payload };
    case 'select-all-roles':
      return { ...state, selectedRoles: [...roles] };
    case 'deselect-all-roles':
      return { ...state, selectedRoles: [] };
    case 'hide-suggested':
      return { ...state, includeAlreadySuggested: action.payload };
    case 'select-status': {
      const statuses = state.statuses.map((s) => {
        const status = { ...s };
        if (status.value === action.payload) status.selected = !s.selected;
        return status;
      });
      return { ...state, statuses };
    }
    case 'reset':
      return { ...initialState(action.payload) };
    default:
      throw new Error(`${action.type} does not exist`);
  }
};

const Filters = ({ students: studentObj, setFiltered, filteredCount, showOnly = [] }) => {
  const { user } = useAuth();
  const { suggestions } = useSuggestions();

  const students = Object.keys(studentObj)
    .map((id) => studentObj[id])
    .map((s) => {
      s.firstNameNormalized = normalizeString(s.firstName);
      s.lastNameNormalized = normalizeString(s.lastName);
      return s;
    });

  const [state, dispatch] = useReducer(reducer, { ...initialState(showOnly) });

  const sortByFirstNameThenLastName = (a, b) => {
    if (a.firstNameNormalized < b.firstNameNormalized) return -1;
    if (a.firstNameNormalized > b.firstNameNormalized) return 1;
    if (a.lastNameNormalized < b.lastNameNormalized) return -1;
    if (a.lastNameNormalized > b.lastNameNormalized) return 1;
    return 0;
  };

  const search = (student) => {
    const query = normalizeString(state.searchQuery);
    const { firstNameNormalized, lastNameNormalized } = student;
    return (
      firstNameNormalized.includes(query) ||
      lastNameNormalized.includes(query) ||
      `${firstNameNormalized} ${lastNameNormalized}`.includes(query) ||
      `${firstNameNormalized} ${lastNameNormalized}`.includes(query)
    );
  };

  const filterByStatus = (student) => {
    const status = student.statusType;
    const { selected } = state.statuses.find((s) => s.value === status);
    return selected;
  };

  const filterByIsAlum = (student) => (state.isAlum ? student.isAlum : true);

  const filterByCoachStatus = (student) =>
    state.wantsToCoach ? student.isAlum && student.wantsToCoach : true;

  const filterByRole = (student) => {
    const hasRoles = roles.filter((role) => {
      if (state.selectedRoles.indexOf(role) === -1) return false;
      if (role === 'Other' && student.hasOtherRole) return true;
      if (student.applyingForRoles.indexOf(role) > -1) return true;
      return false;
    });
    return hasRoles.length > 0;
  };

  const filterByHasSuggestion = (student) => {
    if (state.includeAlreadySuggested) return true;
    return !(suggestions[student.id] && !!suggestions[student.id][user.name]);
  };

  useEffect(() => {
    const filtered = students
      .filter(search)
      .filter(filterByStatus)
      .filter(filterByIsAlum)
      .filter(filterByCoachStatus)
      .filter(filterByRole)
      .filter(filterByHasSuggestion)
      .sort(sortByFirstNameThenLastName);

    setFiltered(filtered);
  }, [students, Object.keys(state).map((key) => state[key])]);

  const $statusSelectors = state.statuses.map((status) => (
    <Button
      isActive={status.selected}
      onClick={() => dispatch({ type: 'select-status', payload: status.value })}
      key={status.value}
    >
      {status.label}&nbsp;
      <Pill>{students.filter((s) => s.statusType === status.value).length}</Pill>
    </Button>
  ));
  return (
    <header className={styles.filters}>
      <div>
        <SearchInput
          placeholder="Search students by name..."
          width="100%"
          onChange={(e) => dispatch({ type: 'search', payload: e.target.value })}
          value={state.searchQuery}
        />
      </div>
      <div className={styles.double}>
        <RoleFilter
          selected={state.selectedRoles}
          setSelected={(r) => dispatch({ type: 'select-roles', payload: r })}
        />
        {state.selectedRoles.length > 0 ? (
          <Button onClick={() => dispatch({ type: 'deselect-all-roles' })}>Deselect all</Button>
        ) : (
          <Button onClick={() => dispatch({ type: 'select-all-roles' })}>Select all</Button>
        )}
      </div>
      <div>
        <Switch
          checked={state.isAlum}
          onChange={(e) => dispatch({ type: 'show-alum-only', payload: e.target.checked })}
        />
        <span>Only alumni</span>
      </div>
      <div>
        <Switch
          checked={state.wantsToCoach}
          onChange={(e) => dispatch({ type: 'show-coaches-only', payload: e.target.checked })}
        />
        <span>Only student coach volunteers</span>
      </div>
      <div>
        <Switch
          checked={state.includeAlreadySuggested}
          onChange={(e) => dispatch({ type: 'hide-suggested', payload: e.target.checked })}
        />
        <span>Include students you&apos;ve suggested for</span>
      </div>
      <div className={styles['status-selectors']}>{$statusSelectors}</div>
      <div className={styles.footer}>
        <div>
          <Pill>{filteredCount}</Pill> of <Pill>{students.length}</Pill> shown
        </div>
        <Button onClick={() => dispatch({ type: 'reset', payload: showOnly })}>
          Reset filters
        </Button>
      </div>
    </header>
  );
};

Filters.propTypes = {
  setFiltered: PropTypes.func.isRequired,
  filteredCount: PropTypes.number.isRequired,
  students: PropTypes.objectOf(PropTypes.instanceOf(Student)),
  showOnly: PropTypes.arrayOf(PropTypes.oneOf(['yes', 'maybe', 'no', 'no-status']))
};

export default memo(Filters);
