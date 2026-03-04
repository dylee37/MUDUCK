import { createBrowserRouter } from "react-router";
import Onboarding from "./pages/Onboarding";
import Root from "./pages/Root";
import Home from "./pages/Home";
import MyTicket from "./pages/MyTicket";
import MyFavorite from "./pages/MyFavorite";
import MyPage from "./pages/MyPage";

export const router = createBrowserRouter([
  {
    path: "/onboarding",
    Component: Onboarding,
  },
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "my-ticket", Component: MyTicket },
      { path: "my-favorite", Component: MyFavorite },
      { path: "my-page", Component: MyPage },
    ],
  },
]);
