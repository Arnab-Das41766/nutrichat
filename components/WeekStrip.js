import React, { useRef, useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Animated,
} from 'react-native';
import { COLORS, RADIUS } from '../utils/theme';
import { formatDateStr, getDayLabel, getDateNum } from '../utils/storage';

const DAY_WIDTH = 52;
const DAY_MARGIN = 6;

export default function WeekStrip({ selectedDate, onSelectDate, loggedDays = {} }) {
  const today = new Date();
  const scrollRef = useRef(null);

  // Generate 60 days: 30 past + today + 29 future
  const allDates = [];
  for (let i = -30; i <= 29; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    allDates.push(d);
  }

  const todayStr = formatDateStr(today);
  const selectedStr = formatDateStr(selectedDate);

  // Scroll to selected date on mount / change
  useEffect(() => {
    const idx = allDates.findIndex(d => formatDateStr(d) === selectedStr);
    if (idx !== -1 && scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          x: idx * (DAY_WIDTH + DAY_MARGIN * 2) - 120,
          animated: true,
        });
      }, 100);
    }
  }, [selectedStr]);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
      >
        {allDates.map((date) => {
          const dateStr = formatDateStr(date);
          const isSelected = dateStr === selectedStr;
          const isToday = dateStr === todayStr;
          const hasLog = loggedDays[dateStr];
          const isFuture = date > today && dateStr !== todayStr;

          return (
            <TouchableOpacity
              key={dateStr}
              onPress={() => !isFuture && onSelectDate(date)}
              activeOpacity={isFuture ? 1 : 0.7}
              style={[
                styles.dayPill,
                isSelected && styles.dayPillSelected,
                hasLog && !isSelected && styles.dayPillLogged,
                isFuture && styles.dayPillFuture,
              ]}
            >
              <Text style={[
                styles.dayLabel,
                isSelected && styles.dayLabelSelected,
                isFuture && styles.dayLabelFuture,
              ]}>
                {getDayLabel(date)}
              </Text>
              <Text style={[
                styles.dayNum,
                isSelected && styles.dayNumSelected,
                isFuture && styles.dayNumFuture,
              ]}>
                {getDateNum(date)}
              </Text>
              {hasLog && (
                <View style={[styles.dot, isSelected && styles.dotSelected]} />
              )}
              {isToday && !isSelected && (
                <View style={styles.todayIndicator} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  dayPill: {
    width: DAY_WIDTH,
    marginHorizontal: DAY_MARGIN,
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dayPillSelected: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  dayPillLogged: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentDim,
  },
  dayPillFuture: {
    opacity: 0.3,
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  dayLabelSelected: {
    color: COLORS.bg,
  },
  dayLabelFuture: {
    color: COLORS.textDim,
  },
  dayNum: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  dayNumSelected: {
    color: COLORS.bg,
  },
  dayNumFuture: {
    color: COLORS.textDim,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.accent,
    marginTop: 4,
  },
  dotSelected: {
    backgroundColor: COLORS.bg,
  },
  todayIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.accentCal,
  },
});
