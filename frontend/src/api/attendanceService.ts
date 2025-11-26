/**
 * Attendance Service
 * Handles operations related to child attendance tracking
 */

import apiClient from './client';
import { ChildStatus } from '../types/models';

export interface RecordAttendanceRequest {
  childId: string;
  tripId: string;
  status: ChildStatus;
  recordedBy: string;
}

export interface UpdateAttendanceRequest {
  status: ChildStatus;
  recordedBy: string;
}

class AttendanceService {
  /**
   * Record attendance for a child
   */
  async recordAttendance(attendanceData: RecordAttendanceRequest): Promise<any> {
    try {
      const response = await apiClient.post('/attendance', attendanceData);
      return response.data;
    } catch (error) {
      throw new Error('Failed to record attendance');
    }
  }

  /**
   * Update attendance record
   */
  async updateAttendance(attendanceId: string, attendanceData: UpdateAttendanceRequest): Promise<any> {
    try {
      const response = await apiClient.patch(`/attendance/${attendanceId}`, attendanceData);
      return response.data;
    } catch (error) {
      throw new Error('Failed to update attendance');
    }
  }

  /**
   * Get attendance records for a child
   */
  async getAttendanceByChild(childId: string): Promise<any[]> {
    try {
      const response = await apiClient.get<any[]>(`/attendance/child/${childId}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch attendance records');
    }
  }

  /**
   * Get attendance records for a trip
   */
  async getAttendanceByTrip(tripId: string): Promise<any[]> {
    try {
      const response = await apiClient.get<any[]>(`/attendance/trip/${tripId}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch attendance records');
    }
  }

  /**
   * Get a specific attendance record by ID
   */
  async getAttendanceById(attendanceId: string): Promise<any> {
    try {
      const response = await apiClient.get<any>(`/attendance/${attendanceId}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch attendance record');
    }
  }
}

export default new AttendanceService();