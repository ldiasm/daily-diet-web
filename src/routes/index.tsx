import { Routes as RouterRoutes, Route, Navigate, Outlet } from 'react-router-dom';
import { PrivateRoute } from '../components/PrivateRoute';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Meals from '../pages/Meals';
import Profile from '../pages/Profile';
import NotFound from '../pages/NotFound';

export function Routes() {
  return (
    <RouterRoutes>
      <Route path="/login" element={<Login />} />

      <Route element={<PrivateRoute><Outlet /></PrivateRoute>}>
        <Route index element={<Home />} />
        <Route path="meals" element={<Meals />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </RouterRoutes>
  );
}
