import { useContext } from 'react';
import { DbContext } from '../context/DbContext';

export const useDb = () => {
  const context = useContext(DbContext);
  if (context === undefined) {
    throw new Error('useDb must be used within a DbProvider');
  }
  return context;
};