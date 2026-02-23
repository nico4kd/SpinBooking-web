export interface Class {
  id: string;
  title: string;
  description: string | null;
  startTime: string;
  duration: number;
  maxCapacity: number;
  currentCapacity: number;
  difficultyLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ALL_LEVELS';
  musicTheme: string | null;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  roomId: string;
  instructorId: string;
  room: {
    id: string;
    name: string;
    location: string;
    capacity: number;
  };
  instructor: {
    id: string;
    bio: string | null;
    specialties: string[];
    user: {
      id: string;
      firstName: string;
      lastName: string;
    };
  };
  spotsAvailable: number;
  isFull: boolean;
  fewSpotsLeft: boolean;
  waitlistCount: number;
}

export interface Booking {
  id: string;
  userId: string;
  classId: string;
  bikeNumber: number | null;
  status: 'CONFIRMED' | 'CANCELLED' | 'ATTENDED' | 'NO_SHOW';
  ticketId: string;
  createdAt: string;
  cancelledAt: string | null;
  cancellationReason: string | null;
  class: Class;
}

export interface ClassesResponse {
  data: Class[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BookingsResponse {
  data: Booking[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
