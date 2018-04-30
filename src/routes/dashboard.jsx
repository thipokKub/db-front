// import Dashboard from "views/Dashboard/Dashboard";
// import UserProfile from "views/UserProfile/UserProfile";
// import TableList from "views/TableList/TableList";
// import Typography from "views/Typography/Typography";
// import Icons from "views/Icons/Icons";
// import Maps from "views/Maps/Maps";
// import Notifications from "views/Notifications/Notifications";
import CourseRegistration from "../views/CourseRegistration";
import Reservation from "../views/Reservation";
import Default from "../views/Default";
import Login from "../views/Login";
import Profile from '../views/Profile';
import Schedule from '../views/Schedule';

const dashboardRoutes = [
  {
    path: "/announcement",
    name: "Announcement",
    icon: "pe-7s-speaker",
    component: Default
  },
  {
    path: "/courseRegistration",
    name: "Course Registration",
    icon: "pe-7s-study",
    component: CourseRegistration
  },
  {
    path: "/profile",
    name: "Profile",
    icon: "pe-7s-user",
    component: Profile
  },
  {
    path: "/login",
    name: "Login",
    icon: "pe-7s-user",
    component: Login
  },
  {
    path: "/schedule",
    name: "Course Schedule",
    icon: "pe-7s-timer",
    component: Schedule
  },
  {
    path: "/reservation",
    name: "Reservation",
    icon: "pe-7s-note",
    component: Reservation
  },
  { redirect: true, path: "/", to: "/login", name: "Default" }
];

export default dashboardRoutes;

/*
{
    path: "/dashboard",
    name: "Dashboard",
    icon: "pe-7s-graph",
    component: Dashboard
  },
  {
    path: "/user",
    name: "User Profile",
    icon: "pe-7s-user",
    component: UserProfile
  },
  {
    path: "/table",
    name: "Table List",
    icon: "pe-7s-note2",
    component: TableList
  },
  {
    path: "/typography",
    name: "Typography",
    icon: "pe-7s-news-paper",
    component: Typography
  },
  { path: "/icons", name: "Icons", icon: "pe-7s-science", component: Icons },
  { path: "/maps", name: "Maps", icon: "pe-7s-map-marker", component: Maps },
  {
    path: "/notifications",
    name: "Notifications",
    icon: "pe-7s-bell",
    component: Notifications
  }
*/