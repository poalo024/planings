import LeaveRequest from './LeaveRequest';
import MyAttendance from './MyAttendance';
import MyPlanning from './MyPlanning';
import SickLeaveRequest from './SickLeaveRequest';

const EmployeeDashboardContent = () => {
return (
<div>
    <h2>Bienvenue sur votre Dashboard</h2>
    <MyPlanning />
    <MyAttendance />
    <LeaveRequest />
    <SickLeaveRequest />
</div>
);
};

export default EmployeeDashboardContent;
