import React, { useEffect, useState } from 'react';
import { fetchTasks, createTask, updateTask, deleteTask } from '../api/api'; 
import { Button, Form, Table, Modal, Badge, Dropdown } from 'react-bootstrap'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom'; 
import { FaBell } from 'react-icons/fa'; // Import bell icon

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', dueDate: '', priority: 'low' });
  const [editingTask, setEditingTask] = useState(null);
  const [editTaskData, setEditTaskData] = useState({ title: '', description: '', status: '', dueDate: '', priority: 'low' });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false); // Confirmation modal state
  const [taskToDelete, setTaskToDelete] = useState(null); // Task to be deleted
  const [approachingTasks, setApproachingTasks] = useState([]); // State for tasks approaching the due date
  const [showNotifications, setShowNotifications] = useState(false); // Show notifications dropdown

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const getTasks = async () => {
      try {
        const response = await fetchTasks(token);
        const tasks = response.data;
        setTasks(tasks.filter(task => task.status !== 'completed'));
        setCompletedTasks(tasks.filter(task => task.status === 'completed'));

        // Notify if tasks are approaching the due date
        const threshold = 3; // days before the due date to notify
        const now = new Date();
        const upcomingTasks = tasks.filter(task => {
          if (!task.dueDate) return false;
          const dueDate = new Date(task.dueDate);
          const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
          return diffDays <= threshold && diffDays >= 0;
        });
        setApproachingTasks(upcomingTasks);
      } catch (error) {
        console.error('Failed to fetch tasks', error);
      }
    };
    getTasks();
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await createTask(newTask, token);
      setShowCreateModal(false);
      setNewTask({ title: '', description: '', dueDate: '', priority: 'low' });
      const response = await fetchTasks(token);
      setTasks(response.data.filter(task => task.status !== 'completed'));
      setCompletedTasks(response.data.filter(task => task.status === 'completed'));
    } catch (error) {
      console.error('Failed to create task', error);
    }
  };

  const handleEditTask = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await updateTask(editingTask, editTaskData, token);
      setShowEditModal(false);
      setEditingTask(null);
      const response = await fetchTasks(token);
      setTasks(response.data.filter(task => task.status !== 'completed'));
      setCompletedTasks(response.data.filter(task => task.status === 'completed'));
    } catch (error) {
      console.error('Failed to update task', error);
    }
  };

  const handleConfirmDelete = (taskId) => {
    setTaskToDelete(taskId);
    setShowConfirmModal(true); // Open confirmation modal
  };

  const handleDeleteTask = async () => {
    const token = localStorage.getItem('token');
    try {
      await deleteTask(taskToDelete, token);
      setShowConfirmModal(false); // Close confirmation modal after deletion
      const response = await fetchTasks(token);
      setTasks(response.data.filter(task => task.status !== 'completed'));
      setCompletedTasks(response.data.filter(task => task.status === 'completed'));
    } catch (error) {
      console.error('Failed to delete task', error);
    }
  };

  const startEditing = (task) => {
    setEditingTask(task._id);
    setEditTaskData({
      title: task.title,
      description: task.description,
      status: task.status,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      priority: task.priority || 'low',
    });
    setShowEditModal(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Task List</h2>
        <div className="position-relative">
          <FaBell
            size={24}
            onClick={handleNotificationClick}
            style={{ cursor: 'pointer' }}
          />
          {approachingTasks.length > 0 && (
            <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle">
              {approachingTasks.length}
            </Badge>
          )}
          {showNotifications && (
            <Dropdown.Menu show className="position-absolute" style={{ top: '30px', right: '0' }}>
              <Dropdown.Header>Upcoming Tasks</Dropdown.Header>
              {approachingTasks.length > 0 ? (
                approachingTasks.map(task => (
                  <Dropdown.Item key={task._id}>
                    {task.title} - Due on {new Date(task.dueDate).toLocaleDateString()}
                  </Dropdown.Item>
                ))
              ) : (
                <Dropdown.Item>No upcoming tasks</Dropdown.Item>
              )}
            </Dropdown.Menu>
          )}
        </div>
        <Button variant="danger" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <Button variant="primary" className="mb-3" onClick={() => setShowCreateModal(true)}>
        Create New Task
      </Button>

      <h3>Pending Tasks</h3>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Status</th>
            <th>Due Date</th>
            <th>Priority</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => (
            <tr key={task._id}>
              <td>{task.title}</td>
              <td>{task.description}</td>
              <td>{task.status}</td>
              <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</td>
              <td>{task.priority}</td>
              <td>
                <Button
                  variant="warning"
                  className="me-2"
                  onClick={() => startEditing(task)}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleConfirmDelete(task._id)} // Trigger confirmation modal
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <h3>Completed Tasks</h3>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Status</th>
            <th>Due Date</th>
            <th>Priority</th>
          </tr>
        </thead>
        <tbody>
          {completedTasks.map(task => (
            <tr key={task._id}>
              <td style={{ textDecoration: 'line-through' }}>{task.title}</td>
              <td style={{ textDecoration: 'line-through' }}>{task.description}</td>
              <td style={{ textDecoration: 'line-through' }}>{task.status}</td>
              <td style={{ textDecoration: 'line-through' }}>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</td>
              <td style={{ textDecoration: 'line-through' }}>{task.priority}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal for creating new task */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateTask}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Due Date</Form.Label>
              <Form.Control
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Priority</Form.Label>
              <Form.Control
                as="select"
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Form.Control>
            </Form.Group>
            <Button variant="primary" type="submit">
              Create Task
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal for editing a task */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEditTask}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={editTaskData.title}
                onChange={(e) => setEditTaskData({ ...editTaskData, title: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={editTaskData.description}
                onChange={(e) => setEditTaskData({ ...editTaskData, description: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Control
                as="select"
                value={editTaskData.status}
                onChange={(e) => setEditTaskData({ ...editTaskData, status: e.target.value })}
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </Form.Control>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Due Date</Form.Label>
              <Form.Control
                type="date"
                value={editTaskData.dueDate}
                onChange={(e) => setEditTaskData({ ...editTaskData, dueDate: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Priority</Form.Label>
              <Form.Control
                as="select"
                value={editTaskData.priority}
                onChange={(e) => setEditTaskData({ ...editTaskData, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Form.Control>
            </Form.Group>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Confirmation Modal */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this task?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteTask}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TaskList;
