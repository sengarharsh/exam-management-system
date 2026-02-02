# ParikshaSetu - Online Exam Management System

ParikshaSetu is a comprehensive, microservices-based Online Examination System designed to facilitate seamless exam creation, management, and participation. It connects Teachers, Students, and Administrators in a unified platform.

## 🚀 Features

### For Teachers
- **Course Management**: Create courses, manage enrollments (Approve/Reject), and upload course materials.
- **Exam Creation**: diverse question types (MCQ) with automated grading.
- **Bulk Enrollment**: Upload students via Excel; system auto-registers new students.
- **Results & Analytics**: View student performance and exam statistics.

### For Students
- **Dashboard**: Track enrolled courses, upcoming exams, and recent results.
- **Exam Interface**: Secure and timed exam environment.
- **Materials**: Download course resources directly from the dashboard.
- **Performance**: View detailed report cards and leaderboard rankings.

### For Admin
- **User Management**: Manage teachers and verify student accounts.
- **System Monitoring**: Oversee all exams and courses.

## 🏗️ Architecture

The system is built using a **Microservices Architecture**:

- **API Gateway** (`8080`): Central entry point for routing and load balancing.
- **Eureka Server** (`8761`): Service discovery registry.
- **User Service** (`8081`): Authentication (JWT) and user management.
- **Exam Service** (`8082`): Exam creation, question banking, and scheduling.
- **Submission Service** (`8083`): Handles exam attempts and answers.
- **Result Service** (`8084`): Calculates scores and generates analytical reports.
- **Notification Service** (`8085`): Handles system alerts and messages.
- **Course Service** (`8086`): Manages logic for courses, enrollments, and materials.
- **Frontend**: A modern, responsive React application using Tailwind CSS.

## 🛠️ Tech Stack

- **Backend**: Java 17, Spring Boot 3.x, Spring Cloud (Gateway, Eureka), Spring Security (JWT), Hibernate/JPA.
- **Frontend**: React.js, Tailwind CSS, Axios, Lucide Icons.
- **Database**: MySQL (Single instance with separate schemas/tables per service).
- **Tools**: Maven, Git, Postman.

## 🏃‍♂️ Getting Started

### Prerequisites
- Java 17+
- Node.js & npm
- MySQL Server

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/sengarharsh/exam-management-system.git
    cd exam-management-system
    ```

2.  **Database Setup**
    - Ensure MySQL is running on port `3306`.
    - Create the necessary databases (or let Spring Boot `update` them automatically).
    - Default Credentials in `application.yml`: `root` / `root123`.

3.  **Run Backend Services**
    Start the services in the following order:
    1.  `eureka-server`
    2.  `api-gateway`
    3.  `user-service`
    4.  `exam-service`
    5.  `submission-service`
    6.  `result-service`
    7.  `course-service`
    8.  `notification-service`

    For each service:
    ```bash
    cd <service-name>
    mvn spring-boot:run
    ```

4.  **Run Frontend**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

5.  **Access the App**
    - Open `http://localhost:5173` in your browser.

## 📜 License
This project is for educational purposes. All rights reserved.