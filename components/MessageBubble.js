import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS } from '../utils/theme';

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  const { data } = message;

  const hasMealData = data && data.type === 'meal' && data.calories > 0;
  const hasExerciseData = data && data.type === 'exercise' && data.burned > 0;

  const time = new Date(message.timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true
  });

  return (
    <View style={[styles.container, isUser ? styles.containerUser : styles.containerAI]}>
      <View style={[
        styles.bubble,
        isUser ? styles.bubbleUser : styles.bubbleAI,
      ]}>
        <Text style={[styles.text, isUser ? styles.textUser : styles.textAI]}>
          {message.text}
        </Text>

        {/* Nutrition tag for meals */}
        {hasMealData && (
          <View style={styles.dataTag}>
            <View style={styles.dataRow}>
              <DataPill label="CAL" value={data.calories} color={COLORS.accentCal} />
              <DataPill label="PRO" value={`${data.protein}g`} color="#A78BFA" />
              <DataPill label="CARB" value={`${data.carbs}g`} color={COLORS.accent} />
              <DataPill label="FAT" value={`${data.fat}g`} color={COLORS.accentBurn} />
            </View>
          </View>
        )}

        {/* Burn tag for exercise */}
        {hasExerciseData && (
          <View style={[styles.dataTag, styles.dataTagBurn]}>
            <View style={styles.dataRow}>
              <Text style={styles.burnIcon}>🔥</Text>
              <Text style={styles.burnText}>{data.burned} kcal burned</Text>
            </View>
          </View>
        )}

        <Text style={styles.timestamp}>{time}</Text>
      </View>
    </View>
  );
}

function DataPill({ label, value, color }) {
  return (
    <View style={styles.pill}>
      <Text style={[styles.pillLabel, { color }]}>{label}</Text>
      <Text style={styles.pillValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    marginHorizontal: 16,
  },
  containerUser: {
    alignItems: 'flex-end',
  },
  containerAI: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: RADIUS.lg,
    padding: 12,
    paddingHorizontal: 14,
  },
  bubbleUser: {
    backgroundColor: COLORS.userBubble,
    borderWidth: 1,
    borderColor: COLORS.userBubbleBorder,
    borderBottomRightRadius: 4,
  },
  bubbleAI: {
    backgroundColor: COLORS.aiBubble,
    borderWidth: 1,
    borderColor: COLORS.aiBubbleBorder,
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
  },
  textUser: {
    color: COLORS.textPrimary,
  },
  textAI: {
    color: COLORS.textPrimary,
  },
  timestamp: {
    fontSize: 10,
    color: COLORS.textDim,
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  dataTag: {
    marginTop: 8,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.sm,
    padding: 8,
    borderWidth: 1,
    borderColor: COLORS.accentCal + '40',
  },
  dataTagBurn: {
    borderColor: COLORS.accentBurn + '40',
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  pill: {
    alignItems: 'center',
  },
  pillLabel: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  pillValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  burnIcon: {
    fontSize: 14,
  },
  burnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.accentBurn,
  },
});
