import { useEffect } from 'react';

function User({ match }) {
  useEffect(() => {
    console.log('match: ', match);
  }, [match]);
  return 'user';
}

export default User;
