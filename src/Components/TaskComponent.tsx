
import { Task, useTask } from '../context/TaskContext';
import { FaTelegram, FaTwitter, FaYoutube, FaUsers } from 'react-icons/fa';
import toast from 'react-hot-toast';

const TaskComponent = () => {
  const { tasks, loading, completeTask, verifyTaskCompletion } = useTask();

  const handleTaskClick = async (task: Task) => {
    if (task.completed) {
      toast.success('Task already completed');
      return;
    }

    switch (task.type) {
      case 'invite_friends':
        // This is handled by the BottomSection component
        toast.custom('Use the Invite Friends button below');
        break;
      case 'join_bot':
      case 'join_group':
        if (task.actionUrl) {
          window.Telegram?.WebApp?.openTelegramLink(task.actionUrl);
          // Verify task completion after opening the link
          setTimeout(() => verifyTaskCompletion(task.type), 2000);
        }
        break;
      case 'custom':
        if (task.actionUrl) {
          window.Telegram?.WebApp?.openLink(task.actionUrl);
          // For custom tasks, we'll complete it immediately
          await completeTask(task.id);
        }
        break;
      default:
        toast.error('Unknown task type');
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'invite_friends':
        return <FaUsers className="text-xl" />;
      case 'join_bot':
      case 'join_group':
        return <FaTelegram className="text-xl" />;
      case 'custom':
        return <FaTwitter className="text-xl" />;
      default:
        return <FaYoutube className="text-xl" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-2 space-y-2 relative z-30">
      {tasks.map((task) => (
        <div
          key={task.id}
          onClick={() => handleTaskClick(task)}
          className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-300 ${
            task.completed
              ? 'bg-white/50 text-white/60'
              : 'bg-white hover:bg-white/70 text-black hover:text-gray-800'
          }`}
        >
          <div className="flex items-center gap-3">
            {getTaskIcon(task.type)}
            <div>
              <h3 className="font-semibold">{task.title}</h3>
              <p className="text-sm opacity-80">{task.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{task.rewardVotes} votes</span>
            {task.completed && (
              <span className="text-green-400 text-sm">✓ Completed</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskComponent; 