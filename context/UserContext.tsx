// Redirecting legacy UserContext to AuthContext to unify state management and fix missing method errors
import { useAuth, AuthProvider } from './AuthContext';

export const useUser = useAuth;
export const UserProvider = AuthProvider;
