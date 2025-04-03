import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export interface Task {
  id: string;
  title: string;
  description: string;
  rewardVotes: number;
  isDaily: boolean;
  type: string;
  actionUrl: string;
  completed: boolean;
}

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
  verifyTaskCompletion: (taskType: string) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      const telegramId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
      if (!telegramId) {
        toast.error('Please open this app in Telegram');
        return;
      }

      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/tasks/${telegramId}`);
      setTasks(response.data.tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to fetch tasks');
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const completeTask = async (taskId: string) => {
    try {
      const telegramId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
      if (!telegramId) {
        toast.error('Please open this app in Telegram');
        return;
      }

      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/task/complete`, {
        userId: telegramId,
        taskId
      });

      if (response.data.message === 'Task completed') {
        toast.success(`Task completed! Earned ${response.data.rewardVotes} votes`);
        await fetchTasks(); // Refresh tasks
      }
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Failed to complete task');
    }
  };

  const verifyTaskCompletion = async (taskType: string) => {
    try {
      const telegramId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
      if (!telegramId) {
        toast.error('Please open this app in Telegram');
        return;
      }

      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/task/verify`, {
        userId: telegramId,
        taskType
      });

      if (response.data.message === 'Task completed') {
        toast.success(`Task completed! Earned ${response.data.rewardVotes} votes`);
        await fetchTasks(); // Refresh tasks
      }
    } catch (error) {
      console.error('Error verifying task completion:', error);
      toast.error('Failed to verify task completion');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <TaskContext.Provider value={{ tasks, loading, error, fetchTasks, completeTask, verifyTaskCompletion }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
}; 