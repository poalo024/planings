import PlanningManagement from './PlanningManagement';

const TeamPlanning = ({ currentUser }) => {
return (
<div>
    <h2>Gestion du Planning Équipe</h2>
    <PlanningManagement currentUser={currentUser} />
</div>
);
};

export default TeamPlanning;