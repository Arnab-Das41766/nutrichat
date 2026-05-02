import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert
} from 'react-native';
import { COLORS, RADIUS } from '../utils/theme';
import { getSettings, saveSettings } from '../utils/storage';

const MODES = [
  { key: 'cut', label: '✂️ Cutting', desc: 'Lose fat', cal: 1800, p: 110, c: 175, f: 60 },
  { key: 'maintain', label: '⚖️ Maintain', desc: 'Stay lean', cal: 2200, p: 100, c: 220, f: 70 },
  { key: 'bulk', label: '💪 Bulking', desc: 'Gain muscle', cal: 2700, p: 140, c: 300, f: 80 },
];

export default function SettingsScreen({ onClose, onSave }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSettings().then(s => {
      setSettings(s);
      setLoading(false);
    });
  }, []);

  const handleModeSelect = (mode) => {
    setSettings(prev => ({
      ...prev,
      mode: mode.key,
      calorieGoal: mode.cal,
      proteinGoal: mode.p,
      carbGoal: mode.c,
      fatGoal: mode.f,
    }));
  };

  const handleSave = async () => {
    await saveSettings(settings);
    onSave && onSave(settings);
    onClose && onClose();
  };

  if (loading || !settings) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.sheet}>
        <View style={styles.header}>
          <Text style={styles.title}>Goals & Settings</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Mode selector */}
          <Text style={styles.sectionLabel}>YOUR MODE</Text>
          <View style={styles.modeRow}>
            {MODES.map(mode => (
              <TouchableOpacity
                key={mode.key}
                onPress={() => handleModeSelect(mode)}
                style={[
                  styles.modeCard,
                  settings.mode === mode.key && styles.modeCardActive,
                ]}
              >
                <Text style={styles.modeEmoji}>{mode.label.split(' ')[0]}</Text>
                <Text style={[
                  styles.modeLabel,
                  settings.mode === mode.key && styles.modeLabelActive
                ]}>
                  {mode.label.split(' ').slice(1).join(' ')}
                </Text>
                <Text style={styles.modeDesc}>{mode.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Calorie goal */}
          <Text style={styles.sectionLabel}>DAILY CALORIE GOAL</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={String(settings.calorieGoal)}
              onChangeText={v => setSettings(p => ({ ...p, calorieGoal: Number(v) || 0 }))}
              keyboardType="numeric"
              placeholderTextColor={COLORS.textDim}
            />
            <Text style={styles.inputUnit}>kcal</Text>
          </View>

          {/* Macro goals */}
          <Text style={styles.sectionLabel}>MACRO GOALS</Text>

          <MacroInput
            label="🥩 Protein"
            value={settings.proteinGoal}
            onChange={v => setSettings(p => ({ ...p, proteinGoal: v }))}
            color="#A78BFA"
          />
          <MacroInput
            label="🍞 Carbs"
            value={settings.carbGoal}
            onChange={v => setSettings(p => ({ ...p, carbGoal: v }))}
            color={COLORS.accentCal}
          />
          <MacroInput
            label="🥑 Fat"
            value={settings.fatGoal}
            onChange={v => setSettings(p => ({ ...p, fatGoal: v }))}
            color={COLORS.accentBurn}
          />

          {/* Recommended note */}
          <View style={styles.noteBox}>
            <Text style={styles.noteText}>
              💡 Recommended for you (115kg, moderately active){'\n'}
              Cut: 1800 kcal • P:110g • C:175g • F:60g{'\n'}
              Maintain: 2200 kcal • P:100g • C:220g • F:70g{'\n'}
              Bulk: 2700 kcal • P:140g • C:300g • F:80g
            </Text>
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save Goals</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}

function MacroInput({ label, value, onChange, color }) {
  return (
    <View style={styles.macroInputRow}>
      <Text style={styles.macroInputLabel}>{label}</Text>
      <View style={[styles.inputRow, { flex: 1 }]}>
        <TextInput
          style={[styles.input, { flex: 1, borderColor: color + '40' }]}
          value={String(value)}
          onChangeText={v => onChange(Number(v) || 0)}
          keyboardType="numeric"
          placeholderTextColor={COLORS.textDim}
        />
        <Text style={[styles.inputUnit, { color }]}>g</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  sheet: {
    backgroundColor: COLORS.bgCard,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.bgInput,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 10,
    marginTop: 16,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modeCard: {
    flex: 1,
    backgroundColor: COLORS.bgInput,
    borderRadius: RADIUS.md,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modeCardActive: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentDim,
  },
  modeEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  modeLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  modeLabelActive: {
    color: COLORS.accent,
  },
  modeDesc: {
    fontSize: 10,
    color: COLORS.textDim,
    marginTop: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.bgInput,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    padding: 10,
    paddingHorizontal: 14,
  },
  inputUnit: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
    width: 32,
  },
  macroInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  macroInputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    width: 90,
  },
  noteBox: {
    backgroundColor: COLORS.bgInput,
    borderRadius: RADIUS.md,
    padding: 14,
    marginTop: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  noteText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  saveBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.pill,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.bg,
    letterSpacing: 0.5,
  },
});
