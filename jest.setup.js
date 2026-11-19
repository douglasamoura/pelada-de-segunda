// Jest setup file
// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock react-native modules
jest.mock('react-native', () => ({
  Platform: {
    OS: 'web',
    select: (obj) => obj.web || obj.default,
  },
  Alert: {
    alert: jest.fn(),
  },
  StyleSheet: {
    create: (obj) => obj,
  },
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  ScrollView: 'ScrollView',
  SafeAreaView: 'SafeAreaView',
  ActivityIndicator: 'ActivityIndicator',
  StatusBar: 'StatusBar',
  KeyboardAvoidingView: 'KeyboardAvoidingView',
  TextInput: 'TextInput',
  Modal: 'Modal',
  FlatList: 'FlatList',
  Image: 'Image',
  Dimensions: {
    get: () => ({ width: 375, height: 667 }),
  },
}));