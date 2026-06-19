import { useDrag } from "react-dnd";
import { type Task } from "../../../api";
import { useBoardContext } from "../context/BoardContext";

export const ItemTypes = {
  TASK: "task",
};

interface TaskItemProps {
  task: Task;
}

const TaskItem = ({ task }: TaskItemProps) => {
  const { setSelectedTask } = useBoardContext();

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: ItemTypes.TASK,
      item: { id: task._id, cardId: task.cardId },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
    [task],
  );

  return (
    <div
      ref={drag as any}
      className={`task-card text-white p-2 ${isDragging ? "opacity-50" : ""}`}
      onClick={() => setSelectedTask(task)}
    >
      {task.title}
    </div>
  );
};

export default TaskItem;
