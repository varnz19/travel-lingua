import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { TravelTheme } from '../constants/TravelTheme';

const T = TravelTheme.colors;

interface BoardingPassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  hasNotch?: boolean;
  notchPosition?: 'left' | 'right' | 'both';
  cutoutColor?: string;
  hasPerforation?: boolean;
}

export function BoardingPassCard({
  children,
  style,
  hasNotch = true,
  notchPosition = 'left',
  cutoutColor = T.paper,
  hasPerforation = false,
}: BoardingPassCardProps) {
  return (
    <View style={[styles.card, style]}>
      {hasNotch && (notchPosition === 'left' || notchPosition === 'both') && (
        <View style={[styles.notchLeft, { backgroundColor: cutoutColor }]} />
      )}
      {hasNotch && (notchPosition === 'right' || notchPosition === 'both') && (
        <View style={[styles.notchRight, { backgroundColor: cutoutColor }]} />
      )}
      {hasPerforation && <View style={styles.perforationLine} />}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: T.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: T.sandLine,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
    ...TravelTheme.shadows.resting,
  },
  notchLeft: {
    position: 'absolute',
    left: -10,
    top: '50%',
    marginTop: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: T.sandLine,
    zIndex: 10,
  },
  notchRight: {
    position: 'absolute',
    right: -10,
    top: '50%',
    marginTop: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: T.sandLine,
    zIndex: 10,
  },
  perforationLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 80,
    width: 1,
    borderWidth: 1,
    borderColor: T.sandLine,
    borderStyle: 'dashed',
    zIndex: 5,
  }
});
