import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
  Keyboard, SafeAreaView,
} from 'react-native';

import WeekStrip from '../components/WeekStrip';
import CalorieDashboard from '../components/CalorieDashboard';
import MessageBubble from '../components/MessageBubble';
import SettingsScreen from '../components/SettingsScreen';
import { COLORS, RADIUS } from '../utils/theme';
import {
  getTodayStr, formatDateStr, getDayData, addMessage,
  getSettings, getDaysWithLogs, getMonthDates,
} from '../utils/storage';
import { sendToGroq } from '../utils/groq';

const EMPTY_TOTALS = { calories: 0, protein: 0, carbs: 0, fat: 0, burned: 0 };
const DEFAULT_SETTINGS = { calorieGoal: 1800, proteinGoal: 110, carbGoal: 175, fatGoal: 60, mode: 'cut' };

export default function HomeScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [messages, setMessages] = useState([]);
  const [totals, setTotals] = useState(EMPTY_TOTALS);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loggedDays, setLoggedDays] = useState({});
  const [showSettings, setShowSettings] = useState(false);
  const [dayLoading, setDayLoading] = useState(false);

  const flatListRef = useRef(null);
  const selectedDateStr = formatDateStr(selectedDate);
  const todayStr = getTodayStr();
  const isToday = selectedDateStr === todayStr;

  // Load settings on mount
  useEffect(() => {
    getSettings().then(setSettings);
    refreshLoggedDays();
  }, []);

  // Load day data when date changes
  useEffect(() => {
    setDayLoading(true);
    getDayData(selectedDateStr).then(data => {
      setMessages(data.messages || []);
      setTotals(data.totals || EMPTY_TOTALS);
      setDayLoading(false);
    });
  }, [selectedDateStr]);

  const refreshLoggedDays = async () => {
    // Check last 60 days for log indicators
    const today = new Date();
    const dates = [];
    for (let i = -30; i <= 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push(d);
    }
    const result = await getDaysWithLogs(dates);
    setLoggedDays(result);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    Keyboard.dismiss();

    // Add user message immediately
    const userMsg = { role: 'user', text, timestamp: new Date().toISOString() };
    const updatedDay1 = await addMessage(selectedDateStr, userMsg, null);
    setMessages([...updatedDay1.messages]);
    setTotals({ ...updatedDay1.totals });
    scrollToBottom();

    setLoading(true);
    try {
      const { reply, nutritionData } = await sendToGroq(updatedDay1.messages, text);

      const hasData = nutritionData.type !== 'none' &&
        (nutritionData.calories > 0 || nutritionData.burned > 0);

      const aiMsg = { role: 'assistant', text: reply, timestamp: new Date().toISOString() };
      const updatedDay2 = await addMessage(
        selectedDateStr,
        aiMsg,
        hasData ? nutritionData : null
      );

      setMessages([...updatedDay2.messages]);
      setTotals({ ...updatedDay2.totals });
      scrollToBottom();
      refreshLoggedDays();
    } catch (err) {
      const errMsg = {
        role: 'assistant',
        text: `Oops! Couldn't connect to AI. Check your Groq API key or internet. (${err.message})`,
        timestamp: new Date().toISOString(),
      };
      const updatedDay = await addMessage(selectedDateStr, errMsg, null);
      setMessages([...updatedDay.messages]);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = useCallback((date) => {
    setSelectedDate(date);
  }, []);

  const handleSettingsSave = (newSettings) => {
    setSettings(newSettings);
  };

  const renderMessage = ({ item }) => <MessageBubble message={item} />;

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>
        {isToday ? '🍽️' : '📅'}
      </Text>
      <Text style={styles.emptyTitle}>
        {isToday ? "What did you eat today?" : "No logs for this day"}
      </Text>
      <Text style={styles.emptySubtitle}>
        {isToday
          ? 'Tell me your meals or workouts.\nTry: "2 rotis with dal for lunch" or "walked 5km"'
          : 'Swipe to today to start logging.'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appName}>NutriChat</Text>
            <Text style={styles.headerSub}>
              {isToday ? "Today" : selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              {' · '}
              <Text style={[styles.modeTag, settings.mode === 'cut' ? { color: COLORS.accentCal } : settings.mode === 'bulk' ? { color: '#A78BFA' } : { color: COLORS.accent }]}>
                {settings.mode === 'cut' ? '✂️ Cutting' : settings.mode === 'bulk' ? '💪 Bulking' : '⚖️ Maintaining'}
              </Text>
            </Text>
          </View>
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => setShowSettings(true)}
          >
            <Text style={styles.settingsBtnText}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Week Strip */}
        <WeekStrip
          selectedDate={selectedDate}
          onSelectDate={handleDateSelect}
          loggedDays={loggedDays}
        />

        {/* Calorie Dashboard */}
        <CalorieDashboard totals={totals} settings={settings} />

        {/* Chat Area */}
        {dayLoading ? (
          <View style={styles.dayLoading}>
            <ActivityIndicator color={COLORS.accent} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item.id || item.timestamp}
            renderItem={renderMessage}
            ListEmptyComponent={EmptyState}
            contentContainerStyle={[
              styles.chatContent,
              messages.length === 0 && styles.chatContentEmpty,
            ]}
            onLayout={scrollToBottom}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Typing indicator */}
        {loading && (
          <View style={styles.typingContainer}>
            <View style={styles.typingBubble}>
              <ActivityIndicator size="small" color={COLORS.accent} />
              <Text style={styles.typingText}>Analyzing...</Text>
            </View>
          </View>
        )}

        {/* Input Bar — only show for today */}
        {isToday && (
          <View style={styles.inputBar}>
            <TextInput
              style={styles.textInput}
              value={input}
              onChangeText={setInput}
              placeholder="Log a meal or workout..."
              placeholderTextColor={COLORS.textDim}
              multiline
              maxLength={500}
              onSubmitEditing={handleSend}
              returnKeyType="send"
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={!input.trim() || loading}
            >
              <Text style={styles.sendBtnText}>↑</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isToday && (
          <View style={styles.pastDayBanner}>
            <Text style={styles.pastDayText}>📖 Viewing past day — read only</Text>
            <TouchableOpacity onPress={() => setSelectedDate(new Date())}>
              <Text style={styles.pastDayLink}>Go to Today</Text>
            </TouchableOpacity>
          </View>
        )}

      </KeyboardAvoidingView>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsScreen
          onClose={() => setShowSettings(false)}
          onSave={handleSettingsSave}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  appName: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  modeTag: {
    fontWeight: '700',
    fontSize: 12,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  settingsBtnText: {
    fontSize: 18,
  },
  dayLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatContent: {
    paddingVertical: 12,
    paddingBottom: 8,
  },
  chatContentEmpty: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 30,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  typingContainer: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.aiBubble,
    borderRadius: RADIUS.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: COLORS.aiBubbleBorder,
  },
  typingText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.bgInput,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    color: COLORS.textPrimary,
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 120,
    lineHeight: 20,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: COLORS.border,
  },
  sendBtnText: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.bg,
  },
  pastDayBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.bgCard,
  },
  pastDayText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  pastDayLink: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.accent,
  },
});
