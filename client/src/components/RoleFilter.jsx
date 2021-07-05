import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { SelectMenu, Button, Position } from 'evergreen-ui';
import { roles } from '../constants';

const determineLabel = (selected) => {
  const amount = selected.length;
  if (amount === 1) return `Role: ${selected.toString()}`;
  if (amount > 1) return `${amount.toString()} roles selected...`;
  return 'Select roles...';
};

const RoleFilter = ({ selected, setSelected }) => {
  const [label, setLabel] = useState(determineLabel([...roles]));
  const [availableRoles, setAvailableRoles] = useState([...roles]);

  const search = (query) => {
    const available = query
      ? roles.filter((role) => role.toLowerCase().includes(query.toLowerCase()))
      : [...roles];
    setAvailableRoles(available);
  };

  const select = (role) => setSelected([...selected, role]);

  const deselect = (role) => {
    const newSelected = [...selected];
    const deselectedItemIndex = newSelected.indexOf(role);
    if (deselectedItemIndex > -1) newSelected.splice(deselectedItemIndex, 1);
    setSelected(newSelected);
  };

  useEffect(() => {
    const newLabel = determineLabel(selected);
    setLabel(newLabel);
  }, [selected]);

  return (
    <SelectMenu
      isMultiSelect
      hasTitle={false}
      onFilterChange={search}
      options={availableRoles.map((role) => ({
        label: role,
        value: role
      }))}
      selected={selected}
      onSelect={(r) => select(r.value)}
      onDeselect={(r) => deselect(r.value)}
      height={360}
      filterPlaceholder="Search roles..."
      position={Position.TOP_RIGHT}
      width={200}
    >
      <Button width="70%">{label}</Button>
    </SelectMenu>
  );
};

RoleFilter.propTypes = {
  selected: PropTypes.arrayOf(PropTypes.string).isRequired,
  setSelected: PropTypes.func.isRequired
};

export default RoleFilter;
