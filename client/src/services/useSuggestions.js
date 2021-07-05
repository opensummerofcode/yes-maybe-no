import { useEffect } from 'react';
import create from 'zustand';
import { db } from '@/firebase';

const useStore = create((set, get) => ({
  suggestions: {},
  addSuggestion: (id, suggestion) => {
    const suggestions = get().suggestions || {};
    suggestions[id] = suggestion;
    // create new object so diffing doesn't happen shallowly
    set({ suggestions: { ...suggestions } });
  }
}));

export default function useSuggestions() {
  const { suggestions, addSuggestion } = useStore();

  useEffect(() => {
    return db.collection('suggestions').onSnapshot((snapshot) => {
      const data = snapshot.docChanges();
      data.forEach((suggestion) => {
        addSuggestion(suggestion.doc.id, suggestion.doc.data());
      });
    });
  }, []);

  return { suggestions };
}
