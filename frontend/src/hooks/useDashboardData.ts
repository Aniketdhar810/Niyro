import { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, query, orderBy, limit, Timestamp, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

export interface UserData {
  momentum?: {
    focusScore?: number;
    lastCompletionDate?: string;
    streakCount?: number;
  };
  workHours?: { start: string; end: string; timezone: string };
}

export interface TaskStep {
  id: string;
  title: string;
  scheduledAt?: string;
  done?: boolean;
}

export interface TaskData {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'done';
  riskLevel: 'on_track' | 'at_risk' | 'critical';
  dueAt?: string;
  source?: 'gmail' | 'telegram' | 'slack' | 'voice' | 'manual';
  steps?: TaskStep[];
}

export interface ActivityData {
  id: string;
  timestamp: Timestamp;
  agent: string;
  action: string;
  description: string;
  source?: string;
}

export interface ApprovalData {
  id: string;
  type: 'negotiation_email' | 'accountability_notify';
  draftContent: string;
  recipient: string;
  relatedTaskId?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export const useDashboardData = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [approvals, setApprovals] = useState<ApprovalData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const uid = user.uid;
    let tasksLoaded = false;
    let activitiesLoaded = false;
    let approvalsLoaded = false;

    function checkLoaded() {
      if (tasksLoaded && activitiesLoaded && approvalsLoaded) {
        setLoading(false);
      }
    }

    // Listen to user doc
    const unsubUser = onSnapshot(doc(db, 'users', uid), (docSnap) => {
      if (docSnap.exists()) {
        setUserData(docSnap.data() as UserData);
      }
    });

    // Listen to tasks
    const unsubTasks = onSnapshot(collection(db, 'users', uid, 'tasks'), (snap) => {
      const fetchedTasks = snap.docs.map(d => ({ id: d.id, ...d.data() } as TaskData));
      setTasks(fetchedTasks);
      tasksLoaded = true;
      checkLoaded();
    }, (error) => {
      console.error('Error fetching tasks:', error);
      tasksLoaded = true;
      checkLoaded();
    });

    // Listen to activity feed
    const activityQuery = query(
      collection(db, 'users', uid, 'activityFeed'),
      orderBy('timestamp', 'desc'),
      limit(20)
    );
    
    const unsubActivities = onSnapshot(activityQuery, (snap) => {
      const fetchedActs = snap.docs.map(d => ({ id: d.id, ...d.data() } as ActivityData));
      setActivities(fetchedActs);
      activitiesLoaded = true;
      checkLoaded();
    }, (error) => {
      console.error('Error fetching activities:', error);
      activitiesLoaded = true;
      checkLoaded();
    });

    // Listen to approvals
    const approvalsQuery = query(
      collection(db, 'users', uid, 'approvals'),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );

    const unsubApprovals = onSnapshot(approvalsQuery, (snap) => {
      const fetchedApprovals = snap.docs.map(d => ({ id: d.id, ...d.data() } as ApprovalData));
      setApprovals(fetchedApprovals);
      approvalsLoaded = true;
      checkLoaded();
    }, (error) => {
      console.error('Error fetching approvals:', error);
      approvalsLoaded = true;
      checkLoaded();
    });

    return () => {
      unsubUser();
      unsubTasks();
      unsubActivities();
      unsubApprovals();
    };
  }, [user]);

  return { userData, tasks, activities, approvals, loading };
};
