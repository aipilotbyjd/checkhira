
import React, { createContext, useContext, useState } from 'react';
import { RatingDialog } from '../components/RatingDialog';

interface RatingContextType {
  showRatingDialog: (translations: any) => void;
  hideRatingDialog: () => void;
}

const RatingContext = createContext<RatingContextType>({} as RatingContextType);

export function RatingProvider({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const [translations, setTranslations] = useState<any>(null);

  const showRatingDialog = (newTranslations: any) => {
    setTranslations(newTranslations);
    setIsVisible(true);
  };

  const hideRatingDialog = () => {
    setIsVisible(false);
  };

  return (
    <RatingContext.Provider value={{ showRatingDialog, hideRatingDialog }}>
      {children}
      {translations && (
        <RatingDialog
          visible={isVisible}
          translations={translations}
          onClose={hideRatingDialog}
          onRate={hideRatingDialog}
        />
      )}
    </RatingContext.Provider>
  );
}

export const useRating = () => useContext(RatingContext);
