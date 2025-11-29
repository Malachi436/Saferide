import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAttendanceStore } from '../stores/attendanceStore';
import { ChildTile } from '../components';

export const AttendanceScreen = () => {
  const { children, toggleChildStatus } = useAttendanceStore();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Mark Attendance</Text>
      <Text style={styles.subtitle}>Tap on a child to update their status</Text>

      <View style={styles.list}>
        {children.map((child) => (
          <ChildTile
            key={child.id}
            child={child}
            onPress={() => toggleChildStatus(child.id)}
          />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFDFD',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
  },
  list: {
    gap: 8,
  },
});
