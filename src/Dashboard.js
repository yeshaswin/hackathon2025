import React, { useState, useEffect } from "react";
import { Card, Col, Row, Tag, Button, message, Spin } from "antd";
import ChatInterface from "./Chatinterface";

const statusColors = {
  Completed: "green",
  "In Progress": "orange",
  Scheduled: "blue",
  Cancelled: "red",
};

// Mock Data (Used if API fails)
const mockAppointments = [
  {
    id: "mock-1",
    serviceName: "AC Repair",
    appointmentTime: "2024-02-22T10:00:00Z",
    technician: "John Doe",
    contact: { phone: "123-456-7890", email: "john@example.com" },
    status: "In Progress",
  },
  {
    id: "mock-2",
    serviceName: "Plumbing Fix",
    appointmentTime: "2024-02-21T14:30:00Z",
    technician: "Jane Smith",
    contact: { phone: "987-654-3210", email: "jane@example.com" },
    status: "Completed",
  },
];

const Dashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refetchAppointments, setRefetchAppointments] = useState(false);
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch("http://13.201.194.231:3000/tickets");
        if (!response.ok) throw new Error("Failed to fetch data");
        const data = await response.json();
        if (!data.response || data.response.length === 0) {
          console.warn("API returned no data. Using mock data.");
          setAppointments(mockAppointments);
          return;
        }

        const formattedAppointments = data.response.map((item) => ({
          id: item._id,
          serviceName: item.issue,
          appointmentTime: item.time,
          technician: item.name,
          contact: { phone: "N/A", email: "N/A" },
          status: item.isOpen ? "In Progress" : "Completed",
        }));
        setAppointments(formattedAppointments);
      } catch (error) {
        console.error("API error:", error.message);
        setAppointments(mockAppointments); // Fallback to mock data
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [refetchAppointments]);

  const cancelAppointment = async (id) => {
    try {
      const response = await fetch(
        `http://13.201.194.231:3000/ticket/${id}`,
        {
          method: "DELETE",
        }
      );
  
      if (!response.ok) {
        throw new Error("Failed to cancel appointment");
      }
  
      setAppointments((prev) => prev.filter((app) => app.id !== id));
      message.success("Appointment canceled successfully!");
    } catch (error) {
      console.error("Error canceling appointment:", error);
      message.error("Failed to cancel appointment. Please try again.");
    }
  };

  if (loading)
    return <Spin size="large" style={{ display: "block", margin: "50px auto" }} />;

  return (
    <div style={styles.container}>
      <div style={styles.dashboard}>
        <h1>Dashboard</h1>

        <h2 style={styles.sectionTitle}>🔄 In Progress Appointments</h2>
        <Row gutter={[16, 16]}>
          {appointments
            .filter((appointment) => appointment.status === "In Progress")
            .map((appointment) => (
              <Col key={appointment.id} xs={24} sm={12} md={8} lg={6}>
                <Card style={styles.card} title={appointment.serviceName}>
                  <p>
                    <strong>Appointment:</strong>{" "}
                    {new Date(appointment.appointmentTime).toLocaleString()}
                  </p>
                  <p>
                    <strong>Technician:</strong> {appointment.technician}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <Tag color={statusColors[appointment.status] || "blue"}>
                      {appointment.status}
                    </Tag>
                  </p>
                  <Button
                    type="primary"
                    danger
                    onClick={() => cancelAppointment(appointment.id)}
                    style={styles.button}
                  >
                    Cancel Appointment
                  </Button>
                </Card>
              </Col>
            ))}
        </Row>

        <h2 style={styles.sectionTitle}>✅ Completed Appointments</h2>
        <Row gutter={[16, 16]}>
          {appointments
            .filter((appointment) => appointment.status === "Completed")
            .map((appointment) => (
              <Col key={appointment.id} xs={24} sm={12} md={8} lg={6}>
                <Card style={styles.card} title={appointment.serviceName} bordered={false}>
                  <p>
                    <strong>Appointment:</strong>{" "}
                    {new Date(appointment.appointmentTime).toLocaleString()}
                  </p>
                  <p>
                    <strong>Technician:</strong> {appointment.technician}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <Tag color={statusColors[appointment.status] || "blue"}>
                      {appointment.status}
                    </Tag>
                  </p>
                </Card>
              </Col>
            ))}
        </Row>
      </div>
      <ChatInterface style={styles.chatInterface} setRefetchAppointments={setRefetchAppointments} />
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    width: "100%",
    background: "#f8f9fa",
    minHeight: "100vh",
  },
  dashboard: {
    background: "#ffffff",
    maxHeight: "844px",
    overflowY: "auto",
    overflowX: "clip",
    width: "80%",
    boxShadow: "2px 0px 5px rgba(0, 0, 0, 0.1)",
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 10,
    fontSize: "18px",
    fontWeight: "bold",
  },
  card: {
    borderRadius: 8,
    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
  },
  button: {
    width: "100%",
    marginTop: 10,
  },
  chatInterface: {
    width: "30%",
    minWidth: "320px",
    background: "#ffffff",
    padding: 20,
    borderLeft: "1px solid #ddd",
    boxShadow: "-2px 0px 5px rgba(0, 0, 0, 0.1)",
  },
};

export default Dashboard;
