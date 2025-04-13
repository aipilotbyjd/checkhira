
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
    setTranslations({
      ...props.translations,
      onClose: () => {
        hideRatingDialog();
        props.onClose?.();
      },
      onRate: async () => {
        hideRatingDialog();
        await props.onRate?.();
      }
    });
    setIsVisible(true);
  };

  const hideRatingDialog = () => {
    setIsVisible(false);
  };

  // Set global handler on mount
  useEffect(() => {
    global.showRatingDialog = showRatingDialog;
  }, []);

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
