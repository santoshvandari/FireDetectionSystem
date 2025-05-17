import DashboardUI from "../components/DashboardUI";

const Dashboard = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            {<DashboardUI />}
        </div>
    );
};

export default Dashboard;