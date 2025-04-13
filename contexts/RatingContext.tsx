
import React, { createContext, useContext, useState } from 'react';
import { RatingDialog } from '../components/RatingDialog';

interface RatingContextType {
  showRatingDialog: (translations: any) => void;
  hideRatingDialog: () => void;
}

const RatingContext = createContext<RatingContextType>({} as RatingContextType);

declare global {
  var showRatingDialog: (props: any) => void;
}

export const RatingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [translations, setTranslations] = useState<any>(null);

  const showRatingDialog = (props: any) => {
    setTranslations(props.translations);
    setIsVisible(true);
    global.showRatingDialog = showRatingDialog;
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
