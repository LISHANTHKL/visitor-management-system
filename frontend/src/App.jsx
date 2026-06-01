import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes/index.jsx';
import { useAppDispatch } from './hooks/useAppDispatch.js';
import { useAppSelector } from './hooks/useAppSelector.js';
import { clearAuth, loadUser } from './store/authSlice.js';

const App = () => {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);

  useEffect(() => {
    if (token) {
      dispatch(loadUser());
    }
  }, [dispatch, token]);

  useEffect(() => {
    const handleUnauthorized = () => {
      dispatch(clearAuth());
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [dispatch]);

  return <RouterProvider router={router} />;
};

export default App;
