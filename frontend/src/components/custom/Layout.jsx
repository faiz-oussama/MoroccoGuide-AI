import { useAuth } from '@/auth/AuthProvider';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { Outlet } from 'react-router-dom';
import Header from "../custom/Header";

export default function Layout() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}