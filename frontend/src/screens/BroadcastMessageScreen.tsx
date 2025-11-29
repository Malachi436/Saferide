import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Pressable } from 'react-native';
import { LiquidCard, LargeCTAButton } from '../components';
import { BroadcastTemplate } from '../types';
import { Ionicons } from '@expo/vector-icons';

const templates: Array<{ id: BroadcastTemplate; title: string; message: string; iconName: string }> = [
  {
    id: 'running_late',
    title: 'Running Late',
    message: 'The bus is running late. Estimated delay: ',
    iconName: 'time-outline',
  },
  {
    id: 'vehicle_issue',
    title: 'Vehicle Issue',
    message: 'We are experiencing a minor vehicle issue. Will update shortly.',
    iconName: 'warning-outline',
  },
  {
    id: 'route_change',
    title: 'Route Change',
    message: 'There has been a temporary route change. Please check the app for updates.',
    iconName: 'location-outline',
  },
  {
    id: 'custom',
    title: 'Custom Message',
    message: '',
    iconName: 'chatbox-outline',
  },
];

export const BroadcastMessageScreen = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<BroadcastTemplate | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [delayMinutes, setDelayMinutes] = useState('');

  const handleSend = () => {
    const template = templates.find(t => t.id === selectedTemplate);
    let finalMessage = '';

    if (selectedTemplate === 'custom') {
      finalMessage = customMessage;
    } else if (selectedTemplate === 'running_late') {
      finalMessage = template!.message + `${delayMinutes} minutes`;
    } else {
      finalMessage = template!.message;
    }

    alert(`Broadcasting: ${finalMessage}`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Broadcast Message</Text>
      <Text style={styles.subtitle}>Send updates to all parents</Text>

      <View style={styles.templatesGrid}>
        {templates.map((template) => {
          const isSelected = selectedTemplate === template.id;

          return (
            <Pressable
              key={template.id}
              onPress={() => setSelectedTemplate(template.id)}
              style={{ flex: 1 }}
            >
              <LiquidCard
                className="mb-3"
                style={[
                  styles.templateCard,
                  isSelected && styles.templateCardActive,
                ]}
              >
                <Ionicons name={template.iconName as any} size={24} color={isSelected ? '#3B82F6' : '#6B7280'} />
                <Text style={[
                  styles.templateTitle,
                  isSelected && styles.templateTitleActive,
                ]}>
                  {template.title}
                </Text>
              </LiquidCard>
            </Pressable>
          );
        })}
      </View>

      {selectedTemplate === 'running_late' && (
        <LiquidCard className="mt-4">
          <Text style={styles.inputLabel}>Estimated Delay (minutes)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 10"
            value={delayMinutes}
            onChangeText={setDelayMinutes}
            keyboardType="numeric"
          />
        </LiquidCard>
      )}

      {selectedTemplate === 'custom' && (
        <LiquidCard className="mt-4">
          <Text style={styles.inputLabel}>Your Message</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Type your message here..."
            value={customMessage}
            onChangeText={setCustomMessage}
            multiline
            numberOfLines={4}
          />
        </LiquidCard>
      )}

      {selectedTemplate && (
        <View style={styles.preview}>
          <Text style={styles.previewLabel}>Preview:</Text>
          <LiquidCard>
            <Text style={styles.previewText}>
              {selectedTemplate === 'custom'
                ? customMessage || 'Type your message above...'
                : selectedTemplate === 'running_late'
                ? templates.find(t => t.id === 'running_late')!.message + (delayMinutes || 'X') + ' minutes'
                : templates.find(t => t.id === selectedTemplate)!.message}
            </Text>
          </LiquidCard>
        </View>
      )}

      <LargeCTAButton
        title="Send to All Parents"
        onPress={handleSend}
        disabled={!selectedTemplate}
        className="mt-6"
      />
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
  templatesGrid: {
    gap: 12,
  },
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  templateCardActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  templateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  templateTitleActive: {
    color: '#3B82F6',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 120,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  preview: {
    marginTop: 24,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  previewText: {
    fontSize: 16,
    color: '#111827',
    lineHeight: 24,
  },
});
