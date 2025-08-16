// Reusable Styles for DriveSmart App
import { StyleSheet } from 'react-native';
import { COLORS } from './colors';

export const COMMON_STYLES = StyleSheet.create({
  // Container Styles
  safeContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.background,
  },
  
  centeredContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: COLORS.background,
  },
  
  // Card Styles
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  
  largeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    margin: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  // Button Styles
  primaryButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  secondaryButton: {
    backgroundColor: 'transparent',
    borderColor: COLORS.accent,
    borderWidth: 2,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  iconButton: {
    backgroundColor: COLORS.surface,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // Text Styles
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  
  body: {
    fontSize: 16,
    color: COLORS.textPrimary,
    lineHeight: 24,
  },
  
  caption: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  
  accentText: {
    color: COLORS.accent,
    fontWeight: '600',
  },
  
  // Input Styles
  textInput: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginVertical: 8,
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
  },
  
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  
  // List Styles
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  
  // Quiz Specific Styles
  quizQuestion: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 16,
    lineHeight: 26,
  },
  
  quizOption: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 8,
    marginVertical: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  
  quizOptionSelected: {
    backgroundColor: COLORS.selected,
    borderColor: COLORS.info,
  },
  
  quizOptionCorrect: {
    backgroundColor: COLORS.correct,
    borderColor: COLORS.success,
  },
  
  quizOptionIncorrect: {
    backgroundColor: COLORS.incorrect,
    borderColor: COLORS.error,
  },
  
  // Progress Styles
  progressBar: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 4,
  },
  
  // Chat Styles
  chatMessage: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
  },
  
  userMessage: {
    backgroundColor: COLORS.userMessage,
    alignSelf: 'flex-end',
  },
  
  aiMessage: {
    backgroundColor: COLORS.aiMessage,
    alignSelf: 'flex-start',
  },
  
  // Status Styles
  successBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  errorBadge: {
    backgroundColor: COLORS.error,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  warningBadge: {
    backgroundColor: COLORS.warning,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  // Spacing Utilities
  marginSmall: { margin: 8 },
  marginMedium: { margin: 16 },
  marginLarge: { margin: 24 },
  
  paddingSmall: { padding: 8 },
  paddingMedium: { padding: 16 },
  paddingLarge: { padding: 24 },
  
  // Layout Utilities
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  column: {
    flexDirection: 'column',
  },
  
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  spaceBetween: {
    justifyContent: 'space-between',
  },
  
  flex1: { flex: 1 },
  
  // Shadow Utilities
  shadow: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  
  lightShadow: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});
