import React, { useEffect } from 'react';

function User({ match }) {
  useEffect(() => {
    console.log('match: ', match);
  }, []);
  return 'user';
}

export default User;
