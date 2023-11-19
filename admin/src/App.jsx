import { createBrowserRouter, RouterProvider } from "react-router-dom";

/* ACTION */
import Login, { action as loginAction } from "./pages/Login";
import AddProduct, { action as addProductAction } from "./pages/AddProduct";
import EditProduct, { action as editProductAction } from "./pages/EditProduct";
import AllProduct from "./pages/AllProduct";
import AddCategory, { action as addCategoryAction } from "./pages/AddCategory";

/* LOADER */
import { loader as addProductLoader } from "./pages/AddProduct";
import { loader as editProductLoader } from "./pages/EditProduct";
import { loader as allProductLoader } from "./pages/AllProduct";
import { loader as addCategoryLoader } from "./pages/AddCategory";

import DashboardLayout from "./pages/DashboardLayout";
import Error from "./pages/Error";

const router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardLayout />,
    errorElement: <Error />,
    children: [
      {
        path: "login",
        element: <Login />,
        action: loginAction,
      },
      {
        path: "all-product",
        element: <AllProduct />,
        loader: allProductLoader,
      },
      {
        path: "add-product",
        element: <AddProduct />,
        action: addProductAction,
        loader: addProductLoader,
      },
      {
        path: "edit-product/:slug",
        element: <EditProduct />,
        action: editProductAction,
        loader: editProductLoader,
      },
      {
        path: "add-category",
        element: <AddCategory />,
        action: addCategoryAction,
        loader: addCategoryLoader,
      },
    ],
  },
]);

const App = () => {
  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
};

export default App;