import { Navigate } from 'react-router-dom';
import Header from './Header';

function ProtectedRoute({ children }) {
  const user = localStorage.getItem('user');

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Header />
      <div className="container">
        {children}
      </div>
    </>
  );
}

export default ProtectedRoute;
