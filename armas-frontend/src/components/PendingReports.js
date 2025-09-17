import React, { useState, useEffect } from 'react';
import { getMyTasks, reassignTask, getUsersByRole } from '../file/upload_download';
import { useAuth } from '../views/pages/AuthProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserEdit } from '@fortawesome/free-solid-svg-icons';

const PendingReports = () => {
    const { roles } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showReassignModal, setShowReassignModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [selectedAuditor, setSelectedAuditor] = useState('');
    const [auditors, setAuditors] = useState([]);

    // Role checking function
    const hasRole = (role) => {
        const result = Array.isArray(roles) && roles.some((r) => r.description === role);
        console.log(`PendingReports: Checking role ${role}: ${result}`);
        return result;
    };

    const isArchiver = hasRole('ARCHIVER');

    const fetchPendingTasks = async () => {
        if (!isArchiver) {
            setError('Unauthorized access. ARCHIVER role required.');
            console.log('PendingReports: Unauthorized access - ARCHIVER role not found');
            return;
        }
        try {
            console.log('PendingReports: Fetching tasks assigned by ARCHIVER');
            const data = await getMyTasks();
            const assignedTasks = data.filter(task => task && task.id && ['Assigned', 'Rejected'].includes(task.reportstatus));
            console.log('PendingReports: Filtered tasks:', JSON.stringify(assignedTasks, null, 2));
            setTasks(assignedTasks);
            setError('');
            if (assignedTasks.length === 0) {
                setError('No pending tasks assigned by you are available.');
            }
        } catch (err) {
            const errorMessage = err.message || 'Unknown error';
            setError(`Failed to load pending tasks: ${errorMessage}`);
            console.error('PendingReports: Fetch error:', err.response?.data || err);
        }
    };

    useEffect(() => {
        console.log('PendingReports: User roles:', roles);
        console.log('PendingReports: isArchiver:', isArchiver);
        fetchPendingTasks();
    }, [roles]);

    const handleReassign = async (task) => {
        setSelectedTask(task);
        setError('');
        setSelectedAuditor('');
        try {
            const auditorsData = await getUsersByRole('SENIOR_AUDITOR');
            console.log('PendingReports: Auditors fetched:', auditorsData);
            setAuditors(auditorsData);
            setShowReassignModal(true);
        } catch (err) {
            const errorMessage = err.message || 'Unknown error';
            setError(`Failed to load auditors: ${errorMessage}`);
            console.error('PendingReports: Error fetching auditors:', err.response?.data || err);
        }
    };

    const handleReassignSubmit = async () => {
        if (!selectedAuditor) {
            setError('Please select a Senior Auditor');
            return;
        }
        try {
            await reassignTask(selectedTask.id, selectedAuditor);
            setSuccess('Task reassigned successfully');
            setShowReassignModal(false);
            setSelectedAuditor('');
            await fetchPendingTasks();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            const errorMessage = err.message || 'Unknown error';
            setError(`Failed to reassign task: ${errorMessage}`);
            console.error('PendingReports: Reassign error:', err.response?.data || err);
            setTimeout(() => setError(''), 5000);
        }
    };

    return (
        <div className="container mt-5">
            <h2>Pending Reports</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            {tasks.length === 0 && !error && (
                <div className="alert alert-info">No pending tasks available.</div>
            )}
            {tasks.length > 0 && (
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Organization</th>
                            <th>Budget Year</th>
                            <th>Report Type</th>
                            <th>Assigned Auditor</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.map(task => (
                            <tr key={task.id}>
                                <td>{task.createdDate ? new Date(task.createdDate).toLocaleDateString() : 'N/A'}</td>
                                <td>{task.reportstatus || 'N/A'}</td>
                                <td>{task.organization?.orgname || task.orgname || 'N/A'}</td>
                                <td>{task.budgetYear?.fiscalYear || task.fiscalYear || 'N/A'}</td>
                                <td>{task.transactiondocument?.reportype || task.reportype || 'N/A'}</td>
                                <td>{task.user2?.username || task.assignedAuditorUsername || 'N/A'}</td>
                                <td>
                                    <button
                                        className="btn btn-warning btn-sm"
                                        onClick={() => handleReassign(task)}
                                        title="Reassign Task"
                                    >
                                        <FontAwesomeIcon icon={faUserEdit} /> Reassign
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {showReassignModal && (
                <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Reassign Task</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowReassignModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label htmlFor="auditor">Select Senior Auditor:</label>
                                    <select
                                        className="form-control"
                                        id="auditor"
                                        value={selectedAuditor}
                                        onChange={(e) => setSelectedAuditor(e.target.value)}
                                    >
                                        <option value="">Select Senior Auditor</option>
                                        {auditors.map(auditor => (
                                            <option key={auditor.id} value={auditor.username}>
                                                {auditor.firstName} {auditor.lastName} ({auditor.username})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowReassignModal(false)}
                                >
                                    Close
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleReassignSubmit}
                                >
                                    Reassign
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PendingReports;