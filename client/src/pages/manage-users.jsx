import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Table, Select } from 'evergreen-ui';
import { useAuth } from '@/services';
import { User } from '@/models';
import { db } from '@/firebase';
import { sortByRole } from '@/util';

import styles from '../assets/styles/user-management.module.css';

export default function UserManagement() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsubscribe = db.collection('users').onSnapshot((snapshot) => {
      const data = snapshot.docChanges();
      const newUsers = {};
      data.forEach((change) => {
        const updated = change.doc.data();
        if (currentUser.id !== updated.uid) {
          newUsers[updated.uid] = new User(updated);
        }
      });
      setUsers((u) => ({ ...u, ...newUsers }));
    });
    return unsubscribe;
  }, [currentUser.id]);

  useEffect(() => {
    if (!currentUser || !currentUser.isAdmin) {
      router.push('/');
    }
  }, [currentUser]);

  const doSearch = (value) => setSearchQuery(value);

  const setRole = (id, val) => {
    const roles = {
      admin: val === 'admin',
      pending: val === 'pending'
    };
    db.collection('users')
      .doc(id)
      .update({ ...roles });
  };

  const renderUser = (user) => {
    return (
      <Table.Row key={user.uid}>
        <Table.TextCell>{user.name}</Table.TextCell>
        <Table.TextCell>{user.email}</Table.TextCell>
        <Table.TextCell>
          <Select
            width="100%"
            defaultValue={user.role}
            onChange={(e) => setRole(user.uid, e.currentTarget.value)}
          >
            <option value="admin">Administrator</option>
            <option value="coach">Coach</option>
            <option value="pending">Disabled</option>
          </Select>
        </Table.TextCell>
      </Table.Row>
    );
  };
  const filteredUsers = Object.keys(users)
    .filter((id) => users[id].name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((id1, id2) => sortByRole(users[id1], users[id2]));

  const renderUsers = () => {
    const $users = filteredUsers.map((id) => renderUser(users[id]));
    return (
      <Table>
        <Table.Head>
          <Table.SearchHeaderCell onChange={doSearch} placeholder="Search names..." />
          <Table.TextHeaderCell>Email</Table.TextHeaderCell>
          <Table.TextHeaderCell>Account status</Table.TextHeaderCell>
        </Table.Head>
        <Table.Body>{$users}</Table.Body>
      </Table>
    );
  };

  if (!currentUser) {
    if (!currentUser.isAdmin) return <p />;
  }

  const $content = renderUsers();
  return (
    <div className="page-container">
      <main className={styles.module}>
        <h2>Manage users</h2>
        {$content}
      </main>
    </div>
  );
}
