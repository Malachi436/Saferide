import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../utils/api';
import { colors } from '../../theme/colors';

interface School {
  id: string;
  name: string;
  address?: string;
}

interface GeneratedRoute {
  route: {
    id: string;
    name: string;
    stops: Array<{
      id: string;
      name: string;
      latitude: number;
      longitude: number;
      order: number;
    }>;
  };
  childrenCount: number;
  childrenIds: string[];
}

interface GenerationResult {
  message: string;
  routes: GeneratedRoute[];
  summary: {
    totalChildren: number;
    routesCreated: number;
    avgChildrenPerRoute: number;
    busCapacityUsed: number;
  };
}

export const AutoGenerateRoutesScreen = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      // Note: This screen is for admin use - if you need company-specific schools,
      // pass companyId as a prop and use: `/admin/company/${companyId}/schools`
      const response = await apiClient.get('/admin/schools');
      const schoolsData = Array.isArray((response as any).data) ? (response as any).data : Array.isArray(response) ? response : [];
      setSchools(schoolsData);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to load schools');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRoutes = async (schoolId: string, schoolName: string) => {
    Alert.alert(
      'Generate Routes',
      `This will auto-generate routes for ${schoolName} based on children pickup locations and bus capacity. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Generate',
          onPress: async () => {
            try {
              setGenerating(true);
              const response = await apiClient.post(`/routes/auto-generate/${schoolId}`);
              const data = (response as any).data as GenerationResult;
              setGenerationResult(data);
              Alert.alert(
                'Success',
                `${data.message}\n\n` +
                `Routes: ${data.summary.routesCreated}\n` +
                `Children: ${data.summary.totalChildren}\n` +
                `Avg per route: ${data.summary.avgChildrenPerRoute}`,
              );
            } catch (error: any) {
              Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to generate routes',
              );
            } finally {
              setGenerating(false);
            }
          },
        },
      ],
    );
  };

  const renderSchool = ({ item }: { item: School }) => (
    <View style={styles.schoolCard}>
      <View style={styles.schoolInfo}>
        <Text style={styles.schoolName}>{item.name}</Text>
        {item.address && <Text style={styles.schoolAddress}>{item.address}</Text>}
      </View>
      <TouchableOpacity
        style={styles.generateButton}
        onPress={() => handleGenerateRoutes(item.id, item.name)}
        disabled={generating}
      >
        {generating ? (
          <ActivityIndicator size="small" color={colors.neutral.pureWhite} />
        ) : (
          <>
            <Ionicons name="git-network" size={20} color={colors.neutral.pureWhite} />
            <Text style={styles.generateButtonText}>Generate</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderGenerationResult = () => {
    if (!generationResult) return null;

    return (
      <View style={styles.resultContainer}>
        <Text style={styles.resultTitle}>Generation Results</Text>
        
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Children:</Text>
            <Text style={styles.summaryValue}>{generationResult.summary.totalChildren}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Routes Created:</Text>
            <Text style={styles.summaryValue}>{generationResult.summary.routesCreated}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Avg per Route:</Text>
            <Text style={styles.summaryValue}>{generationResult.summary.avgChildrenPerRoute}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Bus Capacity Used:</Text>
            <Text style={styles.summaryValue}>{generationResult.summary.busCapacityUsed}</Text>
          </View>
        </View>

        {generationResult.routes.map((routeData, index) => (
          <View key={routeData.route.id} style={styles.routeCard}>
            <View style={styles.routeHeader}>
              <Text style={styles.routeName}>{routeData.route.name}</Text>
              <Text style={styles.routeChildCount}>
                {routeData.childrenCount} {routeData.childrenCount === 1 ? 'child' : 'children'}
              </Text>
            </View>
            <Text style={styles.stopsCount}>
              {routeData.route.stops.length} stop{routeData.route.stops.length !== 1 ? 's' : ''}
            </Text>
          </View>
        ))}

        <TouchableOpacity
          style={styles.closeResultButton}
          onPress={() => setGenerationResult(null)}
        >
          <Text style={styles.closeResultButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary.blue} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="git-network" size={28} color={colors.primary.blue} />
        <Text style={styles.title}>Auto-Generate Routes</Text>
      </View>

      <Text style={styles.description}>
        Automatically create routes based on children pickup locations and available bus capacity.
        The system will cluster children into optimal groups.
      </Text>

      {generationResult ? (
        <ScrollView style={styles.scrollView}>
          {renderGenerationResult()}
        </ScrollView>
      ) : (
        <FlatList
          data={schools}
          renderItem={renderSchool}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="school-outline" size={64} color="#CCC" />
              <Text style={styles.emptyText}>No schools available</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.neutral.pureWhite,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 12,
    color: colors.neutral.textPrimary,
  },
  description: {
    padding: 16,
    backgroundColor: '#E3F2FD',
    color: '#1565C0',
    fontSize: 14,
    lineHeight: 20,
  },
  scrollView: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  schoolCard: {
    flexDirection: 'row',
    backgroundColor: colors.neutral.pureWhite,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  schoolInfo: {
    flex: 1,
  },
  schoolName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.textPrimary,
    marginBottom: 4,
  },
  schoolAddress: {
    fontSize: 14,
    color: colors.neutral.textSecondary,
  },
  generateButton: {
    backgroundColor: colors.primary.blue,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  generateButtonText: {
    color: colors.neutral.pureWhite,
    fontWeight: '600',
    fontSize: 14,
  },
  resultContainer: {
    padding: 16,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.neutral.textPrimary,
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: colors.neutral.pureWhite,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.textPrimary,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.neutral.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral.textPrimary,
  },
  routeCard: {
    backgroundColor: colors.neutral.pureWhite,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary.blue,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  routeName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.textPrimary,
  },
  routeChildCount: {
    fontSize: 14,
    color: colors.primary.blue,
    fontWeight: '600',
  },
  stopsCount: {
    fontSize: 14,
    color: colors.neutral.textSecondary,
  },
  closeResultButton: {
    backgroundColor: colors.neutral.textSecondary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  closeResultButtonText: {
    color: colors.neutral.pureWhite,
    fontWeight: '600',
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
});

export default AutoGenerateRoutesScreen;
