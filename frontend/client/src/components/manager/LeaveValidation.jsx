import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const LeaveValidation = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [managerComment, setManagerComment] = useState('');
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint = filter === 'all' ? '/api/leaves' : `/api/leaves/status/${filter}`;
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      } else {
        toast.error('Erreur lors du chargement des demandes');
      }
    } catch (error) {
      toast.error('Erreur de connexion');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId, comment = '') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/leaves/${requestId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          managerComments: comment
        })
      });

      if (response.ok) {
        toast.success('Demande approuvée avec succès !');
        setSelectedRequest(null);
        setManagerComment('');
        fetchRequests();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Erreur lors de l\'approbation');
      }
    } catch (error) {
      toast.error('Erreur de connexion');
      console.error('Erreur:', error);
    }
  };

  const handleReject = async (requestId, comment = '') => {
    if (!comment.trim()) {
      toast.warning('Veuillez fournir un motif de rejet');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/leaves/${requestId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          managerComments: comment
        })
      });

      if (response.ok) {
        toast.success('Demande rejetée');
        setSelectedRequest(null);
        setManagerComment('');
        fetchRequests();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Erreur lors du rejet');
      }
    } catch (error) {
      toast.error('Erreur de connexion');
      console.error('Erreur:', error);
    }
  };

  const openModal = (request) => {
    setSelectedRequest(request);
    setManagerComment(request.managerComments || '');
  };

  const closeModal = () => {
    setSelectedRequest(null);
    setManagerComment('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#4CAF50';
      case 'rejected': return '#f44336';
      case 'pending': return '#FF9800';
      default: return '#757575';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'Approuvé';
      case 'rejected': return 'Rejeté';
      case 'pending': return 'En attente';
      default: return 'Inconnu';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getLeaveTypeText = (type) => {
    const types = {
      vacation: 'Congés payés',
      sick: 'Congé maladie',
      personal: 'Congé personnel',
      maternity: 'Congé maternité',
      paternity: 'Congé paternité',
      other: 'Autre'
    };
    return types[type] || type;
  };

  const getUrgencyLevel = (request) => {
    const startDate = new Date(request.startDate);
    const today = new Date();
    const daysUntilStart = Math.ceil((startDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilStart <= 3) return { level: 'urgent', color: '#f44336', text: 'Urgent' };
    if (daysUntilStart <= 7) return { level: 'soon', color: '#FF9800', text: 'Bientôt' };
    return { level: 'normal', color: '#4CAF50', text: 'Normal' };
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Validation des Congés</h2>
        <div style={styles.filterContainer}>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="pending">En attente</option>
            <option value="approved">Approuvés</option>
            <option value="rejected">Rejetés</option>
            <option value="all">Tous</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={styles.loading}>Chargement...</div>
      ) : (
        <>
          {requests.length === 0 ? (
            <div style={styles.noRequests}>
              <p>Aucune demande trouvée pour le filtre sélectionné</p>
            </div>
          ) : (
            <div style={styles.requestsGrid}>
              {requests.map(request => {
                const urgency = getUrgencyLevel(request);
                return (
                  <div key={request._id} style={styles.requestCard}>
                    <div style={styles.requestHeader}>
                      <div style={styles.employeeInfo}>
                        <h4>{request.employee?.nom} {request.employee?.prenom}</h4>
                        <span style={styles.employeeEmail}>{request.employee?.email}</span>
                      </div>
                      <div style={styles.statusContainer}>
                        <span style={{
                          ...styles.statusBadge,
                          backgroundColor: getStatusColor(request.status),
                        }}>
                          {getStatusText(request.status)}
                        </span>
                        {request.status === 'pending' && (
                          <span style={{
                            ...styles.urgencyBadge,
                            backgroundColor: urgency.color,
                          }}>
                            {urgency.text}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={styles.requestDetails}>
                      <div style={styles.detailRow}>
                        <strong>Type:</strong> {getLeaveTypeText(request.leaveType)}
                      </div>
                      <div style={styles.detailRow}>
                        <strong>Période:</strong> {formatDate(request.startDate)} - {formatDate(request.endDate)}
                      </div>
                      <div style={styles.detailRow}>
                        <strong>Durée:</strong> {request.duration} jour(s)
                      </div>
                      <div style={styles.detailRow}>
                        <strong>Motif:</strong> {request.reason}
                      </div>
                      {request.comments && (
                        <div style={styles.detailRow}>
                          <strong>Commentaires:</strong> {request.comments}
                        </div>
                      )}
                      <div style={styles.detailRow}>
                        <strong>Demandé le:</strong> {formatDate(request.createdAt)}
                      </div>
                    </div>

                    {request.status === 'pending' ? (
                      <div style={styles.actionButtons}>
                        <button 
                          onClick={() => openModal(request)}
                          style={styles.detailButton}
                        >
                          Examiner
                        </button>
                        <button 
                          onClick={() => handleApprove(request._id)}
                          style={styles.quickApproveButton}
                        >
                          Approuver rapidement
                        </button>
                      </div>
                    ) : (
                      request.managerComments && (
                        <div style={styles.managerComments}>
                          <strong>Commentaire du manager:</strong>
                          <p>{request.managerComments}</p>
                        </div>
                      )
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Modal pour examiner en détail */}
      {selectedRequest && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3>Demande de {selectedRequest.employee?.nom} {selectedRequest.employee?.prenom}</h3>
              <button onClick={closeModal} style={styles.closeButton}>×</button>
            </div>

            <div style={styles.modalContent}>
              <div style={styles.modalDetails}>
                <p><strong>Type:</strong> {getLeaveTypeText(selectedRequest.leaveType)}</p>
                <p><strong>Période:</strong> {formatDate(selectedRequest.startDate)} - {formatDate(selectedRequest.endDate)}</p>
                <p><strong>Durée:</strong> {selectedRequest.duration} jour(s)</p>
                <p><strong>Motif:</strong> {selectedRequest.reason}</p>
                {selectedRequest.comments && (
                  <p><strong>Commentaires:</strong> {selectedRequest.comments}</p>
                )}
              </div>

              <div style={styles.commentSection}>
                <label style={styles.commentLabel}>Commentaire du manager:</label>
                <textarea
                  value={managerComment}
                  onChange={(e) => setManagerComment(e.target.value)}
                  placeholder="Ajoutez un commentaire (optionnel pour l'approbation, requis pour le rejet)..."
                  rows="4"
                  style={styles.commentTextarea}
                />
              </div>

              <div style={styles.modalActions}>
                <button 
                  onClick={() => handleReject(selectedRequest._id, managerComment)}
                  style={styles.rejectButton}
                  disabled={!managerComment.trim()}
                >
                  Rejeter
                </button>
                <button 
                  onClick={() => handleApprove(selectedRequest._id, managerComment)}
                  style={styles.approveButton}
                >
                  Approuver
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  filterContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  filterSelect: {
    padding: '0.5rem 1rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
  },
  loading: {
    textAlign: 'center',
    padding: '2rem',
    fontSize: '1.1rem',
    color: '#666',
  },
  noRequests: {
    textAlign: 'center',
    padding: '3rem',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  requestsGrid: {
    display: 'grid',
    gap: '1.5rem',
  },
  requestCard: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: '1px solid #eee',
  },
  requestHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
  },
  employeeInfo: {
    flex: 1,
  },
  employeeEmail: {
    color: '#666',
    fontSize: '0.9rem',
  },
  statusContainer: {
    display: 'flex',
    gap: '0.5rem',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  statusBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    color: 'white',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  urgencyBadge: {
    padding: '0.2rem 0.6rem',
    borderRadius: '10px',
    color: 'white',
    fontSize: '0.75rem',
    fontWeight: '500',
  },
  requestDetails: {
    display: 'grid',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  detailRow: {
    display: 'flex',
    gap: '0.5rem',
  },
  actionButtons: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
  },
  detailButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  quickApproveButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  managerComments: {
    backgroundColor: '#f8f9fa',
    padding: '1rem',
    borderRadius: '4px',
    marginTop: '1rem',
    border: '1px solid #dee2e6',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '80vh',
    overflow: 'auto',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    borderBottom: '1px solid #eee',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    padding: '0.25rem',
  },
  modalContent: {
    padding: '1.5rem',
  },
  modalDetails: {
    marginBottom: '1.5rem',
    lineHeight: 1.6,
  },
  commentSection: {
    marginBottom: '1.5rem',
  },
  commentLabel: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '500',
  },
  commentTextarea: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    resize: 'vertical',
    boxSizing: 'border-box',
  },
  modalActions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
  },
  rejectButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  approveButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500',
  },
};