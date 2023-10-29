function remove_element(members, str) {
  const indexToDelete = members.indexOf(str);
  if (indexToDelete !== -1) {
    members.splice(indexToDelete, 1);
  }
}