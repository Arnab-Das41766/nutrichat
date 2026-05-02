import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS } from '../utils/theme';

export default function CalorieDashboard({ totals, settings }) {
  const { calorieGoal } = settings;
  const consumed = Math.round(totals.calories || 0);
  const burned = Math.round(totals.burned || 0);
  const left = calorieGoal - consumed + burned;

  const consumedPct = Math.min((consumed / calorieGoal) * 100, 100);
  const burnedPct = Math.min((burned / calorieGoal) * 100, 100);

  const leftColor = left < 0 ? COLORS.danger : left < 200 ? COLORS.warning : COLORS.accent;

  return (
    <View style={styles.container}>
      {/* Main row: 3 boxes */}
      <View style={styles.row}>
        {/* Calories Left */}
        <View style={[styles.box, styles.boxMain, { borderColor: leftColor + '60' }]}>
          <Text style={styles.boxLabel}>REMAINING</Text>
          <Text style={[styles.boxValue, { color: leftColor }]}>
            {left < 0 ? '-' : ''}{Math.abs(left)}
          </Text>
          <Text style={styles.boxUnit}>kcal left</Text>
          {left < 0 && (
            <Text style={styles.overLabel}>OVER GOAL</Text>
          )}
        </View>

        {/* Right column: consumed + burned */}
        <View style={styles.rightCol}>
          {/* Consumed */}
          <View style={[styles.box, styles.boxSmall, { borderColor: COLORS.accentCal + '60' }]}>
            <Text style={styles.boxLabel}>CONSUMED</Text>
            <Text style={[styles.boxValue, styles.boxValueSm, { color: COLORS.accentCal }]}>
              {consumed}
            </Text>
            <View style={styles.progressBar}>
              <View style={[
                styles.progressFill,
                { width: `${consumedPct}%`, backgroundColor: COLORS.accentCal }
              ]} />
            </View>
          </View>

          {/* Burned */}
          <View style={[styles.box, styles.boxSmall, { borderColor: COLORS.accentBurn + '60' }]}>
            <Text style={styles.boxLabel}>BURNED</Text>
            <Text style={[styles.boxValue, styles.boxValueSm, { color: COLORS.accentBurn }]}>
              {burned}
            </Text>
            <View style={styles.progressBar}>
              <View style={[
                styles.progressFill,
                { width: `${burnedPct}%`, backgroundColor: COLORS.accentBurn }
              ]} />
            </View>
          </View>
        </View>
      </View>

      {/* Macro row */}
      <View style={styles.macroRow}>
        <MacroBar
          label="Protein"
          current={Math.round(totals.protein || 0)}
          goal={settings.proteinGoal}
          color="#A78BFA"
          unit="g"
        />
        <MacroBar
          label="Carbs"
          current={Math.round(totals.carbs || 0)}
          goal={settings.carbGoal}
          color={COLORS.accentCal}
          unit="g"
        />
        <MacroBar
          label="Fat"
          current={Math.round(totals.fat || 0)}
          goal={settings.fatGoal}
          color={COLORS.accentBurn}
          unit="g"
        />
      </View>
    </View>
  );
}

function MacroBar({ label, current, goal, color, unit }) {
  const pct = Math.min((current / goal) * 100, 100);
  const over = current > goal;
  return (
    <View style={styles.macroItem}>
      <View style={styles.macroHeader}>
        <Text style={styles.macroLabel}>{label}</Text>
        <Text style={[styles.macroValue, { color: over ? COLORS.danger : color }]}>
          {current}<Text style={styles.macroGoal}>/{goal}{unit}</Text>
        </Text>
      </View>
      <View style={styles.macroBar}>
        <View style={[
          styles.macroFill,
          { width: `${pct}%`, backgroundColor: over ? COLORS.danger : color }
        ]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  box: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    padding: 12,
    borderWidth: 1,
  },
  boxMain: {
    flex: 1.1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 100,
  },
  rightCol: {
    flex: 1,
    gap: 8,
  },
  boxSmall: {
    flex: 1,
  },
  boxLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  boxValue: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.textPrimary,
    lineHeight: 36,
  },
  boxValueSm: {
    fontSize: 22,
    lineHeight: 26,
  },
  boxUnit: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  overLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.danger,
    letterSpacing: 1,
    marginTop: 4,
  },
  progressBar: {
    height: 3,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    marginTop: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  // Macros
  macroRow: {
    flexDirection: 'row',
    gap: 10,
  },
  macroItem: {
    flex: 1,
  },
  macroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    alignItems: 'baseline',
  },
  macroLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  macroValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  macroGoal: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '400',
  },
  macroBar: {
    height: 5,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  macroFill: {
    height: '100%',
    borderRadius: 3,
  },
});
