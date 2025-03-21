import { createContext, useContext, useState, ReactNode } from 'react';

interface UserContextType {
  address: string;
  username: string;
  setUserDetails: (address: string, username: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string>('');
  const [username, setUsername] = useState<string>('');

  const setUserDetails = (newAddress: string, newUsername: string) => {
    setAddress(newAddress);
    setUsername(newUsername);
  };

  return (
    <UserContext.Provider value={{ address, username, setUserDetails }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 