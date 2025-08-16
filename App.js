import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  SafeAreaView,
  Alert,
  StatusBar 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function ADHDSelfRatingScreen() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  // ASRS-v1.1 Questions
  const questions = [
    {
      id: 1,
      text: "How often do you have trouble wrapping up the final details of a project, once the challenging parts have been done?",
      category: "inattention",
      isScreener: true
    },
    {
      id: 2,
      text: "How often do you have difficulty getting things in order when you have to do a task that requires organization?",
      category: "inattention",
      isScreener: true
    },
    {
      id: 3,
      text: "How often do you have problems remembering appointments or obligations?",
      category: "inattention",
      isScreener: true
    },
    {
      id: 4,
      text: "When you have a task that requires a lot of thought, how often do you avoid or delay getting started?",
      category: "inattention",
      isScreener: true
    },
    {
      id: 5,
      text: "How often do you fidget or squirm with your hands or feet when you have to sit down for a long time?",
      category: "hyperactivity",
      isScreener: true
    },
    {
      id: 6,
      text: "How often do you feel overly active and compelled to do things, like you were driven by a motor?",
      category: "hyperactivity",
      isScreener: true
    },
    {
      id: 7,
      text: "How often do you make careless mistakes when you have to work on a boring or difficult project?",
      category: "inattention",
      isScreener: false
    },
    {
      id: 8,
      text: "How often do you have difficulty keeping your attention when you are doing boring or repetitive work?",
      category: "inattention",
      isScreener: false
    },
    {
      id: 9,
      text: "How often do you have difficulty concentrating on what people say to you, even when they are speaking to you directly?",
      category: "inattention",
      isScreener: false
    },
    {
      id: 10,
      text: "How often do you misplace or have difficulty finding things at home or at work?",
      category: "inattention",
      isScreener: false
    },
    {
      id: 11,
      text: "How often are you distracted by activity or noise around you?",
      category: "inattention",
      isScreener: false
    },
    {
      id: 12,
      text: "How often do you leave your seat in meetings or other situations where you are expected to remain seated?",
      category: "hyperactivity",
      isScreener: false
    },
    {
      id: 13,
      text: "How often do you feel restless or fidgety?",
      category: "hyperactivity",
      isScreener: false
    },
    {
      id: 14,
      text: "How often do you have difficulty unwinding and relaxing when you have time to yourself?",
      category: "hyperactivity",
      isScreener: false
    },
    {
      id: 15,
      text: "How often do you find yourself talking too much when you are in social situations?",
      category: "hyperactivity",
      isScreener: false
    },
    {
      id: 16,
      text: "When you're in a conversation, how often do you find yourself finishing the sentences of the people you are talking to, before they can finish them themselves?",
      category: "hyperactivity",
      isScreener: false
    },
    {
      id: 17,
      text: "How often do you have difficulty waiting your turn in situations when turn taking is required?",
      category: "hyperactivity",
      isScreener: false
    },
    {
      id: 18,
      text: "How often do you interrupt others when they are busy?",
      category: "hyperactivity",
      isScreener: false
    }
  ];

  const responseOptions = [
    { value: 0, label: 'Never', color: '#22c55e' },
    { value: 1, label: 'Rarely', color: '#3b82f6' },
    { value: 2, label: 'Sometimes', color: '#eab308' },
    { value: 3, label: 'Often', color: '#f97316' },
    { value: 4, label: 'Very Often', color: '#ef4444' }
  ];

  // Save progress to device storage
  const saveProgress = async () => {
    try {
      await AsyncStorage.setItem('@ADHD_Progress', JSON.stringify({
        currentQuestion,
        answers,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.log('Error saving progress:', error);
    }
  };

  // Load previous progress
  const loadProgress = async () => {
    try {
      const saved = await AsyncStorage.getItem('@ADHD_Progress');
      if (saved) {
        const { currentQuestion: savedQ, answers: savedA, timestamp } = JSON.parse(saved);
        // Only load if saved within last 24 hours
        if (Date.now() - timestamp < 86400000) {
          setCurrentQuestion(savedQ);
          setAnswers(savedA);
        }
      }
    } catch (error) {
      console.log('Error loading progress:', error);
    }
  };

  useEffect(() => {
    loadProgress();
  }, []);

  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      saveProgress();
    }
  }, [answers, currentQuestion]);

  const handleAnswer = (value) => {
    setAnswers({ ...answers, [questions[currentQuestion].id]: value });
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const resetTest = () => {
    Alert.alert(
      "Reset Assessment",
      "Are you sure you want to start over? All progress will be lost.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Reset", 
          style: "destructive",
          onPress: () => {
            setCurrentQuestion(0);
            setAnswers({});
            setShowResults(false);
            AsyncStorage.removeItem('@ADHD_Progress');
          }
        }
      ]
    );
  };

  const calculateResults = () => {
    const screenerThresholds = [2, 2, 2, 2, 3, 3];
    let screenerPositive = 0;
    
    for (let i = 0; i < 6; i++) {
      const questionId = i + 1;
      const answer = answers[questionId] || 0;
      if (answer >= screenerThresholds[i]) {
        screenerPositive++;
      }
    }

    const inattentionQuestions = [1, 2, 3, 4, 7, 8, 9, 10, 11];
    const hyperactivityQuestions = [5, 6, 12, 13, 14, 15, 16, 17, 18];

    const inattentionScore = inattentionQuestions.reduce((sum, qId) => sum + (answers[qId] || 0), 0);
    const hyperactivityScore = hyperactivityQuestions.reduce((sum, qId) => sum + (answers[qId] || 0), 0);
    const totalScore = inattentionScore + hyperactivityScore;

    return {
      screenerPositive: screenerPositive >= 4,
      screenerScore: screenerPositive,
      inattentionScore,
      hyperactivityScore,
      totalScore,
      maxScore: 72,
      answeredQuestions: Object.keys(answers).length
    };
  };

  // Results Screen Component
  if (showResults) {
    const results = calculateResults();
    
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#3b82f6" />
        
        {/* Top Banner Space */}
        <View style={styles.topAdSpace}>
          <Text style={styles.adPlaceholder}>Banner Space (320x50)</Text>
        </View>
        
        <ScrollView style={styles.scrollView}>
          <View style={styles.headerGradient}>
            <Text style={styles.headerTitle}>ASRS-v1.1 Results</Text>
            <Text style={styles.headerSubtitle}>Your ADHD Self-Rating Scale Assessment</Text>
          </View>

          <View style={styles.resultsContainer}>
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Ionicons name="document-text" size={24} color="#3b82f6" />
                <Text style={styles.summaryTitle}>Assessment Summary</Text>
              </View>
              
              <View style={styles.scoreGrid}>
                <View style={styles.scoreBox}>
                  <Text style={[styles.scoreNumber, {color: '#3b82f6'}]}>
                    {results.screenerScore}/6
                  </Text>
                  <Text style={styles.scoreLabel}>Screener Score</Text>
                </View>
                <View style={styles.scoreBox}>
                  <Text style={[styles.scoreNumber, {color: '#8b5cf6'}]}>
                    {results.totalScore}/72
                  </Text>
                  <Text style={styles.scoreLabel}>Total Score</Text>
                </View>
              </View>
            </View>

            <View style={[styles.resultCard, results.screenerPositive ? styles.positiveResult : styles.negativeResult]}>
              <Text style={styles.resultTitle}>
                {results.screenerPositive ? '⚠️ Screener Positive' : '✅ Screener Negative'}
              </Text>
              <Text style={styles.resultText}>
                {results.screenerPositive 
                  ? 'Your responses suggest symptoms consistent with ADHD. This screening tool indicates you may benefit from a comprehensive evaluation by a qualified healthcare professional.'
                  : 'Your responses suggest symptoms are less consistent with ADHD. However, this is a screening tool and not a diagnostic instrument.'
                }
              </Text>
              <View style={styles.disclaimer}>
                <Text style={styles.disclaimerText}>
                  <Text style={styles.disclaimerBold}>Important:</Text> This assessment is not a substitute for professional diagnosis. 
                  If you have concerns about ADHD symptoms, please consult with a healthcare provider.
                </Text>
              </View>

              {/* Citation and Attribution */}
              <View style={styles.citationCard}>
                <Text style={styles.citationTitle}>Assessment Citation</Text>
                <Text style={styles.citationText}>
                  <Text style={styles.citationBold}>ASRS-v1.1:</Text> Adult ADHD Self-Report Scale (ASRS-v1.1) Screener and Symptoms Checklist
                </Text>
                <Text style={styles.citationText}>
                  <Text style={styles.citationBold}>Source:</Text> The ASRS v1.1 Screener is a tool developed by the World Health Organization (WHO) in collaboration with the Workgroup on Adult ADHD, and is used here under appropriate acknowledgment.
                </Text>
                <Text style={styles.citationText}>
                  <Text style={styles.citationBold}>Reference:</Text> Kessler, R. C., Adler, L., Ames, M., et al. (2005). The World Health Organization Adult ADHD Self-Report Scale (ASRS): a short screening scale for use in the general population. Psychological Medicine, 35(2), 245-256.
                </Text>
                <Text style={styles.citationText}>
                  <Text style={styles.citationBold}></Text> 
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.resetButton} onPress={resetTest}>
              <Ionicons name="refresh" size={20} color="white" style={styles.buttonIcon} />
              <Text style={styles.resetButtonText}>Take Assessment Again</Text>
            </TouchableOpacity>

            {/* Placeholder - shown between results sections */}
            <View style={styles.interstitialAdSpace}>
              <Text style={styles.adPlaceholder}>Placeholder Space</Text>
              <Text style={styles.adSubtext}>300x250 or Full Screen</Text>
            </View>
          </View>

          {/* Bottom Banner Space */}
          <View style={styles.bottomAdSpace}>
            <Text style={styles.adPlaceholder}>Banner Space (320x50)</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Question Screen
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3b82f6" />
      
      {/* Top Banner Space */}
      <View style={styles.topAdSpace}>
        <Text style={styles.adPlaceholder}>Banner Space (320x50)</Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.headerGradient}>
          <Text style={styles.headerTitle}>ADHD Self-Rating Scale</Text>
          <Text style={styles.headerSubtitle}>ASRS-v1.1 Assessment</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressText}>
                Question {currentQuestion + 1} of {questions.length}
              </Text>
              <Text style={styles.progressText}>{Math.round(progress)}% Complete</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${progress}%` }]} />
            </View>
          </View>
        </View>

        <View style={styles.questionContainer}>
          {currentQ.isScreener && (
            <View style={styles.screenerBadge}>
              <Text style={styles.screenerText}>🔍 Screener Question</Text>
            </View>
          )}
          
          <Text style={styles.questionText}>{currentQ.text}</Text>

          <View style={styles.optionsContainer}>
            {responseOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  answers[currentQ.id] === option.value && styles.selectedOption
                ]}
                onPress={() => handleAnswer(option.value)}
              >
                <Text style={[
                  styles.optionLabel,
                  answers[currentQ.id] === option.value && styles.selectedOptionText
                ]}>
                  {option.label}
                </Text>
                <View style={[styles.optionScore, { backgroundColor: option.color }]}>
                  <Text style={styles.optionScoreText}>{option.value}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={[styles.navButton, styles.prevButton, currentQuestion === 0 && styles.disabledButton]}
            onPress={prevQuestion}
            disabled={currentQuestion === 0}
          >
            <Ionicons name="chevron-back" size={20} color={currentQuestion === 0 ? '#9ca3af' : '#374151'} />
            <Text style={[styles.navButtonText, currentQuestion === 0 && styles.disabledText]}>
              Previous
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navButton, 
              styles.nextButton, 
              !(currentQ.id in answers) && styles.disabledButton
            ]}
            onPress={nextQuestion}
            disabled={!(currentQ.id in answers)}
          >
            <Text style={[
              styles.nextButtonText, 
              !(currentQ.id in answers) && styles.disabledText
            ]}>
              {currentQuestion === questions.length - 1 ? 'View Results' : 'Next'}
            </Text>
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={!(currentQ.id in answers) ? '#9ca3af' : 'white'} 
            />
          </TouchableOpacity>
        </View>

        {/* Bottom Banner Space */}
        <View style={styles.bottomAdSpace}>
          <Text style={styles.adPlaceholder}>Banner Space (320x50)</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  headerGradient: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 24,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#bfdbfe',
    marginBottom: 8,
  },
  citation: {
    fontSize: 12,
    color: '#dbeafe',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  progressContainer: {
    marginTop: 16,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#bfdbfe',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#2563eb',
    borderRadius: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'white',
    borderRadius: 4,
  },
  questionContainer: {
    margin: 24,
    padding: 24,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  screenerBadge: {
    backgroundColor: '#fef3c7',
    borderColor: '#fcd34d',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  screenerText: {
    color: '#92400e',
    fontSize: 14,
    fontWeight: '500',
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    lineHeight: 28,
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  selectedOption: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  selectedOptionText: {
    color: '#1d4ed8',
  },
  optionScore: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  optionScoreText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  prevButton: {
    backgroundColor: '#f3f4f6',
  },
  nextButton: {
    backgroundColor: '#3b82f6',
  },
  disabledButton: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 4,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginRight: 4,
  },
  disabledText: {
    color: '#9ca3af',
  },
  // Results styles
  resultsContainer: {
    padding: 24,
    gap: 24,
  },
  summaryCard: {
    backgroundColor: '#f9fafb',
    padding: 24,
    borderRadius: 12,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },
  scoreGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  scoreBox: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  scoreNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  scoreLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  resultCard: {
    padding: 24,
    borderRadius: 12,
    borderWidth: 2,
  },
  positiveResult: {
    borderColor: '#fed7aa',
    backgroundColor: '#fef3c7',
  },
  negativeResult: {
    borderColor: '#bbf7d0',
    backgroundColor: '#ecfdf5',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  resultText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 16,
  },
  disclaimer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  disclaimerText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  disclaimerBold: {
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
  
  // Spaces
  topAdSpace: {
    height: 60,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  bottomAdSpace: {
    height: 60,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginTop: 20,
  },
  interstitialAdSpace: {
    height: 120,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginTop: 20,
  },
  adPlaceholder: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  adSubtext: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  
  // Citation styles
  citationCard: {
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#0ea5e9',
    marginTop: 16,
  },
  citationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 12,
  },
  citationText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 8,
  },
  citationBold: {
    fontWeight: '600',
    color: '#0f172a',
  },
});