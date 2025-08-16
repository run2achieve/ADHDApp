# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an ADHD Self-Rating Scale mobile application built with React Native and Expo. The app implements the ASRS-v1.1 (Adult ADHD Self-Report Scale) assessment tool developed by the World Health Organization (WHO). The app guides users through an 18-question assessment and provides screening results with appropriate disclaimers.

## Architecture

- **Single-page React Native app**: The entire application is contained in `App.js` as the main component `ADHDSelfRatingScreen`
- **Entry point**: `index.js` registers the main App component using Expo's `registerRootComponent`
- **State management**: Uses React hooks (useState, useEffect) for local state management
- **Data persistence**: Uses AsyncStorage for saving user progress locally
- **UI framework**: React Native with custom StyleSheet-based styling

### Key Application Features

- 18 ASRS-v1.1 questions with 5-point Likert scale responses
- Progress tracking with automatic save/restore functionality  
- Screener scoring algorithm (first 6 questions have specific thresholds)
- Results calculation with inattention/hyperactivity subscores
- Professional disclaimer and WHO citation
- Ad placeholder spaces for monetization

## Development Commands

```bash
# Start development server
npm start
# or
expo start

# Run on specific platforms
npm run android    # Android device/emulator
npm run ios        # iOS device/simulator  
npm run web        # Web browser

# Build commands (via EAS)
eas build --platform android    # Android build
eas build --platform ios        # iOS build
eas build --platform all        # Both platforms
```

## Key Dependencies

- **expo**: Expo SDK (~53.0.20)
- **react-native**: Core framework (0.79.5)
- **@react-native-async-storage/async-storage**: Local data persistence
- **@expo/vector-icons**: Ionicons for UI elements
- **react-native-google-mobile-ads**: For ad monetization (placeholder spaces currently)

## Code Structure

The main App.js contains:
- Question data array with ASRS-v1.1 questions, categories, and screener flags
- Response options with color-coded severity levels
- Progress save/load functions using AsyncStorage keys
- Scoring algorithm implementing ASRS screener thresholds
- Results calculation for screener, inattention, and hyperactivity scores
- Comprehensive styling with responsive design

## Important Implementation Notes

- The app implements the WHO ASRS-v1.1 with proper attribution and citations
- Screener questions (first 6) have specific scoring thresholds: [2,2,2,2,3,3]
- Results include professional disclaimers emphasizing this is not a diagnostic tool
- Progress is automatically saved and restored within 24-hour window
- Ad placeholder spaces are included for future monetization