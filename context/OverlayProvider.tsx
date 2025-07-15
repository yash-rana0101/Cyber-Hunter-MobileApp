import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface OverlayContextType {
  showOverlay: (content: ReactNode, position: { x: number; y: number; width: number }) => void;
  hideOverlay: () => void;
}

const OverlayContext = createContext<OverlayContextType | undefined>(undefined);

export const useOverlay = () => {
  const context = useContext(OverlayContext);
  if (!context) {
    throw new Error('useOverlay must be used within an OverlayProvider');
  }
  return context;
};

interface OverlayProviderProps {
  children: ReactNode;
}

export const OverlayProvider: React.FC<OverlayProviderProps> = ({ children }) => {
  const [overlayContent, setOverlayContent] = useState<ReactNode>(null);
  const [position, setPosition] = useState({ x: 0, y: 0, width: 0 });
  const [visible, setVisible] = useState(false);

  const showOverlay = useCallback((content: ReactNode, pos: { x: number; y: number; width: number }) => {
    setOverlayContent(content);
    setPosition(pos);
    setVisible(true);
  }, []);

  const hideOverlay = useCallback(() => {
    setVisible(false);
    setOverlayContent(null);
  }, []);

  return (
    <OverlayContext.Provider value={{ showOverlay, hideOverlay }}>
      {children}
      {visible && (
        <View style={styles.overlay} pointerEvents="box-none">
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            onPress={hideOverlay}
            activeOpacity={1}
          />
          <View
            style={[
              styles.overlayContent,
              {
                position: 'absolute',
                top: position.y,
                left: position.x,
                width: position.width,
              },
            ]}
            pointerEvents="box-none"
          >
            {overlayContent}
          </View>
        </View>
      )}
    </OverlayContext.Provider>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999999,
    elevation: 999999,
  },
  overlayContent: {
    backgroundColor: '#000000',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.5)',
    maxHeight: 180,
    shadowColor: '#22d3ee',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 999999,
    pointerEvents: 'auto',
  },
});
