const roleWeighting = {
  admin: 3,
  coach: 2,
  pending: 1
};

export default (u1, u2) => {
  if (roleWeighting[u1.role] < roleWeighting[u2.role]) return 1;
  if (roleWeighting[u2.role] > roleWeighting[u1.role]) return -1;
  // sort alphabetically if roles are the same
  if (roleWeighting[u1.role] === roleWeighting[u2.role]) return u1.name > u2.name ? 1 : -1;
  return 0;
};
